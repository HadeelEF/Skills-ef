# Mendix web, Atlas, widgets and mobile engineering

Use this guide for solution/component design and architectural review. Specify
contracts, trade-offs and required evidence; implementation/build/test steps
are expectations for the developer or operating owner, not actions for this
architect profile. Keep detail proportional to the architectural risk.


## Build page specifications that can be implemented

For each journey specify navigation profile, layout, page parameters, data sources,
widgets, bindings, actions and access. Model loading, empty, validation, failure,
permission-denied, submitting and successful states. Keep reusable snippets,
building blocks and layouts purposeful; avoid giant pages or hidden cross-module
coupling. Use server-side data filtering and paging for large collections.

Select database, association, microflow or nanoflow data sources by context and
cost. State whether a source returns persisted data or transient presentation
objects, when it refreshes and how edits/cancel affect memory and stored state.
Avoid a database/API call per row or reloading a whole large page after each edit.
Keep validation messages near the relevant control and preserve user input when
recovering from an error or concurrency conflict.

## Apply the design system through supported extension points

Use [Atlas foundations](https://docs.mendix.com/howto/front-end/get-started/)
and [company design systems](https://docs.mendix.com/howto/front-end/create-a-company-design-system/)
to map approved EF tokens, typography and reusable components into the actual
theme modules. Inspect current theme structure before editing SCSS or native
styles. Do not assume Tailwind from EF's custom React stack belongs in Mendix.
Keep custom styling outside replaceable vendor content where supported.

Design Arabic/English with explicit direction, mixed-direction identifiers,
translation resources, numbers, dates and layout behavior. Do not claim Atlas
provides complete RTL support merely because Arabic strings render. Verify
navigation, grids, popups, icons, focus order and mobile gestures. Test keyboard
operation, labels, contrast, visible focus and screen-reader announcements in
representative widgets; a platform's accessibility capability is not proof of
the assembled app's conformance.

## Respect the Mendix client and widget toolchain

Inventory actual React/legacy Dojo client mode and all installed widgets,
Marketplace modules, JavaScript actions and custom index/theme files. Read
[React client migration](https://docs.mendix.com/refguide/mendix-client/react/)
and [Marketplace React status](https://docs.mendix.com/refguide/mendix-client/marketplace-react-status/).
Assess compatibility per component; a Mendix upgrade alone does not migrate
every custom widget or deprecated client API. Treat migration warnings as
investigation aids, not production acceptance.

Prefer existing model/UI facilities, then a supported pluggable widget for a
demonstrated gap. Use the [Pluggable Widgets API](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets/)
and its versioned tooling. Specify XML properties, generated types, data/action
bindings, editability, validation, loading state, accessibility, preview/editor
configuration and packaging. Follow the Mendix-supported React/React Native
dependency range; do not install arbitrary latest framework packages into the
runtime. Avoid private client internals and duplicate React runtimes.

For JavaScript actions specify supported client APIs, async failure handling,
inputs/outputs and online/offline/native compatibility. Keep credentials and
authoritative rules on the server. Test the compiled widget in the target app;
a standalone React component or successful TypeScript check is insufficient.

## Treat offline data as its own design

Choose responsive web, PWA/offline or Mendix native against actual device,
connectivity, distribution and UX requirements. Mendix native is not a drop-in
host for an independently built React Native app. Verify native template,
builder, OS, store and widget support together; native lifecycle may differ
from the web runtime's support period.

Read [offline synchronization](https://docs.mendix.com/refguide/mobile/building-efficient-mobile-apps/offlinefirst-data/synchronization/).
For each entity define local eligibility, dataset scope, sync mode, retention,
file volume, ownership and conflict strategy. Sync operates on committed local
data, not arbitrary unsaved UI values. Match full, changed-object and selected-
object synchronization to update/delete behavior; selected-object sync does
not provide a general deletion channel. Test association dependencies, event
handlers and role changes during a long offline period.

The current [optimistic-locking guide](https://docs.mendix.com/refguide/optimistic-locking/)
states offline uploads bypass optimistic locking and can overwrite server
changes. Therefore do not use the runtime toggle as the conflict policy for
offline approvals. For consequential commands, consider storing proposed changes
with operation ID and observed version/state, then validating them server-side
before applying authoritative state. Specify reconciliation, rejected proposals
and user recovery; ensure ordinary entity sync cannot bypass that boundary.

Design logout/account switching, lost-device exposure, local storage protection,
expired credentials and remote revocation using actual platform capabilities.
Do not promise immediate remote erasure of an offline device. Test reconnect,
partial file failure, interrupted sync, deletion and old client/new server
compatibility before release. Native build/signing and store submission are
distinct from deploying the server-side Mendix package.

## Deliver and verify

Produce page/action/data-source tables, reusable component mapping, role-specific
journeys and relevant device/sync contracts. Inspect the running UI at realistic
Arabic text lengths, dataset sizes and viewport/device conditions. Report which
checks were static, browser-based, simulator-based or performed on real devices.
