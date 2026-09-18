export const LTA_DATAMALL_SOURCE_ID = 'lta-datamall-dynamic-apis';
export const LTA_PUBLIC_BUS_ARRIVAL_ENDPOINT =
  'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';
export const PUBLIC_BUS_CACHE_TTL_MS = 20_000;
export const PUBLIC_BUS_STALE_ARRIVAL_MS = 5 * 60_000;

export type PublicBusArrivalStatus =
  | 'ok'
  | 'missing_key'
  | 'bad_request'
  | 'upstream_error';

export type PublicBusArrival = {
  serviceNo: string;
  operator: string;
  nextBuses: {
    sequence: 1 | 2 | 3;
    estimatedArrival: string | null;
    estimatedArrivalMinutes: number | null;
    load: string | null;
    type: string | null;
    feature: string | null;
    latitude: number | null;
    longitude: number | null;
    isStale: boolean;
  }[];
};

export type PublicBusArrivalResult = {
  status: PublicBusArrivalStatus;
  sourceId: typeof LTA_DATAMALL_SOURCE_ID;
  sourceLabel: 'LTA DataMall public bus data';
  busStopCode: string;
  fetchedAt: string;
  cache: {
    hit: boolean;
    ttlSeconds: number;
  };
  arrivals: PublicBusArrival[];
  message?: string;
};

type FetchLike = (url: string, init: {
  headers: Record<string, string>;
}) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

type CacheEntry = {
  fetchedAtMs: number;
  result: PublicBusArrivalResult;
};

export type PublicBusArrivalCache = Map<string, CacheEntry>;

type LtaBusEstimate = {
  EstimatedArrival?: unknown;
  Latitude?: unknown;
  Longitude?: unknown;
  VisitNumber?: unknown;
  Load?: unknown;
  Feature?: unknown;
  Type?: unknown;
};

type LtaBusService = {
  ServiceNo?: unknown;
  Operator?: unknown;
  NextBus?: LtaBusEstimate;
  NextBus2?: LtaBusEstimate;
  NextBus3?: LtaBusEstimate;
};

type LtaBusArrivalPayload = {
  BusStopCode?: unknown;
  Services?: unknown;
};

function getString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getArrivalMinutes(estimatedArrival: string | null, nowMs: number) {
  if (!estimatedArrival) {
    return null;
  }

  const arrivalMs = Date.parse(estimatedArrival);

  if (Number.isNaN(arrivalMs)) {
    return null;
  }

  return Math.max(0, Math.round((arrivalMs - nowMs) / 60_000));
}

function isStaleArrival(estimatedArrival: string | null, nowMs: number) {
  if (!estimatedArrival) {
    return false;
  }

  const arrivalMs = Date.parse(estimatedArrival);

  if (Number.isNaN(arrivalMs)) {
    return true;
  }

  return nowMs - arrivalMs > PUBLIC_BUS_STALE_ARRIVAL_MS;
}

function normalizeBusEstimate(
  estimate: LtaBusEstimate | undefined,
  sequence: 1 | 2 | 3,
  nowMs: number,
) {
  const estimatedArrival = getString(estimate?.EstimatedArrival);

  return {
    sequence,
    estimatedArrival,
    estimatedArrivalMinutes: getArrivalMinutes(estimatedArrival, nowMs),
    load: getString(estimate?.Load),
    type: getString(estimate?.Type),
    feature: getString(estimate?.Feature),
    latitude: getNumber(estimate?.Latitude),
    longitude: getNumber(estimate?.Longitude),
    isStale: isStaleArrival(estimatedArrival, nowMs),
  };
}

function emptyResult(
  status: PublicBusArrivalStatus,
  busStopCode: string,
  nowMs: number,
  message: string,
): PublicBusArrivalResult {
  return {
    status,
    sourceId: LTA_DATAMALL_SOURCE_ID,
    sourceLabel: 'LTA DataMall public bus data',
    busStopCode,
    fetchedAt: new Date(nowMs).toISOString(),
    cache: {
      hit: false,
      ttlSeconds: PUBLIC_BUS_CACHE_TTL_MS / 1000,
    },
    arrivals: [],
    message,
  };
}

export function normalizeLtaPublicBusArrivalPayload(
  payload: unknown,
  requestedBusStopCode: string,
  nowMs = Date.now(),
): PublicBusArrivalResult {
  const ltaPayload = payload as LtaBusArrivalPayload;
  const services = Array.isArray(ltaPayload.Services) ? ltaPayload.Services as LtaBusService[] : [];
  const busStopCode = getString(ltaPayload.BusStopCode) ?? requestedBusStopCode;

  return {
    status: 'ok',
    sourceId: LTA_DATAMALL_SOURCE_ID,
    sourceLabel: 'LTA DataMall public bus data',
    busStopCode,
    fetchedAt: new Date(nowMs).toISOString(),
    cache: {
      hit: false,
      ttlSeconds: PUBLIC_BUS_CACHE_TTL_MS / 1000,
    },
    arrivals: services.map((service) => ({
      serviceNo: getString(service.ServiceNo) ?? 'Unknown',
      operator: getString(service.Operator) ?? 'Unknown',
      nextBuses: [
        normalizeBusEstimate(service.NextBus, 1, nowMs),
        normalizeBusEstimate(service.NextBus2, 2, nowMs),
        normalizeBusEstimate(service.NextBus3, 3, nowMs),
      ],
    })),
  };
}

export function getLtaAccountKey(env: NodeJS.ProcessEnv = process.env) {
  return env.LTA_DATAMALL_ACCOUNT_KEY?.trim() ?? '';
}

export async function getPublicBusArrivals(options: {
  busStopCode: string;
  accountKey?: string;
  fetchImpl?: FetchLike;
  cache?: PublicBusArrivalCache;
  nowMs?: number;
}): Promise<PublicBusArrivalResult> {
  const nowMs = options.nowMs ?? Date.now();
  const busStopCode = options.busStopCode.trim();

  if (!/^\d{5}$/.test(busStopCode)) {
    return emptyResult(
      'bad_request',
      busStopCode,
      nowMs,
      'Provide a five-digit LTA public bus stop code.',
    );
  }

  const accountKey = options.accountKey?.trim() ?? getLtaAccountKey();

  if (!accountKey) {
    return emptyResult(
      'missing_key',
      busStopCode,
      nowMs,
      'LTA_DATAMALL_ACCOUNT_KEY is not configured on the server.',
    );
  }

  const cache = options.cache;
  const cached = cache?.get(busStopCode);

  if (cached && nowMs - cached.fetchedAtMs < PUBLIC_BUS_CACHE_TTL_MS) {
    return {
      ...cached.result,
      cache: {
        ...cached.result.cache,
        hit: true,
      },
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const url = new URL(LTA_PUBLIC_BUS_ARRIVAL_ENDPOINT);
    url.searchParams.set('BusStopCode', busStopCode);

    const response = await fetchImpl(url.toString(), {
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      return emptyResult(
        'upstream_error',
        busStopCode,
        nowMs,
        `LTA DataMall returned HTTP ${response.status}.`,
      );
    }

    const result = normalizeLtaPublicBusArrivalPayload(await response.json(), busStopCode, nowMs);
    cache?.set(busStopCode, {
      fetchedAtMs: nowMs,
      result,
    });

    return result;
  } catch {
    return emptyResult(
      'upstream_error',
      busStopCode,
      nowMs,
      'Unable to reach LTA DataMall.',
    );
  }
}
