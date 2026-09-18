import publicBusStopsRaw from '../../data/curated/phase2-public-bus-stops.json';

export type PublicBusStopReference = {
  id: string;
  name: string;
  busStopCode: string;
  roadName: string;
  sourceStatus: 'manual-reference' | 'verified';
  sourceId: string;
  sourceLabel: string;
  detail: string;
};

export const publicBusStops = publicBusStopsRaw.stops as PublicBusStopReference[];
export const defaultPublicBusStop = publicBusStops[0];
