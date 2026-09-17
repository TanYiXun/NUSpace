# NUSpace

NUSpace is an independent NUS-first campus map prototype. Phase 0 is validating the technical and data foundations before building broader product features.

## Current Phase

Phase 0 Prototype A: base map rendering without Google Maps.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run validate:data
npm run build
```

`npm run test:e2e` is intentionally a placeholder until browser smoke tests are added.

## Data Policy

Do not add campus buildings, routes, rooms, shuttle arrivals, or indoor geometry unless the source is documented in `data/sources.yml` and allowed by `PLAN.md`.

The current prototype uses OpenFreeMap only as a basemap source. It does not add NUS-specific data.
