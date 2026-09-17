import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { BASE_MAP_STYLE_URL, INITIAL_CAMERA } from './mapConfig';

export function CampusMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading');

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

    map.once('load', () => setMapState('ready'));
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
        <p className="eyebrow">Phase 0 Prototype A</p>
        <h1>NUSpace</h1>
        <p>
          {mapState === 'error'
            ? 'Basemap failed to load.'
            : 'Base map centered on Kent Ridge. No campus data has been added yet.'}
        </p>
      </div>
    </section>
  );
}
