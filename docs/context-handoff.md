# Context Handoff

Last updated: 2026-09-17

This file is a concise working-memory handoff for long conversations, compaction, or fresh tasks. `PLAN.md` remains the source of truth for product scope and implementation requirements.

## Current Repository State

- Project name: NUSpace.
- Repository: `TanYiXun/NUSpace`.
- Current branch: `phase-0-review`.
- Latest merged `main` commit: `a87cff1 Merge pull request #5 from TanYiXun/prototype-f-visual-map-ui`.
- Prototype A through F were completed and merged to `main`.
- Active uncommitted work: Phase 0 review documentation updates.

## Current Phase

- Active plan section: `PLAN.md` section 9.7, Phase 0 Exit Criteria.
- Phase 0 review status: in progress on branch `phase-0-review`.
- The user has been reviewing the running local app at `http://127.0.0.1:5173/`.

## Prototype F Implemented Scope

- Map-first UI controls:
  - current location
  - shuttle routes
  - map layers
- Bottom sheet states:
  - collapsed
  - half
  - expanded
- Selected states:
  - building
  - search result
  - bus stop
  - active route
- Selection clearing:
  - close button clears selected detail
  - clicking empty map clears selected detail and returns to Prototype F overview
- Icon system:
  - Material Symbols
  - map controls use 52 px circular buttons and 28 px symbols
  - sheet actions use 36 px circular buttons and 22 px symbols
  - sheet actions use `keyboard_arrow_down`, `open_in_full`, and `close`, not raw `+`, `-`, or `x`
- Current-location behavior:
  - requests browser geolocation only after user click
  - shows blue dot and accuracy ring on success
  - does not fake a location marker when permission is unavailable or denied

## Screenshots

Prototype F screenshots are in `docs/screenshots/`:

- `prototype-f-desktop-overview.png`
- `prototype-f-desktop-layers-menu.png`
- `prototype-f-mobile-overview.png`
- `prototype-f-mobile-selected-building.png`
- `prototype-f-mobile-selected-bus-stop.png`
- `prototype-f-mobile-route-active.png`
- `prototype-f-mobile-expanded-sheet.png`
- `prototype-f-mobile-collapsed-sheet.png`

The selected-bus-stop screenshot was refreshed after the sheet icon-button styling fix.

## Checks Last Run

Latest checks passed unless noted:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run build`

Known check limitation:

- `npm run test:e2e` currently prints `test:e2e not implemented for Phase 0 prototypes`.

Known build warning:

- Vite reports the existing MapLibre bundle chunk-size warning.

## Important Data And Product Warnings

- Current D1 route path is a prototype placeholder for animation and UI testing.
- Current D1 stop coordinates are still wrong or approximate in places.
- Do not treat the current route path as official NUS shuttle geometry.
- Do not treat current stop points as verified bus stop locations.
- No live NUS shuttle API, real-time arrivals, crowd level, or live vehicle positions are enabled.
- uNivUS, ConnectX, or NUS live shuttle APIs must not be used in production unless official access is documented.
- LTA DataMall should not be assumed to provide NUS internal shuttle routes.

## Recent Design Decisions

- Use Apple Maps as the restraint and polish reference.
- Use NTU Map as the feature ambition reference.
- Keep the first screen as the usable map, not a landing page.
- Avoid generic/vibecoded UI patterns from `AGENTS.md`.
- Selectable map features must be directly selectable on the map as well as through search or lists, unless a phase explicitly documents display-only behavior.
- UI/map PRs should include implementer-captured screenshots from the running app or deployed preview.
- `docs/context-handoff.md` is a checkpoint file, not a live changelog. Update it at useful handoff triggers: long/context-heavy sessions, phase/prototype completion, push/PR/merge, branch switch, major decisions, or when automatic compaction has already happened and the file is stale.
- Automatic Codex compaction cannot reliably be announced before it happens. If compaction happens, continue from the provided summary and refresh this file at the next safe checkpoint.
- Prototype F PR #5 was pushed, opened with screenshots, and merged to `main`.

## Next Recommended Action

Finish Phase 0 review. Next:

1. Complete the Phase 0 review branch.
2. Run relevant checks.
3. Commit the review updates.
4. Push branch `phase-0-review`.
5. Open a PR with the required plain engineering description.
6. Merge to `main` if checks and user approval are satisfied.
7. Start Phase 1 Outdoor Campus MVP only after the review branch is merged.
