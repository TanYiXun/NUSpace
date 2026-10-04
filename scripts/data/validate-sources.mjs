import { readFile } from 'node:fs/promises';

const sourceFile = new URL('../../data/sources.yml', import.meta.url);
const contents = await readFile(sourceFile, 'utf8');
const generatedBuildingsFile = new URL('../../data/generated/campus-buildings.geojson', import.meta.url);
const generatedManifestFile = new URL('../../data/generated/manifest.json', import.meta.url);
const curatedPlacesFile = new URL('../../data/curated/mvp1-campus-places.json', import.meta.url);
const curatedBuildingFootprintsFile = new URL('../../data/curated/mvp1-building-footprints.geojson', import.meta.url);
const isbStopPlantingFile = new URL('../../data/curated/phase2-nus-isb-stop-planting.json', import.meta.url);
const isbBusStopsFile = new URL('../../data/curated/phase2-nus-isb-bus-stops.json', import.meta.url);
const isbStopDisplayOverridesFile = new URL('../../data/curated/phase2-nus-isb-stop-display-overrides.json', import.meta.url);
const isbPublicBusLinksFile = new URL('../../data/curated/phase2-nus-isb-public-bus-links.json', import.meta.url);
const com3XrayShellFile = new URL('../../data/curated/phase4-com3-xray-shell.json', import.meta.url);
const terrainStatusFile = new URL('../../data/curated/phase4-terrain-status.json', import.meta.url);
const nextbusResearchSnapshotFile = new URL('../../data/processed/nextbus-research/nus-nextbus-static-snapshot.json', import.meta.url);

const NUS_BOUNDS = {
  minLng: 103.76,
  maxLng: 103.79,
  minLat: 1.285,
  maxLat: 1.31,
};

const NEXTBUS_RESEARCH_EXTENDED_STOPS = new Set(['CG', 'OTH', 'BG-MRT']);

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

function assertNextbusResearchPosition(stop) {
  const [lng, lat] = stop.coordinates;
  const inKentRidgeBounds = lng >= NUS_BOUNDS.minLng
    && lng <= NUS_BOUNDS.maxLng
    && lat >= NUS_BOUNDS.minLat
    && lat <= NUS_BOUNDS.maxLat;

  if (inKentRidgeBounds) {
    assertPosition(stop.coordinates, `NextBus research stop ${stop.name} coordinates`);
    return;
  }

  assert(
    NEXTBUS_RESEARCH_EXTENDED_STOPS.has(stop.name),
    `NextBus research stop ${stop.name} coordinates are outside Kent Ridge bounds and not whitelisted`,
  );
  assert(
    stop.routeRefs.some((routeRef) => routeRef.routeName === 'P'),
    `NextBus research stop ${stop.name} outside Kent Ridge bounds must be tied to Service P research data`,
  );
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

  if (place.type === 'bus_stop' && place.sourceId === 'osm-api-nus-kent-ridge-map') {
    assert(place.sourceStatus === 'manual-reference', `${context} OSM bus stop seed must be manual-reference, not verified`);
    assert(place.subtitle.includes('position unverified'), `${context} must disclose unverified bus stop position in subtitle`);
    assert(place.detail.includes('not an official NUS ISB stop record'), `${context} must disclose bus stop seed limitations`);
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

function validateIsbStopPlantingRoute(route, index, isbStopIds) {
  const context = `ISB stop planting route ${route.routeCode ?? index}`;

  assert(typeof route.routeCode === 'string' && route.routeCode.length > 0, `${context} must have a routeCode`);
  assert(typeof route.sourceLabel === 'string' && route.sourceLabel.length > 0, `${context} must have a sourceLabel`);
  assert(route.stopNameStatus === 'manual-reference', `${context} stopNameStatus must stay manual-reference without permitted machine-readable stop data`);
  assert(route.positionStatus === 'requires-permission', `${context} positionStatus must stay requires-permission without official or field-collected coordinates`);
  assert(typeof route.detail === 'string' && route.detail.includes('NextBus codelab API research inventory'), `${context} must disclose NextBus research coordinate reuse`);
  assert(Array.isArray(route.plantedStops), `${context} plantedStops must be an array`);
  assert(Array.isArray(route.unplantedStops), `${context} unplantedStops must be an array`);

  const seenSequences = new Set();

  route.plantedStops.forEach((stop, stopIndex) => {
    const stopContext = `${context} planted stop ${stop.officialName ?? stopIndex}`;

    assert(Number.isInteger(stop.sequence) && stop.sequence > 0, `${stopContext} must have a positive sequence`);
    assert(!seenSequences.has(stop.sequence), `${stopContext} sequence must be unique`);
    seenSequences.add(stop.sequence);
    assert(typeof stop.officialName === 'string' && stop.officialName.length > 0, `${stopContext} must have an officialName`);
    assert(isbStopIds.has(stop.campusPlaceId), `${stopContext} campusPlaceId must exist in the curated NUS ISB stop inventory`);
    assert(stop.positionSourceId === 'nus-nextbus-codelab-api', `${stopContext} positionSourceId must stay on the NextBus research source`);
    assert(stop.positionStatus === 'requires-permission', `${stopContext} positionStatus must not be verified`);
    assert(stop.positionNote.includes('Not a verified current NUS ISB boarding-point coordinate'), `${stopContext} must disclose unverified current position`);
  });

  route.unplantedStops.forEach((stop, stopIndex) => {
    const stopContext = `${context} unplanted stop ${stop.officialName ?? stopIndex}`;

    assert(Number.isInteger(stop.sequence) && stop.sequence > 0, `${stopContext} must have a positive sequence`);
    assert(!seenSequences.has(stop.sequence), `${stopContext} sequence must be unique across planted and unplanted stops`);
    seenSequences.add(stop.sequence);
    assert(typeof stop.officialName === 'string' && stop.officialName.length > 0, `${stopContext} must have an officialName`);
    assert(typeof stop.reason === 'string' && stop.reason.length > 0, `${stopContext} must explain missing coordinates`);
  });
}

function validateNextbusResearchSnapshot(snapshot) {
  assert(snapshot.schema === 'nextbus-research-static-snapshot-v1', 'NextBus research snapshot must use the expected schema');
  assert(snapshot.sourceId === 'nus-nextbus-codelab-api', 'NextBus research snapshot must use the codelab source id');
  assert(snapshot.sourceStatus === 'requires-permission', 'NextBus research snapshot must stay requires-permission');
  assert(
    typeof snapshot.warning === 'string' && snapshot.warning.includes('Do not treat as approved production data'),
    'NextBus research snapshot must include a production-use warning',
  );
  assert(Array.isArray(snapshot.busStops), 'NextBus research snapshot must include busStops');
  assert(snapshot.busStops.length > 0, 'NextBus research snapshot must include at least one bus stop');

  snapshot.busStops.forEach((stop, index) => {
    const context = `NextBus research stop ${stop.name ?? index}`;

    assert(typeof stop.id === 'string' && stop.id.startsWith('nextbus_'), `${context} must have a nextbus_ id`);
    assert(typeof stop.name === 'string' && stop.name.length > 0, `${context} must have a name`);
    assert(stop.sourceId === 'nus-nextbus-codelab-api', `${context} must preserve sourceId`);
    assert(stop.sourceStatus === 'requires-permission', `${context} must stay requires-permission`);
    assertNextbusResearchPosition(stop);
    assert(Array.isArray(stop.routeRefs), `${context} routeRefs must be an array`);

    stop.routeRefs.forEach((routeRef, routeIndex) => {
      const routeContext = `${context} routeRef ${routeIndex}`;

      assert(typeof routeRef.routeName === 'string' && routeRef.routeName.length > 0, `${routeContext} must have a routeName`);
      assert(typeof routeRef.busStopCode === 'string' && routeRef.busStopCode.length > 0, `${routeContext} must have a busStopCode`);
      assert(routeRef.snapshotTimestamp, `${routeContext} must preserve snapshotTimestamp`);
    });
  });
}

function validateIsbBusStopInventory(inventory, snapshot) {
  assert(inventory.schema === 'phase2-nus-isb-bus-stops-v1', 'NUS ISB bus stop inventory must use the expected schema');
  assert(inventory.source_status === 'requires-permission', 'NUS ISB bus stop inventory must stay requires-permission');
  assert(
    typeof inventory.warning === 'string' && inventory.warning.includes('Do not mark verified'),
    'NUS ISB bus stop inventory must include a verification warning',
  );
  assert(Array.isArray(inventory.source_ids), 'NUS ISB bus stop inventory must include source_ids');
  assert(inventory.source_ids.includes('nus-nextbus-codelab-api'), 'NUS ISB bus stop inventory must reference the NextBus codelab source');
  assert(Array.isArray(inventory.stops), 'NUS ISB bus stop inventory must include stops');
  assert(inventory.stops.length === snapshot.busStops.length, 'NUS ISB bus stop inventory must include every NextBus snapshot stop');

  const snapshotNames = new Set(snapshot.busStops.map((stop) => stop.name));
  const seenStopIds = new Set();
  const seenNextbusNames = new Set();

  inventory.stops.forEach((stop, index) => {
    const context = `NUS ISB bus stop ${stop.id ?? index}`;

    assert(typeof stop.id === 'string' && stop.id.startsWith('nextbus-'), `${context} must have a nextbus id`);
    assert(!seenStopIds.has(stop.id), `${context} id must be unique`);
    seenStopIds.add(stop.id);
    assert(typeof stop.name === 'string' && stop.name.length > 0, `${context} must have a display name`);
    assert(Array.isArray(stop.aliases), `${context} aliases must be an array`);
    assert(stop.type === 'bus_stop', `${context} must have type=bus_stop`);
    assertNextbusResearchPosition({ name: stop.nextbus?.name, coordinates: stop.coordinates, routeRefs: stop.nextbus?.routeRefs ?? [] });
    assert(stop.sourceId === 'nus-nextbus-codelab-api', `${context} must preserve sourceId`);
    assert(stop.sourceStatus === 'requires-permission', `${context} must stay requires-permission`);
    assert(typeof stop.sourceLabel === 'string' && stop.sourceLabel.startsWith('NextBus '), `${context} must preserve sourceLabel`);
    assert(typeof stop.detail === 'string' && stop.detail.includes('require permission review'), `${context} must disclose permission review`);
    assert(snapshotNames.has(stop.nextbus?.name), `${context} nextbus.name must exist in snapshot`);
    assert(!seenNextbusNames.has(stop.nextbus.name), `${context} nextbus.name must be unique`);
    seenNextbusNames.add(stop.nextbus.name);
    assert(Array.isArray(stop.nextbus.routeNames) && stop.nextbus.routeNames.length > 0, `${context} must include routeNames`);
    assert(Array.isArray(stop.nextbus.routeRefs), `${context} must include routeRefs`);
  });
}

function validateIsbPublicBusLinks(links, isbStopIds) {
  assert(links.schema === 'phase2-nus-isb-public-bus-links-v1', 'NUS ISB public bus links must use the expected schema');
  assert(Array.isArray(links.source_ids), 'NUS ISB public bus links must include source_ids');
  assert(links.source_ids.includes('nus-nextbus-codelab-api'), 'NUS ISB public bus links must reference the NextBus research source');
  assert(links.source_ids.includes('lta-datamall-dynamic-apis'), 'NUS ISB public bus links must reference LTA DataMall');
  assert(links.source_ids.every((sourceId) => contents.includes(`id: ${sourceId}`)), 'NUS ISB public bus link source_ids must exist in data/sources.yml');
  assert(typeof links.match_method === 'string' && links.match_method.includes('Nearest official LTA DataMall BusStops'), 'NUS ISB public bus links must document the match method');
  assert(typeof links.warning === 'string' && links.warning.includes('do not verify NUS ISB'), 'NUS ISB public bus links must include an ISB verification warning');
  assert(Array.isArray(links.links), 'NUS ISB public bus links must include links');
  assert(Array.isArray(links.unlinkedStopIds), 'NUS ISB public bus links must include unlinkedStopIds');

  const seenLinkedStopIds = new Set();
  const seenUnlinkedStopIds = new Set();

  links.links.forEach((link, index) => {
    const context = `NUS ISB public bus link ${link.nextbusStopId ?? index}`;

    assert(isbStopIds.has(link.nextbusStopId), `${context} nextbusStopId must exist in the NUS ISB stop inventory`);
    assert(!seenLinkedStopIds.has(link.nextbusStopId), `${context} nextbusStopId must be unique`);
    seenLinkedStopIds.add(link.nextbusStopId);
    assert(/^\d{5}$/.test(link.ltaBusStopCode), `${context} must use a five-digit LTA bus stop code`);
    assert(typeof link.ltaDescription === 'string' && link.ltaDescription.length > 0, `${context} must include an LTA description`);
    assert(typeof link.roadName === 'string' && link.roadName.length > 0, `${context} must include a roadName`);
    assert(Number.isInteger(link.distanceMeters) && link.distanceMeters >= 0 && link.distanceMeters <= 100, `${context} distanceMeters must stay within the documented link threshold`);
    assert(['coordinate-match', 'nearby-public-stop'].includes(link.matchStatus), `${context} matchStatus is unsupported`);
  });

  links.unlinkedStopIds.forEach((stopId) => {
    assert(isbStopIds.has(stopId), `unlinked NUS ISB stop ${stopId} must exist in the NUS ISB stop inventory`);
    assert(!seenLinkedStopIds.has(stopId), `NUS ISB stop ${stopId} cannot be both linked and unlinked`);
    assert(!seenUnlinkedStopIds.has(stopId), `unlinked NUS ISB stop ${stopId} must be unique`);
    seenUnlinkedStopIds.add(stopId);
  });

  assert(
    seenLinkedStopIds.size + seenUnlinkedStopIds.size === isbStopIds.size,
    'NUS ISB public bus links must account for every NUS ISB research stop as linked or unlinked',
  );
}

function validateIsbStopDisplayOverrides(displayOverrides, isbStops) {
  assert(displayOverrides.schema === 'phase2-nus-isb-stop-display-overrides-v1', 'NUS ISB stop display overrides must use the expected schema');
  assert(displayOverrides.source_status === 'manual-reference', 'NUS ISB stop display overrides must stay manual-reference');
  assert(Array.isArray(displayOverrides.source_ids), 'NUS ISB stop display overrides must include source_ids');
  assert(displayOverrides.source_ids.includes('osm-api-nus-kent-ridge-map'), 'NUS ISB stop display overrides must reference the OSM Kent Ridge source');
  assert(displayOverrides.source_ids.includes('nus-nextbus-codelab-api'), 'NUS ISB stop display overrides must reference the NextBus research source');
  assert(displayOverrides.source_ids.every((sourceId) => contents.includes(`id: ${sourceId}`)), 'NUS ISB stop display override source_ids must exist in data/sources.yml');
  assert(typeof displayOverrides.match_method === 'string' && displayOverrides.match_method.includes('Exact normalized stop-name match'), 'NUS ISB stop display overrides must document exact-name match method');
  assert(typeof displayOverrides.warning === 'string' && displayOverrides.warning.includes('Do not mark these display positions verified'), 'NUS ISB stop display overrides must include a verification warning');
  assert(Array.isArray(displayOverrides.overrides), 'NUS ISB stop display overrides must include overrides');
  assert(Array.isArray(displayOverrides.unmatchedStopIds), 'NUS ISB stop display overrides must include unmatchedStopIds');

  const isbStopIds = new Set(isbStops.map((stop) => stop.id));
  const seenOverrideStopIds = new Set();
  const seenUnmatchedStopIds = new Set();

  displayOverrides.overrides.forEach((override, index) => {
    const context = `NUS ISB display-position override ${override.nextbusStopId ?? index}`;

    assert(isbStopIds.has(override.nextbusStopId), `${context} nextbusStopId must exist in the NUS ISB stop inventory`);
    assert(!seenOverrideStopIds.has(override.nextbusStopId), `${context} nextbusStopId must be unique`);
    seenOverrideStopIds.add(override.nextbusStopId);
    assertPosition(override.coordinates, `${context} coordinates`);
    assert(override.sourceId === 'osm-api-nus-kent-ridge-map', `${context} must use the OSM Kent Ridge source for display coordinates`);
    assert(override.sourceStatus === 'manual-reference', `${context} must stay manual-reference`);
    assert(override.osm?.type === 'node', `${context} must preserve an OSM node reference`);
    assert(Number.isInteger(override.osm?.id), `${context} must preserve an OSM node id`);
    assert(typeof override.osm?.name === 'string' && override.osm.name.length > 0, `${context} must preserve the OSM name`);
    if (override.osm.network !== undefined) {
      assert(typeof override.osm.network === 'string' && override.osm.network.length > 0, `${context} OSM network tag must be a non-empty string when present`);
    }
    if (override.osm.ref !== undefined) {
      assert(/^\d{5}$/.test(override.osm.ref), `${context} OSM public bus stop ref must be a five-digit code when present`);
    }
    assert(Number.isInteger(override.distanceFromNextbusMeters) && override.distanceFromNextbusMeters >= 0, `${context} must include distance from the NextBus coordinate`);
    assert(override.reviewStatus === 'reviewed', `${context} must be reviewed before being used for display`);
    assert(override.shipAllowed === false, `${context} must not be marked production ship allowed without official verification`);
    assert(typeof override.note === 'string' && override.note.includes('permission-required planning data'), `${context} must disclose the NextBus coordinate boundary`);
  });

  displayOverrides.unmatchedStopIds.forEach((stopId) => {
    assert(isbStopIds.has(stopId), `unmatched NUS ISB display-position stop ${stopId} must exist in the NUS ISB stop inventory`);
    assert(!seenOverrideStopIds.has(stopId), `NUS ISB display-position stop ${stopId} cannot be both overridden and unmatched`);
    assert(!seenUnmatchedStopIds.has(stopId), `unmatched NUS ISB display-position stop ${stopId} must be unique`);
    seenUnmatchedStopIds.add(stopId);
  });

  assert(
    seenOverrideStopIds.size + seenUnmatchedStopIds.size === isbStopIds.size,
    'NUS ISB stop display overrides must account for every NUS ISB research stop as overridden or unmatched',
  );
}

function validateCom3XrayShell(shell) {
  assert(shell.schema === 'phase4-building-xray-shell-v1', 'COM3 xray shell must use the Phase 4 schema');
  assert(shell.buildingId === 'com3', 'COM3 xray shell must target com3');
  assert(Array.isArray(shell.sourceIds), 'COM3 xray shell must include sourceIds');
  assert(shell.sourceIds.includes('osm-overpass-com3'), 'COM3 xray shell must reference the COM3 OSM source');
  assert(shell.geometrySourceStatus === 'verified', 'COM3 xray shell footprint source must remain verified');
  assert(shell.floorCountSourceStatus === 'verified', 'COM3 xray shell floor count must remain verified');
  assert(shell.floorLabelSourceStatus === 'manual-reference', 'COM3 xray shell floor labels must stay manual-reference');
  assert(shell.xrayStatus === 'building shell only', 'COM3 xray shell must stay shell-only');
  assert(shell.heightSourceStatus === 'prototype-placeholder', 'COM3 xray shell height must stay prototype-placeholder');
  assert(shell.heightMeters === 24, 'COM3 xray shell height must match the current COM3 visual height');
  assert(shell.floorHeightMeters === 4, 'COM3 xray shell floor height must match the current visual floor height');
  assert(Array.isArray(shell.floorSelectorLabels), 'COM3 xray shell must include floor selector labels');
  assert(shell.floorSelectorLabels.length === 6, 'COM3 xray shell must expose six floor labels from OSM building:levels');
  shell.floorSelectorLabels.forEach((label, index) => {
    assert(label === `L${index + 1}`, `COM3 xray shell floor label ${index + 1} must be generic L${index + 1}`);
  });
  assert(shell.blockedArtifacts?.publicEntrances?.includes('Not enabled'), 'COM3 xray shell must keep public entrances blocked');
  assert(shell.blockedArtifacts?.indoorDetail?.includes('Not enabled'), 'COM3 xray shell must keep indoor detail blocked');
  assert(shell.detail.includes('must not be treated as official indoor detail'), 'COM3 xray shell must disclose indoor-detail limitation');
}

function validateTerrainStatus(status) {
  assert(status.schema === 'phase4-terrain-status-v1', 'terrain status must use the Phase 4 schema');
  assert(['unavailable', 'prototype', 'supported', 'disabled-for-performance'].includes(status.status), 'terrain status has unsupported status');
  assert(status.status === 'unavailable', 'terrain must stay unavailable until the Phase 4 terrain gate is resolved');
  assert(Array.isArray(status.sourceIds), 'terrain status must include sourceIds');
  assert(status.sourceIds.length === 0, 'terrain unavailable state must not reference an elevation source');
  assert(typeof status.dateChecked === 'string' && status.dateChecked.length > 0, 'terrain status must include dateChecked');
  assert(typeof status.nextReviewDate === 'string' && status.nextReviewDate.length > 0, 'terrain status must include nextReviewDate');
  assert(typeof status.decision === 'string' && status.decision.includes('Do not enable terrain'), 'terrain status must document the blocked decision');
  assert(typeof status.uiLabel === 'string' && status.uiLabel.includes('Terrain'), 'terrain status must include a UI label');
  assert(typeof status.uiSummary === 'string' && status.uiSummary.includes('elevation source'), 'terrain status must expose the missing elevation-source requirement');
  assert(status.layerStateLabel === 'Blocked', 'terrain unavailable state must show as Blocked');
  assert(status.requirements?.elevationSource === 'missing', 'terrain status must keep elevation source missing');
  assert(status.requirements?.license === 'missing', 'terrain status must keep license missing');
  assert(status.requirements?.campusAlignment === 'missing', 'terrain status must keep alignment missing');
  assert(status.requirements?.mobilePerformance === 'missing', 'terrain status must keep mobile performance missing');
  assert(status.requirements?.labelAndOverlayReadability === 'missing', 'terrain status must keep readability missing');
  assert(status.requirements?.boundaryTreatment === 'missing', 'terrain status must keep boundary treatment missing');
  assert(status.coverage?.extentStatus === 'not-defined', 'terrain unavailable state must not define coverage');
  assert(
    typeof status.coverage?.boundaryPolicy === 'string' && status.coverage.boundaryPolicy.includes('unfinished square'),
    'terrain status must document user-facing boundary policy',
  );
  assert(Array.isArray(status.blockedArtifacts), 'terrain status must include blockedArtifacts');
  assert(status.blockedArtifacts.includes('terrain tiles'), 'terrain status must keep terrain tiles blocked');
}

const generatedBuildings = JSON.parse(await readFile(generatedBuildingsFile, 'utf8'));
const generatedManifest = JSON.parse(await readFile(generatedManifestFile, 'utf8'));
const curatedPlaces = JSON.parse(await readFile(curatedPlacesFile, 'utf8'));
const curatedBuildingFootprints = JSON.parse(await readFile(curatedBuildingFootprintsFile, 'utf8'));
const isbStopPlanting = JSON.parse(await readFile(isbStopPlantingFile, 'utf8'));
const isbBusStops = JSON.parse(await readFile(isbBusStopsFile, 'utf8'));
const isbStopDisplayOverrides = JSON.parse(await readFile(isbStopDisplayOverridesFile, 'utf8'));
const isbPublicBusLinks = JSON.parse(await readFile(isbPublicBusLinksFile, 'utf8'));
const com3XrayShell = JSON.parse(await readFile(com3XrayShellFile, 'utf8'));
const terrainStatus = JSON.parse(await readFile(terrainStatusFile, 'utf8'));
const nextbusResearchSnapshot = JSON.parse(await readFile(nextbusResearchSnapshotFile, 'utf8'));

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

assert(isbStopPlanting.schema === 'phase2-nus-isb-stop-planting-v1', 'ISB stop planting must use the Phase 2 schema');
assert(Array.isArray(isbStopPlanting.source_ids), 'ISB stop planting must record source_ids');
assert(isbStopPlanting.source_ids.every((sourceId) => contents.includes(`id: ${sourceId}`)), 'ISB stop planting source_ids must exist in data/sources.yml');
assert(Array.isArray(isbStopPlanting.routes), 'ISB stop planting must include routes');
const isbStopIds = new Set(isbBusStops.stops.map((stop) => stop.id));
isbStopPlanting.routes.forEach((route, index) => validateIsbStopPlantingRoute(route, index, isbStopIds));
validateNextbusResearchSnapshot(nextbusResearchSnapshot);
validateIsbBusStopInventory(isbBusStops, nextbusResearchSnapshot);
validateIsbStopDisplayOverrides(isbStopDisplayOverrides, isbBusStops.stops);
validateIsbPublicBusLinks(isbPublicBusLinks, isbStopIds);
validateCom3XrayShell(com3XrayShell);
validateTerrainStatus(terrainStatus);

assert(generatedManifest.pipeline === 'scripts/data/build-campus-data.mjs', 'manifest must record pipeline path');
assert(Array.isArray(generatedManifest.outputs), 'manifest outputs must be an array');
assert(
  generatedManifest.outputs.some((output) => output.path === 'data/generated/campus-buildings.geojson'),
  'manifest must list generated campus buildings output',
);

console.log('data/sources.yml, generated data, curated MVP 1 places, MVP 1 building footprints, Phase 2 ISB stop planting, NUS ISB bus stops, NUS ISB display-position overrides, NUS ISB public bus links, NextBus research snapshot, COM3 xray shell, and terrain status contain required metadata.');
