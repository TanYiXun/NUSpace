# Design Notes

## Phase 0 Prototype A

The first prototype is intentionally map-first. The map occupies the full viewport, with only a compact search placeholder and a small status panel.

Visual direction:

- Use Apple Maps as the restraint benchmark: clear controls, restrained overlays, readable labels, no decorative gradients.
- Use NTU Map only as the long-term feature reference for campus-specific 3D and indoor ambition.
- Avoid generic dashboard, landing-page, card-grid, and glassmorphism patterns.

Current limitations:

- No custom NUS building styling yet.
- No shuttle layer yet.
- No indoor or room data.
- The search pill is visual scaffolding only and is not interactive in Prototype A.

Visual QA notes must be added after running the map in desktop and mobile viewports.

## 2026-09-17 Visual QA Notes

- Local HTTP smoke check passed at `http://127.0.0.1:5173/`.
- Browser screenshot inspection was not completed in this run because a browser-control tool was not available for localhost.
- Mobile visual performance, pan/zoom feel, and attribution placement still require manual or Playwright verification.

## Phase 0 Prototype B

- COM3 is the first custom building extrusion.
- The extrusion uses a restrained blue-grey material so it can be distinguished from the basemap without becoming decorative.
- The selected detail panel exposes source truth: OSM footprint, OSM level count, estimated height.
- The label uses collision handling and a white halo for readability.
- Direct desktop and mobile visual QA is still required to confirm alignment, label placement, and click interaction in the browser.

Visual QA follow-up:

- Initial visual pass made COM3 look like a heavy blue slab over the basemap.
- The extrusion should stay quiet during Prototype B because the goal is alignment validation, not final building art direction.
- Custom buildings should render below basemap symbol labels where possible, use neutral low-opacity materials, and include a subtle outline for footprint readability.

Visual realism finding:

- Simple MapLibre extrusion does not create the kind of recognizable 3D building seen in NTU Map.
- The NTU Map reference uses more building-specific modeling: facade bands, windows, roof treatment, courtyards, shadows, and distinctive forms.
- NUSpace should not treat a single footprint extrusion as a finished 3D direction.
- Before broad 3D campus work, add a follow-up prototype that tests one recognizable building using multi-part geometry, procedural facade detail, or a custom 3D model layer.
