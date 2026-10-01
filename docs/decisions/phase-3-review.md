# Phase 3 Review: NUSMods Intelligence

Status: accepted with constraints.

Plan section targeted: `PLAN.md` section 12, Phase 3 NUSMods intelligence.

## Decision

Phase 3 is complete for the required NUSMods intelligence scope.

The implementation satisfies the required features:

- Users can search by module code through the NUSMods lookup card.
- Successful lookups show module lesson venue summaries.
- Venue codes map to known campus places where a verified curated alias exists.
- Each venue mapping exposes confidence metadata.
- Mapped venues suggest the nearest known bus stop from the curated place seed.

The implementation also satisfies the section 12.3 acceptance criteria:

- At least 10 known venue patterns map to places. Current tests cover 13 patterns across Computing, Business, Central Library, ERC, UCC, and S17.
- Unknown venue codes show a fallback message instead of being guessed.
- Mapping source and confidence are visible in the selected-module detail sheet.
- No venue is silently mapped without confidence metadata.

## Constraints

This review does not approve room-level geometry, indoor routing, live occupancy, personal timetable import, calendar integration, or a next-class workflow.

Venue prefixes may identify a building only when the alias is explicitly represented in the curated mapper. Room fragments such as `COM3-01-23` remain not inferred unless Phase 5 adds verified indoor data.

## Evidence

Implementation files:

- `src/nusmods/nusModsModuleLookup.ts`
- `src/nusmods/venueMapper.ts`
- `src/map/CampusMap.tsx`
- `data/sources.yml`

Tests:

- `src/nusmods/nusModsModuleLookup.test.ts`
- `src/nusmods/venueMapper.test.ts`
- `tests/e2e/mvp1-map.spec.ts`

Screenshots:

- `docs/screenshots/phase3-nusmods-module-lookup-desktop.png`
- `docs/screenshots/phase3-nusmods-module-lookup-mobile.png`
- `docs/screenshots/phase3-selected-module-panel-desktop.png`
- `docs/screenshots/phase3-selected-module-panel-mobile.png`

Checks expected for this checkpoint:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run validate:data`
- `npm run build`
- `npm run test:e2e`

## Next Phase

Proceed to `PLAN.md` section 13, Phase 4 3D campus detail.

Phase 4 should begin conservatively:

- improve building-detail styling only where the source/provenance is clear
- keep approximate heights visually honest
- preserve label readability and map controls in pitched view
- avoid terrain until an elevation source, license, alignment check, and mobile performance result are documented
