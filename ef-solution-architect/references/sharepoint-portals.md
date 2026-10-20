# SharePoint Subscription Edition portals

## Start with the actual on-premises product

EF reports SharePoint Server Subscription Edition on premises for its external
portal, https://ef.gov.sa/, and intranet. A public URL does not reveal the
farm build, topology, authentication, patch state or customizations. Do not
assume external portal and intranet share a farm, identity boundary or license.
Inventory the installed build, supported update state, farms/web applications,
zones, site collections, content, solutions, service applications and owners.

Treat SharePoint Server SE, SharePoint Online and older on-premises versions as
distinct targets. Verify support for each proposed capability on the exact
product/build. Online-only Graph, app models or services are not automatically
available on premises. Separate the farm's supported Windows/.NET Framework/
SQL dependencies from the latest .NET stack of independent EF applications.

## Delineate content and transactional services

Map public content, news, documents, navigation, search, intranet collaboration
and transactional e-services to their authoritative platform. Determine whether
SharePoint presents a link, supported component, content API or full experience
for a service; keep transaction rules and data ownership explicit. Do not turn
SharePoint lists into the transaction system merely because the portal uses it.

Keep a SharePoint project complete on the on-premises SharePoint platform.
Compare supported native features and extensions by UX, accessibility/RTL, SSO,
authoring, operations and lifecycle cost. Do not introduce standalone React,
Next.js, .NET or mobile components. Identify platform limitations honestly;
only an explicit user policy change permits a different or mixed project track.

Define URLs, navigation, content publication/approval, audiences, language,
SEO/search, document permissions and analytics/privacy boundaries. Preserve
links, redirects and ownership during incremental modernization. If an iframe
is proposed, evaluate CSP/frame policies, authentication/cookie behavior,
accessibility and interaction constraints rather than assuming seamless SSO.

## Respect extension and frontend compatibility

Consult Microsoft's current SPFx on-premises compatibility matrix before
selecting SPFx, Node.js, TypeScript or React versions. SharePoint SE supports
a constrained SPFx toolchain; the latest standalone React/Next.js stack cannot
be assumed compatible inside its web parts. Record the exact supported set,
build-tool isolation, security implications and packaging/deployment approach.

Supported SPFx components remain inside the SharePoint extension model even
when its compatible tooling uses React. This does not permit a separate React
frontend or require the latest standalone React version. An existing external
system may be integrated or linked through a defined contract; a new standalone
application is outside this project track. Do not upgrade farm dependencies to
match a frontend library or present embedding as a way around the platform rule.

## Integrate through supported contracts

Use supported REST, CSOM, search or other documented APIs for the exact task
and edition. Verify user/application authentication and least-privilege
permissions; SharePoint Server authentication differs from Online assumptions.
Never write directly to SharePoint content/configuration databases as an
integration strategy. Use supported administration/maintenance mechanisms.

Account for paging, thresholds, throttling, concurrency/version checks, list
metadata, document versions, check-in/out, files and permission inheritance.
Specify incremental extraction/change detection and deletion handling before
promising synchronization. Preserve classification, resource authorization
and security trimming in search, caches and exported documents.

For Apigee, Informatica or application adapters distinguish the API identity,
network path and system-of-record rules. A database connector must not bypass
SharePoint application contracts. Version mappings and reconciliation must
remain owned and observable during migration/coexistence.

## Identity, exposure and farm operations

Design public anonymous content, authenticated services, intranet and farm
administration as explicit access boundaries. Verify the actual authentication
mode, claims mappings, supported trusted identity configuration and exact
build requirements for federation/OIDC; do not prescribe a generic provider
configuration as universally supported by SharePoint.

For reverse proxies and load balancers validate external URLs, zones/alternate
access mappings where applicable, issuer/redirect URLs, certificates, headers,
cookies and logout behavior. Keep privileged administration and nonpublic
documents outside the anonymous publication path. Avoid public caching of
personalized data or permission-sensitive documents.

Document the real farm/service topology, service accounts, databases, search,
backups, update procedure, capacity and recovery ownership. Verify supported
patch/upgrade sequencing and database compatibility. Test content/database
restore and relevant search/service reconstruction; a VM snapshot alone does
not establish application-consistent recovery. Do not claim uninterrupted
patching or disaster recovery without the necessary design and evidence.

## Deliver and verify

Provide content/channel boundaries, customization/runtime compatibility,
identity/API contracts, deployment/operations responsibilities and a phased
modernization path. Test publication and draft isolation, document permissions,
search trimming, anonymous/authenticated paths, SSO, links/redirects, RTL,
accessibility and a representative release/update. Label what was inspected,
what was executed and what remains conditional on farm access.
