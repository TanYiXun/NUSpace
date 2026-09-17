import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import com3BuildingRaw from '../../data/prototype/com3-building.geojson?raw';
import { BASE_MAP_STYLE_URL, INITIAL_CAMERA } from './mapConfig';

const COM3_SOURCE_ID = 'prototype-com3-building';
const COM3_DETAIL_SOURCE_ID = 'prototype-com3-visual-detail';
const COM3_EXTRUSION_LAYER_ID = 'prototype-com3-extrusion';
const COM3_FLOOR_BANDS_LAYER_ID = 'prototype-com3-floor-bands';
const COM3_ROOF_CAP_LAYER_ID = 'prototype-com3-roof-cap';
const COM3_OUTLINE_LAYER_ID = 'prototype-com3-outline';
const COM3_LABEL_LAYER_ID = 'prototype-com3-label';
const com3Building = JSON.parse(com3BuildingRaw) as GeoJSON.FeatureCollection;
const COM3_FEATURE_ID = 'prototype_com3_osm_relation_15780831';

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

export function CampusMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isBuildingSelected, setIsBuildingSelected] = useState(false);

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

      map.on('mouseenter', COM3_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', COM3_EXTRUSION_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', COM3_EXTRUSION_LAYER_ID, () => {
        setIsBuildingSelected(true);
        map.setFeatureState(
          { source: COM3_SOURCE_ID, id: COM3_FEATURE_ID },
          { selected: true },
        );
      });

      setMapState('ready');
    });
    map.once('error', () => setMapState('error'));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <section className="mapStage" aria-label="Interactive map centered on NUS Kent Ridge">
      <div ref={mapContainerRef} className="mapCanvas" />
      <div className="topSearchShell" aria-hidden="true">
        <div className="searchPill">Search NUS</div>
      </div>
      <div className="statusPanel" data-state={mapState}>
        {isBuildingSelected ? (
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
        ) : (
          <>
            <p className="eyebrow">Phase 0 Prototype B</p>
            <h1>NUSpace</h1>
            <p>
              {mapState === 'error'
                ? 'Basemap failed to load.'
                : 'COM3 is rendered as the first sourced prototype building. Select it for provenance.'}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
