# NUSpace

NUSpace is an independent NUS-first campus map prototype. Phase 0 validated the technical and data foundations; Phase 1 completed the first outdoor campus MVP checkpoint with constraints. Phase 2 built the transit layer behind server-side data boundaries. Phase 3 is adding NUSMods venue intelligence.

## Current Phase

Phase 0 Prototypes A through F are complete and merged:

- Prototype A: MapLibre base map centered on NUS without Google Maps.
- Prototype B: one sourced COM3 building footprint with prototype extrusion styling.
- Prototype C: manually curated simulated D1-style shuttle corridor and animated vehicle marker.
- Prototype D: local search and detail sheet interaction for prototype entities.
- Prototype E: repeatable data pipeline for app-ready COM3 GeoJSON.
- Prototype F: visual map UI controls, bottom-sheet states, and design direction.

Current work: Phase 3 NUSMods module lookup and selected-module interaction have landed after the Phase 2 transit checkpoints. The next Phase 3 slice should expand venue mappings only with documented provenance. The D1 route is selectable as a static, source-pending route layer; its displayed line remains manually curated placeholder geometry and must not be treated as official route geometry.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build:data
npm run validate:data
npm run test:e2e
npm run build
```

`npm run test:e2e` runs Playwright desktop and mobile viewport smoke tests against the local Vite app. If the browser runtime is missing on a fresh machine, run `npx playwright install chromium` once.

## Data Policy

Do not add campus buildings, routes, rooms, shuttle arrivals, or indoor geometry unless the source is documented in `data/sources.yml` and allowed by `PLAN.md`.

The current prototype includes only source-labelled NUS-area data:

- COM3 footprint from OpenStreetMap relation `15780831`, with placeholder height.
- MVP 1 Kent Ridge place seed from a bounded OpenStreetMap API extract, curated into `data/curated/mvp1-campus-places.json`.
- MVP 1 Kent Ridge building footprints from OpenStreetMap way/full responses and the COM3 relation, curated into `data/curated/mvp1-building-footprints.geojson`.
- Manually curated D1-style route and stops for static route UI and animation testing only, hidden by default because it is not source-confirmed MVP route geometry.
- OSM-sourced bus stop markers for selectable map/search testing, not official NUS ISB data.

No live NUS shuttle API, uNivUS/ConnectX integration, personal timetable import, or indoor routing data has been added. LTA DataMall public bus arrivals now have a server-side adapter boundary and one public bus stop UI state. Live public bus rows appear only when `LTA_DATAMALL_ACCOUNT_KEY` is configured in the server environment, refresh every 20 seconds while the app is open, and show per-arrival single/double-deck and wheelchair-accessible indicators when LTA provides them. NUS ISB static mode is source-labelled and does not include live ETAs, live vehicle positions, or crowd levels.

NUSMods module lookup uses the public NUSMods API for module timetable venue codes. Successful searches open a selected-module sheet with confidence-labelled venue mappings against the curated campus place seed and do not imply room-level geometry or indoor navigation.

## Transit Adapter Notes

The development server exposes:

```text
GET /api/transit/public-bus-arrivals?busStopCode=16069
```

The endpoint is server-side only. It returns a `missing_key` unavailable response until `LTA_DATAMALL_ACCOUNT_KEY` is configured in the server environment. Do not put the AccountKey in frontend code, committed files, screenshots, logs, or pull request text.

The overview sheet queries the endpoint for the manually referenced public bus stop `Heng Mui Keng Terrace` (`16069`) and shows live LTA public bus rows when the server returns them. The frontend refreshes this visible state every 20 seconds; the server also keeps a 20-second in-memory cache so browser refreshes do not always become new DataMall calls. This public bus stop reference is separate from the OSM-sourced NUS campus bus-stop markers and from NUS ISB shuttle data.

For local live testing, copy `.env.example` to `.env.local` and set `LTA_DATAMALL_ACCOUNT_KEY` there. `.env.local` is ignored by git through the `*.local` rule. Restart the Vite dev server after changing `.env.local`.

## Local Server Notes

After switching branches, merging a prototype, or changing map data, restart or refresh the Vite dev server and browser before judging the UI. If the app still shows an older prototype state, confirm the active Git branch and current commit before assuming the implementation is wrong.
