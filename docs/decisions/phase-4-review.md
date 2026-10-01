# Phase 4 Review: 3D Campus Detail

Status: accepted with constraints.

Plan section targeted: `PLAN.md` section 13, Phase 4 3D campus detail.

## Decision

Phase 4 is complete for the current sourced-campus-detail scope.

The implementation satisfies the required features:

- Building extrusions are visible for the curated Kent Ridge key-area footprint set.
- Selected buildings are highlighted in the 3D footprint layer, including non-COM3 buildings.
- Transit controls remain available in pitched 3D view, but NUS shuttle route geometry is not exposed as a normal route layer without verified data.
- A restrained landmark material tint is applied only to sourced landmark names already present in the curated footprint data.
- Selected building sheets expose levels, visual height, height-source status, and 3D-detail mode.

Terrain is not implemented because it is optional in section 13 and remains blocked until an elevation source, license, alignment check, and mobile performance result are documented.

## Acceptance Criteria

- 3D mode has a stable smoke-test baseline through the Playwright viewport suite.
- Labels remain readable in the accepted desktop and mobile screenshots.
- Map controls remain usable above the sheet and are covered by existing smoke tests.
- 3D buildings use OSM footprints and align with the existing basemap as far as the sourced footprint data allows.
- Approximate heights are labelled as `estimated-from-levels` or `prototype-placeholder` and are exposed in the selected-building sheet.
- Terrain boundaries are not applicable because terrain is not enabled.

## Evidence

Implementation files:

- `src/map/CampusMap.tsx`
- `src/styles.css`
- `tests/e2e/mvp1-map.spec.ts`
- `docs/decisions/phase-4-3d-campus-detail-slice.md`
- `docs/design.md`

Screenshots:

- `docs/screenshots/phase4-3d-detail-desktop-overview.png`
- `docs/screenshots/phase4-3d-detail-desktop-selected-building.png`
- `docs/screenshots/phase4-3d-detail-mobile-overview.png`
- `docs/screenshots/phase4-3d-detail-mobile-selected-building.png`

Checks passed on 2026-10-01:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run build`
- `npm run test:e2e`

Known warning:

- `npm run build` still reports the existing Vite bundle chunk-size warning.

## Constraints

This review does not approve official building heights, detailed custom meshes, terrain, indoor maps, floor plans, room-level geometry, indoor routing, or accessibility routing.

Proceed to Phase 5 only through the indoor data acquisition and QA gate in `PLAN.md` section 14.0. Do not implement indoor navigation until legal floor-plan data, room/POI inventory, entrances, connectors, inaccessible/private areas, and QA notes exist for at least one building.
