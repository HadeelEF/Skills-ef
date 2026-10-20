# Application design and mapping to implementation

## Select boundaries before a directory tree

Identify business capabilities, change frequency, invariants and actual runtime
constraints. Define deployment units separately from modules, feature slices,
domain boundaries and dependency direction. A modular monolith can contain
vertical slices and clean/hexagonal boundaries; these are not competing labels.
Choose independent services only when their ownership, release, scale or trust
benefits justify distributed contracts, operations and consistency costs.

Make each module's public interface, owned records, allowed dependencies and
cross-module transaction policy explicit. Map these rules to assemblies/imports,
database access and a composition root. A Shared/Common folder should contain
small genuinely shared primitives, not every service and business entity.
Use enforceable boundaries, not project names as evidence of architecture.

## Produce a task-specific code map

The paths below illustrate responsibilities, not a required scaffold. Adapt to
the existing repository; directories may be sufficient for a small application.

| Responsibility | Example location | Boundary to explain |
| --- | --- | --- |
| .NET host/composition | `src/Api/Program.cs` | Register modules/adapters, configure middleware and expose endpoints |
| Business capability | `src/Modules/Requests/` | Public contracts and owned rules/data; other modules use its supported interface |
| Use-case slice | `Features/SubmitRequest/` | Input, validation, authorization, orchestration, result and mapping |
| Persistence/integration adapter | Module-local `Infrastructure/` | EF mappings, migrations, queries and external clients behind selected seams |
| Independent worker | `src/Worker/` | Own host lifecycle; invoke reusable use cases with durable intent and scoped dependencies |
| React application shell | `web/src/app/` | Providers, routing, session/workspace boundary and top-level errors |
| React feature | `web/src/features/requests/` | Routes/views, API/query adapter, forms, components and local state |
| React Native feature | `mobile/src/features/requests/` | Screen/navigation contract, use cases, local persistence and sync adapter |
| Generated API clients | `packages/api-client/` or project-local generated folder | One generation owner; transport/auth differs across browser/server/native |
| Platform adapters | `mobile/src/platform/` | Secure storage, links, files, permissions and device APIs |

Do not share backend persistence entities as web/native contracts or require
identical folders across all runtimes. Explain call flow and ownership for
an actual operation, not only where a filename might live.

## Specify one representative end-to-end slice

Choose a meaningful use case with a real invariant or integration boundary.
Specify its input/output/error schema, authorized actor, resource scope,
state preconditions, atomic changes, side effects and client states. Design
the connected path through composition, endpoint, rule, persistence, client
adapter and diagnostics. Define migration implications and expected evidence.

Deliver the design, contracts and handoff. Developers own the runnable slice,
source changes and application tests. When a PoC is needed, specify the question,
minimal scope, responsible implementer and success/failure criteria.

## Design shared contracts and reuse

Use a small shared contract surface with explicit schema/version ownership.
Share pure functions/types/design tokens only when dependencies are compatible.
Keep platform-specific transport, session, storage, navigation and rendering
separate. A monorepo can share build/test tooling without requiring web and mobile
to share their UI runtime. Choose monorepo versus separate repositories by release,
ownership and integration needs, not the fact that AI generates the code.

Select libraries through a decision table: problem, installed/native alternative,
candidate, compatibility, support/license, integration cost and exit strategy.
Consider current .NET validation/mapping/mediator/data/resilience packages and
React routing/query/form/state/UI libraries only where useful. Do not install a
large predetermined package list or require generic repositories over every ORM.

## Prevent architecture drift during implementation

For consequential rules use suitable assembly/import checks, analyzers,
contract diffs, schema constraints and integration tests. Verify actual calls
and data access, not only folder naming. Keep package/configuration changes
limited to their intended owner and preserve one serialization/auth/error policy.

Review duplicate business rules across .NET, Next.js, React, mobile and Mendix.
Client validation improves UX; authoritative rules remain server-side. Review
transaction, queue, cache and file behavior together. Update affected ADRs and
contracts when implementation proves a design assumption wrong; do not silently
change business policy to make a generated implementation easier.

For modernization preserve stable behavior with characterization examples,
move one boundary at a time and keep compatibility adapters temporary and owned.
Use expand/contract data evolution where releases overlap; record which rollback
restores code and which requires data repair. Do not delete a working prototype
or rewrite an entire repository merely because a target blueprint exists.
