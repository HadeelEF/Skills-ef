# Mendix delivery, Windows operations and diagnostics

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Establish a reproducible compatibility baseline

Inventory Studio Pro/model format, Runtime patch, release/support track, MxBuild,
JDK for development, JRE for server, OS, Service Console, database engine/version,
license, modules/widgets, Java dependencies and web/native client toolchain.
Separate installed, candidate and recommended versions. Use exact-version release
notes and [system requirements](https://docs.mendix.com/refguide/system-requirements/),
not a timeless "latest" value. Treat LTS/MTS/monthly support and native support
as explicit selection inputs. Do not upgrade just to enable an AI convenience.

Use project version control and supported model comparison/merge tools. Check
uncommitted work and model conversion before opening with a newer Studio Pro.
Resolve model conflicts through a supported workflow; text conflict-marker
editing is not a general solution for binary/model units. Preserve a reversible
copy/branch and evidence of the pre-upgrade package/data state.

## Build once and promote deliberately

Use Studio Pro or version-matched [MxBuild](https://docs.mendix.com/refguide/mxbuild/)
for consistency validation and deployment packaging. Confirm target and command
flags from installed help/current docs; old command examples may use obsolete
Java paths. Record artifact identity, source revision and compatibility. Keep
environment endpoints, constants, runtime settings, credentials and licenses
out of shared source and substitute them through the actual deployment mechanism.

Design a proportionate pipeline: model checks → relevant tests → build/package →
test environment deployment → smoke/contract/security checks → authorized release.
Model validity, successful build, app startup and a working business journey
are separate evidence. Do not claim one proves all others. Use feature flags or
compatible changes when needed, and define rollback limits for schema changes.

## Operate the reported EF Windows deployment

Read [Windows deployment](https://docs.mendix.com/developerportal/deploy/deploy-mendix-on-microsoft-windows/).
The documented pattern uses Service Console plus the matching Mendix runtime
and Java; IIS/ARR/URL Rewrite can proxy HTTP. The .NET tooling prerequisite does
not make Mendix an ASP.NET app. Inspect EF's actual setup before producing a
runbook. Vendor examples naming older OS versions are not a current patch/support
recommendation for EF.

Define service account, directories/ACLs, database identity, TLS/certificates,
public hostname, trusted forwarded headers, request/file limits, timeouts,
startup/recovery, administrative ports and secret rotation. Separate service
health from database, storage and dependency health. Validate the configured
route from Apigee or portal to application origin and the return path.

For [Windows automation](https://docs.mendix.com/developerportal/deploy/automate-mendix-deployment-on-microsoft-windows/),
verify supported Service Console and PowerShell versions before generating
scripts; do not assume PowerShell 7 is interchangeable with documented 5.1
cmdlets. Discover installed command signatures, make paths explicit, handle
errors and provide a dry-run/validation mode where meaningful.

For HA prove runtime/license support, cluster membership, load-balancer/session
behavior, shared database and files, queue concurrency and scheduled-event
coordination. Adding a second VM is not proof of a supported cluster. Do not
import an Azure reference topology as a verified Alibaba deployment.

Back up database, file assets, deployment artifacts and necessary configuration
consistently; distinguish data restoration from redeploying an old package.
Rehearse restore and application validation against actual RPO/RTO requirements.
Assess migration locks, backfill duration, file compatibility and rollback data
loss before releasing schema changes. Never promise a schema downgrade works.

## Diagnose from measurements

Reproduce a slow user journey with realistic roles/data. Split latency across
browser rendering/data sources, microflows, database, queue and remote calls.
Inspect repeated association retrievals, unbounded lists, per-row integrations,
query plans/index suitability, long transactions, lock waits, connection pools,
JVM memory/GC, large files and retry amplification before increasing capacity.

Use supported logging, metrics, debugger and profiling tools available in the
actual environment. Change diagnostic levels narrowly and restore them after
investigation. Record baseline, changed variable, comparison and residual risk;
do not turn sample measurements into a production SLO claim. Add Redis only for
a proven cache boundary, with invalidation and cross-node correctness defined;
it does not replace Mendix persistence or automatically fix slow model queries.

## Choose independent verification

Use the compatible [Unit Testing module](https://docs.mendix.com/appstore/modules/unit-testing/)
for suitable microflow/Java tests if available. Isolate fixture data, cleanup,
side effects and concurrent test runs; keep test endpoints/access appropriately
restricted. Do not install a module or change production test settings merely
to describe a test strategy.

Test security through real user/service contexts and direct entry paths, not
only privileged unit-test calls. Add targeted browser tests for page flows and
contract tests for API mappings; use runtime concurrency/restart tests for
transaction and delivery guarantees. Test native/offline behavior in its actual
client. Select risk-based coverage, not a mandatory huge suite for every edit.
Report exact environment/version, scenario, expected/observed outcome and evidence.
