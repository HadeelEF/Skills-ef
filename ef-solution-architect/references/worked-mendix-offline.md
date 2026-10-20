# Worked Mendix design: offline asset observations

**ILLUSTRATIVE EXAMPLE — synthetic scope, no actual EF implementation or executed
runtime proof.** This is a populated bounded SDD; it is not a substitute for full
LLD of additional modules requested in a real project.

## Contents

- [Requirements and architecture](#requirements-and-architecture)
- [Entity and access contracts](#entity-and-access-contracts)
- [Flow LLD](#flow-lld)
- [Failure and concurrency](#failure-and-concurrency)
- [Delivery and verification](#delivery-and-verification)

## Requirements and architecture

M1: a field user captures an observation and photographs offline, then submits.
M2: a supervisor can change asset state meanwhile; submission must not overwrite
that change. M3: another user's observations/files are inaccessible. M4: repeated
sync must not duplicate accepted evidence. M5: external asset registry owns the
asset identifier and reference facts; Mendix owns observations and their review.
Duration, file volume, device/OS, Studio Pro/runtime and hosting are unspecified.

Choose Mendix-supported native offline capability conditionally on actual device
and platform compatibility. Keep UI, domain, processing and review in Mendix.
Alternative Mendix PWA requires device/persistence evidence; neither choice adds
an independently built React Native/.NET application. A platform-native client
using React Native internally does not authorize a second application stack.

Modules: AssetReference consumes registry API; Observation captures drafts;
Submission receives/processes proposals; Review owns authoritative decisions;
Audit records business events. Module names are illustrative, not installed.
Registry/API gateway, if present, is external; its transport does not own review.

## Entity and access contracts

| Entity | Fields/ownership | Access and lifecycle |
| --- | --- | --- |
| AssetSnapshot | ExternalId string; RegistryVersion nullable; FetchedAt; selected reference fields | Server writes; scoped client read; never treated as current registry fact without freshness evidence |
| ObservationDraft | OperationId; AssetExternalId; ObservedCaseVersion; values; local timestamps | Assigned field user edits own local draft; server receipt ownership cannot be supplied as trusted client data |
| EvidenceDraft | Observation association; file; media type; size/hash proposal | Local file association and volume validated; server verifies files/content and ownership before acceptance |
| SubmissionRequest | OperationId; immutable payload/version; receipt state | Create/receive through authorized platform path; server controls processing fields; client cannot set Accepted |
| ReviewCase | AssetExternalId; business state/version; current decision | Authoritative server write only through review/application microflow contract; client offline sync cannot edit it |
| SubmissionResult | OperationId; Accepted/Conflict/Rejected; reason; server version/time | Server writes; scoped user reads; durable receipt is distinct from successful data transfer |

Define actual association ownership, member access, XPath restrictions and
module roles in project LLD. For transient entities, protect server population
and exposed members; do not assume XPath row rules exist for every entity type.
Page visibility and microflow Allowed roles do not replace server business
authorization. Specify Apply entity access and actual user/system context for
every published/queued entry. Revalidate assignment and review permission.

## Flow LLD

F1 Local_SaveDraft nanoflow validates required local values, commits local draft
and files, and shows Saved on device only after successful local persistence.
No assertion that data has reached the server; local device loss remains a risk.

F2 Submit_Observation reuses stable OperationId and sends committed local data.
Identity is established by the authenticated runtime, not an OwnerId payload.
The receive path creates a durable receipt before deleting the independent local
draft. Interrupted/partial files remain visibly incomplete, not accepted evidence.

F3 Process_Submission microflow loads current assignment/case and validates all
members, evidence and business preconditions. Compare the observed business
version, and enforce one winner atomically through a supported runtime mechanism
for the actual version. A compare-then-commit check alone is not sufficient.
Case mutation, accepted result and audit must share the intended transaction.
Queue scheduling/error handlers must not turn rolled-back work into a success.

F4 Resolve_Conflict displays current case and submitted proposal; a permitted
reviewer records a deliberate decision/reason against the current version.
Keep original evidence and history. Do not silently merge consequential state
by client timestamp or replace supervisor decisions with last-writer-wins.

F5 Registry_Refresh uses an explicit server API contract: external identity,
mapping/version, timeout, retry owner and freshness. Cache misses/outage preserve
draft capture; any decision requiring current registry facts remains pending with
an explanation. Neither a stale snapshot nor successful HTTP transport proves
business validation.

## Failure and concurrency

Operation uniqueness must use supported database-backed model enforcement and
document normalization/scope; the developer proves it with competing requests.
Same operation and same payload returns its result; changed payload is rejected.
Do not edit internal schema or use an in-memory cluster-wide lock assumption.
If the current runtime cannot prove the invariant, identify that specific blocker
and compatible options rather than silently importing a .NET service.

Offline synchronization has distinct concurrency semantics. The official
[optimistic-locking guide](https://docs.mendix.com/refguide/optimistic-locking/)
states offline uploads can bypass its conflict detection; verify target-version
behavior. Therefore only proposed changes sync from the client; authoritative
case fields are not client-writable through ordinary entity synchronization.

Define full/changed/selected synchronization deliberately, including deletes,
association dependencies, event behavior, role change and error recovery. Use
the platform's actual deletion channel; selected-object sync is not universal
delete propagation. Credential expiry/revocation at reconnect can reject a
submission; preserve recoverable local drafts under the authorized data policy.
Do not promise remote wipe while disconnected or equate server backups to
protection of unsynchronized local files.

## Delivery and verification

Select template/widgets/native builder/OS/runtime as one compatible set, without
permanent latest-version values. Validate local storage protection, account
switch, distribution/signing, server authentication and supporting license.
Maia/MCP capability and consumption are separate delivery choices, not runtime
requirements or automatic unlimited entitlements.

Trace M1 to F1/F2 persistence and interruption checks; M2 to F3/F4 competing
version checks; M3 to direct entity/file access under another principal; M4 to
parallel repeated requests and restart; M5 to registry outage/stale-data behavior.
Device/runtime implementers execute offline restart, partial upload, rejected
sync, active-case upgrade and old-client tests. This example supplies the design
contracts; exact compatibility, limits and operational evidence remain open.
