import type { LngLatLike } from 'maplibre-gl';

export type SearchEntityType = 'building' | 'bus_stop' | 'food' | 'route';
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
  sourceLabel: string;
  detail: string;
};

export const searchIndex: SearchEntity[] = [
  {
    id: 'com3',
    name: 'COM3',
    aliases: ['com 3', 'computing 3', 'school of computing 3', '11 research link'],
    type: 'building',
    coordinates: [103.77462, 1.29461],
    zoom: 17.2,
    pitch: 58,
    bearing: -24,
    subtitle: 'Computing 3, 11 Research Link',
    sourceStatus: 'verified',
    sourceLabel: 'OSM relation 15780831',
    detail: 'Sourced building footprint. Height and facade bands remain prototype visual estimates.',
  },
  {
    id: 'd1-com3',
    name: 'COM3 bus stop',
    aliases: ['d1 com3', 'computing 3 bus stop', 'com 3 bus stop'],
    type: 'bus_stop',
    coordinates: [103.77345, 1.29412],
    zoom: 17.4,
    pitch: 58,
    bearing: -24,
    subtitle: 'Prototype D1 corridor stop',
    sourceStatus: 'prototype-placeholder',
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Prototype stop coordinate only. Not official NUS shuttle stop geometry.',
  },
  {
    id: 'opp-hssml',
    name: 'Opp HSSML',
    aliases: ['hssml', 'opposite hssml', 'hon sui sen memorial library stop'],
    type: 'bus_stop',
    coordinates: [103.77086, 1.29434],
    zoom: 17.2,
    pitch: 58,
    bearing: -24,
    subtitle: 'Prototype D1 corridor stop',
    sourceStatus: 'prototype-placeholder',
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Prototype stop coordinate only. Not official NUS shuttle stop geometry.',
  },
  {
    id: 'opp-nuss',
    name: 'Opp NUSS',
    aliases: ['opposite nuss', 'nuss bus stop'],
    type: 'bus_stop',
    coordinates: [103.77308, 1.29678],
    zoom: 17.2,
    pitch: 58,
    bearing: -24,
    subtitle: 'Prototype D1 corridor stop',
    sourceStatus: 'prototype-placeholder',
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Prototype stop coordinate only. Not official NUS shuttle stop geometry.',
  },
  {
    id: 'ventus',
    name: 'Ventus',
    aliases: ['ventus bus stop'],
    type: 'bus_stop',
    coordinates: [103.77352, 1.2971],
    zoom: 17.2,
    pitch: 58,
    bearing: -24,
    subtitle: 'Prototype D1 corridor stop',
    sourceStatus: 'prototype-placeholder',
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Prototype stop coordinate only. Not official NUS shuttle stop geometry.',
  },
  {
    id: 'utown',
    name: 'UTown',
    aliases: ['university town', 'nus university town'],
    type: 'bus_stop',
    coordinates: [103.7739, 1.30325],
    zoom: 16.8,
    pitch: 58,
    bearing: -24,
    subtitle: 'Prototype D1 corridor destination',
    sourceStatus: 'prototype-placeholder',
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Prototype stop coordinate only. Not official NUS shuttle stop geometry.',
  },
  {
    id: 'clb',
    name: 'CLB',
    aliases: ['central library', 'central library bus stop'],
    type: 'bus_stop',
    coordinates: [103.77366, 1.29935],
    zoom: 17,
    pitch: 58,
    bearing: -24,
    subtitle: 'Prototype D1 corridor stop',
    sourceStatus: 'prototype-placeholder',
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Prototype stop coordinate only. Not official NUS shuttle stop geometry.',
  },
  {
    id: 'the-deck',
    name: 'The Deck',
    aliases: ['deck', 'canteen', 'food near com3'],
    type: 'food',
    coordinates: [103.7725, 1.2948],
    zoom: 17.2,
    pitch: 58,
    bearing: -24,
    subtitle: 'Food and canteen result',
    sourceStatus: 'manual-reference',
    sourceLabel: 'Prototype search index',
    detail: 'Included to validate mixed search results. Coordinate requires verification before production.',
  },
  {
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
    sourceLabel: 'Manual Prototype C corridor',
    detail: 'Animation and overlay prototype only. No live arrivals or official route geometry.',
  },
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
