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
- Browser screenshot captured from the running local app at `http://127.0.0.1:5173/`.
- Mobile visual performance, pan/zoom feel, and attribution placement still require manual or Playwright verification.

## Phase 0 Prototype B

- COM3 is the first custom building extrusion.
- The extrusion uses a restrained blue-grey material so it can be distinguished from the basemap without becoming decorative.
- The selected detail panel exposes source truth: OSM footprint, OSM level count, estimated height.
- The label uses collision handling and a white halo for readability.
- Direct desktop and mobile visual QA is still required to confirm alignment, label placement, and click interaction in the browser.
- A procedural visual-model layer adds floor bands and a roof cap from the same footprint. These make the overlay visibly separate from the basemap, but they are placeholder visual details.
- Accepted visual checkpoint: [Prototype B COM3 overlay](screenshots/prototype-b-com3-overlay.jpg).
- Capture source: running local app at `http://127.0.0.1:5173/`.
- Viewport: desktop browser viewport.
- Feature state: Prototype B COM3 rendered with label, search control, attribution, and overview panel visible.

Visual QA follow-up:

- Initial visual pass made COM3 look like a heavy blue slab over the basemap.
- The extrusion should stay quiet during Prototype B because the goal is alignment validation, not final building art direction.
- Custom buildings should render below basemap symbol labels where possible, use neutral low-opacity materials, and include a subtle outline for footprint readability.

Visual realism finding:

- Simple MapLibre extrusion does not create the kind of recognizable 3D building seen in NTU Map.
- The NTU Map reference uses more building-specific modeling: facade bands, windows, roof treatment, courtyards, shadows, and distinctive forms.
- NUSpace should not treat a single footprint extrusion as a finished 3D direction.
- The procedural facade-band spike improves visual separation, but it still does not equal a real building model.
- Before broad 3D campus work, add a follow-up prototype that tests one recognizable building using multi-part geometry, verified building parts, more realistic procedural facade detail, or a custom 3D model layer.
- If roads, paths, or labels appear through a custom extrusion, first check opacity and layer ordering, then check whether the source footprint represents an outer shell that includes real under-building circulation, podium areas, or voids. Do not assume a latitude/longitude mismatch without comparing against the source geometry and nearby basemap features.

## Phase 0 Prototype C

- D1 is rendered as a simulated shuttle corridor overlay with a purple route line, white casing, direction arrows, stop markers, and one animated vehicle marker.
- The route uses a single route identity color so it reads as transit without overwhelming the basemap.
- The panel explicitly states that the corridor is manually curated and the vehicle is an animated simulation.
- The UI must not imply live NUS shuttle access, live arrivals, or official route geometry.
- Accepted desktop visual checkpoint: [Prototype C D1 desktop](screenshots/prototype-c-d1-route-desktop.jpg).
- Accepted mobile visual checkpoint: [Prototype C D1 mobile](screenshots/prototype-c-d1-route-mobile.jpg).
- Capture source: running local app at `http://127.0.0.1:5173/`.
- Viewports: desktop browser viewport and 390 x 844 mobile viewport.
- Feature state: D1 corridor overlay, stop labels, simulated vehicle, attribution, search control, and route detail panel visible.

Visual QA follow-up:

- The mobile panel is readable but takes too much of the available map area.
- Later map UI work should add collapsed and expanded bottom-sheet states before transit overlays become dense.
- Route labels and stop markers are acceptable for one route, but broader transit work will need collision, filtering, and selected-route emphasis.
- The corridor must not be treated as a complete official D1 route. It is an animation and rendering prototype until approved NUS route geometry is available.

## Phase 0 Prototype D

- Search is implemented as a top map control, not a separate page or dashboard.
- Result rows show the place name, short subtitle, and entity type.
- Selecting a result pans the map and opens the relevant detail panel.
- The detail panel exposes source status for non-building results so prototype or manually referenced data is not mistaken for verified data.
- Accepted desktop visual checkpoint: [Prototype D search detail desktop](screenshots/prototype-d-search-detail-desktop.jpg).
- Accepted mobile visual checkpoint: [Prototype D search detail mobile](screenshots/prototype-d-search-detail-mobile.jpg).
- Capture source: running local app at `http://127.0.0.1:5173/`.
- Viewports: desktop browser viewport and 390 x 844 mobile viewport.
- Feature state: search input, selected result detail panel, source status, route overlay, attribution, and map controls visible.

Visual QA follow-up:

- The top search dropdown is readable and does not overlap browser/status chrome.
- On mobile, search plus the current always-open panel leaves limited map context. Later sheet work should introduce collapsed and expanded panel states.
- Result styling should remain compact and avoid turning search into a full-screen command palette until there is enough data to justify it.
