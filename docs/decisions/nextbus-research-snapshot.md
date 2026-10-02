# NUS NextBus Research Snapshot

Status: labelled research display only, requires permission before production use.

Plan sections touched:

- `PLAN.md` section 7.1, manual geometry rules.
- `PLAN.md` section 11.2, NUS ISB static mode.
- `PLAN.md` section 15.4, truth labels.

## Decision

Keep the NUS NextBus codelab API extraction as a research snapshot only.

The Google Developers codelab documents the NUS NextBus base URL, Basic Auth credentials, and endpoint names for a learning workshop. On 2026-10-01, those credentials returned:

- `/BusStops`: 33 bus stops with names, captions, short/long names, and latitude/longitude.
- `/Announcements`: four announcement records.
- `/ShuttleService?busstopname=<stop.name>`: parseable per-stop route/ETA payloads for all 33 bus stops.
- `/ShuttleService` without `busstopname`: `Bus stop not found!`.

Three stops fall outside the current Kent Ridge validation bounds and are retained only as whitelisted Service P/Bukit Timah-context research records:

- `CG`, College Green.
- `OTH`, Oei Tiong Ham Building.
- `BG-MRT`, Botanic Gardens MRT (PUDO).

The processed static research file is:

- `data/processed/nextbus-research/nus-nextbus-static-snapshot.json`

The app-facing curated inventory derived from it is:

- `data/curated/phase2-nus-isb-bus-stops.json`

Raw response files are under:

- `data/raw/nextbus-research/`

## Use Rules

Do not use this snapshot as production shuttle truth until permission and terms are documented.

Allowed for now:

- Researching likely NUS ISB stop names.
- Comparing OSM seed markers against retired NextBus coordinates.
- Designing future static-stop and route-membership schemas.
- Planning a permissioned adapter.
- Rendering all 33 captured stops as clearly labelled `requires-permission` research markers with no live ETA claims.

Not allowed yet:

- Marking stop coordinates as `verified`.
- Displaying NextBus-derived routes as current official shuttle routes.
- Displaying old ETA, vehicle plate, job id, or announcement payloads as live data.
- Redistributing the dataset as approved official NUS data.

## Verification

`npm run validate:data` enforces:

- Snapshot source id is `nus-nextbus-codelab-api`.
- Snapshot status remains `requires-permission`.
- Every stop coordinate is inside the NUS validation bounds.
- Service P/Bukit Timah-context research stops outside Kent Ridge are explicitly whitelisted by stop name.
- Every stop record preserves the source id and permission status.
- Route references preserve route name, bus stop code, and snapshot timestamp.
- The curated app-facing stop inventory includes every NextBus snapshot stop.

## Next Step

If official NUS, uNivUS, ConnectX, or NextBus permission is obtained, promote only the allowed fields into a curated dataset with updated source metadata and UI truth labels.
