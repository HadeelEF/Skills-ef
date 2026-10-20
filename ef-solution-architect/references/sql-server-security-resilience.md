# SQL Server security, availability and lifecycle design

Design and review controls, topology and evidence for the DBA/operations team.
Do not change permissions, encryption, backups, HA or live infrastructure under
this architect profile. SQL Server on premises and ApsaraDB require separate
capability evidence; neither changes EF's application hosting track.

## Contents

- [Separate protection goals](#separate-protection-goals)
- [Design HA and DR separately](#design-ha-and-dr-separately)
- [Design recoverability, not only backup schedules](#design-recoverability-not-only-backup-schedules)
- [Compare on-premises and ApsaraDB explicitly](#compare-on-premises-and-apsaradb-explicitly)
- [Migration and release readiness](#migration-and-release-readiness)
- [Official evidence](#official-evidence)

## Separate protection goals

| Goal | Design and evidence |
| --- | --- |
| Authentication and authorization | Least-privilege application identity, separate migration/admin identity, schema/object permissions and verified identity mode |
| Tenant/resource isolation | Application authorization plus database constraints/RLS where appropriate; privileged paths, exports and integration identities |
| Transport confidentiality | Validated TLS certificate/hostname, driver compatibility and rotation; avoid disabling certificate validation as a standard fix |
| At-rest protection | TDE/storage/backup encryption scope and key recovery; not a substitute for permissions |
| Sensitive-column protection | Assess Always Encrypted or application encryption against query, key-custody and driver constraints; verify actual edition/version support |
| Audit and data lifecycle | Actor/action/correlation, privileged changes, retention, redaction and protected audit destination; masking is not an authorization boundary |

For RLS distinguish filter predicates from write-block predicates. If application
identity is supplied through session context, define trusted establishment on
each connection checkout and verified isolation/reset with pooling. Do not trust
a client-provided tenant ID or assume a privileged account cannot change the policy.
Review raw SQL, jobs, exports and support tools alongside ordinary application reads.

TDE protects database files at rest, not data legitimately returned to a caller.
Design backup/recovery of certificates, private keys and required protectors;
recovery on another host requires the applicable keys. Managed-service key custody
and export/restore rules need separate evidence. Do not expose keys in design docs.

## Design HA and DR separately

Compare the actual failure domain and edition: standalone with recovery, FCI,
Availability Groups, log shipping or a supported managed-service HA/DR option.
Explain instance versus database scope, storage dependencies, read scaling,
manual/automatic failover and operating cost. Do not label any pair of VMs HA.

For Windows AGs validate cluster/quorum, listener/DNS, replica placement and
supported failover conditions. Synchronous commit trades latency for protection
under required synchronization/health conditions; asynchronous replication can
lose recent data on forced failover. An HA/read replica is not a backup. Define
read routing/lag and application's reconnect, retry and ambiguous commit behavior.

Specify RTO/RPO for each failure: node, storage, zone/site, logical corruption,
accidental deletion and credential/key loss. Include detection, decision, promotion,
client recovery and business verification. Fence the former writer, reconcile
possible data loss and define failback. Review dependencies such as logins/SIDs,
Agent jobs, credentials, linked services, keys and cross-database consistency;
do not assume every instance object follows a database failover automatically.

## Design recoverability, not only backup schedules

Map recovery model to full/differential/log backups and retention as applicable.
Show recoverable chain/point-in-time coverage, required media, off-site/isolated
copies, encryption keys, bandwidth and restore capacity. Full recovery mode alone
does not provide log backups or a demonstrated RPO. Copy-only and differential
base choices must preserve the intended restore strategy.

A backup success or RESTORE VERIFYONLY result does not prove usable business
recovery. Require a timed isolated restore, appropriate integrity checks, keys,
application login/permissions and representative business reconciliation. Include
files, external effects, outbox/inbox and downstream projections in recovery order.
Do not assume a database rollback reverses payments or previously sent messages.

Specify DBA-owned integrity monitoring, restore drills, job/backup failures, space,
log reuse, lag and capacity alerts with owners. Prefer evidence-driven statistics
and index maintenance to nightly rebuild/shrink rituals. Integrity repair with
potential data loss is not the default response; escalate with preserved evidence
and recovery options. Define patch/CU testing, rollback limits and change windows.

## Compare on-premises and ApsaraDB explicitly

Build a verified matrix: SQL version/edition versus RDS product edition/tier,
Saudi contractual region, instance/storage limits, SQL Agent/CDC, CLR/linked-server/
OS access if required, permissions, replication/read replicas, backups/PITR,
restore import/export, encryption/key ownership, maintenance, monitoring and SLA.
Record each as supported with conditions, unsupported or unverified; an Alibaba
global feature page does not prove Saudi tenant availability or contract entitlement.

Translate on-premises administrator scripts into the provider's supported operating
model; do not assume sysadmin, filesystem or cluster control. Define customer vs
provider responsibilities and escalation, and validate .NET driver/TLS/connectivity.
Calculate full lifecycle cost including license terms, storage/backup/IO, standby,
egress, support and transition with sourced figures rather than invented prices.

## Migration and release readiness

Inventory schema/features/dependencies, collation, security, jobs, data volume and
downtime constraints before choosing backup/restore, replication/CDC or another
supported path. Plan assessment, rehearsal, initial load, delta catch-up, reconciliation,
writer switch, client compatibility and rollback versus forward repair. Lowering
compatibility level does not imply an engine downgrade or restore to an older engine.
Verify supported upgrade/downgrade paths and source/target service limitations.

## Official evidence

Inspected 2026-10-05; recheck exact version/edition/provider contract:
- [Availability Groups](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/overview-of-always-on-availability-groups-sql-server)
- [Backup overview](https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-overview-sql-server)
- [RESTORE VERIFYONLY](https://learn.microsoft.com/en-us/sql/t-sql/statements/restore-statements-verifyonly-transact-sql)
- [TDE](https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/transparent-data-encryption)
- [Row-level security](https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security)
- [ApsaraDB SQL Server limits](https://www.alibabacloud.com/help/en/rds/apsaradb-rds-for-sql-server/limits-of-apsaradb-rds-for-sql-server)
