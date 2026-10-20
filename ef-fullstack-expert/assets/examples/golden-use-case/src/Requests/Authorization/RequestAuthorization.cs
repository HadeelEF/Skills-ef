using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Portal.Modules.Requests.Domain;

namespace Portal.Modules.Requests.Authorization;

public static class RequestPolicies
{
    public const string Approve = "requests.approve";
}

public sealed class ApproveRequestRequirement : IAuthorizationRequirement;

/// <summary>
/// Department-scoped approver memberships come from the application's own store
/// (not from a client-supplied header), so revocation is effective on the next request.
/// </summary>
public interface IApproverScopeReader
{
    Task<bool> IsApproverForAsync(Guid userId, Guid departmentId, CancellationToken cancellationToken);
}

/// <summary>
/// Resource-based check: permission AND scope over this specific request.
/// Hiding a button in React is UX; this handler is the security boundary.
/// </summary>
public sealed class ApproveRequestAuthorizationHandler(IApproverScopeReader scopes)
    : AuthorizationHandler<ApproveRequestRequirement, PurchaseRequest>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ApproveRequestRequirement requirement, PurchaseRequest resource)
    {
        if (!context.User.TryGetActorId(out var actorId))
            return; // deny by default: no Succeed() call

        // AuthorizationHandler has no CancellationToken; keep the lookup short and indexed.
        if (await scopes.IsApproverForAsync(actorId, resource.DepartmentId, CancellationToken.None))
            context.Succeed(requirement);
    }
}

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Stable actor identifier from the validated token. With Entra ID prefer "oid"
    /// (immutable per tenant) over email or display name.
    /// </summary>
    public static bool TryGetActorId(this ClaimsPrincipal user, out Guid actorId)
    {
        var raw = user.FindFirstValue("oid")
                  ?? user.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
                  ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out actorId);
    }
}
