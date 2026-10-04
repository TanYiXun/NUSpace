# Data Pipeline

Phase 0 Prototype E introduces the first repeatable local data pipeline.

## Prototype E: COM3 Building Pipeline

Input source:

- `data/prototype/com3-building.geojson`
- Source id: `osm-overpass-com3`
- Source owner: OpenStreetMap contributors
- Status: verified for prototype footprint and level metadata

Transform script:

```bash
npm run build:data
```

The script `scripts/data/build-campus-data.mjs` reads the prototype COM3 GeoJSON, validates the polygon geometry, preserves source provenance, and writes app-ready generated data.

Output files:

- `data/generated/campus-buildings.geojson`
- `data/generated/manifest.json`

Validation:

```bash
npm run validate:data
```

Validation checks source metadata fragments, generated GeoJSON shape, stable feature ids, source provenance, source status, height status, closed polygon rings, WGS84 coordinate order, and NUS-area coordinate bounds.

Generated data policy:

- The generated files are intentionally committed for Phase 0 so a clean checkout can run and inspect the same app-ready data.
- The pipeline avoids runtime timestamps so rerunning it does not create meaningless diffs.
- Generated data must not be edited by hand. Edit the source data or transform script, then rerun `npm run build:data`.

Known data quality issues:

- Only COM3 is included.
- The footprint and `building:levels=6` come from OSM, not official NUS building records.
- Exact height is not sourced. `height_m=24` remains a prototype estimate.
- The output does not contain building parts, facade details, roof cutouts, room data, floor plans, entrances, accessibility routes, or indoor connectivity.
- This pipeline has no network fetch step yet. Future import work should add a separate raw-data stage with licensing and attribution review before broad campus generation.

## MVP 1 Campus Place Seed

Phase 1 adds the first curated campus place seed:

- `data/curated/mvp1-campus-places.json`
- `data/curated/mvp1-building-footprints.geojson`
- `data/curated/phase2-nus-isb-stop-planting.json`
- `data/curated/phase4-com3-xray-shell.json`
- `data/curated/phase5-indoor-readiness-status.json`
- `data/processed/nextbus-research/nus-nextbus-static-snapshot.json`
- Source id: `osm-api-nus-kent-ridge-map`
- Source owner: OpenStreetMap contributors
- Status: verified as OSM community map data, not official NUS data

The source was checked on 2026-09-18 using a bounded OpenStreetMap API extract:

```text
https://api.openstreetmap.org/api/0.6/map?bbox=103.770,1.290,103.785,1.306
```

The full raw XML extract is not committed. The curated place JSON preserves the OSM object type, OSM id, source id, source label, coordinate, and user-facing limitation text for each displayed entity.

The building footprint GeoJSON uses the same documented OSM source family. The initial bounded map extract identified the selected OSM objects. Complete building rings for OSM ways were then checked through OSM API `way/{id}/full` responses so that footprints are not reconstructed from clipped geometry. COM3 continues to use the previously documented OSM relation source.

Phase 2 adds `phase2-nus-isb-stop-planting.json` to attach official D1 route-map stop labels/order to matching NextBus research stop IDs. The NUS UCI route-map image is used only as a manual reference for stop labels and order. Coordinates come from the NextBus codelab API research inventory, remain `requires-permission`, and must not be treated as exact current boarding-point positions.

The NextBus codelab API research snapshot lives at `data/processed/nextbus-research/nus-nextbus-static-snapshot.json`, with raw JSON responses under `data/raw/nextbus-research/`. The app derives `data/curated/phase2-nus-isb-bus-stops.json` from it so all 33 captured NUS ISB stops are searchable/selectable as the only app-facing NUS ISB bus stop markers. They stay labelled `requires-permission` and must not be marked verified, shown as live/current arrivals, or redistributed as official NUS data until permission and terms are documented. See `docs/decisions/nextbus-research-snapshot.md`.

`phase2-nus-isb-stop-display-overrides.json` applies manual-reference display coordinates to the subset of NextBus research stops that exact-match current OSM nodes tagged as public bus stops or public-transport platforms in the bounded Kent Ridge extract. The override coordinates move the visible/search marker only; NextBus remains the route-membership source, unmatched stops remain on their NextBus research coordinate, and no override may be marked verified without official NUS data or a documented field survey.

`phase2-nus-isb-public-bus-links.json` links the NextBus research stop inventory to official LTA DataMall public bus stop codes where a documented coordinate match exists within 100 m. It currently links 21 of the 33 NUS ISB research stops and explicitly lists the remaining 12 as unlinked. These links enable public LTA arrival lookups only; they do not verify NUS ISB boarding-point positions or internal shuttle ETAs.

Phase 4 adds `phase4-com3-xray-shell.json` for the COM3 selected-building shell-only xray. It uses the sourced OSM COM3 footprint and OSM `building:levels=6` to generate six generic floor-slice labels. It does not include verified public entrances, outdoor connection points, floor plans, rooms, corridors, indoor POIs, or official floor names.

Phase 4 terrain readiness is tracked in `phase4-terrain-status.json`. The current status is `unavailable`; validation requires the missing elevation source, license, alignment, mobile performance, readability, and boundary-treatment gates to remain explicit before any terrain source or renderer is enabled.

Phase 5 indoor readiness is tracked in `phase5-indoor-readiness-status.json`. The current status is `blocked`; validation requires the legal floor-plan source, floor list, room/POI inventory, entrances and outdoor connections, vertical connectors, inaccessible/private-area markings, confidence scores, and manual QA notes to remain explicit before any indoor source, corridor graph, accessibility path, or indoor routing surface is enabled.

Validation:

```bash
npm run validate:data
```

Validation checks the curated place schema, building footprint schema, D1 stop planting schema, NextBus research snapshot schema, unique ids, allowed place types, WGS84 coordinate order, NUS-area bounds, source ids in `data/sources.yml`, OSM object provenance, polygon ring closure, height source status, permission labels, and MVP 1 seed minimums:

- at least 20 searchable places
- at least 10 buildings
- at least 8 historical OSM bus stop seed records in the curated place file
- at least 10 visible building footprints
- exactly 33 NextBus-derived NUS ISB research stops
- exactly 20 manual-reference OSM display-position overrides for exact matched public bus stop/platform nodes and 13 explicitly unmatched NUS ISB stops
- exactly 21 documented NUS ISB to LTA public bus stop links, with every unlinked NUS ISB stop explicitly accounted for
- exactly six COM3 shell-only floor selector labels
- blocked Phase 5 indoor readiness requirements and blocked indoor artifacts

Known data quality issues:

- The dataset is intentionally a seed, not full campus coverage.
- OSM building and bus stop data is community-maintained and not official NUS data.
- Building heights are derived from available OSM `building:levels` where present or marked as prototype placeholders. They are not official architectural heights.
- OSM bus stop seed records do not provide live NUS shuttle arrivals, crowd levels, route membership, or official NUS ISB operating data and are no longer app-facing NUS ISB markers.
- OSM public bus stop/platform nodes can align visible marker display positions only where exact matched and documented; they do not verify current official NUS boarding points.
- D1 stop-label planting verifies neither exact boarding-point coordinates nor route geometry; the visible sequence is complete only because the labels are attached to NextBus research stop IDs with `requires-permission` position status.
- NextBus codelab API records are `requires-permission` research data. They may render only with explicit research/permission-required labels and are not approved production stop coordinates, route geometry, live arrivals, or redistributable official data.
- LTA public bus links are not NUS ISB live data. They may show public bus timings only where a documented LTA stop-code link exists; NUS internal shuttle timings remain unavailable.
- COM3 xray shell floor labels are generic labels derived from OSM level count, not official NUS floor names or indoor maps.
- Indoor navigation remains blocked. There are no legal floor plans, room/POI inventories, entrances, connectors, inaccessible/private-area markings, confidence scores, manual QA notes, corridor graphs, accessibility paths, or indoor routes in the app.
- The current D1 route remains a prototype simulation and is not generated from this dataset.
