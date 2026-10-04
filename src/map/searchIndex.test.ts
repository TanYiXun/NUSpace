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
    expect(searchIndex.filter((entity) => entity.type === 'bus_stop')).toHaveLength(33);
    expect(searchIndex.filter((entity) => entity.type === 'route')).toHaveLength(0);
  });

  it('does not expose stale OSM bus stop seed records in the app-facing search index', () => {
    const busStops = searchIndex.filter((entity) => entity.type === 'bus_stop');

    expect(busStops.every((entity) => entity.sourceId === 'nus-nextbus-codelab-api')).toBe(true);
    expect(searchEntities('Information Technology bus stop')[0]?.id).toBe('nextbus-it');
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

  it('uses reviewed public OSM bus stop/platform nodes as display positions without marking the stops verified', () => {
    const as5 = searchEntities('AS5')[0];
    const com3BusStop = searchEntities('COM3 bus stop')[0];
    const universityTown = searchEntities('University Town bus stop')[0];

    expect(as5?.id).toBe('nextbus-as5');
    expect(as5?.coordinates).toEqual([103.7718183, 1.2934927]);
    expect(as5?.sourceStatus).toBe('requires-permission');
    expect(as5?.displayPosition).toEqual(expect.objectContaining({
      sourceId: 'osm-api-nus-kent-ridge-map',
      sourceStatus: 'manual-reference',
      distanceFromNextbusMeters: 41,
    }));

    expect(com3BusStop?.id).toBe('nextbus-com3');
    expect(com3BusStop?.coordinates).toEqual([103.7750111, 1.2949196]);
    expect(com3BusStop?.sourceStatus).toBe('requires-permission');
    expect(com3BusStop?.displayPosition?.distanceFromNextbusMeters).toBe(59);

    expect(universityTown?.id).toBe('nextbus-utown');
    expect(universityTown?.coordinates).toEqual([103.7744314, 1.3035354]);
    expect(universityTown?.sourceStatus).toBe('requires-permission');
    expect(universityTown?.displayPosition).toEqual(expect.objectContaining({
      sourceId: 'osm-api-nus-kent-ridge-map',
      sourceStatus: 'manual-reference',
      distanceFromNextbusMeters: 43,
    }));
  });

  it('aligns exact public OSM bus stop matches while preserving NextBus route source status', () => {
    const it = searchEntities('Information Technology bus stop')[0];

    expect(it?.id).toBe('nextbus-it');
    expect(it?.coordinates).toEqual([103.7727143, 1.2972207]);
    expect(it?.sourceStatus).toBe('requires-permission');
    expect(it?.displayPosition?.sourceStatus).toBe('manual-reference');
  });

  it('keeps unmatched NUS ISB stops on the NextBus research coordinate', () => {
    const pgp = searchEntities('PGP')[0];

    expect(pgp?.id).toBe('nextbus-pgp');
    expect(pgp?.coordinates).toEqual([103.780419, 1.291765]);
    expect(pgp?.displayPosition).toBeUndefined();
  });
});
