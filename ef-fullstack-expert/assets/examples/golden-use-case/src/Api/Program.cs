using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using Portal.Modules.Requests.Authorization;
using Portal.Modules.Requests.Features;
using Portal.Modules.Requests.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// ---- Configuration: validated at startup, secrets from environment/secret store, never appsettings in git
builder.Services.AddOptions<OutboxOptions>()
    .Bind(builder.Configuration.GetSection("Outbox"))
    .Validate(o => o.BatchSize is > 0 and <= 500 && o.LeaseSeconds > 0, "Invalid Outbox options")
    .ValidateOnStart();

var connectionString = builder.Configuration.GetConnectionString("Portal")
    ?? throw new InvalidOperationException("ConnectionStrings:Portal is not configured.");

builder.Services.AddDbContext<RequestsDbContext>(o => o.UseSqlServer(connectionString, sql =>
{
    // Retries transient faults for single SaveChanges units. User-initiated transactions must run
    // inside db.Database.CreateExecutionStrategy().ExecuteAsync(...) to be retried as a whole.
    sql.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
    sql.CommandTimeout(30);
}));

// ---- Identity and authorization: issuer/audience validated by the handler; policies are server-side
builder.Services.AddAuthentication().AddJwtBearer(); // Authority/Audience from configuration "Authentication:Schemes:Bearer"
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build()); // deny-by-default for endpoints that forget RequireAuthorization
builder.Services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, ApproveRequestAuthorizationHandler>();
// builder.Services.AddScoped<IApproverScopeReader, SqlApproverScopeReader>(); // project-specific

// ---- Errors: one ProblemDetails contract, trace id included, no stack traces to clients
builder.Services.AddProblemDetails(o => o.CustomizeProblemDetails = ctx =>
    ctx.ProblemDetails.Extensions["traceId"] = System.Diagnostics.Activity.Current?.TraceId.ToString()
                                               ?? ctx.HttpContext.TraceIdentifier);

// ---- Rate limiting per authenticated user (falls back to IP). Note: in-memory => per instance.
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("writes", ctx => RateLimitPartition.GetTokenBucketLimiter(
        ctx.User.Identity?.IsAuthenticated == true
            ? $"u:{ctx.User.FindFirst("oid")?.Value}"
            : $"ip:{ctx.Connection.RemoteIpAddress}",
        _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 20, TokensPerPeriod = 10, ReplenishmentPeriod = TimeSpan.FromSeconds(10),
            QueueLimit = 0, AutoReplenishment = true
        }));
});

// ---- Health: liveness never depends on downstreams; readiness checks what this node needs to serve
builder.Services.AddHealthChecks()
    .AddDbContextCheck<RequestsDbContext>("sql", tags: ["ready"]);

// ---- Telemetry: traces/metrics via OpenTelemetry; exporter endpoint from configuration
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation()
                       .AddSource("Portal.Requests").AddOtlpExporter())
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation()
                       .AddRuntimeInstrumentation().AddMeter("Portal.Requests").AddOtlpExporter());

builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Trust only the known reverse proxies / load balancer (from configuration in a real project).
    // o.KnownProxies.Add(IPAddress.Parse("10.0.0.10"));
});

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<ApproveRequestHandler>();

var app = builder.Build();

// ---- Middleware order matters
app.UseForwardedHeaders();          // first: scheme/IP must be correct for everything after
app.UseExceptionHandler();          // converts unhandled exceptions to ProblemDetails (500), logs once
app.UseStatusCodePages();           // ProblemDetails for bare 4xx/5xx
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();               // after auth so partitions can use the user identity

app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false }).AllowAnonymous();
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = r => r.Tags.Contains("ready") })
   .AllowAnonymous();

app.MapGroup("")
   .RequireRateLimiting("writes")
   .MapApproveRequest();

app.Run();

public partial class Program; // for WebApplicationFactory<Program>
