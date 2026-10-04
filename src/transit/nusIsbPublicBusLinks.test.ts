import { describe, expect, it } from 'vitest';
import { getNusIsbPublicBusLink, getNusIsbPublicBusLinkCount } from './nusIsbPublicBusLinks';

describe('nusIsbPublicBusLinks', () => {
  it('links documented nearby LTA public stops without claiming every NUS ISB stop has one', () => {
    expect(getNusIsbPublicBusLinkCount()).toBe(21);
    expect(getNusIsbPublicBusLink('nextbus-it')).toEqual(expect.objectContaining({
      ltaBusStopCode: '16189',
      matchStatus: 'coordinate-match',
    }));
    expect(getNusIsbPublicBusLink('nextbus-com3')).toBeNull();
  });
});
