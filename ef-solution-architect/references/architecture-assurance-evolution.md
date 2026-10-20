# Architecture assurance and evolution

Use for design reviews, brownfield modernization and assessing AI/vendor proposals.
Review evidence and design corrections; developers/operations own execution.

## Review claims before appearance

Ask what each claim means and what would disprove it. "No duplicate financial
posting" needs an end-to-end operation identity and failure recovery, not just
a queue. "Tenant isolation" needs enforcement across queries/files/cache/export,
not a tenant dropdown. "DR ready" needs restore/dependency/authority-transfer
evidence, not a second environment pictured in a diagram.

For each important claim record supporting mechanism, evidence inspected,
counterexample, residual uncertainty and required validation owner. Distinguish
design defect, observed implementation deviation, conditional risk and improvement.
Do not infer a defect from a missing document alone or equate no evidence with
confirmed safety. Trace findings to business impact and concrete affected paths.

## Stress the design with relevant scenarios

Choose a small set based on real risk rather than a universal checklist:

| Scenario | Design question |
| --- | --- |
| Result lost after remote completion | How is the outcome discovered without repeating the business effect? |
| Credentials/roles change during a task | Which identity acts and when is authority revalidated? |
| Link/agent unavailable during peak/batch overlap | What is accepted, rejected, queued or degraded, and how does backlog drain? |
| Replica or primary recovers after failover | How are stale ownership and duplicate writers prevented? |
| Old mobile/offline client reconnects | Which contracts and states remain compatible and how are conflicts resolved? |
| Workflow/schema changes with active cases | Which records/instances move, remain, fail or need reconciliation? |
| Tenant/workspace changes mid-request | Can stale responses, caches, exports or work cross the boundary? |
| Database restored but files/remote effects are newer | How are business consistency and replay safety recovered? |

Walk stimulus → affected components → observable state → recovery → evidence.
Call this a design walkthrough until actual runtime evidence is supplied. Define
targeted experiments/PoCs for unresolved claims, with falsifiable pass criteria.

## Tailor findings and decision status

Prioritize by business consequence, exposure, recoverability and evidence
confidence. Do not assign decorative severity scores. Explain the smallest
effective design correction, alternatives, owner, dependency and expected proof.
Track accepted risks only when a named accountable owner actually accepts them.
If scores are requested, show the rubric, assessed coverage and unassessed areas;
do not inflate expertise or readiness to a universal 9/10 or 10/10.

Separate readiness to explore, readiness to implement the agreed scope, and
readiness to operate. A bounded design can be ready for implementation with
tracked non-blocking details, while runtime/security/recovery evidence is pending.
Expose genuinely blocking assumptions without converting every minor decision
into an approval ceremony.

## Design transition states, not just a target picture

Map existing contracts, data dependencies, consumers and operational owners.
Define current, intermediate and target states. For each migration slice specify
authoritative writer, reader routing, identity mapping, state transformation,
reconciliation, observability, cutover criterion and fallback/forward-repair.
Preserve compatible schema/API evolution for overlapping releases and old clients.

Treat backfill, initial synchronization, live change capture and final delta as
different phases when applicable. Explain how writes during migration are handled.
Avoid uncontrolled dual writes; if necessary, define conflict authority and
reconciliation rather than relying on delivery order. Rollback of software does
not restore deleted data, cancel external transactions or downgrade schemas.

For portal/platform change include URLs, content, attachments, search, identities,
workflow history and integrations. For Mendix include active workflow compatibility
and supported model/runtime transitions. For hybrid cloud include routing/DNS,
certificates, licensing and incident ownership without inventing provider support.

## Maintain architectural coherence over delivery

Define proportionate checks the implementing teams can automate or demonstrate:
dependency boundaries, contract compatibility, authorization, data ownership,
capacity/recovery and operational prerequisites. Map them to ADRs and quality
scenarios. Routine coding decisions remain local; revisit architecture when a
change alters contracts, trust, authority, failure behavior, cost or deployability.

Record time-bounded exceptions with rationale, consequence, owner and review
trigger. Retire obsolete ADRs and temporary integration paths once transition
criteria are met. Maintain one authoritative design with links from handoff and
review outputs, rather than accumulating conflicting architecture documents.
