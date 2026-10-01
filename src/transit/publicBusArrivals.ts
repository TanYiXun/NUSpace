export type PublicBusArrivalUiStatus =
  | 'loading'
  | 'ok'
  | 'missing_key'
  | 'bad_request'
  | 'upstream_error';

export type PublicBusArrivalUiState = {
  status: PublicBusArrivalUiStatus;
  sourceLabel: string;
  fetchedAt?: string;
  busStopCode?: string;
  arrivalCount: number;
  message: string;
  cacheHit: boolean;
  cacheTtlSeconds: number;
  arrivals: PublicBusArrivalUiService[];
};

type PublicBusArrivalApiResponse = {
  status?: PublicBusArrivalUiStatus;
  sourceLabel?: string;
  busStopCode?: string;
  fetchedAt?: string;
  cache?: {
    hit?: boolean;
    ttlSeconds?: number;
  };
  arrivals?: PublicBusArrivalUiService[];
  message?: string;
};

export type PublicBusArrivalUiEstimate = {
  sequence: 1 | 2 | 3;
  estimatedArrival: string | null;
  estimatedArrivalMinutes: number | null;
  load: string | null;
  type: string | null;
  feature: string | null;
  latitude: number | null;
  longitude: number | null;
  isStale: boolean;
};

export type PublicBusArrivalUiService = {
  serviceNo: string;
  operator: string;
  nextBuses: PublicBusArrivalUiEstimate[];
};

export function toPublicBusArrivalUiState(payload: PublicBusArrivalApiResponse): PublicBusArrivalUiState {
  const status = payload.status ?? 'upstream_error';
  const arrivals = Array.isArray(payload.arrivals) ? payload.arrivals : [];

  return {
    status,
    sourceLabel: payload.sourceLabel ?? 'LTA DataMall public bus data',
    fetchedAt: payload.fetchedAt,
    busStopCode: payload.busStopCode,
    arrivalCount: arrivals.length,
    cacheHit: payload.cache?.hit ?? false,
    cacheTtlSeconds: payload.cache?.ttlSeconds ?? 0,
    arrivals,
    message: payload.message ?? (
      status === 'ok'
        ? 'Arrival response received.'
        : 'Public bus arrivals are unavailable.'
    ),
  };
}

export async function fetchPublicBusArrivalUiState(
  busStopCode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PublicBusArrivalUiState> {
  try {
    const response = await fetchImpl(
      `/api/transit/public-bus-arrivals?busStopCode=${encodeURIComponent(busStopCode)}`,
    );
    const payload = await response.json() as PublicBusArrivalApiResponse;
    return toPublicBusArrivalUiState(payload);
  } catch {
    return {
      status: 'upstream_error',
      sourceLabel: 'LTA DataMall public bus data',
      busStopCode,
      arrivalCount: 0,
      cacheHit: false,
      cacheTtlSeconds: 0,
      arrivals: [],
      message: 'Unable to reach the NUSpace public bus endpoint.',
    };
  }
}
