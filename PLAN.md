# NUSpace Implementation Plan

Last updated: 2026-09-17

## 1. Purpose

Build NUSpace, a NUS-first campus map platform inspired by high-quality 3D campus maps, but implemented with our own stack and data pipeline. The product should eventually support 3D buildings, campus shuttle visualization, public bus arrivals, module/venue intelligence, and indoor navigation. The project must not depend on Google Maps, Finute Maps, private scraped data, or undocumented assumptions as core infrastructure.

This document is the execution contract. `AGENTS.md` is the canonical Codex instruction file that is auto-loaded by Codex; this plan is the detailed product and implementation reference that agents must consult while working. Any developer or LLM working on the project must check proposed work against this file before implementing, during implementation, and before marking work complete.

## 2. Operating Rules For Implementers

### 2.0 Execution Loop

Every task must follow this loop:

1. **Plan check:** name the exact section and acceptance criteria being targeted.
2. **Data check:** list every dataset/API/file the task will touch and verify it exists in `data/sources.yml` if it is external data.
3. **Small implementation:** make the smallest coherent change that satisfies the targeted criterion.
4. **Verification:** run the relevant automated checks and one manual smoke check if UI is affected.
5. **Plan reconciliation:** update this `PLAN.md` if the implementation revealed that the plan is wrong, incomplete, or too vague.
6. **Documentation reconciliation:** update `README.md` when current phase status, setup commands, generated-data workflow, local server behavior, or user-facing data policy changed.
7. **Completion note:** summarize what passed, what did not, and what remains blocked.

If step 1 or step 2 cannot be completed, stop and clarify the plan before coding.

### 2.1 Read This First

Before editing code, the implementer must:

1. Read the relevant sections of this `PLAN.md` for the requested phase or task.
2. Identify the current phase and task being worked on.
3. State which section of the plan the work maps to.
4. Confirm the work does not rely on private or guessed data access.
5. If the task requires new facts about APIs, licenses, datasets, or current service behavior, verify them from primary sources before coding.

Read the entire `PLAN.md` before starting a new milestone, creating an ADR, changing architecture, changing data-source policy, or declaring a phase complete.

### 2.2 Do Not Hallucinate Data Or APIs

Do not invent:

- API endpoints
- API parameters
- API response fields
- bus routes
- bus stop coordinates
- building names
- room numbers
- floor plans
- indoor connectivity
- licensing permissions
- real-time data availability

If a value is not available from a verified source, mark it as one of:

- `verified`
- `manually-curated`
- `prototype-placeholder`
- `requires-permission`
- `unknown`

Every dataset used by the application must have a documented source and status.

If an implementer wants to add a temporary object for UI testing, it must be named with a `prototype_` prefix and must have `source_status: prototype-placeholder`.

### 2.3 Compare Work Back To This Plan

At the end of every implementation task, the implementer must answer:

- Which plan section was completed?
- Which acceptance criteria passed?
- Which criteria remain incomplete?
- Did the implementation add any behavior not described in this plan?
- Did the implementation assume any data/API access not documented here?
- Are there new risks or constraints that should update this plan?

If implementation drifts from the plan, update this document first or explicitly justify the deviation in the task notes.

### 2.4 Data Ethics And Access Rules

The project may use public and properly licensed APIs/datasets. The project must not rely on:

- bypassing authentication
- copying short-lived app tokens
- extracting secrets from private binaries
- scraping behind authenticated sessions without permission
- evading rate limits
- presenting unofficial estimates as official live data

If official NUS/uNivUS/ConnectX shuttle access is not available, the app must clearly label NUS shuttle data as static, estimated, or unavailable.

Acceptable proof of official access:

- written approval from NUS, uNivUS, ConnectX, or the relevant data owner
- a signed API/data agreement
- public API documentation that explicitly permits the intended use
- project-specific approval from an authorized NUS office

Not acceptable as production permission:

- a token works when copied from an app
- credentials appeared in a workshop
- credentials were found in JavaScript, a mobile app, a network trace, a repository, or a forum
- another student project uses it
- the endpoint is reachable without blocking the request

### 2.5 Definition Of Done For Any Task

A task is not done until:

- the relevant acceptance criteria in this plan are satisfied or explicitly marked incomplete
- new external data sources are added to `data/sources.yml`
- new assumptions are documented in this plan or in an ADR
- automated checks relevant to the change have run
- UI changes have been checked at desktop and mobile viewport sizes
- secrets are not present in frontend code, committed files, logs, screenshots, or generated artifacts
- the final implementation notes mention plan sections touched
- if the task completes a prototype or phase, a clean Git checkpoint exists before starting the next prototype or phase unless the user explicitly defers it

### 2.6 Git And Prototype Checkpoint Rules

Each completed prototype or phase should become a stable Git checkpoint.

Before starting any new prototype or phase:

1. Check the latest completed prototype/phase in `docs/decisions/phase-0-review.md` or the relevant review doc.
2. Confirm the matching changes are committed locally.
3. Confirm the checkpoint has been pushed to GitHub.
4. Confirm the checkpoint has been merged or otherwise recorded on `main`.
5. If the checkpoint is missing, create it before continuing unless the user explicitly says not to.

Use one branch per prototype or coherent task. Example branch names:

- `prototype-a-base-map`
- `prototype-b-building-extrusion`
- `prototype-c-route-overlay`

Commit and PR descriptions must:

- avoid references to AI, LLMs, agents, prompts, generated code, or assisted implementation
- avoid em dashes
- state the plan section targeted
- state checks run
- state remaining acceptance criteria
- avoid claims of official data access unless documented in `data/sources.yml` or an ADR

## 3. Current Research Summary

Research claims in this section are not permanent truth. Recheck them before implementation if they affect API use, licensing, data access, or production feasibility.

### 3.1 Verified Public/Accessible Sources

These sources are suitable for planning and prototyping, subject to their licenses and terms:

- OpenStreetMap: campus roads, paths, building footprints, POIs, outdoor geometry.
- OneMap/SLA: Singapore map and geospatial services, depending on API terms.
- LTA DataMall: public Singapore bus stops, public bus services, public bus routes, public bus arrivals, traffic and transport datasets. Requires LTA AccountKey.
- NUSMods API: modules, lesson venues, academic timetable metadata.
- NUS public campus map pages: useful as reference, but do not treat as reusable structured data unless licensing is confirmed.

### 3.1.1 Research Log

Maintain a fuller research log in `docs/research-log.md` once the repository is scaffolded. Every entry must include:

- `date_checked`
- `source_url`
- `source_owner`
- `claim`
- `evidence_type`: `official-doc`, `observed-response`, `inference`, `third-party-report`
- `confidence`: `high`, `medium`, `low`
- `production_use_allowed`: `yes`, `no`, `unknown`
- `recheck_before_phase`

Seed research entries from 2026-09-17:

```yaml
- source_url: "https://about-univus.nus.edu.sg/univus-tips/"
  source_owner: "NUS uNivUS"
  claim: "uNivUS Bus Arrival supports real-time Internal Shuttle Bus timings, crowd levels, live bus positions, journey planning, and guest access for viewing."
  evidence_type: "official-doc"
  confidence: "high"
  production_use_allowed: "unknown"

- source_url: "https://datamall.lta.gov.sg/"
  source_owner: "Land Transport Authority"
  claim: "LTA DataMall provides dynamic public transport APIs with AccountKey access."
  evidence_type: "official-doc"
  confidence: "high"
  production_use_allowed: "yes, subject to LTA terms"

- source_url: "https://developers.google.com/"
  source_owner: "Google Developers Codelabs"
  claim: "The Antigravity workshop used legacy NUS NextBus Basic Auth credentials and endpoints."
  evidence_type: "official-doc"
  confidence: "medium"
  production_use_allowed: "unknown"

- source_url: "https://uci.nus.edu.sg/resources/faqs/campus-services-transport/"
  source_owner: "NUS Campus Services"
  claim: "NUS ISB network is a campus shuttle network planned/managed by NUS, distinct from generic public bus routes."
  evidence_type: "official-doc"
  confidence: "high"
  production_use_allowed: "reference-only"
```

### 3.2 NUS Internal Shuttle Bus Findings

NUS Internal Shuttle Bus (ISB) routes such as `A1`, `A2`, `D1`, `D2`, `K`, `P`, `R1`, and `R2` do not appear to be normal LTA public bus services. They are NUS campus shuttle services operated for NUS, with live information now surfaced in uNivUS.

Observed ecosystem:

- Legacy endpoint: `https://nnextbus.nus.edu.sg/`
- Old workshop credentials can access some endpoints, but live responses checked on 2026-09-17 appeared stale or retired.
- uNivUS points to a newer provider base: `https://fms.connectx.com.sg/apiy/NUSETA/`
- uNivUS appears to obtain a token from its backend, then calls ConnectX NUSETA endpoints.
- uNivUS documentation claims guest users can view bus arrival, live bus positions, crowd levels, and journey planning through the app UI.
- Direct third-party production use of uNivUS/ConnectX APIs requires permission or an official integration path.

Planning consequence:

- Do not make live NUS ISB data a hard requirement for MVP 1.
- Design the system so live NUS ISB data can be plugged in later through an official adapter.
- Use static route geometry, timetable data, or manually curated placeholders only when clearly labeled.

### 3.3 LTA DataMall Boundary

LTA DataMall can support:

- public bus arrivals near NUS
- public bus stop locations
- public bus route metadata
- public transport context around campus
- vehicle load for public bus arrivals where exposed

LTA DataMall should not be assumed to support:

- NUS ISB D1/D2/A1/A2 live arrivals
- NUS ISB internal stop sequence
- NUS ISB live vehicle positions
- NUS ISB crowd level
- campus indoor navigation

## 4. Product Vision

Create a NUS campus map that helps students answer:

- Where is this building, room, bus stop, canteen, library, or facility?
- How do I get from here to my next class?
- Should I walk, take an internal shuttle, or take a public bus?
- Where is the nearest relevant bus stop?
- Which route serves this stop?
- Where is the shuttle now, if live data is officially available?
- How do I navigate inside selected buildings, eventually including floors, rooms, stairs, lifts, entrances, and accessibility?

The experience should feel like a purpose-built campus navigation product, not a generic map with a few markers.

## 5. Non-Goals

Do not attempt these before the required data and prototypes are proven:

- Full indoor navigation for all NUS buildings.
- Perfect 3D mesh modeling of the entire campus.
- Production reliance on private uNivUS/ConnectX app tokens.
- Scraping NUS apps or private systems.
- Recreating Google Maps or Apple Maps globally.
- Building a general Singapore transport app.
- Adding features that are not NUS navigation, NUS transit, venue search, or campus intelligence.

## 6. Recommended Stack

The stack should be validated in Phase 0 before final commitment.

### 6.0 Initial Repository Shape

Unless a later ADR chooses otherwise, use this shape once implementation begins:

```text
.
├── AGENTS.md
├── PLAN.md
├── README.md
├── package.json
├── src/
│   ├── app/
│   ├── components/
│   ├── map/
│   ├── data/
│   ├── search/
│   ├── transit/
│   └── utils/
├── data/
│   ├── sources.yml
│   ├── raw/
│   ├── processed/
│   └── prototype/
├── scripts/
│   └── data/
├── docs/
│   ├── research-log.md
│   ├── design.md
│   ├── api-adapters.md
│   ├── data-pipeline.md
│   └── decisions/
└── tests/
```

Directory rules:

- `data/raw/`: original downloaded/exported data, if legally commit-able.
- `data/processed/`: generated app-ready data.
- `data/prototype/`: throwaway or hand-authored prototype data.
- `scripts/data/`: repeatable ingestion and transformation scripts.
- `docs/decisions/`: ADRs for stack, API, data, and architecture decisions.
- `src/map/`: map initialization, layers, controls, camera utilities.
- `src/transit/`: public bus and NUS ISB domain logic.
- `src/search/`: search index and ranking.

Do not scatter data-loading logic inside UI components. UI components should consume normalized internal models.

### 6.1 Frontend

Preferred:

- TypeScript
- React
- Vite or Next.js
- MapLibre GL JS for map rendering
- deck.gl for large geospatial overlays and animated trips
- Three.js only where MapLibre/deck.gl cannot provide the needed 3D effect

Decision notes:

- MapLibre GL JS is the Phase 0 default. To switch away from MapLibre, write an ADR in `docs/decisions/` explaining why the alternative is better, how it avoids Google Maps dependency, and how it satisfies Phase 0 acceptance criteria.
- Start with Vite if the app is primarily client-side and prototype speed matters.
- Use Next.js if server routes, auth, SEO, or deployment constraints make it worthwhile.
- Do not use Google Maps JavaScript API as the map engine.

### 6.2 Backend

Preferred:

- Node.js/TypeScript API server, or Python/FastAPI if geospatial processing is Python-heavy.
- Postgres + PostGIS for persistent geospatial data.
- Redis or in-memory cache for live API responses if needed.
- Background ingestion jobs for data refresh.

### 6.3 Search

Start simple:

- local JSON index for prototypes
- Postgres trigram search for early MVP

Upgrade if needed:

- Meilisearch
- Typesense

### 6.4 Tiles And Geospatial Pipeline

Prototype:

- GeoJSON loaded directly for small datasets.

MVP:

- PMTiles or vector tiles for larger datasets.
- Tippecanoe for GeoJSON to vector tile conversion.
- Static hosting/CDN for tiles where possible.

### 6.5 Routing

Early MVP:

- simple walking route placeholder only if clearly labeled
- external public routing only if licensing allows
- manually curated route paths for shuttle overlays

Later:

- custom graph model for campus walking + shuttle + indoor routing
- A* or Dijkstra over graph edges
- edge weights for walking time, shuttle wait time, stairs, lifts, accessibility, sheltered paths

## 7. Data Inventory And Required Metadata

Every dataset must be represented in a data inventory file before being used by the app. Suggested file:

`data/sources.yml`

Required fields per source:

```yaml
- id: osm_nus_buildings
  name: OpenStreetMap NUS building footprints
  source_url: "https://www.openstreetmap.org/"
  docs_url: "https://wiki.openstreetmap.org/"
  terms_url: "https://www.openstreetmap.org/copyright"
  license: "ODbL"
  status: "verified"
  evidence_type: "official-doc"
  date_checked: "2026-09-17"
  last_checked_at: "2026-09-17"
  next_review_at: "2026-10-17"
  refresh_method: "manual export or scripted Overpass query"
  refresh_frequency: "manual during prototype"
  attribution_required: true
  attribution_text: "© OpenStreetMap contributors"
  allowed_use:
    - "prototype rendering"
    - "derived building footprint processing subject to ODbL"
  disallowed_use:
    - "removing required attribution"
  commercial_allowed: "unknown"
  redistribution_allowed: "subject to license"
  derived_data_rules: "Review ODbL share-alike obligations before production release."
  contact_required: false
  secret_required: false
  used_for:
    - building footprints
    - outdoor paths
  limitations:
    - incomplete building heights
    - geometry may be stale
  recheck_before_phase: "MVP 1"
```

Minimum source statuses:

- `verified`: source and usage rights checked.
- `manual-reference`: source used only for human reference, not copied as structured data.
- `prototype-placeholder`: fake or temporary data used only for stack validation.
- `requires-permission`: source exists but cannot be used in production yet.
- `blocked`: source cannot be used.

No production feature may depend on `prototype-placeholder`, `manual-reference`, `requires-permission`, or `blocked` data without explicit labeling in the UI.

### 7.1 Manual Geometry Rules

Any hand-authored or manually curated GeoJSON must include a sibling metadata file or feature-level properties with:

```yaml
created_by: "name or agent/task id"
created_at: "YYYY-MM-DD"
reference_source: "URL, document, screenshot, field survey, or 'from memory'"
reference_source_status: "verified | manual-reference | prototype-placeholder | requires-permission"
method: "traced | approximate | field-collected | imported | inferred"
accuracy_m: 5
ship_allowed: false
review_status: "unreviewed | reviewed | rejected"
reviewed_by: null
notes: "Explain what is approximate."
```

Rules:

- `ship_allowed: false` by default.
- Manually traced data from screenshots or app UIs cannot ship unless licensing is confirmed.
- Prototype routes and building polygons must render with an internal/debug warning until reviewed.
- Any route copied by eye from uNivUS, Google Maps, Apple Maps, or Finute is `manual-reference` at best and cannot be production data without permission.

### 7.2 Attribution Rules

The app must include an attribution component that aggregates attribution for all currently visible map/data layers.

Requirements:

- Attribution text comes from `data/sources.yml`.
- Attribution must be visible on the map or one tap away in an obvious attribution/details control.
- If a layer has `attribution_required: true` and no attribution text, the layer must fail validation.
- Do not hardcode attribution only in UI components; it must be tied to the active data source metadata.

### 7.3 Coordinate Rules

All geospatial data must follow these rules:

- Use WGS84 / EPSG:4326 for stored GeoJSON.
- GeoJSON coordinate arrays must be `[longitude, latitude]`, not `[latitude, longitude]`.
- Store altitude/elevation separately unless using a format that explicitly supports it.
- Use decimal degrees with at least 6 decimal places for point data when available.
- Validate all campus data against an expected NUS bounding box before display.
- Any coordinate outside the expected bounds must fail data validation unless explicitly whitelisted.

Initial rough Kent Ridge validation bounds:

```yaml
nus_kent_ridge_bounds:
  min_lng: 103.760
  min_lat: 1.285
  max_lng: 103.790
  max_lat: 1.310
```

These bounds are intentionally broad. Tighten them after the first data import.

Campus coverage rule:

- Start Phase 0 and MVP 1 with Kent Ridge / UTown because it is the densest initial use case.
- Do not hardcode the product as a single square campus. NUS also has Bukit Timah and Outram campuses, and future data models must support multiple named campus extents.
- Represent each campus as a named geographic extent with its own bounds, default camera, available datasets, and feature support.
- A square or rectangular terrain tile area is acceptable as an implementation detail for performance, but the user-facing map should not imply that NUS ends at an arbitrary square edge.
- If a terrain/3D extent has a hard boundary, fade, flatten, crop at a natural map boundary, or clearly limit it to "3D detail available here" instead of showing an obvious unfinished square.
- Coordinates outside the current campus bounds must either fail validation or be explicitly whitelisted with a named campus/extension reason.

## 8. Data Models

These models are conceptual. Actual schemas may differ, but implementation must cover these concepts.

### 8.1 Place

Represents a searchable campus entity.

Fields:

- `id`
- `name`
- `aliases`
- `type`: `building`, `room`, `bus_stop`, `canteen`, `library`, `facility`, `landmark`, `parking`, `module_venue`
- `geometry`: point or polygon
- `centroid`
- `source_id`
- `source_status`
- `building_id`
- `floor_id`
- `metadata`

### 8.2 Building

Fields:

- `id`
- `name`
- `aliases`
- `footprint`
- `height_m`
- `levels_above_ground`
- `levels_below_ground`
- `render_style`
- `source_id`
- `source_status`
- `last_verified_at`

### 8.3 Bus Stop

Fields:

- `id`
- `name`
- `short_name`
- `aliases`
- `position`
- `serves_public_bus`
- `serves_nus_isb`
- `lta_bus_stop_code`
- `nus_stop_code`
- `source_id`
- `source_status`

### 8.4 Shuttle Route

Fields:

- `id`
- `code`
- `name`
- `operator`
- `route_type`: `nus_isb`, `public_bus`
- `geometry`
- `stop_sequence`
- `direction`
- `source_id`
- `source_status`
- `live_data_status`: `available`, `requires_permission`, `unavailable`, `estimated`

### 8.5 Live Vehicle

Fields:

- `id`
- `route_id`
- `vehicle_plate`
- `position`
- `bearing`
- `speed`
- `occupancy`
- `crowd_level`
- `timestamp`
- `source_id`
- `source_status`

### 8.6 Module Venue Mapping

Fields:

- `module_code`
- `lesson_type`
- `venue_code`
- `building_id`
- `room_id`
- `confidence`
- `source_id`
- `notes`

## 9. Phase 0: Technical Prototypes

Phase 0 is mandatory. Do not start MVP 1 until Phase 0 exit criteria pass.

Purpose:

- prove the map stack
- validate data alignment
- expose performance constraints early
- identify data gaps before product work begins

Prototype code may be thrown away. Prototype findings must be documented.

At the end of each prototype, classify the result:

- `keep`: code/data is good enough to evolve.
- `rewrite`: concept validated, implementation should be replaced.
- `discard`: concept failed or is not worth continuing.

Record this classification in `docs/decisions/phase-0-review.md`.

### 9.1 Prototype A: Base Map

Goal:

Render the NUS campus area without Google Maps.

Tasks:

1. Create a minimal frontend app.
2. Add MapLibre GL JS.
3. Render a base map centered on NUS Kent Ridge.
4. Test at desktop and mobile viewport sizes.
5. Record source of tiles used.
6. Confirm attribution is visible and correct.

Candidate map sources:

- OSM raster/vector tiles for prototype only.
- OneMap if API terms and keys are available.
- Self-hosted vector tiles in later phases.

Acceptance criteria:

- Map loads in browser.
- NUS Kent Ridge appears at correct coordinates.
- User can pan and zoom.
- Attribution is visible.
- Performance is acceptable on a mobile viewport.
- No Google Maps API is used.

Document:

- chosen map source
- tile URL pattern or provider
- license/attribution requirement
- visual limitations
- performance observations

### 9.2 Prototype B: One 3D Building

Goal:

Render one NUS building footprint as a sourced 3D prototype, then decide whether simple MapLibre extrusion is visually sufficient for the product direction.

Important distinction:

- A plain `fill-extrusion` proves footprint alignment, source metadata, height handling, click interaction, and camera behavior.
- A plain `fill-extrusion` does not prove the NTU Map-like 3D building ambition. It will usually look like a slab unless the building is very simple.
- If the visual target is recognizable 3D campus modeling, this prototype must record whether the result is only an alignment/data-path success and whether a follow-up custom-model spike is needed.

Recommended target:

- COM 3, Central Library, or UTown.

Tasks:

1. Obtain or hand-author a GeoJSON polygon for one building.
2. Include source metadata.
3. Render building as an extrusion in MapLibre.
4. Add approximate height or floor count.
5. Add hover/click interaction.
6. Add a label that does not overlap badly at target zoom.
7. Test camera pitch and bearing.
8. Compare the result against the NTU Map reference for visual recognizability.
9. Decide whether MapLibre extrusion is sufficient, or whether the project needs procedural facade layers, multi-part geometry, custom mesh/GLTF, or a Three.js custom layer for real 3D building quality.

Acceptance criteria:

- Building footprint aligns with base map.
- Building extrusion appears at the correct location.
- Click opens a detail panel.
- Label is readable at useful zoom levels.
- Height is marked as verified or placeholder.
- The prototype clearly distinguishes real geometry from guessed height.
- The review explicitly states whether the result is a data/alignment prototype only or a visually acceptable 3D building prototype.
- If the extrusion looks like a plain slab, do not mark it as proof that the final 3D building approach is solved.

Document:

- geometry source
- height source or placeholder status
- styling choices
- alignment issues
- whether MapLibre extrusion is sufficient
- whether a follow-up "Prototype B2: recognizable building model" is required before attempting broad 3D campus detail

### 9.3 Prototype C: Shuttle Route Overlay

Goal:

Draw one NUS shuttle route and animate a fake bus along it.

Recommended target:

- D1 route between COM 3 and UTown.

Tasks:

1. Create a route polyline from verified or manually curated coordinates.
2. Add stop markers in order.
3. Add route direction arrows.
4. Animate one fake vehicle along the route.
5. Add a small route detail panel.
6. Clearly label animation as simulated.

Acceptance criteria:

- Route line follows plausible roads.
- Stop sequence is visible.
- Animation is smooth enough on mobile viewport.
- Simulated vehicle does not claim to be live.
- Data source and status are documented.

Document:

- route coordinate source
- stop coordinate source
- animation approach
- performance notes

Current Phase 0 warning:

- The existing D1 corridor and stop coordinates are still prototype placeholders for animation and UI testing.
- Do not treat the current path as an accurate NUS shuttle route or the stop points as verified bus stop locations.
- Before MVP route work, replace or re-curate the geometry against a legally usable source and rerun visual alignment review.

### 9.4 Prototype D: Search And Detail Sheet

Goal:

Validate core interaction: search for a place, pan the map, open a detail sheet.

Tasks:

1. Create a small local search index with 5-10 entities.
2. Include buildings, bus stops, and one canteen/facility.
3. Implement search input.
4. Rank exact name matches above fuzzy matches.
5. Pan/zoom to selected result.
6. Open a detail sheet.

Acceptance criteria:

- Search works for aliases such as `COM3`, `COM 3`, `Computing 3`.
- Detail sheet uses source status labels internally or in debug view.
- Result selection updates map camera.
- No layout overlap on mobile viewport.

Document:

- search implementation
- ranking behavior
- UI issues

### 9.5 Prototype E: Data Pipeline

Goal:

Prove data can be transformed repeatably.

Tasks:

1. Pick one source dataset, such as OSM building footprints.
2. Write a script to transform source data into app-ready GeoJSON.
3. Add source metadata.
4. Validate geometry.
5. Save output to a generated data folder.
6. Document how to rerun.

Acceptance criteria:

- Pipeline can be rerun from a clean checkout.
- Output schema is stable.
- Invalid geometries are detected.
- Source attribution is preserved.
- Generated data is either committed intentionally or reproducibly generated.

Document:

- input source
- transform script
- output files
- known data quality issues

### 9.6 Prototype F: Visual Direction And Map UI

Goal:

Prove the app can look like a polished campus navigation product before adding many features.

Tasks:

1. Create `docs/design.md`.
2. Document the chosen visual direction using section 15 as the source of truth.
3. Build one map screen with search, current-location control, layer control, and bottom sheet states.
4. Build one selected-building state.
5. Build one selected-bus-stop state with compact ETA rows.
6. Build one active-route state with route line, stop sequence, and simulated bus marker.
7. Capture required screenshots listed in section 15.8.
8. Compare screenshots against Apple Maps, NTU Map, and current uNivUS screenshots for hierarchy, clutter, and readability.
9. Remove any banned generic AI/vibecoded pattern from section 15.3.1.
10. Create a visual teardown in `docs/design.md` with side-by-side notes explaining what was borrowed from Apple Maps, what was borrowed from NTU Map, what was rejected, and how the NUS version differs.
11. Include at least one intentionally rejected screenshot or mock state showing a generic/dashboard direction that must not be pursued.

Acceptance criteria:

- The default screen is map-first and not a landing page.
- UI controls follow one coherent design system.
- Bottom sheet states preserve map context.
- Markers, labels, route overlays, and panels do not compete equally for attention.
- No banned vibecoded pattern appears.
- Design tokens or a documented token plan exist.
- Screenshots are attached or linked from `docs/design.md`.
- `docs/design.md` includes explicit visual pass/fail examples.
- The accepted direction defines map color palette, route palette, marker hierarchy, sheet density, camera defaults, and selected-state treatment.
- The prototype can be judged from screenshots without needing the implementer to explain intent verbally.
- Map markers that represent selectable places, buildings, bus stops, or route stops can be selected directly on the map, not only through search.
- Sheet icon buttons use the same documented symbol system as map controls and do not use confusing text glyphs such as `+` or `-` for sheet actions.

Document:

- accepted visual direction
- rejected visual directions
- typography choice
- color palette
- route color strategy
- icon strategy
- exact symbol names for map controls and sheet actions
- bottom sheet behavior
- known visual issues

### 9.7 Phase 0 Exit Criteria

Do not proceed to MVP 1 until:

- Base map renders without Google Maps.
- One building extrusion works.
- One shuttle route overlay works.
- Search and detail sheet interaction works.
- One data pipeline is repeatable.
- Visual direction prototype passes section 15.8 review.
- `docs/design.md` exists.
- Initial design tokens or token plan exists.
- Mobile viewport has been tested.
- Data source inventory exists.
- Known limitations are documented.
- Each prototype has a `keep`, `rewrite`, or `discard` decision.
- Any kept prototype code meets the same lint/typecheck rules as MVP code.

## 10. Phase 1: Outdoor Campus MVP

Goal:

Build a useful 2D/2.5D NUS campus map with search, buildings, bus stops, and static route overlays.

### 10.1 Features

Required:

- Map centered on NUS Kent Ridge.
- Building footprints for a selected campus area.
- Search for buildings and bus stops.
- Place detail sheet.
- Bus stop markers.
- Static NUS ISB route overlays where route geometry is verified or manually curated.
- Data attribution.
- Mobile-responsive layout.

Not required:

- live NUS ISB arrivals
- live vehicle positions
- indoor maps
- complete campus building coverage

Route-source rule:

- MVP 1 may only show NUS ISB route overlays if the route geometry source is documented in `data/sources.yml` and marked `verified`, `manually-curated`, or `prototype-placeholder`.
- If the only available route geometry comes from visual copying of uNivUS screenshots/app maps, the layer must stay prototype-only and cannot be presented as a production route.
- If no legally usable route geometry exists, MVP 1 must show bus stop markers and a disabled transit layer explaining that NUS shuttle routes require source confirmation.

### 10.2 Implementation Tasks

1. Set up production app structure.
2. Add map component.
3. Add data loading layer.
4. Add place search.
5. Add marker and layer styling.
6. Add selected-place state.
7. Add detail sheet component.
8. Add source inventory.
9. Add build/test scripts.
10. Add viewport smoke tests.

### 10.3 Acceptance Criteria

- App starts locally with one documented command.
- Map renders NUS without Google Maps.
- At least 20 places are searchable.
- At least 10 buildings are visible.
- At least 8 NUS bus stops are visible.
- At least one NUS shuttle route is visible.
- Clicking a place opens details.
- Data source status is traceable for every displayed entity.
- UI works on desktop and mobile viewport.
- No private API tokens are in frontend code.

## 11. Phase 2: Transit Layer

Goal:

Make transport information genuinely useful while respecting data access constraints.

### 11.1 Public Bus Integration

Use LTA DataMall for public buses.

Tasks:

1. Obtain an LTA DataMall AccountKey.
2. Store key server-side only.
3. Build backend endpoint for public bus arrivals.
4. Cache responses.
5. Show public bus arrivals for stops near NUS.
6. Label public bus data as LTA public bus data.

Acceptance criteria:

- AccountKey is not exposed in frontend.
- Public bus arrivals display for at least one verified public bus stop.
- Error state appears when LTA API fails.
- Cache behavior is documented.

### 11.2 NUS ISB Static Mode

Use verified or manually curated static route data if official live access is unavailable.

Tasks:

1. Create static NUS ISB route definitions.
2. Add stop sequences.
3. Add route colors.
4. Add timetable or frequency notes if verified.
5. Add UI label: `Static route`, `Estimated`, or `Live unavailable`.

Acceptance criteria:

- User can select a route.
- Route path and stop sequence are displayed.
- No static estimate is presented as official live ETA.

### 11.3 NUS ISB Official Live Adapter

Only implement if permission or official access exists.

Tasks:

1. Document permission source.
2. Document endpoint terms and rate limits.
3. Build server-side adapter.
4. Normalize response into internal models.
5. Add cache and failure handling.
6. Add live vehicle layer.
7. Add crowd level display if permitted.

Acceptance criteria:

- Permission documentation exists.
- Tokens are server-side only.
- Live data has timestamps.
- Stale data is detected and labeled.
- UI distinguishes live, stale, and unavailable states.

## 12. Phase 3: NUSMods Intelligence

Goal:

Use NUSMods data to make the map student-aware.

### 12.1 Features

Required:

- Search by module code.
- Show module lesson venues.
- Map venue codes to buildings where possible.
- Show confidence level for venue mappings.
- Suggest nearest relevant bus stop for a venue.

Optional:

- Personal timetable import.
- `Next class` workflow.
- Calendar integration.

### 12.2 Venue Mapping Rules

Do not assume every NUSMods venue maps cleanly to a building.

Mapping confidence:

- `high`: exact room/building known.
- `medium`: building known, room unknown.
- `low`: inferred from prefix.
- `unknown`: cannot map safely.

Examples:

- `COM3-01-23` may map to COM 3 if building prefix is verified.
- `LT27` may map to LT 27 if verified.
- Ambiguous abbreviations must not be guessed silently.

### 12.2.1 Search And Venue Normalization

Normalize search queries and venue codes before matching:

- lowercase for matching, preserve original for display
- trim leading/trailing whitespace
- collapse repeated spaces
- remove punctuation only in a secondary normalized key
- compare both compact and spaced forms

Required examples:

```text
COM3 -> COM 3
COM 3 -> COM 3
Computing 3 -> COM 3, if alias is verified
COM3-01-23 -> building COM 3, floor 01, room 23, if pattern is verified
LT27 -> LT 27
LT 27 -> LT 27
UTOWN -> University Town, if alias is verified
CLB -> Central Library, only if alias is verified
```

Do not infer a room exists from a venue-code pattern unless room data is verified. A pattern may identify a likely building while the room remains `unknown`.

### 12.3 Acceptance Criteria

- At least 10 known venue patterns map to places.
- Unknown venue codes show a helpful fallback.
- Mapping source and confidence are inspectable.
- No venue is silently mapped without confidence metadata.

## 13. Phase 4: 3D Campus Detail

Goal:

Improve the visual campus model while keeping performance acceptable.

### 13.1 Features

- Building extrusions for key NUS areas.
- Custom styles for landmark buildings.
- Route overlays visible in pitched 3D view.
- Selected building highlighting.
- Optional terrain if it improves navigation and does not harm performance.

### 13.2 Terrain Guidance

Terrain is optional. Test before committing.

Prototype requirements:

- Verify elevation source and license.
- Check alignment with NUS roads/buildings.
- Test mobile performance.
- Confirm terrain does not make labels or route overlays confusing.

Do not add terrain only for visual flair if it damages usability.

Terrain extent guidance:

- Terrain may be loaded for a limited extent in early prototypes to control performance and data size.
- A visible square terrain boundary is acceptable in internal prototypes only.
- Before shipping to users, terrain must transition gracefully at its boundary by fading to flat map, using a natural crop, or disabling pitched terrain outside the supported area.
- Terrain extent must be data-driven, not hardcoded into rendering components.
- Store terrain coverage metadata in the same source/extent system used for campus bounds.
- If multiple campuses are supported, each campus may have a different terrain status: `unavailable`, `prototype`, `supported`, or `disabled-for-performance`.

### 13.3 Acceptance Criteria

- 3D mode has stable frame rate on target devices.
- Labels remain readable.
- Map controls remain usable.
- 3D buildings align with base map.
- Visual style is consistent and not misleadingly precise where heights are approximate.
- Terrain and 3D detail boundaries do not create an obvious unfinished square in the user-facing map.

## 14. Phase 5: Indoor Navigation

Goal:

Support building interiors for selected buildings only after data and routing model are proven.

### 14.0 Indoor Data Acquisition And QA Gate

Do not build indoor routing until this gate passes for at least one building.

Required artifacts:

- legal source or permission for floor-plan data
- floor list with naming convention
- room/POI inventory
- entrances and outdoor connection points
- vertical connectors: lifts, stairs, ramps, escalators
- inaccessible/private areas marked
- confidence score per floor
- manual QA notes

Indoor data restrictions:

- Do not include restricted, staff-only, security-sensitive, or private areas unless explicitly permitted.
- Do not claim emergency evacuation routing.
- Do not present indoor routes as safety instructions.
- Do not infer accessible routes without validating lifts/ramps/step-free paths.
- Do not assume floor numbering is consistent across buildings.

QA requirements:

- visual check each floor against the source
- verify room labels for a sample of rooms
- verify floor transitions connect to the correct floors
- verify entrances align with outdoor map
- record known missing corridors/rooms/connectors

### 14.1 Start Small

Initial indoor targets:

- COM 3
- Central Library
- UTown
- Yusof Ishak House
- one Engineering or Science block

Choose buildings based on available legal floor-plan data and student usefulness.

### 14.2 Indoor Data Model

Required entities:

- building
- floor
- room
- corridor
- entrance
- stairs
- lift
- escalator
- ramp
- accessible path
- toilet
- service point
- indoor POI

### 14.3 Indoor Routing Graph

Nodes:

- room entrances
- corridor intersections
- lift doors
- stair landings
- building entrances
- outdoor connection points

Edges:

- walkable corridor segments
- stairs
- lift transitions
- ramps
- outdoor connections

Edge metadata:

- distance
- estimated time
- accessibility
- floor transition
- sheltered
- opening hours if relevant
- confidence

### 14.4 Acceptance Criteria

- One building has a complete floor graph for at least two floors.
- User can route from one indoor room to another in the same building.
- User can route from an indoor room to a nearby outdoor bus stop.
- Lift/stair instructions are explicit.
- Accessibility mode avoids stairs where possible.
- Missing indoor data is clearly communicated.

## 15. UI/UX Principles

### 15.0 Visual North Star

The app should feel like a serious navigation product for NUS, not a generated dashboard, marketing landing page, or generic component demo.

Primary aesthetic direction:

- Use Apple Maps as the primary visual benchmark for clarity, hierarchy, calm colors, readable labels, restrained controls, smooth camera motion, and trustworthy cartography.
- Use NTU Map as the feature benchmark for campus-specific 3D buildings, indoor cutaways, bus stops, route guidance, and live vehicle movement.
- Adapt the final language to NUS geography and student workflows instead of copying either reference literally.
- Use NTU Map-like 3D campus specificity where it helps campus recognition: recognizable building massing, selected-building emphasis, indoor cutaway mode later, and route/bus overlays that feel integrated with the map.
- Prefer Apple Maps clarity over NTU Map illustration when the two conflict. The map must remain legible, scannable, and useful on a phone outdoors.
- Treat 3D as a navigation aid, not decoration. Every 3D effect must help recognition, orientation, routing, or spatial understanding.
- The intended result is Apple Maps-level restraint with NTU Map-level campus specificity.

NUS-specific identity:

- The interface should feel institutional, precise, and campus-native, not startup-generic.
- Use NUS identity sparingly: restrained blue/orange accents may appear in selection, route, or brand moments, but must not dominate the map.
- Campus landmarks, faculty clusters, shuttle stops, slopes, covered paths, and building entrances are more important than generic POI decoration.
- Avoid tourist-map illustration unless it directly improves campus recognition.

Design acceptance criteria:

- A first-time NUS student can identify map, search, current location, selected place, route, and bus timing areas within 5 seconds.
- The first screen is map-first. UI panels and controls must never dominate the default view.
- Visual styling must be explainable as navigation-product styling, not as a trend.
- The app must look credible beside Apple Maps, Google Maps, Citymapper, Transit, or NTU Map, even if the data scope is smaller.

### 15.1 Product Shape

Build an actual map tool, not a marketing page.

Primary first-screen experience:

- map
- search
- selected-place detail
- layers/transit controls

### 15.1.1 Map-First Layout Budget

The map is the product surface. UI chrome must be subordinate to the map.

Hard limits for default mobile view:

- Search and controls may cover no more than 20% of the viewport before interaction.
- The collapsed bottom sheet may cover no more than 45% of the viewport.
- The map must remain directly pannable in the default state.
- Do not place dashboards, welcome panels, feature summaries, or empty explanatory cards over the map.
- The first screen must show actual campus geography, not a decorative placeholder map or static image.

A UI prototype fails visual review if it looks like a dashboard containing a map instead of a map with task controls.

### 15.2 Mobile First

Campus navigation is mostly mobile.

Required mobile patterns:

- bottom sheet for place details
- thumb-accessible controls
- map remains visible while sheet is partially open
- search can expand without destroying context
- route and bus information must fit without overlap
- panels should use compact, information-dense layouts; avoid oversized empty padding
- controls must avoid the iOS status bar, home indicator, browser UI, and bottom-sheet drag handle zones
- bottom sheets must have defined collapsed, half, and expanded states
- the collapsed state should preserve at least 55% of the map viewport on a typical phone
- the expanded state may cover most of the map only for search results, step-by-step directions, or detailed transit information

Bottom sheet density rules:

- A selected-place collapsed sheet should show name, type/status, one primary action, and one or two key facts.
- Bus stop sheets should prioritize route code, destination/direction, ETA, and truth label.
- Avoid large thumbnails, marketing copy, decorative illustrations, and empty vertical padding.
- Use dividers, rows, and compact grouped sections instead of nested cards.

### 15.3 Avoid Current uNivUS UI Pitfalls

Screenshots reviewed on 2026-09-17 show issues to avoid:

- overcrowded markers
- large bottom sheet consuming too much map area
- unclear hierarchy
- repeated bus icons with poor clustering
- route display that is hard to scan
- controls competing with map content

Required improvements:

- marker clustering or priority-based marker visibility
- clean route color system
- compact ETA cards
- clear distinction between map mode, route mode, search mode, and details
- avoid hiding the map under excessive panels

### 15.3.1 Avoid Generic AI / Vibecoded UI

Do not use common generated-app styling unless an ADR explicitly justifies it for this map product.

Banned or strongly discouraged patterns:

- purple-to-blue gradients as primary background, hero, buttons, cards, or route styling
- gradient hero text
- emoji in headings, navigation, buttons, empty states, or map markers
- generic `Inter everywhere` typography without a product typography decision
- colored-border feature cards
- glassmorphism cards, frosted cards, or translucent panels that reduce map legibility
- low-contrast dark mode
- repeated "three icon cards in a row" feature sections
- badge/eyebrow text above every heading
- Lucide icons used everywhere without a map-specific icon system
- untouched shadcn/ui defaults
- fade-in-on-scroll animation
- cursor-following beams, glow trails, blobs, bokeh, decorative orbs, or spotlight effects
- hover fades as the main interaction feedback
- inconsistent spacing or one-off margins
- em dashes as a copywriting crutch
- generic buzzwords such as "seamless", "beautiful", "revolutionary", "AI-powered", "next-gen", or "unlock campus mobility"
- serif italic accent words
- Space Grotesk plus Instrument Serif pairing
- grain textures over gradients
- oversized rounded cards floating over the map
- nested cards inside bottom sheets
- decorative stats cards unrelated to navigation
- landing-page hero sections before the map
- fake testimonial, pricing, feature-grid, or marketing sections
- monochrome purple, blue-purple, beige, slate, or espresso palettes

Allowed visual language:

- restrained neutral map UI with high contrast text
- route colors used for route identity, not decoration
- crisp icon buttons for map controls
- compact bottom sheets with clear section dividers
- subtle elevation/shadow only where it separates controls from map content
- color used sparingly for selected state, route identity, alerts, and data truth labels
- clear typography scale tuned for dense navigation information

If a developer or LLM adds any discouraged pattern, they must remove it or document:

- why it is necessary for navigation
- where it appears
- what alternative was considered
- screenshots proving it does not make the app look generic or reduce usability

### 15.3.2 Map And 3D Visual Style

The map style must be designed as a layered cartographic product.

Base map rules:

- Keep land, roads, paths, water, and greenery visually quiet so campus overlays are readable.
- Avoid saturated backgrounds.
- Avoid heavy outlines on every object.
- Use label density rules by zoom level; do not show every POI at once.
- Use clustering, collision handling, or priority ranking for markers.
- Preserve enough contrast for outdoor use on phone screens.

Cartographic hierarchy rules:

- At campus overview zoom, show only high-priority buildings, major roads/paths, transit routes, selected route stops, and major landmarks.
- At building zoom, reveal secondary paths, entrances, nearby facilities, and more labels.
- At stop/detail zoom, reveal stop sequence, route direction, ETAs, and nearby transfer context.
- Never show all buildings, all POIs, all route stops, and all labels at the same visual priority.
- Labels must use collision handling or priority ordering. Manual label placement is allowed only with documented reason.
- Selected objects get the strongest emphasis; related objects get secondary emphasis; unrelated map content must visually recede.

Camera rules:

- Default load should use a useful campus overview, not a global map zoom or over-tight building crop.
- Pitch is allowed only when it improves orientation or building recognition.
- Avoid extreme pitch that hides paths, stop labels, or route geometry.
- Selected-place camera movement should preserve surrounding context.
- Route mode should frame origin, destination, and relevant transfer/stop context where possible.
- Camera transitions should feel calm and direct, not theatrical.

3D building rules:

- Phase 0 and MVP 1 may use simple extrusions. They must be aligned and clearly sourced.
- Important NUS buildings may receive custom materials or manually improved geometry only after source/provenance is documented.
- Approximate building heights must not look more precise than the data allows.
- Use soft neutral building materials. Avoid shiny plastic, neon, cartoon colors, and game-like shading.
- Buildings should have subtle shadows/ambient occlusion once 3D detail is introduced. Shadows help depth perception and wayfinding, but they must not hide paths, entrances, labels, route lines, bus stops, or accessibility cues.
- Avoid harsh black shadows, overdramatic sunset lighting, and game-engine lighting that makes the map feel like a rendered scene instead of a navigation tool.
- Selected buildings may be emphasized with a subtle outline, tint, or vertical highlight; do not cover the building with a large glowing blob.
- Roofs, courtyards, and void decks should be simplified unless they matter for recognition or indoor transition.
- If indoor/cutaway mode is active, fade or clip irrelevant building shell geometry instead of making the whole map visually noisy.

Lighting and time-of-day rules:

- Time-aware styling is desirable after the base 3D map is stable.
- Day, dusk, and night styles must be separate tested map states, not just a global brightness filter.
- Night mode should improve low-light usability while preserving label contrast, route colors, attribution, selected-place focus, and safety/accessibility information.
- If the app follows real local time, provide a manual override because users may plan routes for later or prefer a fixed visual mode.
- Use Singapore local time for automatic day/night decisions unless the user explicitly changes the planning time.
- Do not imply buildings have real live window occupancy. Lit windows may be a stylized night material only and must not represent actual occupancy, opening hours, or room activity.
- Time-aware bus or venue states must come from verified timestamps/data, separate from visual night mode.

Route and vehicle overlay rules:

- Routes must stay readable in pitched 3D view.
- Animated buses must follow verified route geometry or be clearly marked as prototype/estimated.
- Moving bus animation should be smooth but not theatrical.
- Route color must be stable across the app and readable in light/dark modes.
- Direction arrows should be visible only when useful; avoid repeating arrows so densely that they clutter the map.

Route color rules:

- Route colors must be assigned from a limited registry and tested together on the map.
- Adjacent or overlapping routes must remain distinguishable without relying only on hue.
- Do not use gradients for route lines.
- Do not use arbitrary bright colors for visual excitement.
- Route emphasis should come from selection, line weight, casing, and labels, not saturation alone.

Apple Maps vs NTU Map guidance:

- Apple Maps is the benchmark for interaction clarity, mobile polish, restraint, and label hierarchy.
- NTU Map is the benchmark for campus-specific 3D detail, indoor cutaway ambition, and integrated shuttle/room navigation.
- For NUS Maps, use Apple-like restraint as the default and selectively add NTU-like 3D detail where NUS-specific context matters.
- Do not copy Apple, Google, NTU Map, uNivUS, or Finute visual assets, proprietary map styles, icons, or route data. Use them only as inspiration.

### 15.3.3 Design System Requirements

Before MVP 1, create a small design system instead of styling screens ad hoc.

Required artifacts:

- `docs/design.md`: visual direction, references, non-goals, and screenshots of accepted prototypes
- `src/styles/tokens.*` or equivalent: colors, typography, spacing, radius, shadows, z-index, and motion
- route color registry
- map layer style registry
- icon usage guide for map controls, places, transport, accessibility, and alerts
- component states for buttons, search input, bottom sheets, map markers, ETA rows, route pills, and truth labels

Icon rules:

- Use a small fixed icon vocabulary for search, location, layers, routes, stops, buildings, entrances, accessibility, alerts, and indoor transitions.
- Do not mix multiple icon families unless documented in `docs/design.md`.
- Map markers should be custom to the product system, not raw library icons dropped on pins.
- Icons must remain legible at mobile map scale and must not require color alone to distinguish critical states.

Token rules:

- Use 4px or 8px spacing rhythm. One-off spacing values require a local reason.
- Cards, sheets, and controls should use restrained radii. Avoid huge pill cards except for search bars and route pills where it matches mobile map conventions.
- Shadows should be functional, not decorative.
- Motion should be short and purposeful: sheet transitions, marker selection, route reveal, camera movement.
- No scroll-triggered reveal animations.
- Avoid adding a UI library component without restyling it to the product system.

Typography rules:

- Choose typography for legibility in dense map UI.
- Do not use decorative serif/italic pairings.
- Do not use giant hero-scale text inside map panels.
- Labels, ETAs, route names, and room codes must fit on small screens.
- Truncate only when the full text is available elsewhere, such as in a detail sheet.

### 15.4 Truth Labels

Transit and routing data must use exact state labels:

- `Live`: fresh data from an approved live source.
- `Stale`: previously live data older than the configured freshness window.
- `Static route`: route/stop geometry without live ETAs.
- `Estimated`: computed from schedules, frequencies, or interpolation.
- `Unavailable`: data source is down or unsupported.
- `Permission required`: feature needs official data access before it can be enabled.
- `Prototype`: fake or placeholder data used for technical validation.

Display rules:

- `Live` requires a visible or inspectable timestamp.
- `Stale` must show last updated time.
- `Estimated` must never use the same visual treatment as `Live`.
- `Prototype` data must not appear in production builds unless a debug flag is enabled.
- `Permission required` should explain the missing official access without exposing private endpoint details.

### 15.5 Failure Modes

The app must handle:

- map tile load failure
- WebGL unsupported
- geolocation denied
- geolocation unavailable
- external API timeout
- stale live feed
- no search results
- selected place missing geometry
- route calculation failure

Minimum UI behavior:

- show a concise error or empty state
- keep the rest of the app usable
- do not crash the map
- do not display stale or placeholder data as live

### 15.6 Accessibility

Minimum requirements:

- interactive controls are keyboard reachable
- icon-only buttons have accessible labels
- route colors are not the only differentiator; include route text labels
- color contrast should meet WCAG AA where practical
- bottom sheets/modals manage focus
- map markers that open details must have accessible names
- loading/error states must be available to screen readers

### 15.7 Privacy

Location and timetable features must be privacy-preserving by default.

Rules:

- Do not request geolocation until the user triggers a location-dependent feature.
- Do not store precise user location unless explicitly required and approved.
- Personal timetable data should stay local by default.
- Do not send module timetable or location data to analytics.
- If analytics are added later, they must not include precise movement traces.
- Provide clear permission prompts for geolocation.

### 15.8 Visual QA And Design Review

Any UI-affecting task must produce screenshots before it is accepted.

Accepted screenshots should be committed under `docs/screenshots/` or otherwise linked from `docs/design.md`. These screenshots must be captured from the running local app, staging deployment, production deployment, or another real rendered app surface by the implementer. Do not use user-provided chat images, reference screenshots, competitor screenshots, mockups, or screenshots of GitHub as accepted app-state screenshots. UI and map PRs should embed or link the relevant screenshots in the PR description so every prototype checkpoint can be visually compared later during review, rollback, or redesign work.

Before capturing or judging screenshots, refresh or restart the local preview after branch changes, merges, generated-data updates, or dev-server uncertainty. Record the URL and viewport. If the browser still appears to show an older prototype state, verify the active branch and commit before accepting the screenshot.

Visible prototype labels must match the current checkpoint or the selected feature state. Do not leave an old prototype label as the default panel after completing a later prototype. If a prototype has no visible map change, use a neutral current-phase overview panel or remove the prototype-specific default panel.

When starting or completing a new prototype or phase, search the repository for stale current-phase references from previous prototypes and update or remove them before claiming completion. This includes README current phase text, default app panels, screenshot captions, PR bodies, review docs, design docs, and any user-facing labels.

For each committed screenshot, record:

- the app URL or preview URL captured
- the viewport or device class
- the feature state shown
- whether it is an accepted checkpoint or rejected visual QA example

Required screenshot set:

- mobile portrait at a campus overview zoom
- mobile portrait with one selected building
- mobile portrait with one selected bus stop and ETAs
- mobile portrait with route overlay active
- desktop viewport at a pitched 3D angle
- one error or unavailable-data state if the task touches external data

Review checklist:

- Map remains the primary object on screen.
- No UI overlaps status bar, browser chrome, map controls, bottom sheet handle, or home indicator.
- No marker cluster becomes unreadable.
- Selected state is obvious without hiding nearby context.
- Route labels and colors remain legible.
- Data truth labels are visible where needed.
- Attribution remains visible.
- Controls look like one product, not mixed component-library defaults.
- None of the banned vibecoded patterns in section 15.3.1 appear.

Automatic visual rejection conditions:

- The screenshot could be mistaken for a SaaS dashboard, landing page, or component demo.
- The map is visually secondary to panels, cards, headings, or decorative UI.
- Route lines, building fills, markers, and labels compete at equal intensity.
- More than one primary accent color is used outside route identity, selected state, alert state, or truth labels.
- The bottom sheet feels like a generic card stack rather than a mobile map sheet.
- Controls use unmodified component-library defaults.
- The selected building or route is unclear within 3 seconds.
- A mobile screenshot has any illegible ETA, route code, room code, or primary action.

If any screenshot fails, fix the UI before expanding feature scope.

## 16. Testing And Verification

### 16.0 Default Test Commands

Once the repository is scaffolded, define these commands in `package.json` or document why a command is not applicable:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run validate:data
npm run build
```

Minimum expectations:

- `lint`: no errors.
- `typecheck`: no TypeScript errors.
- `test`: unit tests pass.
- `test:e2e`: critical map/search smoke tests pass when implemented.
- `validate:data`: source metadata, coordinates, schemas, and attribution pass.
- `build`: production build succeeds and does not expose secrets.

CI should run at least `lint`, `typecheck`, `test`, `validate:data`, and `build` before any production deployment.

### 16.1 Required Test Types

For each phase, include the appropriate subset:

- unit tests for data transforms
- schema validation tests
- geospatial bounds tests
- API adapter tests with mocked responses
- visual smoke tests for map rendering
- mobile viewport layout tests
- accessibility checks for controls
- performance checks for large layers

### 16.2 Geospatial Validation

Test that:

- coordinates are valid longitude/latitude
- geometries are within expected NUS bounds
- route stop sequences reference existing stops
- building centroids are inside or near building polygons
- no displayed entity lacks source metadata

### 16.3 Live Data Validation

For live feeds:

- reject stale timestamps
- display stale state
- cache with documented TTL
- handle API errors gracefully
- log adapter failures without crashing map
- never show old data as live

### 16.4 Manual QA Checklist

Before marking a phase complete:

- Open app on desktop viewport.
- Open app on mobile viewport.
- Capture the section 15.8 screenshot set for UI-affecting work.
- Search for `COM 3`.
- Select a bus stop.
- Toggle route overlay.
- Pan and zoom around NUS.
- Confirm attribution is visible.
- Confirm no console errors.
- Confirm no layout overlap.
- Confirm source statuses are traceable.
- Confirm the map remains the primary screen object.
- Confirm no banned vibecoded pattern from section 15.3.1 appears.
- Confirm controls, sheets, markers, and route labels use the documented design tokens or justified local variants.
- Confirm the implementation still matches `docs/design.md`; update `docs/design.md` before accepting intentional design changes.

### 16.5 Performance Budgets

Initial budgets for Phase 0 and MVP 1:

- initial app load on a typical laptop: under 3 seconds on a normal broadband connection
- initial app load on mobile viewport during local testing: under 5 seconds after dev server is ready
- map pan/zoom interaction: visually smooth, target 30 FPS minimum on a modern phone
- single loaded GeoJSON file for browser rendering: keep under 5 MB; above that, evaluate vector tiles or PMTiles
- unclustered visible markers: keep under 100; above that, add clustering or priority filtering
- production JS bundle warning threshold: document if initial bundle exceeds 1 MB compressed

These are starting budgets, not final product SLAs. If exceeded, document the reason and mitigation.

### 16.6 Data Refresh And Revalidation

Add a `validate:sources` or equivalent check before MVP 1.

It must report:

- sources missing required metadata
- sources past `next_review_at`
- sources with required attribution missing
- sources marked `requires-permission` but used by production features
- prototype data included in production build

## 17. Deployment And Secrets

### 17.1 Secrets

Never expose these in frontend bundles:

- LTA AccountKey
- official NUS/uNivUS/ConnectX tokens
- backend service credentials
- database credentials

Use environment variables and server-side proxies.

### 17.2 Deployment

Early prototype:

- local dev server

MVP:

- static frontend hosting where possible
- backend API for secrets and live data
- hosted PostGIS if needed

### 17.3 Observability

Track:

- map load failures
- API adapter failures
- stale live feed events
- slow tile/data loads
- search zero-result queries
- route calculation failures

## 18. Documentation Requirements

Maintain:

- `PLAN.md`: product and implementation contract.
- `README.md`: setup and run instructions.
- `data/sources.yml`: data inventory.
- `docs/research-log.md`: dated research evidence, source claims, and confidence levels.
- `docs/design.md`: visual direction, accepted/rejected screenshots, design tokens, and visual QA notes.
- `docs/api-adapters.md`: external API behavior and constraints.
- `docs/data-pipeline.md`: how to refresh/process data.
- `docs/decisions/`: architecture decision records.

Every major implementation choice should link back to either:

- a plan section
- an ADR
- a verified source

## 19. Milestone Checklist

### 19.1 Ready For Phase 0

- [ ] repository scaffold exists
- [ ] `AGENTS.md` exists
- [ ] `PLAN.md` exists
- [ ] developer has read operating rules

### 19.2 Ready For MVP 1

- [ ] Phase 0 base map complete
- [ ] Phase 0 one-building extrusion complete
- [ ] Phase 0 shuttle route overlay complete
- [ ] Phase 0 search/detail prototype complete
- [ ] Phase 0 data pipeline complete
- [ ] Phase 0 visual direction prototype complete
- [ ] `docs/design.md` exists and includes accepted screenshots
- [ ] initial design tokens or token plan exists
- [ ] banned vibecoded patterns from section 15.3.1 are absent from accepted screenshots
- [ ] data inventory exists
- [ ] stack decision documented

### 19.3 Ready For Transit MVP

- [ ] LTA access strategy documented
- [ ] NUS ISB live access status documented
- [ ] static NUS route fallback exists
- [ ] UI can label live/static/stale states

### 19.4 Ready For Indoor Work

- [ ] legal indoor data source exists
- [ ] one building selected
- [ ] indoor schema designed
- [ ] routing graph prototype accepted

## 20. Open Questions

These must be resolved or explicitly deferred:

```yaml
- question: "Can official NUS/uNivUS/ConnectX API access be obtained for student or research projects?"
  blocks_phase: "Phase 2 live NUS ISB adapter"
  default_if_unresolved: "Use static/estimated NUS ISB mode only."

- question: "What are the exact terms for using NUS public campus map data?"
  blocks_phase: "MVP 1 if NUS map data is used as structured data"
  default_if_unresolved: "Use as human reference only; do not copy structured data."

- question: "Which source should provide building heights?"
  blocks_phase: "Phase 4 3D campus detail"
  default_if_unresolved: "Use clearly labeled approximate heights or flat footprints."

- question: "Is terrain useful enough for NUS navigation to justify complexity?"
  blocks_phase: "Phase 4 terrain work"
  default_if_unresolved: "Do not implement terrain."

- question: "Which NUS buildings matter most for the first indoor pilot?"
  blocks_phase: "Phase 5 indoor navigation"
  default_if_unresolved: "Do not start indoor modeling."

- question: "Should the first student workflow be find building, next class, or best shuttle route?"
  blocks_phase: "MVP 1 product prioritization"
  default_if_unresolved: "Prioritize find building and bus stop search."

- question: "What are the target devices and minimum acceptable mobile performance?"
  blocks_phase: "MVP 1 release"
  default_if_unresolved: "Use the initial performance budgets in section 16.5."

- question: "Should user accounts exist, or should preferences stay local-only?"
  blocks_phase: "Any account or cloud preference feature"
  default_if_unresolved: "Keep preferences local-only."
```

## 21. Immediate Next Actions

Do these in order:

1. Scaffold a minimal app.
2. Create `data/sources.yml`.
3. Implement Phase 0 Prototype A.
4. Document map source and attribution.
5. Implement Phase 0 Prototype B for one building.
6. Implement Phase 0 Prototype C for one shuttle route.
7. Implement Phase 0 Prototype D for search and detail sheet interaction.
8. Implement Phase 0 Prototype E for the repeatable data pipeline.
9. Implement Phase 0 Prototype F for visual direction and map UI.
10. Review Phase 0 results before starting MVP 1.
