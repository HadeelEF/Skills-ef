using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Portal.Modules.Requests.Infrastructure;

public sealed class OutboxOptions
{
    public int BatchSize { get; set; } = 50;
    public int LeaseSeconds { get; set; } = 60;
    public int MaxAttempts { get; set; } = 10;
    public TimeSpan PollInterval { get; set; } = TimeSpan.FromSeconds(2);
}

/// <summary>Transport abstraction: broker, HTTP webhook, or in-process dispatcher.</summary>
public interface IIntegrationEventPublisher
{
    /// <summary>Must complete only after the transport confirms receipt (publisher confirm / 2xx).</summary>
    Task PublishAsync(Guid messageId, string type, int schemaVersion, string payload,
        string? traceParent, CancellationToken cancellationToken);
}

// Plain class with settable properties: the safest shape for SqlQuery<T> materialization.
internal sealed class ClaimedMessage
{
    public Guid Id { get; init; }
    public DateTime OccurredAtUtc { get; init; }
    public string Type { get; init; } = string.Empty;
    public int SchemaVersion { get; init; }
    public string Payload { get; init; } = string.Empty;
    public string? TraceParent { get; init; }
    public int Attempts { get; init; }
}

/// <summary>
/// At-least-once dispatcher. Safe with N instances: rows are leased with READPAST/UPDLOCK.
/// A crash after publish and before ProcessedAtUtc means re-delivery, so consumers must be idempotent
/// (deduplicate on the message Id). Run it in the Worker Service, not inside an IIS site.
/// </summary>
public sealed class OutboxDispatcher(
    IServiceScopeFactory scopeFactory,
    IIntegrationEventPublisher publisher,
    IOptions<OutboxOptions> options,
    TimeProvider clock,
    ILogger<OutboxDispatcher> logger) : BackgroundService
{
    private readonly string _node = $"{Environment.MachineName}:{Environment.ProcessId}";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var settings = options.Value;
        using var timer = new PeriodicTimer(settings.PollInterval);
        var consecutiveFailures = 0;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var dispatched = await DispatchBatchAsync(settings, stoppingToken);
                consecutiveFailures = 0;
                if (dispatched == settings.BatchSize)
                    continue; // backlog: drain without waiting
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                consecutiveFailures++;
                logger.LogError(ex, "Outbox batch failed ({Failures} consecutive)", consecutiveFailures);
                // Exponential backoff with jitter when the database itself is failing.
                var delay = TimeSpan.FromSeconds(Math.Min(60, Math.Pow(2, consecutiveFailures)))
                            + TimeSpan.FromMilliseconds(Random.Shared.Next(0, 1000));
                try { await Task.Delay(delay, stoppingToken); } catch (OperationCanceledException) { break; }
                continue;
            }

            try { await timer.WaitForNextTickAsync(stoppingToken); } catch (OperationCanceledException) { break; }
        }
    }

    private async Task<int> DispatchBatchAsync(OutboxOptions settings, CancellationToken ct)
    {
        await using var scope = scopeFactory.CreateAsyncScope(); // fresh DbContext per batch
        var db = scope.ServiceProvider.GetRequiredService<RequestsDbContext>();

        // Non-composed raw SQL: EF executes it as written. Verify behaviour on the target EF version.
        var batch = await db.Database.SqlQuery<ClaimedMessage>($"""
            WITH batch AS (
                SELECT TOP ({settings.BatchSize}) *
                FROM requests.OutboxMessages WITH (ROWLOCK, READPAST, UPDLOCK)
                WHERE ProcessedAtUtc IS NULL
                  AND Attempts < {settings.MaxAttempts}
                  AND (LockedUntilUtc IS NULL OR LockedUntilUtc < SYSUTCDATETIME())
                ORDER BY OccurredAtUtc)
            UPDATE batch
            SET LockedBy = {_node},
                LockedUntilUtc = DATEADD(second, {settings.LeaseSeconds}, SYSUTCDATETIME()),
                Attempts = Attempts + 1
            OUTPUT inserted.Id, inserted.OccurredAtUtc, inserted.Type, inserted.SchemaVersion, inserted.Payload,
                   inserted.TraceParent, inserted.Attempts;
            """).ToListAsync(ct);

        // OUTPUT order is not guaranteed. This gives best-effort order within one batch only; with several
        // nodes, strict per-aggregate ordering needs partitioned claiming or a version check in the consumer.
        foreach (var message in batch.OrderBy(m => m.OccurredAtUtc))
        {
            try
            {
                await publisher.PublishAsync(message.Id, message.Type, message.SchemaVersion,
                    message.Payload, message.TraceParent, ct);

                // Conditional on our lease: if it expired and another node re-claimed it, do not overwrite.
                await db.Outbox
                    .Where(m => m.Id == message.Id && m.LockedBy == _node)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(m => m.ProcessedAtUtc, clock.GetUtcNow().UtcDateTime)
                        .SetProperty(m => m.LockedUntilUtc, (DateTime?)null), ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Keep the message; it becomes claimable after the lease. Store a safe, truncated reason.
                var reason = ex.GetType().Name + ": " + ex.Message;
                await db.Outbox
                    .Where(m => m.Id == message.Id && m.LockedBy == _node)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(m => m.LastError, reason.Length > 2000 ? reason[..2000] : reason)
                        .SetProperty(m => m.LockedUntilUtc, (DateTime?)null), ct);

                logger.LogWarning(ex, "Publishing outbox message {MessageId} failed (attempt {Attempt})",
                    message.Id, message.Attempts);
            }
        }

        // Messages reaching MaxAttempts stop being claimed: alert on them ("parked"), replay manually.
        return batch.Count;
    }
}
