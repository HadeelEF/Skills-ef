# Enterprise systems, platforms, portals and digital services

## Establish the type of solution

Distinguish content publishing, employee collaboration, transactional services,
enterprise systems of record, reusable platform capabilities and mobile channels.
One product can combine several; give each capability an owner and clear boundary.
Map business capabilities, applications, information ownership, integrations,
user groups and operational teams. Use enterprise architecture context to
align a solution without claiming ownership of the organization's entire strategy.

For e-services trace discovery/eligibility, identity, initiation, draft,
submission, validation, processing, human decisions, notifications, fulfillment,
status inquiry, correction/appeal and closure where required. Derive actual
states, SLAs, delegation and approval policy from requirements; do not invent them.
Model channels as views of authoritative business state, not separate rule engines.

## Select architecture along independent axes

| Axis | Alternatives | Decision evidence |
| --- | --- | --- |
| Deployment | Single application, modular monolith, independently deployed services, serverless functions | Release ownership, isolation, scale, support and cost |
| Internal organization | Layers, clean/hexagonal/onion dependencies, vertical slices, feature modules | Domain complexity, change patterns, enforceable boundaries |
| Domain modeling | Transaction scripts/CRUD, rich domain, bounded contexts and aggregates | Invariants, vocabulary, transaction boundaries and model divergence |
| Coordination | Direct request/response, orchestration, choreography, durable workflow | Latency, visibility, coupling, human waits and recovery |
| State and reads | Transactional model, CQRS projections, event sourcing, analytical stores | Query needs, audit/history, consistency and replay costs |
| Frontend composition | Single frontend, shared design system, microfrontends, portal integration | Independent teams/releases, UX consistency and runtime overhead |
| Integration estate | Point-to-point, mediated/iPaaS/ESB, API products, event platform | Number and stability of contracts, ownership, legacy isolation |

Patterns operate on different axes. Event-driven does not require microservices;
CQRS does not require event sourcing; a modular monolith can use vertical slices
and hexagonal boundaries. Serverless describes an execution model, not a removal
of reliability or operational responsibility. Do not substitute pattern names
for a component, state and failure design.

## Design a platform deliberately

Identify which capabilities should be shared: identity, notifications, documents,
payments if required, audit, reference data, service catalog or workflow tooling.
Evaluate reuse against coupling and availability. Do not build a generic platform
for hypothetical future consumers; begin with real contracts and owners.

Separate departments/workspaces, legal tenants, identity realms and database
isolation; they are not interchangeable. Choose shared schema, separate schema
or separate database from actual isolation and operating needs. Cover tenant
resolution, cross-tenant administrators, per-tenant data/cache/files/exports,
onboarding/offboarding and noisy-neighbor limits.

For workflow separate process state, task assignment, authorization and domain
state. Version definitions and preserve the meaning of in-flight cases. Define
timeouts, escalation, reassignment and compensation only from agreed business
rules. A status column alone may not represent a long-running process engine.

## Design portals and channels

Separate public information, authenticated services, staff authoring and privileged
administration. Apply the selected whole-project track: custom .NET/React,
complete Mendix, or complete SharePoint. Map existing external systems and
user navigation without introducing a mixed implementation of the project. Shared branding or SSO does not imply a shared
authorization database or one deployment unit.

Cover content ownership, publishing/versioning, search, navigation, localization,
RTL, accessibility, responsive use, links, metadata/SEO where relevant, and
anonymous versus personalized caching. Distinguish a CMS content lifecycle from
a business transaction lifecycle. Evaluate linking, supported embedding or
API-driven integration with existing external systems using explicit UX,
authentication and security constraints. Composition is not permission to add
a different implementation stack to a Mendix or SharePoint project.

For mobile, include device trust, intermittent networks and delayed client updates.
For external users, identify registration and identity proofing requirements;
do not assume employee AD accounts or national identity integration is required.

## Modernization and service continuity

Map capabilities and contracts before replacing a portal or ERP-adjacent system.
Use strangler/coexistence/anti-corruption boundaries when useful, with source-of-
truth transitions and reconciliation. State which consumers can move separately
and which require coordinated release. Account for URLs, content, attachments,
identity mapping, workflow history and mobile client compatibility.

Deliver a capability/application map, service blueprint, bounded architecture,
options/ADRs and an executable transition plan at the requested depth. Validate
a real cross-channel journey and a failure case, and expose platform costs and
operating ownership instead of maximizing the number of components.
