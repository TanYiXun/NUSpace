import { describe, expect, it } from 'vitest';
import { d1StaticRoute, getNusIsbStaticRoute, nusIsbStaticRoutes } from './nusIsbStaticRoutes';

describe('nusIsbStaticRoutes', () => {
  it('defines a selectable D1 prototype route with stop sequence and route color', () => {
    expect(getNusIsbStaticRoute('D1')).toMatchObject({
      code: 'D1',
      name: 'D1 prototype route',
      color: '#7f42bd',
      geometryStatus: 'source_pending',
      liveStatus: 'live_unavailable',
    });
    expect(d1StaticRoute.stopSequence).toEqual(['COM3', 'Opp HSSML', 'Opp NUSS', 'Ventus', 'UTown', 'CLB']);
  });

  it('does not expose prototype routes as live arrivals', () => {
    expect(nusIsbStaticRoutes.every((route) => route.liveStatus === 'live_unavailable')).toBe(true);
    expect(nusIsbStaticRoutes.every((route) => !route.frequencyNote.toLowerCase().includes('eta'))).toBe(true);
  });
});
