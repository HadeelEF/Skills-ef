# Environment Fund technology context

Source: Fahad's direct descriptions on **2026-10-05, Asia/Riyadh**, including
the subsequent clarification of IIS, Windows-hosted Mendix and SharePoint SE.
The project-track policy below is an explicit user instruction. Infrastructure
entries remain user-reported, not inspected deployments or vendor certification.
Show conflicts between existing implementations and policy; existing code or a
supplier proposal does not override the policy. A later explicit user instruction
can change the track for a project.

## Contents

- [Mandatory project policy](#mandatory-project-policy)
- [Reported baseline](#reported-baseline)
- [Ambiguous names](#interpret-ambiguous-names-carefully)
- [Requested expertise](#requested-expertise-not-an-installed-platform-inventory)
- [Material unknowns](#facts-to-resolve-when-material)
- [Maintenance](#applying-and-maintaining-the-baseline)

## Mandatory project policy

- Custom development: .NET/ASP.NET Core backend and APIs; React.js frontend;
  Microsoft SQL Server on premises or SQL Server through Alibaba ApsaraDB;
  Windows Server with IIS. Do not substitute PostgreSQL/MySQL, a Node/Python
  backend, Linux hosting or a cloud hosting platform because it is fashionable.
- Subsequent clarification on the same date requests deeper SQL and NoSQL expertise.
  Include justified NoSQL adjunct/alternative proposals in architecture assessments;
  SQL Server remains the established default. Record a new store's business need,
  source-of-truth role, consistency/recovery, hosting/support and decision status.
  Expertise or a proposal does not establish adoption, purchase or deployment.
  This extension does not change the Mendix/SharePoint or .NET/React hosting tracks.
- Add React Native or React.js PWA only for a demonstrated project need. Keep
  business rules and data authority in the .NET/SQL Server backend. For PWA,
  specify service-worker update behavior, private-cache cleanup, offline read
  versus write scope, conflict handling and session expiry. For mobile, define
  device capabilities, offline scope and compatibility with older installed apps.
- React SPA/static assets on IIS are the web baseline. Earlier Next.js interest
  is expertise context, not an automatic choice. Use it only when explicitly
  requested or already part of an explicitly retained design; verify its IIS/
  Windows runtime implications and keep business backend/API ownership in .NET.
- A Mendix project is complete within Mendix, including its UI, model, logic,
  workflow and supported channels. Do not add an independent .NET service,
  React/Next.js frontend or React Native app as part of that project's delivery.
- A SharePoint on-premises project is complete within the supported SharePoint
  platform and extension model. Do not turn it into a headless content store for
  a new standalone React/.NET application or add an independently hosted channel.
- Platform-native extensions and required runtimes remain part of their platform;
  they are not permission to insert a separate application stack. Verify support
  before specifying an extension; explain any unavoidable platform limitation.
- Existing enterprise systems and shared services may integrate through supported
  contracts (including Apigee/Informatica when relevant). Show them outside the
  application's delivery boundary. Integration is not authority to outsource new
  core application logic to another stack or duplicate ownership across stacks.
- State the selected track in the SAD and handoff. Compare in-track solutions.
  If the user explicitly requests platform selection, compare whole-project
  tracks. A mixed application requires an explicit user change of policy;
  document the boundary and consequences if that change is actually requested.


## Reported baseline

| Area | User-reported fact | Design treatment |
| --- | --- | --- |
| Primary cloud | Alibaba Cloud in Saudi Arabia | Default EF hosting context; exact account, region code, zones and service availability require project evidence |
| API management | Google Apigee consumed as SaaS on Google Cloud | Existing platform; verify edition/runtime and northbound/southbound topology |
| Apigee connectivity | IPsec between Alibaba Cloud and the Google Cloud environment associated with Apigee | Preserve this reported connectivity; discover gateway endpoints, route domains and actual application paths |
| Data integration | Informatica cloud SaaS on Google Cloud, called "IDC" by the user | Record as Informatica cloud; IDMC is the likely umbrella name, while CDI/service entitlement needs confirmation |
| Informatica connectivity | IPsec between Alibaba Cloud and the Google Cloud environment associated with Informatica | A second reported connectivity relationship, not proof of two distinct physical tunnels or shared infrastructure |
| Informatica runtime | Secure Agent on Windows Server VM(s) in Alibaba Cloud | Distinguish local integration execution from SaaS management; count, sizing, groups and HA are unknown |
| Backend | .NET for custom projects, latest supported compatible versions | Stable supported compatible releases; inspect ASP.NET Core, SDK/runtime, ORM/provider and hosting together |
| Database | Microsoft SQL Server on premises or SQL Server on Alibaba ApsaraDB for custom projects | Engine policy is SQL Server; actual cloud product, edition, version and availability require evidence |
| Web | React.js for custom projects; React PWA when needed | Next.js is conditional under project policy; do not introduce a Node backend |
| Web styling | Tailwind CSS | Default for applicable web work; verify version/toolchain and EF tokens |
| Mobile | React Native when a custom project needs mobile | Mendix and SharePoint retain their own platform track; verify native/runtime compatibility |
| Development model | Fahad reports that all his development is through AI | Supply architecture/design contracts and acceptance evidence for implementing agents; this skill remains the architect/designer |
| Application hosting | Windows Server with IIS for .NET and React.js | Default reported hosting; verify OS/IIS/Hosting Bundle/build and deployment configuration |
| Low-code | Mendix hosted on Windows Server | Existing deployment; verify Mendix Runtime/Studio Pro/Java/Service Console/database compatibility and actual IIS role |
| External portal | SharePoint Server Subscription Edition on premises; https://ef.gov.sa/ | User-reported platform; public page does not establish farm version, topology or authentication |
| Intranet | SharePoint Server Subscription Edition on premises | URL, topology, patch level, authentication and customizations remain unspecified |

## Interpret ambiguous names carefully

- Use **ApsaraDB** spelling. The required engine for custom projects is SQL
  Server. Verify the exact ApsaraDB SQL Server product/instance before treating
  it as deployed. Do not replace it with MySQL, PostgreSQL or invent an edition. Verify Saudi regional/contract
  availability and managed-service features before committing the design.
- Distinguish Informatica **IDMC** (platform), **Cloud Data Integration/CDI**
  (a service), and **Secure Agent** (runtime). Preserve the user's original
  "IDC" wording in the source record; do not claim the exact purchased service.
- A hybrid/multi-cloud environment does not establish use of the product
  **Apigee hybrid**. The user reports managed/SaaS Apigee on Google Cloud.
- A Windows Secure Agent is not a generic site-to-site VPN gateway, and not
  the whole Informatica SaaS platform running inside Alibaba Cloud.
- React.js on IIS can mean serving built static files. Next.js server features
  require a compatible server runtime and managed process; do not infer an
  existing Node service or deployment model from the IIS statement.
- Mendix on Windows does not mean its application is an ASP.NET Core process.
  Respect the current platform and verify the actual supported configuration.
- SharePoint SE is not SharePoint Online; select SPFx/React/Node tooling from
  its compatibility matrix instead of applying the latest standalone stack.

## Requested expertise, not an installed-platform inventory

The user requested deep expertise in Keycloak, WSO2 Identity Server and likely
Duende IdentityServer (written "dunde"), Redis, background services and
event-driven architecture. No specific identity provider, Redis installation,
message broker or job scheduler was confirmed. Treat these as options to
evaluate; do not list them as deployed or mandatory. Confirm ambiguous product
names only when necessary for a product-specific decision or action.

## Facts to resolve when material

| Unknown | Why it can affect architecture | Evidence to seek |
| --- | --- | --- |
| GCP runtime and SaaS regions | Latency, residency, availability and egress | Tenant configuration, contract, service documentation |
| IPsec endpoints, redundancy and routes | Reachability, failover and actual traffic path | Sanitized network diagram, routing/DNS/firewall configuration |
| On-premises ↔ Alibaba connectivity | Access to the on-premises SQL Server option | Network-owner confirmation and approved topology |
| Actual ApsaraDB SQL Server product, version and edition | Policy-to-instance alignment, SQL compatibility, recovery, CDC and privileges | Instance metadata or approved procurement configuration |
| Informatica service/connectors/agent group | Data processing location, compatibility and recovery | Runtime/connector configuration and entitlements |
| Identity provider and emergency access | Session and authorization architecture | Project requirements; do not assume an identity policy from another project |
| Windows/IIS deployment details | Runtime lifecycle, identities, reverse proxy and Next.js server support | OS/IIS versions, Hosting Bundle, service/process and deployment configuration |
| Mendix Windows configuration | Upgrade support and operational boundaries | Runtime/Studio Pro/Java/Service Console/database versions and license |
| SharePoint SE farm and customizations | SPFx/toolchain compatibility, identity and publishing | Build/patch level, farm architecture, app catalog and customization inventory |
| Data classification and lifecycle | Handling, logs, backup and retention | Project owner and current EF policy |
| Required NFR targets | Capacity and resilience design | Business/operations owners and measured workloads |

Do not ask for every unknown at once. Resolve only those affecting the current
decision; use conditional options and named follow-up owners for the rest.
Never infer all processing, logs, metadata, backups or support access remain
in Saudi Arabia solely because the application runs in Alibaba Saudi Arabia.

## Applying and maintaining the baseline

- Apply the mandatory selected project track. Treat shared integration and
  infrastructure platforms as reusable capabilities, not mandatory dependencies
  for every application. A local CRUD system need not invoke Informatica for
  every transaction or route all internal calls through Apigee.
- Do not import specific project rules such as Entra, local break-glass users,
  VPN→PAM, or on-prem-only hosting without current task evidence.
- Capture new facts with date, source, scope and status in the project's
  architecture. Update this reusable profile only when the user asks to
  change the skill or explicitly authorizes a profile update.
- Keep secrets, live IP addresses, tenant IDs and credentials out of this
  reusable skill; use references to authorized project configuration.
