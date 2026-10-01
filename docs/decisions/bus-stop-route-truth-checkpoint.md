# Bus Stop And Route Truth Checkpoint

Status: accepted.

Plan sections touched:

- `PLAN.md` section 7.1, manual geometry rules.
- `PLAN.md` section 11.2, NUS ISB static mode.
- `PLAN.md` section 15.4, truth labels.

## Decision

Do not promote the current campus bus stop markers or D1 route display into production-quality transit data.

The current bus stop markers are OSM seed coordinates. They are useful for map/search interaction and rough campus context, but their exact boarding-point positions are unverified. They are now labelled `manual-reference` in the curated place seed and exposed in the UI as unverified seed positions.

The current D1 line was previously kept as an opt-in prototype route. It is not a static production route because both its route geometry and stop positions are not source-confirmed. The de-prototype checkpoint now removes normal user-facing paths into that dummy route until permitted route geometry and verified stop positions exist.

## Implementation

- OSM bus stop place entries are labelled `manual-reference`.
- Selected bus stop sheets show `Position: Unverified seed`.
- Layer and overview copy refer to `OSM seed markers`.
- NUSMods venue rows say `Nearest OSM seed stop`.
- The D1 surface is not exposed as a normal current route layer.
- Data validation fails if OSM bus stop seeds are marked as `verified`.

## Screenshots

- `docs/screenshots/bus-stop-coordinate-truth-mobile-selected.png`
- `docs/screenshots/prototype-route-truth-desktop.png`

## Next Data Needed

To replace these with real route/stop data, obtain one of:

- official NUS/uNivUS/ConnectX permission and data
- public documentation that explicitly permits route geometry and stop position use
- a documented field-survey dataset with collection method, accuracy estimate, reviewer, and ship status

Until then, do not implement live NUS ISB arrivals, official route geometry, or precise campus boarding points.
