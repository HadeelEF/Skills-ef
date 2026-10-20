using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Portal.Modules.Requests.Domain;

namespace Portal.Modules.Requests.Infrastructure;

public sealed class OutboxMessage
{
    private OutboxMessage() { }

    public Guid Id { get; private set; }
    public DateTime OccurredAtUtc { get; private set; }
    public string Type { get; private set; } = string.Empty;
    public int SchemaVersion { get; private set; }
    public string AggregateId { get; private set; } = string.Empty;
    public string Payload { get; private set; } = string.Empty;
    public string? TraceParent { get; private set; }
    public int Attempts { get; private set; }
    public string? LockedBy { get; private set; }
    public DateTime? LockedUntilUtc { get; private set; }
    public DateTime? ProcessedAtUtc { get; private set; }
    public string? LastError { get; private set; }

    public static OutboxMessage Create<T>(string type, int schemaVersion, string aggregateId,
        T payload, DateTimeOffset occurredAt, string? traceParent) => new()
    {
        // Id is left empty: the SQL Server provider generates SQL-Server-ordered sequential GUIDs
        // on Add. Guid.CreateVersion7() is time-ordered in .NET but NOT in uniqueidentifier sort order.
        OccurredAtUtc = occurredAt.UtcDateTime,
        Type = type,
        SchemaVersion = schemaVersion,
        AggregateId = aggregateId,
        Payload = JsonSerializer.Serialize(payload),
        TraceParent = traceParent
    };
}

/// <summary>Business audit written in the same transaction as the change it describes.</summary>
public sealed class AuditEntry
{
    private AuditEntry() { }

    public Guid Id { get; private set; }
    public DateTime OccurredAtUtc { get; private set; }
    public Guid ActorId { get; private set; }
    public string Operation { get; private set; } = string.Empty;
    public string ResourceType { get; private set; } = string.Empty;
    public string ResourceId { get; private set; } = string.Empty;
    public string? TraceId { get; private set; }

    public static AuditEntry For(Guid actorId, string operation, string resourceType,
        string resourceId, DateTimeOffset at, string? traceId) => new()
    {
        OccurredAtUtc = at.UtcDateTime,
        ActorId = actorId,
        Operation = operation,
        ResourceType = resourceType,
        ResourceId = resourceId,
        TraceId = traceId
    };
}

public sealed class RequestsDbContext(DbContextOptions<RequestsDbContext> options) : DbContext(options)
{
    public DbSet<PurchaseRequest> Requests => Set<PurchaseRequest>();
    public DbSet<OutboxMessage> Outbox => Set<OutboxMessage>();
    public DbSet<AuditEntry> Audit => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema("requests"); // module owns its schema; other modules use contracts, not tables

        b.Entity<PurchaseRequest>(e =>
        {
            e.ToTable("PurchaseRequests", t =>
                t.HasCheckConstraint("CK_PurchaseRequests_Amount", "[Amount] > 0"));
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(PurchaseRequest.TitleMaxLength).IsRequired();
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Status).HasConversion<byte>();
            e.Property(x => x.RowVersion).IsRowVersion();
            // Supports the approver inbox query: WHERE DepartmentId = @d AND Status = Submitted ORDER BY Id
            e.HasIndex(x => new { x.DepartmentId, x.Status, x.Id });
        });

        b.Entity<OutboxMessage>(e =>
        {
            e.ToTable("OutboxMessages");
            e.HasKey(x => x.Id);
            e.Property(x => x.Type).HasMaxLength(200).IsRequired();
            e.Property(x => x.AggregateId).HasMaxLength(100).IsRequired();
            e.Property(x => x.TraceParent).HasMaxLength(55).IsUnicode(false);
            e.Property(x => x.LockedBy).HasMaxLength(100);
            e.Property(x => x.LastError).HasMaxLength(2000);
            e.HasIndex(x => x.OccurredAtUtc)
                .HasFilter("[ProcessedAtUtc] IS NULL")
                .IncludeProperties(x => x.LockedUntilUtc)
                .HasDatabaseName("IX_Outbox_Pending");
        });

        b.Entity<AuditEntry>(e =>
        {
            e.ToTable("AuditEntries");
            e.HasKey(x => x.Id);
            e.Property(x => x.Operation).HasMaxLength(100).IsRequired();
            e.Property(x => x.ResourceType).HasMaxLength(100).IsRequired();
            e.Property(x => x.ResourceId).HasMaxLength(100).IsRequired();
            e.Property(x => x.TraceId).HasMaxLength(64).IsUnicode(false);
            e.HasIndex(x => new { x.ResourceType, x.ResourceId, x.OccurredAtUtc });
        });
    }
}
