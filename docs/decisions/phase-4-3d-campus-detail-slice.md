# Phase 4 3D Campus Detail Slice

Status: in progress.

Plan section targeted: `PLAN.md` section 13, Phase 4 3D campus detail.

## Decision

Start Phase 4 with source-safe 3D detail improvements before terrain or custom mesh work.

This slice keeps the existing OSM building footprint dataset and improves the rendered experience by:

- giving selected non-COM3 building extrusions a visible selected state
- applying a restrained landmark tint to selected sourced landmark names already present in the curated footprint data
- exposing building height, height-source status, levels, and 3D-detail mode in the selected-place sheet
- changing the visible app checkpoint label from Phase 3 venue intelligence to Phase 4 3D campus detail

No new building geometry, room geometry, terrain, elevation data, or indoor data is introduced.

## Scope Boundaries

Phase 4 terrain remains blocked until an elevation source, license, alignment check, and mobile performance result are documented.

The current building heights are still OSM-level-derived estimates or prototype placeholders. Styling must remain restrained so approximate heights do not read as official architectural measurements.

## Evidence To Capture

Before merging this slice, capture:

- desktop overview with pitched 3D buildings
- desktop selected landmark building
- mobile overview
- mobile selected landmark building or selected building

## Checks

Run:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run build`
- `npm run test:e2e`
