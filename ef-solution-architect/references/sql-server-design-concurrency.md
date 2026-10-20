# SQL Server data design and transaction architecture

Use for logical/physical database design, .NET persistence boundaries and design
review. Specify contracts and verification for developers/DBAs; do not execute
DDL/DML, migrations or operational configuration under the architect profile.

## Establish the exact target

Record engine version/build/CU, edition, database compatibility level, collation,
recovery model, database options, provider and deployment. Distinguish engine
upgrade from compatibility-level change. Verify support/licensing per capability;
an example for Azure SQL or another SQL Server edition is not proof of EF support.
Preserve .NET/React/Windows-IIS and SQL Server baseline. Do not modify Mendix or
SharePoint-owned schemas or impose custom schema/migration rules on those platforms.

## Own the logical and physical model

Define module/schema ownership, aggregates, keys, relationships, cardinality,
optional values, unique/check/foreign-key constraints, lifecycle and business
history. Physical schemas are namespaces/permission boundaries, not automatically
independent deployments or transactions. Enforce tenant-inclusive references and
uniqueness where necessary; a tenant column alone does not create isolation.

Choose natural versus surrogate keys and clustered key separately. Evaluate key
width, insert locality, fragmentation, contention and downstream indexes; neither
GUID nor sequential integer is universally best. IDENTITY/SEQUENCE may have gaps
and must not silently implement a legally controlled gapless business number.
rowversion is a concurrency token, not a date, ordering guarantee across systems
or audit trail. Stable command identifiers have a different deduplication purpose.

Choose bounded string lengths and Unicode/collation deliberately for Arabic,
comparison and search. Define decimal precision/scale and rounding; do not use
floating point for financial equality. Map date/time/offset and business timezone
separately; a timestamp with an offset does not encode future timezone rules.
Align .NET mappings and API serialization, including large IDs and null semantics.

Specify soft-delete visibility, uniqueness, referential behavior, retention and
legal hold. Temporal history is not by itself a complete who/why audit record.
Version JSON contracts and promote repeatedly queried/constrained properties when
needed; verify JSON indexing, full-text languages, spatial, graph, vector or
in-memory features for the actual version/edition rather than adopting by novelty.

## Express transaction and concurrency guarantees

For every write, state the business invariant, atomic records, expected version,
permission scope, lock/isolation strategy, retry boundary and external effects.
A pre-check then INSERT is not uniqueness enforcement; use an authoritative
constraint and defined conflict response. Guard budgets/quotas spanning rows with
an atomic aggregate update or an appropriate transaction/locking design.

Distinguish READ COMMITTED locking from RCSI statement snapshots and SNAPSHOT
transaction snapshots. Row-versioned reads do not make every business invariant
serializable. Assess range protection, write conflicts, lock escalation, blocking
and version-store growth; verify storage behavior for the release and Accelerated Database Recovery (ADR) setting.
Keep transactions short and avoid user interaction or remote HTTP inside locks.
NOLOCK permits inconsistent reads and is not a correctness-preserving tuning rule.

Specify deterministic resource ordering and bounded retry of an entire rolled-back
unit after a deadlock, with idempotency for side effects. Distinguish deadlock,
command timeout and response loss after commit. Review actual deadlock graphs and
blocking chains; do not add hints or change database isolation as a universal fix.

## Design T-SQL and .NET boundaries

Select EF Core, reviewed parameterized SQL/Dapper or stored procedures according
to query needs, ownership and release coupling. Stored procedures are not inherently
faster or secure; dynamic SQL still needs parameters and identifier allowlists.
Prefer set-based operations where appropriate; assess CTE/window functions,
temporary tables, table variables/TVPs, batch size and estimates for actual volume.
Avoid hidden side effects and row-by-row triggers; any trigger must handle multirow
operations, transaction scope, recursion and observability explicitly.

Specify TRY/CATCH, XACT_STATE, XACT_ABORT and error/rollback semantics for relevant
T-SQL transaction boundaries; do not assume every error aborts every transaction.
Avoid treating nested BEGIN TRAN as independent subtransactions. Choose one owner
for EF/Dapper connection/transaction and retry execution strategy. Preserve the
client's original concurrency condition in the write, not a newly loaded version.

Persist business change, deduplication result and outbox atomically where required.
A committed transaction plus lost response is an unknown client outcome, not proof
of rollback. Define status lookup/replay and retention of command results. Keep
long exports/imports bounded and restartable with validation and reconciliation.

## Deliver evidence and safe evolution

Produce an ERD/data dictionary, invariant-to-constraint/transaction map and critical
write sequences. Require representative simultaneous updates, duplicate requests,
rollback/error paths, tenant boundary and old-client scenarios from implementers.
Design expand/backfill/validate/contract with schema drift detection, restartable
checkpoints, compatibility window and rollback limits. A migration tool or DACPAC
plan needs review for data loss and locking; never auto-apply changes on every host.

## Official starting points

Inspected 2026-10-05; recheck the selected release:
- [Transaction locking and row versioning](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide)
- [SQL Server guides](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-guides)
Use current T-SQL, EF provider and feature documentation before prescribing exact
syntax, compatibility levels or product-dependent options.
