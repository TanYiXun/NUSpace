# De-Prototype Map, Transit, And 3D Surfaces

Status: accepted for the current refinement checkpoint.

Plan sections touched:

- `PLAN.md` section 11.2, NUS ISB static mode.
- `PLAN.md` section 13, Phase 4 3D campus detail.
- `PLAN.md` section 15.4, truth labels and disclaimers.

## Decision

Do not expose the historical D1 prototype route as normal user-facing shuttle routing.

The app may continue improving sourced, non-routing map surfaces:

- OSM building footprint visualization.
- Procedural facade bands and roof caps generated from sourced footprints for visual depth.
- OSM seed bus-stop markers with unverified-position labels.
- LTA DataMall public bus arrivals through the server-side adapter.
- NUSMods building-level venue lookup with confidence labels.

The app must block or label as unavailable:

- NUS shuttle route geometry.
- NUS shuttle stop sequences and exact boarding-point positions.
- Live NUS shuttle arrivals, vehicles, and crowd levels.
- Terrain rendering.
- NTU Map or Finute Maps style xray floor detail until a one-building model and legal floor metadata exist.
- Indoor maps and routing.

## Rationale

The current D1 route and stop files are useful as historical prototype fixtures, but they are not verified route geometry or verified stop positions. Keeping them available as normal map controls risks making the app look more complete than the data allows.

The current 3D building work is sourced from OSM footprints and approximate visual heights. Procedural facade and roof details can make the map less slab-like, but they are still not official building models or NTU Map-quality custom meshes.

Terrain needs its own source and QA gate because elevation tiles affect licensing, map alignment, performance, and user trust.

The NTU Map/Finute Maps reference points to a future implementation path: one building-specific model, a selected-building xray shell, and a floor selector. That should be implemented as a dedicated slice under `PLAN.md` section 13.1.1 before broad 3D campus expansion. It must not copy proprietary NTU/Finute assets or imply indoor room-level data before the indoor gate passes.

## Data Needed Later

To implement real NUS shuttle routing, obtain one of:

- official NUS, uNivUS, or ConnectX permission and route data
- public documentation that explicitly permits route geometry and stop position use
- a documented field-survey dataset with method, accuracy estimate, reviewer, and ship status

To implement terrain, document:

- elevation source
- license and attribution
- campus alignment result
- mobile performance result
- boundary treatment so the terrain does not create an obvious unfinished square

To implement one NTU-style building/xray slice, document:

- building-specific model or procedural mesh source
- floor count and floor naming source
- entrance alignment source
- whether the xray is shell-only or verified indoor detail
- mobile frame-rate and screenshot QA
