# Mendix architecture and engineering

Treat Mendix as a primary architecture and development discipline with its own
model, runtime, security, deployment and lifecycle. Own solution/component
design and assess implementation consequences. Developers own model edits and
extensions. Do not reduce Mendix architecture to platform selection or translate
.NET patterns literally into the model.

## Establish the app and the task

Read the actual Studio Pro/model and Runtime versions, support/patch track,
license, modules/widgets, Java, database, deployment tooling and hosting. Use
dated evidence and distinguish installed, candidate and recommended versions.
Unknown infrastructure details need not block logical modeling; mark the
implementation assumptions that depend on them.

Classify the work as new feature, existing-model diagnosis, security review,
integration, workflow change, UI/mobile, performance, upgrade or automation.
Inspect the relevant model and source artifacts, not only screenshots. Map
business capabilities and module dependencies, data authority, platform versus
custom responsibilities, users and quality requirements. For platform sourcing,
also read the platform-selection reference.

## Read only the necessary depth

| Decision | Specialist reference |
| --- | --- |
| Entities, associations, security, query and concurrency | [Domain and security](mendix-domain-security.md) |
| Activity-level flows, transactions, tasks and workflow evolution | [Flows and workflows](mendix-flows-workflows.md) |
| Atlas, pages, widgets, React client and native/offline | [UI and mobile](mendix-ui-mobile.md) |
| APIs, mappings, federation, connectors and extensions | [Integration and extensibility](mendix-integration-extensibility.md) |
| Windows, build, upgrades, performance, HA and recovery | [Delivery and operations](mendix-delivery-operations.md) |
| Maia/MCP/SDK and precise AI implementation | [AI model development](mendix-ai-model-development.md) |
| Official evidence and version-specific research | [Mendix sources](mendix-sources.md) |

For design cover the affected domain/security and execution boundary, then
load other areas as needed. Do not load every guide for a focused design question.
Use activity/property detail only where it resolves a consequential design issue.

## Deliver solution and focused technical design

For a substantial slice provide modules and qualified artifact names, entity
dictionary/associations, role and access matrix, page/action/data-source map,
typed microflow/nanoflow/activity contracts and relevant integration documents.
Include concrete expressions and property values where established; label
pseudocode and unresolved identifiers. Use precise rendered diagrams selectively.

For workflows add context, assignment/outcomes, failure recovery and the effect
of changes on running instances. For integrations add identity, mappings,
timeout/retry/idempotency and reconciliation. For deployment add the matching
runtime/toolchain and data/file migration/recovery plan. Scale detail to the task.

## Preserve EF constraints

EF reports Windows-hosted Mendix, Alibaba Saudi and hybrid integrations. The
documented Windows Mendix pattern uses Service Console and Java runtime, with
IIS as a possible reverse proxy; it is not the .NET IIS application pattern.
Verify actual supported database/Java/OS rather than inheriting EF's custom
application defaults. Keep SharePoint content, Mendix transactions, Apigee API
management and Informatica data processing boundaries explicit.

## Finish with evidence

Trace requirement → model element → flow → security rule → observable outcome.
Review negative access, invalid state, duplication, concurrency and recovery
where relevant. Inspect model changes and existing consistency/build/runtime
evidence. Deliver the architecture and focused design handoff to a Mendix
developer or implementing agent; do not edit the application model. State the
validation still required. Never imply this skill grants tools/access or that
a proposed model has been built or deployed.
