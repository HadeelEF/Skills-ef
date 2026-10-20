# Modern React and Next.js architecture and engineering

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Contents

- [Runtime](#select-the-rendering-and-runtime-boundary)
- [Structure](#structure-a-maintainable-frontend)
- [State and API ownership](#design-state-and-api-interactions)
- [Reusable feature design](#design-feature-contracts)
- [Server/client execution](#model-modern-serverclient-execution)
- [Product states](#cover-product-states-and-visual-quality)
- [Verification](#performance-security-and-verification)

Use [web/mobile stack decisions](react-web-mobile-stack-selection.md) to turn
routing, state, forms, styling, PWA and tooling needs into a compatible shortlist.

## Select the rendering and runtime boundary

Start with React.js on Windows/IIS for the custom project track, adding React
PWA only when needed. This guide's Next.js options apply only when explicitly
requested or part of an explicitly retained design under the main skill policy.
Do not move business APIs or SQL access from .NET into Next.js route handlers
or server actions. A Mendix/SharePoint project retains its platform-native UI.
For an eligible Next.js design compare rendering/static export using user journeys,
SEO, personalization, interactivity, team skills and Windows/IIS hosting. Next.js uses React; do not compare them as unrelated
UI technologies. Verify current framework/release support at decision time.

For EF distinguish built React assets served by IIS from Next.js server features
requiring a managed Node runtime. Describe the reverse proxy, process/service,
TLS, health, restart, environment and release model. A static export cannot
silently replace request-time authentication or server-only functionality.
Do not prescribe obsolete IIS Node modules from memory.

## Structure a maintainable frontend

Use features and clear public exports, separating reusable components, domain
views, hooks, API access and platform adapters. Make shared code genuinely shared.
Define TypeScript contracts, discriminated states and runtime validation at
untrusted boundaries. Generate clients from real API contracts when useful.

Distinguish server state, ephemeral UI state, URL state, form state and device
storage. Avoid duplicating server data into unrelated stores without ownership
and synchronization rules. Select query/state/form libraries from the workload,
current maintenance and team conventions rather than always installing a stack.

Respect pure render and Rules of Hooks. Use effects for external synchronization,
not copying derivable state. Handle cleanup, request races, stale closures and
development lifecycle checks. Introduce memoization or React Compiler based on
version compatibility and measured benefit; compilation does not repair incorrect
state ownership or impure business behavior.

## Design state and API interactions

| State | Usual owner | Required contract |
| --- | --- | --- |
| Remote records | Query/cache adapter | Key scope, freshness, invalidation and identity/workspace lifecycle |
| Shareable navigation/filter | URL/router | Parse/serialize, defaults, back/forward and server query semantics |
| Editable draft | Form/feature | Dirty state, schema, reset identity and conflict resolution |
| Ephemeral interaction | Closest component/reducer | Valid transitions and derived values |
| Cross-feature client state | Focused context/store if justified | Narrow scope, persistence and reset rules |

Do not copy every query result into a global store or overwrite a dirty form
whenever data refetches. Compare reducers/context, a query library, Zustand/Redux
or state machines only against actual needs and current compatibility. Separate
query caching from durable offline command storage and business authority.

Centralize the API transport/contract adapter: base URL, credential mode, safe
error mapping, timeout/cancellation, serialization and applicable refresh policy.
Keep DOM/components independent of low-level transport details. Evaluate generated
clients plus thin adapters instead of handwritten parallel DTO definitions.

Scope query keys and cached responses to their resource, filters and authorization
context. On account/workspace switch cancel or disregard earlier in-flight work,
remove inaccessible state and prevent an old response repopulating the new scope.
A captured identity/generation check may be needed when cancellation cannot stop
completion. Server requests must not share one mutable authenticated client/store.

Handle mutations with stable intent IDs, pending/error/result states and conflict
contracts. Optimistic updates need an ownership/version strategy so an old failure
cannot roll back a newer success. Invalidate or reconcile affected queries after
commit. Disabling a submit button is not a server idempotency guarantee.

## Design feature contracts

Specify route/loader boundaries, feature public exports, container/view and hook
responsibilities, UI primitives, schema/form adapter and API/query contract. Prefer
composition and clear props to a generic component with unrelated boolean modes.
Keep feature internals private and prevent circular imports through shared barrels.

Use TypeScript to model valid state transitions and unknown external data; avoid
unchecked casts, non-null assertions and any as routine escape hatches. Handle
null/optional fields, large IDs, monetary precision and dates consistently with
the .NET wire contract. Map machine error codes to localized accessible messages.

Specify route/provider responsibilities, loading/error/empty states, data
contracts and interaction constraints for the implementing developer. When
using mocks for an agreed prototype, label them and define the replacement seam;
do not report saved data that exists only in local UI state.

Choose Vite/static SPA or a supported framework from routing/rendering/deployment
needs and current guidance. Preserve the existing build/toolchain. Version-check
router/query/form/schema/UI packages and Tailwind integration before installation;
do not change frameworks merely because an AI prefers its default template.

## Model modern server/client execution

For relevant versions evaluate Server Components, Client Components, streaming,
Suspense, transitions, actions/form APIs and framework caching/revalidation.
Verify which capabilities are stable and supported in the actual framework;
do not equate every React capability with availability in every host.

Specify what runs on the server, what is serialized to the browser, where
secrets remain and where authentication/authorization executes. Server Actions
and server-side routes still require authorization and validated input. A BFF
can own web sessions and aggregation without duplicating .NET domain invariants.

Resolve hydration consistency, loading/error boundaries and request cancellation.
Review cache scopes/keys across users and workspaces, logout, revalidation and
deployment replicas. Cached server output must not expose another user's data.
Specify shared cache/asset/version handling where a scaled Next.js deployment
needs it; validate behavior against the selected framework release.

## Cover product states and visual quality

Design loading, empty, forbidden, partial success, timeout, offline where required,
validation, concurrent edits and retry states. Tie optimistic updates to rollback
and reconciliation. Keep forms keyboard-accessible with announced errors and
focus management. Preserve RTL logical properties, language switching, Arabic
font metrics, dates/numbers and responsive behavior.

Use Tailwind with tokens, component states, theming and predictable composition.
Avoid conflicting global resets when integrating portals or legacy pages.
Distinguish architecture constraints from UI design ownership; define component
contracts and evidence expected from the frontend implementation and UX review.

## Performance, security and verification

Create performance budgets for representative routes/devices/networks. Measure
bundle cost, rendering, unnecessary updates, long tasks, loading waterfalls,
images/fonts and accessibility. Use lazy loading and list virtualization when
the actual journey benefits; do not add optimizations without evidence.

Treat XSS, token storage, cookie/CSRF, CORS, URL redirects, external images,
dependency supply chain and unsafe HTML according to the actual boundaries.
Do not hide backend authorization failures through client filtering.

Validate components and end-to-end journeys, API errors, session changes,
SSR/CSR consistency and concurrent mutations. Check builds in the supported
Node/toolchain and browser matrix. Separate a successful development server
from verified production IIS/Node deployment. For SharePoint-hosted code use
the dedicated SharePoint compatibility reference instead of this latest-stack default.
