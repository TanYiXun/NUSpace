# API Adapters

No external API adapters exist yet.

Phase 0 Prototype A loads a public MapLibre style URL directly in the browser. No NUS, uNivUS, ConnectX, LTA DataMall, NUSMods, or backend API integration has been added.

Phase 1 currently reads curated local datasets from the repository:

- `data/curated/mvp1-campus-places.json`
- `data/curated/mvp1-building-footprints.geojson`

These files are OSM-sourced curated data, not runtime API adapters. The D1 prototype route remains local prototype data and is hidden by default because it is not source-confirmed MVP route geometry.
