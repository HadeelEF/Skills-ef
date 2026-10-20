# Integration, data and network design

## Separate traffic and responsibilities

Treat API management, integration processing, database traffic and platform
administration as distinct capabilities. Reuse Apigee and Informatica where
they fit the actual workload. Do not route SQL traffic through Apigee or
make an ETL pipeline part of every synchronous application transaction.

For each flow identify caller, destination, business purpose, direction,
protocol, payload classification, frequency/volume, authentication, response,
failure behavior and operational owner. Record an endpoint reference rather
than a secret. Separate logical intent from verified network connectivity.

## EF Apigee path

The reported baseline is managed Apigee in Google Cloud and IPsec connectivity
with Alibaba Cloud. Determine northbound client entry separately from
southbound backend access. Establish the actual Apigee edition, organization,
region and supported networking model before choosing a pattern.

A useful *candidate* southbound model is Apigee runtime → supported private
connectivity/proxy/load-balancing arrangement → routed cloud network → IPsec
→ Alibaba backend. Do not present any intermediary, PSC, peering or gateway
as deployed without evidence. Verify the current supported pattern and its
routing limits; a generic VPC diagram does not prove transit is supported.

Define API products/consumers, versioning, quotas, burst controls, correlation,
timeouts and target authentication. Keep business authorization and object
access checks in the application; gateway admission alone is insufficient.
Do not put database credentials or primary business persistence in proxies.
Specify behavior if Apigee, the tunnel, DNS, identity or the target fails.

## EF Informatica path

The user reports Informatica SaaS on Google Cloud and Secure Agent runtime
on Windows VM(s) in Alibaba Cloud. Model these separately:

| Flow | Design work |
| --- | --- |
| Secure Agent ↔ SaaS control/service endpoints | Determine actual initiation direction, required destinations, TLS/proxy behavior and transport path from product documentation and configuration |
| Secure Agent ↔ source | Connector capability, least privilege, filters, extraction mode and failure/restart semantics |
| Secure Agent ↔ target | Mapping, keys, validation, write mode, deduplication, reconciliation and recovery |
| Logs, metadata, samples or staging | Identify what leaves the runtime, where it persists and who can access it |

Secure Agent executes integration work and connects to source/target systems;
it is not simply a VPN connector. Its placement does not prove every data
item stays inside Alibaba. Connector/service behavior, source/target location,
temporary storage and diagnostics determine actual processing and exposure.

Honor the reported IPsec relationship while verifying whether individual
SaaS/control/data endpoints use it, internet egress or another approved path.
Do not draw a verified inbound SaaS-to-VM connection or prescribe firewall
ports from memory. Evaluate agent groups, concurrency, restart, resource
contention, maintenance and availability for the specific service; multiple
VMs alone do not prove transparent failover or exactly-once processing.

## Make network prerequisites explicit

For relevant links capture source/destination zones, ownership, endpoint
type, CIDRs or sanitized references, routing/BGP or static routes, return
paths, overlap, NAT, DNS, firewall/security groups, MTU/MSS, TLS termination,
certificate trust and redundancy. Leave configuration-specific values unknown
until supported; never open broad ports just to make a diagram plausible.

Distinguish VPN encryption, application TLS, identity and authorization.
An established IPsec tunnel does not establish DNS resolution, application
reachability, correct routing or resource permission. Test from the relevant
runtime toward the actual destination, then verify failover when in scope.

Record latency and egress implications of cloud-to-cloud calls. Co-locate
chatty operations when appropriate; consider batching, caching with a defined
staleness policy, or asynchronous work when the journey tolerates it. Do not
alter external network configuration without explicit authorization.

## Specify API and data contracts

For request/response define version, schema, validation, idempotency,
correlation, error semantics, pagination and compatibility. For asynchronous
messages define producer, durable boundary, key, event version, ordering,
delivery expectation, deduplication window, retries and poison-message repair.
For batch/CDC specify watermark/checkpoint, late data, deletes, schema drift,
reprocessing, consistency, schedule and reconciliation metrics.

Identify source-of-truth ownership before selecting a synchronization pattern.
Avoid uncontrolled dual writes and two-way synchronization without conflict
rules. Trace transformations, classification, lineage, retention and access
through staging and targets. Confirm connector support and licensing for CDC
and specific databases instead of assuming it from platform branding.

## Verify representative behavior

Produce a contract/flow matrix and a success/failure sequence. Verify routing,
name resolution, trust and authorization separately; then business outcomes.
Consider lost responses, duplicate delivery, a link outage during commit,
partial batches, agent restart, target throttling and stale analytics. State
recovery ownership and reconciliation, not merely "retry on failure".
