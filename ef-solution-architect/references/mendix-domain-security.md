# Mendix domain models, authorization and data integrity

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Contents

- [Model contract](#produce-an-executable-model-contract)
- [Security paths](#make-security-explicit-for-every-path)
- [Integrity and concurrency](#enforce-business-invariants-and-concurrency)
- [Queries and migration](#query-and-migration-discipline)

## Produce an executable model contract

Read the existing model and conventions before proposing artifacts. Decompose
by business capability and ownership; a Studio Pro module is not an independently
deployed microservice. Define the module's public microflows, entities and pages,
and avoid circular dependencies or a shared module containing every business rule.
Keep Marketplace modules separable from application-specific adaptations.

For each entity specify qualified name, purpose, persistence kind, attributes and
types, defaults, validation, association ownership/cardinality, indexes, delete
behavior, access rules and lifecycle. Use Decimal for exact business amounts;
specify currency, rounding, date/time localization and integration serialization.
Use stable business/external identifiers instead of exposing runtime IDs as API
contracts. Make naming prefixes a project convention, not a Mendix requirement.

Choose persistable entities for authoritative stored data, non-persistable objects
for transient interaction/mapping, external entities for remote OData data, and
supported view entities for projections. Record where each is usable and editable.
Do not confuse object association ownership with the business owner of a record.
Avoid generalization merely to share a few attributes; examine security,
query cost, lifecycle and supported mapping behavior before using inheritance.

## Make security explicit for every path

Use Production security for production designs; do not resolve model errors by
disabling security. Map app user roles to module roles, then define page,
microflow, entity and member access. Review the combined privileges of users
holding multiple roles: granting a narrower role does not cancel broader access.

Treat the following as distinct controls:

| Control | Required reasoning |
| --- | --- |
| Page access/conditional visibility | Navigation and presentation; does not authorize a mutation |
| Microflow Allowed roles | Client entry control; submicroflow calls do not repeat that role check |
| Apply entity access | Explicitly record setting and effective context on every relevant microflow; do not assume enabled |
| Entity access rules | Create/delete, attribute/association read/write and supported row constraints |
| Business authorization | Actor, organization, assignment, record state and requested transition, checked server-side |
| Integration/queue/system context | Identify actual principal and privileged paths; do not infer interactive-user restrictions |

Read [Microflow properties](https://docs.mendix.com/refguide/microflow/) for
the actual version. If a trusted subflow intentionally bypasses entity access,
keep its exposure narrow and validate authorization in every reachable entry
path, including published services and background actions. A caller-supplied
Account, Department or record ID is not proof of the caller's authority.

Review [Access rules](https://docs.mendix.com/refguide/access-rules/): non-persistable
entities cannot have XPath row constraints, and generalization XPath constraints
are not automatically inherited by specializations. Owner constraints require
the corresponding owner storage. Review all grant paths, not one selected rule.
Validate any proposed XPath against actual association names and model types.
For transient DTOs, constrain which data is populated and returned server-side.

XPath row constraints do not restrict object creation. Set ownership/organization
and initial state server-side, and protect association members that could change
the authorization scope. Review App Security user-management permissions too:
System.User has platform-enforced access inherited by its specializations; a
department XPath on Account alone may not restrict broadly granted user management.

Protect attachments through both metadata and download/upload operations. Specify
file ownership, size/type validation, scanning integration when required, retention
and deletion. Test direct file access and associated-record substitution. Keep
secrets out of client-visible constants, entities and generated pages.

## Enforce business invariants and concurrency

Enumerate invariants independently of the UI: valid transitions, required values,
uniqueness, cross-entity totals and rules around deletion. Separate field feedback
from authoritative server validation. Review event-handler coverage and Commit
With events settings; do not assume client validation or an existence lookup is
a concurrency guarantee.

The current [validation rules](https://docs.mendix.com/refguide/validation-rules/)
document database-backed uniqueness. Verify runtime/database settings and
existing-data compatibility before adding a constraint. For a compound business
key, design an unambiguous canonical key if appropriate, validate normalization
and collisions, and enforce it through supported model mechanisms. Do not create
unmanaged indexes/constraints by editing Mendix internal schema as a default fix.

Use [optimistic locking](https://docs.mendix.com/refguide/optimistic-locking/)
when supported and appropriate; inspect whether it is enabled. The 2026-10-05
reference describes beta from 11.5 and GA from 11.11, using MxObjectVersion.
Do not prescribe EF Core rowversion annotations inside a Mendix model. On a
conflict, re-read current state, reauthorize and revalidate before bounded retry
or user resolution. Never blindly replay an approval or overwrite all fields.
Offline synchronization is a separate conflict boundary; see the mobile guide.

For strict single-winner decisions, specify the actual database/runtime mechanism
and prove it with two concurrent requests. A retrieve-then-change sequence,
hidden button, or per-process flag alone is insufficient. Do not describe a
microflow concurrency option as a cluster-wide lock without product evidence.

## Query and migration discipline

Use bounded, sorted retrievals and fit indexes to measured filters/joins.
Distinguish retrieval from database, association and existing object memory.
For [OQL](https://docs.mendix.com/refguide/oql/), do not assume entity access is
automatically applied: design and test explicit authorization for the selected
API/query path. Check version-specific syntax, view support and bulk-operation
effects on events/validation before using them. Never concatenate untrusted input.

Plan model changes against existing data: duplicate cleanup, backfill, mandatory
attributes, associations, data volume and downstream consumers. Keep migration
restartable where needed and validate counts, invariants and permissions after it.
Report reviewed model, proposed changes and executed checks separately.
