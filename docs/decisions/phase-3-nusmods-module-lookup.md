# Phase 3 NUSMods Module Lookup

Status: complete for the first NUSMods intelligence slice.

Plan section targeted: `PLAN.md` section 12, Phase 3 NUSMods intelligence.

## Decision

NUSMods module lookup is available in the overview sheet:

- Users can search by module code.
- Module title and lesson venue summaries are displayed.
- Venue codes are normalized before matching.
- Known venue prefixes map to curated campus places with confidence metadata.
- Unknown venue codes remain unmapped.
- Nearest known bus stop suggestions are shown when a mapped place exists.

The implementation does not infer room-level data:

- `COM3-01-23` can map to COM3 at building-level confidence.
- The room `01-23` is not treated as verified geometry.
- Unknown venues such as `LT27` remain unmapped until a verified place mapping exists.

## Evidence

Implemented files include:

- `src/nusmods/nusModsModuleLookup.ts`
- `src/nusmods/nusModsModuleLookup.test.ts`
- `src/nusmods/venueMapper.ts`
- `src/nusmods/venueMapper.test.ts`
- `src/map/CampusMap.tsx`
- `data/sources.yml`

Screenshot evidence:

- `docs/screenshots/phase3-nusmods-module-lookup-desktop.png`
- `docs/screenshots/phase3-nusmods-module-lookup-mobile.png`

## Next Recommended Work

Expand venue mappings only when each prefix or venue has documented provenance. Do not add room-level indoor navigation until Phase 5 has verified indoor geometry.
