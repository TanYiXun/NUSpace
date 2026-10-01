# Context Handoff

Last updated: 2026-10-01

This file is a concise working-memory handoff for long conversations, compaction, or fresh tasks. `PLAN.md` remains the source of truth for product scope and implementation requirements.

## Current Repository State

- Project name: NUSpace.
- Repository: `TanYiXun/NUSpace`.
- Current branch: `deprototype-map-transit-3d`.
- Latest `main` commit: `88e9348 Update handoff after bus stop truth checkpoint`.
- Prototype A through F were completed and merged to `main`.
- Phase 1 MVP campus data foundation was merged to `main` in PR #7.
- Phase 1 MVP building footprints was merged to `main` in PR #8.
- Active uncommitted work: de-prototype map/transit/3D refinement.

## Current Phase

- Active plan sections: `PLAN.md` section 11.2, section 13, section 13.1.1, and section 15.4.
- Current slice: de-prototype current map, transit, and 3D surfaces before moving on.
- Latest refinement: OSM bus stop points remain manual-reference seed markers with unverified-position UI wording; D1 prototype routing is no longer surfaced as normal route UI; terrain is shown only as blocked until source/license/alignment/performance are documented; OSM building footprints get procedural facade bands and roof caps for visual depth; `PLAN.md` now includes a one-building recognizable model and xray shell slice for NTU Map/Finute Maps style future work.
- Status: Phase 4 sourced 3D campus-detail scope is accepted with constraints in `docs/decisions/phase-4-review.md`; this branch adds a stricter post-review truth checkpoint in `docs/decisions/deprototype-map-transit-3d.md`. Phase 5 indoor navigation is still blocked until the indoor data acquisition and QA gate in `PLAN.md` section 14.0 passes.
- Current local preview: `http://127.0.0.1:5173/` from `npm run dev -- --host 127.0.0.1`.
- The user has been reviewing the running local app. Restart the local preview from this branch before judging the UI.

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

## Checks Last Run

Latest checks passed on 2026-10-01:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run build`
- `npm run test:e2e`

For the Phase 4 slice, `npm run test:e2e` passed with 5 passed and 5 skipped after adding the selected-building metadata smoke test. `npm run build` still reports the known Vite chunk-size warning.

`npm run test:e2e` now runs Playwright desktop and mobile viewport smoke tests with `NUSPACE_SKIP_LOCAL_ENV=1` so local `.env.local` keys do not mask the missing-key state. On 2026-10-01, the first sandboxed run failed because Playwright could not bind `127.0.0.1:5173`; rerunning with localhost bind approval initially reused an old live-key server on `5173`, so that listener was stopped and the clean e2e run passed with 4 passed and 4 skipped project-specific tests. It may require `npx playwright install chromium` once on a fresh machine.

Known build warning:

- Vite reports the existing MapLibre bundle chunk-size warning.

## Important Data And Product Warnings

- Historical D1 route path is a prototype placeholder for animation and UI testing only.
- Historical D1 stop coordinates are still wrong or approximate in places.
- Building footprint visual heights are OSM-level-derived estimates or prototype placeholders, not official architectural heights.
- Do not treat the current route path as official NUS shuttle geometry.
- Do not treat current stop points as verified bus stop locations.
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
- Current branch supersedes that route surface by removing normal user-facing paths into dummy D1 routing and showing a blocked NUS shuttle route state instead.
- Merged PR #17 adds NUSMods module lookup, venue-code normalization, confidence-labelled venue mappings, and nearest OSM seed stop suggestions from existing curated places.

## Next Recommended Action

De-prototype refinement should be completed and merged before starting new feature scope. Recommended next options:

1. Finish checks and visual QA for `deprototype-map-transit-3d`, then push, open, and merge the checkpoint.
2. For real NUS shuttle implementation, obtain official/permitted route geometry and verified stop positions first.
3. For NTU Map/Finute Maps style 3D, implement `PLAN.md` section 13.1.1 as a one-building recognizable model and xray shell slice before broad 3D expansion.
4. For terrain, document elevation source, license, alignment, mobile performance, and boundary treatment before implementation.
5. For Phase 5 indoor navigation, collect legal indoor data and QA artifacts before implementation.
6. Continue with a fresh task after a checkpoint if needed: `Read AGENTS.md, PLAN.md section 13.1.1, section 15.4, and docs/context-handoff.md, then continue.`
