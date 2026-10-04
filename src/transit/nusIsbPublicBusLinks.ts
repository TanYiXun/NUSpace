import nusIsbPublicBusLinksRaw from '../../data/curated/phase2-nus-isb-public-bus-links.json';

export type NusIsbPublicBusLink = {
  nextbusStopId: string;
  ltaBusStopCode: string;
  ltaDescription: string;
  roadName: string;
  distanceMeters: number;
  matchStatus: 'coordinate-match' | 'nearby-public-stop';
};

const links = nusIsbPublicBusLinksRaw.links as NusIsbPublicBusLink[];

export function getNusIsbPublicBusLink(nextbusStopId: string) {
  return links.find((link) => link.nextbusStopId === nextbusStopId) ?? null;
}

export function getNusIsbPublicBusLinkCount() {
  return links.length;
}
