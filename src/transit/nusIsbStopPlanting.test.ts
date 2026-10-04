import { describe, expect, it } from 'vitest';
import { getNusIsbPlantedStopCount, getNusIsbPlantedStopsForCampusPlace } from './nusIsbStopPlanting';

describe('nusIsbStopPlanting', () => {
  it('plants every D1 stop label against the NextBus research inventory without verifying positions', () => {
    expect(getNusIsbPlantedStopCount()).toBe(14);

    const utownStops = getNusIsbPlantedStopsForCampusPlace('nextbus-utown');

    expect(utownStops).toEqual([
      expect.objectContaining({
        routeCode: 'D1',
        sequence: 8,
        officialName: 'UTown',
        positionStatus: 'requires-permission',
      }),
    ]);
  });

  it('keeps repeated and formerly missing D1 labels attached to research-only stops', () => {
    expect(getNusIsbPlantedStopsForCampusPlace('nextbus-com3').map((stop) => stop.sequence)).toEqual([1, 14]);
    expect(getNusIsbPlantedStopsForCampusPlace('nextbus-yih')).toEqual([
      expect.objectContaining({
        routeCode: 'D1',
        sequence: 9,
        officialName: 'YIH',
        positionStatus: 'requires-permission',
      }),
    ]);
  });
});
