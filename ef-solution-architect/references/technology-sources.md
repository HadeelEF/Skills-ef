# Technical sources and version policy

## Contents

- [Verification](#verification-procedure)
- [Environment and architecture sources](#architecture-sources-inspected-when-this-skill-was-created)
- [Platform-depth sources](#expert-depth-sources-inspected-for-this-update)
- [Application engineering sources](#application-engineering-and-ai-delivery-sources)
- [Additional starting points](#additional-official-starting-points-to-open-when-relevant)

Use official documentation for capabilities, support, regional availability,
limits, licensing and current versions. A reference here is a starting point,
not a promise the same facts will hold at the next invocation. Do not freeze
"latest" versions or live prices inside this reusable skill.

## Verification procedure

1. Inspect the installed version, edition, provider, environment and lockfiles.
2. Open official release/support/compatibility pages for the actual products.
3. Distinguish latest stable, preview, supported/LTS, installed and recommended.
4. Check the whole compatibility set and hosting: SDK/runtime/framework,
   ORM/provider/database/ANCM, Node/Next/React, mobile/native SDKs,
   Mendix/Java/modules and SharePoint SE/SPFx/toolchain dependencies.
5. Check provider region, tenant entitlements and relevant feature limits.
6. Record URL, check date, finding, applicability and uncertainty with the decision.
7. Make a recommendation without silently upgrading existing applications.

If live verification fails, use evidence from the repository and make the
recommendation conditional. Never infer support or exact package APIs from
memory when it materially affects implementation.

## Architecture sources inspected when this skill was created

Inspection date: **2026-10-05, Asia/Riyadh**. Recheck for project decisions.

| Area | Official source | Scope and caution |
| --- | --- | --- |
| Managed Apigee private target connectivity | [Southbound networking patterns](https://docs.cloud.google.com/apigee/docs/api-platform/architecture/southbound-networking-patterns-endpoints) | Shows a supported PSC-based pattern; does not establish EF's selected topology or applicability to Apigee hybrid/Edge |
| Site-to-site transport | [Google Cloud VPN overview](https://docs.cloud.google.com/network-connectivity/docs/vpn/concepts/overview) | Describes Cloud VPN/IPsec; does not prove EF endpoint configuration or every SaaS flow uses a tunnel |
| Informatica runtime | [Secure Agents](https://onlinehelp.informatica.com/IICS/prod/SDI/en/qq-sdi-rte/Secure_Agents.html) | Agent runs integration work and contacts sources/targets; evaluate service-specific behavior and placement |
| SQL Server managed option | [ApsaraDB RDS for SQL Server overview](https://www.alibabacloud.com/help/en/rds/apsaradb-rds-for-sql-server/overview-of-apsaradb-rds-for-sql-server) | Product exists; EF engine selection, Saudi availability and tier features remain to be verified |
| .NET lifecycle | [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core) | Verify support at selection; do not permanently encode a latest release |
| Next.js lifecycle | [Next.js support policy](https://nextjs.org/support-policy) | Check support and installed framework/runtime compatibility |
| Mendix deployment | [Deployment documentation](https://docs.mendix.com/developerportal/deploy/) | Select the actual deployment model, supported version and infrastructure |

## Expert-depth sources inspected for this update

Inspection date: **2026-10-05, Asia/Riyadh**. These establish documentation
entry points and product distinctions, not EF's installed configuration or
future support. Reopen relevant pages and release/support notes for decisions.

| Area | Official source | Decision supported |
| --- | --- | --- |
| ASP.NET Core on IIS | [IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/) | Hosting Bundle/ANCM, process and deployment configuration; select the documentation view for the target version |
| Hosted background tasks | [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services) | Host lifecycle and background service behavior; not durable delivery by itself |
| Independent Windows worker | [Windows Service](https://learn.microsoft.com/en-us/dotnet/core/extensions/windows-service) | Supported Worker Service hosting outside the web process |
| Hybrid caching | [HybridCache](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid) | API and cache behavior; inspect invalidation and coordination scope |
| React APIs and compiler | [React reference](https://react.dev/reference/react), [React Compiler](https://react.dev/learn/react-compiler) | Current APIs, optimization and adoption guidance, subject to framework compatibility |
| Next.js runtime | [Self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Runtime/reverse-proxy/deployment and multi-instance considerations |
| React Native runtime | [Architecture](https://reactnative.dev/architecture/landing-page) | Native/runtime architecture; check release and library support separately |
| Keycloak operation | [Reverse proxy](https://www.keycloak.org/server/reverseproxy), [configuration](https://www.keycloak.org/server/all-config) | Hostname, proxy and server configuration boundaries |
| WSO2 Identity Server | [Product documentation](https://is.docs.wso2.com/en/latest/) | Identity capabilities; choose exact release and distinguish other WSO2 products |
| Duende | [IdentityServer](https://docs.duendesoftware.com/identityserver/), [licensing](https://docs.duendesoftware.com/general/licensing/) | Framework responsibilities and current production-license eligibility/conditions |
| Redis messaging | [Pub/Sub](https://redis.io/docs/latest/develop/pubsub/) | Delivery semantics and suitability for disposable notifications |
| Mendix Windows deployment | [Windows deployment](https://docs.mendix.com/developerportal/deploy/deploy-mendix-on-microsoft-windows/) | Runtime/Service Console and reverse-proxy deployment; verify current lifecycle beyond minimum-version examples |
| Mendix developments | [Release notes](https://docs.mendix.com/releasenotes/), [feature calendar](https://docs.mendix.com/releasenotes/feature-release-calendar/) | Feature maturity, version and adoption planning |
| Mendix task execution | [Task Queue](https://docs.mendix.com/refguide/task-queue/) | Task persistence, transaction/retry and runtime-specific behavior |
| Mendix AI capabilities | [Maia Make](https://docs.mendix.com/refguide/maia-make/), [Maia MCP Client](https://docs.mendix.com/refguide/maia-mcp/), [Studio Pro MCP Server](https://docs.mendix.com/refguide/studio-pro-mcp-server/) | Different assistance/tool directions; verify availability and actual access |
| SharePoint frontend | [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility) | Supported on-premises SPFx/React/Node/TypeScript set differs from latest standalone applications |
| SharePoint authentication | [Subscription Edition 24H2 changes](https://learn.microsoft.com/en-us/sharepoint/what-s-new/new-and-improved-features-in-sharepoint-server-subscription-edition-24h2-release) | Example of build-dependent OIDC capabilities; verify installed build and selected provider documentation |

## Application engineering and AI-delivery sources

Inspected **2026-10-05, Asia/Riyadh**. Recheck changing tooling/version behavior;
the AI delivery workflow is an engineering synthesis, not a vendor certification.

| Area | Official source | Application |
| --- | --- | --- |
| .NET application patterns | [Common architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures) | Dependency and deployment trade-offs; source location does not prescribe Azure for EF |
| API generation | [ASP.NET Core OpenAPI](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview) | Match generated schemas and packages to the actual framework version |
| Contract specification | [OpenAPI specification](https://spec.openapis.org/oas/latest.html) | Schema/operation semantics and toolchain support; do not assume all generators support the newest spec |
| HTTP contracts | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html) | Methods, conditional requests and Problem Details |
| API threat coverage | [OWASP API Security](https://api-security.owasp.org/) | Threat-informed authorization and misuse cases; not a compliance certificate |
| Database concurrency | [EF concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) | Tokens and conflict handling in the actual update |
| Database test validity | [EF testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy) | Distinguish real provider behavior from fakes/doubles |
| React state and effects | [State structure](https://react.dev/learn/choosing-the-state-structure), [effect guidance](https://react.dev/learn/you-might-not-need-an-effect) | State ownership, derivation and synchronization decisions |
| Mobile verification | [React Native testing](https://reactnative.dev/docs/testing-overview) | JavaScript/component tests and native/device evidence cover different boundaries |
| Mobile update compatibility | [Expo runtime versions](https://docs.expo.dev/eas-update/runtime-versions/) | If selected, match updates to their native runtime and deployment configuration |

## Additional official starting points to open when relevant

These are navigation starting points, not pre-verified claims about a version.

- Alibaba Cloud and the actual Saudi service provider/contract documentation:
  https://www.alibabacloud.com/help/
- Informatica product, connector, Secure Agent and release documentation:
  https://docs.informatica.com/
- SQL Server and ASP.NET Core documentation:
  https://learn.microsoft.com/sql/ and https://learn.microsoft.com/aspnet/core/
- React: https://react.dev/versions
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs/installation
- React Native releases and supported versions: https://reactnative.dev/versions
- Mendix release notes and requirements: https://docs.mendix.com/releasenotes/
- Node.js lifecycle: https://nodejs.org/en/about/previous-releases
- Redis product/support, Streams and client documentation:
  https://redis.io/docs/latest/
- SharePoint Server support, farm operation and security:
  https://learn.microsoft.com/en-us/sharepoint/sharepoint-server
- Standards-based identity and integration: IETF RFCs at
  https://www.rfc-editor.org/ and OpenID specifications at https://openid.net/specs/
- For brokers, schedulers, connectors and native libraries, use the selected
  vendor/project's official documentation and support policy; no default product
  is established by this skill.

Use current official policy sources for legal/regulatory questions, and
organizational policy/contract evidence for EF-specific obligations. Neither
a regional product page nor a cloud deployment proves full data residency,
compliance, recovery capability or contractual SLA for the complete solution.
