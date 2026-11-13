import { useEffect, useState } from 'react';

/** GeoJSON маршрута дня, посчитанный заранее скриптом scripts/build-routes.ts (OSRM). */
export interface RouteFile {
  type: 'FeatureCollection';
  features: { type: 'Feature'; properties: { from: string; to: string; km: number; min: number }; geometry: { type: 'LineString'; coordinates: [number, number][] } }[];
}

const cache = new Map<string, Promise<RouteFile | null>>();

export const routeFileName = (key: string) => `routes/${key}.json`;

export function loadRoute(key: string): Promise<RouteFile | null> {
  if (!cache.has(key)) {
    cache.set(key, fetch(import.meta.env.BASE_URL + routeFileName(key))
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('json') ? r.json() : null))
      .catch(() => null));
  }
  return cache.get(key)!;
}

/** null — маршрута нет (рисуем прямые пунктиры). undefined — грузится. */
export function useRoute(key: string | null): RouteFile | null | undefined {
  const [r, setR] = useState<RouteFile | null | undefined>(undefined);
  useEffect(() => {
    if (!key) { setR(null); return; }
    let alive = true;
    setR(undefined);
    loadRoute(key).then((x) => alive && setR(x));
    return () => { alive = false; };
  }, [key]);
  return r;
}

export const dayRouteKey = (date: string) => `day-${date.slice(8, 10)}`;
