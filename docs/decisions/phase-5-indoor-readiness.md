# Phase 5 Indoor Readiness Gate

Status: blocked.

Plan section targeted:

- `PLAN.md` section 14.0, indoor data acquisition and QA gate.

## Decision

Do not implement indoor navigation yet.

The current app does not have a legal floor-plan source, floor list, room/POI inventory, entrances and outdoor connection points, vertical connectors, inaccessible/private-area markings, confidence scores, or manual QA notes for any building.

## Implementation

Added `data/curated/phase5-indoor-readiness-status.json` as the source of truth for the current indoor state.

The layer menu, overview panel, and COM3 shell-only selected-building sheet read from this file and display indoor navigation as blocked. No floor plans, room geometry, corridor graph, entrances, lifts, stairs, ramps, escalators, accessibility paths, or indoor routes are enabled.

## Validation

`npm run validate:data` checks the indoor readiness schema, blocked state, missing requirements, restrictions, QA requirements, and blocked indoor artifacts.

## Next Requirement

Indoor work can restart only after a legal source or permission is documented and the required Phase 5 artifacts exist for at least one target building. Accessibility routing must remain unavailable until lifts, ramps, and step-free paths are validated.
