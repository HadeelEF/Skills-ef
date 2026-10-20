# SQL and NoSQL data architecture

Fahad requested deeper SQL and NoSQL expertise on 2026-10-05. SQL Server remains
the established custom-project database baseline, on premises or on Alibaba
ApsaraDB for SQL Server. Assess and recommend a NoSQL adjunct or alternative when
requirements justify it; label it a proposed platform decision, not an already
adopted service or silent replacement. This expertise expansion does not change
.NET/React/Windows-IIS or Mendix/SharePoint whole-platform boundaries.

## Contents

- [Start with the workload and invariants](#start-with-the-workload-and-invariants)
- [Design SQL Server beyond an ER diagram](#design-sql-server-beyond-an-er-diagram)
- [Design NoSQL with explicit guarantees](#design-nosql-with-explicit-guarantees)
- [Govern multiple stores and evolution](#govern-multiple-stores-and-evolution)
- [Deliver a data decision and evidence](#deliver-a-data-decision-and-evidence)
- [Official evidence](#official-evidence)

## Start with the workload and invariants

Inventory entities/aggregates, relationships, authoritative owners, operations,
query/filter/sort/join patterns, expected and peak rates, size/growth/retention,
tenant boundaries, skew and hot keys. Identify atomic invariants, accepted
staleness, read-your-writes needs, conflict behavior and recovery targets.
Compare workload evidence, operations and lifecycle cost rather than slogans
such as NoSQL is faster, SQL cannot scale, or flexible schema means no schema.

| Store/model | Suitable questions | Design obligations |
| --- | --- | --- |
| Relational SQL Server | Related transactions, constraints, joins, reporting and established operations | Keys, normal form, atomic boundary, constraints, indexes, isolation and query workload |
| Document, e.g. MongoDB | Aggregate-shaped access, variable document structure, bounded embedded data | Embed vs reference, document growth, indexes, validation/versioning, cross-document invariants |
| Key/value, e.g. Redis | Lookup/cache/session or purpose-specific state with explicit guarantees | Key scope, expiry/eviction, memory, persistence/failover, rebuild and authority |
| Wide-column/time-series | High write rates or time/key-oriented access at evidenced scale | Partition/bucket design, hot spots, ordering, retention/compaction and query limitations |
| Search/vector index | Search relevance or similarity retrieval beyond primary store needs | Source authority, indexing lag, ACL filtering, deletes/rebuild, embedding/version quality if used |
| Graph | Repeated relationship traversals not efficiently met by existing data model | Traversal depth, updates/constraints, scale and additional operating cost |

Keep examples as technology families until exact products, editions, support,
regional availability and license are verified. Search, graph, vector or time-series
needs do not automatically require a new database; assess existing supported
SQL Server capabilities first. Do not assume one engine exposes every feature.

## Design SQL Server beyond an ER diagram

For depth use [SQL Server design/concurrency](sql-server-design-concurrency.md),
[performance/capacity](sql-server-performance-capacity.md) and
[security/recovery/ApsaraDB](sql-server-security-resilience.md).


Specify logical-to-physical mapping, primary/foreign/unique/check constraints,
nullability, decimal precision, collation/Arabic search, temporal semantics and
history/deletion rules. Normalization protects ownership; denormalize only for
an identified access path with a named update/reconciliation mechanism.

Design clustered/nonclustered, filtered, covering or columnstore indexes only
where workload and edition support warrant them. Relate key order, include
columns and filtered predicates to actual queries, cardinality and write cost.
Review execution plans, statistics, parameter sensitivity, sargability, sort/spill,
logical reads and lock waits. No index-for-every-column or NOLOCK-as-performance-fix.

Define isolation and concurrency per operation: lost update, write skew, phantom,
uniqueness race and deadlock handling. A row version guards updates to a row;
cross-row invariants need their own atomic design. Snapshot reads do not remove
all write conflicts. Do not share one ORM context across concurrent operations.

Separate connection pooling from database capacity. Plan query timeout, bounded
batch/backfill, keyset pagination, blocking and cancellation. For replicas verify
lag and read routing; read-after-write may need the authoritative primary.

For on-premises versus ApsaraDB verify instance/edition capabilities, permissions,
SQL Agent/CDC/HA/backup support and network latency. Define full/differential/log
recovery as applicable to the actual configuration, encryption/key recovery,
restore evidence and RPO/RTO. Replication/HA is not a substitute for backups.

## Design NoSQL with explicit guarantees

Choose partition/shard key using access locality, cardinality, growth and skew;
show scatter/gather cost, rebalancing, tenant hot spots and cross-partition work.
Define per-operation atomicity, read/write durability, consistency/session model
and failure behavior for the actual product/topology. Do not use CAP as a
blanket permanent choice of only two properties or promise product-independent ACID.

For document data bound arrays/document growth, explain embedding vs references,
version the schema and validate critical fields. State how concurrent updates
match an expected version and what protects uniqueness. In MongoDB single-document
atomicity does not automatically make a multi-document business action atomic;
check transaction support, deployment and costs for the chosen design.

For Redis separate disposable cache from authoritative state, TTL from exact
business expiry, and acknowledged write from demonstrated failover durability.
Do not treat eviction-prone state as an audit ledger or deduplication record
without an explicit durability/recovery contract. Link the caching guide.

## Govern multiple stores and evolution

Assign one source of truth per fact. Use a durable change mechanism such as an
outbox or supported CDC when propagating committed state; avoid uncoordinated
SQL-plus-NoSQL dual writes. Define checkpoint, ordering, deduplication, deletes,
schema evolution, reconciliation, rebuild and acceptable projection lag.

Preserve row/document/tenant authorization in search, caches, analytics and
exports; UI filtering is insufficient. Define retention/deletion propagation,
audit visibility, credential isolation and secret/key ownership for every copy.

Design expand/backfill/validate/switch/contract migration with old/new clients,
recoverable checkpoints, constraints and rollback limits. Include data volume,
quality checks and write authority during transition; restoring one store while
others retain newer effects requires reconciliation, not blind replay.

## Deliver a data decision and evidence

Produce a workload-to-store matrix, conceptual/logical model, key/partition/index
rationale, transaction and consistency contracts, data lifecycle and operations
plan. Compare SQL-only with any proposed additional store, naming the benefit,
new failure modes, team/hosting cost, exit path and decision status. Define a
representative race, skewed load, lost response, failover/restore and migration
verification for the implementer; do not claim measured throughput from a diagram.

## Official evidence

Inspected 2026-10-05; recheck product/version details:
- [SQL Server index design](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide)
- [EF Core performance](https://learn.microsoft.com/en-us/ef/core/performance/)
- [MongoDB data modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [MongoDB atomicity and transactions](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/)
Use the exact product's official docs for other models; these sources do not
establish a NoSQL deployment or purchase at EF.
