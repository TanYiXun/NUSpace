# API Adapters

No external API adapters exist yet.

Phase 0 Prototype A loads a public MapLibre style URL directly in the browser. No NUS, uNivUS, ConnectX, LTA DataMall, NUSMods, or backend API integration has been added.

Phase 1 currently reads curated local datasets from the repository:

- `data/curated/mvp1-campus-places.json`
- `data/curated/mvp1-building-footprints.geojson`

These files are OSM-sourced curated data, not runtime API adapters. The D1 prototype route remains local prototype data and is hidden by default because it is not source-confirmed MVP route geometry.

## Phase 2 Transit Adapter Boundary

The development server exposes a server-side public bus arrivals endpoint:

```text
GET /api/transit/public-bus-arrivals?busStopCode=17099
```

Adapter boundary:

- Public bus arrivals may use LTA DataMall after a server-side `LTA_DATAMALL_ACCOUNT_KEY` exists.
- Frontend code must never contain the LTA AccountKey.
- The project endpoint normalizes public bus arrival responses before UI rendering.
- Missing keys return `missing_key` with HTTP 503.
- Invalid bus stop codes return `bad_request` with HTTP 400.
- Upstream failures return `upstream_error` with HTTP 502.
- Successful responses are cached in memory for 20 seconds per bus stop code.
- Arrival estimates older than five minutes are marked stale in the normalized response.
- NUS ISB live arrivals, live vehicle positions, and crowd levels remain unavailable until official NUS, uNivUS, or ConnectX access is documented.

The current UI calls this endpoint for `Heng Mui Keng Terrace` (`16069`) and shows the missing-key state when no server key is configured. The stop-code reference comes from NUS public transport access pages and is tracked separately from OSM campus markers in `data/curated/phase2-public-bus-stops.json`.

See `docs/decisions/phase-2-transit-plan.md` for the Phase 2 source and adapter plan.
