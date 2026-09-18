import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getPublicBusArrivals,
  type PublicBusArrivalCache,
} from './ltaDataMall';

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export function createLtaPublicBusArrivalsMiddleware(options: {
  cache?: PublicBusArrivalCache;
} = {}) {
  const cache = options.cache ?? new Map();

  return async function ltaPublicBusArrivalsMiddleware(
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (request.method !== 'GET' || requestUrl.pathname !== '/api/transit/public-bus-arrivals') {
      next();
      return;
    }

    const busStopCode = requestUrl.searchParams.get('busStopCode') ?? '';
    const result = await getPublicBusArrivals({
      busStopCode,
      cache,
    });

    const statusCode = result.status === 'ok'
      ? 200
      : result.status === 'bad_request'
        ? 400
        : result.status === 'missing_key'
          ? 503
          : 502;

    sendJson(response, statusCode, result);
  };
}
