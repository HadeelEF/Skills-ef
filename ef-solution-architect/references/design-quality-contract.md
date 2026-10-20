# Design completeness and architectural quality

Use this contract to author or review a design. Tailor depth to the requested
scope; a full LLD must resolve all in-scope contracts, not just a demonstration
slice. Completeness does not mean specifying every private method or repeating
the same decision in multiple documents.

For full LLD, populate field types, nullability, key/cardinality, operation
payloads/errors and state transitions in the document or an actual linked contract.
Saying "define these later in OpenAPI" is an unresolved contract, not completed
LLD. Label deliberately open implementation details and distinguish them from
missing behavior that forces developers to make new architectural decisions.

## Contents

- [Establish coverage before writing](#establish-coverage-before-writing)
- [Check each boundary](#check-each-boundary)
- [Resolve design choices with operational consequences](#resolve-design-choices-with-operational-consequences)
- [Review connected behavior](#review-connected-behavior)
- [Use a transparent review rubric](#use-a-transparent-review-rubric)
- [Handoff and evidence levels](#handoff-and-evidence-levels)

## Establish coverage before writing

Build a coverage ledger: requirement/use case → HLD responsibility → LLD contract
→ verification → status. Use Covered, Conditional, Gap or Not applicable with a
reason. Count requirements and significant interfaces, not pages. A conditional
version selection can coexist with completed logical design; an unresolved
atomicity guarantee may block the affected write operation only.

For a large request deliver the requested document set in manageable sections,
retaining one coherent index and identifiers. Do not silently shrink a full
solution request to one component because the template is easier to populate.
If inputs are incomplete, state which behavior is a proposed design and which
business rule still needs an owner; avoid an empty document full of questions.

## Check each boundary

| Boundary | Design must resolve | Typical omission to challenge |
| --- | --- | --- |
| Backend/module | Capability, public contract, dependency direction, rule/transaction ownership, authorization, configuration and resource lifecycle | Class lists without behavior; shared database used as an undocumented module API |
| API/event | Principal, inputs/output, types/units/nulls, scope, errors, version, idempotency, concurrency, timeout, retry and unknown outcome | HTTP success interpreted as business completion; replays with a new operation key |
| SQL/data | Entities/fields/keys/cardinality, constraints, access paths, atomicity/isolation, retention/history, growth and compatible evolution | Application prechecks used instead of concurrent invariant enforcement |
| React | Route/feature/component responsibility, server/form/UI/URL state, load/error/empty/denied/conflict states, query identity and cancellation | Late result from a previous workspace appears after switching; refetch overwrites a dirty form |
| Native/PWA | Local authority, crash-safe drafts/commands, sync/deletion/conflicts, identity/device lifecycle and old-client compatibility | Query persistence treated as guaranteed business delivery; remote revocation promised offline |
| Mendix | Qualified module/entities/access rules, page/flow contracts, execution context, transactions, queue and offline boundaries | Visibility treated as authorization; Commit activity assumed to finish outer transaction |
| SharePoint | Sites/content types/libraries, version/publication, permissions/search, supported API/extension, farm and recovery | Draft security assumed from navigation; direct content-database access |
| Files | Owner/version, authorization, size/type/scanning where needed, storage/publish lifecycle, partial writes, retention, recovery | DB row says completed while file is absent; public link bypasses current authorization |
| Runtime | Host/service identities, placement, configuration/secrets, lifecycle, overload, diagnostics, release and dependency recovery | Web-process lifetime treated as durable task execution; health means only process alive |

For uploads/imports/exports distinguish receipt, validation, durable acceptance,
processing and publication. Define who can retry, cancel, reconcile or delete
and whether previous results remain accessible after role/resource changes.
For batch work specify checkpoint, partial acceptance, poison item, totals and
reconciliation. A queue product does not define the business state machine.

## Resolve design choices with operational consequences

Record at least one serious feasible alternative for a consequential decision,
unless hard constraints leave only one. For packages identify responsibility and
why the framework/existing dependency is insufficient. Do not default to a custom
queue or framework: compare mature options against the maintenance burden of
leases, retry, dashboard, upgrades, incident repair and staffing.

Numerical values need a label: requirement, observed measurement, calculation,
proposal or illustration. Give workload and units. A convenient file limit or
timeout can change business behavior; explain its consequence and validation
owner before treating it as an acceptance condition. Avoid silently making an
unsupported business limit the solution to a technical design difficulty.

When evidence conflicts, state both observations, applicability and a reversible
next step. Do not settle a vendor support disagreement by averaging versions or
using whichever search result is newer. A compatibility table, release note and
installed build address different questions.

## Review connected behavior

Walk the most important success and failure paths. Challenge at least the risks
present in the task: authorization changes, duplicate commands, simultaneous
updates, lost response after commit, partial external effect, process death,
stale writer, old client, schema change, restored data/files and queue drainage.
Avoid adding every possible scenario to a trivial change.

Check that every sequence participant exists in a component view, every arrow
has an interface owner, every state has an authoritative writer, every invariant
has an enforcement mechanism, and each material NFR has a measurement boundary.
Review document, diagram and schema names together. Distinguish design defect,
implementation deviation, conditional risk and optional improvement.

## Use a transparent review rubric

Score only when requested or when evaluating the skill. Assess ten dimensions:
scope/evidence; decision quality; connected HLD; complete LLD; data correctness;
security/privacy; failure/recovery; platform feasibility; delivery/operability;
traceability/communication. Give each 0–4: 0 absent/unsafe, 1 mostly asserted,
2 partly specified with material gaps, 3 coherent with bounded conditions,
4 precise, consistent and supported at the evidence level claimed.

If a summary is useful, sum applicable points / maximum applicable points × 10;
show exclusions, rationale and sample size. Never hide a critical violation in
an average: unauthorized platform substitution, exposed sensitive data, false
execution/compliance claims or a broken core invariant means Needs correction
regardless of total. Do not force a desired 10/10 or infer human experience.
Keep readiness status separate from the numeric score.

## Handoff and evidence levels

Classify evidence as proposed, document walkthrough, static artifact inspection,
executed integration/device/load check or measured operational result. A design
exercise reaches only the first three unless actual execution is supplied.
State what remains to be demonstrated and by whom. Routine implementation
details can remain delegated; consequential guarantees cannot be left implicit.

Finish with covered scope, recommendation/downside, traceable contracts,
material open decisions and acceptance scenarios. Review design completeness
independently of implementation and production readiness. Use the quality-review
template for substantial reviews; a small change may need only a short paragraph.
