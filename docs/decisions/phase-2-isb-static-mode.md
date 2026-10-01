# Phase 2 NUS ISB Static Mode

Status: complete for the source-pending static route UI slice.

Plan section targeted: `PLAN.md` section 11.2, NUS ISB static mode.

## Decision

NUS ISB static mode is available only as a source-pending route display:

- D1 can be selected from the shuttle route control.
- The D1 route path and stop sequence are displayed.
- The route color is preserved as the existing D1 purple identity.
- The sheet labels the route as `Static route`.
- The sheet labels arrivals as `Live arrivals unavailable`.
- The route geometry remains manually curated placeholder geometry and is not presented as official.

This checkpoint does not approve live NUS shuttle data:

- No uNivUS, ConnectX, NUS NextBus, or private app endpoint has been used.
- No live arrivals, live vehicle positions, or crowd levels are enabled.
- No static route estimate is presented as an official live ETA.
- Source-confirmed geometry for A1, A2, D1, D2, K, P, R1, and R2 remains future work.

## Evidence

Implemented files include:

- `src/transit/nusIsbStaticRoutes.ts`
- `src/transit/nusIsbStaticRoutes.test.ts`
- `src/transit/transitCapabilities.ts`
- `src/map/CampusMap.tsx`
- `src/map/searchIndex.ts`
- `data/sources.yml`

Screenshot evidence:

- `docs/screenshots/phase2-isb-static-route-menu-desktop.png`
- `docs/screenshots/phase2-isb-static-route-detail-desktop.png`
- `docs/screenshots/phase2-isb-static-route-detail-mobile.png`

## Next Recommended Phase

Do not implement `PLAN.md` section 11.3 until official NUS, uNivUS, ConnectX, or NextBus access is documented. If no official access is available, proceed to Phase 3 NUSMods intelligence while keeping NUS ISB live data blocked.
