# Phase 0 Review

## Prototype A: Base Map

Status: implemented and merged as the base map checkpoint

Classification: keep

Acceptance criteria:

- [x] Map loads in browser-sized app shell. Evidence: Vite server returned HTTP 200 at `http://127.0.0.1:5173/`; production build succeeded.
- [x] NUS Kent Ridge appears at configured coordinates. Evidence: map center is `[103.7764, 1.2966]` in `src/map/mapConfig.ts`.
- [x] User can pan and zoom. Evidence: MapLibre navigation is active in the local browser prototype.
- [x] Attribution is visible. Evidence: screenshots show OpenFreeMap, OpenMapTiles, and OpenStreetMap attribution.
- [ ] Performance is acceptable on a mobile viewport. Pending mobile viewport visual/performance check.
- [x] No Google Maps API is used. Evidence: app uses MapLibre GL JS and OpenFreeMap style URL only.

Notes:

- Basemap source: OpenFreeMap `https://tiles.openfreemap.org/styles/liberty`.
- No campus-specific data has been added.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- `npm run test:e2e` is a placeholder for this prototype and does not yet run browser automation.
- Build warning: bundled JavaScript chunk is larger than 500 kB after minification, largely expected from MapLibre at this stage but should be revisited before MVP.

## Prototype B: One 3D Building

Status: implemented and merged as the one-building checkpoint

Classification: keep for now

Acceptance criteria:

- [x] Building footprint aligns with base map in source coordinates. Evidence: COM3 footprint is sourced from OSM relation `15780831` and stored as WGS84 GeoJSON in `data/prototype/com3-building.geojson`.
- [x] Building extrusion appears at the correct configured location. Evidence: MapLibre `fill-extrusion` layer uses the COM3 GeoJSON source and `height_m`.
- [x] Click opens a detail panel. Evidence: clicking the COM3 extrusion updates the status panel with footprint, level count, and height provenance.
- [x] Label is configured for useful zoom levels. Evidence: `prototype-com3-label` symbol layer uses zoom-interpolated text size and collision handling.
- [x] Height is marked as placeholder. Evidence: GeoJSON property `height_source_status` is `prototype-placeholder`.
- [x] Prototype distinguishes real geometry from guessed height. Evidence: UI and GeoJSON note that the footprint and level count are from OSM, while height is a prototype estimate.
- [x] Review states whether the result is data-path only or visually acceptable. Result: basic extrusion alone is data-path only; the added procedural bands are a temporary visual spike, not final building art.
- [x] Review states whether MapLibre extrusion is sufficient. Result: MapLibre extrusion is sufficient for footprint alignment and a basic procedural facade-band spike, but not sufficient for realistic campus building modeling at NTU Map quality.

Notes:

- Geometry source: OpenStreetMap relation `15780831`, fetched through Overpass API on 2026-09-17.
- Level source: OSM `building:levels=6`.
- Height source: placeholder estimate of 24 meters, derived from 6 levels times 4 meters.
- Styling: neutral opaque extrusion, subtle outline, white halo text label, procedural facade bands, and a roof cap.
- Screenshot checkpoint: `docs/screenshots/prototype-b-com3-overlay.jpg`, captured from the running local app at `http://127.0.0.1:5173/`.
- Visual issue found during QA: the initial building read like a flat slab over the basemap, not like a real 3D building.
- Follow-up implementation: added procedural floor bands and a roof cap generated from the same sourced OSM footprint. These details are explicitly placeholder visual modeling, not verified architectural details.
- Visual issue found during QA: basemap roads, paths, and labels can appear to run through or under the extrusion. This is not proof that the coordinate data is wrong. It is caused by the simple transparent outer-shell extrusion, existing basemap layers, and missing building-part modeling such as void decks, underpasses, courtyards, and cutouts.
- Alignment status: the broad OSM relation appears plausible against the base map, but exact facade/roof/courtyard detail is not represented.
- MapLibre extrusion is not sufficient for the final 3D visual ambition by itself. Procedural bands improve recognizability but remain a temporary spike.
- Follow-up needed: Prototype B2 or Phase 4 should test a more faithful recognizable building model approach before broad 3D campus work. Options include multi-part hand-authored geometry, actual building parts from OSM if available, procedural facade/windows, GLTF/custom mesh, or a Three.js custom layer.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- Build warning remains: bundled JavaScript chunk is larger than 500 kB after minification.

## Prototype C: Shuttle Route Overlay

Status: implemented and merged as the shuttle corridor checkpoint

Classification: keep as simulation/data-path prototype

Acceptance criteria:

- [x] Route line follows a plausible campus-road corridor. Evidence: `data/prototype/d1-route.geojson` contains a manually curated one-direction D1-style corridor from COM3 toward UTown using public stop sequence references and OSM road context.
- [x] Stop sequence is visible. Evidence: stop markers and labels render from `data/prototype/d1-stops.geojson`, and the detail panel lists the sequence.
- [x] Direction arrows are present. Evidence: `prototype-d1-route-arrows` uses line-placement symbols along the route.
- [x] Animation is smooth enough on mobile viewport for Phase 0. Evidence: browser visual QA at 390 x 844 showed the simulated marker and route without app failure; no automated frame-rate test exists yet.
- [x] Simulated vehicle does not claim to be live. Evidence: GeoJSON properties set `is_live=false`, the UI says "Simulated shuttle overlay" and "No real-time arrivals or live vehicle positions", and the source is `prototype-placeholder`.
- [x] Data source and status are documented. Evidence: `manual-osm-d1-prototype-route` is recorded in `data/sources.yml`.

Notes:

- Route coordinate source: manually curated prototype corridor using public D1 stop sequence reference and OSM road context.
- Stop coordinate source: manually curated prototype points for Phase 0 only.
- Animation approach: requestAnimationFrame updates a MapLibre GeoJSON point source along the LineString.
- Screenshot checkpoints:
  - `docs/screenshots/prototype-c-d1-route-desktop.jpg`, captured from `http://127.0.0.1:5173/` at desktop viewport.
  - `docs/screenshots/prototype-c-d1-route-mobile.jpg`, captured from `http://127.0.0.1:5173/` at 390 x 844 viewport.
- Mobile UI issue: the bottom panel takes a large share of the viewport. Acceptable for Prototype C, but later map UI work should introduce collapsed and expanded sheet states.
- Visual correction: the first Prototype C PR route was too obviously hand-sketched and cut across campus blocks. The route has been narrowed to a plausible one-direction corridor for animation testing, not a full official D1 loop.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- Build warning remains: bundled JavaScript chunk is larger than 500 kB after minification.

## Prototype D: Search And Detail Sheet

Status: implemented on branch `prototype-d-search-detail`, pending PR review

Classification: keep as local search interaction prototype

Acceptance criteria:

- [x] Search works for aliases such as `COM3`, `COM 3`, and `Computing 3`. Evidence: `src/map/searchIndex.test.ts` covers all three aliases and ranks COM3 first.
- [x] Detail sheet uses source status labels internally or in debug view. Evidence: non-building search detail displays source and status, including `manual-reference` for The Deck and `prototype-placeholder` for corridor stops.
- [x] Result selection updates map camera. Evidence: selecting a result calls `map.easeTo` with the entity coordinates, zoom, pitch, and bearing.
- [x] No layout overlap on mobile viewport. Evidence: browser visual QA at 390 x 844 shows search results and the selected COM3 detail state without status-bar overlap.

Notes:

- Search implementation: local typed index in `src/map/searchIndex.ts`, queried on input changes.
- Ranking behavior: exact name or alias match scores first, prefix match second, substring match third, and all-query-token matches last.
- Included entities: COM3, D1 corridor, COM3 bus stop, Opp HSSML, Opp NUSS, Ventus, UTown, CLB, and The Deck.
- Screenshot checkpoints:
  - `docs/screenshots/prototype-d-search-detail-desktop.jpg`, captured from `http://127.0.0.1:5173/` at desktop viewport.
  - `docs/screenshots/prototype-d-search-detail-mobile.jpg`, captured from `http://127.0.0.1:5173/` at 390 x 844 viewport.
- Mobile UI issue: search results and the bottom detail panel are usable, but the combined vertical density reinforces the need for proper collapsed and expanded sheet states.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run validate:data`, `npm run build`.
- Build warning remains: bundled JavaScript chunk is larger than 500 kB after minification.
