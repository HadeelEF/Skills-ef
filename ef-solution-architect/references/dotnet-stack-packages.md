# .NET stack and package architecture

Use for backend technology decisions, component design and AI/developer handoff.
Keep the architect role and Windows/IIS application track. Treat package names as
candidates, not an installation checklist or a current support/license guarantee.

## Choose from requirements

Start with the capability, quality scenario and operating constraint. Compare
framework primitives first, existing project dependencies second, and a small
shortlist of packages only where they solve a real gap. Specify one recommended
choice per responsibility, its downside, compatibility and replacement boundary.
Do not equate an enterprise architecture with a large dependency graph.

| Responsibility | Candidates to assess | Consequential design questions |
| --- | --- | --- |
| HTTP endpoints | ASP.NET Core Minimal APIs/controllers, built-in OpenAPI, suitable schema/UI tools | Auth/error/version contract, filters/middleware ordering, generated client compatibility |
| Validation and mapping | Framework validation, FluentValidation; explicit mapping or a mapper | Input vs business vs database enforcement, mapping visibility, package license and reflection/source generation |
| Use-case dispatch | Direct application services/handlers; MediatR or an alternative only when justified | Cross-cutting pipeline ownership, call visibility, lifetime, current license; CQRS does not require a mediator |
| Persistence | EF Core SQL Server provider, Microsoft.Data.SqlClient, Dapper for justified query paths | Transaction owner, SQL visibility, mapping, connection sharing, concurrency, provider/version compatibility |
| Outbound APIs | HttpClient/IHttpClientFactory, generated clients/Refit where useful, Microsoft.Extensions.Http.Resilience/Polly | Handler lifetime, cancellation/deadline, replay safety, body buffering, one coordinated retry budget |
| Cache | IMemoryCache, IDistributedCache, HybridCache where supported, Redis client such as StackExchange.Redis | Scope, invalidation, stampede, serialization, outage behavior; cache is not automatically durable authority |
| Background work | BackgroundService/Worker Windows Service, Hangfire/Quartz.NET when needed | Durable acceptance, persistence provider, clustering, missed schedules, retries and shutdown; a scheduler is not every workflow engine |
| Messaging | Broker SDK or abstractions such as MassTransit/NServiceBus | Broker/runtime support, license, outbox/inbox, ordering, topology ownership, transport-specific limits |
| Identity and sessions | ASP.NET Core authentication/authorization, OIDC/JWT handlers, Identity when appropriate | Identity account store vs external identity provider, resource policy, claims lifecycle, Data Protection |
| Realtime and streaming | SignalR, SSE, gRPC or ordinary HTTP polling | Delivery/reconnect, backpressure, scale-out, proxy/IIS support, client compatibility and authorization |
| Diagnostics | Microsoft.Extensions.Logging, OpenTelemetry, Serilog when justified | Audit vs diagnostics, exporters, sampling, cardinality, sensitive data and operating owner |
| API composition | .NET BFF, YARP only for a demonstrated proxy need | Session/token boundaries, allowed destinations, timeout ownership; avoid duplicating Apigee |
| Verification tooling | xUnit/NUnit/MSTest, WebApplicationFactory, contract/load tools | Evidence required from developers; real provider semantics and actual Windows/IIS deployment |

## Specify lifecycle and resource guarantees

Define singleton/scoped/transient ownership, disposal, options validation and
configuration precedence. A singleton consumer must not capture request-scoped
identity or a DbContext. Pooling does not erase tenant/session state safely by
itself. Keep HTTP request lifetime separate from jobs and externally committed work.

Distinguish async I/O from parallel CPU work. Use bounded concurrency, queue depth,
backpressure and cancellation propagation; do not prescribe Task.Run for routine
async I/O. Size connection pools and worker concurrency together with database
capacity, not independently. Span/Memory, pooling, AOT and source generation are
measured optimizations with compatibility costs, not mandatory architecture layers.

For resiliency define total operation deadline, per-attempt timeout, retry owner,
max attempts, jitter and overload behavior. Review unsafe writes and unknown
outcomes before replay/hedging. Do not stack independent standard retry handlers
at every abstraction. A canceled HTTP request may already have committed remotely.

Define JSON/wire contracts explicitly: decimal money, large identifiers, enums,
nullability, UTC/offset/date-only, pagination and version tolerance. Streaming and
large uploads need limits, bounded buffers, partial failure and cleanup contracts.

## Design persistence and package boundaries together

Decide EF Core versus targeted Dapper/SQL from query shape and ownership. Avoid
multiple independent transactions or incompatible object maps for the same use
case. SQL execution remains parameterized with authorized ordering/filter fields.
Inspect translation, materialization, tracking, batching and update concurrency.
Use [SQL and NoSQL design](sql-nosql-data-architecture.md) for storage decisions.

Explicitly state what each package owns and what remains application policy.
An ORM is not an authorization system, a mediator is not a durable bus, a local
channel is not a durable queue, and a cache API is not an exactly-once guarantee.
Do not introduce a Node business backend, new hosting platform or independently
operated service merely because a package example uses one.

## Package decision and upgrade evidence

Record exact package identity, source, target version, license, maintenance/support,
transitive/native dependencies, known advisories, runtime/TFM/OS/provider support,
upgrade effort, operational costs and exit plan. Inspect lockfiles and centrally
managed NuGet versions; avoid wildcards and conflicting transitive requirements.
Developer-owned restore/build/runtime checks verify the proposed set. If CI tests
need containers, verify runner capability; this does not authorize changing IIS
production hosting. Use the technology compatibility template for the shortlist.

## Official evidence

Entry points inspected 2026-10-05; reopen for the target release and package:
- [Microsoft HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience): current handler guidance and replay policy.
- [EF Core performance](https://learn.microsoft.com/en-us/ef/core/performance/): separate database, network and ORM costs.
- [ASP.NET Core HTTP clients](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-requests): select the target-version view; do not copy older Polly setup over current guidance.
For other candidate packages, inspect the maintainer's documentation, actual
package metadata, changelog and license before a project recommendation.
