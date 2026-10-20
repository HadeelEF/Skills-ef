# EF governance, security and privacy assurance

Use for architecture with significant data, external exposure, vendors or
regulatory obligations. This is an architectural applicability and evidence
workflow, not a legal opinion or a declaration that every listed framework
applies. Security, privacy/legal, data and service owners confirm obligations.

## Contents

- [Determine applicability](#determine-applicability)
- [Translate obligations into design](#translate-obligations-into-design)
- [Threat modeling and control design](#threat-modeling-and-control-design)
- [Software and vendor assurance](#software-and-vendor-assurance)
- [Evidence and decision packet](#evidence-and-decision-packet)
- [Official discovery sources and inspection limits](#official-discovery-sources-and-inspection-limits)

## Determine applicability

Record legal entity/service scope, business owner, data subjects, classifications,
processing purpose, hosting/processing/backup/support locations, third parties,
channels and system criticality. Obtain current EF policies and contracts.
User technology preferences do not establish regulatory compliance; regulatory
ambiguity does not authorize changing the selected platform silently.

| Source family to examine | Applicability question | Architectural consequence to investigate |
| --- | --- | --- |
| NCA Essential Cybersecurity Controls (ECC) | Which current controls and organizational scope apply? | Ownership, protection, operations, resilience, third-party evidence |
| NCA Data/Cloud/Critical Systems controls where applicable | Does data/cloud use or formally determined criticality activate further controls? | Data handling, customer/provider responsibility, isolation, recovery and monitoring |
| SDAIA PDPL and applicable regulations | Which personal-data processing, purposes, roles and transfers are in scope? | Minimization, lifecycle, access, correction/deletion workflows, processor and transfer assessment |
| NDMO data policies/standards adopted for the entity | Which classification, sharing, quality, metadata and retention requirements are confirmed? | Data ownership, provenance, access/sharing contracts and disposal |
| DGA and EF service/architecture policies | Which current service, interoperability, accessibility and architecture requirements apply? | Reuse, service contracts, channel experience and measurable evidence |
| EF internal policies and supplier contracts | What additional obligations and approved exceptions exist? | Operating responsibilities, entitlement, support access and evidence retention |

Use Applicable, Not applicable with owner/rationale, or Undetermined. Do not
invent control identifiers, statutory deadlines, retention periods or a blanket
consent requirement. Read exact current clauses before citing their meaning.
Keep mandatory obligations distinct from voluntary good practice and proposed
controls. No source access means unverified applicability, not automatic waiver.

## Translate obligations into design

For each applicable requirement maintain source/version/verified clause, owner,
affected data/flow/component, enforcement point, design mechanism, evidence,
gap and decision status. Split shared controls into EF and provider duties.
Vendor certification does not demonstrate the assembled solution or EF tenant.

Model personal/sensitive data across collection, authoritative storage, files,
search, cache, analytics, exports, devices, telemetry, backups and support access.
For each copy define purpose, allowed principals, freshness, retention basis,
deletion/correction propagation and recovery behavior. Include legal hold only
when confirmed. Explain backup restoration and subsequent reapplication of
required deletions rather than promising instantaneous erasure from all media.

Show jurisdiction and processing per flow, including SaaS control planes,
diagnostic services, AI prompts, model context and remote support. Hosting a VM
in Saudi Arabia does not establish all processing/support stays there. Obtain
contractual and configuration evidence before claiming residency or transfer
compliance. Route the legal determination to the authorized owner.

## Threat modeling and control design

Start with assets, entry points, trust transitions, privileged paths and realistic
abuse. Use a structured method such as STRIDE where it helps completeness without
turning the method into a compulsory ceremony. Record attacker capability,
precondition, threat, impact, mitigation, residual risk and verification.

Inspect object/workspace authorization, administrative impersonation, identity
revocation, unsafe uploads/downloads, SSRF, injection, cross-site attacks,
replay, resource exhaustion and privileged integration identities as relevant.
Specify authorization at the actual data/file operation, not only the gateway.
Separate business audit from logs; define event identity, actor/effective actor,
action, object, outcome, correlation, access, retention and tamper detection.

For break-glass access design independent recovery, restricted scope, credential
custody, monitoring, periodic validation and revocation. Do not make emergency
administration automatically a reader of every business record. Keep hardening
and security product choices tied to a threat and an operating owner.

## Software and vendor assurance

Inventory NuGet/npm/native/Mendix Marketplace/SPFx packages, licenses, maintainers,
transitive dependencies, source/provenance, supported combinations and advisories.
Specify reproducible builds/lockfiles, approved artifact sources, integrity or
signing evidence, SBOM where useful, vulnerability triage and exception expiry.
Require evidence that deployment uses the reviewed artifact, not a new rebuild.
Do not require Kubernetes, new paid scanners or a particular CI service by default.

For unsupported legacy tooling assess exposure of build agents separately from
runtime. Isolate build tooling and credentials, restrict artifact sources, and
record residual risk/upgrade options with owners; do not relabel a workaround as
vendor support or assert that an old tool is safe because it is used only at build.

Supplier review should identify component/tenant/version coverage, test scope,
subservice dependencies, incident responsibilities, restoration/export limits,
exit capability and validation gaps. Procurement language cannot certify security.

## Evidence and decision packet

Use the governance-control matrix. A finding needs source, affected boundary,
impact, owner, correction and evidence. Confirmed blocking controls block only
the affected release/flow; continue other design. Record exceptions only with
actual owner acceptance, expiry and compensating evidence. Do not fabricate an
approval or treat this skill as the organization's compliance authority.

## Official discovery sources and inspection limits

Navigation checked 2026-10-05; reopen for the actual decision. These are source
entry points, not a complete legal interpretation or a permanent version list.

- [NCA ECC](https://nca.gov.sa/en/regulatory-documents/controls-list/ecc/)
  and [NCA DCC](https://nca.gov.sa/en/regulatory-documents/controls-list/dcc/):
  official search listings located; full-page retrieval timed out during this update.
- [NCA controls directory](https://nca.gov.sa/en/regulatory-documents/?documentType=controls-list):
  locate applicable current Cloud/Critical Systems documents and their scope.
- [SDAIA implementing-regulation entry point](https://sdaia.gov.sa/en/SDAIA/about/Documents/ImplementingRegulation.pdf):
  retrieval was rejected; obtain the current official document before quoting clauses.
- [DGA](https://dga.gov.sa/): locate current policy/standards by subject and
  version; search results contained multiple policy editions, so do not assume
  the first discovered PDF is current.

Seek current NDMO material through SDAIA's official channels and EF data owners.
No unavailable document was treated as read or used to assert a specific obligation.
