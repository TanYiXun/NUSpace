import { describe, expect, it } from 'vitest';
import { getTransitCapability, transitCapabilities } from './transitCapabilities';

describe('transitCapabilities', () => {
  it('keeps LTA public bus data behind a server-side key requirement', () => {
    expect(getTransitCapability('publicBusArrivals')).toMatchObject({
      status: 'requires_key',
      sourceId: 'lta-datamall-dynamic-apis',
    });
  });

  it('does not mark NUS shuttle live data as available without official access', () => {
    expect(getTransitCapability('nusIsbLiveArrivals')?.status).toBe('requires_official_access');
    expect(getTransitCapability('nusIsbLiveVehicles')?.status).toBe('requires_official_access');
    expect(getTransitCapability('nusIsbCrowdLevel')?.status).toBe('requires_official_access');
  });

  it('keeps the static NUS shuttle route layer source pending', () => {
    expect(getTransitCapability('nusIsbStaticRoutes')).toMatchObject({
      status: 'source_pending',
      sourceId: 'manual-osm-d1-prototype-route',
    });
  });

  it('defines every current transit capability with user-facing state copy', () => {
    expect(transitCapabilities).toHaveLength(6);
    expect(transitCapabilities.every((capability) => capability.userFacingState.length > 0)).toBe(true);
  });
});
