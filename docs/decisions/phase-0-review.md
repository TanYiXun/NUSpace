# Phase 0 Review

## Prototype A: Base Map

Status: implemented as an extrusion/data-path prototype, visual realism failed

Classification: keep data path, rewrite visual strategy

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
- [x] Review states whether the result is data-path only or visually acceptable. Result: data-path only. The current extrusion does not meet the NTU Map-like real 3D building ambition.
- [x] Review states whether MapLibre extrusion is sufficient. Result: MapLibre extrusion is sufficient for alignment testing, but not sufficient for realistic campus building modeling.

Notes:

- Geometry source: OpenStreetMap relation `15780831`, fetched through Overpass API on 2026-09-17.
- Level source: OSM `building:levels=6`.
- Height source: placeholder estimate of 24 meters, derived from 6 levels times 4 meters.
- Styling: neutral low-opacity extrusion, subtle outline, white halo text label.
- Visual issue found during QA: the building still reads like a flat slab over the basemap, not like a real 3D building.
- Alignment status: the broad OSM relation appears plausible against the base map, but exact facade/roof/courtyard detail is not represented.
- MapLibre extrusion is not sufficient for the final 3D visual ambition. It is only sufficient for validating the footprint source, layer ordering, click interaction, and provenance UI.
- Follow-up needed: Prototype B2 should test a recognizable building model approach before broad Phase 4 3D work. Options include multi-part hand-authored geometry, procedural facade bands/windows, GLTF/custom mesh, or a Three.js custom layer.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- Build warning remains: bundled JavaScript chunk is larger than 500 kB after minification.
