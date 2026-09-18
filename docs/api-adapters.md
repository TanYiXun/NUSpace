# API Adapters

No external API adapters exist yet.

Phase 0 Prototype A loads a public MapLibre style URL directly in the browser. No NUS, uNivUS, ConnectX, LTA DataMall, NUSMods, or backend API integration has been added.

Phase 1 currently reads curated local datasets from the repository:

- `data/curated/mvp1-campus-places.json`
- `data/curated/mvp1-building-footprints.geojson`

These files are OSM-sourced curated data, not runtime API adapters. The D1 prototype route remains local prototype data and is hidden by default because it is not source-confirmed MVP route geometry.

## Phase 2 Transit Adapter Boundary

No live transit adapter exists yet.

Planned adapter boundary:

- Public bus arrivals may use LTA DataMall after a server-side `LTA_DATAMALL_ACCOUNT_KEY` exists.
- Frontend code must never contain the LTA AccountKey.
- A project backend endpoint should normalize public bus arrival responses before UI rendering.
- Missing keys, upstream failures, and stale data must return explicit unavailable or stale states.
- NUS ISB live arrivals, live vehicle positions, and crowd levels remain unavailable until official NUS, uNivUS, or ConnectX access is documented.

See `docs/decisions/phase-2-transit-plan.md` for the Phase 2 source and adapter plan.
