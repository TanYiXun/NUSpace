import { searchIndex, type SearchEntity } from '../map/searchIndex';

export type VenueMappingConfidence = 'high' | 'medium' | 'low' | 'unknown';

export type VenueMapping = {
  venue: string;
  normalizedVenue: string;
  buildingCode: string | null;
  confidence: VenueMappingConfidence;
  place: SearchEntity | null;
  nearestBusStop: SearchEntity | null;
  source: string;
  note: string;
};

const venueAliases: Record<string, string> = {
  BIZ1: 'biz1-mochtar-riady',
  BIZ2: 'biz2-building',
  CLB: 'central-library-building',
  'CENTRALLIBRARY': 'central-library-building',
  COM1: 'com1',
  COM2: 'com2',
  COM3: 'com3',
  COM4: 'com4',
  COMPUTING3: 'com3',
  CREATE: 'create-tower',
  ERC: 'education-resource-centre',
  S17: 's17',
  UCC: 'university-cultural-centre',
  UTOWN: 'nextbus-utown',
  VENTUS: 'ventus-building',
};

function compact(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function getBuildingCode(venue: string) {
  const normalized = compact(venue);
  const directMatch = Object.keys(venueAliases).find((alias) => normalized === alias);

  if (directMatch) {
    return directMatch;
  }

  return Object.keys(venueAliases)
    .sort((left, right) => right.length - left.length)
    .find((alias) => normalized.startsWith(alias)) ?? null;
}

function getDistanceMeters(left: SearchEntity, right: SearchEntity) {
  const [leftLng, leftLat] = left.coordinates as [number, number];
  const [rightLng, rightLat] = right.coordinates as [number, number];
  const lngDistance = (rightLng - leftLng) * 111_320;
  const latDistance = (rightLat - leftLat) * 110_540;

  return Math.hypot(lngDistance, latDistance);
}

function getNearestBusStop(place: SearchEntity | null) {
  if (!place) {
    return null;
  }

  return searchIndex
    .filter((entity) => entity.type === 'bus_stop')
    .map((entity) => ({ entity, distance: getDistanceMeters(place, entity) }))
    .sort((left, right) => left.distance - right.distance)[0]?.entity ?? null;
}

export function mapVenueToPlace(venue: string): VenueMapping {
  const normalizedVenue = venue.trim().replace(/\s+/g, ' ');
  const buildingCode = getBuildingCode(normalizedVenue);
  const place = buildingCode ? searchIndex.find((entity) => entity.id === venueAliases[buildingCode]) ?? null : null;
  const isExactBuildingPattern = buildingCode !== null && compact(normalizedVenue) === buildingCode;

  if (!buildingCode || !place) {
    return {
      venue,
      normalizedVenue,
      buildingCode: null,
      confidence: 'unknown',
      place: null,
      nearestBusStop: null,
      source: 'NUSMods venue code',
      note: 'No verified campus place mapping is available for this venue code.',
    };
  }

  return {
    venue,
    normalizedVenue,
    buildingCode,
    confidence: isExactBuildingPattern ? 'high' : 'medium',
    place,
    nearestBusStop: getNearestBusStop(place),
    source: 'NUSMods venue code matched against curated campus place aliases',
    note: isExactBuildingPattern
      ? 'Venue code maps directly to a curated campus place.'
      : 'Venue prefix maps to a curated campus place; room-level location remains unknown.',
  };
}
