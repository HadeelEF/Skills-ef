# React web and React Native stack decisions

Use with the dedicated React and React Native guides. Choose technologies inside
the selected project track. React Native is an optional custom-project channel;
Mendix/SharePoint use their own supported platform UI and extension toolchain.
Examples below are candidates requiring current official compatibility checks.

## Web stack decisions

| Concern | Candidate families | Design contract and decision criteria |
| --- | --- | --- |
| Language/build | TypeScript, React, Vite or retained approved toolchain | TS/runtime boundary validation, ESM compatibility, browser targets, bundle and reproducible build |
| Routing | React Router or another justified router | Route/data/error boundaries, typed parameters, URL state, lazy routes, navigation guards; backend authorization remains authoritative |
| Server state | TanStack Query, RTK Query, SWR or simple fetch for a small scope | Cache key/identity scope, stale time, invalidation, cancellation, pagination, mutations and logout |
| Client state | Local state/reducers/context, Zustand, Redux Toolkit, state machines | Ownership and transitions; avoid redundant stores or copying every server result |
| Forms and schemas | Native controls, React Hook Form or compatible form library; Zod/alternative boundary schemas | Accessible errors, nested/dynamic forms, drafts, file validation, server errors and conflict handling |
| Styling/design system | Tailwind, CSS modules/native CSS, compatible primitives such as Radix/shadcn or a maintained suite | EF tokens, RTL/logical properties, accessibility, interaction contracts and CSS collision risk |
| Dense UI | TanStack Table/Virtual or justified grid/chart/editor packages | Server sorting/filtering, stable IDs, virtualization, keyboard use, RTL, export and license cost |
| Data transport | Fetch/typed OpenAPI clients; Axios only for actual needs | Credentials, errors, cancellation, upload, idempotency and wire precision; choose one adapter contract |
| PWA/offline | Service worker/Workbox where appropriate, IndexedDB wrapper if justified | Private data, shell/API cache separation, update activation, durable local commands and sync contract |
| Quality evidence | Testing Library, Vitest/Jest, Playwright, accessibility tools, Storybook when useful | User behavior and real journeys; architecture specifies evidence, implementing agent executes |

Design semantic HTML, CSS layout/responsiveness, browser history, forms and network
behavior as foundations. Do not substitute a package for platform understanding.
Keep design tokens and accessible primitives separate from domain features; define
shared-package public contracts without creating a universal component framework.
Distinguish a maintained runtime dependency from copied/generated component source
(such as a shadcn-style workflow); assign local accessibility, fixes and upgrade ownership.

Cover render purity, hooks/effects, closures, reconciliation/keys, Suspense/error
boundaries, transitions and compiler compatibility where relevant. Server
Components/actions require a compatible selected framework/runtime; a static IIS
SPA does not acquire a server runtime from importing a React API. Keep .NET as
the business backend. Do not introduce Next.js by default to access a new feature.

For real-time UI define snapshot-plus-delta reconciliation, reconnect and missed
messages; a live transport is not durable event history. Keep decimal/large-ID/date
semantics consistent with .NET. Review hydration only where server rendering exists.

## React Native stack decisions

| Concern | Candidate families | Required compatibility or lifecycle evidence |
| --- | --- | --- |
| Project/build | React Native with appropriate Expo development build or native project workflow | RN/React/Hermes/New Architecture, native SDKs, custom modules, build ownership; Expo Go is not a universal production proof |
| Navigation | React Navigation or Expo Router where suitable | Auth/deep-link flow, nested routes, restore, route versioning, safe area and back behavior |
| Remote state and forms | Compatible query/state/form packages | AppState/focus/reconnect, inactive screens, offline mode and account-scoped cache cleanup |
| Device storage | Platform secure store for credentials; AsyncStorage/MMKV-like KV for suitable data; SQLite for transactional local data | Sensitivity, encryption/key handling, persistence semantics, migrations, transaction and crash behavior |
| Lists/media | Native list primitives or a measured alternative such as FlashList | Device memory, stable keys, recycled state, image dimensions and pagination |
| Motion/input | Gesture Handler/Reanimated or supported native alternatives | Actual native architecture/toolchain support, thread ownership, reduced motion and device evidence |
| Native capabilities | Supported Expo/native modules for camera/files/push/location/biometrics | Permission lifetime, foreground/background limits, event cleanup, data handling and fallback |
| Native styling | Native components/tokens; NativeWind or suite only after validation | Native layout/text/input/accessibility/RTL, peer versions; web CSS is not automatically portable |
| Delivery/diagnostics | Native signing/distribution, optional compatible update/crash tooling | Binary vs JS runtime compatibility, privacy, rollout/recovery and ownership of paid services |

Specify JS, UI/native and background execution boundaries, not just libraries.
Define cold/warm start, resume, interrupted work, keyboard/safe-area, deep links,
permission refusal and accessibility/RTL behavior. iOS build/signing requirements
remain separate from Windows/IIS backend hosting. Do not assume cloud build or
update subscriptions are purchased or authorized merely by choosing a workflow.

Share domain-independent contracts, validation and design tokens when useful;
keep navigation, DOM/native rendering and device APIs as channel adapters. Define
one owner for server state, local drafts and queued commands. Offline queues need
stable IDs, version conditions and crash-safe persistence; query persistence alone
does not prove durable ordered business delivery or authorization after reconnect.

## Selection, upgrades and evidence

Return a small coherent stack, rejected alternatives and a responsibility map.
For each dependency inspect exact package identity, license, maintenance/advisories,
peer/native dependencies, bundle/runtime costs, accessibility/RTL and migration
impact. Explain compatibility as a set, not independent latest version numbers.
Do not add Redux and Zustand, multiple query libraries or two form systems without
separate evidenced responsibilities. Budget route bundle, startup, memory and
interaction latency from project targets; compare before/after measurements.

Define the smallest representative proof for the risk: a real-device flow with
native modules, logout during a request, a dirty form after refetch, service-worker
version skew or offline write interrupted by process death. A type check/browser
preview does not prove iOS/Android runtime behavior. Deliver design and acceptance
contracts to the developer; do not install packages or write production features.

## Official evidence

Inspected 2026-10-05; reopen for the selected version and package:
- [React component/state design](https://react.dev/learn/thinking-in-react)
- [React Native architecture](https://reactnative.dev/architecture/landing-page)
- [TanStack Query server state](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Navigation setup](https://reactnavigation.org/docs/getting-started/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
For candidates not verified here, open the official maintainer docs and package
metadata before selecting them; this table is not a current compatibility matrix.
