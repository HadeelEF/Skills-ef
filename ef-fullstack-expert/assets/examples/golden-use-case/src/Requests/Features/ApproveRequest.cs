using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portal.Modules.Requests.Authorization;
using Portal.Modules.Requests.Domain;
using Portal.Modules.Requests.Infrastructure;
using System.Security.Claims;

namespace Portal.Modules.Requests.Features;

// ---------- Contracts (public API surface; never expose the entity) ----------

public sealed record ApproveRequestResponse(Guid Id, string Status, DateTimeOffset DecidedAt);

/// <summary>Integration event contract. Versioned independently of the domain model.</summary>
public sealed record RequestApprovedV1(Guid RequestId, Guid DepartmentId, Guid ApprovedBy, DateTimeOffset ApprovedAt);

public sealed record ApproveRequestCommand(Guid RequestId, byte[] ExpectedVersion);

public abstract record ApproveOutcome
{
    public sealed record Approved(PurchaseRequest Request) : ApproveOutcome;
    public sealed record NotFound : ApproveOutcome;
    public sealed record PreconditionFailed : ApproveOutcome;
    public sealed record BusinessRuleViolated(string Code, string Message) : ApproveOutcome;
}

// ---------- Opaque strong ETag over rowversion ----------

public static class RowVersionETag
{
    public static string From(byte[] rowVersion) => $"\"{Convert.ToBase64String(rowVersion)}\"";

    /// <summary>If-Match uses strong comparison: weak validators (W/) are rejected.</summary>
    public static bool TryParse(string? header, out byte[] rowVersion)
    {
        rowVersion = [];
        if (string.IsNullOrWhiteSpace(header) || header.StartsWith("W/", StringComparison.Ordinal))
            return false;

        var value = header.Trim();
        if (value.Length < 3 || value[0] != '"' || value[^1] != '"')
            return false;

        try
        {
            rowVersion = Convert.FromBase64String(value[1..^1]);
            return rowVersion.Length == 8; // SQL Server rowversion is 8 bytes
        }
        catch (FormatException)
        {
            return false;
        }
    }
}

// ---------- HTTP adapter: binding, preconditions, mapping only ----------

public static class ApproveRequestEndpoint
{
    public static IEndpointRouteBuilder MapApproveRequest(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/requests/{id:guid}/approval", HandleAsync)
            .RequireAuthorization()
            .WithName("ApproveRequest")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status412PreconditionFailed)
            .ProducesProblem(StatusCodes.Status428PreconditionRequired);
        return app;
    }

    private static async Task<Results<Ok<ApproveRequestResponse>, ProblemHttpResult>> HandleAsync(
        Guid id,
        [FromHeader(Name = "If-Match")] string? ifMatch,
        ClaimsPrincipal user,
        ApproveRequestHandler handler,
        HttpResponse response,
        CancellationToken cancellationToken)
    {
        if (!RowVersionETag.TryParse(ifMatch, out var expected))
            return TypedResults.Problem(
                statusCode: StatusCodes.Status428PreconditionRequired,
                title: "A strong If-Match ETag from the latest read is required.",
                type: "https://errors.example/requests/if-match-required");

        var outcome = await handler.HandleAsync(new ApproveRequestCommand(id, expected), user, cancellationToken);

        switch (outcome)
        {
            case ApproveOutcome.Approved ok:
                response.Headers.ETag = RowVersionETag.From(ok.Request.RowVersion);
                return TypedResults.Ok(new ApproveRequestResponse(
                    ok.Request.Id, ok.Request.Status.ToString(), ok.Request.DecidedAt!.Value));

            case ApproveOutcome.PreconditionFailed:
                return TypedResults.Problem(
                    statusCode: StatusCodes.Status412PreconditionFailed,
                    title: "The request changed since you loaded it. Reload and retry.",
                    type: "https://errors.example/requests/version-mismatch");

            case ApproveOutcome.BusinessRuleViolated rule:
                return TypedResults.Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: rule.Message,
                    type: $"https://errors.example/{rule.Code}",
                    extensions: new Dictionary<string, object?> { ["code"] = rule.Code });

            default:
                // Policy: requests outside the caller's scope are indistinguishable from missing ones.
                return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "Request not found.");
        }
    }
}

// ---------- Use case: authorization, invariants, atomic write, side-effect intent ----------

public sealed class ApproveRequestHandler(
    RequestsDbContext db,
    IAuthorizationService authorization,
    TimeProvider clock,
    ILogger<ApproveRequestHandler> logger)
{
    public async Task<ApproveOutcome> HandleAsync(
        ApproveRequestCommand command, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var request = await db.Requests.SingleOrDefaultAsync(r => r.Id == command.RequestId, cancellationToken);
        if (request is null)
            return new ApproveOutcome.NotFound();

        var authz = await authorization.AuthorizeAsync(user, request, new ApproveRequestRequirement());
        if (!authz.Succeeded || !user.TryGetActorId(out var actorId))
            return new ApproveOutcome.NotFound();

        // 1) Fast path: the client's version is already stale.
        if (!request.RowVersion.AsSpan().SequenceEqual(command.ExpectedVersion))
            return new ApproveOutcome.PreconditionFailed();

        // 2) Race path: compare the UPDATE against the client's version, not just our read,
        //    so a write between our SELECT and UPDATE raises DbUpdateConcurrencyException.
        db.Entry(request).Property(r => r.RowVersion).OriginalValue = command.ExpectedVersion;

        var now = clock.GetUtcNow();
        var result = request.Approve(actorId, now);
        if (!result.Succeeded)
            return new ApproveOutcome.BusinessRuleViolated(result.Code!, result.Message!);

        var traceParent = Activity.Current?.Id;
        db.Audit.Add(AuditEntry.For(actorId, "request.approved", nameof(PurchaseRequest),
            request.Id.ToString(), now, Activity.Current?.TraceId.ToString()));
        db.Outbox.Add(OutboxMessage.Create("requests.request-approved", 1, request.Id.ToString(),
            new RequestApprovedV1(request.Id, request.DepartmentId, actorId, now), now, traceParent));

        try
        {
            // Business change + audit + outbox commit atomically in one SaveChanges transaction.
            // Deliberate: the commit is not tied to the client's abort token. Once the decision is made,
            // cancelling mid-commit only produces an "unknown outcome" for everyone.
            await db.SaveChangesAsync(CancellationToken.None);
        }
        catch (DbUpdateConcurrencyException)
        {
            logger.LogInformation("Approval of {RequestId} lost a concurrent update race", request.Id);
            return new ApproveOutcome.PreconditionFailed();
        }

        logger.LogInformation("Request {RequestId} approved by {ActorId}", request.Id, actorId);
        return new ApproveOutcome.Approved(request); // RowVersion now holds the store-generated new value
    }
}
