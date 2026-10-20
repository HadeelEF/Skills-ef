# SharePoint on-premises detailed solution design

Use with the SharePoint portals reference for full HLD/LLD or consequential
reviews. Preserve the SharePoint project track and platform-owned databases.

## Contents

- [Platform evidence](#establish-platform-evidence)
- [Information and content model](#design-information-and-content)
- [Publication and access](#design-publication-and-access)
- [Search](#design-search-as-a-derived-view)
- [Extensions and integration](#specify-supported-extensions-and-integration)
- [Operations and recovery](#design-operations-and-recovery)
- [Evidence sources](#official-evidence)

## Establish platform evidence

Inventory product/build/patch, farm and SQL topology, web applications/zones,
site collections/templates, service applications, managed accounts, identity,
search, workflow dependencies, custom packages and licensed capabilities.
Keep external portal and intranet trust boundaries explicit; do not assume they
share a farm or that a site collection boundary substitutes for farm isolation.

Create a compatibility tuple covering SharePoint build/features, Windows/SQL/
.NET Framework, SPFx, generator, Node/TypeScript/React, packages and browser
requirements. Use the exact applicable release documentation. Where a generic
guide and build-specific release note differ, record the difference and verify
the target build's feature enablement before selecting the toolchain.
Distinguish supported, merely demonstrated, unsupported and unverified.

Old build tooling can require isolation and an accepted remediation plan.
Do not install latest standalone React into a constrained SPFx component, infer
Online capability on Server, or switch to a standalone app to bypass a gap.

## Design information and content

Define site/web-application boundaries by access, publication, ownership,
retention, scale and operating responsibility. Specify content types, site
columns, taxonomy, lists/libraries, required metadata, stable identifiers,
document templates, version history, lifecycle and language variants.

For each list/library detail column internal name/type/required/default/unique
behavior, indexed query paths, lookup/cardinality constraints, file policy,
versioning, approval and permission inheritance. Budget item count, file size,
versions, retention, search volume and growth from supplied requirements.
Design bounded indexed views and paging; do not present raising a threshold as
the universal answer to inefficient queries or unsupported volume.

Define URL stability, navigation, redirect policy and content ownership. Arabic
and English content may have distinct approval and translation state. A change
to one language must not accidentally publish an unreviewed version in another.
Do not confuse audience targeting/navigation visibility with authorization.

## Design publication and access

Use the platform's actual version/approval model. Specify author, reviewer,
publisher, reader and administrative responsibilities; define draft visibility,
submit/reject/approve/revise/withdraw and who may approve which version.
Document what readers see while an already published item has a new pending
version. Native approval versus a richer workflow is an explicit fit decision;
verify the supported workflow runtime and license before promising automation.

Model permissions through supported groups and inheritance. Define exceptions,
unique-permission growth and review ownership. Cover direct item/file URLs,
REST/CSOM, search/snippets/previews, browser/shared cache and exports. A custom
client cannot enforce separation of duties against direct API calls by itself;
where stricter policy cannot be enforced natively, specify a supported server
extension/workflow or surface a scoped capability gap.

For concurrent edits use the supported resource version/ETag contract and
conflict handling. Do not issue unconditional overwrites by habit. An approval
must refer to the reviewed version, not whichever edit happens to be latest.
Check checkout/coauthoring implications for the selected client and workflow.

For public content separate allowed anonymous publication from private authoring
and administration. Configure identity/zones/URLs with the farm owner; check
reverse proxy, certificates, cookie scope and logout. Never assume a generic
OIDC provider or external cache understands SharePoint permissions automatically.

## Design search as a derived view

Specify content sources, crawl identity/access, scope, schedules, crawl rules,
managed/crawled properties, result sources, refiners and language behavior.
Search is eventually updated; it is not the authoritative source for approval,
deletion, access revocation or transaction decisions. Define indexing/freshness
targets and evidence independently of successful content writes.

Preserve user-context security trimming; assess the actual protocol/source and
ACL capture. A privileged crawler is not permission to return its results to
every user. Custom search adapters and caches must preserve caller identity,
scope and permission changes. Evaluate titles/snippets as sensitive outputs,
not only whether clicking the document later returns access denied.

For strict visibility requirements specify security tests around revoke,
withdraw, delete, group changes, crawl lag and cached results. If the selected
search path cannot meet the required bound, choose a supported authoritative
query for that journey or record the gap. Do not promise instantaneous index
or cache convergence without measured evidence.

## Specify supported extensions and integration

Prefer configuration/native capability where sufficient. Select SPFx or another
supported extension only for an identified gap. Record extension point, host
page, data contract, identity, permissions, compatibility, packaging/catalog,
configuration, safe failure, telemetry and rollback. Supported React within
SPFx remains part of SharePoint; an independent React app is a different track.

Use supported REST/CSOM/search APIs with explicit field mapping, version/ETag,
paging, retry, identity and external-system authority. A remote API failure
must not show a transaction as completed. Define durable pending status and
reconciliation only through supported platform mechanisms. No SQL writes to
SharePoint content/configuration databases; no credentials in client code.

For migration include content versions, permissions/groups, metadata/taxonomy,
URLs/links, attachments, workflow state, search configuration and audit needs.
Define authoritative writer, freeze/delta strategy, supported migration path,
counts/hashes/permissions reconciliation and forward-repair or rollback limits.

## Design operations and recovery

Map web front ends, application/search/service roles and SQL to failure domains.
Inventory service applications/databases, accounts/keys/certificates, custom
solutions and configuration required to restore user journeys. Do not equate
content database backup with a complete farm/service recovery strategy.

Specify supported backup/recovery and search rebuild/restore strategy, ordered
dependencies, target capacity, access verification and timed recovery criteria.
Separate patching, version upgrade and content migration; plan target-like
rehearsal, compatible package rollout and post-change publication/search checks.
Zero-downtime patching is conditional on supported topology/procedure and evidence.

Deliver site/content model, permission matrix, publication state/version design,
search contract, extension compatibility and recovery/migration packet. The
SharePoint solution template organizes a full design, not a mandatory new file.

## Official evidence

Opened or located on 2026-10-05; recheck actual build and applicability:

- [SPFx compatibility](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
  distinguishes platform and library compatibility.
- [Server development guide](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-2019-and-subscription-edition-support)
  contains 2019-specific examples; do not apply every example as an SE maximum.
- [SE 23H1 release](https://learn.microsoft.com/en-us/sharepoint/what-s-new/new-and-improved-features-in-sharepoint-server-subscription-edition-23h1-release)
  is a build-specific feature source; compare with the farm's installed state.
- [Versioning and approval](https://learn.microsoft.com/en-us/sharepoint/governance/versioning-content-approval-and-check-out-planning)
  is the starting point for publication behavior; verify the selected library settings.
- [Server search security](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/custom-security-trimming-for-search-in-sharepoint-server)
  explains query identity and crawled security information.
- [Server crawling](https://learn.microsoft.com/en-us/sharepoint/search/manage-crawling)
  and [crawl rules](https://learn.microsoft.com/en-us/sharepoint/search/manage-crawl-rules)
  help verify source/protocol behavior.

These sources support specific platform facts, not a certification of an EF farm.
