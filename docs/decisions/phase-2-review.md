# Phase 2 Review

Status: public bus integration complete for the first LTA public bus stop.

Plan section targeted: `PLAN.md` section 11.1, Phase 2 public bus integration.

## Decision

Phase 2 can be reviewed as complete for the LTA public bus integration path:

- The LTA AccountKey is server-side only.
- The frontend calls the NUSpace endpoint, not LTA DataMall directly.
- The endpoint normalizes LTA-shaped public bus arrival responses.
- The endpoint returns explicit `missing_key`, `bad_request`, and `upstream_error` states.
- Successful responses are cached in memory for 20 seconds.
- The UI renders live-style public bus service rows when the endpoint returns `ok`.
- The UI labels data as LTA public bus data and keeps it distinct from NUS ISB shuttle data.
- Local live verification returned `ok` for stop `16069` with 8 public bus services after the AccountKey was configured in ignored `.env.local`.
- Public bus rows auto-refresh every 20 seconds while the app is open.
- Each shown timing displays the corresponding LTA vehicle type and wheelchair-accessibility feature when present, rather than summarizing only the first arriving bus in the row.

The phase is not complete for NUS shuttle live integration:

- No official NUS, uNivUS, or ConnectX access is documented.
- No live NUS shuttle arrivals, live vehicle positions, or crowd levels are enabled.
- No source-confirmed NUS ISB route geometry has been added.
- The current D1 route remains a hidden prototype route for route UI and animation testing only.

## Evidence

Implemented files include:

- `server/transit/ltaDataMall.ts`
- `server/transit/ltaPublicBusMiddleware.ts`
- `src/transit/publicBusArrivals.ts`
- `src/transit/publicBusStops.ts`
- `data/curated/phase2-public-bus-stops.json`

Testing covers:

- missing server key
- invalid bus stop code
- upstream failure
- stale arrival normalization
- cached response behavior
- UI normalization for missing-key and live rows
- Playwright missing-key overview
- Playwright mocked live public bus row display

Screenshot evidence:

- `docs/screenshots/phase2-live-public-bus-missing-key-desktop.png`
- `docs/screenshots/phase2-live-public-bus-live-desktop.png`

## Secret Handling

Do not commit the key. Do not paste it into frontend code. Do not include it in screenshots, logs, PR descriptions, or terminal output.

The local live verification used `.env.local`, which is ignored by git through the `*.local` rule.

## Next Recommended Phase

Proceed to Phase 3 only if the user accepts that Phase 2 NUS ISB live integration remains blocked by official-access requirements.

If more Phase 2 work is desired before Phase 3, add more public bus stop codes only when each code has documented source provenance.
