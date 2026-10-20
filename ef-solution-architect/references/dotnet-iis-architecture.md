# Deep .NET architecture and Windows/IIS engineering

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Contents

- [Baseline](#establish-a-compatible-baseline)
- [Responsibilities](#define-backend-responsibilities)
- [Code boundaries](#make-the-selected-architecture-concrete)
- [Use-case implementation](#specify-the-use-case-and-its-invariants)
- [Persistence](#protect-persistence-and-transactions)
- [Service boundaries](#engineer-service-boundaries)
- [IIS](#apply-the-reported-iis-environment)
- [Evidence](#produce-implementable-evidence)

For package-level choices and operational responsibilities use
[.NET stack and packages](dotnet-stack-packages.md). For logical/physical data,
SQL/NoSQL trade-offs and recovery use [data architecture](sql-nosql-data-architecture.md).

## Establish a compatible baseline

Inspect C# language/TFM, SDK/runtime, ASP.NET Core, EF Core/provider, database,
NuGet lock/central management, OS architecture and Hosting Bundle/ANCM. Verify
current stable support and breaking changes from official documentation; keep
installed, target and recommended versions distinct. Modern .NET is not .NET
Framework; coexist with legacy code through explicit contracts when necessary.

Compare new framework features by applicability: API/OpenAPI support, validation,
serialization/source generation, resilience, observability, caching and deployment.
Do not assume Native AOT, trimming or single-file publishing works with every
library, reflection path, ORM feature or IIS hosting mode. Prove compatibility
on a representative path before recommending these optimizations.

## Define backend responsibilities

Choose Minimal APIs, controllers, Razor/MVC or protocol-specific endpoints from
the interface and team needs. Keep transport validation, authorization, use-case
orchestration and invariants in explicit locations. Use consistent Problem Details
or the project's error contract, API evolution, pagination and request limits.
Treat DTO shape/versioning independently from persistence entities.

Organize modules/slices with enforceable dependency direction. Specify aggregates
and transaction boundaries for rich domains, and avoid needless domain ceremony
for CRUD. Use SOLID/KISS/DRY/YAGNI as trade-offs, not a requirement for an interface,
repository or mediator per class. Inspect package support and license before use.

Model async I/O and cancellation end to end. Avoid sync-over-async, unbounded
parallelism, thread-pool blocking, capturing scoped dependencies in singletons
and fire-and-forget work attached to HTTP requests. Define DI scope and disposal;
DbContext is not a shared concurrent singleton or a job payload.

## Make the selected architecture concrete

| Situation | Candidate shape | Concrete design responsibility |
| --- | --- | --- |
| Small CRUD application | One host and feature folders with proportionate layers | Endpoint/use-case/data ownership, authorization and straightforward tests |
| Growing enterprise application | Modular monolith with capability modules and vertical slices | Public module contracts, owned data, dependency checks and transaction rules |
| Complex domain invariants | Aggregates/domain behavior within chosen modules | Invariant enforcement and persistence boundaries; rich model only where useful |
| Independently operated capabilities | Services with explicit contracts | Data authority, delivery/versioning, failure isolation and operating ownership |

Treat clean/hexagonal/onion as dependency choices; choose ports at meaningful
external or policy boundaries. Direct EF Core use inside an application slice
can be appropriate; a repository should add a useful abstraction, not duplicate
every DbSet method. Separate commands from queries where it improves clarity;
CQRS need not introduce a mediator, separate database or message broker.

For the chosen shape specify assemblies/namespaces, allowed references, endpoint
registration, DI composition, error mapping and adapter ownership. Keep domain
rules free of HttpContext and transport response types. Define behavior-pipeline
order for validation, authorization, transaction and telemetry without executing
the same rule in controllers, filters, mediator and services independently.

## Specify the use case and its invariants

Map request → authenticated principal → resource lookup/scope → action permission
→ input/state validation → atomic change → durable external intent → response.
Order steps to protect against information disclosure and invalid transitions.
Use dedicated writable DTOs and explicit mapping; tenant/owner, audit identity
and privileged state come from trusted context/policy, not arbitrary JSON.

Write invariant examples before implementation: permitted transitions, ownership,
uniqueness, aggregate bounds and cross-record consistency. Distinguish format
validation, domain invariants, permissions and database constraints. A FluentValidation
rule or preliminary uniqueness query cannot replace atomic database enforcement.
Select built-in validation or packages by actual release behavior and needs.

For optimistic concurrency carry the client's expected version into an atomic
update predicate or EF concurrency original value and handle no-match/conflict.
Loading the latest entity and comparing afterward can discard the client's
precondition. Preserve conditions during retries; never silently retry a rejected
business transition as an unconditional update. Use a target-database race test
when the guarantee matters, with different contexts/connections.

For composite resources validate child and parent scope consistently. Design
tenant/resource constraints, indexing and soft-delete/history behavior explicitly;
a query filter is not a complete policy for every raw SQL or privileged path.
Use Code First or Database First according to schema ownership; isolate generated
code and reconcile mapping changes without destroying customizations.

## Protect persistence and transactions

Apply [SQL Server design/concurrency](sql-server-design-concurrency.md) for data
contracts and [SQL Server performance](sql-server-performance-capacity.md) for
provider-to-query evidence. Use the actual deployment and database settings.


Specify isolation, optimistic concurrency, uniqueness, idempotency and aggregate
invariants. Define what commits together and what crosses databases or services.
Evaluate SQL queries by actual plans, cardinality and workload; review projection,
tracking, pagination, N+1 queries, locking and migrations without assuming an ORM
automatically produces efficient or safe SQL.

Define nullable/required fields, decimal precision, currency, date/time semantics,
collation and deletion/retention at the data boundary. Project only needed columns;
choose tracking and pagination by use case. Review join cardinality, split-query
consistency, connection duration, cancellation and bounded batch work. Cross-module
reads/writes need an explicit contract even when modules share one SQL instance.

Coordinate execution-strategy retries with explicit transactions and externally
visible effects. Treat response loss after commit as a business scenario. Use
outbox/inbox or equivalent durable coordination where appropriate; never claim
a distributed transaction exists between SQL, HTTP, email and file storage.

Plan expand/backfill/contract migrations when web/mobile or application instances
overlap. Inspect generated SQL, large-table locks, constraint backfill and rollback
limits; do not run destructive migrations automatically on every production start.
Distinguish request cancellation before commit from a lost response after commit.

## Engineer service boundaries

Use HttpClient lifecycle management and bounded resilience policies. Propagate
correlation and cancellation while setting independent business deadlines.
Choose REST/gRPC/SignalR/streaming according to consumers and supported network
paths, including actual IIS/HTTP/2/WebSocket behavior. Check gateway limits.

Enforce resource-level authorization in the application. Cover token validation,
policy/claims mapping, allowed proxy headers, upload validation, outbound request
destinations, secrets, audit and log redaction. Keep domain authorization valid
even if a gateway has accepted the token.

## Apply the reported IIS environment

Use Windows Server/IIS as the EF default. Specify IIS bindings/TLS, app pool and
service identities, file access, Hosting Bundle/ANCM, runtime publication model,
in-process versus out-of-process hosting and supported OS/runtime combination.
Do not copy obsolete OS minima from an old tutorial as a current support policy.

For scale-out establish Data Protection key persistence/sharing and protection,
authentication cookie implications, connection pools, file storage, distributed
coordination and shutdown behavior. Shared keys do not by themselves create SSO
between unrelated applications; follow the intended identity design.

Plan app-pool recycle, idle shutdown, crash, host reboot and rolling deployment.
Separate durable/long-running workers into an independently managed process,
such as a .NET Worker Windows Service, when lifecycle guarantees require it.
Always-on settings improve availability but do not make an in-memory queue durable.
Use the background-work reference for scheduler/queue/state decisions.

For release choose verified packaging and promotion, configuration/secret
injection, health/readiness, compatible database changes, smoke tests and rollback
limits. Account for file locks, restart and draining; do not promise zero downtime
from overlapping app-pool recycle alone.

## Produce implementable evidence

Deliver component boundaries plus a representative endpoint→rule→transaction→
integration→response design sequence. Specify evidence for the risky
seams: concurrent writes, duplicate commands, authorization, cancellation and
restarts. Profile actual CPU/memory/allocations/SQL before claiming improvement.
Use tracing/metrics/logs to connect user outcomes and dependencies; a clean build
does not establish throughput, security or recovery.

In a design handoff identify composition/configuration responsibilities and
the affected handler, DTO, mapping, migration and client-contract boundaries.
Validate startup/options and readiness separately from liveness. Use structured
logs, traces and bounded-cardinality metrics; keep business audit distinct from
diagnostic logging. For a performance issue identify the constrained resource
before changing topology or introducing caches and parallelism.
