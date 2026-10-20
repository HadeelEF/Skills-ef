using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Portal.Modules.Notifications;

public sealed class InboxMessage
{
    public Guid MessageId { get; set; }
    public string Consumer { get; set; } = string.Empty;
    public DateTime ProcessedAtUtc { get; set; }
}

public sealed class Notification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public Guid RequestId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public sealed class NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : DbContext(options)
{
    public DbSet<InboxMessage> Inbox => Set<InboxMessage>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasDefaultSchema("notifications");
        b.Entity<InboxMessage>(e =>
        {
            e.HasKey(x => new { x.MessageId, x.Consumer }); // dedup per consumer, not globally
            e.Property(x => x.Consumer).HasMaxLength(100);
        });
        b.Entity<Notification>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Kind).HasMaxLength(50);
            // Second line of defence: one notification of a kind per request and recipient.
            e.HasIndex(x => new { x.RequestId, x.RecipientId, x.Kind }).IsUnique();
        });
    }
}

public sealed record RequestApprovedV1(Guid RequestId, Guid DepartmentId, Guid ApprovedBy, DateTimeOffset ApprovedAt);

/// <summary>
/// Idempotent consumer: the inbox row and the effect commit in ONE transaction.
/// A redelivered message violates the inbox key and is acknowledged without a second effect.
/// The transport acknowledges only after this method returns successfully.
/// </summary>
public sealed class RequestApprovedConsumer(NotificationsDbContext db, TimeProvider clock)
{
    private const string ConsumerName = "notifications.request-approved";

    public async Task HandleAsync(Guid messageId, RequestApprovedV1 message, Guid requesterId, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        db.Inbox.Add(new InboxMessage { MessageId = messageId, Consumer = ConsumerName, ProcessedAtUtc = now });
        db.Notifications.Add(new Notification
        {
            RecipientId = requesterId,
            RequestId = message.RequestId,
            Kind = "request-approved",
            CreatedAtUtc = now
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            // Duplicate delivery (inbox key) or duplicate effect (unique index): already handled.
            db.ChangeTracker.Clear();
        }
        // Sending the actual SMS/e-mail is a separate step with a provider idempotency key
        // or a delivery log; it is not part of this database transaction.
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is SqlException { Number: 2627 or 2601 };
}
