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
      message: 'LTA_DATAMALL_ACCOUNT_KEY is not configured on the server.',
    })).toMatchObject({
      status: 'missing_key',
      busStopCode: '16069',
      arrivalCount: 0,
      message: 'LTA_DATAMALL_ACCOUNT_KEY is not configured on the server.',
    });
  });

  it('fetches through the project endpoint rather than DataMall directly', async () => {
    const fetchImpl = vi.fn(async () => ({
      json: async () => ({
        status: 'missing_key',
        sourceLabel: 'LTA DataMall public bus data',
        busStopCode: '16069',
        arrivals: [],
      }),
    })) as unknown as typeof fetch;

    const result = await fetchPublicBusArrivalUiState('16069', fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith('/api/transit/public-bus-arrivals?busStopCode=16069');
    expect(result.status).toBe('missing_key');
  });
});
