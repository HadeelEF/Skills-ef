# Enterprise integration patterns and contracts

## Choose from business semantics

Define authoritative systems, consumers, data classification, latency/freshness,
volume, ordering, delivery, transactional boundaries, change ownership and
recovery first. Choose transport and platform afterward. An integration catalog
must identify a business owner, technical owner and runbook, not just endpoints.

| Pattern | Suitable need | Contract and design checks |
| --- | --- | --- |
| REST/HTTP APIs | Interoperable synchronous commands/queries | Resource/action semantics, OpenAPI, versioning, errors, pagination, idempotency and concurrency |
| SOAP services | Existing WSDL/XSD contracts or required WS-* interoperability | Binding, namespaces, faults, XML/schema limits, supported security and version compatibility |
| OData | Controlled queryable resources and platform interoperability | Metadata, query permissions/limits, paging, expansion and filtering cost |
| GraphQL | Consumer-specific aggregation | Resolver authorization, query complexity/depth, batching, schema evolution and cache boundaries |
| gRPC | Typed internal calls/streaming with compatible clients | Protobuf evolution, deadlines/cancellation, HTTP/2 and proxy/IIS support; browser adaptation where needed |
| Webhooks | Provider-triggered callbacks | Signature verification, timestamp/replay window, durable receipt, duplicates and subscription lifecycle |
| Queues/pub-sub/streams | Decoupling, work distribution or replayable facts | Durable boundary, partition/order, acknowledgments, retention, consumer groups and recovery |
| ETL/ELT/batch/CDC | Data movement and analytical/operational copies | Source authority, transformations, checkpoints, deletes, drift, reconciliation and freshness |
| File/SFTP/EDI/B2B | Partner/legacy exchanges and bulk transfer | Schema, encoding, checksums, manifests, partial-file protection, receipt/acknowledgment and replay |
| WebSocket/SignalR/SSE | Live user updates or streaming responses | Connection/auth lifecycle, reconnect, missed updates, fan-out, scale-out and gateway timeouts |
| Database integration | Authorized direct data access or replication | Supported access, least privilege, read/write ownership, isolation and schema coupling |
| Legacy adapter/RPA | Constrained systems without suitable interfaces | Supported alternatives first, brittle interaction risk, credential boundaries and reconciliation |

Do not treat all these mechanisms as installed at EF. Reuse Apigee for appropriate
API governance and Informatica for its licensed integration services; verify
connectors/protocol support. A gateway, ESB/iPaaS, broker and ETL runtime serve
different roles. WSO2 Identity Server is not WSO2 API Manager or Micro Integrator.

## Build an explicit contract

Specify endpoint/topic/file reference, schema/version, producer/consumer,
identity and scopes, classification, keys, timestamps/timezone, units, nullable
fields, precision, lifecycle, error/fault taxonomy and compatibility policy.
Keep a minimal canonical vocabulary where it removes actual mapping conflicts;
do not create an organization-wide universal data model for one interface.

For synchronous requests define timeouts and remaining caller budget. Retry
only retryable outcomes and preserve command identity; do not retry validation,
authorization or non-idempotent effects blindly. Handle lost responses after
successful commits. Define rate limits, quotas, backpressure and bulkheads
with end-to-end ownership across caller, gateway, adapter and target.

For events distinguish command, fact, notification and integration projection.
Use stable event IDs, type/schema version, aggregate key, occurrence/publication
time and correlation/causation when useful. Agree compatibility and consumer
migration; deployment order cannot be assumed across organizational boundaries.

## Protect data integrity

Choose snapshot, incremental, CDC or event-derived updates deliberately. Define
watermarks/checkpoints, transaction consistency, delete/tombstone handling,
late/out-of-order records, resynchronization and schema drift. Reconcile counts,
keys and business totals appropriate to the data; a successful job status alone
does not prove completeness or business correctness.

Identify which transformation owns a rule and avoid inconsistent copies in
Apigee, Informatica, Mendix and .NET. Use anti-corruption adapters for external
models, and preserve provenance. Write-through integration to another product's
database requires a supported, explicitly authorized contract; never bypass
SharePoint or Mendix APIs just because SQL access is available.

## Design partner and file exchanges

For files define UTF/locale/delimiter, naming/versioning, atomic publication or
ready markers, duplicate identity, checksum, partial acceptance, quarantine,
encryption and retention. For partner protocols verify agreed standards and
receipts such as EDI acknowledgments/AS2 MDNs where applicable; a transport
receipt does not necessarily mean the business transaction was accepted.

Authenticate webhooks and bound replay/size/rate. Persist receipt before
asynchronous processing when durability is required; acknowledge based on the
contract. Verify whether acknowledgment deadlines constrain validation work.
Protect outbound adapters from untrusted destinations, XML/JSON abuse and
credential disclosure. Use mTLS/message protection where the threat model and
partner contract require it; do not prescribe protocols from branding alone.

## Verify and operate

Use contract/schema and backward-compatibility checks, provider sandboxes or
authorized mocks, and integration tests against representative endpoints.
Test retries, duplicate delivery, partial batches, schema change, poison data,
link loss, expiry and degraded providers. Prove business outcome and repair.

Instrument lag/freshness, failure class, queue age, throughput, reconciliation
and trace correlation without exposing sensitive payloads. Define replay
authorization, audit, deduplication horizon and compensating action. Produce
a contract catalog, flow/security matrix and operational recovery design.
