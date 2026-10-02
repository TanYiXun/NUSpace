import { describe, expect, it } from 'vitest';
import { searchEntities, searchIndex } from './searchIndex';

describe('searchEntities', () => {
  it.each(['COM3', 'COM 3', 'Computing 3'])('ranks COM3 first for %s', (query) => {
    const results = searchEntities(query);

    expect(results[0]?.id).toBe('com3');
  });

  it('returns mixed entity types from aliases', () => {
    const results = searchEntities('food near com3');

    expect(results[0]?.id).toBe('the-terrace');
    expect(results[0]?.type).toBe('food');
  });

  it('seeds the MVP 1 minimum searchable coverage', () => {
    expect(searchIndex.length).toBeGreaterThanOrEqual(20);
    expect(searchIndex.filter((entity) => entity.type === 'building')).toHaveLength(13);
    expect(searchIndex.filter((entity) => entity.type === 'bus_stop')).toHaveLength(43);
    expect(searchIndex.filter((entity) => entity.type === 'route')).toHaveLength(0);
  });

  it('keeps OSM bus stop coordinates labelled as unverified seed references', () => {
    const busStops = searchIndex.filter((entity) => entity.type === 'bus_stop' && entity.sourceId === 'osm-api-nus-kent-ridge-map');

    expect(busStops).toHaveLength(10);
    expect(busStops.every((entity) => entity.sourceStatus === 'manual-reference')).toBe(true);
    expect(busStops.every((entity) => entity.subtitle.includes('position unverified'))).toBe(true);
  });

  it('adds every NUS ISB stop from the NextBus research snapshot without marking it verified', () => {
    const nextbusStops = searchIndex.filter((entity) => entity.sourceId === 'nus-nextbus-codelab-api');

    expect(nextbusStops).toHaveLength(33);
    expect(nextbusStops.every((entity) => entity.type === 'bus_stop')).toBe(true);
    expect(nextbusStops.every((entity) => entity.sourceStatus === 'requires-permission')).toBe(true);
    expect(nextbusStops.every((entity) => entity.nextbus && entity.nextbus.routeNames.length > 0)).toBe(true);
  });

  it('can search the full NUS ISB stop inventory by NextBus stop title', () => {
    expect(searchEntities('Botanic Gardens MRT')[0]?.id).toBe('nextbus-bg-mrt');
    expect(searchEntities('Oei Tiong Ham')[0]?.id).toBe('nextbus-oth');
    expect(searchEntities('COM3')[0]?.id).toBe('com3');
    expect(searchEntities('COM3 bus stop')[0]?.id).toBe('nextbus-com3');
  });
});
