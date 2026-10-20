# Application, web and mobile architecture

## Contents

- [Backend boundaries](#backend-boundaries)
- [Web architecture](#web-architecture)
- [React Native architecture](#react-native-architecture)
- [Data implications](#data-implications)
- [Architectural seams](#verify-the-architectural-seams)

## Backend boundaries

Start from business capabilities and invariants. Define each module's public
operations, data ownership, dependencies and transaction boundary. Prefer
simple deployment until independent scaling, release, ownership or trust
boundaries justify distribution. Do not impose DDD on simple CRUD domains.

For .NET state transport/API, orchestration, domain rules, persistence and
integration responsibilities. Choose separation proportionate to complexity.
Document error contracts, authorization at resource scope, concurrency control,
idempotency, cancellation and background jobs. Avoid generic layers that
hide every useful feature of the data provider without a specific benefit.

Distinguish in-process events, durable messaging and externally observable
business facts. For database write plus external action identify the atomic
commit boundary, recovery mechanism, consumer deduplication and ordering needs.
Do not assume application rollback reverses a sent email or uploaded artifact.

Handoff backend principles and a representative use-case sequence. When detailed
design is needed, specify module/class responsibilities, composition boundaries,
mappings and acceptance evidence for the representative slice. Connect them
to the intended boundaries and guarantees, using the architecture-to-code reference.

## Web architecture

Use React.js with IIS hosting for custom projects. Add React PWA when required;
cover service-worker lifecycle, offline scope, update/version compatibility,
private cache cleanup and revalidation of queued actions. Apply SKILL.md's
project policy before using Next.js; it is conditional, not the default.
For an explicitly selected Next.js frontend assess interactivity, SEO, first
load, personalization, caching, routing, authentication and Windows/IIS hosting.
Document browser, server runtime and .NET responsibilities. A server-rendered
Next.js app requires a compatible runtime; static export covers only supported
static behavior. Do not assume IIS or a static web host executes Node code.

If Next.js provides a BFF, identify its scope and identity propagation. Keep
business invariants and authorization in authoritative backend services;
avoid divergent rules in browser, Next.js and .NET. Specify token/cookie
handling, CSRF/CORS where applicable and the allowed upstream targets.

Define feature boundaries, navigation, server/client state ownership, API
contracts and errors. Cover loading, empty, forbidden, validation, timeout,
partial success and edit-conflict states. Trace session expiry across tabs,
cache invalidation, workspace/tenant changes and personalized SSR data.

Use Tailwind as EF's web styling context with verified brand tokens. State
RTL, Arabic/English, responsive and accessibility constraints. Do not turn
the architecture document into a component-by-component UX specification.
Resolve relevant frontend package and integration details when designing or
reviewing a slice. Hand implementation to Full Stack while retaining
responsibility for rendering, security, support and runtime consequences.

## React Native architecture

Treat mobile as its own client/runtime. Determine iOS/Android requirements,
supported OS versions, device capabilities, native modules and delivery
constraints. Choose Expo-managed/development build or bare workflow from
requirements and current support; do not declare one already adopted.

Define API version compatibility with older installed clients, release
channels, signing ownership and rollback limits. A server rollback must not
break clients already installed on devices. Verify app-store and OTA update
constraints at release time when relevant.

Use an appropriate native OAuth/OIDC flow when required, secure storage for
sensitive tokens, session revocation and deep-link handling. Never embed a
confidential client secret in a mobile binary. Keep authorization server-side.
Plan push delivery, background execution, network loss and retry behavior
against actual product needs and platform limits.

Only add offline persistence when required. Define local data sensitivity,
encryption, queue semantics, retries, conflicts, sync authority and deletion
after logout/device loss. Document whether a stale record is displayable or
actionable. Do not promise uninterrupted background sync.

Reuse business types, API clients and tokens where viable, but assess mobile
UI and accessibility separately. Tailwind CSS for web is not automatically
a native styling solution; investigate any native adapter before recommending.

## Data implications

Keep conceptual/logical data models tied to module boundaries and use cases.
Specify keys, constraints, history, retention, classification and lifecycle.
Separate transactional stores from analytical copies and caches. Clarify read
and write ownership; another module's database is not automatically its API.

For SQL Server on premises versus SQL Server on ApsaraDB verify product/edition parity,
collation, timezone, privileges, extensions/features, backup/restore, CDC,
network latency, provider compatibility and operational responsibility.
Do not infer all SQL Server features exist in every managed tier or region.
Detailed physical schema/index tuning remains grounded in actual queries.

## Verify the architectural seams

Use representative vertical slices spanning client, identity, business rules,
database and an external dependency. Include duplicate requests, session
expiry, concurrent updates, lost responses and deployment version skew when
they affect the feature. Specify what a test must prove; claim results only
after execution in a suitable environment.
