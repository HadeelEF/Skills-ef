# HLD, LLD, SAD and solution design delivery

Own the requested complete design document, not only an outline or a list of
questions. Fahad explicitly expects HLD, LLD, Solution Architecture Documents
(SAD) and Solution Design Documents (SDD), together with suitable technology and
solution selection. Writing detailed design is part of this architect role;
application code/model changes remain with the implementing role.

## Select the document contract

Terminology varies across organizations. Preserve the project's definitions and
document names. If none exist, use the following working convention and state it
briefly. Do not create four overlapping documents simply because four names exist.

| Deliverable | Decision and reader | Essential depth |
| --- | --- | --- |
| HLD: High-Level Design | Solution/system overview for business, architecture and delivery leads | Scope/drivers, context, logical/deployment boundaries, technology choices, data/integration/security, quality and transition approach |
| LLD: Low-Level Design | Implementation-ready design for developers, AI agents, DBA and integration teams | Component/module internals, interfaces/schemas, sequences/states, validations/invariants, persistence/concurrency, failures, security/configuration and verification |
| SAD: Solution Architecture Document | Coherent architectural baseline across the entire solution | Drivers/options/ADRs and connected HLD views, architectural constraints, NFR allocation, governance/risks/evolution; references detailed designs |
| SDD: Solution Design Document | Integrated solution design packet for implementation | Selected architecture summary plus detailed designs across applicable channels/backend/data/integration/operations; can contain HLD and LLD sections |

Use one concise SAD/SDD with embedded HLD/LLD for a small solution. For larger work
keep a parent architecture document plus independently versioned LLDs by bounded
module, integration or capability. If the user requests both HLD and LLD, deliver
both levels explicitly, as separate documents when requested; do not substitute
one generic SAD and silently omit the detail. For review/edit requests update the
existing structure and preserve identifiers instead of producing a parallel baseline.

## Establish inputs and scope without blocking everything

Read requirements/BRD/SRS, flows, UX, relevant repo/configuration, selected track,
existing decisions, dependencies and quality targets. Build a small input/coverage
map. Mark missing facts, conflicts, assumptions and decision owners precisely.
Proceed with independent design and bounded assumptions; ask only when a missing
choice changes the design materially. Never invent approved requirements or NFRs.

At the outset state deliverable(s), covered scope, depth, naming convention and
existing sources of truth in a short paragraph/table. This is tailoring, not a
new approval gate. If asked to write a document, populate it with the available
requirements and reasoning; a blank template or promised outline is not completion.

## Select technology and solution deliberately

Apply mandatory EF project tracks first. Compare design options within the track:
modular monolith versus justified distribution; slices/layers; supported React
state/routing/form packages; .NET persistence/jobs/cache; SQL schema/index/recovery
choices. Assess NoSQL only under the stated proposal policy. Mendix and SharePoint
projects stay wholly within their platform; external integration is not a workaround.

For each consequential decision record requirement/ASR, mandatory constraint,
existing/built-in baseline, serious feasible alternative, evidence and uncertainty,
recommended choice, downside, dependencies, lifecycle cost and revisit trigger.
Reject constraint-breaking options explicitly before scoring. Explain criteria
and sensitivity when using weights; do not manufacture precision or fake options.

Verify current compatibility, support, license and hosting before naming a final
package/product version. Separate recommended from accepted/deployed. If evidence
is missing, give a conditional recommendation and a small validation question,
owner and pass criterion. Select a coherent solution, not isolated fashionable tools.

## Develop connected HLD and LLD

Use stable requirement, component, interface, data and decision identifiers.
In HLD show purpose, responsibilities, trust/deployment boundaries and dependencies.
In LLD resolve the behavior at those boundaries: inputs/outputs, principal, rules,
atomicity, state transitions, concurrency, failure/retry/recovery and observability.
A sequence diagram or list of classes alone is not a complete LLD.

For custom projects specify .NET module/public interface and use-case contracts;
React route/feature/state/API boundaries; optional React Native/PWA lifecycle and
offline contracts; SQL entities/constraints/keys/index rationale; API/event/file
schemas and versions; Windows/IIS deployment/configuration and worker lifecycle.
Use component/class relationships or illustrative pseudocode only where they
resolve ambiguity; leave routine private methods/hooks to the implementer.

For Mendix use modules, entities/associations/access rules, pages, microflows,
nanoflows/workflows, integration mappings and deployment contracts. For SharePoint
use sites/content types/lists/libraries, permissions/publication, supported extension
contracts, APIs and farm dependencies. Detail the platform design without editing
its executable model, farm or database. Tailor full LLD to the requested scope.

## Review readiness and hand off

Check requirement → decision → HLD component → LLD contract → acceptance evidence.
Every major arrow needs an interface owner; every stored fact needs an authority;
every privileged action needs an enforcement point; every critical asynchronous
step needs delivery/recovery semantics. Names, schemas, identifiers and versions
must agree across diagrams, text and tables. Keep estimates and measured facts apart.

Walk a representative success, denied action, duplicate, concurrent update,
dependency failure and recovery where relevant. Verify hosting feasibility and
quality budgets. Mark unresolved decisions with consequences/owner, and identify
which implementation work they actually block. Do not call unresolved design
production-ready or claim runtime tests from a document walkthrough.

Finish with completed document(s), recommendation/rationale, review evidence,
material open issues and an implementation-ready packet. Keep the parent SAD/SDD
and LLD synchronized via references and change impact, not copied sections.
