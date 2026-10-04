import type { LngLatLike } from 'maplibre-gl';
import campusPlaces from '../../data/curated/mvp1-campus-places.json';
import nusIsbBusStops from '../../data/curated/phase2-nus-isb-bus-stops.json';

export type SearchEntityType = 'building' | 'bus_stop' | 'food' | 'facility' | 'route';
export type SourceStatus = 'verified' | 'prototype-placeholder' | 'manual-reference' | 'requires-permission';

export type NextbusMetadata = {
  name: string;
  caption: string;
  longName: string;
  shortName: string;
  routeNames: string[];
};

export type SearchEntity = {
  id: string;
  name: string;
  aliases: string[];
  type: SearchEntityType;
  coordinates: LngLatLike;
  zoom: number;
  pitch: number;
  bearing: number;
  subtitle: string;
  sourceStatus: SourceStatus;
  sourceId: string;
  sourceLabel: string;
  detail: string;
  nextbus?: NextbusMetadata;
};

type RawCampusPlace = {
  id: string;
  name: string;
  aliases: string[];
  type: SearchEntityType;
  coordinates: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  subtitle: string;
  sourceStatus: SourceStatus;
  sourceId: string;
  sourceLabel: string;
  detail: string;
  nextbus?: NextbusMetadata;
};

export const searchIndex: SearchEntity[] = [
  ...([
    ...(campusPlaces.places as unknown as RawCampusPlace[]).filter((place) => place.type !== 'bus_stop'),
    ...(nusIsbBusStops.stops as unknown as RawCampusPlace[]),
  ]).map((place) => ({
    ...place,
    coordinates: place.coordinates as LngLatLike,
  })),
];

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreEntity(entity: SearchEntity, normalizedQuery: string) {
  const terms = [entity.name, ...entity.aliases].map(normalizeSearchTerm);

  if (terms.some((term) => term === normalizedQuery)) {
    return 100;
  }

  if (terms.some((term) => term.startsWith(normalizedQuery))) {
    return 75;
  }

  if (terms.some((term) => term.includes(normalizedQuery))) {
    return 50;
  }

  const queryParts = normalizedQuery.split(' ');
  const hasEveryPart = queryParts.every((part) => (
    terms.some((term) => term.includes(part))
  ));

  return hasEveryPart ? 25 : 0;
}

function sourcePriority(status: SourceStatus) {
  if (status === 'verified') {
    return 4;
  }

  if (status === 'manual-reference') {
    return 3;
  }

  if (status === 'requires-permission') {
    return 2;
  }

  return 1;
}

export function searchEntities(query: string) {
  const normalizedQuery = normalizeSearchTerm(query);

  if (normalizedQuery.length === 0) {
    return [];
  }

  return searchIndex
    .map((entity) => ({ entity, score: scoreEntity(entity, normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const rightSourcePriority = sourcePriority(right.entity.sourceStatus);
      const leftSourcePriority = sourcePriority(left.entity.sourceStatus);

      if (rightSourcePriority !== leftSourcePriority) {
        return rightSourcePriority - leftSourcePriority;
      }

      return left.entity.name.localeCompare(right.entity.name);
    })
    .slice(0, 6)
    .map((result) => result.entity);
}
