import { readFile } from 'node:fs/promises';

const sourceFile = new URL('../../data/sources.yml', import.meta.url);
const contents = await readFile(sourceFile, 'utf8');
const generatedBuildingsFile = new URL('../../data/generated/campus-buildings.geojson', import.meta.url);
const generatedManifestFile = new URL('../../data/generated/manifest.json', import.meta.url);

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

const generatedBuildings = JSON.parse(await readFile(generatedBuildingsFile, 'utf8'));
const generatedManifest = JSON.parse(await readFile(generatedManifestFile, 'utf8'));

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

assert(generatedManifest.pipeline === 'scripts/data/build-campus-data.mjs', 'manifest must record pipeline path');
assert(Array.isArray(generatedManifest.outputs), 'manifest outputs must be an array');
assert(
  generatedManifest.outputs.some((output) => output.path === 'data/generated/campus-buildings.geojson'),
  'manifest must list generated campus buildings output',
);

console.log('data/sources.yml and generated data contain required Phase 0 metadata.');
