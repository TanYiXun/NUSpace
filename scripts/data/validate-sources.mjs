import { readFile } from 'node:fs/promises';

const sourceFile = new URL('../../data/sources.yml', import.meta.url);
const contents = await readFile(sourceFile, 'utf8');
const generatedBuildingsFile = new URL('../../data/generated/campus-buildings.geojson', import.meta.url);
const generatedManifestFile = new URL('../../data/generated/manifest.json', import.meta.url);
const curatedPlacesFile = new URL('../../data/curated/mvp1-campus-places.json', import.meta.url);
const curatedBuildingFootprintsFile = new URL('../../data/curated/mvp1-building-footprints.geojson', import.meta.url);

const NUS_BOUNDS = {
  minLng: 103.76,
  maxLng: 103.79,
  minLat: 1.285,
  maxLat: 1.31,
};

const requiredFragments = [
  'id: openfreemap',
  'id: osm-overpass-com3',
  'id: manual-osm-d1-prototype-route',
  'id: osm-api-nus-kent-ridge-map',
  'source_owner:',
  'source_url:',
  'documentation_url:',
  'terms_or_license_url:',
  'license:',
  'allowed_use:',
  'attribution_text:',
  'source_status: verified',
  'source_status: prototype-placeholder',
  'used_for:',
];

const missing = requiredFragments.filter((fragment) => !contents.includes(fragment));

if (missing.length > 0) {
  console.error(`data/sources.yml is missing required metadata: ${missing.join(', ')}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertPosition(position, context) {
  assert(Array.isArray(position), `${context} must be a coordinate array`);
  assert(position.length >= 2, `${context} must include longitude and latitude`);

  const [lng, lat] = position;
  assert(typeof lng === 'number' && Number.isFinite(lng), `${context} longitude must be finite`);
  assert(typeof lat === 'number' && Number.isFinite(lat), `${context} latitude must be finite`);
  assert(lng >= NUS_BOUNDS.minLng && lng <= NUS_BOUNDS.maxLng, `${context} longitude is outside NUS bounds`);
  assert(lat >= NUS_BOUNDS.minLat && lat <= NUS_BOUNDS.maxLat, `${context} latitude is outside NUS bounds`);
}

function assertClosedRing(ring, context) {
  assert(Array.isArray(ring), `${context} must be an array`);
  assert(ring.length >= 4, `${context} must have at least 4 coordinates`);

  ring.forEach((position, positionIndex) => {
    assertPosition(position, `${context} position ${positionIndex}`);
  });

  const first = ring[0];
  const last = ring[ring.length - 1];
  assert(first[0] === last[0] && first[1] === last[1], `${context} must be closed`);
}

function validateGeneratedBuilding(feature, index) {
  const context = `generated building ${feature.id ?? index}`;

  assert(feature.type === 'Feature', `${context} must be a GeoJSON Feature`);
  assert(feature.id, `${context} must have a stable id`);
  assert(feature.properties?.entity_type === 'building', `${context} must have entity_type=building`);
  assert(feature.properties?.source_id, `${context} must preserve source_id`);
  assert(feature.properties?.source_status, `${context} must preserve source_status`);
  assert(feature.properties?.height_source_status, `${context} must preserve height_source_status`);
  assert(feature.properties?.date_checked, `${context} must preserve date_checked`);
  assert(feature.geometry?.type === 'Polygon', `${context} geometry must be Polygon`);
  assert(Array.isArray(feature.geometry.coordinates), `${context} coordinates must be an array`);
  assert(feature.geometry.coordinates.length > 0, `${context} must have at least one ring`);

  feature.geometry.coordinates.forEach((ring, ringIndex) => {
    assertClosedRing(ring, `${context} ring ${ringIndex}`);
  });
}

const allowedPlaceTypes = new Set(['building', 'bus_stop', 'food', 'facility']);
const allowedSourceStatuses = new Set(['verified', 'manual-reference', 'prototype-placeholder']);
const allowedHeightSourceStatuses = new Set(['estimated-from-levels', 'prototype-placeholder']);

function validateCuratedPlace(place, index, seenIds) {
  const context = `curated place ${place.id ?? index}`;

  assert(typeof place.id === 'string' && place.id.length > 0, `${context} must have an id`);
  assert(!seenIds.has(place.id), `${context} id must be unique`);
  seenIds.add(place.id);

  assert(typeof place.name === 'string' && place.name.length > 0, `${context} must have a name`);
  assert(Array.isArray(place.aliases), `${context} aliases must be an array`);
  assert(allowedPlaceTypes.has(place.type), `${context} has unsupported type ${place.type}`);
  assertPosition(place.coordinates, `${context} coordinates`);
  assert(typeof place.sourceId === 'string' && contents.includes(`id: ${place.sourceId}`), `${context} sourceId must exist in data/sources.yml`);
  assert(allowedSourceStatuses.has(place.sourceStatus), `${context} has unsupported sourceStatus ${place.sourceStatus}`);
  assert(typeof place.sourceLabel === 'string' && place.sourceLabel.length > 0, `${context} must have a sourceLabel`);
  assert(typeof place.detail === 'string' && place.detail.length > 0, `${context} must have a detail note`);

  if (place.sourceId.startsWith('osm-')) {
    assert(place.osm?.type && place.osm?.id, `${context} must preserve OSM object type and id`);
  }
}

function validateCuratedBuildingFootprint(feature, index) {
  const context = `curated building footprint ${feature.id ?? index}`;

  assert(feature.type === 'Feature', `${context} must be a GeoJSON Feature`);
  assert(typeof feature.id === 'string' && feature.id.length > 0, `${context} must have a stable id`);
  assert(feature.properties?.entity_type === 'building', `${context} must have entity_type=building`);
  assert(typeof feature.properties?.name === 'string' && feature.properties.name.length > 0, `${context} must have a name`);
  assert(typeof feature.properties?.source_id === 'string' && contents.includes(`id: ${feature.properties.source_id}`), `${context} source_id must exist in data/sources.yml`);
  assert(allowedSourceStatuses.has(feature.properties?.source_status), `${context} has unsupported source_status`);
  assert(typeof feature.properties?.source_label === 'string' && feature.properties.source_label.length > 0, `${context} must have source_label`);
  assert(feature.properties?.osm_type && feature.properties?.osm_id, `${context} must preserve OSM type and id`);
  assert(typeof feature.properties?.height_m === 'number' && feature.properties.height_m > 0, `${context} must have positive height_m`);
  assert(allowedHeightSourceStatuses.has(feature.properties?.height_source_status), `${context} has unsupported height_source_status`);
  assert(typeof feature.properties?.detail === 'string' && feature.properties.detail.length > 0, `${context} must have a detail note`);
  assert(feature.geometry?.type === 'Polygon', `${context} geometry must be Polygon`);
  assert(Array.isArray(feature.geometry.coordinates), `${context} coordinates must be an array`);
  assert(feature.geometry.coordinates.length > 0, `${context} must have at least one ring`);

  feature.geometry.coordinates.forEach((ring, ringIndex) => {
    assertClosedRing(ring, `${context} ring ${ringIndex}`);
  });
}

const generatedBuildings = JSON.parse(await readFile(generatedBuildingsFile, 'utf8'));
const generatedManifest = JSON.parse(await readFile(generatedManifestFile, 'utf8'));
const curatedPlaces = JSON.parse(await readFile(curatedPlacesFile, 'utf8'));
const curatedBuildingFootprints = JSON.parse(await readFile(curatedBuildingFootprintsFile, 'utf8'));

assert(generatedBuildings.type === 'FeatureCollection', 'generated buildings must be a FeatureCollection');
assert(Array.isArray(generatedBuildings.features), 'generated buildings features must be an array');
assert(generatedBuildings.features.length > 0, 'generated buildings must contain at least one feature');
assert(generatedBuildings.properties?.generated_from, 'generated buildings must record generated_from');
assert(generatedBuildings.properties?.pipeline, 'generated buildings must record pipeline');
assert(
  Array.isArray(generatedBuildings.properties?.source_ids) && generatedBuildings.properties.source_ids.length > 0,
  'generated buildings must record source_ids',
);

generatedBuildings.features.forEach(validateGeneratedBuilding);

assert(curatedPlaces.schema === 'mvp1-campus-places-v1', 'curated places must use the MVP 1 schema');
assert(Array.isArray(curatedPlaces.places), 'curated places must include a places array');
assert(curatedBuildingFootprints.type === 'FeatureCollection', 'curated building footprints must be a FeatureCollection');
assert(curatedBuildingFootprints.properties?.schema === 'mvp1-building-footprints-v1', 'curated building footprints must use the MVP 1 footprint schema');
assert(Array.isArray(curatedBuildingFootprints.features), 'curated building footprints features must be an array');

const seenPlaceIds = new Set();
curatedPlaces.places.forEach((place, index) => validateCuratedPlace(place, index, seenPlaceIds));

const placeTypeCounts = curatedPlaces.places.reduce((counts, place) => {
  counts[place.type] = (counts[place.type] ?? 0) + 1;
  return counts;
}, {});

assert(curatedPlaces.places.length >= 20, 'curated places must seed at least 20 searchable places for MVP 1');
assert((placeTypeCounts.building ?? 0) >= 10, 'curated places must seed at least 10 buildings for MVP 1');
assert((placeTypeCounts.bus_stop ?? 0) >= 8, 'curated places must seed at least 8 bus stops for MVP 1');

curatedBuildingFootprints.features.forEach(validateCuratedBuildingFootprint);
assert(curatedBuildingFootprints.features.length >= 10, 'curated building footprints must include at least 10 visible buildings for MVP 1');

assert(generatedManifest.pipeline === 'scripts/data/build-campus-data.mjs', 'manifest must record pipeline path');
assert(Array.isArray(generatedManifest.outputs), 'manifest outputs must be an array');
assert(
  generatedManifest.outputs.some((output) => output.path === 'data/generated/campus-buildings.geojson'),
  'manifest must list generated campus buildings output',
);

console.log('data/sources.yml, generated data, curated MVP 1 places, and MVP 1 building footprints contain required metadata.');
