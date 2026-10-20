# Mendix microflows, nanoflows, workflows and durable work

## Contents

- [Specify a flow at activity level](#specify-a-flow-at-activity-level)
- [Reason about transactions precisely](#reason-about-transactions-precisely)
- [Implement background execution with runtime guarantees](#implement-background-execution-with-runtime-guarantees)
- [Engineer human workflows](#engineer-human-workflows)
- [Walk the failure path](#walk-the-failure-path)


Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Specify a flow at activity level

For focused technical design provide qualified document name, parameters,
return type, caller/context, Allowed roles, Apply entity access, activities,
expressions, branches, commits, error settings and outcomes. Distinguish runnable
Mendix expressions from pseudocode and verify identifiers against the model.
Use the flow-contract template; a box labelled "validate and save" is insufficient
when the user requests that depth of design.

Choose microflows for server orchestration and business changes, nanoflows for
client interaction/device/offline behavior, and workflows for durable long-lived
process coordination and human tasks. A nanoflow must not be the only policy
enforcement. According to [microflows and nanoflows](https://docs.mendix.com/refguide/microflows-and-nanoflows/),
nanoflows do not provide one overall database transaction; earlier successful
actions do not automatically roll back when a later action fails. Validate
expression, activity and platform availability instead of copying a microflow.

## Reason about transactions precisely

Read [Commit objects](https://docs.mendix.com/refguide/committing-objects/)
and [error handling](https://docs.mendix.com/refguide/error-handling-in-microflows/).
A Mendix Commit activity writes within a transaction; it does not itself mean
the enclosing database transaction has committed. Follow the full call chain,
savepoints and configured error paths. After database rollback, in-memory object
values/change tracking can differ from database state; recover using fresh state
instead of recommitting stale objects and assuming all changes are restored.

For each fallible activity select and justify Rollback, Custom with rollback,
Custom without rollback, or Continue. State whether the handler ends normally
or propagates an error. Do not swallow an error to show a successful save.
Define what survives failure, what is retried and how user feedback is produced.
Custom without rollback is not a general fix for transaction failures.

External email, payment, file transfer or API effects are not undone by database
rollback. Keep remote latency outside long-held business transactions where
possible. Use a durable pending-operation record and post-commit execution for
consequential effects; a commit event handler is not proof of after-transaction
delivery. Where synchronous integration is essential, specify ambiguity and
compensation instead of promising atomicity across systems.

## Implement background execution with runtime guarantees

Use [Task Queue](https://docs.mendix.com/refguide/task-queue/) for supported
asynchronous microflows/Java actions. The current reference states tasks become
eligible only when the scheduling transaction succeeds; entity parameters must
be committed persistable objects. Select thread scope (node or cluster) and
retry configuration deliberately. A failed node can cause a running task to be
executed again; protect external effects with stable idempotency and reconciliation.

Define queue purpose, task arguments, effective security context, throughput,
resource budget, transient/permanent error classification, retry ceiling,
operator visibility and replay procedure. Store operation status/correlation
when the business needs it; do not use queue internals as the entire audit model.
Reload and check operation state on execution. An external timeout can mean
"completed, response lost"; query status or retry with the same accepted key.
Without remote idempotency or reliable status lookup, require reconciliation
before risking duplicate consequential effects.

Distinguish persisted intent from a durable record of an attempted send. A
Sending flag written in the same transaction that later rolls back can disappear,
allowing a restarted task to repeat an external effect. If the design relies on
a pre-send claim, prove that it commits through a supported transaction boundary
before network I/O and cannot be reclaimed blindly after an ambiguous result.
A submicroflow or Commit activity alone does not prove transaction separation.
Without provider deduplication/status or a proven local dispatch contract, keep
ambiguous consequential sends in reconciliation rather than automatic replay.

Use scheduled events for periodic initiation or reconciliation with overlapping
runs and cluster behavior explicitly addressed. Do not implement durability with
an in-memory Java timer or an IIS process lifecycle assumption. Use supported
queue/runtime APIs and inspect version-specific signatures before writing code.

## Engineer human workflows

Define context entity, business state machine, start/cancel rules, user tasks,
target/assignment strategy, outcomes, deadlines, delegation and escalation only
from agreed requirements. Distinguish Workflow Commons UI/helpers from the engine.
Keep business history in an appropriate domain audit record; engine task data
may have its own cleanup lifecycle. Use supported engine operations, not direct
writes to hidden tables or arbitrary changes to engine-owned state.

Use [workflow security](https://docs.mendix.com/refguide/workflow-security/)
to align page access, context-entity access and eligible task users. At completion
recheck current task/record state, actor authority, separation-of-duties rules
if required, and concurrent decisions. Handle no-target-user, reassignment,
deactivated user and failed activity scenarios. A user seeing an inbox is not
proof they may perform every transition.

Read [workflow engine](https://docs.mendix.com/refguide/workflow-engine/) and
[workflow versioning](https://docs.mendix.com/refguide/workflow-versioning/) before
releasing changes to running instances. Mendix checks compatibility with the
new definition; do not assume all instances stay pinned to their starting model.
Inventory active instances and test modifications at their actual positions.
Choose compatible evolution, retained old/new documents or an explicit migration.
Do not restart or mark incompatible instances resolved blindly: assess repeated
side effects, skipped approvals and business history first.

## Walk the failure path

For an approval-to-notification slice, map: authorized request → current record
validation → state/audit/pending-operation persistence → queued processing →
remote result/reconciliation → user-visible status. This is a design pattern,
not a prebuilt module. Prove rejection of an unauthorized ID, double submission,
outer-flow rollback, node restart, response loss and obsolete workflow state.
Use real runtime checks when available; distinguish a reasoned walkthrough from
an executed test.
