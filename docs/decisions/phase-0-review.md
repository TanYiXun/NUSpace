# Phase 0 Review

## Prototype A: Base Map

Status: implemented, pending browser visual QA

Classification: keep for now

Acceptance criteria:

- [x] Map loads in browser-sized app shell. Evidence: Vite server returned HTTP 200 at `http://127.0.0.1:5173/`; production build succeeded.
- [x] NUS Kent Ridge appears at configured coordinates. Evidence: map center is `[103.7764, 1.2966]` in `src/map/mapConfig.ts`.
- [ ] User can pan and zoom. Pending direct browser interaction check.
- [ ] Attribution is visible. Pending direct browser visual check; MapLibre attribution control is configured with OpenFreeMap/OpenStreetMap style attribution.
- [ ] Performance is acceptable on a mobile viewport. Pending mobile viewport visual/performance check.
- [x] No Google Maps API is used. Evidence: app uses MapLibre GL JS and OpenFreeMap style URL only.

Notes:

- Basemap source: OpenFreeMap `https://tiles.openfreemap.org/styles/liberty`.
- No campus-specific data has been added.
- Automated checks passed: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run validate:data`, `npm run build`.
- `npm run test:e2e` is a placeholder for this prototype and does not yet run browser automation.
- Build warning: bundled JavaScript chunk is larger than 500 kB after minification, largely expected from MapLibre at this stage but should be revisited before MVP.
