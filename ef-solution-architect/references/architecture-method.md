# Architecture method and decision quality

## Contents

- [Discover and tailor](#discover-and-tailor)
- [Establish architectural drivers](#establish-architectural-drivers)
- [Compare feasible alternatives](#compare-feasible-alternatives)
- [Connect the views](#connect-the-views)
- [Estimate capacity and economics](#estimate-capacity-and-economics)
- [Modernize incrementally](#modernize-incrementally)
- [Finish with traceability](#finish-with-traceability)


For consequential decisions combine this method with the principal-reasoning,
end-to-end design, capacity/resilience/economics and assurance/evolution guides
routed in SKILL.md. Select only the depth needed; preserve the architecture role.

Use [HLD/LLD/SAD/SDD delivery](architecture-design-deliverables.md) to tailor the
requested document set and technology decisions. Author the complete requested
scope; a focused component template is not a substitute for a requested full LLD.

## Discover and tailor

Read enough to understand objectives, user journeys, business invariants,
external dependencies and deployment constraints. For a repository inspect
entry points, project manifests, dependency boundaries, identity, persistence,
integrations, background processing, configuration, CI and relevant tests.
State which parts were inspected and which claims are inferred.

Distinguish greenfield, enhancement, brownfield recovery, migration and
platform selection. Preserve IDs and baselines already used by the project.
Use a short decision for a local change, a feature design for a new workflow,
and a complete SAD for a new platform or consequential cross-system change.

## Establish architectural drivers

Identify ASRs from business flows, constraints, volumes, security, recovery,
change frequency and team ownership. A generic list of NFR labels is not
enough. Describe each important quality scenario using:

**Source → stimulus → operating condition → affected component → response → measure.**

For example, an illustrative requirement could describe concurrent document
exports during peak use and a measured completion threshold. Obtain or label
the target; never invent an approved response time or availability percentage.
Distinguish a business SLA from a technical SLO and an observed baseline.

## Compare feasible alternatives

1. Eliminate alternatives failing hard constraints; record the reason.
2. Consider the existing system or simplest viable option as a real baseline.
3. Compare at least one serious alternative for consequential decisions.
   Do not fabricate three options when only one is feasible; document why.
4. Use agreed criteria: functional fit, security, integration, operability,
   performance, delivery effort, skills, lifecycle cost and reversibility.
5. Explain weights and evidence before scoring. Mark unknowns; a precise
   total based on unsupported scores is not objective proof.
6. Recommend an option, accept its trade-offs, and identify the condition
   under which the recommendation would change.

Use ADRs for costly or difficult-to-reverse decisions. Record status and
human decision ownership. Distinguish a recommendation from acceptance.

## Connect the views

Use C4 Context for system boundaries/actors and Container for deployable
applications and data stores; a C4 container is not necessarily a Docker
container. Add component detail only where it clarifies important behavior.
Use deployment diagrams for nodes, networks and failure domains; sequence
diagrams for transactions and failures; ERDs for data relationships.

Give each diagram a scope, legend/status and matching component IDs. Label
connections by purpose/protocol and direction when known. Mark unknown or
proposed paths. Do not disguise logical flows as verified network routing.
Avoid putting every view into one unreadable diagram. In conversation keep
diagrams compact, no more than five nodes across; use tables for exact mappings.

For an important use case trace input, identity, validation, domain decision,
transaction, downstream side effect, response and recovery. A diagram showing
only the happy path is insufficient when failures affect business guarantees.

## Estimate capacity and economics

Use explicit workload assumptions: active users, peak concurrency, requests
per operation, payload, data growth, batch window, exports and retention.
Convert volumes consistently and keep units visible. Concurrency is not RPS.
Where useful use concurrency ≈ arrival rate × average time in system, with
its steady-state assumptions stated. Model peak versus average separately.

Separate estimated resource needs from measured load-test capacity. Include
headroom and the bottleneck shared by replicas (database, SaaS quota, link).
Use scenario ranges and sensitivity for uncertain growth or licensing.

Estimate total cost across compute, database/license, non-production, storage,
backup/DR, logs, gateway/integration entitlements, VPN, network egress, support,
engineering, migration and exit. Distinguish one-time and recurring costs,
currency, period and tax assumptions. Verify provider prices when quoting;
otherwise supply a fillable model rather than invented amounts.

## Modernize incrementally

Map current constraints and externally consumed contracts before proposing
a rewrite. Identify bounded migration slices, coexistence, versioning,
data reconciliation and cutover. Name the authoritative system at each stage.
Treat code rollback and data rollback separately. A schema change or external
side effect may require forward repair, compensation or restoring with loss.

Use a PoC to answer a named uncertainty, with representative conditions and
pass/fail criteria. A demo with mocked dependencies proves only that demo.
Do not claim production readiness, recovery or scale from a successful build.

## Finish with traceability

Maintain requirement/ASR → ADR → component/flow → implementation work →
acceptance/verification evidence. Cover unresolved assumptions, responsible
owners, consequences and the point at which each must be resolved. Review
trade-offs with the relevant stakeholders without manufacturing sign-off.
