import { describe, expect, it, vi } from 'vitest';
import {
  getPublicBusArrivals,
  normalizeLtaPublicBusArrivalPayload,
  type PublicBusArrivalCache,
} from './ltaDataMall';

const NOW_MS = Date.parse('2026-09-18T08:00:00.000Z');

describe('LTA DataMall public bus adapter', () => {
  it('returns an explicit unavailable state when the server key is missing', async () => {
    const result = await getPublicBusArrivals({
      busStopCode: '17099',
      accountKey: '',
      nowMs: NOW_MS,
    });

    expect(result).toMatchObject({
      status: 'missing_key',
      sourceId: 'lta-datamall-dynamic-apis',
      busStopCode: '17099',
      arrivals: [],
    });
    expect(result.message).toContain('LTA_DATAMALL_ACCOUNT_KEY');
  });

  it('rejects non-LTA bus stop codes before calling DataMall', async () => {
    const fetchImpl = vi.fn();
    const result = await getPublicBusArrivals({
      busStopCode: 'COM3',
      accountKey: 'server-only-key',
      fetchImpl,
      nowMs: NOW_MS,
    });

    expect(result.status).toBe('bad_request');
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('normalizes DataMall-shaped arrival payloads without exposing credentials', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        BusStopCode: '17099',
        Services: [
          {
            ServiceNo: '96',
            Operator: 'SBST',
            NextBus: {
              EstimatedArrival: '2026-09-18T08:05:00+00:00',
              Latitude: '1.294',
              Longitude: '103.772',
              Load: 'SEA',
              Feature: 'WAB',
              Type: 'SD',
            },
          },
        ],
      }),
    }));

    const result = await getPublicBusArrivals({
      busStopCode: '17099',
      accountKey: 'server-only-key',
      fetchImpl,
      nowMs: NOW_MS,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/v3/BusArrival?BusStopCode=17099'),
      expect.objectContaining({
        headers: expect.objectContaining({
          AccountKey: 'server-only-key',
        }),
      }),
    );
    expect(result.arrivals[0]).toMatchObject({
      serviceNo: '96',
      operator: 'SBST',
    });
    expect(result.arrivals[0].nextBuses[0]).toMatchObject({
      estimatedArrivalMinutes: 5,
      latitude: 1.294,
      longitude: 103.772,
      load: 'SEA',
      feature: 'WAB',
      type: 'SD',
      isStale: false,
    });
    expect(JSON.stringify(result)).not.toContain('server-only-key');
  });

  it('uses the short-lived cache for successful public bus responses', async () => {
    const cache: PublicBusArrivalCache = new Map();
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        BusStopCode: '17099',
        Services: [],
      }),
    }));

    const firstResult = await getPublicBusArrivals({
      busStopCode: '17099',
      accountKey: 'server-only-key',
      fetchImpl,
      cache,
      nowMs: NOW_MS,
    });
    const secondResult = await getPublicBusArrivals({
      busStopCode: '17099',
      accountKey: 'server-only-key',
      fetchImpl,
      cache,
      nowMs: NOW_MS + 5_000,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(firstResult.cache.hit).toBe(false);
    expect(secondResult.cache.hit).toBe(true);
  });

  it('returns an explicit upstream error state when DataMall fails', async () => {
    const result = await getPublicBusArrivals({
      busStopCode: '17099',
      accountKey: 'server-only-key',
      fetchImpl: vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({}),
      })),
      nowMs: NOW_MS,
    });

    expect(result).toMatchObject({
      status: 'upstream_error',
      arrivals: [],
    });
    expect(result.message).toBe('LTA DataMall returned HTTP 503.');
  });

  it('marks stale estimated arrivals in normalized payloads', () => {
    const result = normalizeLtaPublicBusArrivalPayload(
      {
        BusStopCode: '17099',
        Services: [
          {
            ServiceNo: '96',
            Operator: 'SBST',
            NextBus: {
              EstimatedArrival: '2026-09-18T07:45:00+00:00',
            },
          },
        ],
      },
      '17099',
      NOW_MS,
    );

    expect(result.arrivals[0].nextBuses[0]).toMatchObject({
      estimatedArrivalMinutes: 0,
      isStale: true,
    });
  });
});
