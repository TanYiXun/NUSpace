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
