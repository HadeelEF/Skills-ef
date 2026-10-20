using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Portal.Modules.Requests.Authorization;
using Portal.Modules.Requests.Domain;
using Portal.Modules.Requests.Features;
using Portal.Modules.Requests.Infrastructure;
using Testcontainers.MsSql;
using Xunit;

namespace Portal.Tests;

/// <summary>
/// Real SQL Server (rowversion, constraints, transactions). EF InMemory cannot prove any of these.
/// Migrations would replace EnsureCreated in a project that has them.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _sql = new MsSqlBuilder().Build();

    public static readonly Guid DepartmentA = Guid.Parse("00000000-0000-0000-0000-00000000000a");
    public static readonly Guid DepartmentB = Guid.Parse("00000000-0000-0000-0000-00000000000b");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:Portal", _sql.GetConnectionString());
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(TestAuth.Scheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuth>(TestAuth.Scheme, _ => { });
            services.PostConfigure<Microsoft.AspNetCore.Authentication.AuthenticationOptions>(o =>
            {
                o.DefaultAuthenticateScheme = TestAuth.Scheme;
                o.DefaultChallengeScheme = TestAuth.Scheme;
            });
            // Approvers: user "approver-a" approves department A only.
            services.AddSingleton<IApproverScopeReader>(new FixedScopes(new()
            {
                [(Users.ApproverA, DepartmentA)] = true
            }));
        });
    }

    public async Task InitializeAsync()
    {
        await _sql.StartAsync();
        using var scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<RequestsDbContext>().Database.EnsureCreatedAsync();
    }

    // Explicit implementation: WebApplicationFactory already has a ValueTask DisposeAsync.
    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _sql.DisposeAsync();
    }

    public HttpClient ClientFor(Guid userId)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuth.UserHeader, userId.ToString());
        return client;
    }

    public async Task<(Guid Id, string ETag)> SeedSubmittedAsync(Guid department, Guid requester)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
        var request = new PurchaseRequest(Guid.NewGuid(), department, requester, "Laptops", 12_500m);
        request.Submit();
        db.Requests.Add(request);
        await db.SaveChangesAsync();
        return (request.Id, RowVersionETag.From(request.RowVersion));
    }
}

public static class Users
{
    public static readonly Guid Requester = Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid ApproverA = Guid.Parse("20000000-0000-0000-0000-000000000002");
    public static readonly Guid Outsider = Guid.Parse("30000000-0000-0000-0000-000000000003");
}

public sealed class ApproveRequestTests(ApiFactory api) : IClassFixture<ApiFactory>
{
    private static HttpRequestMessage Approve(Guid id, string? etag)
    {
        var message = new HttpRequestMessage(HttpMethod.Post, $"/api/requests/{id}/approval");
        if (etag is not null) message.Headers.IfMatch.Add(EntityTagHeaderValue.Parse(etag));
        return message;
    }

    [Fact]
    public async Task Approver_in_scope_approves_and_receives_new_etag()
    {
        var (id, etag) = await api.SeedSubmittedAsync(ApiFactory.DepartmentA, Users.Requester);

        var response = await api.ClientFor(Users.ApproverA).SendAsync(Approve(id, etag));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(etag, response.Headers.ETag?.ToString());

        using var scope = api.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
        Assert.Equal(1, await db.Audit.CountAsync(a => a.ResourceId == id.ToString()));
        Assert.Equal(1, await db.Outbox.CountAsync(m => m.AggregateId == id.ToString()));
    }

    [Fact]
    public async Task Approver_of_another_department_gets_404_not_403()
    {
        var (id, etag) = await api.SeedSubmittedAsync(ApiFactory.DepartmentB, Users.Requester);

        var response = await api.ClientFor(Users.ApproverA).SendAsync(Approve(id, etag));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Missing_if_match_returns_428()
    {
        var (id, _) = await api.SeedSubmittedAsync(ApiFactory.DepartmentA, Users.Requester);

        var response = await api.ClientFor(Users.ApproverA).SendAsync(Approve(id, etag: null));

        Assert.Equal((HttpStatusCode)428, response.StatusCode);
    }

    [Fact]
    public async Task Concurrent_approvals_with_same_etag_produce_exactly_one_success_and_one_side_effect()
    {
        var (id, etag) = await api.SeedSubmittedAsync(ApiFactory.DepartmentA, Users.Requester);
        var client = api.ClientFor(Users.ApproverA);

        // Fire both requests together; Task.Run is test-only scaffolding here, never production code.
        using var gate = new Barrier(2);
        var responses = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ => Task.Run(async () =>
        {
            gate.SignalAndWait();
            return await client.SendAsync(Approve(id, etag));
        })));

        var codes = responses.Select(r => r.StatusCode).OrderBy(c => c).ToArray();
        Assert.Equal(HttpStatusCode.OK, codes[0]);
        Assert.Equal(HttpStatusCode.PreconditionFailed, codes[1]);

        using var scope = api.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
        Assert.Equal(1, await db.Outbox.CountAsync(m => m.AggregateId == id.ToString()));
    }

    [Fact]
    public async Task Self_approval_is_a_409_business_rule()
    {
        var (id, etag) = await api.SeedSubmittedAsync(ApiFactory.DepartmentA, Users.ApproverA);

        var response = await api.ClientFor(Users.ApproverA).SendAsync(Approve(id, etag));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}

// ---------- Test doubles at the trust boundary only ----------

public sealed class FixedScopes(Dictionary<(Guid User, Guid Department), bool> grants) : IApproverScopeReader
{
    public Task<bool> IsApproverForAsync(Guid userId, Guid departmentId, CancellationToken cancellationToken) =>
        Task.FromResult(grants.GetValueOrDefault((userId, departmentId)));
}

/// <summary>Test-only authentication. Real JWT validation (issuer/audience/expiry) needs its own tests.</summary>
public sealed class TestAuth(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string Scheme = "Test";
    public const string UserHeader = "X-Test-User";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(UserHeader, out var user))
            return Task.FromResult(AuthenticateResult.NoResult());

        var identity = new ClaimsIdentity([new Claim("oid", user.ToString())], Scheme);
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme)));
    }
}
