# End-to-end solution and component design

Use for significant cross-system journeys or focused technical design. Specify
behavior and boundaries; do not implement application code or Mendix models.

## Establish authority and contracts

Map capability → responsible component → authoritative state → public contract.
Make authority precise enough to resolve conflicts: a system may own a request,
another approval tasks, and another financial posting. Do not describe all three
as owning the same undifferentiated status. Define derived read models, freshness,
reconciliation and which authority corrects a discrepancy.

For each interaction specify actor/principal, intent, preconditions, input/output,
operation/event identifiers, schema/version, deadline, authorization, business
outcome, errors, retry/deduplication and recovery owner. Distinguish command receipt,
durable acceptance, execution, remote acceptance and completion of the business
outcome. A successful transport status does not prove every later stage succeeded.

Model aggregate/transaction boundaries around actual invariants. State which
changes must commit atomically and which can converge later. Avoid a shared
database becoming an undocumented API between .NET, Mendix and SaaS. A data
pipeline or API gateway does not automatically own cross-system business policy.

## Design the journey through time

Walk initiation, validation, durable acceptance, processing, user-visible state
and completion. Add interruption points around each commit/send/ack boundary.
For each failure distinguish not performed, performed, and outcome unknown.
Specify who retries, which key survives retry, how status is discovered and
when an operator must reconcile. Compensation is a new business action with
its own authorization/failure cases, not a database rollback of the past.

Keep business state, delivery state and UI state separate. A request can be
approved while delivery to finance is pending or ambiguous. Define whether users
can edit/cancel/resubmit during each state and what happens to old decisions.
For long-running human workflows specify versioned input, assignment/delegation
policy, revalidation at action time and changes to in-flight instances.

For events specify fact versus command, source of truth, ordering scope,
deduplication scope/retention, schema evolution, replay and poison handling.
Do not impose global ordering when per-business-key ordering suffices. Distinguish
an integration feed from event sourcing of the business aggregate.

## Treat data architecture as lifecycle design

Identify business/external identifiers, reference/master data owners, validation,
history, attachments, retention, correction and disposal. Model the relationship
between transaction data, search, cache, analytics, exports and device copies.
Define propagation delay, lineage and who repairs inconsistent copies.

For two-way synchronization define conflict rules at the relevant field or
aggregate level, versions, loop prevention, deletes, replay and audit. Timestamps
alone are not a safe universal conflict policy. Do not let analytical copies
become an undisclosed transactional authority. Select ETL/CDC/API based on
freshness, supported extraction, volume, consistency and source impact.

For data migration define mapping, duplicate resolution, referential integrity,
quality thresholds, reconciliation totals and accountable owners. Distinguish
technical losslessness from acceptable business meaning. Document regulatory or
retention assumptions as pending owner/current-source confirmation when needed.

## Design each channel in its own runtime

For React/Next.js define browser versus server responsibilities, session and
rendering boundaries, data fetching/cache ownership, accessible interaction
states and personalized-content isolation. For React Native add device lifecycle,
offline authority, sync/conflict behavior and compatibility with old installations.
For Mendix define module/domain/process boundaries and platform-supported security
and execution semantics. Shared contracts do not imply identical implementations.

For SharePoint portals distinguish publishing/search/navigation from transactional
service state. Apply the selected project track; only for explicitly authorized
low-code/custom composition define identity, navigation,
cross-origin/session constraints and what happens when either platform fails.
Assess embedding versus linking/API composition with explicit support evidence.

## Produce a focused component design

For a bounded question, detail the consequential seam. For a requested full LLD,
apply this contract to every in-scope component and shared boundary. Include purpose,
public contract, internal responsibilities, allowed dependencies, logical data,
state machine, successful/error sequences, trust boundary, resource limits,
configuration ownership, lifecycle and required evidence. Describe significant
algorithms in pseudocode only when necessary to remove ambiguity.

Check consistency across views: every sequence participant exists in a component
view; every state has an owner; every external call has a trust/network contract;
every persisted artifact has retention/recovery responsibility; every consequential
quality claim has a mechanism and verification criterion. Handoff open details
explicitly and leave routine implementation decisions to the developer.
