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
    expect(searchIndex.filter((entity) => entity.type === 'bus_stop')).toHaveLength(10);
  });
});
