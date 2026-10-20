# Capacity, resilience and lifecycle economics

Use numerical models to test feasibility, not to invent precision. State units,
assumptions, uncertainty, measurement boundaries and source of every project value.
Keep estimates separate from workload tests performed by implementation teams.

## Translate demand into load

Start with journeys: submissions/searches/uploads, active windows, burstiness,
payload distributions, fan-out, polling, batch schedules and growth. Named users,
concurrent sessions, in-flight requests and requests/second are different measures.
Model each major dependency; multiplying application replicas does not increase
a shared database, SaaS quota, Secure Agent or constrained network link's capacity.

For a stable average workload, use L = arrival rate × average time in system
when its assumptions fit. Do not substitute p95 latency into Little's Law or
equate all logged-in sessions to in-flight requests. Estimate downstream load
from business demand × fan-out × expected attempts, including pagination/polling.
Use ranges if attempt rates or utilization are unknown.

For a backlog B and steady processing/arrival rates mu and lambda, estimated
drain time is B/(mu-lambda) only when mu > lambda and those rates can be sustained.
If mu <= lambda, the backlog will not drain without reducing arrivals or adding
effective capacity. Consider expiration, priorities, deduplication and quotas.

Illustration, not an EF estimate: 120 arrivals/second during a ten-minute outage
create 72,000 queued operations if all are accepted. At 180 completions/second
while arrivals remain 120/second, drainage takes about 1,200 seconds (20 minutes)
after recovery. Faster VM startup alone does not meet a five-minute recovery of
the business backlog. Exclude invalid/expired work only under explicit policy.

Estimate data/file/log growth and retention, hot working set, bandwidth and batch
windows with consistent units. Include indexes/replicas/backups where applicable;
do not assume raw payload bytes equal total database or billable storage.

## Budget an end-to-end response and failure

Allocate connection, processing, queue and network budgets along the critical
path. Parallel calls follow a different critical path from sequential calls;
do not add component p95 values and label the sum a measured end-to-end p95.
Specify cancellation, deadline propagation and useful degraded behavior.

Assign a retry owner/budget per boundary and inspect compounded retries across
client, gateway, service and connector. Three total attempts at each of three
nested retrying layers can cause up to 27 deepest-layer attempts for one request.
Distinguish attempts from additional retries. Use bounded backoff/jitter, rate
limits and idempotency where suitable; do not retry a rejected business operation.
See the primary [Amazon guidance](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
for the overload trade-off; adapt principles without selecting AWS hosting for EF.

## Analyze actual failure domains

Map runtime, database, file store, identity, DNS, gateway, tunnel, certificates,
agents, queues and human recovery actions. Identify shared fate, single writers,
control versus data planes and how a stale client/configuration behaves.
Two VMs with shared dependencies do not by themselves prove high availability.

An independent serial-dependency availability model can illustrate a bound only
when assumptions and dependency scope fit; do not multiply marketing SLAs into
a promised end-user SLA. Model common-cause failure, planned maintenance and
which journeys can continue with degraded dependencies.

Specify restore order, alternate capacity, failure detection, decision time,
recovery execution, backlog reconciliation and verification. Recovery includes
keys/configuration, identity, networks, files and external effects, not just DB.
For failover with duplicate-writer risk specify fencing/authority transfer and
safe failback. Distinguish HA, DR, backup, RTO and RPO; require measured evidence
for achieved values and document the business meaning of possible data loss.

## Compare lifecycle economics

Use a declared horizon and currency; separate one-time migration/change costs
from recurring compute, DB/OS/platform licenses, non-production, backup/DR,
logs, API/iPaaS entitlements, egress, support, operations and exit costs.
Reused investment is not cost-free: account for incremental capacity, license
tiers, upgrade effort and integration coupling. Avoid double-counting bundled
services or treating sunk cost alone as a reason to retain a poor option.

Show low/base/high cases and the demand or license threshold where the decision
changes. Use current official pricing/quotes only when amounts are needed; report
unknown commercial terms instead of fabricated savings. Evaluate operability and
skills against the actual owning team, including who handles failed messages,
certificate expiry, restore and cross-vendor incident coordination.

Deliver a feasibility model, key bottlenecks, cost drivers, conditional sizing
and evidence requested from implementers/vendors. Do not provision infrastructure
or certify capacity under the architecture profile.
