# React Native application architecture

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Contents

- [Compatibility](#establish-a-mobile-compatibility-matrix)
- [Boundaries](#define-feature-and-platform-boundaries)
- [Screen and native design](#specify-mobile-feature-contracts)
- [Identity](#design-identity-and-secure-local-state)
- [Offline contract](#make-offline-behavior-a-contract)
- [Synchronization](#engineer-persistence-and-synchronization)
- [Performance and releases](#engineer-performance-and-delivery)

Use [web/mobile stack decisions](react-web-mobile-stack-selection.md) for native
package selection, storage choices, peer compatibility and cross-channel reuse.

## Establish a mobile compatibility matrix

Verify current React Native support, required React/Node, JavaScript engine,
iOS/Android targets, Xcode/Gradle/JDK/native SDKs and dependency compatibility.
Distinguish stable, preview and deprecated architectures. Inspect actual package
support before choosing a release or assuming a native module can be upgraded.

Understand Fabric, TurboModules, JSI, Codegen and Hermes in the current runtime;
apply them to native integration and performance decisions, not as labels.
Check New Architecture interoperability and migration limits against official
docs and native-library evidence. Do not freeze today's release status in this skill.

Choose Expo/dev builds versus a bare workflow by native requirements, build
control, delivery restrictions and support. Neither is already confirmed at EF.
Treat iOS build/signing requirements separately from EF's Windows/IIS backend
hosting; a Windows application server is not an iOS build environment.

## Define feature and platform boundaries

Choose feature modules and data/domain/presentation boundaries proportionate
to change and testability. Compare unidirectional reducer/Flux-style state,
state machines and MVVM-like separation by journey complexity, offline behavior
and team practice; do not force a pattern or a global store onto every screen.
React Native's runtime architecture is separate from these application patterns.

Organize features, navigation, API clients, server/local state, design tokens,
native adapters and device persistence. Share types and domain-independent
logic with web when useful, while assessing native UI, navigation, accessibility
and lifecycle separately. React DOM/CSS packages are not automatically native.
Evaluate native styling adapters before applying Tailwind-related conventions.

Cover deep links/universal links, app launch/resume, permission prompts, camera,
files, push, biometrics and background operations only where needed. Isolate
native modules and state their ownership, upgrade and fallback strategy.
Do not promise permanent background JavaScript execution under mobile OS limits.

## Specify mobile feature contracts

Define route/typed navigation inputs, screen/container responsibilities, feature
use cases, API adapter, local repository and platform services. Separate query
results, UI/form state and durable commands; Redux/Zustand/context or a query
cache is not automatically a crash-safe journal. Use explicit state transitions
for multi-step or offline journeys, not many independent booleans.

Choose navigation/router, query/form/state and storage libraries from the actual
React Native/Expo/native compatibility matrix. Specify how screens connect to the
navigation tree, providers and API contract. Handle startup/loading/empty/error,
permissions denied, expired session, keyboard/safe area, focus/resume and Arabic
RTL/accessibility states. Do not treat a browser preview as native verification.

Wrap native capabilities behind narrow typed adapters with lifecycle ownership.
Verify Codegen/module/event APIs for the target runtime; remove listeners and
cancel work correctly on teardown. Profile calls and serialization across JS/native
boundaries before moving heavy work or choosing a synchronous API. Select native
code only when platform requirements or measured performance justify it.

For large lists/media choose appropriate virtualization, stable keys, image
size/caching and bounded work. Assess gestures/animations on the affected device
thread and tooling; package names alone do not establish smooth performance.

## Design identity and secure local state

Use an appropriate native OAuth/OIDC Authorization Code flow with PKCE and
system authentication UI where supported. Verify redirect URI/link ownership,
issuer/audience, state/nonce and session handling. Do not embed client secrets
or handle credentials in a custom login form when federation is intended.

Use platform-backed secure storage for sensitive credentials; distinguish it
from general application storage. Define logout, revocation, device loss,
biometric gate semantics and redaction of telemetry. Biometric unlock is not
server authorization or proof an employee is still entitled to act.

Scope token refresh and in-flight responses to a session/account generation.
Prevent a previous account's response, push event or queued operation entering
the new account's cache or being sent with its credentials. Persist only the
necessary command data; never serialize access tokens into a queue. Define
local database access, encryption-key lifecycle, backups and logout/account-switch
handling, including what happens to unsent work.

## Make offline behavior a contract

Only add offline capabilities required by a journey. Define read freshness,
local data classification/encryption, retention and deletion. For queued writes
use durable local operations, stable command IDs, retry/backoff, ordering and
server reconciliation. Authorize on the server when the operation is processed,
including when the user's role changed while the device was offline.
Remote revocation cannot instantly erase data or change behavior on a completely
disconnected device. Set permitted offline data/actions, local expiry and
reconnection checks; do not promise immediate remote enforcement without a path.

Choose conflict resolution per data type: server authority, version rejection,
field-level merge or user resolution. Do not silently apply last-write-wins to
financial, approval or audit-sensitive records. Distinguish queued, syncing,
accepted, rejected and conflict states in the UI.

## Engineer persistence and synchronization

For required offline writes define a durable local operation record with stable
command ID, owner/scope, payload schema version, base entity version, dependencies,
attempt/deadline and status. Persist an operation before displaying durable
acceptance. Reuse its ID after timeout, process death or network loss; generating
a fresh key for each retry defeats deduplication at the API.

Design a recoverable state machine: queued → sending → acknowledged/rejected/
conflict/unknown as appropriate. Recover interrupted sending operations and persist
the server acknowledgment before local cleanup. Network reachability does not
prove the API is reachable; use bounded retries and meaningful response handling.
Server processing rechecks identity, resource policy and state; do not silently
rebase an approval or monetary change onto a newer record.

Use transactional local persistence when relationships and crash consistency
require it. Define schema migrations for stored drafts and queued commands,
including older application versions and upgrade interruption. Map temporary
client IDs to server IDs deliberately. Delta sync needs checkpoint ownership,
deletion/tombstone handling and a recovery path; a modified-date field alone
does not establish complete synchronization under races.

For attachments persist an accessible private file reference and lifecycle,
resumability if needed, content identity, upload acknowledgment and cleanup.
A picker URI may not remain valid after process death. Treat notifications as
hints to fetch authorized current state; handle duplicate/late delivery, account
switch and token re-registration without exposing sensitive payloads.

## Engineer performance and delivery

Measure startup, JS/UI responsiveness, memory, battery/network use, large lists,
images, navigation transitions and low-end devices. Profile native and JS work
before changing execution boundaries. Verify Arabic/RTL, screen readers,
dynamic text and touch behavior on actual target devices.

Define API backward compatibility across installed versions, minimum supported
client, feature negotiation and failure behavior after server changes. Specify
store/internal distribution, signing/key ownership, native build reproducibility,
release channels and crash diagnostics. Verify current policies before using OTA
updates; native binary changes may require a new build/distribution process.

Separate backend API compatibility, local schema version and native update runtime
compatibility. If using Expo/EAS or another update service, verify its current
native-runtime matching and update/signing rules. Plan staged rollout and recovery
without assuming a JavaScript OTA can add a missing native module or reverse an
incompatible local database migration. Keep signing keys and credentials out of
source and AI prompts; use the authorized build/release system.

Test permissions denied, airplane mode, process termination during a write,
duplicate synchronization, expired sessions, old clients, deep links and push
to logged-out users where relevant. A simulator demo is not evidence of every
device's background, security or performance behavior.
