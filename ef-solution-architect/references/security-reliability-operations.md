# Security, reliability and operations

## Security architecture

Start with assets, identities, data classification, trust boundaries and
abuse/failure cases that can affect the actual solution. Use a threat model
proportionate to the system. For each consequential threat identify scenario,
impact, mitigation, enforcement point, verification and residual risk owner.
Do not present a generic controls list as implemented security.

Separate workforce/customer identity, service identity and privileged access.
Confirm the identity provider and emergency-access policy from the project;
do not assume Entra or a local administrator from another EF application.
Model session/token lifecycle, authorization scope, revocation, step-up/MFA
if required, audit and recovery from identity dependency failure.

Distinguish network isolation from application authorization. Specify secret
and certificate ownership, storage, rotation and expiry handling; avoid
embedding secrets in clients, templates or diagrams. Consider data protection
in databases, files, caches, devices, exports and backups, including logging
and third-party diagnostics. Use only necessary personal data in logs.

Determine applicable organizational/regulatory controls with current sources
and responsible owners when the task requires compliance. Map requirement →
control → evidence → gap. Do not invent a required certification, infer
compliance from vendor marketing or call a design compliant without evidence.

## Reliability design

Obtain availability, latency, recovery and data-loss targets with workload
and service windows. Define measurement boundaries and owners. Identify
critical dependency chains and shared failure domains; two replicas sharing
one database, DNS or network path are not independent availability guarantees.

Model timeouts as an end-to-end budget. Bound retries with backoff/jitter and
idempotency; avoid retry amplification across client, gateway, application
and connector. Use circuit breaking, queueing or graceful degradation only
where business semantics support them. A permission failure is not a
transient error that should be retried indefinitely.

Separate high availability, backup and disaster recovery. Define what is
backed up (data, files, config, secrets references, keys where appropriate),
restore order, integrity checks, alternate capacity and restore testing.
Specify RTO/RPO as targets until measured. Recovery must include identity,
network, API gateway, agents, dependencies and data reconciliation.

## Deployment and change

Map logical components to actual runtime requirements and operating owners.
Evaluate deployment options within the selected EF project track and actual estate;
do not make Kubernetes or a new managed service the default without need.
Verify provider/region/edition availability before a production selection.

Define environment isolation and promotion, secret injection, artifacts,
configuration, compatibility, infrastructure change tracking and access.
For schema changes favor compatible expansion, data transition, client
migration and later contraction where appropriate. State when rollback is
unsafe and what forward repair or restore entails.

Identify deployment health, readiness and business-level verification.
Plan feature exposure, canary/blue-green/rolling strategy only when justified
and supported by the architecture. Code deployment and business activation
can have separate owners and checkpoints.

## Observability and service operation

Define logs, metrics and traces for user journeys, dependencies, queues,
data quality and integration freshness. Propagate correlation where possible;
separate diagnostic telemetry from business audit and its retention/access.
Monitor certificate expiry, tunnel status, agent health and backend outcomes,
not just process availability. Avoid leaking payloads or tokens into telemetry.

Create actionable alerts with thresholds, owner, first checks and escalation.
Include operating procedures for failed jobs, replay, reconciliation, restore,
credential rotation and emergency access only when in scope. An empty runbook
or health endpoint is not operational readiness.

## Readiness and evidence

Use acceptance criteria tied to NFR scenarios and material risks. Distinguish
planned controls/tests from inspected configuration and executed evidence.
Prefer realistic load, fault, contract and restore checks for the relevant
risks. Document unavailable environments or permissions precisely and avoid
claiming results that tools could not verify.

Review material residual risks with named business/operations/security owners;
do not invent acceptance or approval. Read-only design and review can proceed
without an approval ceremony. Production network changes, paid provisioning
and destructive migrations require the user's applicable authorization.
