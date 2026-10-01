export type NusIsbStaticRoute = {
  code: string;
  name: string;
  destination: string;
  color: string;
  sourceIds: string[];
  geometryStatus: 'source_pending';
  liveStatus: 'live_unavailable';
  frequencyNote: string;
  stopSequence: string[];
  detail: string;
};

export const d1StaticRoute: NusIsbStaticRoute = {
  code: 'D1',
  name: 'D1 prototype route',
  destination: 'COM3 toward UTown and CLB',
  color: '#7f42bd',
  sourceIds: ['nus-uci-internal-shuttle-bus', 'nus-campus-map-shuttle-routes', 'manual-osm-d1-prototype-route'],
  geometryStatus: 'source_pending',
  liveStatus: 'live_unavailable',
  frequencyNote: 'No live or scheduled arrivals',
  stopSequence: ['COM3', 'Opp HSSML', 'Opp NUSS', 'Ventus', 'UTown', 'CLB'],
  detail: 'Prototype route mode uses a manually curated D1 display corridor while official source-confirmed geometry and stop positions are still pending.',
};

export const nusIsbStaticRoutes = [d1StaticRoute];

export function getNusIsbStaticRoute(code: string) {
  return nusIsbStaticRoutes.find((route) => route.code === code);
}
