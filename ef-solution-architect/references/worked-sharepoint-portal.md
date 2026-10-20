# Worked SharePoint design: internal policy library

**ILLUSTRATIVE EXAMPLE — fictional content requirements, not a statement of an
EF farm's configuration, regulatory obligations or executed tests.**

## Contents

- [Requirements and decisions](#requirements-and-decisions)
- [Content and access LLD](#content-and-access-lld)
- [Publication operation contracts](#publication-operation-contracts)
- [Search and compatibility contracts](#search-and-compatibility-contracts)
- [Operations, migration and handoff](#operations-migration-and-handoff)

## Requirements and decisions

P1: employees read published policies; authors prepare revisions; approvers
approve a specific revision. P2: draft/unapproved content is not visible to
ordinary readers through pages, files, APIs, search or cache. P3: discover current
policies by classification and Arabic/English title. P4: retain version history
and recover the content service. Publication volume/retention/recovery targets
and actual SharePoint SE build are not supplied.

Select a native SharePoint document library with major/minor versioning and
content approval, conditional on validating the selected template/settings.
Native list/library views are the initial authoritative discovery path. Add a
supported SPFx presentation only for a proven UX gap; no standalone React or .NET
backend. Native content approval is suitable for this bounded review; complex
escalation or strict independent-approver policy would require separate fit and
supported enforcement design before claiming coverage.

HLD responsibilities: employee browser → SharePoint web application/site/library;
platform services own identity/content/search; SQL databases remain platform-owned.
Search is a derived discovery service. Farm, service and database administrators
have separate operating responsibilities, not imaginary isolation from all data.
Intranet identity is taken from the actual farm configuration, not assumed Entra.

## Content and access LLD

| Component | Populated design contract |
| --- | --- |
| Site collection | Internal policy publication boundary; inherit approved employee-read groups and explicitly scoped author/approver groups |
| PolicyDocument content type | PolicyId stable string; TitleAr/TitleEn text; Classification taxonomy; BusinessOwner person/group; EffectiveDate date; Language choice; source file; required fields validated before submission |
| Policy library | Major/minor versions, approval required, draft visibility restricted to eligible authors/approvers; history/retention values proposed only after owner confirms |
| Query paths | Bounded indexed filtering by classification/language/PolicyId, stable ordering and paging; final indexes and volume validated on target farm |
| Files and versions | Published version available to readers; draft and historical access follow verified settings; generated previews/thumbnails must be checked too |

Do not use an editable Status column as the security control. Map business
labels to the actual platform's moderation/version state. Define immutable
PolicyId independently from display titles and mutable URLs where necessary.
Each language revision has its own review status; publishing Arabic cannot
silently publish an unreviewed English revision.

Actors: Readers access approved content; Authors prepare/submit permitted drafts;
Approvers inspect and approve/reject the intended version. Administrative roles
remain controlled and audited. Record group membership ownership and changes.
Exceptional unique permissions need an explicit owner/scale assessment.

## Publication operation contracts

| Operation | Preconditions | Outcome/failure |
| --- | --- | --- |
| Create draft | Authorized author; required metadata | New minor draft; ordinary readers cannot retrieve unpublished file |
| Edit draft/revision | Resource access and supported current version/ETag | Save next draft version; stale edit receives conflict rather than unconditional overwrite |
| Submit | Draft complete; exact revision identified | Pending review; submission does not publish it |
| Approve/reject | Approver authorized for the current pending revision | Publish approved version or return rejected revision; concurrent later changes require rereview |
| Revise published policy | Authorized author | Readers retain the permitted published version while new draft is reviewed, subject to verified library configuration |
| Withdraw | Approved withdrawal policy and authorized owner | Remove availability through supported publication/permission mechanism; search/cache propagation and historical access explicitly verified |

Specify direct platform operations and identities in the real LLD. A custom
button cannot enforce independent approval if the same principal can bypass it
through REST or native UI. Do not claim strict separation of duties without a
server/platform enforcement mechanism and tests. If required, expand the scope
and choose a supported workflow/extension after version compatibility review.

## Search and compatibility contracts

Index only intended content sources with the approved crawl identity/protocol;
map title/language/classification fields to verified managed properties. Query
under the actual user's identity and preserve security information. Source ACL
capture, group changes and index freshness must be checked; privileged search
results must not be shared indiscriminately through a cache.

For P2 use direct library retrieval as authority. Expose full-text search only
after proving draft/title/snippet/preview isolation, including revise, withdraw,
revoke and index lag. If immediate metadata suppression cannot be guaranteed by
the search path, keep sensitive discovery on a supported authoritative query and
record the full-text limitation. A denied click alone does not prevent snippet leaks.

Actual build → supported SPFx/features → exact compatible React/TypeScript/Node
set → package/deployment evidence. Do not copy the latest Online framework.
When general Server and SE release pages differ, resolve build/feature scope
before selecting versions; do not assume a tutorial workaround is supported.
If legacy tools are unavoidable, the build owner assesses isolated tooling and
artifact integrity; this does not certify that unsupported components are safe.

## Operations, migration and handoff

Inventory content/service databases, packages, configuration, account/certificate
dependencies and search topology. Define supported backup/recovery plus search
rebuild/restore, order of dependencies and end-user verification. Recovery of one
content database alone is not the entire service recovery claim.

For migration reconcile files, hashes, version count, content types/taxonomy,
group mappings, permissions, links and approval states. Freeze/delta/writer switch
needs an owner and supported approach. Never write directly to content databases.
Release native configuration first; add an extension only after a target-farm
package/rollback rehearsal. Check RTL, keyboard, errors and long Arabic names.

Acceptance: P1 correct version for reader/author/approver; P2 direct URL, REST,
preview and search under unauthorized/draft cases; P3 bounded filtered queries
and correct Arabic/English metadata; P4 timed isolated restore with permission,
version/publication and search verification. Include concurrent review/edit and
permission changes. Farm/developer/security owners execute these checks.
No load, recovery or security test is represented as already executed here.
