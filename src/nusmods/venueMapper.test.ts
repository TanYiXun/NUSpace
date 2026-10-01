import { describe, expect, it } from 'vitest';
import { mapVenueToPlace } from './venueMapper';

describe('mapVenueToPlace', () => {
  it.each([
    ['COM3', 'com3'],
    ['COM 3', 'com3'],
    ['Computing 3', 'com3'],
    ['COM3-01-23', 'com3'],
    ['COM2', 'com2'],
    ['COM1-0206', 'com1'],
    ['COM4', 'com4'],
    ['BIZ2-0224', 'biz2-building'],
    ['BIZ1', 'biz1-mochtar-riady'],
    ['CLB', 'central-library-building'],
    ['ERC', 'education-resource-centre'],
    ['UCC', 'university-cultural-centre'],
    ['S17', 's17'],
  ])('maps known venue pattern %s to %s', (venue, placeId) => {
    const mapping = mapVenueToPlace(venue);

    expect(mapping.place?.id).toBe(placeId);
    expect(mapping.confidence).not.toBe('unknown');
    expect(mapping.nearestBusStop).not.toBeNull();
  });

  it('does not silently map unknown venues', () => {
    const mapping = mapVenueToPlace('LT27');

    expect(mapping.confidence).toBe('unknown');
    expect(mapping.place).toBeNull();
    expect(mapping.note).toContain('No verified campus place mapping');
  });
});
