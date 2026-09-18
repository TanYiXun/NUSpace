# Research Log

## 2026-09-17 - Phase 0 Prototype A Basemap

- Task: choose a non-Google basemap for the first MapLibre prototype.
- Source checked: OpenFreeMap homepage and quick start documentation.
- Finding: OpenFreeMap provides MapLibre-compatible styles at `https://tiles.openfreemap.org/styles/liberty`, currently with no API key required.
- Attribution requirement: `OpenFreeMap © OpenMapTiles Data from OpenStreetMap`.
- Decision: use OpenFreeMap for Phase 0 Prototype A only, document the source in `data/sources.yml`, and revisit production basemap strategy before MVP deployment.
- Confidence: high for prototype use; production dependency requires later ADR.

## 2026-09-17 - Phase 0 Prototype B COM3 Footprint

- Task: source one NUS building footprint for a MapLibre extrusion prototype.
- Source checked: OpenStreetMap through Overpass API.
- Query target: COM3 / Computing 3 around NUS Kent Ridge.
- Finding: OSM relation `15780831` represents COM3 with address `11 Research Link, Singapore 119391`, `building=university`, `building:levels=6`, `name=COM3`, and `full_name=Computing 3`.
- Decision: use OSM relation `15780831` as the Prototype B footprint and level-count source.
- Height treatment: OSM provides level count but not exact height, so the 24 m extrusion is a prototype placeholder estimate.
- Confidence: high for prototype geometry, medium for visual alignment until browser QA is completed, low for exact height.

## 2026-09-17 - Phase 0 Prototype C D1 Route Overlay

- Task: render one NUS shuttle route overlay and animate one fake vehicle marker.
- Sources checked: public D1 stop sequence references and OpenStreetMap road context.
- Finding: D1 can be prototyped as a manually curated one-direction corridor overlay, but this does not establish official NUS route geometry, a full loop, live arrival data, or live vehicle positions.
- Decision: keep the Prototype C route and stop coordinates as `prototype-placeholder` data under `data/prototype/`, with source metadata in `data/sources.yml`.
- Animation treatment: one MapLibre GeoJSON point is moved along the route with `requestAnimationFrame`.
- Confidence: medium for testing map interaction and animation behavior, low for production route geometry.

## 2026-09-17 - Phase 0 Prototype D Search And Detail

- Task: validate local search, result ranking, camera movement, and detail panels.
- Source checked: existing prototype data from COM3, D1 corridor, and local manually referenced The Deck entry.
- Finding: a local typed index is sufficient for Phase 0 interaction testing, but mixed food/facility entries need verified production sources later.
- Ranking treatment: exact name or alias matches rank first, followed by prefix, substring, and all-query-token matches.
- Confidence: high for interaction pattern, low for unverified non-building place coordinates.

## 2026-09-17 - Phase 0 Prototype E Data Pipeline

- Task: prove one campus dataset can be transformed repeatably into app-ready GeoJSON.
- Source checked: existing COM3 OSM prototype data from `data/prototype/com3-building.geojson`.
- Finding: the COM3 footprint can be normalized into generated building data while preserving OSM source id, source status, height status, and checked date.
- Validation treatment: generated building geometry is checked for WGS84 longitude-latitude coordinate order, closed polygon rings, and NUS-area bounds.
- Decision: commit generated Phase 0 output under `data/generated/` and keep the script deterministic so reruns do not create timestamp-only diffs.
- Confidence: high for pipeline mechanics, medium for OSM footprint suitability, low for exact 3D building realism.

## 2026-09-18 - Phase 1 MVP Campus Place Seed

- Task: seed the first MVP 1 searchable campus place dataset without inventing building, food, facility, or bus stop coordinates.
- Source checked: OpenStreetMap API bounded map extract.
- Query target: `https://api.openstreetmap.org/api/0.6/map?bbox=103.770,1.290,103.785,1.306`.
- Finding: the bounded extract contains enough named NUS-area buildings, food places, facilities, and bus stops to seed MVP 1 search and map marker behavior.
- Decision: commit a curated JSON seed at `data/curated/mvp1-campus-places.json`, preserving OSM object type, OSM id, source id, and user-facing limitation text.
- Raw-data treatment: the full raw XML extract is not committed because it is large and this branch only needs the curated seed. Future broad imports should add a formal raw-data stage or fetch script with licensing review.
- Bus stop treatment: OSM bus stop coordinates are usable for map/search prototyping with attribution, but they are not official NUS ISB data and do not include live arrivals, crowd level, route membership, or vehicle positions.
- Confidence: medium for MVP search and marker seeding, low for official campus operations accuracy until NUS-owned sources or approved datasets are available.

## 2026-09-18 - Phase 1 MVP Building Footprints

- Task: render at least 10 visible building footprints for the selected MVP 1 campus area without inventing geometry.
- Source checked: OpenStreetMap API bounded map extract plus OSM API `way/{id}/full` responses for selected building ways.
- Finding: the bounded extract identified enough OSM building objects for the selected Kent Ridge/UTown seed, but some way rings were clipped by the bounding box and needed complete `way/full` responses before conversion to GeoJSON.
- Decision: commit a curated building footprint GeoJSON at `data/curated/mvp1-building-footprints.geojson`, preserving source ids, OSM object type/id, date checked, height source status, and user-facing limitation text.
- Height treatment: `building:levels` values are converted to rough visual heights where available. Missing heights remain prototype placeholders. None are official architectural heights.
- Confidence: medium for outdoor footprint visualization, low for official building inventory, exact height, indoor geometry, accessibility, or floor-level navigation.

## 2026-09-18 - Phase 1 MVP Transit Truth Layer

- Task: keep the MVP 1 transit layer honest while official NUS shuttle route geometry and live data remain unavailable.
- Source checked: existing `manual-osm-d1-prototype-route` metadata and Phase 0 route data.
- Finding: the current D1 route has `source_status=prototype-placeholder`, `can_ship=false`, and `review_status=prototype-only`.
- Decision: keep OSM bus stop markers as the default visible transit seed and hide the simulated D1 corridor by default. The D1 corridor remains available only through explicit prototype route controls.
- Confidence: high for truthful UI state, low for actual NUS route geometry until source-confirmed route data is added.

## 2026-09-18 - Phase 2 Transit Planning

- Task: establish the public bus and NUS shuttle source boundary before implementing live transit UI.
- Sources checked: LTA DataMall portal and Dynamic Datasets page.
- Finding: LTA DataMall Dynamic APIs require an AccountKey for registered subscribers. The Bus Arrival dataset is for public bus arrivals and includes ETA, estimated location, and load information. DataMall notices state that Bus Arrival v2 is decommissioned.
- Decision: document LTA DataMall as a `requires-permission` source for future public bus arrivals. Do not call LTA from frontend code, and do not treat LTA public bus data as NUS ISB data.
- NUS ISB decision: keep live NUS shuttle arrivals, live vehicle positions, and crowd level unavailable until official access is documented.
- Confidence: high for LTA public bus source boundary, low for NUS ISB live access until official permission exists.
