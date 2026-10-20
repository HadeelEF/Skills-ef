# Web API design and implementation contracts

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Contents

- [Contract ownership](#choose-protocol-and-contract-ownership)
- [Operation definition](#define-an-operation-completely)
- [Wire types](#preserve-data-semantics-across-net-and-typescript)
- [Concurrency and retries](#make-concurrent-and-repeated-requests-safe)
- [Collections and asynchronous interactions](#bound-collections-uploads-and-asynchronous-interactions)
- [Security and evolution](#security-evolution-and-verification)

## Choose protocol and contract ownership

Start from consumers, interactions, latency, compatibility and authorization.
Use REST/HTTP, gRPC, GraphQL, webhooks or streaming where they fit; keep SOAP and
other legacy contracts behind explicit adapters. A BFF adapts a channel without
becoming another source of business rules. Define which calls pass through
Apigee and why; gateway policy and backend resource authorization have distinct
responsibilities. Verify actual network/proxy/protocol support.

Select design-first or code-first OpenAPI as the authoritative workflow for a
given API. Keep schema, implementation, documentation and generated C#/TypeScript
clients in agreement. Choose an OpenAPI version the full toolchain supports,
not simply the newest specification. Record generator/configuration and stable
operation IDs; regenerate instead of hand-editing generated output. Review a
schema diff and consumer build for consequential contract changes.

## Define an operation completely

Specify method/path, request/query/header schema, authentication, action/resource
permissions, state preconditions, response schemas/statuses, errors, side effects,
limits, caching, concurrency, idempotency and observable acceptance examples.
Distinguish command DTOs, query/read models, persistence entities and internal
domain types. Reject or ignore unauthorized writable properties deliberately;
never bind client-supplied owner, tenant or privileged state into entity updates.

Follow HTTP semantics and the established API convention. GET must not perform
requested business mutations. Use meaningful creation/accepted/no-content/error
responses, including resource/operation locations when appropriate. A 202 response
needs durable acceptance and a progress/result contract for critical work; an
empty 200 must not conceal a rejected command. Define validation, conflict and
conditional-request errors consistently rather than forcing all errors into 500.

Use stable machine-readable error codes and Problem Details where selected.
Separate localized user messages from protocol codes; include safe correlation
data and relevant field errors without exposing stack traces, queries or secrets.
Define how web and mobile render validation, authentication, forbidden, not-found,
conflict, rate-limit, retryable outage and ambiguous outcomes.

## Preserve data semantics across .NET and TypeScript

Specify required versus optional versus null, omission in partial updates,
enum evolution/unknown values, naming/casing, length, format and bounds. Agree
how JSON carries large integer identifiers and precise decimal money; avoid
silent JavaScript numeric rounding. Carry currency with amounts when required.
Separate instant timestamps, business dates and local scheduled time/timezone.
Use canonical wire values independent of Arabic display/digit/date formatting.

Keep runtime validation at trust boundaries; generated static types alone cannot
validate remote JSON. Coordinate DTO/schema changes, serializers, mapping,
client adapters, forms and database constraints. Sensitive fields should not
leak through broad entity serialization or client-side filtering.

## Make concurrent and repeated requests safe

For conditional updates define ETag/If-Match or an explicit version contract and
check it atomically with the data mutation. A pre-read version comparison alone
does not prevent a later race. Map missing/mismatched preconditions consistently
and return enough authorized data for client conflict resolution.

For important commands define idempotency-key scope, request fingerprint,
retention, atomic ownership, in-progress handling and replay result. Reusing a
key with different content must have defined behavior. Preserve the command ID
across transport retries; a new user intent gets a new ID. Coordinate the durable
result with the business transaction; external effects need their own contract.
Do not blindly retry non-idempotent operations after an ambiguous timeout.

## Bound collections, uploads and asynchronous interactions

Define stable ordering with tie-breakers, maximum page size, allowed filters and
sort fields, cursor/offset semantics and changing-data behavior. Cursor/keyset
pagination is useful when the workload warrants it; do not claim a snapshot
across changing data without a mechanism. Bound expensive includes/search and
tenant/user-specific resource consumption.

For files define size/type/count limits, streamed or staged upload, malware
quarantine where required, private object ownership, authorized download and
orphan cleanup. A successful file upload and SQL commit are separate events.
For bulk jobs specify per-item results and partial failure. For SignalR/SSE/push
specify subscription authorization, missed-event/reconnect recovery and the
authoritative state endpoint. Notifications are not durable state by default.

## Security, evolution and verification

Review object/action/property authorization, mass assignment, injection, SSRF,
resource exhaustion and sensitive business-flow abuse for the actual exposure.
CORS does not authorize a caller; cookie-authenticated mutation needs suitable
CSRF defense. Propagate timeouts/correlation and control retry amplification
across client, BFF, gateway, API and downstream integrations.

Define backward compatibility, deprecation and migration for actual consumers,
especially older mobile binaries. Adding required fields, narrowing ranges,
changing nullability/enums or tightening authorization can break consumers even
without a URL change. Use expand/migrate/contract and capability negotiation
where justified. Coordinate gateway transformations with schema and error behavior.

Validate representative requests against the schema and implementation; verify
resource isolation, concurrency, duplicate submissions and old clients. Generate
and compile clients when used. Contract validation cannot replace tests of
authorization, persistence or business semantics. Use official OpenAPI, HTTP,
Problem Details and selected framework documentation at the target version.
