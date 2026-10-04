import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import maplibregl from 'maplibre-gl';
import mvp1BuildingFootprintsRaw from '../../data/curated/mvp1-building-footprints.geojson?raw';
import com3BuildingRaw from '../../data/prototype/com3-building.geojson?raw';
import com3XrayShell from '../../data/curated/phase4-com3-xray-shell.json';
import { BASE_MAP_STYLE_URL, INITIAL_CAMERA } from './mapConfig';
import { searchEntities, searchIndex, type SearchEntity } from './searchIndex';
import {
  fetchPublicBusArrivalUiState,
  getPublicBusVehicleTypeLabel,
  isPublicBusWheelchairAccessible,
  type PublicBusArrivalUiState,
} from '../transit/publicBusArrivals';
import {
  fetchNusModsModuleUiState,
  type NusModsModuleUiState,
} from '../nusmods/nusModsModuleLookup';
import { getNusIsbPlantedStopsForCampusPlace } from '../transit/nusIsbStopPlanting';
import { getNusIsbPublicBusLink } from '../transit/nusIsbPublicBusLinks';

const COM3_SOURCE_ID = 'prototype-com3-building';
const COM3_DETAIL_SOURCE_ID = 'prototype-com3-visual-detail';
const COM3_XRAY_SOURCE_ID = 'phase4-com3-xray-shell';
const CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID = 'mvp1-building-footprints';
const CAMPUS_BUILDING_DETAIL_SOURCE_ID = 'mvp1-building-visual-detail';
const CAMPUS_BUILDING_EXTRUSION_LAYER_ID = 'mvp1-building-extrusions';
const CAMPUS_BUILDING_FACADE_BANDS_LAYER_ID = 'mvp1-building-facade-bands';
const CAMPUS_BUILDING_ROOF_CAPS_LAYER_ID = 'mvp1-building-roof-caps';
const CAMPUS_BUILDING_OUTLINE_LAYER_ID = 'mvp1-building-outlines';
const CAMPUS_BUILDING_LABEL_LAYER_ID = 'mvp1-building-labels';
const COM3_EXTRUSION_LAYER_ID = 'prototype-com3-extrusion';
const COM3_HIT_LAYER_ID = 'prototype-com3-hit-target';
const COM3_FLOOR_BANDS_LAYER_ID = 'prototype-com3-floor-bands';
const COM3_ROOF_CAP_LAYER_ID = 'prototype-com3-roof-cap';
const COM3_XRAY_SHELL_LAYER_ID = 'phase4-com3-xray-shell';
const COM3_XRAY_FLOORS_LAYER_ID = 'phase4-com3-xray-floors';
const COM3_XRAY_SELECTED_FLOOR_LAYER_ID = 'phase4-com3-xray-selected-floor';
const COM3_OUTLINE_LAYER_ID = 'prototype-com3-outline';
const COM3_LABEL_LAYER_ID = 'prototype-com3-label';
const CAMPUS_BUS_STOPS_SOURCE_ID = 'mvp1-campus-bus-stops';
const CAMPUS_BUS_STOP_HIT_LAYER_ID = 'mvp1-campus-bus-stop-hit-targets';
const USER_LOCATION_SOURCE_ID = 'user-location';
const CAMPUS_BUS_STOP_CIRCLES_LAYER_ID = 'mvp1-campus-bus-stop-circles';
const CAMPUS_BUS_STOP_LABELS_LAYER_ID = 'mvp1-campus-bus-stop-labels';
const USER_LOCATION_ACCURACY_LAYER_ID = 'user-location-accuracy';
const USER_LOCATION_DOT_LAYER_ID = 'user-location-dot';
const PUBLIC_BUS_REFRESH_MS = 20_000;
const com3Building = JSON.parse(com3BuildingRaw) as GeoJSON.FeatureCollection;
const COM3_FEATURE_ID = 'prototype_com3_osm_relation_15780831';
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
  CAMPUS_BUILDING_FACADE_BANDS_LAYER_ID,
  CAMPUS_BUILDING_ROOF_CAPS_LAYER_ID,
  CAMPUS_BUILDING_OUTLINE_LAYER_ID,
  CAMPUS_BUILDING_LABEL_LAYER_ID,
  COM3_HIT_LAYER_ID,
  COM3_EXTRUSION_LAYER_ID,
  COM3_FLOOR_BANDS_LAYER_ID,
  COM3_ROOF_CAP_LAYER_ID,
  COM3_XRAY_SHELL_LAYER_ID,
  COM3_XRAY_FLOORS_LAYER_ID,
  COM3_XRAY_SELECTED_FLOOR_LAYER_ID,
  COM3_OUTLINE_LAYER_ID,
  COM3_LABEL_LAYER_ID,
];
const BUS_STOP_LAYER_IDS = [
  CAMPUS_BUS_STOP_HIT_LAYER_ID,
  CAMPUS_BUS_STOP_CIRCLES_LAYER_ID,
  CAMPUS_BUS_STOP_LABELS_LAYER_ID,
];

type LngLatPosition = [number, number];
type SelectedPanel = 'overview' | 'building' | 'search' | 'busStop' | 'module';
type SheetState = 'collapsed' | 'half' | 'expanded';
type LayerKey = 'buildings' | 'busStops';
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
const initialSelectedPublicBusArrivalState: PublicBusArrivalUiState = {
  status: 'loading',
  sourceLabel: 'LTA DataMall public bus data',
  arrivalCount: 0,
  cacheHit: false,
  cacheTtlSeconds: 0,
  arrivals: [],
  message: 'Select a linked public bus stop to load LTA arrivals.',
};
const initialNusModsModuleState: NusModsModuleUiState = {
  status: 'idle',
  message: 'Search a module code to inspect lesson venues.',
};
const com3XrayFloorLabels = com3XrayShell.floorSelectorLabels;
const initialCom3XrayFloor = com3XrayFloorLabels[3] ?? com3XrayFloorLabels[0] ?? 'L1';

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

function PublicBusArrivalRows({
  state,
  limit = 4,
}: {
  state: PublicBusArrivalUiState;
  limit?: number;
}) {
  return (
    <div className="publicBusRows" aria-label="Live public bus arrivals from LTA DataMall">
      {state.arrivals.slice(0, limit).map((service) => (
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
  );
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

function createCom3XrayShell(source: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  const baseFeature = source.features[0];

  if (!baseFeature || baseFeature.geometry.type !== 'Polygon') {
    return { type: 'FeatureCollection', features: [] };
  }

  const floorHeight = com3XrayShell.floorHeightMeters;
  const floorFeatures = com3XrayFloorLabels.map((label, index) => {
    const baseHeight = index * floorHeight + 0.36;

    return {
      type: 'Feature' as const,
      id: `com3_xray_floor_${label.toLowerCase()}`,
      properties: {
        name: 'COM3 xray floor plate',
        building_id: 'com3',
        floor_label: label,
        floor_index: index + 1,
        source_id: 'osm-overpass-com3',
        xray_status: com3XrayShell.xrayStatus,
        base_m: baseHeight,
        height_m: baseHeight + 1.05,
      },
      geometry: baseFeature.geometry,
    };
  });

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 'com3_xray_translucent_shell',
        properties: {
          name: 'COM3 xray shell',
          building_id: 'com3',
          source_id: 'osm-overpass-com3',
          xray_status: com3XrayShell.xrayStatus,
          base_m: 0,
          height_m: com3XrayShell.heightMeters,
        },
        geometry: baseFeature.geometry,
      },
      ...floorFeatures,
    ],
  };
}

const com3XrayShellSource = createCom3XrayShell(com3Building);

function createCampusBuildingVisualDetails(source: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  const features = source.features.flatMap((feature) => {
    const properties = feature.properties ?? {};

    if (typeof feature.id !== 'string' || feature.geometry.type !== 'Polygon') {
      return [];
    }

    const heightMeters = typeof properties.height_m === 'number' ? properties.height_m : 0;
    const sourceId = typeof properties.source_id === 'string' ? properties.source_id : 'unknown';

    if (heightMeters < 10) {
      return [];
    }

    const bandCount = Math.min(Math.max(Math.floor(heightMeters / 8), 1), 5);
    const bandFeatures = Array.from({ length: bandCount }, (_, index) => {
      const baseHeight = Math.round(((index + 1) * heightMeters) / (bandCount + 1) * 10) / 10;

      return {
        type: 'Feature' as const,
        id: `${feature.id}_facade_band_${index + 1}`,
        properties: {
          name: 'Campus building facade band',
          source_id: sourceId,
          visual_source_status: 'prototype-placeholder',
          building_id: feature.id,
          base_m: baseHeight,
          height_m: baseHeight + 0.22,
          note: 'Procedural facade band generated from a sourced OSM footprint for visual depth only.',
        },
        geometry: feature.geometry,
      };
    });

    return [
      ...bandFeatures,
      {
        type: 'Feature' as const,
        id: `${feature.id}_roof_cap`,
        properties: {
          name: 'Campus building roof cap',
          source_id: sourceId,
          visual_source_status: 'prototype-placeholder',
          building_id: feature.id,
          base_m: heightMeters,
          height_m: heightMeters + 0.45,
          note: 'Procedural roof cap generated from a sourced OSM footprint for visual depth only.',
        },
        geometry: feature.geometry,
      },
    ];
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

const campusBuildingVisualDetails = createCampusBuildingVisualDetails(campusBuildingFootprints);

function getFirstSymbolLayerId(map: maplibregl.Map) {
  return map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id;
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
      .filter((entity) => entity.type === 'bus_stop')
      .map((entity) => ({
        type: 'Feature' as const,
        id: entity.id,
        properties: {
          entity_id: entity.id,
          name: entity.name,
          source_id: entity.sourceId,
          source_status: entity.sourceStatus,
          routes: entity.nextbus?.routeNames.join(', ') ?? '',
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
const nextbusResearchStopCount = searchIndex.filter((entity) => entity.sourceId === 'nus-nextbus-codelab-api').length;
const campusBuildingFootprintCount = mvp1BuildingFootprints.features.length;

export function CampusMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
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
  });
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [selectedPublicBusArrivalState, setSelectedPublicBusArrivalState] = useState<PublicBusArrivalUiState>(
    initialSelectedPublicBusArrivalState,
  );
  const [moduleQuery, setModuleQuery] = useState('CS1010S');
  const [nusModsModuleState, setNusModsModuleState] = useState<NusModsModuleUiState>(
    initialNusModsModuleState,
  );
  const [selectedCom3XrayFloor, setSelectedCom3XrayFloor] = useState(initialCom3XrayFloor);
  const stageStyle = {
    '--sheet-clearance': sheetState === 'collapsed' ? '96px' : sheetState === 'expanded' ? '78vh' : '44vh',
  } as CSSProperties;
  const selectedPlantedIsbStops = selectedBusStop
    ? getNusIsbPlantedStopsForCampusPlace(selectedBusStop.id)
    : [];
  const selectedNextbusRoutes = selectedBusStop?.nextbus?.routeNames ?? [];
  const selectedPublicBusLink = selectedBusStop ? getNusIsbPublicBusLink(selectedBusStop.id) : null;
  const isCom3XrayActive = selectedPanel === 'building';

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
      : BUS_STOP_LAYER_IDS;

    setVisibleLayers((current) => ({ ...current, [layer]: nextValue }));
    setMapLayerVisibility(layerIds, nextValue);
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

  const selectCom3Building = useCallback(() => {
    const map = mapRef.current;
    const com3Entity = searchIndex.find((entity) => entity.id === 'com3');

    setSelectedSearchEntity(null);
    setSelectedBusStop(null);
    setSearchResults([]);
    setLayerMenuOpen(false);
    setRouteMenuOpen(false);
    updateSheet('building');
    setSelectedBuildingState('com3');

    if (map && com3Entity) {
      map.easeTo({
        center: com3Entity.coordinates,
        zoom: Math.max(map.getZoom(), com3Entity.zoom),
        pitch: com3Entity.pitch,
        bearing: com3Entity.bearing,
        offset: window.innerWidth > 700 ? [-260, 0] : [0, -80],
        duration: 700,
      });
    }
  }, [setSelectedBuildingState, updateSheet]);

  const openSearchEntity = useCallback((entity: SearchEntity) => {
    const map = mapRef.current;

    setSelectedSearchEntity(entity);
    setSelectedBusStop(entity.type === 'bus_stop' ? entity : null);
    updateSheet(entity.id === 'com3' ? 'building' : entity.type === 'bus_stop' ? 'busStop' : 'search');
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
        offset: entity.id === 'com3'
          ? (window.innerWidth > 700 ? [-260, 0] : [0, -80])
          : [0, 0],
        duration: 900,
      });

      setSelectedBuildingState(entity.type === 'building' ? entity.id : null);
    }
  }, [setSelectedBuildingState, updateSheet]);

  useEffect(() => {
    if (!selectedPublicBusLink) {
      setSelectedPublicBusArrivalState(initialSelectedPublicBusArrivalState);
      return undefined;
    }

    let isCurrent = true;

    const loadSelectedPublicBusArrivals = () => {
      setSelectedPublicBusArrivalState({
        ...initialSelectedPublicBusArrivalState,
        busStopCode: selectedPublicBusLink.ltaBusStopCode,
        message: `Checking LTA public bus arrivals for ${selectedPublicBusLink.ltaDescription}.`,
      });
      fetchPublicBusArrivalUiState(selectedPublicBusLink.ltaBusStopCode).then((result) => {
        if (isCurrent) {
          setSelectedPublicBusArrivalState(result);
        }
      });
    };

    loadSelectedPublicBusArrivals();
    const intervalId = window.setInterval(loadSelectedPublicBusArrivals, PUBLIC_BUS_REFRESH_MS);

    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [selectedPublicBusLink]);

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

      map.addSource(COM3_XRAY_SOURCE_ID, {
        type: 'geojson',
        data: com3XrayShellSource,
      });

      map.addSource(CAMPUS_BUILDING_FOOTPRINTS_SOURCE_ID, {
        type: 'geojson',
        data: campusBuildingFootprints,
      });

      map.addSource(CAMPUS_BUILDING_DETAIL_SOURCE_ID, {
        type: 'geojson',
        data: campusBuildingVisualDetails,
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
        id: CAMPUS_BUILDING_FACADE_BANDS_LAYER_ID,
        type: 'fill-extrusion',
        source: CAMPUS_BUILDING_DETAIL_SOURCE_ID,
        filter: ['==', ['get', 'name'], 'Campus building facade band'],
        minzoom: 15.4,
        paint: {
          'fill-extrusion-color': '#ede9df',
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 15.4, 0.38, 17, 0.7],
          'fill-extrusion-vertical-gradient': false,
        },
      }, firstSymbolLayerId);

      map.addLayer({
        id: CAMPUS_BUILDING_ROOF_CAPS_LAYER_ID,
        type: 'fill-extrusion',
        source: CAMPUS_BUILDING_DETAIL_SOURCE_ID,
        filter: ['==', ['get', 'name'], 'Campus building roof cap'],
        minzoom: 15,
        paint: {
          'fill-extrusion-color': [
            'match',
            ['get', 'building_id'],
            ['central-library-building', 'university-cultural-centre', 'create-tower', 'education-resource-centre'],
            '#d0c9bd',
            '#bbb9b1',
          ],
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0.48, 17, 0.76],
          'fill-extrusion-vertical-gradient': false,
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
        id: COM3_HIT_LAYER_ID,
        type: 'fill',
        source: COM3_SOURCE_ID,
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.01,
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
            '#91bccc',
            '#777f82',
          ],
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            0.24,
            0.86,
          ],
          'fill-extrusion-vertical-gradient': true,
        },
      });

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
      });

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
      });

      map.addLayer({
        id: COM3_XRAY_SHELL_LAYER_ID,
        type: 'fill-extrusion',
        source: COM3_XRAY_SOURCE_ID,
        filter: ['==', ['get', 'name'], 'COM3 xray shell'],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': '#7bb7c9',
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': 0.28,
          'fill-extrusion-vertical-gradient': false,
        },
      });

      map.addLayer({
        id: COM3_XRAY_FLOORS_LAYER_ID,
        type: 'fill-extrusion',
        source: COM3_XRAY_SOURCE_ID,
        filter: ['==', ['get', 'name'], 'COM3 xray floor plate'],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': '#d9f0f4',
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': 0.54,
          'fill-extrusion-vertical-gradient': false,
        },
      });

      map.addLayer({
        id: COM3_XRAY_SELECTED_FLOOR_LAYER_ID,
        type: 'fill-extrusion',
        source: COM3_XRAY_SOURCE_ID,
        filter: [
          'all',
          ['==', ['get', 'name'], 'COM3 xray floor plate'],
          ['==', ['get', 'floor_label'], initialCom3XrayFloor],
        ],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': '#f0a21a',
          'fill-extrusion-height': ['get', 'height_m'],
          'fill-extrusion-base': ['get', 'base_m'],
          'fill-extrusion-opacity': 0.96,
          'fill-extrusion-vertical-gradient': false,
        },
      });

      map.addLayer({
        id: COM3_OUTLINE_LAYER_ID,
        type: 'line',
        source: COM3_SOURCE_ID,
        paint: {
          'line-color': '#385863',
          'line-width': ['interpolate', ['linear'], ['zoom'], 15, 1.2, 18, 2],
          'line-opacity': 0.82,
        },
      });

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
        id: CAMPUS_BUS_STOP_HIT_LAYER_ID,
        type: 'circle',
        source: CAMPUS_BUS_STOPS_SOURCE_ID,
        minzoom: 14.3,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 22, 18, 30],
          'circle-color': '#ffffff',
          'circle-opacity': 0.01,
        },
      });

      map.addLayer({
        id: CAMPUS_BUS_STOP_CIRCLES_LAYER_ID,
        type: 'circle',
        source: CAMPUS_BUS_STOPS_SOURCE_ID,
        minzoom: 14.3,
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'source_id'], 'nus-nextbus-codelab-api'],
            '#f8fbff',
            '#ffffff',
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 3, 18, 6],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'source_id'], 'nus-nextbus-codelab-api'],
            '#596f89',
            '#2f80ed',
          ],
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

      [COM3_HIT_LAYER_ID, COM3_EXTRUSION_LAYER_ID].forEach((layerId) => {
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });

        map.on('click', layerId, (event) => {
          selectCom3Building();
          event.preventDefault();
        });
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

      const selectNearestBusStopFeature = (
        features: maplibregl.MapGeoJSONFeature[] | undefined,
        point: maplibregl.Point,
      ) => {
        const stopEntities = (features ?? [])
          .map((feature) => feature.properties?.entity_id as string | undefined)
          .filter((stopId, index, stopIds): stopId is string => (
            typeof stopId === 'string' && stopIds.indexOf(stopId) === index
          ))
          .map((stopId) => searchIndex.find((entity) => entity.id === stopId && entity.type === 'bus_stop'))
          .filter((entity): entity is SearchEntity => Boolean(entity));

        if (stopEntities.length === 0) {
          return false;
        }

        const nearestStop = stopEntities
          .map((entity) => {
            const projectedPoint = map.project(entity.coordinates);

            return {
              entity,
              distance: Math.hypot(projectedPoint.x - point.x, projectedPoint.y - point.y),
            };
          })
          .sort((left, right) => left.distance - right.distance)[0]?.entity;

        if (!nearestStop) {
          return false;
        }

        selectBusStop(nearestStop);
        return true;
      };

      const selectNearestBusStopByPoint = (point: maplibregl.Point) => {
        const nearestStop = searchIndex
          .filter((entity) => entity.type === 'bus_stop')
          .map((entity) => {
            const projectedPoint = map.project(entity.coordinates);

            return {
              entity,
              distance: Math.hypot(projectedPoint.x - point.x, projectedPoint.y - point.y),
            };
          })
          .sort((left, right) => left.distance - right.distance)[0];

        if (!nearestStop || nearestStop.distance > 34) {
          return false;
        }

        selectBusStop(nearestStop.entity);
        return true;
      };

      const handleBusStopClick = (event: maplibregl.MapLayerMouseEvent) => {
        if (selectNearestBusStopFeature(event.features, event.point)) {
          event.preventDefault();
        }
      };

      BUS_STOP_LAYER_IDS.forEach((layerId) => {
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('click', layerId, handleBusStopClick);
      });

      map.on('click', (event) => {
        const selectedFeatures = map.queryRenderedFeatures(event.point, {
          layers: [
            ...BUS_STOP_LAYER_IDS,
            COM3_HIT_LAYER_ID,
            COM3_EXTRUSION_LAYER_ID,
            CAMPUS_BUILDING_EXTRUSION_LAYER_ID,
          ].filter((layerId) => map.getLayer(layerId)),
        });

        const directBusStopFeatures = selectedFeatures.filter((feature) => (
          typeof feature.layer?.id === 'string' && BUS_STOP_LAYER_IDS.includes(feature.layer.id)
        ));

        if (selectNearestBusStopFeature(directBusStopFeatures, event.point)) {
          return;
        }

        if (selectedFeatures.some((feature) => (
          feature.layer?.id === COM3_HIT_LAYER_ID || feature.layer?.id === COM3_EXTRUSION_LAYER_ID
        ))) {
          selectCom3Building();
          return;
        }

        const campusBuildingFeature = selectedFeatures.find((feature) => feature.layer?.id === CAMPUS_BUILDING_EXTRUSION_LAYER_ID);
        const campusBuildingId = campusBuildingFeature?.id as string | undefined;
        const campusBuildingEntity = campusBuildingId
          ? searchIndex.find((entity) => entity.id === campusBuildingId && entity.type === 'building')
          : null;

        if (campusBuildingEntity) {
          openSearchEntity(campusBuildingEntity);
          return;
        }

        const busStopHitFeatures = map.queryRenderedFeatures([
          [event.point.x - 28, event.point.y - 28],
          [event.point.x + 28, event.point.y + 28],
        ], {
          layers: BUS_STOP_LAYER_IDS,
        });

        if (selectNearestBusStopFeature(busStopHitFeatures, event.point)) {
          return;
        }

        if (selectNearestBusStopByPoint(event.point)) {
          return;
        }

        if (selectedFeatures.length === 0) {
          clearSelection();
        }
      });

      setMapState('ready');
    });
    map.once('error', () => setMapState('error'));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [clearSelection, openSearchEntity, selectBusStop, selectCom3Building, setSelectedBuildingState, updateSheet]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const visibility = isCom3XrayActive ? 'visible' : 'none';

    [COM3_XRAY_SHELL_LAYER_ID, COM3_XRAY_FLOORS_LAYER_ID, COM3_XRAY_SELECTED_FLOOR_LAYER_ID].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });

    [COM3_FLOOR_BANDS_LAYER_ID, COM3_ROOF_CAP_LAYER_ID].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', isCom3XrayActive ? 'none' : 'visible');
      }
    });

    if (map.getLayer(COM3_XRAY_SELECTED_FLOOR_LAYER_ID)) {
      map.setFilter(COM3_XRAY_SELECTED_FLOOR_LAYER_ID, [
        'all',
        ['==', ['get', 'name'], 'COM3 xray floor plate'],
        ['==', ['get', 'floor_label'], selectedCom3XrayFloor],
      ]);
    }
  }, [isCom3XrayActive, selectedCom3XrayFloor, mapState]);

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
          data-active={routeMenuOpen}
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
            <p>Official data needed</p>
            <button className="floatingMenuClose" type="button" aria-label="Close shuttle routes" title="Close shuttle routes" onClick={() => setRouteMenuOpen(false)}>
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
          <div className="routeChoice routeChoiceUnavailable" role="note">
            <span className="choiceText">
              <strong>NUS shuttle routes unavailable</strong>
              <small>Needs permitted route geometry and verified stop positions before display</small>
            </span>
            <span className="choiceMeta">Blocked</span>
          </div>
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
              <small>OSM extrusions with procedural depth</small>
            </span>
            <span className="layerState">{visibleLayers.buildings ? 'On' : 'Off'}</span>
          </button>
          <button className="layerChoice" type="button" onClick={() => toggleLayer('busStops')}>
            <span className="choiceText">
              <strong>NUS ISB stops</strong>
              <small>33 NextBus research stops</small>
            </span>
            <span className="layerState">{visibleLayers.busStops ? 'On' : 'Off'}</span>
          </button>
          <div className="layerChoice layerChoiceUnavailable" role="note">
            <span className="choiceText">
              <strong>Terrain</strong>
              <small>Needs elevation source, license, alignment, and mobile performance check</small>
            </span>
            <span className="layerState">Blocked</span>
          </div>
        </div>
      ) : null}
      <div className="statusPanel" data-state={mapState} data-sheet={sheetState} data-panel={selectedPanel}>
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
                  <dd>Shell-only xray</dd>
                </div>
                <div>
                  <dt>Xray</dt>
                  <dd>{com3XrayShell.xrayStatus}</dd>
                </div>
              </dl>
              <div className="floorSelector" aria-label="COM3 shell-only floor selector">
                <div>
                  <strong>Floor selector</strong>
                  <span>Generic labels from OSM level count</span>
                </div>
                <div className="floorSelectorButtons">
                  {com3XrayFloorLabels.map((floorLabel) => (
                    <button
                      key={floorLabel}
                      className="floorSelectorButton"
                      type="button"
                      data-active={selectedCom3XrayFloor === floorLabel}
                      aria-pressed={selectedCom3XrayFloor === floorLabel}
                      onClick={() => setSelectedCom3XrayFloor(floorLabel)}
                    >
                      {floorLabel}
                    </button>
                  ))}
                </div>
              </div>
              <p className="truthNote">
                {com3XrayShell.detail} No rooms, corridors, entrances, or indoor POIs are shown.
              </p>
              <div className="transitStatusCard" aria-label="COM3 xray source status">
                <div>
                  <strong>Source confidence</strong>
                  <span>Footprint and level count from OSM; floor labels are generic.</span>
                </div>
              </div>
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
                    <dd>{landmarkBuildingNames.includes(selectedBuildingVisual.name) ? 'Procedural bands, landmark tint' : 'Procedural bands'}</dd>
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
              <p className="busStopTrustLine">
                {selectedBusStop.sourceStatus === 'requires-permission' ? 'Permission required' : selectedBusStop.sourceStatus}
                {selectedNextbusRoutes.length > 0 ? ` · NUS ${selectedNextbusRoutes.join(', ')}` : ''}
                {selectedPlantedIsbStops.length > 0
                  ? ` · D1 ${selectedPlantedIsbStops.map((stop) => `${stop.sequence}. ${stop.officialName}`).join(', ')}`
                  : ''}
              </p>
              <div className="busServicesCard" aria-label="Combined bus services for selected stop">
                <div className="busServicesHeader">
                  <div>
                    <strong>Bus services</strong>
                    <span>Internal shuttle routes plus linked public arrivals</span>
                  </div>
                  <span className="transitStatusPill">{selectedNextbusRoutes.length + selectedPublicBusArrivalState.arrivalCount} routes</span>
                </div>
                {selectedNextbusRoutes.length > 0 ? (
                  <div className="busServiceSection" aria-label="NUS ISB research route rows">
                    <div className="busServiceSectionHeader">
                      <strong>NUS internal shuttle</strong>
                      <span>Snapshot route membership · no live ETA</span>
                    </div>
                    <div className="internalRoutePills">
                      {selectedNextbusRoutes.map((routeName) => (
                        <div className="internalRoutePill" key={routeName}>
                          <span className="etaRoute">{routeName}</span>
                          <span className="etaTime">--</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="busServiceSection" aria-label="Linked LTA public bus arrivals">
                  <div className="busServiceSectionHeader">
                    <strong>{selectedPublicBusLink ? 'LTA public buses' : 'No linked LTA public stop'}</strong>
                    <span>
                      {selectedPublicBusLink
                        ? `${selectedPublicBusLink.ltaDescription} · Stop ${selectedPublicBusLink.ltaBusStopCode} · ${selectedPublicBusLink.distanceMeters} m ${selectedPublicBusLink.matchStatus === 'coordinate-match' ? 'match' : 'nearby'}`
                        : 'No official LTA stop-code match is documented within the current threshold.'}
                    </span>
                  </div>
                  {selectedPublicBusLink ? (
                    selectedPublicBusArrivalState.status === 'ok' ? (
                      <>
                        <PublicBusArrivalRows state={selectedPublicBusArrivalState} limit={2} />
                        <p>
                          Live public bus arrivals from {selectedPublicBusArrivalState.sourceLabel}. Last fetched {formatFetchedAt(selectedPublicBusArrivalState.fetchedAt)}.
                        </p>
                      </>
                    ) : (
                      <p>{selectedPublicBusArrivalState.message}</p>
                    )
                  ) : (
                    <p>
                      Public bus timing is not shown because no documented LTA stop-code link exists for this NUS ISB research stop.
                    </p>
                  )}
                </div>
                <p className="busServicesFootnote">
                  NUS shuttle ETAs are not live. Public timings use documented LTA stop-code links.
                </p>
              </div>
              <details className="sourceDisclosure">
                <summary>Data status</summary>
                <p>
                  {selectedBusStop.sourceId === 'nus-nextbus-codelab-api' ? (
                    'NextBus research snapshot. Stop names, coordinates, and route membership remain permission-required planning data, not live or verified current shuttle operations.'
                  ) : selectedPlantedIsbStops.length > 0 ? (
                    `${selectedBusStop.detail} D1 stop label and order are manually referenced from the NUS UCI route-map image; this does not verify the marker as an exact boarding point or enable route geometry.`
                  ) : selectedBusStop.detail}
                </p>
              </details>
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
                      {venue.mapping.nearestBusStop ? `Nearest NUS ISB research stop: ${venue.mapping.nearestBusStop.name}` : venue.mapping.note}
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
              OSM building footprints now have selected highlights and procedural visual depth. Shuttle routes stay unavailable until route geometry and stop positions are verified.
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
                <dd>{nextbusResearchStopCount} NUS ISB research stops</dd>
              </div>
              <div>
                <dt>Markers</dt>
                <dd>{campusBusStopCount} bus stop markers</dd>
              </div>
              <div>
                <dt>Shuttles</dt>
                <dd>Source required</dd>
              </div>
              <div>
                <dt>Arrivals</dt>
                <dd>Select a bus stop</dd>
              </div>
            </dl>
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
