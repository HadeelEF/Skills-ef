namespace Portal.Modules.Requests.Domain;

public enum RequestStatus
{
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Rejected = 3
}

/// <summary>
/// Expected business failure. Unexpected failures stay exceptions and reach the global handler.
/// </summary>
public readonly record struct DomainResult(bool Succeeded, string? Code, string? Message)
{
    public static DomainResult Ok() => new(true, null, null);
    public static DomainResult Fail(string code, string message) => new(false, code, message);
}

/// <summary>
/// Aggregate root. It protects state-transition invariants only; authorization and
/// concurrency are enforced by the use case and the database, not by this class.
/// </summary>
public sealed class PurchaseRequest
{
    public const int TitleMaxLength = 200;

    private PurchaseRequest() { } // EF Core materialization

    public PurchaseRequest(Guid id, Guid departmentId, Guid requesterId, string title, decimal amount)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        if (title.Length > TitleMaxLength) throw new ArgumentOutOfRangeException(nameof(title));
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));

        Id = id;
        DepartmentId = departmentId;
        RequesterId = requesterId;
        Title = title;
        Amount = amount;
        Status = RequestStatus.Draft;
    }

    public Guid Id { get; private set; }
    public Guid DepartmentId { get; private set; }
    public Guid RequesterId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public decimal Amount { get; private set; }
    public RequestStatus Status { get; private set; }
    public Guid? DecidedBy { get; private set; }
    public DateTimeOffset? DecidedAt { get; private set; }

    /// <summary>SQL Server rowversion; exposed to clients only as an opaque ETag.</summary>
    public byte[] RowVersion { get; private set; } = [];

    public DomainResult Submit()
    {
        if (Status != RequestStatus.Draft)
            return DomainResult.Fail("request.invalid_state", "Only draft requests can be submitted.");

        Status = RequestStatus.Submitted;
        return DomainResult.Ok();
    }

    public DomainResult Approve(Guid approverId, DateTimeOffset now)
    {
        if (Status != RequestStatus.Submitted)
            return DomainResult.Fail("request.invalid_state", "Only submitted requests can be approved.");

        // Segregation of duties is a business invariant, so it lives here and is unit-testable.
        if (approverId == RequesterId)
            return DomainResult.Fail("request.self_approval", "Requesters cannot approve their own requests.");

        Status = RequestStatus.Approved;
        DecidedBy = approverId;
        DecidedAt = now;
        return DomainResult.Ok();
    }
}
