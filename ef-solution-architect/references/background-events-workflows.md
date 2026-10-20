# Background processing, durable workflows and events

## Select the lifetime and guarantee

| Need | Candidate | Required design |
| --- | --- | --- |
| Best-effort local work | IHostedService/BackgroundService, bounded Channel | Process lifetime, cancellation, DI scopes and acceptable loss |
| Independent continuous worker | .NET Worker as Windows Service or supported worker host | Service identity, restart, shutdown and durable checkpoints |
| Persistent jobs/schedules | Hangfire, Quartz or another supported scheduler | Actual persistent store, ownership, retry, misfire, clustering and licensing |
| Durable business commands/events | Broker/stream with consumers | Storage, acknowledgments, idempotency, ordering, replay and DLQ |
| Long-running/human process | Durable workflow engine/state machine | Persistent state, timers, versioning, compensation and task ownership |
| Platform-contained processing | Mendix Task Queue or licensed Informatica service | Exact platform semantics, concurrency, retries and operating model |

Distinguish a timer, scheduler, queue, worker, broker, workflow engine and event
store. Evaluate RabbitMQ, Kafka, Redis Streams, cloud messaging or existing
platforms only when the workload requires them; verify current capabilities,
hosting, client/protocol support and license rather than prescribing a brand.

## Design for the IIS lifecycle

In-process workers stop with the host/app pool and can overlap during recycle.
IIS idle shutdown, deployment, crash and reboot must be considered. An in-memory
queue is lost on process death; disabling idle timeout or using AlwaysRunning
does not provide durable execution. Avoid unobserved Task.Run/fire-and-forget
for important business work after an HTTP response.

For durable work persist intent before acknowledging acceptance. An independent
Windows Service can outlive the web app pool, but still needs persistent state,
retries and monitoring. Use a scoped DI lifetime per work item and do not retain
HttpContext, DbContext or an expiring request token as a serialized job context.

## Define a job/event contract

Specify ID/idempotency key, type/schema, business/resource key, payload/reference,
requested-by identity, authorization policy, schedule/timezone, deadline,
concurrency, retry/backoff, maximum attempts and terminal states. Define progress,
cancellation, timeout and retention. Do not store sensitive tokens in job arguments.

Persist business state and outbox intent atomically when they share a database.
The publisher must handle a crash after sending but before marking the row sent.
Consumers must handle a crash after committing the effect but before acknowledgment.
Use stable message IDs and durable deduplication/inbox or idempotent operations.
An external side effect can remain ambiguous after a network timeout; reconcile
or use a provider's idempotency contract rather than claiming universal exactly-once.

Define when acknowledgment occurs, visibility/lease duration, renewal and recovery
from abandoned work. A long-running stale worker may still execute after its lease
expires; design resource-level concurrency/fencing where necessary. Durable queue
storage does not make every external business effect atomic.

Do not assume a local fencing token protects an external provider that ignores
it. An expired worker can still finish a network call; prevent concurrent sends
through the provider's idempotency/conditional contract or treat the uncertain
outcome as reconciliation. A pre-send marker must survive the failure it is
intended to detect; writing it in a transaction later rolled back is insufficient.

## Choose event-driven semantics

Distinguish domain events within a transaction, integration events after a durable
commit, commands requesting action and state projections. Choose partition/order
by the smallest business key needing it; do not promise global ordering from
multiple queues or partitions. Define duplicate and out-of-order handling.

Separate event sourcing from messaging: event sourcing makes an event history an
authoritative model and requires schema evolution, replay, projections and privacy
planning. A broker or audit log is not automatically an event-sourced system.

Use orchestration for explicit progress/coordination and choreography where
independent reactions remain understandable. For sagas define forward actions,
compensation, irreversibility, timeouts and manual repair. Compensation is a new
business action, not database rollback across systems.

## Operate schedules and consumers

Define UTC/business timezone, DST if relevant, overlapping runs, catch-up/misfire,
leader/cluster coordination and configuration changes. Separate work queues by
priority or tenant when necessary; bound concurrency/backpressure and protect
slow dependencies. Do not claim scheduler defaults enforce business idempotency.

Specify dead-letter/quarantine ownership, redrive authorization, retention,
reconciliation, poison-message handling and event-schema compatibility. Replays
must preserve deduplication intent without silently repeating irreversible actions.
Redact payloads and propagate job/trace/business correlation.

## Prove the behavior

Test process kill at each commit/send/ack boundary, IIS recycle, worker restart,
duplicate publish, late delivery, exhausted retry, backlog pressure, partial
external success and rolling upgrades. Verify no accepted job is silently lost
under the stated guarantee and duplicate effects are prevented or repaired.
Track queue age, lag, failures, retries, completion and business reconciliation;
an alive process or empty DLQ alone does not prove successful processing.
