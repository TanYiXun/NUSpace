import { describe, expect, it } from 'vitest';
import { searchEntities } from './searchIndex';

describe('searchEntities', () => {
  it.each(['COM3', 'COM 3', 'Computing 3'])('ranks COM3 first for %s', (query) => {
    const results = searchEntities(query);

    expect(results[0]?.id).toBe('com3');
  });

  it('returns mixed entity types from aliases', () => {
    const results = searchEntities('food near com3');

    expect(results[0]?.id).toBe('the-deck');
    expect(results[0]?.type).toBe('food');
  });
});
