# Phase 2 Transit Plan

Status: planning checkpoint.

Plan section targeted: `PLAN.md` section 11, Phase 2 Transit Layer.

Phase 2 should make transport information useful without weakening the project's data-access rules. The first Phase 2 checkpoint is therefore a source and adapter plan, not a live-data implementation.

## Source Findings

LTA DataMall:

- Official portal: `https://datamall.lta.gov.sg/`.
- Official dynamic datasets page: `https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html`.
- Dynamic APIs are live APIs and require an AccountKey issued to registered DataMall subscribers.
- DataMall lists `Bus Arrival` as returning real-time arrival information for public bus services at queried public bus stops, including ETA, estimated location, and load info.
- DataMall notices state that Bus Arrival v2 is decommissioned and the current implementation must not use deprecated v2 endpoints.

NUS ISB:

- No official NUS, uNivUS, or ConnectX production API permission exists in this repository.
- Do not implement a live NUS shuttle adapter until permission documentation exists.
- The current D1 corridor remains prototype-only and hidden by default.

## Adapter Decisions

1. Public bus arrivals may be implemented through LTA DataMall only after an AccountKey is available.
2. The LTA AccountKey must be server-side only.
3. The frontend must call a project backend endpoint, not DataMall directly with a key.
4. The adapter must normalize response timestamps and label stale or failed data.
5. LTA public bus data must be visually and textually separate from NUS ISB data.
6. NUS ISB live data remains unavailable unless official access is documented.
7. Static NUS route work may proceed only with verified or manually curated source-confirmed route geometry. Prototype route geometry must stay labelled as prototype.

## Initial Capability States

- Public bus arrivals: `requires_key`.
- Public bus route metadata: `requires_key`.
- NUS ISB static route layer: `source_pending`.
- NUS ISB live arrivals: `requires_official_access`.
- Live NUS vehicle positions: `requires_official_access`.
- Crowd level: `requires_official_access`.

## Next Implementation Slice

Recommended next slice: add a server-side public bus adapter boundary with a development mock and no committed secrets.

Minimum requirements for that slice:

- Define `LTA_DATAMALL_ACCOUNT_KEY` as a server-only environment variable.
- Add a backend endpoint for public bus arrivals.
- Return a safe unavailable state when the key is missing.
- Cache successful DataMall responses.
- Add tests for missing key, upstream failure, stale timestamp, and normalized response shape.
- Add UI copy that says public bus data comes from LTA DataMall.

Do not add live NUS ISB calls in the same slice.
