import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const inputPath = path.join(repoRoot, 'data/prototype/com3-building.geojson');
const outputDir = path.join(repoRoot, 'data/generated');
const outputPath = path.join(outputDir, 'campus-buildings.geojson');
const manifestPath = path.join(outputDir, 'manifest.json');

const NUS_BOUNDS = {
  minLng: 103.76,
  maxLng: 103.79,
  minLat: 1.285,
  maxLat: 1.31,
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertPosition(position, context) {
  assert(Array.isArray(position), `${context} must be a coordinate array`);
  assert(position.length >= 2, `${context} must contain longitude and latitude`);

  const [lng, lat] = position;
  assert(typeof lng === 'number' && Number.isFinite(lng), `${context} longitude must be a finite number`);
  assert(typeof lat === 'number' && Number.isFinite(lat), `${context} latitude must be a finite number`);
  assert(lng >= NUS_BOUNDS.minLng && lng <= NUS_BOUNDS.maxLng, `${context} longitude ${lng} is outside NUS bounds`);
  assert(lat >= NUS_BOUNDS.minLat && lat <= NUS_BOUNDS.maxLat, `${context} latitude ${lat} is outside NUS bounds`);
}

function positionsMatch(left, right) {
  return left[0] === right[0] && left[1] === right[1];
}

function validatePolygonGeometry(geometry, featureId) {
  assert(geometry?.type === 'Polygon', `${featureId} geometry must be Polygon`);
  assert(Array.isArray(geometry.coordinates), `${featureId} coordinates must be an array`);
  assert(geometry.coordinates.length > 0, `${featureId} must contain at least one ring`);

  geometry.coordinates.forEach((ring, ringIndex) => {
    assert(Array.isArray(ring), `${featureId} ring ${ringIndex} must be an array`);
    assert(ring.length >= 4, `${featureId} ring ${ringIndex} must contain at least 4 positions`);
    ring.forEach((position, positionIndex) => {
      assertPosition(position, `${featureId} ring ${ringIndex} position ${positionIndex}`);
    });
    assert(
      positionsMatch(ring[0], ring[ring.length - 1]),
      `${featureId} ring ${ringIndex} must be closed`,
    );
  });
}

function transformBuildingFeature(feature) {
  const properties = feature.properties ?? {};
  const featureId = String(feature.id ?? properties.name ?? 'unknown-building');

  validatePolygonGeometry(feature.geometry, featureId);

  assert(properties.source_id, `${featureId} is missing source_id`);
  assert(properties.geometry_source_status, `${featureId} is missing geometry_source_status`);
  assert(properties.height_source_status, `${featureId} is missing height_source_status`);
  assert(properties.date_checked, `${featureId} is missing date_checked`);

  return {
    type: 'Feature',
    id: featureId,
    properties: {
      entity_type: 'building',
      name: properties.name,
      full_name: properties.full_name ?? properties.name,
      address: properties.address ?? null,
      source_id: properties.source_id,
      source_status: properties.geometry_source_status,
      height_m: properties.height_m,
      height_source_status: properties.height_source_status,
      building_levels: properties.building_levels ?? null,
      building_levels_source_status: properties.building_levels_source_status ?? null,
      date_checked: properties.date_checked,
      render: {
        selectable: true,
        extrudable: true,
      },
    },
    geometry: feature.geometry,
  };
}

const input = JSON.parse(await readFile(inputPath, 'utf8'));

assert(input.type === 'FeatureCollection', 'input must be a GeoJSON FeatureCollection');
assert(Array.isArray(input.features), 'input features must be an array');
assert(input.features.length > 0, 'input must contain at least one feature');

const sourceIds = [...new Set(input.features.map((feature) => feature.properties?.source_id).filter(Boolean))].sort();
const sourceDates = [...new Set(input.features.map((feature) => feature.properties?.date_checked).filter(Boolean))].sort();
const generatedFromDateChecked = sourceDates.at(-1) ?? 'unknown';

const output = {
  type: 'FeatureCollection',
  name: 'generated_campus_buildings',
  properties: {
    generated_from: 'data/prototype/com3-building.geojson',
    pipeline: 'scripts/data/build-campus-data.mjs',
    source_ids: sourceIds,
    generated_from_date_checked: generatedFromDateChecked,
  },
  features: input.features.map(transformBuildingFeature),
};

const manifest = {
  pipeline: 'scripts/data/build-campus-data.mjs',
  generated_from_date_checked: generatedFromDateChecked,
  inputs: [
    {
      path: 'data/prototype/com3-building.geojson',
      source_id: 'osm-overpass-com3',
      status: 'verified',
    },
  ],
  outputs: [
    {
      path: 'data/generated/campus-buildings.geojson',
      feature_count: output.features.length,
      schema: 'generated-campus-buildings-v1',
      source_ids: sourceIds,
    },
  ],
  validation: {
    coordinate_reference_system: 'WGS84 / EPSG:4326',
    coordinate_order: '[longitude, latitude]',
    bounds: NUS_BOUNDS,
    geometry_checks: ['polygon rings closed', 'coordinates inside NUS bounds'],
    provenance_checks: ['source_id', 'geometry_source_status', 'height_source_status', 'date_checked'],
  },
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${path.relative(repoRoot, outputPath)} with ${output.features.length} feature(s).`);
console.log(`Generated ${path.relative(repoRoot, manifestPath)}.`);
