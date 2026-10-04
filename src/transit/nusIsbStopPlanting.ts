import isbStopPlantingRaw from '../../data/curated/phase2-nus-isb-stop-planting.json';

export type NusIsbPlantedStop = {
  routeCode: string;
  sequence: number;
  officialName: string;
  campusPlaceId: string;
  positionStatus: 'requires-permission';
  positionNote: string;
  routeSourceLabel: string;
  routeDetail: string;
};

type RawPlantedStop = {
  sequence: number;
  officialName: string;
  campusPlaceId: string;
  positionStatus: 'requires-permission';
  positionNote: string;
};

type RawPlantingRoute = {
  routeCode: string;
  sourceLabel: string;
  detail: string;
  plantedStops: RawPlantedStop[];
};

const plantedStops = (isbStopPlantingRaw.routes as RawPlantingRoute[]).flatMap((route) => (
  route.plantedStops.map((stop) => ({
    routeCode: route.routeCode,
    sequence: stop.sequence,
    officialName: stop.officialName,
    campusPlaceId: stop.campusPlaceId,
    positionStatus: stop.positionStatus,
    positionNote: stop.positionNote,
    routeSourceLabel: route.sourceLabel,
    routeDetail: route.detail,
  }))
));

export function getNusIsbPlantedStopsForCampusPlace(campusPlaceId: string): NusIsbPlantedStop[] {
  return plantedStops
    .filter((stop) => stop.campusPlaceId === campusPlaceId)
    .sort((left, right) => left.routeCode.localeCompare(right.routeCode) || left.sequence - right.sequence);
}

export function getNusIsbPlantedStopCount() {
  return plantedStops.length;
}
