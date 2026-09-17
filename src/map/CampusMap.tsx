import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import com3BuildingRaw from '../../data/prototype/com3-building.geojson?raw';
import d1RouteRaw from '../../data/prototype/d1-route.geojson?raw';
import d1StopsRaw from '../../data/prototype/d1-stops.geojson?raw';
import { BASE_MAP_STYLE_URL, INITIAL_CAMERA } from './mapConfig';
import { searchEntities, type SearchEntity } from './searchIndex';

const COM3_SOURCE_ID = 'prototype-com3-building';
const COM3_DETAIL_SOURCE_ID = 'prototype-com3-visual-detail';
const COM3_EXTRUSION_LAYER_ID = 'prototype-com3-extrusion';
const COM3_FLOOR_BANDS_LAYER_ID = 'prototype-com3-floor-bands';
const COM3_ROOF_CAP_LAYER_ID = 'prototype-com3-roof-cap';
const COM3_OUTLINE_LAYER_ID = 'prototype-com3-outline';
const COM3_LABEL_LAYER_ID = 'prototype-com3-label';
const D1_ROUTE_SOURCE_ID = 'prototype-d1-route';
const D1_STOPS_SOURCE_ID = 'prototype-d1-stops';
const D1_BUS_SOURCE_ID = 'prototype-d1-simulated-bus';
const D1_ROUTE_CASING_LAYER_ID = 'prototype-d1-route-casing';
const D1_ROUTE_LAYER_ID = 'prototype-d1-route-line';
const D1_ROUTE_ARROWS_LAYER_ID = 'prototype-d1-route-arrows';
const D1_STOP_CIRCLES_LAYER_ID = 'prototype-d1-stop-circles';
const D1_STOP_LABELS_LAYER_ID = 'prototype-d1-stop-labels';
const D1_BUS_CIRCLE_LAYER_ID = 'prototype-d1-bus-circle';
const D1_BUS_LABEL_LAYER_ID = 'prototype-d1-bus-label';
const com3Building = JSON.parse(com3BuildingRaw) as GeoJSON.FeatureCollection;
const d1Route = JSON.parse(d1RouteRaw) as GeoJSON.FeatureCollection;
const d1Stops = JSON.parse(d1StopsRaw) as GeoJSON.FeatureCollection;
const COM3_FEATURE_ID = 'prototype_com3_osm_relation_15780831';
const D1_ANIMATION_DURATION_MS = 26000;

type LngLatPosition = [number, number];

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

export function CampusMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedPanel, setSelectedPanel] = useState<'route' | 'building' | 'search'>('route');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchEntity[]>([]);
  const [selectedSearchEntity, setSelectedSearchEntity] = useState<SearchEntity | null>(null);

  const openSearchEntity = (entity: SearchEntity) => {
    const map = mapRef.current;

    setSelectedSearchEntity(entity);
    setSelectedPanel(entity.id === 'com3' ? 'building' : 'search');
    setSearchQuery(entity.name);
    setSearchResults([]);

    if (map) {
      map.easeTo({
        center: entity.coordinates,
        zoom: entity.zoom,
        pitch: entity.pitch,
        bearing: entity.bearing,
        duration: 900,
      });

      map.setFeatureState(
        { source: COM3_SOURCE_ID, id: COM3_FEATURE_ID },
        { selected: entity.id === 'com3' },
      );
    }
  };

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

      const firstSymbolLayerId = getFirstSymbolLayerId(map);

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

      map.on('mouseenter', COM3_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', COM3_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', COM3_EXTRUSION_LAYER_ID, () => {
        setSelectedPanel('building');
        map.setFeatureState(
          { source: COM3_SOURCE_ID, id: COM3_FEATURE_ID },
          { selected: true },
        );
      });

      [D1_ROUTE_LAYER_ID, D1_STOP_CIRCLES_LAYER_ID, D1_BUS_CIRCLE_LAYER_ID].forEach((layerId) => {
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('click', layerId, () => {
          setSelectedSearchEntity(null);
          setSelectedPanel('route');
          map.setFeatureState(
            { source: COM3_SOURCE_ID, id: COM3_FEATURE_ID },
            { selected: false },
          );
        });
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
  }, []);

  return (
    <section className="mapStage" aria-label="Interactive map centered on NUS Kent Ridge">
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
      <div className="statusPanel" data-state={mapState}>
        {selectedPanel === 'building' ? (
          <>
            <p className="eyebrow">Phase 0 Prototype B</p>
            <h1>COM3</h1>
            <p>Computing 3, 11 Research Link</p>
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
          </>
        ) : selectedPanel === 'search' && selectedSearchEntity ? (
          <>
            <p className="eyebrow">Phase 0 Prototype D</p>
            <h1>{selectedSearchEntity.name}</h1>
            <p>{selectedSearchEntity.subtitle}</p>
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
            </dl>
            <p className="truthNote">
              {selectedSearchEntity.detail}
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Phase 0 Prototype C</p>
            <div className="routeTitleRow">
              <span className="routeBadge">D1</span>
              <h1>NUSpace</h1>
            </div>
            <p>
              {mapState === 'error'
                ? 'Basemap failed to load.'
                : 'Simulated shuttle corridor from COM3 toward UTown. Not live NUS bus data.'}
            </p>
            <dl className="routeFacts">
              <div>
                <dt>Route</dt>
                <dd>Manually curated prototype</dd>
              </div>
              <div>
                <dt>Vehicle</dt>
                <dd>Animated simulation</dd>
              </div>
            </dl>
            <ol className="routeStops" aria-label="Prototype D1 stop sequence">
              <li>COM3</li>
              <li>Opp HSSML</li>
              <li>Opp NUSS</li>
              <li>Ventus</li>
              <li>UTown</li>
              <li>CLB</li>
            </ol>
            <p className="truthNote">
              Prototype corridor only. No official route geometry, real-time arrivals, or live vehicle positions.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
