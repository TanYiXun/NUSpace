# NUSpace

NUSpace is an independent NUS-first campus map prototype. Phase 0 validated the technical and data foundations; Phase 1 completed the first outdoor campus MVP checkpoint with constraints.

## Current Phase

Phase 0 Prototypes A through F are complete and merged:

- Prototype A: MapLibre base map centered on NUS without Google Maps.
- Prototype B: one sourced COM3 building footprint with prototype extrusion styling.
- Prototype C: manually curated simulated D1-style shuttle corridor and animated vehicle marker.
- Prototype D: local search and detail sheet interaction for prototype entities.
- Prototype E: repeatable data pipeline for app-ready COM3 GeoJSON.
- Prototype F: visual map UI controls, bottom-sheet states, and design direction.

Current work: Phase 2 transit planning can begin. Phase 1 passed review with constraints in `docs/decisions/phase-1-review.md`; the prototype D1 route remains hidden by default and must not be treated as official route geometry.

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
- Manually curated D1-style route and stops for animation testing only, hidden by default because it is not source-confirmed MVP route geometry.
- OSM-sourced bus stop markers for selectable map/search testing, not official NUS ISB data.

No live NUS shuttle API, uNivUS/ConnectX integration, LTA DataMall integration, NUSMods import, or indoor routing data has been added.

## Local Server Notes

After switching branches, merging a prototype, or changing map data, restart or refresh the Vite dev server and browser before judging the UI. If the app still shows an older prototype state, confirm the active Git branch and current commit before assuming the implementation is wrong.
