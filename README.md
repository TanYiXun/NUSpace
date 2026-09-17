# NUSpace

NUSpace is an independent NUS-first campus map prototype. Phase 0 is validating the technical and data foundations before building broader product features.

## Current Phase

Phase 0 Prototypes A through E are complete and merged:

- Prototype A: MapLibre base map centered on NUS without Google Maps.
- Prototype B: one sourced COM3 building footprint with prototype extrusion styling.
- Prototype C: manually curated simulated D1-style shuttle corridor and animated vehicle marker.
- Prototype D: local search and detail sheet interaction for prototype entities.
- Prototype E: repeatable data pipeline for app-ready COM3 GeoJSON.

Current work: Phase 0 Prototype F, visual direction and map UI controls. The default app panel should identify the current checkpoint. Earlier prototype panels may appear only after selecting their corresponding building, search result, bus stop, or route state.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build:data
npm run validate:data
npm run build
```

`npm run test:e2e` is intentionally a placeholder until browser smoke tests are added.

## Data Policy

Do not add campus buildings, routes, rooms, shuttle arrivals, or indoor geometry unless the source is documented in `data/sources.yml` and allowed by `PLAN.md`.

The current prototype includes only phase-scoped NUS data:

- COM3 footprint from OpenStreetMap relation `15780831`, with placeholder height.
- Manually curated D1-style route and stops for animation testing only.
- Local search entries for interaction testing, with unverified entries clearly treated as prototype or manual-reference data.

No live NUS shuttle API, uNivUS/ConnectX integration, LTA DataMall integration, NUSMods import, or indoor routing data has been added.

## Local Server Notes

After switching branches, merging a prototype, or changing map data, restart or refresh the Vite dev server and browser before judging the UI. If the app still shows an older prototype state, confirm the active Git branch and current commit before assuming the implementation is wrong.
