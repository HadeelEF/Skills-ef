# Principal-level architectural reasoning

Use this method for consequential solution choices. Strengthen judgment through
explicit reasoning and evidence, not invented years of employment or certification.
Keep the architect/design boundary in SKILL.md; developers implement the outcome.

## Frame the decision before naming technology

State the business outcome, system boundary, decision required now, decision
owner, deadline/constraint and cost of deferral. Identify whose concerns differ:
service owner, end user, security, operations, data owner, integration owner and
delivery team. Describe the conflict without inventing stakeholder agreement.
Separate business policy from technical mechanism and permanent constraints from
historical implementation choices that may be negotiable.

Build a compact concern-to-view map: concern → question → necessary view → evidence.
For example, service continuity needs a dependency/failure-domain view and recovery
sequence, while data authority needs an ownership/lifecycle model. A diagram is
useful only if it answers a stakeholder question. Separate context, logical,
runtime/deployment and transition views and keep their names/contracts consistent.

Use three information levels: evidence sufficient to decide now; assumptions
that can remain reversible; unknowns that could change the recommendation.
Ask about the third category and progress on the first two. Do not demand a fully
approved BRD before helping with early architecture exploration.

## Identify the decisions that actually matter

Prioritize by impact, irreversibility and uncertainty. Typical consequential
choices concern system/data ownership, trust boundaries, public contracts,
consistency, runtime placement, operational responsibility and long-lived licenses.
Distinguish them from routine class names, hooks and local coding style.

For each major choice record constraints, viable baseline, serious alternative,
benefits, costs, failure modes, assumptions and trigger for reconsideration.
Evaluate doing less, reusing an existing capability, configuration, managed
product and custom implementation where applicable. Do not invent options to
fill a matrix or advocate a platform merely because EF owns it.

Eliminate hard-constraint violations before scoring. Explain ordinal scores and
weights; do not hide missing evidence behind a decimal total. Vary uncertain
weights, demand, license costs and operating assumptions to see whether the
recommendation changes. Report a fragile recommendation as conditional and name
the smallest evidence needed to choose. Include the cost of operational complexity
and coordinating releases, not only initial coding effort.

## Analyze interacting quality attributes

Express a high-priority quality concern as a stimulus, operating condition,
affected boundary, required response and measurable outcome. Rank by business
impact and technical uncertainty with stakeholder input where available.
Compare the architectural mechanism against the scenario rather than saying
"scalable", "secure" or "enterprise-grade" without a causal explanation.

Identify sensitivity points where a parameter changes the outcome, and trade-off
points where improving one quality harms another. For example, longer cached
authorization can reduce dependency load while increasing revocation delay.
Show the enforcement boundary, unacceptable condition and evidence required.
Record risk themes across scenarios, not just a disconnected checklist.

Use SEI's [ATAM resources](https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/)
as a foundation for scenario-driven trade-off analysis. Call a tailored desk
review an ATAM-inspired review; do not claim a formal ATAM evaluation occurred
without the actual process and stakeholders. Likewise, use the public scope of
[ISO/IEC/IEEE 42010](https://www.iso.org/standard/74393.html) to guide architecture
description research, not to claim conformance from headings or diagrams alone.

## Recommend with conditions and a path forward

Lead with the chosen option and why it fits this case. State the most important
downside, mitigation, residual risk owner and evidence that could reverse it.
For uncertain decisions prefer a reversible path or bounded spike: hypothesis,
representative scenario, implementer, cost/time boundary and pass/fail criterion.
A spike is justified by a decision it can change; avoid technology demos without
a question. Do not postpone every decision until a PoC exists.

Explain the recommendation at two depths: a short decision brief for management
and precise contracts/constraints for delivery. Acknowledge disagreements and
unresolved business choices. Record proposed versus accepted decisions honestly;
do not make architecture review a mandatory approval for every routine edit.

## Definition of design completion

The design is ready for handoff when consequential boundaries and contracts are
clear, a representative success and failure path is coherent, major quality
claims have mechanisms and evidence plans, and open items have owners/impact.
Deliver full LLD for the scope explicitly requested. Otherwise use focused LLD
where ambiguity would compromise correctness or feasibility.
Do not claim production readiness from design completeness or require developers
to reverse-engineer missing ownership and failure behavior from a box diagram.
