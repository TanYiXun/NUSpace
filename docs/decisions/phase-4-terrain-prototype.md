# Phase 4 Terrain Prototype

Status: prototype.

Plan section targeted:

- `PLAN.md` section 13.2, terrain guidance.

## Decision

Enable a bounded prototype terrain and hillshade layer for NUS.

The app now uses AWS Open Data Terrain Tiles, encoded as Mapzen Terrarium raster DEM tiles, through MapLibre's `raster-dem` support. The layer is for visual slope context only. It is not official NUS terrain, accessibility data, stair/ramp data, entrance data, indoor elevation data, or route weighting.

## Implementation

`data/curated/phase4-terrain-status.json` is the source of truth for terrain state, tile URL template, encoding, tile size, max zoom, exaggeration, source ids, and campus review bounds.

The map adds:

- a `raster-dem` source using Terrarium encoding
- a subtle hillshade layer below labels and 3D buildings
- MapLibre terrain with restrained exaggeration
- a layer-menu terrain toggle
- overview copy using the `Prototype` truth label

Existing OSM building footprint extrusions and COM3 shell-only xray remain source-labelled and are still not official building models or indoor data.

## Validation

`npm run validate:data` checks the terrain source id, prototype status, Terrarium encoding, tile size, max zoom, restrained exaggeration, campus review bounds, enabled prototype artifacts, and blocked routing/accessibility artifacts.

## Remaining Review

Before terrain can become supported, visual review must confirm:

- terrain aligns acceptably with NUS roads and building footprints
- labels, stop markers, and 3D buildings remain readable
- mobile performance remains acceptable
- the terrain boundary does not look like an unfinished square
