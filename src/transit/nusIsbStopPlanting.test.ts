import { describe, expect, it } from 'vitest';
import { getNusIsbPlantedStopCount, getNusIsbPlantedStopsForCampusPlace } from './nusIsbStopPlanting';

describe('nusIsbStopPlanting', () => {
  it('plants only D1 stop labels that have existing unverified OSM seed markers', () => {
    expect(getNusIsbPlantedStopCount()).toBe(10);

    const utownStops = getNusIsbPlantedStopsForCampusPlace('bus-university-town');

    expect(utownStops).toEqual([
      expect.objectContaining({
        routeCode: 'D1',
        sequence: 8,
        officialName: 'UTown',
        positionStatus: 'manual-reference',
      }),
    ]);
  });

  it('does not invent planted stops for missing verified coordinate references', () => {
    expect(getNusIsbPlantedStopsForCampusPlace('com3')).toEqual([]);
    expect(getNusIsbPlantedStopsForCampusPlace('bus-yih')).toEqual([]);
  });
});
