# Phase 4 Terrain Readiness Gate

Status: superseded by `docs/decisions/phase-4-terrain-prototype.md`.

Plan section targeted:

- `PLAN.md` section 13.2, terrain guidance.

## Decision

Do not implement terrain yet.

This decision recorded the blocked state before an elevation source was selected. It was superseded on 2026-10-04 by the Phase 4 terrain prototype decision, which documents AWS Open Data Terrain Tiles as a prototype source and keeps terrain labelled as non-production visual slope context.

The current app should keep terrain as a blocked layer note because the project does not yet have:

- a selected elevation source
- documented license and redistribution terms
- alignment checks against NUS roads and building footprints
- mobile performance measurements
- label and overlay readability review
- a boundary treatment that avoids an unfinished square in user-facing map states

This follows the open-question default in `PLAN.md`: if terrain usefulness is unresolved, do not implement terrain.

## Implementation

Added `data/curated/phase4-terrain-status.json` as the source of truth for the current terrain state.

The layer menu reads from this file and displays terrain as unavailable/blocked. No terrain tiles, DEM raster source, hillshade source, terrain exaggeration, or user-facing terrain toggle is enabled.

## Validation

`npm run validate:data` now checks the terrain status schema, blocked state, missing requirements, and boundary-policy note.

## Next Requirement

Terrain work can restart only after a candidate elevation source is documented in `data/sources.yml` with license terms and a small visual/performance prototype proves that terrain improves navigation without reducing label, route, or building readability.
