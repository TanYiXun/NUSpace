import { describe, expect, it, vi } from 'vitest';
import {
  fetchPublicBusArrivalUiState,
  toPublicBusArrivalUiState,
} from './publicBusArrivals';

describe('public bus arrival UI state', () => {
  it('normalizes the missing-key response for user-facing display', () => {
    expect(toPublicBusArrivalUiState({
      status: 'missing_key',
      sourceLabel: 'LTA DataMall public bus data',
      busStopCode: '16069',
      arrivals: [],
      cache: { hit: false, ttlSeconds: 20 },
      message: 'LTA_DATAMALL_ACCOUNT_KEY is not configured on the server.',
    })).toMatchObject({
      status: 'missing_key',
      busStopCode: '16069',
      arrivalCount: 0,
      cacheHit: false,
      cacheTtlSeconds: 20,
      arrivals: [],
      message: 'LTA_DATAMALL_ACCOUNT_KEY is not configured on the server.',
    });
  });

  it('keeps live arrival rows for rendering when the endpoint returns ok', () => {
    const result = toPublicBusArrivalUiState({
      status: 'ok',
      sourceLabel: 'LTA DataMall public bus data',
      busStopCode: '16069',
      fetchedAt: '2026-09-18T08:00:00.000Z',
      cache: { hit: true, ttlSeconds: 20 },
      arrivals: [
        {
          serviceNo: '96',
          operator: 'SBST',
          nextBuses: [
            {
              sequence: 1,
              estimatedArrival: '2026-09-18T08:04:00.000Z',
              estimatedArrivalMinutes: 4,
              load: 'SEA',
              type: 'SD',
              feature: 'WAB',
              latitude: 1.29,
              longitude: 103.77,
              isStale: false,
            },
          ],
        },
      ],
    });

    expect(result).toMatchObject({
      status: 'ok',
      arrivalCount: 1,
      cacheHit: true,
      cacheTtlSeconds: 20,
      arrivals: [
        {
          serviceNo: '96',
          nextBuses: [
            expect.objectContaining({
              estimatedArrivalMinutes: 4,
              load: 'SEA',
              feature: 'WAB',
            }),
          ],
        },
      ],
    });
  });

  it('fetches through the project endpoint rather than DataMall directly', async () => {
    const fetchImpl = vi.fn(async () => ({
      json: async () => ({
        status: 'missing_key',
        sourceLabel: 'LTA DataMall public bus data',
        busStopCode: '16069',
        arrivals: [],
        cache: { hit: false, ttlSeconds: 20 },
      }),
    })) as unknown as typeof fetch;

    const result = await fetchPublicBusArrivalUiState('16069', fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith('/api/transit/public-bus-arrivals?busStopCode=16069');
    expect(result.status).toBe('missing_key');
  });
});
