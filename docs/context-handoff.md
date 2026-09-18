# Context Handoff

Last updated: 2026-09-18

This file is a concise working-memory handoff for long conversations, compaction, or fresh tasks. `PLAN.md` remains the source of truth for product scope and implementation requirements.

## Current Repository State

- Project name: NUSpace.
- Repository: `TanYiXun/NUSpace`.
- Current branch: `phase2-public-bus-adapter`.
- Latest `main` commit: `3282ab1 Merge pull request #12 from TanYiXun/phase2-transit-planning`.
- Prototype A through F were completed and merged to `main`.
- Phase 1 MVP campus data foundation was merged to `main` in PR #7.
- Phase 1 MVP building footprints was merged to `main` in PR #8.
- Active uncommitted work: Phase 2 public bus adapter boundary branch.

## Current Phase

- Active plan section: `PLAN.md` section 11.1, Phase 2 public bus integration.
- Current slice: server-side LTA DataMall public bus arrivals adapter boundary.
- The user has been reviewing the running local app at `http://127.0.0.1:5173/`.

## Current Phase 1 Slice

Completed and merged in PR #7:

- Added `data/curated/mvp1-campus-places.json` with OSM-sourced Kent Ridge seed places.
- Added `osm-api-nus-kent-ridge-map` to `data/sources.yml`.
- Search now imports the curated dataset instead of hard-coding places in TypeScript.
- Added OSM-sourced campus bus stop markers as a selectable MapLibre layer.
- Selected OSM bus stops show source/status and no-arrivals state instead of fake D1/D2 ETA rows.
- `npm run validate:data` now validates curated place schema, source ids, coordinate bounds, unique ids, OSM provenance, and MVP 1 seed minimum counts.
- README, data pipeline docs, and research log were updated for the OSM place seed.
- App shell stale Phase 0 accessibility wording was replaced with neutral `NUSpace campus map`.
- `npm run test:e2e` was later replaced with Playwright viewport smoke tests in the transit truth slice.

Completed and merged in PR #8:

- Added `data/curated/mvp1-building-footprints.geojson` with 13 OSM-sourced building footprints.
- Rendered the footprint layer as quiet MapLibre fill-extrusions beneath COM3's detailed prototype layer.
- Made non-COM3 building footprints directly selectable on the map, opening the sourced selected-place sheet.
- Updated validation for building footprint schema, OSM provenance, bounds, polygon ring closure, and height source status.
- Updated README, data source metadata, data pipeline docs, research log, and design screenshots.

Completed and merged in PR #9:

- OSM bus stop markers remain visible by default as the sourced MVP transit seed.
- The Phase 0 D1 corridor, stop sequence, and animated marker are hidden by default.
- The layer menu separates `Bus stop seed` from `Prototype route`.
- The shuttle route menu labels the D1 corridor as source pending and animation testing only.
- Selecting the D1 corridor keeps prototype-only, no-live-data, and not-MVP-route-geometry wording visible.
- Added Playwright e2e viewport smoke tests for desktop route/layer truth state and mobile overview readability.

Completed and merged in PR #10:

- Mobile map controls use sheet-state-aware clearance instead of fixed pixel offsets.
- Layer and route floating menus include explicit close icon buttons.
- Mobile layer menu, expanded sheet, and collapsed sheet have fresh rendered screenshots.
- E2E smoke tests now check that the layer menu can be closed on desktop and mobile.

Completed and merged in PR #11:

- Added `docs/decisions/phase-1-review.md`.
- Review decision is Phase 1 passes with constraints.
- The D1 route criterion passes only as a prototype/disclosed route state, not as official route geometry.

## Prototype F Implemented Scope

- Map-first UI controls:
  - current location
  - shuttle routes
  - map layers
- Bottom sheet states:
  - collapsed
  - half
  - expanded
- Selected states:
  - building
  - search result
  - bus stop
  - active route
- Selection clearing:
  - close button clears selected detail
  - clicking empty map clears selected detail and returns to Prototype F overview
- Icon system:
  - Material Symbols
  - map controls use 52 px circular buttons and 28 px symbols
  - sheet actions use 36 px circular buttons and 22 px symbols
  - sheet actions use `keyboard_arrow_down`, `open_in_full`, and `close`, not raw `+`, `-`, or `x`
- Current-location behavior:
  - requests browser geolocation only after user click
  - shows blue dot and accuracy ring on success
  - does not fake a location marker when permission is unavailable or denied

## Screenshots

Prototype F screenshots are in `docs/screenshots/`:

- `prototype-f-desktop-overview.png`
- `prototype-f-desktop-layers-menu.png`
- `prototype-f-mobile-overview.png`
- `prototype-f-mobile-selected-building.png`
- `prototype-f-mobile-selected-bus-stop.png`
- `prototype-f-mobile-route-active.png`
- `prototype-f-mobile-expanded-sheet.png`
- `prototype-f-mobile-collapsed-sheet.png`

The selected-bus-stop screenshot was refreshed after the sheet icon-button styling fix.

Phase 1 data foundation screenshots are in `docs/screenshots/`:

- `mvp1-data-foundation-desktop-overview.png`
- `mvp1-data-foundation-selected-bus-stop.png`
- `mvp1-data-foundation-mobile-overview.png`

Phase 1 building footprint screenshots are in `docs/screenshots/`:

- `mvp1-building-footprints-desktop-overview.png`
- `mvp1-building-footprints-selected-building.png`
- `mvp1-building-footprints-mobile-overview.png`

Phase 1 transit truth screenshots are in `docs/screenshots/`:

- `mvp1-transit-truth-default-overview.png`
- `mvp1-transit-truth-layers-menu.png`
- `mvp1-transit-truth-prototype-route.png`
- `mvp1-transit-truth-mobile-overview.png`

Phase 1 layout polish screenshots are in `docs/screenshots/`:

- `mvp1-layout-polish-desktop-overview.png`
- `mvp1-layout-polish-desktop-layers-menu.png`
- `mvp1-layout-polish-mobile-overview.png`
- `mvp1-layout-polish-mobile-layers-menu.png`
- `mvp1-layout-polish-mobile-expanded-sheet.png`
- `mvp1-layout-polish-mobile-collapsed-sheet.png`

## Checks Last Run

Latest checks passed unless noted:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run test:e2e`
- `npm run build`

`npm run test:e2e` now runs Playwright desktop and mobile viewport smoke tests. It may require `npx playwright install chromium` once on a fresh machine.

Known build warning:

- Vite reports the existing MapLibre bundle chunk-size warning.

## Important Data And Product Warnings

- Current D1 route path is a prototype placeholder for animation and UI testing.
- Current D1 stop coordinates are still wrong or approximate in places.
- Building footprint visual heights are OSM-level-derived estimates or prototype placeholders, not official architectural heights.
- Do not treat the current route path as official NUS shuttle geometry.
- Do not treat current stop points as verified bus stop locations.
- No live NUS shuttle API, real-time arrivals, crowd level, or live vehicle positions are enabled.
- uNivUS, ConnectX, or NUS live shuttle APIs must not be used in production unless official access is documented.
- LTA DataMall should not be assumed to provide NUS internal shuttle routes.

## Recent Design Decisions

- Use Apple Maps as the restraint and polish reference.
- Use NTU Map as the feature ambition reference.
- Keep the first screen as the usable map, not a landing page.
- Avoid generic/vibecoded UI patterns from `AGENTS.md`.
- Selectable map features must be directly selectable on the map as well as through search or lists, unless a phase explicitly documents display-only behavior.
- UI/map PRs should include implementer-captured screenshots from the running app or deployed preview.
- `docs/context-handoff.md` is a checkpoint file, not a live changelog. Update it at useful handoff triggers: long/context-heavy sessions, phase/prototype completion, push/PR/merge, branch switch, major decisions, or when automatic compaction has already happened and the file is stale.
- Automatic Codex compaction cannot reliably be announced before it happens. If compaction happens, continue from the provided summary and refresh this file at the next safe checkpoint.
- Prototype F PR #5 was pushed, opened with screenshots, and merged to `main`.
- Phase 0 review PR #6 was pushed and merged to `main`.
- Phase 1 data foundation PR #7 was pushed, opened with screenshots, and merged to `main`.
- Phase 1 building footprints PR #8 was pushed, opened with screenshots, and merged to `main`.
- Phase 1 transit truth PR #9 was pushed, opened with screenshots, and merged to `main`.
- Phase 1 layout polish PR #10 was pushed, opened with screenshots, and merged to `main`.
- Phase 1 review PR #11 was pushed, opened, and merged to `main`.
- Phase 2 transit planning PR #12 was pushed, opened, and merged to `main`.
- Current Phase 2 branch adds `/api/transit/public-bus-arrivals`, server-only `LTA_DATAMALL_ACCOUNT_KEY` handling, in-memory caching, normalized LTA-shaped responses, explicit missing-key/upstream-error states, and visible Phase 2 truth copy.

## Next Recommended Action

Continue Phase 2 public bus integration. Recommended next options:

1. Read `PLAN.md` section 11 before implementing transit changes.
2. Finish and merge the server-side public bus adapter boundary branch.
3. Then connect one verified LTA public bus stop UI state to the endpoint, keeping missing-key and upstream-failure states visible.
4. Keep NUS shuttle route/live data disabled or prototype-labelled until official access or source-confirmed route geometry exists.
