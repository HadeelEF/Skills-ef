# Mendix integration and supported extensions

## Contents

- [Establish ownership before selecting a connector](#establish-ownership-before-selecting-a-connector)
- [Implement REST and SOAP as explicit contracts](#implement-rest-and-soap-as-explicit-contracts)
- [Use external entities with their actual semantics](#use-external-entities-with-their-actual-semantics)
- [Engineer resilience and audit](#engineer-resilience-and-audit)
- [Extend only through verified interfaces](#extend-only-through-verified-interfaces)


Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Establish ownership before selecting a connector

Identify system of record, direction, operation, latency/volume, identity and
consistency. Choose synchronous APIs, asynchronous operation records/events,
scheduled/batch integration or remote entity access deliberately. Keep business
decisions in their owning capability and external schema changes behind adapters.
Use the shared API/integration references for wire contracts and failure semantics.

In EF, map Apigee's API policy boundary, the actual Mendix runtime, .NET services,
Informatica integration runtime/Secure Agent and target data stores separately.
Record exact DNS, TLS, proxy and network route for each connection. Hosting
Mendix on Alibaba does not prove a SaaS call traverses IPsec. Do not redirect
existing Mendix persistence into ApsaraDB without engine/support evidence.

## Implement REST and SOAP as explicit contracts

For a consumed API define service/operation, endpoint configuration, method,
headers, principal, request/response schema, mapping documents, HTTP statuses,
timeout budget, pagination, retry conditions and correlation. Test null versus
missing, numeric precision, date/time, enum evolution, large payloads and malformed
responses. Avoid unbounded calls inside retrieval loops or business transactions.

For a [published REST service](https://docs.mendix.com/refguide/published-rest-services/),
specify operation microflow, parameter/response mapping, authentication mode,
Allowed roles, entity access, business authorization and public error contract.
Inspect the generated OpenAPI document and actual response; do not assume all
OpenAPI constructs are supported in either direction. Avoid exposing the whole
domain model as a convenient public CRUD surface.

Do not assume an Apigee-validated token automatically creates a Mendix user
context. Define gateway-to-runtime authentication, token validation or trusted
identity propagation and prevent direct-origin bypass. Map Keycloak/WSO2/Duende
through a supported, compatible OIDC/SAML module when chosen; verify issuer,
audience, subject mapping, provisioning, role mapping, session/logout and browser
versus API behavior. Never derive privilege directly from untrusted headers.

For SOAP, inspect WSDL/XSD versions, namespaces, nullability, endpoint, credentials,
certificates, required WS-* features and faults. Use supported mappings and
confirm interoperability with an actual sample, not just successful import.
For files/batches, specify format, encoding, arrival/completeness, deduplication,
quarantine and reconciliation. Pin connector/module dependencies and inspect
transitive Java libraries before introducing a Marketplace component.

## Use external entities with their actual semantics

Read [external entities](https://docs.mendix.com/refguide/external-entities/)
and [consumed OData requirements](https://docs.mendix.com/refguide/consumed-odata-service-requirements/).
Remote entities are not local persistence or an offline cache. Verify available
queries/actions, remote authorization, associations, stable keys and metadata
version. Use supported external-object operations; do not use ordinary Commit
as if the data were owned locally. Current docs exclude external entities from
native offline apps; design a deliberate local projection when needed.

Mendix supports a subset of OData behavior, so prove third-party OData fit with
representative filters, paging, errors and writes. Use an explicit REST adapter
when external-entity behavior does not fit. Catalog visibility/discovery does
not grant runtime access. Trace the actual publisher and consumer principals
and inspect [shared-dataset security](https://docs.mendix.com/refguide/security-shared-datasets/)
for the applicable release. Verify the authenticated user context used by the
publishing application rather than trusting catalog visibility or a header.

## Engineer resilience and audit

Define operation/message ID, deduplication scope and retention, retries with
bounded backoff, timeout ambiguity, poison handling and replay authorization.
Pair domain changes with a durable operation record where delivery must survive
restart. Use Task Queue for local execution when suitable, and an external
broker/orchestrator only for evidenced requirements. A database transaction
cannot make a remote API call atomic; avoid exactly-once claims.

Expose health and operational status without leaking sensitive payloads.
Correlate gateway, Mendix microflow, queue, external request and business record.
Sanitize logs and separate user-safe errors from restricted diagnostics. A trace
log level used for investigation is not a permanent production logging policy.

## Extend only through verified interfaces

Use Java actions for necessary server extensions and JavaScript actions/widgets
for supported client extensions. Declare parameters, result, context/security,
transaction ownership, library compatibility, error mapping and resource cleanup.
Keep custom logic in the generated action's supported user-code areas and inspect
regeneration behavior. Do not patch generated runtime internals or hand-edit
the .mpr/model database with SQL.

For Model/Platform SDK automation read the exact metamodel/API and restrictions
in [SDK introduction](https://docs.mendix.com/apidocs-mxsdk/mxsdk/sdk-intro/).
These SDKs support model automation but some model areas have write caveats;
an SDK symbol's existence does not prove a supported, valid generation path.
Use loaded units, supported versions, isolated changes and consistency/build
checks. Distinguish Studio Pro extension APIs, Model SDK, Platform SDK, runtime
Java APIs and client APIs; do not invent interchangeable methods between them.

Keep direct external database integration separate from Mendix's internal
persistence contract. A connector to a business database is not permission to
write Mendix runtime tables or bypass its validation/security/events.
