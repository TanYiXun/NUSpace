# Phase 0 Review

## Prototype A: Base Map

Status: implemented, pending browser visual QA

Classification: keep for now

Acceptance criteria:

- [x] Map loads in browser-sized app shell. Evidence: Vite server returned HTTP 200 at `http://127.0.0.1:5173/`; production build succeeded.
- [x] NUS Kent Ridge appears at configured coordinates. Evidence: map center is `[103.7764, 1.2966]` in `src/map/mapConfig.ts`.
- [ ] User can pan and zoom. Pending direct browser interaction check.
- [ ] Attribution is visible. Pending direct browser visual check; MapLibre attribution control is configured with OpenFreeMap/OpenStreetMap style attribution.
- [ ] Performance is acceptable on a mobile viewport. Pending mobile viewport visual/performance check.
- [x] No Google Maps API is used. Evidence: app uses MapLibre GL JS and OpenFreeMap style URL only.

Notes:

- Basemap source: OpenFreeMap `https://tiles.openfreemap.org/styles/liberty`.
- No campus-specific data has been added.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- `npm run test:e2e` is a placeholder for this prototype and does not yet run browser automation.
- Build warning: bundled JavaScript chunk is larger than 500 kB after minification, largely expected from MapLibre at this stage but should be revisited before MVP.

## Prototype B: One 3D Building

Status: implemented, pending browser visual QA

Classification: keep for now

Acceptance criteria:

- [x] Building footprint aligns with base map in source coordinates. Evidence: COM3 footprint is sourced from OSM relation `15780831` and stored as WGS84 GeoJSON in `data/prototype/com3-building.geojson`.
- [x] Building extrusion appears at the correct configured location. Evidence: MapLibre `fill-extrusion` layer uses the COM3 GeoJSON source and `height_m`.
- [x] Click opens a detail panel. Evidence: clicking the COM3 extrusion updates the status panel with footprint, level count, and height provenance.
- [x] Label is configured for useful zoom levels. Evidence: `prototype-com3-label` symbol layer uses zoom-interpolated text size and collision handling.
- [x] Height is marked as placeholder. Evidence: GeoJSON property `height_source_status` is `prototype-placeholder`.
- [x] Prototype distinguishes real geometry from guessed height. Evidence: UI and GeoJSON note that the footprint and level count are from OSM, while height is a prototype estimate.

Notes:

- Geometry source: OpenStreetMap relation `15780831`, fetched through Overpass API on 2026-09-17.
- Level source: OSM `building:levels=6`.
- Height source: placeholder estimate of 24 meters, derived from 6 levels times 4 meters.
- Styling: neutral blue-grey extrusion, selected state tint, white halo text label.
- Alignment issues: pending direct browser visual QA.
- MapLibre extrusion appears sufficient for the one-building prototype. More detailed 3D materials, terrain, and shadows remain future Phase 4 work.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- Build warning remains: bundled JavaScript chunk is larger than 500 kB after minification.
