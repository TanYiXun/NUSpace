# Context Handoff

Last updated: 2026-10-02

This file is a concise working-memory handoff for long conversations, compaction, or fresh tasks. `PLAN.md` remains the source of truth for product scope and implementation requirements.

## Current Repository State

- Project name: NUSpace.
- Repository: `TanYiXun/NUSpace`.
- Current branch: `one-building-xray-shell`.
- Latest `main` commit: `6018f77 Merge pull request #27 from TanYiXun/nus-isb-research-stops`.
- Prototype A through F were completed and merged to `main`.
- Phase 1 MVP campus data foundation was merged to `main` in PR #7.
- Phase 1 MVP building footprints was merged to `main` in PR #8.
- PR #27 added the NUS ISB research stop inventory and was merged to `main`.
- Active uncommitted work: Phase 4 COM3 shell-only xray slice on `one-building-xray-shell`. Files changed:
  - `data/curated/phase4-com3-xray-shell.json`
  - `docs/decisions/phase-4-com3-xray-shell.md`
  - `docs/screenshots/phase4-com3-xray-shell-desktop.png`
  - `docs/screenshots/phase4-com3-xray-shell-mobile.png`
  - `src/map/CampusMap.tsx`
  - `scripts/data/validate-sources.mjs`
  - `tests/e2e/mvp1-map.spec.ts`
  - `data/sources.yml`
  - `README.md`
  - `docs/data-pipeline.md`
  - `docs/research-log.md`
  - `src/styles.css`

## Current Phase

- Active plan section: `PLAN.md` section 13.1.1, recognizable building model and xray slice.
- Current slice: COM3 shell-only xray is implemented locally and uncommitted on `one-building-xray-shell`.
- Latest refinement: Selecting COM3 shows a translucent shell, six generic `L1` through `L6` floor slices, and a selected-floor highlight. The selected-building sheet exposes a floor selector and states `building shell only`; no rooms, corridors, public entrances, outdoor connection points, indoor POIs, or official floor names are shown.
- Status: Phase 4 sourced 3D campus-detail scope is accepted with constraints in `docs/decisions/phase-4-review.md`; PR #26 added a stricter post-review truth checkpoint in `docs/decisions/deprototype-map-transit-3d.md`. Phase 5 indoor navigation is still blocked until the indoor data acquisition and QA gate in `PLAN.md` section 14.0 passes.
- Current local preview: none running. Last preview used `http://127.0.0.1:5173/` from `npm run dev -- --host 127.0.0.1` for screenshots.
- The user has been reviewing the running local app. Local preview is expected at `http://127.0.0.1:5173/` from merged `main`.

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

Phase 2 live public bus screenshots are in `docs/screenshots/`:

- `phase2-live-public-bus-missing-key-desktop.png`
- `phase2-live-public-bus-live-desktop.png`
- `phase2-public-bus-live-polish-desktop.png`
- `phase2-public-bus-live-polish-mobile.png`
- `phase2-public-bus-live-polish-route-menu-mobile.png`

Phase 2 NUS ISB static mode screenshots are in `docs/screenshots/`:

- `phase2-isb-static-route-menu-desktop.png`
- `phase2-isb-static-route-detail-desktop.png`
- `phase2-isb-static-route-detail-mobile.png`

Phase 3 NUSMods screenshots are in `docs/screenshots/`:

- `phase3-nusmods-module-lookup-desktop.png`
- `phase3-nusmods-module-lookup-mobile.png`

Phase 3 UI polish screenshots are in `docs/screenshots/`:

- `ui-polish-layer-menu-desktop.png`
- `ui-polish-live-public-bus-card-desktop.png`
- `ui-polish-layer-menu-mobile.png`
- `ui-polish-live-public-bus-card-mobile.png`

Phase 3 selected module screenshots are in `docs/screenshots/`:

- `phase3-selected-module-panel-desktop.png`
- `phase3-selected-module-panel-mobile.png`

Phase 3 review is documented in:

- `docs/decisions/phase-3-review.md`

Phase 4 3D detail screenshots are in `docs/screenshots/`:

- `phase4-3d-detail-desktop-overview.png`
- `phase4-3d-detail-desktop-selected-building.png`
- `phase4-3d-detail-mobile-overview.png`
- `phase4-3d-detail-mobile-selected-building.png`

Phase 4 review is documented in:

- `docs/decisions/phase-4-review.md`

Bus stop and route truth checkpoint screenshots are in `docs/screenshots/`:

- `bus-stop-coordinate-truth-mobile-selected.png`
- `prototype-route-truth-desktop.png`

De-prototype map/transit/3D checkpoint screenshots are in `docs/screenshots/`:

- `deprototype-shuttle-routes-blocked-desktop.png`
- `deprototype-terrain-blocked-layers-desktop.png`
- `deprototype-3d-buildings-desktop.png`

Phase 4 COM3 xray shell screenshots are in `docs/screenshots/`:

- `phase4-com3-xray-shell-desktop.png`
- `phase4-com3-xray-shell-mobile.png`

## Checks Last Run

PR #27 NUS ISB research stop inventory was merged to `main` on 2026-10-02. Checks run before merge:

- `npm run validate:data`
- `npm run typecheck`
- `npm run test` with 44 passed tests
- `npm run lint`
- `npm run build` with the known Vite chunk-size warning
- `npm run test:e2e` with 7 passed and 7 skipped

Latest uncommitted COM3 xray shell checks passed on 2026-10-02:

- `npm run validate:data`
- `npm run typecheck`
- `npm run test` with 44 passed tests
- `npm run lint`
- `npm run build` with the known Vite chunk-size warning
- `npm run test:e2e` with 8 passed and 8 skipped

NextBus extraction details:

- Source id: `nus-nextbus-codelab-api`.
- Raw responses: `data/raw/nextbus-research/`.
- Processed snapshot: `data/processed/nextbus-research/nus-nextbus-static-snapshot.json`.
- Decision note: `docs/decisions/nextbus-research-snapshot.md`.
- `/BusStops` returned 33 stops.
- `/Announcements` returned four records.
- `/ShuttleService?busstopname=<stop.name>` parsed for all 33 stops.
- `/ShuttleService` without `busstopname` returned `Bus stop not found!`.
- `CG`, `OTH`, and `BG-MRT` are outside the Kent Ridge bounds and are explicitly whitelisted only as Service P/Bukit Timah-context research records.
- App-facing inventory: `data/curated/phase2-nus-isb-bus-stops.json`, exactly 33 stops.
- UI screenshots:
  - `docs/screenshots/nextbus-research-stops-overview.png`
  - `docs/screenshots/nextbus-research-selected-stop.png`

The previous `npm run test:e2e` localhost-bind/stale-server issue was resolved by stopping stale port `5173` listeners before clean runs. Current e2e passed cleanly with localhost approval.

Known build warning:

- Vite reports the existing MapLibre bundle chunk-size warning.

## Important Data And Product Warnings

- Historical D1 route path is a prototype placeholder for animation and UI testing only.
- Historical D1 stop coordinates are still wrong or approximate in places.
- Building footprint visual heights are OSM-level-derived estimates or prototype placeholders, not official architectural heights.
- COM3 xray shell is shell-only. Floor labels are generic L1-L6 labels derived from OSM level count, not official floor names.
- COM3 xray shell does not include public entrances, outdoor connection points, rooms, corridors, toilets, lifts, labs, indoor POIs, floor plans, accessibility paths, or indoor routing.
- Do not treat the current route path as official NUS shuttle geometry.
- Do not treat current stop points as verified bus stop locations.
- D1 stop-label planting verifies label/order reference only; it does not verify exact boarding-point coordinates.
- COM3, Opp YIH, and YIH remain unplanted in the D1 planting file until official/permitted coordinates or a documented field-survey method exists.
- NextBus codelab API snapshot data is `requires-permission` research data only. It may render only with explicit research/permission-required labels. Do not mark it verified, show it as live/current shuttle truth, or treat it as redistributable official NUS data until permission and terms are documented.
- Current UI should block NUS shuttle route display until permitted route geometry and verified stop positions exist.
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
- Phase 2 public bus adapter PR #13 was pushed, opened with a screenshot, and merged to `main`.
- `/api/transit/public-bus-arrivals` now exists in the Vite development server with server-only `LTA_DATAMALL_ACCOUNT_KEY` handling, in-memory caching, normalized LTA-shaped responses, explicit missing-key/upstream-error states, and visible Phase 2 truth copy.
- Phase 2 public bus UI PR #14 was pushed, opened with a screenshot, and merged to `main`.
- Phase 2 live public bus arrivals PR #15 was pushed, opened with screenshots, and merged to `main`.
- Phase 2 NUS ISB static mode PR #16 was pushed, opened with screenshots, and merged to `main`.
- Phase 3 NUSMods module lookup PR #17 was pushed, opened with screenshots, and merged to `main`.
- Phase 3 UI polish PR #18 was pushed, opened with screenshots, and merged to `main`.
- Phase 3 selected module panel PR #19 was pushed, opened with screenshots, and merged to `main`.
- Phase 2 public bus live polish PR #20 was pushed, opened with screenshots, and merged to `main`.
- Phase 2 compact public bus ETA labels PR #21 was pushed, opened with screenshots, and merged to `main`.
- Phase 3 review PR #22 was pushed, opened, and merged to `main`; it records that the required NUSMods scope is complete with constraints.
- Phase 4 3D campus detail PR #23 was pushed, opened with screenshots, and merged to `main`.
- Phase 4 review PR #24 was pushed, opened, and merged to `main`; it records that the sourced 3D campus-detail scope is complete with constraints.
- PR #25 downgraded OSM bus stop seed coordinates to manual-reference, added validation/tests for that boundary, and restored D1 to prototype route wording because route geometry and stop positions are unverified.
- `data/curated/phase2-public-bus-stops.json` now references `Heng Mui Keng Terrace` (`16069`) separately from OSM campus markers, and the overview sheet shows the endpoint missing-key state when no server key is configured.
- Merged PR #15 renders live public bus service rows when `/api/transit/public-bus-arrivals` returns `ok`, adds `.env.example`, adds `docs/decisions/phase-2-review.md`, and loads ignored `.env.local` into the Vite dev middleware server.
- Local live verification on 2026-09-18 returned `ok` for `Heng Mui Keng Terrace` stop `16069` with 8 LTA public bus services. The key is stored only in ignored `.env.local`.
- `AGENTS.md` now includes context and credit discipline rules: use fresh tasks after checkpoints, use this handoff as the memory bridge, read only relevant `PLAN.md` sections for normal work, summarize outputs, and capture screenshots mainly at checkpoints or when visual QA needs them.
- PR #25 restored the opt-in D1 route surface to prototype route wording, documented unverified OSM bus stop seed coordinates, and kept D1 geometry and stop positions source-pending with no live arrivals.
- PR #26 superseded that route surface by removing normal user-facing paths into dummy D1 routing and showing a blocked NUS shuttle route state instead. It also added procedural facade/roof depth for OSM building footprints, fixed blocked-route/layer menu overflow, added screenshots, and added `PLAN.md` section 13.1.1 for a one-building recognizable model and xray shell slice.
- Merged PR #17 adds NUSMods module lookup, venue-code normalization, confidence-labelled venue mappings, and nearest OSM seed stop suggestions from existing curated places.

## Next Recommended Action

Commit, push, open, and merge the `one-building-xray-shell` branch after review. Then either:

1. Decide whether the shell-only COM3 result is good enough to scale under `PLAN.md` section 13.1.1.
2. Start terrain only after documenting elevation source, license, alignment, mobile performance, and boundary treatment.
3. Start Phase 5 indoor navigation only after legal indoor data and QA artifacts exist for at least one building.
