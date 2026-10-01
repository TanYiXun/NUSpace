import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import maplibregl from 'maplibre-gl';
import mvp1BuildingFootprintsRaw from '../../data/curated/mvp1-building-footprints.geojson?raw';
import com3BuildingRaw from '../../data/prototype/com3-building.geojson?raw';
import d1RouteRaw from '../../data/prototype/d1-route.geojson?raw';
import d1StopsRaw from '../../data/prototype/d1-stops.geojson?raw';
import { BASE_MAP_STYLE_URL, INITIAL_CAMERA } from './mapConfig';
import { searchEntities, searchIndex, type SearchEntity } from './searchIndex';
import {
  fetchPublicBusArrivalUiState,
  getPublicBusVehicleTypeLabel,
  isPublicBusWheelchairAccessible,
  type PublicBusArrivalUiState,
} from '../transit/publicBusArrivals';
import { defaultPublicBusStop } from '../transit/publicBusStops';
import { d1StaticRoute } from '../transit/nusIsbStaticRoutes';
import {
  fetchNusModsModuleUiState,
  type NusModsModuleUiState,
} from '../nusmods/nusModsModuleLookup';

const COM3_SOURCE_ID = 'prototype-com3-building';
const COM3_DETAIL_SOURCE_ID = 'prototype-com3-visual-detail';
const CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID = 'mvp1-building-footprints';
const CAMPUS_BUILDING_EXTRUSION_LAYER_ID = 'mvp1-building-extrusions';
const CAMPUS_BUILDING_OUTLINE_LAYER_ID = 'mvp1-building-outlines';
const CAMPUS_BUILDING_LABEL_LAYER_ID = 'mvp1-building-labels';
const COM3_EXTRUSION_LAYER_ID = 'prototype-com3-extrusion';
const COM3_FLOOR_BANDS_LAYER_ID = 'prototype-com3-floor-bands';
const COM3_ROOF_CAP_LAYER_ID = 'prototype-com3-roof-cap';
const COM3_OUTLINE_LAYER_ID = 'prototype-com3-outline';
const COM3_LABEL_LAYER_ID = 'prototype-com3-label';
const D1_ROUTE_SOURCE_ID = 'prototype-d1-route';
const D1_STOPS_SOURCE_ID = 'prototype-d1-stops';
const D1_BUS_SOURCE_ID = 'prototype-d1-simulated-bus';
const CAMPUS_BUS_STOPS_SOURCE_ID = 'mvp1-campus-bus-stops';
const USER_LOCATION_SOURCE_ID = 'user-location';
const D1_ROUTE_CASING_LAYER_ID = 'prototype-d1-route-casing';
const D1_ROUTE_LAYER_ID = 'prototype-d1-route-line';
const D1_ROUTE_ARROWS_LAYER_ID = 'prototype-d1-route-arrows';
const D1_STOP_CIRCLES_LAYER_ID = 'prototype-d1-stop-circles';
const D1_STOP_LABELS_LAYER_ID = 'prototype-d1-stop-labels';
const D1_BUS_CIRCLE_LAYER_ID = 'prototype-d1-bus-circle';
const D1_BUS_LABEL_LAYER_ID = 'prototype-d1-bus-label';
const CAMPUS_BUS_STOP_CIRCLES_LAYER_ID = 'mvp1-campus-bus-stop-circles';
const CAMPUS_BUS_STOP_LABELS_LAYER_ID = 'mvp1-campus-bus-stop-labels';
const USER_LOCATION_ACCURACY_LAYER_ID = 'user-location-accuracy';
const USER_LOCATION_DOT_LAYER_ID = 'user-location-dot';
const PUBLIC_BUS_REFRESH_MS = 20_000;
const com3Building = JSON.parse(com3BuildingRaw) as GeoJSON.FeatureCollection;
const d1Route = JSON.parse(d1RouteRaw) as GeoJSON.FeatureCollection;
const d1Stops = JSON.parse(d1StopsRaw) as GeoJSON.FeatureCollection;
const COM3_FEATURE_ID = 'prototype_com3_osm_relation_15780831';
const D1_ANIMATION_DURATION_MS = 26000;
const mvp1BuildingFootprints = JSON.parse(mvp1BuildingFootprintsRaw) as GeoJSON.FeatureCollection;
const campusBuildingFootprints = {
  ...mvp1BuildingFootprints,
  features: mvp1BuildingFootprints.features.filter((feature) => feature.id !== 'com3'),
} as GeoJSON.FeatureCollection;
const landmarkBuildingNames = [
  'Central Library',
  'University Cultural Centre',
  'Create Tower',
  'Education Resource Centre',
];
const BUILDING_LAYER_IDS = [
  CAMPUS_BUILDING_EXTRUSION_LAYER_ID,
  CAMPUS_BUILDING_OUTLINE_LAYER_ID,
  CAMPUS_BUILDING_LABEL_LAYER_ID,
  COM3_EXTRUSION_LAYER_ID,
  COM3_FLOOR_BANDS_LAYER_ID,
  COM3_ROOF_CAP_LAYER_ID,
  COM3_OUTLINE_LAYER_ID,
  COM3_LABEL_LAYER_ID,
];
const PROTOTYPE_ROUTE_LAYER_IDS = [
  D1_ROUTE_CASING_LAYER_ID,
  D1_ROUTE_LAYER_ID,
  D1_ROUTE_ARROWS_LAYER_ID,
  D1_STOP_CIRCLES_LAYER_ID,
  D1_STOP_LABELS_LAYER_ID,
  D1_BUS_CIRCLE_LAYER_ID,
  D1_BUS_LABEL_LAYER_ID,
];
const BUS_STOP_LAYER_IDS = [
  CAMPUS_BUS_STOP_CIRCLES_LAYER_ID,
  CAMPUS_BUS_STOP_LABELS_LAYER_ID,
];

type LngLatPosition = [number, number];
type SelectedPanel = 'overview' | 'route' | 'building' | 'search' | 'busStop' | 'module';
type SheetState = 'collapsed' | 'half' | 'expanded';
type LayerKey = 'buildings' | 'busStops' | 'prototypeRoute';
type LocationStatus = 'idle' | 'locating' | 'unavailable' | 'denied' | 'found';
type BuildingVisualMetadata = {
  id: string;
  name: string;
  sourceLabel: string;
  sourceStatus: string;
  heightMeters: number | null;
  heightSourceStatus: string;
  levels: string | number | null;
  detail: string;
};

const buildingVisualMetadata = new Map(
  mvp1BuildingFootprints.features
    .map((feature) => {
      const properties = feature.properties ?? {};

      if (typeof feature.id !== 'string') {
        return null;
      }

      return [
        feature.id,
        {
          id: feature.id,
          name: typeof properties.name === 'string' ? properties.name : feature.id,
          sourceLabel: typeof properties.source_label === 'string' ? properties.source_label : 'Unknown source',
          sourceStatus: typeof properties.source_status === 'string' ? properties.source_status : 'unknown',
          heightMeters: typeof properties.height_m === 'number' ? properties.height_m : null,
          heightSourceStatus: typeof properties.height_source_status === 'string' ? properties.height_source_status : 'unknown',
          levels: typeof properties.building_levels === 'string' || typeof properties.building_levels === 'number'
            ? properties.building_levels
            : null,
          detail: typeof properties.detail === 'string' ? properties.detail : 'No additional building-detail note is available.',
        },
      ] as const;
    })
    .filter((entry): entry is readonly [string, BuildingVisualMetadata] => entry !== null),
);
const initialPublicBusArrivalState: PublicBusArrivalUiState = {
  status: 'loading',
  sourceLabel: 'LTA DataMall public bus data',
  busStopCode: defaultPublicBusStop.busStopCode,
  arrivalCount: 0,
  cacheHit: false,
  cacheTtlSeconds: 0,
  arrivals: [],
  message: 'Checking the NUSpace public bus endpoint.',
};
const initialNusModsModuleState: NusModsModuleUiState = {
  status: 'idle',
  message: 'Search a module code to inspect lesson venues.',
};

function getPublicBusStatusLabel(state: PublicBusArrivalUiState) {
  if (state.status === 'loading') {
    return 'Checking endpoint';
  }

  if (state.status === 'ok') {
    return `${state.arrivalCount} services`;
  }

  if (state.status === 'missing_key') {
    return 'Missing server key';
  }

  return 'Unavailable';
}

function formatArrivalDisplay(minutes: number | null) {
  if (minutes === null) {
    return '--';
  }

  return minutes === 0 ? 'Arr' : `${minutes}`;
}

function formatArrivalAccessibleLabel(minutes: number | null) {
  if (minutes === null) {
    return 'no arrival estimate';
  }

  if (minutes === 0) {
    return 'arriving';
  }

  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

function formatFetchedAt(value?: string) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(parsed);
}

function getPublicBusEstimateLabel(bus: PublicBusArrivalUiState['arrivals'][number]['nextBuses'][number]) {
  const timeLabel = formatArrivalAccessibleLabel(bus.estimatedArrivalMinutes);
  const vehicleTypeLabel = getPublicBusVehicleTypeLabel(bus.type);
  const accessibilityLabel = isPublicBusWheelchairAccessible(bus.feature) ? 'wheelchair-accessible bus' : null;

  return [timeLabel, accessibilityLabel, vehicleTypeLabel].filter(Boolean).join(', ');
}

function createCom3VisualDetails(source: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  const baseFeature = source.features[0];

  if (!baseFeature || baseFeature.geometry.type !== 'Polygon') {
    return { type: 'FeatureCollection', features: [] };
  }

  const sourceProperties = baseFeature.properties ?? {};
  const floorBandHeights = [3.9, 7.9, 11.9, 15.9, 19.9];

  const bandFeatures = floorBandHeights.map((height, index) => ({
    type: 'Feature' as const,
    id: `prototype_com3_floor_band_${index + 1}`,
    properties: {
      name: 'COM3 facade band',
      source_id: sourceProperties.source_id,
      visual_source_status: 'prototype-placeholder',
      base_m: height,
      height_m: height + 0.28,
      note: 'Procedural floor band generated from the sourced COM3 footprint for visual recognizability testing.',
    },
    geometry: baseFeature.geometry,
  }));

  return {
    type: 'FeatureCollection',
    features: [
      ...bandFeatures,
      {
        type: 'Feature',
        id: 'prototype_com3_roof_cap',
        properties: {
          name: 'COM3 roof cap',
          source_id: sourceProperties.source_id,
          visual_source_status: 'prototype-placeholder',
          base_m: 24,
          height_m: 24.7,
          note: 'Procedural roof cap generated from the sourced COM3 footprint for visual recognizability testing.',
        },
        geometry: baseFeature.geometry,
      },
    ],
  };
}

const com3VisualDetails = createCom3VisualDetails(com3Building);

function getFirstSymbolLayerId(map: maplibregl.Map) {
  return map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id;
}

function getD1RouteCoordinates(): LngLatPosition[] {
  const routeFeature = d1Route.features[0];

  if (!routeFeature || routeFeature.geometry.type !== 'LineString') {
    return [];
  }

  return routeFeature.geometry.coordinates as LngLatPosition[];
}

function getSegmentDistance(start: LngLatPosition, end: LngLatPosition) {
  const lngDistance = (end[0] - start[0]) * 111_320;
  const latDistance = (end[1] - start[1]) * 110_540;

  return Math.hypot(lngDistance, latDistance);
}

function interpolateRoutePosition(routeCoordinates: LngLatPosition[], progress: number): LngLatPosition {
  if (routeCoordinates.length === 0) {
    return [103.77345, 1.29474];
  }

  const segmentDistances = routeCoordinates.slice(0, -1).map((coordinate, index) => (
    getSegmentDistance(coordinate, routeCoordinates[index + 1])
  ));
  const totalDistance = segmentDistances.reduce((sum, distance) => sum + distance, 0);
  const targetDistance = progress * totalDistance;
  let walkedDistance = 0;

  for (let index = 0; index < segmentDistances.length; index += 1) {
    const segmentDistance = segmentDistances[index];
    const nextWalkedDistance = walkedDistance + segmentDistance;

    if (targetDistance <= nextWalkedDistance || index === segmentDistances.length - 1) {
      const start = routeCoordinates[index];
      const end = routeCoordinates[index + 1];
      const segmentProgress = segmentDistance === 0
        ? 0
        : (targetDistance - walkedDistance) / segmentDistance;

      return [
        start[0] + (end[0] - start[0]) * segmentProgress,
        start[1] + (end[1] - start[1]) * segmentProgress,
      ];
    }

    walkedDistance = nextWalkedDistance;
  }

  return routeCoordinates[routeCoordinates.length - 1];
}

function createSimulatedBusFeature(coordinates: LngLatPosition): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'prototype_d1_simulated_vehicle',
        properties: {
          name: 'Simulated D1 bus',
          route_code: 'D1',
          source_status: 'prototype-placeholder',
          is_live: false,
          note: 'Animated prototype marker only. Not a live NUS shuttle position.',
        },
        geometry: {
          type: 'Point',
          coordinates,
        },
      },
    ],
  };
}

function createUserLocationFeature(coordinates: LngLatPosition, accuracy: number): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'browser_user_location',
        properties: {
          accuracy_m: accuracy,
          source_status: 'browser-permission',
        },
        geometry: {
          type: 'Point',
          coordinates,
        },
      },
    ],
  };
}

function createCampusBusStopsFeatureCollection(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: searchIndex
      .filter((entity) => entity.type === 'bus_stop' && entity.sourceId === 'osm-api-nus-kent-ridge-map')
      .map((entity) => ({
        type: 'Feature' as const,
        id: entity.id,
        properties: {
          entity_id: entity.id,
          name: entity.name,
          source_id: entity.sourceId,
          source_status: entity.sourceStatus,
          note: entity.detail,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: entity.coordinates as LngLatPosition,
        },
      })),
  };
}

const campusBusStops = createCampusBusStopsFeatureCollection();
const campusPlaceCount = searchIndex.filter((entity) => entity.type !== 'route').length;
const campusBusStopCount = searchIndex.filter((entity) => entity.type === 'bus_stop').length;
const campusBuildingFootprintCount = mvp1BuildingFootprints.features.length;

export function CampusMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const selectedCampusBuildingRef = useRef<string | null>(null);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedPanel, setSelectedPanel] = useState<SelectedPanel>('overview');
  const [sheetState, setSheetState] = useState<SheetState>('half');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchEntity[]>([]);
  const [selectedSearchEntity, setSelectedSearchEntity] = useState<SearchEntity | null>(null);
  const [selectedBusStop, setSelectedBusStop] = useState<SearchEntity | null>(null);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [routeMenuOpen, setRouteMenuOpen] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    buildings: true,
    busStops: true,
    prototypeRoute: false,
  });
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [publicBusArrivalState, setPublicBusArrivalState] = useState<PublicBusArrivalUiState>(
    initialPublicBusArrivalState,
  );
  const [moduleQuery, setModuleQuery] = useState('CS1010S');
  const [nusModsModuleState, setNusModsModuleState] = useState<NusModsModuleUiState>(
    initialNusModsModuleState,
  );
  const stageStyle = {
    '--sheet-clearance': sheetState === 'collapsed' ? '96px' : sheetState === 'expanded' ? '78vh' : '44vh',
  } as CSSProperties;

  const updateSheet = useCallback((panel: SelectedPanel, nextSheetState: SheetState = 'half') => {
    setSelectedPanel(panel);
    setSheetState(nextSheetState);
  }, []);

  const setSelectedBuildingState = useCallback((buildingId: string | null) => {
    const map = mapRef.current;
    const nextCampusBuildingId = buildingId && buildingId !== 'com3' ? buildingId : null;
    const previousCampusBuildingId = selectedCampusBuildingRef.current;

    selectedCampusBuildingRef.current = nextCampusBuildingId;

    if (!map) {
      return;
    }

    if (previousCampusBuildingId && map.getSource(CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID)) {
      map.setFeatureState(
        { source: CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID, id: previousCampusBuildingId },
        { selected: false },
      );
    }

    if (map.getSource(COM3_SOURCE_ID)) {
      map.setFeatureState(
        { source: COM3_SOURCE_ID, id: COM3_FEATURE_ID },
        { selected: buildingId === 'com3' },
      );
    }

    if (nextCampusBuildingId && map.getSource(CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID)) {
      map.setFeatureState(
        { source: CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID, id: nextCampusBuildingId },
        { selected: true },
      );
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSearchEntity(null);
    setSelectedBusStop(null);
    setSearchResults([]);
    setRouteMenuOpen(false);
    setLayerMenuOpen(false);
    updateSheet('overview', 'half');
    setSelectedBuildingState(null);
  }, [setSelectedBuildingState, updateSheet]);

  const setMapLayerVisibility = useCallback((layerIds: string[], visible: boolean) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    layerIds.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    });
  }, []);

  const toggleLayer = (layer: LayerKey) => {
    const nextValue = !visibleLayers[layer];
    const layerIds = layer === 'buildings'
      ? BUILDING_LAYER_IDS
      : layer === 'busStops'
        ? BUS_STOP_LAYER_IDS
        : PROTOTYPE_ROUTE_LAYER_IDS;

    setVisibleLayers((current) => ({ ...current, [layer]: nextValue }));
    setMapLayerVisibility(layerIds, nextValue);
  };

  const focusRoute = () => {
    const map = mapRef.current;

    setSelectedSearchEntity(null);
    setSelectedBusStop(null);
    setVisibleLayers((current) => ({ ...current, prototypeRoute: true }));
    setMapLayerVisibility(PROTOTYPE_ROUTE_LAYER_IDS, true);
    updateSheet('route', 'half');
    setRouteMenuOpen(false);
    setLayerMenuOpen(false);
    setSelectedBuildingState(null);

    if (map) {
      map.easeTo({
        center: [103.77295, 1.29864],
        zoom: 15.8,
        pitch: 54,
        bearing: -24,
        duration: 900,
      });
    }
  };

  const focusCurrentLocation = () => {
    const map = mapRef.current;

    if (!navigator.geolocation || !map) {
      setLocationStatus('unavailable');
      return;
    }

    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: LngLatPosition = [position.coords.longitude, position.coords.latitude];
        const locationSource = map.getSource(USER_LOCATION_SOURCE_ID);

        if (locationSource && 'setData' in locationSource) {
          (locationSource as maplibregl.GeoJSONSource).setData(createUserLocationFeature(
            coordinates,
            position.coords.accuracy,
          ));
        }

        setLocationStatus('found');
        map.easeTo({
          center: coordinates,
          zoom: 17,
          pitch: 52,
          bearing: map.getBearing(),
          duration: 900,
        });
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 8_000,
      },
    );
  };

  const lookupNusModsModule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNusModsModuleState({
      status: 'loading',
      message: 'Loading NUSMods module venues.',
    });
    const nextState = await fetchNusModsModuleUiState(moduleQuery);
    setNusModsModuleState(nextState);

    if (nextState.status !== 'ok') {
      updateSheet('overview', 'half');
      return;
    }

    const primaryMappedPlace = nextState.venues.find((venue) => venue.mapping.place)?.mapping.place;

    setSelectedSearchEntity(null);
    setSelectedBusStop(null);
    setSearchResults([]);
    setLayerMenuOpen(false);
    setRouteMenuOpen(false);
    setSelectedBuildingState(primaryMappedPlace?.type === 'building' ? primaryMappedPlace.id : null);
    updateSheet('module', 'expanded');

    if (primaryMappedPlace && mapRef.current) {
      mapRef.current.easeTo({
        center: primaryMappedPlace.coordinates as LngLatPosition,
        zoom: 17,
        pitch: 52,
        bearing: mapRef.current.getBearing(),
        duration: 900,
      });
    }
  };

  const selectBusStop = useCallback((entity: SearchEntity) => {
    setSelectedBusStop(entity);
    setSelectedSearchEntity(entity);
    setSelectedBuildingState(null);
    updateSheet('busStop', 'half');
  }, [setSelectedBuildingState, updateSheet]);

  const openSearchEntity = useCallback((entity: SearchEntity) => {
    const map = mapRef.current;

    setSelectedSearchEntity(entity);
    setSelectedBusStop(entity.type === 'bus_stop' ? entity : null);
    updateSheet(entity.id === 'com3' ? 'building' : entity.type === 'bus_stop' ? 'busStop' : entity.type === 'route' ? 'route' : 'search');
    setSearchQuery(entity.name);
    setSearchResults([]);
    setLayerMenuOpen(false);
    setRouteMenuOpen(false);

    if (map) {
      map.easeTo({
        center: entity.coordinates,
        zoom: entity.zoom,
        pitch: entity.pitch,
        bearing: entity.bearing,
        duration: 900,
      });

      setSelectedBuildingState(entity.type === 'building' ? entity.id : null);

      if (entity.type === 'route') {
        setVisibleLayers((current) => ({ ...current, prototypeRoute: true }));
        setMapLayerVisibility(PROTOTYPE_ROUTE_LAYER_IDS, true);
      }
    }
  }, [setMapLayerVisibility, setSelectedBuildingState, updateSheet]);

  useEffect(() => {
    let isCurrent = true;

    const refreshPublicBusArrivals = () => {
      fetchPublicBusArrivalUiState(defaultPublicBusStop.busStopCode).then((result) => {
        if (isCurrent) {
          setPublicBusArrivalState(result);
        }
      });
    };

    refreshPublicBusArrivals();
    const intervalId = window.setInterval(refreshPublicBusArrivals, PUBLIC_BUS_REFRESH_MS);

    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASE_MAP_STYLE_URL,
      center: INITIAL_CAMERA.center,
      zoom: INITIAL_CAMERA.zoom,
      pitch: INITIAL_CAMERA.pitch,
      bearing: INITIAL_CAMERA.bearing,
      attributionControl: false,
      canvasContextAttributes: { antialias: true },
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: 'Prototype basemap for evaluation only',
      }),
      'bottom-left',
    );

    map.once('load', () => {
      map.addSource(COM3_SOURCE_ID, {
        type: 'geojson',
        data: com3Building,
      });

      map.addSource(COM3_DETAIL_SOURCE_ID, {
        type: 'geojson',
        data: com3VisualDetails,
      });

      map.addSource(CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID, {
        type: 'geojson',
        data: campusBuildingFootprints,
      });

      const d1RouteCoordinates = getD1RouteCoordinates();

      map.addSource(D1_ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: d1Route,
      });

      map.addSource(D1_STOPS_SOURCE_ID, {
        type: 'geojson',
        data: d1Stops,
      });

      map.addSource(D1_BUS_SOURCE_ID, {
        type: 'geojson',
        data: createSimulatedBusFeature(interpolateRoutePosition(d1RouteCoordinates, 0)),
      });

      map.addSource(CAMPUS_BUS_STOPS_SOURCE_ID, {
        type: 'geojson',
        data: campusBusStops,
      });

      map.addSource(USER_LOCATION_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      const firstSymbolLayerId = getFirstSymbolLayerId(map);

      map.addLayer({
        id: CAMPUS_BUILDING_EXTRUSION_LAYER_ID,
        type: 'fill-extrusion',
        source: CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID,
        minzoom: 14.6,
        paint: {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#486e7d',
            ['match', ['get', 'name'], landmarkBuildingNames, '#b5afa5', '#9ca2a1'],
          ],
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.78,
            ['interpolate', ['linear'], ['zoom'], 14.6, 0.38, 17, 0.62],
          ],
          'fill-extrusion-vertical-gradient': true,
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: CAMPUS_BUILDING_OUTLINE_LAYER_ID,
        type: 'line',
        source: CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID,
        minzoom: 15,
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#1f4e63',
            '#667178',
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            ['interpolate', ['linear'], ['zoom'], 15, 1.6, 18, 3],
            ['interpolate', ['linear'], ['zoom'], 15, 0.8, 18, 1.5],
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.94,
            0.72,
          ],
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: CAMPUS_BUILDING_LABEL_LAYER_ID,
        type: 'symbol',
        source: CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID,
        minzoom: 16.2,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 16, 10, 18, 13],
          'text-font': ['Open Sans Semibold'],
          'text-anchor': 'center',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#2f3941',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.3,
        },
      });

      map.addLayer({
        id: COM3_EXTRUSION_LAYER_ID,
        type: 'fill-extrusion',
        source: COM3_SOURCE_ID,
        paint: {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#5f6a70',
            '#777f82',
          ],
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.92,
            0.86,
          ],
          'fill-extrusion-vertical-gradient': true,
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: COM3_FLOOR_BANDS_LAYER_ID,
        type: 'fill-extrusion',
        source: COM3_DETAIL_SOURCE_ID,
        filter: ['==', ['get', 'name'], 'COM3 facade band'],
        paint: {
          'fill-extrusion-color': '#f4f1e8',
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': 0.92,
          'fill-extrusion-vertical-gradient': false,
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: COM3_ROOF_CAP_LAYER_ID,
        type: 'fill-extrusion',
        source: COM3_DETAIL_SOURCE_ID,
        filter: ['==', ['get', 'name'], 'COM3 roof cap'],
        paint: {
          'fill-extrusion-color': '#c7c3b8',
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': 0.94,
          'fill-extrusion-vertical-gradient': false,
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: COM3_OUTLINE_LAYER_ID,
        type: 'line',
        source: COM3_SOURCE_ID,
        paint: {
          'line-color': '#385863',
          'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1.2, 18, 2],
          'line-opacity': 0.82,
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: COM3_LABEL_LAYER_ID,
        type: 'symbol',
        source: COM3_SOURCE_ID,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 13, 18, 17],
          'text-font': ['Open Sans Semibold'],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': '#24333f',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.7,
        },
      });

      map.addLayer({
        id: D1_ROUTE_CASING_LAYER_ID,
        type: 'line',
        source: D1_ROUTE_SOURCE_ID,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 5, 18, 10],
          'line-opacity': 0.86,
        },
      });

      map.addLayer({
        id: D1_ROUTE_LAYER_ID,
        type: 'line',
        source: D1_ROUTE_SOURCE_ID,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#8d55c7',
          'line-width': ['interpolate', ['linear'], ['zoom'], 14, 3, 18, 6],
          'line-opacity': 0.78,
        },
      });

      map.addLayer({
        id: D1_ROUTE_ARROWS_LAYER_ID,
        type: 'symbol',
        source: D1_ROUTE_SOURCE_ID,
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 90,
          'text-field': '>',
          'text-size': ['interpolate', ['linear'], ['zoom'], 14, 11, 18, 16],
          'text-font': ['Open Sans Semibold'],
          'text-keep-upright': false,
        },
        paint: {
          'text-color': '#5c2a91',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.2,
        },
      });

      map.addLayer({
        id: D1_STOP_CIRCLES_LAYER_ID,
        type: 'circle',
        source: D1_STOPS_SOURCE_ID,
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 4, 18, 7],
          'circle-stroke-color': '#7f42bd',
          'circle-stroke-width': 2.5,
        },
      });

      map.addLayer({
        id: D1_STOP_LABELS_LAYER_ID,
        type: 'symbol',
        source: D1_STOPS_SOURCE_ID,
        minzoom: 15,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 18, 13],
          'text-font': ['Open Sans Semibold'],
          'text-anchor': 'top',
          'text-offset': [0, 0.8],
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#352046',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });

      map.addLayer({
        id: CAMPUS_BUS_STOP_CIRCLES_LAYER_ID,
        type: 'circle',
        source: CAMPUS_BUS_STOPS_SOURCE_ID,
        minzoom: 14.3,
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 3, 18, 6],
          'circle-stroke-color': '#2f80ed',
          'circle-stroke-width': 2,
          'circle-opacity': 0.96,
        },
      });

      map.addLayer({
        id: CAMPUS_BUS_STOP_LABELS_LAYER_ID,
        type: 'symbol',
        source: CAMPUS_BUS_STOPS_SOURCE_ID,
        minzoom: 16,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 16, 10, 18, 12],
          'text-font': ['Open Sans Semibold'],
          'text-anchor': 'top',
          'text-offset': [0, 0.75],
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#1f4f7a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.4,
        },
      });

      map.addLayer({
        id: D1_BUS_CIRCLE_LAYER_ID,
        type: 'circle',
        source: D1_BUS_SOURCE_ID,
        paint: {
          'circle-color': '#7f42bd',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 8, 18, 13],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.96,
        },
      });

      map.addLayer({
        id: D1_BUS_LABEL_LAYER_ID,
        type: 'symbol',
        source: D1_BUS_SOURCE_ID,
        layout: {
          'text-field': ['get', 'route_code'],
          'text-font': ['Open Sans Semibold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 18, 13],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      PROTOTYPE_ROUTE_LAYER_IDS.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'none');
        }
      });

      map.addLayer({
        id: USER_LOCATION_ACCURACY_LAYER_ID,
        type: 'circle',
        source: USER_LOCATION_SOURCE_ID,
        paint: {
          'circle-color': '#2f80ed',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            16,
            18,
            42,
          ],
          'circle-opacity': 0.16,
          'circle-stroke-color': '#2f80ed',
          'circle-stroke-opacity': 0.28,
          'circle-stroke-width': 1,
        },
      });

      map.addLayer({
        id: USER_LOCATION_DOT_LAYER_ID,
        type: 'circle',
        source: USER_LOCATION_SOURCE_ID,
        paint: {
          'circle-color': '#1677ff',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 7, 18, 10],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.98,
        },
      });

      map.on('mouseenter', COM3_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', COM3_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', COM3_EXTRUSION_LAYER_ID, () => {
        updateSheet('building');
        setSelectedSearchEntity(null);
        setSelectedBusStop(null);
        setSelectedBuildingState('com3');
      });

      map.on('mouseenter', CAMPUS_BUILDING_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', CAMPUS_BUILDING_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('click', CAMPUS_BUILDING_EXTRUSION_LAYER_ID, (event) => {
        const buildingId = event.features?.[0]?.id as string | undefined;
        const buildingEntity = searchIndex.find((entity) => entity.id === buildingId && entity.type === 'building');

        if (buildingEntity) {
          openSearchEntity(buildingEntity);
        }
      });

      [D1_ROUTE_LAYER_ID, D1_BUS_CIRCLE_LAYER_ID].forEach((layerId) => {
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('click', layerId, () => {
          setSelectedSearchEntity(null);
          setSelectedBusStop(null);
          updateSheet('route');
          setSelectedBuildingState(null);
        });
      });

      map.on('mouseenter', D1_STOP_CIRCLES_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', D1_STOP_CIRCLES_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('click', D1_STOP_CIRCLES_LAYER_ID, (event) => {
        const stopName = event.features?.[0]?.properties?.name as string | undefined;
        const stopEntity = searchEntities(stopName ?? '').find((entity) => entity.type === 'bus_stop');

        if (stopEntity) {
          selectBusStop(stopEntity);
        } else {
          updateSheet('route');
        }
      });

      map.on('mouseenter', CAMPUS_BUS_STOP_CIRCLES_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', CAMPUS_BUS_STOP_CIRCLES_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('click', CAMPUS_BUS_STOP_CIRCLES_LAYER_ID, (event) => {
        const stopId = event.features?.[0]?.properties?.entity_id as string | undefined;
        const stopEntity = searchIndex.find((entity) => entity.id === stopId && entity.type === 'bus_stop');

        if (stopEntity) {
          selectBusStop(stopEntity);
        }
      });

      map.on('click', (event) => {
        const selectedFeatures = map.queryRenderedFeatures(event.point, {
          layers: [
            COM3_EXTRUSION_LAYER_ID,
            CAMPUS_BUILDING_EXTRUSION_LAYER_ID,
            D1_ROUTE_LAYER_ID,
            D1_STOP_CIRCLES_LAYER_ID,
            CAMPUS_BUS_STOP_CIRCLES_LAYER_ID,
            D1_BUS_CIRCLE_LAYER_ID,
          ],
        });

        if (selectedFeatures.length === 0) {
          clearSelection();
        }
      });

      const animateBus = (timestamp: number) => {
        const progress = (timestamp % D1_ANIMATION_DURATION_MS) / D1_ANIMATION_DURATION_MS;
        const busSource = map.getSource(D1_BUS_SOURCE_ID);

        if (busSource && 'setData' in busSource) {
          (busSource as maplibregl.GeoJSONSource).setData(createSimulatedBusFeature(
            interpolateRoutePosition(d1RouteCoordinates, progress),
          ));
        }

        animationFrameRef.current = window.requestAnimationFrame(animateBus);
      };

      animationFrameRef.current = window.requestAnimationFrame(animateBus);

      setMapState('ready');
    });
    map.once('error', () => setMapState('error'));

    mapRef.current = map;

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, [clearSelection, openSearchEntity, selectBusStop, setSelectedBuildingState, updateSheet]);

  const selectedBuildingVisual = selectedSearchEntity?.type === 'building'
    ? buildingVisualMetadata.get(selectedSearchEntity.id) ?? null
    : null;

  return (
    <section className="mapStage" aria-label="Interactive map centered on NUS Kent Ridge" style={stageStyle}>
      <div ref={mapContainerRef} className="mapCanvas" />
      <div className="topSearchShell">
        <label className="searchLabel" htmlFor="campus-search">Search NUS</label>
        <input
          id="campus-search"
          className="searchPill"
          type="search"
          autoComplete="off"
          value={searchQuery}
          placeholder="Search NUS"
          onChange={(event) => {
            const value = event.target.value;
            setSearchQuery(value);
            setSearchResults(searchEntities(value));
          }}
          onFocus={() => setSearchResults(searchEntities(searchQuery))}
        />
        {searchResults.length > 0 ? (
          <div className="searchResults" role="listbox" aria-label="Search results">
            {searchResults.map((entity) => (
              <button
                key={entity.id}
                className="searchResult"
                type="button"
                onClick={() => openSearchEntity(entity)}
              >
                <span>
                  <strong>{entity.name}</strong>
                  <small>{entity.subtitle}</small>
                </span>
                <em>{entity.type.replace('_', ' ')}</em>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mapControlStack" aria-label="Map controls">
        <button
          className="mapControlButton"
          type="button"
          aria-label="Use current location"
          title="Use current location"
          onClick={focusCurrentLocation}
        >
          <span className="material-symbols-outlined" aria-hidden="true">my_location</span>
        </button>
        <button
          className="mapControlButton"
          type="button"
          data-active={routeMenuOpen || selectedPanel === 'route'}
          aria-label="View shuttle routes"
          title="View shuttle routes"
          onClick={() => {
            setRouteMenuOpen((open) => !open);
            setLayerMenuOpen(false);
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">directions_bus</span>
        </button>
        <button
          className="mapControlButton"
          type="button"
          data-active={layerMenuOpen}
          aria-label="Change map layers"
          title="Change map layers"
          onClick={() => {
            setLayerMenuOpen((open) => !open);
            setRouteMenuOpen(false);
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">layers</span>
        </button>
      </div>
      {routeMenuOpen ? (
        <div className="floatingMenu" data-menu="routes">
          <div className="floatingMenuHeader">
            <h2>Shuttle routes</h2>
            <p>Source pending</p>
            <button className="floatingMenuClose" type="button" aria-label="Close shuttle routes" title="Close shuttle routes" onClick={() => setRouteMenuOpen(false)}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
          <button className="routeChoice" type="button" onClick={focusRoute}>
            <span className="routeSwatch" aria-hidden="true" />
            <span className="choiceText">
              <strong>Show D1 prototype route</strong>
              <small>Geometry and stop positions unverified</small>
            </span>
            <span className="choiceMeta">{visibleLayers.prototypeRoute ? 'Shown' : 'Hidden'}</span>
          </button>
        </div>
      ) : null}
      {layerMenuOpen ? (
        <div className="floatingMenu" data-menu="layers">
          <div className="floatingMenuHeader">
            <h2>Layers</h2>
            <p>Phase 4 detail</p>
            <button className="floatingMenuClose" type="button" aria-label="Close map layers" title="Close map layers" onClick={() => setLayerMenuOpen(false)}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
          <button className="layerChoice" type="button" onClick={() => toggleLayer('buildings')}>
            <span className="choiceText">
              <strong>Building detail</strong>
              <small>OSM extrusions, landmarks, selection</small>
            </span>
            <span className="layerState">{visibleLayers.buildings ? 'On' : 'Off'}</span>
          </button>
          <button className="layerChoice" type="button" onClick={() => toggleLayer('busStops')}>
            <span className="choiceText">
              <strong>Bus stop seed</strong>
              <small>OSM stop seeds, positions unverified</small>
            </span>
            <span className="layerState">{visibleLayers.busStops ? 'On' : 'Off'}</span>
          </button>
          <button className="layerChoice" type="button" onClick={() => toggleLayer('prototypeRoute')}>
            <span className="choiceText">
              <strong>Prototype route</strong>
              <small>D1 geometry and stops unverified</small>
            </span>
            <span className="layerState">{visibleLayers.prototypeRoute ? 'On' : 'Off'}</span>
          </button>
        </div>
      ) : null}
      <div className="statusPanel" data-state={mapState} data-sheet={sheetState}>
        <button
          className="sheetHandle"
          type="button"
          aria-label="Toggle bottom sheet size"
          onClick={() => setSheetState((current) => (current === 'collapsed' ? 'half' : current === 'half' ? 'expanded' : 'collapsed'))}
        />
        {selectedPanel === 'building' ? (
          <>
            <div className="sheetHeaderRow">
              <div>
                <p className="eyebrow">Selected building</p>
                <h1>COM3</h1>
                <p>Computing 3, 11 Research Link</p>
              </div>
              <div className="sheetActions">
                <button className="sheetAction" type="button" aria-label="Collapse details" title="Collapse details" onClick={() => setSheetState('collapsed')}>
                  <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_down</span>
                </button>
                <button className="sheetAction" type="button" aria-label="Expand details" title="Expand details" onClick={() => setSheetState('expanded')}>
                  <span className="material-symbols-outlined" aria-hidden="true">open_in_full</span>
                </button>
                <button className="sheetAction" type="button" aria-label="Close details" title="Close details" onClick={clearSelection}>
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
            </div>
            <div className="sheetBody">
              <dl className="buildingFacts">
                <div>
                  <dt>Footprint</dt>
                  <dd>OSM relation 15780831</dd>
                </div>
                <div>
                  <dt>Levels</dt>
                  <dd>6, from OSM</dd>
                </div>
                <div>
                  <dt>Height</dt>
                  <dd>24 m prototype estimate</dd>
                </div>
                <div>
                  <dt>Detail</dt>
                  <dd>Prototype facade bands</dd>
                </div>
              </dl>
              <p className="truthNote">
                Real footprint and levels. Height and facade bands are visual placeholders.
              </p>
            </div>
          </>
        ) : selectedPanel === 'search' && selectedSearchEntity ? (
          <>
            <div className="sheetHeaderRow">
              <div>
                <p className="eyebrow">Selected place</p>
                <h1>{selectedSearchEntity.name}</h1>
                <p>{selectedSearchEntity.subtitle}</p>
              </div>
              <div className="sheetActions">
                <button className="sheetAction" type="button" aria-label="Close details" title="Close details" onClick={clearSelection}>
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
            </div>
            <dl className="buildingFacts">
              <div>
                <dt>Type</dt>
                <dd>{selectedSearchEntity.type.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{selectedSearchEntity.sourceLabel}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selectedSearchEntity.sourceStatus}</dd>
              </div>
              {selectedBuildingVisual ? (
                <>
                  <div>
                    <dt>Levels</dt>
                    <dd>{selectedBuildingVisual.levels ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>Height</dt>
                    <dd>{selectedBuildingVisual.heightMeters ? `${selectedBuildingVisual.heightMeters} m` : 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>Height source</dt>
                    <dd>{selectedBuildingVisual.heightSourceStatus}</dd>
                  </div>
                  <div>
                    <dt>3D detail</dt>
                    <dd>{landmarkBuildingNames.includes(selectedBuildingVisual.name) ? 'Landmark tint' : 'OSM extrusion'}</dd>
                  </div>
                </>
              ) : null}
            </dl>
            <p className="truthNote">
              {selectedBuildingVisual ? selectedBuildingVisual.detail : selectedSearchEntity.detail}
            </p>
          </>
        ) : selectedPanel === 'busStop' && selectedBusStop ? (
          <>
            <div className="sheetHeaderRow">
              <div>
                <p className="eyebrow">Selected bus stop</p>
                <h1>{selectedBusStop.name}</h1>
                <p>{selectedBusStop.subtitle}</p>
              </div>
              <div className="sheetActions">
                <button className="sheetAction" type="button" aria-label="Collapse details" title="Collapse details" onClick={() => setSheetState('collapsed')}>
                  <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_down</span>
                </button>
                <button className="sheetAction" type="button" aria-label="Expand details" title="Expand details" onClick={() => setSheetState('expanded')}>
                  <span className="material-symbols-outlined" aria-hidden="true">open_in_full</span>
                </button>
                <button className="sheetAction" type="button" aria-label="Close details" title="Close details" onClick={clearSelection}>
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
            </div>
            <div className="sheetBody">
              {selectedBusStop.sourceId === 'osm-api-nus-kent-ridge-map' ? (
                <dl className="buildingFacts">
                  <div>
                    <dt>Source</dt>
                    <dd>{selectedBusStop.sourceLabel}</dd>
                  </div>
                  <div>
                    <dt>Position</dt>
                    <dd>Unverified seed</dd>
                  </div>
                  <div>
                    <dt>Source status</dt>
                    <dd>{selectedBusStop.sourceStatus}</dd>
                  </div>
                  <div>
                    <dt>Arrivals</dt>
                    <dd>Not enabled</dd>
                  </div>
                </dl>
              ) : (
                <div className="etaRows" aria-label="Prototype bus arrival rows">
                  <div className="etaRow">
                    <span className="etaRoute">D1</span>
                    <span className="etaStatus">Simulated marker only</span>
                    <span className="etaTime">No ETA</span>
                  </div>
                  <div className="etaRow">
                    <span className="etaRoute">D2</span>
                    <span className="etaStatus">Not enabled</span>
                    <span className="etaTime">--</span>
                  </div>
                </div>
              )}
              <p className="truthNote">
                {selectedBusStop.detail}
              </p>
            </div>
          </>
        ) : selectedPanel === 'route' ? (
          <>
            <div className="sheetHeaderRow">
              <div>
                <p className="eyebrow">Prototype route</p>
                <div className="routeTitleRow">
                  <span className="routeBadge">{d1StaticRoute.code}</span>
                  <h1>{d1StaticRoute.name}</h1>
                </div>
              </div>
              <div className="sheetActions">
                <button className="sheetAction" type="button" aria-label="Close route details" title="Close route details" onClick={clearSelection}>
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
            </div>
            <p>
              {mapState === 'error'
                ? 'Basemap failed to load.'
                : d1StaticRoute.detail}
            </p>
            <dl className="routeFacts">
              <div>
                <dt>Status</dt>
                <dd>Prototype</dd>
              </div>
              <div>
                <dt>Arrivals</dt>
                <dd>{d1StaticRoute.frequencyNote}</dd>
              </div>
              <div>
                <dt>Geometry</dt>
                <dd>Unverified</dd>
              </div>
            </dl>
            <ol className="routeStops" aria-label="D1 prototype stop sequence">
              {d1StaticRoute.stopSequence.map((stop) => (
                <li key={stop}>{stop}</li>
              ))}
            </ol>
            <div className="sheetBody">
              <p className="truthNote">
                This route is selectable as a prototype planning layer only. The displayed line and stop sequence are not official NUS shuttle geometry, have no verified stop positions, no real-time arrivals, and no live vehicle positions.
              </p>
            </div>
          </>
        ) : selectedPanel === 'module' && nusModsModuleState.status === 'ok' ? (
          <>
            <div className="sheetHeaderRow">
              <div>
                <p className="eyebrow">Selected module</p>
                <h1>{nusModsModuleState.moduleCode}</h1>
                <p>{nusModsModuleState.title}</p>
              </div>
              <div className="sheetActions">
                <button className="sheetAction" type="button" aria-label="Collapse module details" title="Collapse module details" onClick={() => setSheetState('collapsed')}>
                  <span className="material-symbols-outlined" aria-hidden="true">keyboard_arrow_down</span>
                </button>
                <button className="sheetAction" type="button" aria-label="Expand module details" title="Expand module details" onClick={() => setSheetState('expanded')}>
                  <span className="material-symbols-outlined" aria-hidden="true">open_in_full</span>
                </button>
                <button className="sheetAction" type="button" aria-label="Close module details" title="Close module details" onClick={clearSelection}>
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
            </div>
            <dl className="buildingFacts">
              <div>
                <dt>Academic year</dt>
                <dd>{nusModsModuleState.academicYear}</dd>
              </div>
              <div>
                <dt>Venues</dt>
                <dd>{nusModsModuleState.venueCount} unique</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{nusModsModuleState.sourceLabel}</dd>
              </div>
              <div>
                <dt>Room detail</dt>
                <dd>Not inferred</dd>
              </div>
            </dl>
            <div className="moduleVenueRows moduleVenueRowsDetailed" aria-label="NUSMods selected module venue mappings">
              {nusModsModuleState.venues.map((venue) => (
                <div className="moduleVenueRow" key={venue.venue}>
                  <span>
                    <strong>{venue.venue}</strong>
                    <small>
                      {venue.lessonCount} lesson{venue.lessonCount === 1 ? '' : 's'} · {venue.mapping.place?.name ?? 'Unmapped venue'}
                    </small>
                    <small>
                      {venue.mapping.nearestBusStop ? `Nearest OSM seed stop: ${venue.mapping.nearestBusStop.name}` : venue.mapping.note}
                    </small>
                  </span>
                  <em data-confidence={venue.mapping.confidence}>{venue.mapping.confidence}</em>
                </div>
              ))}
            </div>
            <p className="truthNote">
              Venue mappings come from NUSMods venue codes matched against curated campus place aliases. Confidence labels do not imply room-level geometry, indoor routing, live occupancy, or official NUS timetable routing.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Phase 4 3D campus detail</p>
            <h1>NUSpace</h1>
            <p>
              3D building detail now highlights selected campus buildings while public bus arrivals and NUSMods venue lookup stay source-labelled.
            </p>
            <dl className="buildingFacts">
              <div>
                <dt>Places</dt>
                <dd>{campusPlaceCount} searchable</dd>
              </div>
              <div>
                <dt>Buildings</dt>
                <dd>{campusBuildingFootprintCount} visible footprints</dd>
              </div>
              <div>
                <dt>Bus stops</dt>
                <dd>{campusBusStopCount} OSM seed markers</dd>
              </div>
              <div>
                <dt>Public bus</dt>
                <dd>{getPublicBusStatusLabel(publicBusArrivalState)}</dd>
              </div>
            </dl>
            <div className="transitStatusCard" aria-label="Public bus arrival endpoint state">
              <div className="transitStatusHeader">
                <div>
                  <strong>{defaultPublicBusStop.name}</strong>
                  <span>{defaultPublicBusStop.roadName} · Stop {defaultPublicBusStop.busStopCode}</span>
                </div>
                <span className="transitStatusPill">{getPublicBusStatusLabel(publicBusArrivalState)}</span>
              </div>
              {publicBusArrivalState.status === 'ok' ? (
                <>
                  <div className="publicBusRows" aria-label="Live public bus arrivals from LTA DataMall">
                    {publicBusArrivalState.arrivals.slice(0, 4).map((service) => (
                      <div className="publicBusRow" key={service.serviceNo}>
                        <span className="publicBusService">{service.serviceNo}</span>
                        <span className="publicBusTimes">
                          {service.nextBuses.map((bus) => (
                            <span
                              className="publicBusEstimate"
                              aria-label={getPublicBusEstimateLabel(bus)}
                              key={`${service.serviceNo}-${bus.sequence}`}
                            >
                              <span className="publicBusTimeLine">
                                {isPublicBusWheelchairAccessible(bus.feature) ? (
                                  <span className="material-symbols-outlined publicBusWheelchairIcon" aria-hidden="true">accessible</span>
                                ) : null}
                                <span className="publicBusTime" data-stale={bus.isStale}>
                                  {formatArrivalDisplay(bus.estimatedArrivalMinutes)}
                                </span>
                              </span>
                              {getPublicBusVehicleTypeLabel(bus.type) ? (
                                <span className="publicBusDeck">{getPublicBusVehicleTypeLabel(bus.type)}</span>
                              ) : (
                                <span className="publicBusDeck" aria-hidden="true">--</span>
                              )}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p>
                    Live public bus arrivals from {publicBusArrivalState.sourceLabel}. Last fetched {formatFetchedAt(publicBusArrivalState.fetchedAt)}.
                    Auto-refreshes every {PUBLIC_BUS_REFRESH_MS / 1000}s. Server cache: {publicBusArrivalState.cacheTtlSeconds}s.
                  </p>
                </>
              ) : (
                <p>{publicBusArrivalState.message}</p>
              )}
            </div>
            <form className="moduleLookupCard" aria-label="NUSMods module venue lookup" onSubmit={lookupNusModsModule}>
              <div className="moduleLookupHeader">
                <div>
                  <strong>NUSMods venue lookup</strong>
                  <span>Module venues mapped to known campus places</span>
                </div>
                <div className="moduleLookupControls">
                  <input
                    aria-label="Module code"
                    value={moduleQuery}
                    onChange={(event) => setModuleQuery(event.target.value)}
                    placeholder="CS1010S"
                  />
                  <button type="submit">Search</button>
                </div>
              </div>
              {nusModsModuleState.status === 'ok' ? (
                <>
                  <p>
                    Found {nusModsModuleState.moduleCode} · {nusModsModuleState.venueCount} venues from {nusModsModuleState.sourceLabel}.
                  </p>
                  <button className="moduleOpenButton" type="button" onClick={() => updateSheet('module', 'expanded')}>
                    View venue mappings
                  </button>
                </>
              ) : (
                <p>{nusModsModuleState.message}</p>
              )}
            </form>
            <p className="truthNote">
              LTA public bus arrivals use the server-side adapter only. NUSMods venue mappings show confidence and never infer room-level detail. No live NUS shuttle API, official route geometry, indoor maps, or NUS shuttle real-time arrivals are enabled.
            </p>
            {locationStatus !== 'idle' ? (
              <p className="locationNote">
                Location: {locationStatus === 'locating'
                  ? 'requesting permission'
                  : locationStatus === 'found'
                    ? 'centered on browser position'
                    : locationStatus === 'denied'
                      ? 'permission denied'
                      : 'unavailable'}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
