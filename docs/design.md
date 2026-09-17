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

## Phase 0 Prototype E

- Prototype E is primarily a data-pipeline checkpoint, so it does not add a new visible map layer.
- The default panel identifies Prototype E instead of leaving the app looking like it is still on the Prototype C route state.
- Earlier prototype detail panels remain available only after selecting their matching feature state.
- Accepted desktop visual checkpoint: [Prototype E data pipeline overview](screenshots/prototype-e-data-pipeline-overview.png).
- Capture source: running local app at `http://127.0.0.1:5173/`.
- Feature state: default app load, search control, route overlay, generated-data overview panel, map attribution, and MapLibre controls visible.

Visual QA follow-up:

- The default panel is intentionally plain because the data pipeline itself is not a user-facing feature.
- Prototype F should replace this temporary always-open overview with proper current-location, layer, route, and bottom-sheet controls.

## Phase 0 Prototype F

Prototype F establishes the first cohesive NUSpace map UI direction. The accepted direction is Apple Maps restraint with NTU Map campus specificity: calm map-first chrome, compact controls, route and layer affordances, and bottom sheets that preserve map context.

Accepted visual checkpoints:

- [Prototype F desktop overview](screenshots/prototype-f-desktop-overview.png).
- [Prototype F desktop layers menu](screenshots/prototype-f-desktop-layers-menu.png).
- [Prototype F mobile overview](screenshots/prototype-f-mobile-overview.png).
- [Prototype F selected building](screenshots/prototype-f-mobile-selected-building.png).
- [Prototype F selected bus stop](screenshots/prototype-f-mobile-selected-bus-stop.png).
- [Prototype F active route](screenshots/prototype-f-mobile-route-active.png).
- [Prototype F expanded sheet](screenshots/prototype-f-mobile-expanded-sheet.png).
- [Prototype F collapsed sheet](screenshots/prototype-f-mobile-collapsed-sheet.png).

Capture source:

- Running local app at `http://127.0.0.1:5173/`.
- Mobile viewport: 390 x 844.
- Desktop viewport: 1280 x 720.

Design tokens:

- Token file: `src/styles/tokens.css`.
- Typography: system sans stack, matching native map-product expectations.
- Radius: 8px for panels and list rows, circular icon controls.
- Spacing: 4px and 8px rhythm through tokenized spacing.
- Shadows: functional elevation only, used to separate controls from the map.
- Motion: short purposeful transitions for sheet size changes.

Map color palette:

- Basemap stays OpenFreeMap Liberty for Phase 0.
- UI panels use off-white translucent surfaces with dark ink text.
- NUS identity is restrained. NUS blue and orange are available as tokens but do not dominate the map.

Route color strategy:

- `D1` uses purple as the prototype route identity inherited from Prototype C.
- Route lines use a white casing plus route color for legibility.
- Route color must later move into a route registry before multiple services are added.

Marker hierarchy:

- COM3 building label remains a large map label with white halo.
- D1 stop markers use white circles with purple stroke.
- The animated D1 marker remains visually stronger than static stops but is explicitly simulated.

Icon strategy:

- The Phase 0 icon vocabulary covers current location, shuttle routes, and layers.
- Icons use Material Symbols because they are familiar map-control symbols and match the reference interaction pattern.
- Floating map controls use 52 px circular buttons with Material Symbols at 28 px.
- Sheet action controls use smaller 36 px circular buttons with Material Symbols at 22 px so they read as secondary controls.
- Current symbol names:
  - current location: `my_location`
  - shuttle routes: `directions_bus`
  - layers: `layers`
  - collapse sheet/details: `keyboard_arrow_down`
  - expand sheet/details: `open_in_full`
  - close selected details: `close`
- Do not use raw text glyphs such as `+`, `-`, or `x` for sheet controls because they conflict with map zoom semantics and look inconsistent beside the map controls.
- Before MVP 1, decide whether to keep the external Material Symbols font, self-host it, or replace it with packaged icons.

Current-location treatment:

- The current-location control requests browser geolocation only after the user taps it.
- When permission succeeds, the map shows a blue location dot with a soft accuracy ring.
- The app does not store, log, or transmit the precise user location in Prototype F.
- If permission is denied or unavailable, the overview sheet reports the location state instead of adding a fake marker.

Bottom sheet behavior:

- Mobile sheets support collapsed, half, and expanded states.
- Default half state preserves the route and campus context.
- Collapsed state keeps the selected title visible and restores more map area.
- Expanded state supports denser selected-place or route content without leaving the map surface.

Selected-state treatment:

- Selected building state emphasizes source truth: footprint source, levels, placeholder height, and visual detail status.
- Selected bus stop state uses compact ETA-style rows, but values are labelled simulated or unavailable.
- Active route state focuses the D1 simulated corridor and keeps the no-live-data warning visible.
- Selectable bus stops and route stops must respond to direct map clicks as well as search result selection. Prototype F supports this for the current D1 prototype stop circles; future verified bus-stop layers must preserve the same interaction.

Visual teardown:

- Borrowed from Apple Maps: restrained controls, search-first map chrome, compact sheets, subtle shadows, no decorative UI.
- Borrowed from NTU Map: vertical map controls, shuttle route sheet, route tracing, campus-specific 3D ambition.
- Adapted for NUS: route and ETA content is truth-labelled because official live NUS shuttle access has not been approved.
- Rejected direction: a dashboard-style map with floating feature cards, bright gradient route panels, multiple marketing blocks, and large explanatory cards. That direction fails because it makes the map secondary and would look generic rather than like a navigation product.

Pass examples:

- Compact controls do not obscure primary map content.
- Bottom sheets expose source truth without turning into docs.
- Search, route, and layer controls are available within one tap.

Fail examples:

- A large welcome card covering the map by default.
- Route controls that imply official live bus data.
- Colored feature cards, gradients, icon spam, or marketing copy over the map.
- Any screenshot where the controls overlap the search bar, bottom sheet handle, attribution, or each other.

Known visual issues:

- Material Symbols are loaded from Google Fonts in Prototype F. Before MVP 1, make an explicit dependency decision and consider self-hosting or bundling icons.
- The route overlay remains prototype geometry and should not be judged as final NUS shuttle routing.
- Current D1 stop locations and path alignment are still wrong or approximate in places. They are for UI and animation testing only until replaced with verified or carefully re-curated route geometry.
- The current panel design is acceptable for Phase 0 but needs a real sheet gesture model for production mobile use.
