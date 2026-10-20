# Identity, access and federation architecture

## Model identities and trust first

Separate employees, public users, partners, administrators, services and devices.
Define authoritative identity/user stores, immutable subject mapping, joiner/
mover/leaver lifecycle and ownership. Email and display names are not immutable
global identifiers. Distinguish directory, identity provider, authorization server,
client, resource server, policy enforcement and application user profile.

Choose authentication, provisioning and authorization independently. SSO does not
grant shared business permissions; tenant/realm isolation differs from application
workspace scope. Identify account linking, consent, MFA/passkeys where supported,
step-up, recovery, auditing and emergency access from actual requirements.

## Select the provider with evidence

| Product | Architectural character | Investigate before selection |
| --- | --- | --- |
| Keycloak | Deployable identity platform with protocol/federation capabilities | Versioned OIDC/SAML features, user federation/brokering, realm design, database, provider-supported cache/cluster, custom extensions and production operation |
| WSO2 Identity Server | Identity platform and extensible IAM integration | Actual IS edition/release, identity stores, federation, provisioning, organizations, policy/flows, supported infrastructure and licensed support |
| Duende IdentityServer | .NET-based OAuth/OIDC authorization-server framework | User-store/login/MFA/provisioning responsibilities, ASP.NET Core integration, operational/config stores, signing keys and current production license/eligibility |

Normalize the user's "keyclock" and likely "dunde" accordingly, while resolving
ambiguity before provider-specific execution. These are requested areas of
expertise, not confirmed EF installations. Compare required capabilities,
existing identities, integration effort, HA/DR, operations, extensibility,
support, total cost and exit; do not choose solely because the application is .NET.

Duende licensing must be verified against current terms, edition and eligibility;
do not assume free production use or deny possible eligible programs from memory.
Do not apply IdentityServer4-era tutorials uncritically. Do not conflate ASP.NET
Core Identity user management with a complete federated authorization server.
Distinguish core capabilities, current official add-ons and custom implementation
for all providers. Check current user-management, federation/SAML and MFA options
and their maturity/entitlements; do not preserve an old blanket claim that a
product lacks a capability after its ecosystem has changed.

## Design flows by client type

- Browser/BFF: evaluate confidential server-side code flow, protected cookies,
  CSRF defense, server-held tokens and logout/session lifecycle.
- Browser SPA: use an appropriate public-client Authorization Code + PKCE
  design if selected; assess browser token exposure and refresh strategy.
- React Native: use system-browser/native auth patterns with PKCE and verified
  redirects/app links. Never ship a client secret or use password collection
  as a shortcut for SSO.
- Machine-to-machine: use supported service credentials/certificates/workload
  identities with least privilege and rotation; these are not end-user sessions.
- Federation/legacy: evaluate OIDC/SAML and supported adapters for SharePoint,
  Mendix or directories using the exact versions, claims and trust configuration.

Follow current OAuth security guidance; avoid implicit and resource-owner-password
flows for new designs. Treat an ID token as an authentication artifact, not an
API access token. Validate issuer, audience, signature, algorithm policy, expiry
and key rotation at resource servers; gateway validation does not replace it.

## Define authorization and session guarantees

Choose RBAC, ABAC or relationship/resource policies from business requirements.
State where policy is enforced, how scope is resolved, and how permissions
change. Keep service credentials separate from user delegation; do not blindly
forward tokens to a service with a different audience. Evaluate supported token
exchange/delegation rather than inventing identity propagation semantics.

Model access/refresh/session lifetime, refresh-token rotation and reuse handling,
concurrent browser tabs, reauthentication and logout across applications. A
logout or disabled user does not automatically invalidate every already-issued
self-contained JWT; choose an enforceable revocation/freshness mechanism and
state its latency, availability and cost implications.

Do not use a stale permission cache as authoritative access after revocation
without an agreed bound. Define fail-closed versus degraded behavior per action;
signing-key cache availability is different from authenticating a new user.

## Operate behind the actual infrastructure

Define stable external issuer/hostname, discovery/JWKS, redirect URIs, proxy
path/headers, TLS and trusted proxy boundaries. Protect administration and
management endpoints. IIS can front a runtime without turning a Java-based
identity platform into an ASP.NET application. Verify supported platform/OS,
database, storage and cluster requirements for the chosen product.

Plan keys/certificates and rotation overlap, clocks, backups of configuration
and state, upgrades, federation dependency failure and disaster recovery. Use
provider-supported clustering/cache designs; do not replace an IdP's internal
cache with Redis just because the application uses Redis.

## Deliver and verify

Produce provider comparison/ADR, trust and flow diagrams, client/resource
inventory, claims/role mapping, session/revocation policy and threat/verification
matrix. Test wrong issuer/audience, expired/replayed credentials, unauthorized
resource access, role change, key rotation, proxy misconfiguration and IdP outage.
For migrations test subject mapping, old sessions and rollback without silently
merging unrelated accounts or inventing business approval.
