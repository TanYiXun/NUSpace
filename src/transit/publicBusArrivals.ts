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
};

type PublicBusArrivalApiResponse = {
  status?: PublicBusArrivalUiStatus;
  sourceLabel?: string;
  busStopCode?: string;
  fetchedAt?: string;
  arrivals?: unknown[];
  message?: string;
};

export function toPublicBusArrivalUiState(payload: PublicBusArrivalApiResponse): PublicBusArrivalUiState {
  const status = payload.status ?? 'upstream_error';

  return {
    status,
    sourceLabel: payload.sourceLabel ?? 'LTA DataMall public bus data',
    fetchedAt: payload.fetchedAt,
    busStopCode: payload.busStopCode,
    arrivalCount: Array.isArray(payload.arrivals) ? payload.arrivals.length : 0,
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
      message: 'Unable to reach the NUSpace public bus endpoint.',
    };
  }
}
