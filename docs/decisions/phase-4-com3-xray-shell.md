# Phase 4 COM3 Xray Shell Slice

Status: implemented as shell-only xray.

Plan section targeted:

- `PLAN.md` section 13.1.1, recognizable building model and xray slice.

## Decision

Use COM3 as the first one-building xray target.

The slice uses the existing sourced OSM COM3 footprint and OSM `building:levels=6` metadata to render:

- A translucent selected-building shell.
- Six thin floor slices labelled `L1` through `L6`.
- A floor selector in the selected COM3 sheet.
- Source/confidence copy that says this is `building shell only`.

## Boundaries

This does not add indoor navigation or floor-plan detail.

Not enabled:

- Official architectural model.
- Terrain.
- Public entrance coordinates.
- Outdoor connection points.
- Rooms, corridors, toilets, lifts, labs, indoor POIs, accessibility paths, or floor plans.

The floor labels are generic selector labels derived from the verified OSM level count. They are not official NUS floor names.

## Validation

`npm run validate:data` checks the shell metadata, source id, level count, shell-only state, generic labels, and blocked indoor/entrance artifacts.

## Screenshots

- `docs/screenshots/phase4-com3-xray-shell-desktop.png`
- `docs/screenshots/phase4-com3-xray-shell-mobile.png`

## Scale Decision

This result is good enough to validate the interaction pattern for one selected building, but not enough to scale broad 3D campus detail. Scaling should wait for either building-part sources, permissioned models, or a documented procedural modelling policy for recognizable but non-official shells.
