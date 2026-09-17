import type { LngLatLike } from 'maplibre-gl';
import campusPlaces from '../../data/curated/mvp1-campus-places.json';

export type SearchEntityType = 'building' | 'bus_stop' | 'food' | 'facility' | 'route';
export type SourceStatus = 'verified' | 'prototype-placeholder' | 'manual-reference';

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
};

const routePrototypeEntity: SearchEntity = {
  id: 'd1-route',
  name: 'D1 simulated corridor',
  aliases: ['d1', 'd1 route', 'shuttle to utown', 'bus to utown'],
  type: 'route',
  coordinates: [103.7736, 1.2987],
  zoom: 16.15,
  pitch: 58,
  bearing: -24,
  subtitle: 'Simulated shuttle corridor',
  sourceStatus: 'prototype-placeholder',
  sourceId: 'manual-osm-d1-prototype-route',
  sourceLabel: 'Manual Prototype C corridor',
  detail: 'Animation and overlay prototype only. No live arrivals or official route geometry.',
};

export const searchIndex: SearchEntity[] = [
  ...(campusPlaces.places as unknown as RawCampusPlace[]).map((place) => ({
    ...place,
    coordinates: place.coordinates as LngLatLike,
  })),
  routePrototypeEntity,
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

      return left.entity.name.localeCompare(right.entity.name);
    })
    .slice(0, 6)
    .map((result) => result.entity);
}
