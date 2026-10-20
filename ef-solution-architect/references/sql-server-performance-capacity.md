# SQL Server performance and capacity architecture

Use for evidence-based database design and architectural diagnosis. Inspect
provided plans/metrics and specify bounded evidence collection for the DBA.
Do not run production workload, enable instrumentation or alter settings here.

## Frame the symptom and baseline

State affected business journey, observation window, concurrency, dataset shape,
tenant skew, growth, response target and baseline. Distinguish API elapsed time,
SQL duration, CPU, wait, result serialization and cross-network round trips.
Find whether database time is actually the bottleneck before scaling SQL or adding
Redis/replicas. Measure representative parameters and warm/cold conditions; do not
infer production p95/p99 from averages or one developer execution.

Inspect actual execution plans where available, Query Store history, suitable
DMVs/Extended Events, waits, deadlocks, logical reads, CPU, memory grants, spills,
log/data I/O latency and tempdb/version-store pressure. Query Store provides query,
plan and aggregated runtime history; configure capture, size and retention for the
workload. Plan forcing can mitigate a regression, but requires monitoring and a
revisit/removal decision rather than freezing every plan permanently.

## Diagnose from evidence

| Observation | Investigate before recommending | Candidate design response |
| --- | --- | --- |
| Large estimated/actual row mismatch | Data skew, stats, parameters, correlations, implicit conversions | Correct shape/types/stats; verify release-compatible parameter-sensitive plan features or targeted alternatives |
| Heavy reads or repeated lookups | Projection, join cardinality, predicates, indexes, pagination, N+1 | Narrow projection, appropriate index/query shape and bounded requests |
| Blocking/timeouts | Transaction age, blocker, lock resources, accessed order, external work inside transaction | Shorten scope, fix access pattern or invariant/isolation design; no blanket NOLOCK |
| Deadlocks | Deadlock graph and resources/order for every participant | Consistent ordering, access-path fix, bounded replay of rolled-back unit |
| Memory grant/spills | Sort/hash shape, estimates, concurrent requests and grant behavior | Query/index correction and workload control before broad memory hints |
| Log pressure | Long transactions, throughput, log reuse waits, backup/replica state and growth | Fix retention/reuse cause, bound batches and size storage; not routine shrink |
| CPU or worker pressure | Expensive expressions, plans, compilation, parallelism and over-concurrency | Reduce work/compilations, correct plans and backpressure; no universal MAXDOP value |
| Latch/tempdb pressure | Allocation/metadata/hot-page contention versus physical I/O, versioning consumers | Evidence-based layout/workload changes; distinguish latch waits from lock waits |

Waits and missing-index suggestions are clues, not an automatic script to apply.
Check the interval/deltas and existing indexes; preserve evidence before clearing
caches or restarting. Estimate plans differ from runtime evidence. Redact sensitive
parameters and query text in artifacts, traces and AI handoffs.

## Tie indexes to access paths

Specify filter/order/join and selected columns, parameter distribution, expected
selectivity and write rate. Compare clustered/nonclustered, covering/filtered and
columnstore indexes by workload and version. Weigh key width, INCLUDE cost,
lookup count, write amplification, uniqueness, compression and storage.
Do not use selectivity alone as a universal column-order rule; include equality,
range, sorting and actual workload. Sargable predicates and matching types matter.

Review parameterized optional filters, leading wildcards, function-wrapped indexed
columns, implicit conversion and unbounded OFFSET. Keyset pagination needs stable
ordering with a tie-breaker and a defined concurrent-change contract. JSON/full-text
search needs workload-specific indexes and verified feature/language availability.

Partition for justified retention, maintenance or partition-eliminating access;
partitioning does not automatically accelerate every query or distribute a single
instance across servers. Define partition key, aligned index/unique-key constraints,
boundary management, archive/switch prerequisites and who owns maintenance.

## Budget resources and .NET interactions

Model data plus indexes, history, LOBs, log generation, tempdb/versioning, backups
and growth headroom. Relate requests to statements, reads/writes and network round
trips; multiply by concurrency and retry behavior with explicit assumptions.
Specify bounded worker and connection use, not pools large enough to hide overload.

Assess server memory, CPU, storage latency/IOPS/throughput and file growth together;
request actual measurements before numerical settings. Leave OS/other services
headroom. Bulk operations, maintenance and reports compete with transactional work.
Compare read replicas, an analytical copy or scheduled extraction only where lag,
authorization, cost and source-of-truth rules meet the use case.

Coordinate EF tracking/projection/split queries and Dapper with the same workload.
A faster SQL statement may still worsen total request round trips or consistency.
Batch carefully, limit payloads and protect interactive work from exports. Verify
on-premises/cloud network latency instead of assuming identical query behavior.

## Prove the recommendation

For each change deliver hypothesis, before/after metrics, representative load,
correctness checks, expected downside, rollback/revisit trigger and execution owner.
Plan/query regression, skew, peak contention and sustained behavior matter beyond
a single benchmark. Do not claim throughput gains without measurements.

## Official evidence

Inspected 2026-10-05; verify installed engine/compatibility and feature conditions:
- [Query Store](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store)
- [Index design](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide)
- [Intelligent query processing](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing-details)
