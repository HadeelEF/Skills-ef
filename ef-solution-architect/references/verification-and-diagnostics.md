# Architecture verification and evidence-led diagnostics

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Select evidence by failure risk

Tie each consequential claim to an invariant, observable outcome and suitable
test boundary. Use the project's existing tools where possible. Keep checks
proportional: a copy change rarely needs new tests; a financial state transition
needs stronger evidence than a successful build or screenshot.

| Claim | Suitable evidence | What does not prove it |
| --- | --- | --- |
| Backend build/wiring | Restore/build and application startup with target configuration | Compiling an isolated snippet |
| Business rule | Representative positive/negative use-case examples with real assertions | Verifying that a helper was called |
| SQL integrity/concurrency | Target-engine integration test with separate connections/contexts and controlled interleaving | EF InMemory, one DbContext or sequential calls |
| Public contract | OpenAPI validation/diff, generated client compile and actual response checks | TypeScript interfaces or an unused schema |
| Resource authorization | Different principals/resources, direct API requests and privileged-field attempts | A hidden button or one authorized happy path |
| Web behavior | Browser journey with real API/persistence for the relevant seam | Mock-only rendering or a local success toast |
| Mobile behavior | Platform build and device/emulator journey for affected native paths | JS component tests alone |
| Recovery/durability | Kill/restart/retry at the relevant commit/send/ack boundary | Graceful shutdown only or an in-memory queue demo |
| Performance | Representative workload, baseline/changed measurements and environment | A new cache/index or passing functional tests |
| Deployability | Target-like package/config/startup/health and smoke evidence | A development server running locally |

## Build a small evidence set per slice

Start from acceptance examples independent of generated implementation. Include
boundary values, denial, conflict or failure where the requirement calls for
them. Use deterministic coordination for race tests rather than arbitrary sleeps;
avoid flaky assertions on exact wall-clock timings. Isolate test data and use
synthetic identities. Never test destructive operations against production.

For .NET use existing unit/API/integration infrastructure and a real target-like
database when relational semantics matter. EF fake providers do not establish
SQL Server translation, constraints, transactions or locking. Choose the minimal
realistic scope, not an expensive full environment for every pure function.

For React test meaningful user interactions, state transitions and API mappings;
use browser verification for routing, authentication, rendering and network races.
For React Native use current compatible test tooling, then validate relevant
native build/runtime behavior, persistence migrations, links and permissions.
State clearly when a native toolchain or device is unavailable.

Validate migration and old-client coexistence when a release changes persisted
data or public contracts. Tests against only the newest client cannot prove
compatibility with mobile binaries already installed.

## Diagnose before prescribing a pattern

Record reproduction, inputs, expected/actual behavior, environment/version and
first failing boundary. Separate evidence from hypotheses. Follow trace IDs
from browser/device through BFF/gateway/API, SQL/cache and external work.
Inspect relevant logs and timing without printing credentials or full sensitive
payloads. Specify the smallest discriminating experiment and recommend a targeted change
for the implementing owner; review its evidence before updating the design.

- .NET: examine DI lifetimes, cancellation, thread-pool/connection pressure,
  exception paths, query plans, locks, allocations and downstream retry budgets.
- React: inspect state ownership, stale closures, request ordering, cache keys,
  rerenders, network waterfalls, hydration and browser layout/paint.
- React Native: separate JS/UI/native work, native crashes, lifecycle changes,
  secure/local storage, device permissions, offline queues and build compatibility.

Do not introduce microservices, memoization, Redis, indexes or a rewrite before
connecting the proposed change to observed evidence. Measure improvement with
comparable data/load and report material limits; avoid unsupported percentages.

## Review generated diffs against architecture

Check contract/schema/client agreement, data and authorization ownership,
transaction boundaries, duplicate effects, error propagation, secret handling,
dependency support and introduced operational responsibilities. Detect swallowed
exceptions, unconditional success, broad suppression, test removal, stale mocks,
unwired routes/components, unused configuration and incomplete migration handling.

Test failure is evidence to investigate, not a reason to weaken an agreed
requirement. Recommend correction of production code or a demonstrably wrong
test with a stated reason and an implementation owner. Do not claim full coverage or production readiness from a subset.

## Close the verification loop

Record check, command/environment, relevant result and evidence status:
planned, inspected, built, tested with doubles, integrated, device-verified or
deployed. Report unresolved risk with the exact missing validation and owner.
Rerun affected checks after fixes; broaden only for a concrete remaining risk or
required gate. Stop optional testing after sufficient evidence and finish delivery.
