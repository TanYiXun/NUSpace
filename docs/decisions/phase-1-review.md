# Phase 1 Review

Overall decision: Phase 1 passes with constraints.

Phase 1 is sufficient to proceed to Phase 2 transit work because the app now has a map-first outdoor NUS campus MVP with searchable sourced places, visible sourced building footprints, selectable sourced bus stop markers, detail sheets, source/status disclosure, mobile responsive controls, and real viewport smoke tests.

This review does not approve live NUS shuttle data, official NUS ISB route geometry, official NUS bus stop data, public deployment readiness, indoor maps, complete campus coverage, or production-grade 3D buildings.

Required carry-forward constraints:

- Keep the current D1 corridor hidden by default and labelled as prototype-only until source-confirmed route geometry is available.
- Do not use uNivUS, ConnectX, or NUS live shuttle APIs unless official access is documented.
- Do not present OSM bus stops as official NUS ISB stops.
- Revisit OpenFreeMap production terms, reliability, and attribution before public release.
- Revisit Material Symbols loading before public release. Current implementation uses Google Fonts.
- Revisit MapLibre bundle size before release.
- Treat OSM-derived building heights as rough visual estimates, not official architectural heights.

Phase 1 checkpoints:

- PR #7: Phase 1 MVP campus data foundation.
- PR #8: Phase 1 MVP building footprints.
- PR #9: Phase 1 MVP transit truth layer.
- PR #10: Phase 1 MVP layout polish.

Latest checks passed:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run test:e2e`
- `npm run build`

Known check warning:

- `npm run build` reports the existing MapLibre chunk-size warning.

## Acceptance Criteria

- [x] App starts locally with one documented command.
  - Evidence: `npm run dev` is documented in `README.md` and used by Playwright through `playwright.config.ts`.

- [x] Map renders NUS without Google Maps.
  - Evidence: `src/map/mapConfig.ts` uses the documented OpenFreeMap MapLibre style. No Google Maps API is used.

- [x] At least 20 places are searchable.
  - Evidence: overview sheet reports `26 searchable`; validation enforces the MVP 1 seed minimum.

- [x] At least 10 buildings are visible.
  - Evidence: overview sheet reports `13 visible footprints`; `data/curated/mvp1-building-footprints.geojson` contains 13 OSM-sourced footprints.

- [x] At least 8 NUS bus stops are visible.
  - Evidence: overview sheet reports `10 OSM markers`; `data/curated/mvp1-campus-places.json` includes OSM-sourced bus stop entities.
  - Constraint: these are OSM community map bus stop points, not official NUS ISB stop records.

- [x] At least one NUS shuttle route is visible.
  - Evidence: the D1 prototype corridor can be shown through the shuttle route control or the prototype route layer.
  - Constraint: this criterion passes only as a prototype/disclosed route state. The route is hidden by default, marked source pending, and not presented as MVP-quality official route geometry.
  - Follow-up: Phase 2 must either replace it with source-confirmed route geometry or keep routes unavailable/disabled.

- [x] Clicking a place opens details.
  - Evidence: buildings, OSM bus stops, search results, and prototype route stops open source/status detail sheets.

- [x] Data source status is traceable for every displayed entity.
  - Evidence: `data/sources.yml`, curated data properties, selected detail sheets, and validation all preserve source ids/statuses.

- [x] UI works on desktop and mobile viewport.
  - Evidence: Playwright smoke tests cover desktop and mobile; screenshots in `docs/design.md` show desktop overview, layer menu, mobile overview, mobile layer menu, expanded sheet, and collapsed sheet states.

- [x] No private API tokens are in frontend code.
  - Evidence: no NUS/uNivUS/ConnectX/LTA/NUSMods integration or private token is present.

## Data Review

Data added or used:

- OpenFreeMap MapLibre style for prototype basemap.
- OpenStreetMap COM3 relation `15780831` for the original COM3 prototype footprint.
- OpenStreetMap bounded Kent Ridge extract curated into `data/curated/mvp1-campus-places.json`.
- OpenStreetMap way/full responses and COM3 relation curated into `data/curated/mvp1-building-footprints.geojson`.
- Manually curated D1-style prototype route and stop data retained under `data/prototype/`.

No new external runtime API adapter was added in Phase 1.

## Visual Review

Accepted screenshots are recorded in `docs/design.md` and stored under `docs/screenshots/`.

Phase 1 visual direction passes for the current MVP checkpoint:

- The map remains the primary object.
- Controls use consistent circular Material Symbols buttons.
- Search stays map-first.
- Details are in a restrained sheet, not a dashboard or landing page.
- Route and data uncertainty are visible in user-facing copy.
- The D1 prototype route is no longer shown as default MVP transit.

Known visual limitations:

- Buildings are simple MapLibre extrusions, not final NTU Map-quality 3D architecture.
- The sheet interaction is tap-state based, not a production drag gesture model.
- Floating menus still overlay map content, which is acceptable for this density but may need a fuller tray for Phase 2 route lists.

## Next Approved Step

Proceed to Phase 2 transit work only after this review branch is committed, pushed, reviewed, and merged to `main`.

Phase 2 should start with public bus and transit adapter planning before any live NUS ISB integration. If official NUS shuttle access remains unavailable, Phase 2 must keep NUS shuttle routes static, disabled, estimated, or permission-required according to the data policy.
