# API Adapters

Phase 2 adds the first server-side runtime API adapter for LTA DataMall public bus arrivals. No NUS, uNivUS, ConnectX, NUSMods, or indoor-routing API integration has been added.

Phase 0 Prototype A loads a public MapLibre style URL directly in the browser.

Phase 1 currently reads curated local datasets from the repository:

- `data/curated/mvp1-campus-places.json`
- `data/curated/mvp1-building-footprints.geojson`

These files are OSM-sourced curated data, not runtime API adapters. The D1 static route display remains local source-pending data and is hidden by default because it is not source-confirmed MVP route geometry.

## Phase 2 Transit Adapter Boundary

The development server exposes a server-side public bus arrivals endpoint:

```text
GET /api/transit/public-bus-arrivals?busStopCode=16069
```

Adapter boundary:

- Public bus arrivals use LTA DataMall only after a server-side `LTA_DATAMALL_ACCOUNT_KEY` exists.
- Frontend code must never contain the LTA AccountKey.
- The project endpoint normalizes public bus arrival responses before UI rendering.
- Missing keys return `missing_key` with HTTP 503.
- Invalid bus stop codes return `bad_request` with HTTP 400.
- Upstream failures return `upstream_error` with HTTP 502.
- Successful responses are cached in memory for 20 seconds per bus stop code.
- Arrival estimates older than five minutes are marked stale in the normalized response.
- NUS ISB live arrivals, live vehicle positions, and crowd levels remain unavailable until official NUS, uNivUS, or ConnectX access is documented.
- NUS ISB static mode is local UI data only; it uses NUS route-list references and keeps the D1 display corridor labelled source-pending.

The current UI calls this endpoint for `Heng Mui Keng Terrace` (`16069`). It shows the missing-key state when no server key is configured and renders service rows, upcoming minutes, load, accessibility feature, fetched time, and cache status when the endpoint returns `ok`. The stop-code reference comes from NUS public transport access pages and is tracked separately from OSM campus markers in `data/curated/phase2-public-bus-stops.json`.

Local verification on 2026-09-18 confirmed the endpoint returned `ok` for stop `16069` with 8 public bus services after `LTA_DATAMALL_ACCOUNT_KEY` was configured in ignored `.env.local`. The key was not committed or exposed to frontend code.

See `docs/decisions/phase-2-transit-plan.md` for the Phase 2 source and adapter plan.
