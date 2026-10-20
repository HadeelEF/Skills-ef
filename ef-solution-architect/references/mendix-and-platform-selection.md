# Mendix and platform selection

Use this reference for platform fit and sourcing decisions. For model/runtime,
security, integration, Windows deployment and current capabilities, also use
[Mendix engineering](mendix-engineering.md). This skill owns those design and
engineering decisions; do not refer away a requested task merely as low-code.

## Compare at capability level

Treat Mendix as an existing EF platform with potentially reusable investment,
skills and components. First apply the mandatory project policy in SKILL.md.
When platform selection is explicitly requested, compare whole-project tracks
(custom .NET/React, complete Mendix, or complete SharePoint where relevant).
Within a selected Mendix project, evaluate Mendix-native alternatives. Do not
propose a combined application stack without an explicit user policy change.
Avoid assuming every workflow suits low-code or every complex UI requires
custom development; examine the actual extension and operating constraints.

Capture users/channels, process complexity, domain rules, integrations, data,
UX fidelity, volume, mobile/offline needs, delivery skills, environments,
license model, support and exit requirements. Confirm the actual Mendix
version, deployment model, entitlements and supported infrastructure.

## Respect product boundaries

Do not treat a Mendix application as an ASP.NET Core service or assume its
runtime database can be selected from EF's custom SQL Server choices.
Verify databases, hosting, clustering and extensions for the specific Mendix
version and deployment. Apply custom-platform assumptions only where verified.

Define domain ownership, application modules, entity access, process rules,
published/consumed APIs and integration responsibility. Use supported platform
mechanisms; do not bypass application contracts by writing directly into a
Mendix application's database from another system.

Keep the application's UI, domain, business rules, workflow and channels in
Mendix. Integrate with existing systems using supported contracts and explicit
data ownership; do not introduce new .NET/React components to implement parts of
the Mendix project. A platform gap requires an explicit decision, not a silent
hybrid design. Do not bypass platform rules by relabeling a new backend an adapter.

## Evaluate delivery and lifecycle

Compare initial build and change speed with actual team capability, extension
maintenance, environments, testing, observability, deployment, upgrade work,
license growth and vendor support. Assess source/model export, data portability,
replaceable interfaces and the cost of a credible exit path.

For a Mendix project evaluate Mendix-supported mobile/channel capabilities.
Compare a separate React Native track only when the user explicitly requests
a whole-project platform decision or changes the platform boundary. Validate native modules, offline behavior,
release constraints and UX against real acceptance criteria.

## Produce an evidence-based recommendation

Use hard constraints first, then weighted criteria. Mark license costs and
regional hosting support unknown until verified. Recommend one primary option
and explain its drawbacks, conditions and material risks. Do not force a
hybrid architecture simply to use every available platform.

If a capability is uncertain, define a narrow PoC with representative users,
data volume, integration and explicit pass/fail criteria. Keep generated
examples isolated from production and describe what the PoC cannot prove.
Complete platform-specific architecture/design and handoff, and identify
validation requiring a developer or target runtime. Do not edit the app model.
Do not claim the .NET Full Stack skill automatically covers every Mendix operation.
