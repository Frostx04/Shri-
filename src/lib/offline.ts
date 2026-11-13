/**
 * Офлайн: докачка фото и тайлов в Cache Storage — те же кеши, что использует service worker
 * (photos, osm-tiles), поэтому без сети всё берётся оттуда.
 *
 * Тайлы OSM: правила tile.openstreetmap.org запрещают массовое скачивание, поэтому качаем
 * умеренно: обзор района (z9–13) + детальные зумы (14–16) только вокруг отеля и мест из плана.
 */
import { places, plannedPlaceIds, getPlace, hotel, animals } from './data';
import { routeFileName } from './routes';

export const TILE_URL = (z: number, x: number, y: number) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
/** Район: Галле — Матара — Удавалаве — Синхараджа. */
export const AREA_BBOX = { south: 5.9, west: 80.15, north: 6.5, east: 80.95 };

const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

function bboxTiles(b: typeof AREA_BBOX, z: number): string[] {
  const out: string[] = [];
  for (let x = lon2x(b.west, z); x <= lon2x(b.east, z); x++)
    for (let y = lat2y(b.north, z); y <= lat2y(b.south, z); y++) out.push(TILE_URL(z, x, y));
  return out;
}

const around = ([lat, lng]: [number, number], km: number) => {
  const d = km / 111;
  return { south: lat - d, north: lat + d, west: lng - d, east: lng + d };
};

export function tileList(): string[] {
  const set = new Set<string>();
  for (let z = 9; z <= 13; z++) bboxTiles(AREA_BBOX, z).forEach((t) => set.add(t));
  // детально — вокруг отеля
  for (let z = 14; z <= 16; z++) bboxTiles(around(hotel.coords!, 2.2), z).forEach((t) => set.add(t));
  // вокруг каждого места из плана — зумы 14–15
  for (const id of plannedPlaceIds) {
    const c = getPlace(id)?.coords;
    if (!c) continue;
    for (let z = 14; z <= 15; z++) bboxTiles(around(c, 0.8), z).forEach((t) => set.add(t));
  }
  return [...set];
}

export const AVG_TILE_KB = 18;

export function photoList(): string[] {
  const base = import.meta.env.BASE_URL;
  const urls = new Set<string>();
  for (const p of [...places, ...animals]) for (const ph of p.photos) { urls.add(base + ph.src); if (ph.thumb) urls.add(base + ph.thumb); }
  return [...urls];
}

export function routeList(): string[] {
  const base = import.meta.env.BASE_URL;
  return ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'].map((d) => base + routeFileName(`day-${d}`));
}

export interface Progress { done: number; total: number; bytes: number; failed: number }

/** Качает список в кеш с ограничением параллельности. Уже закешированное пропускает. */
export async function prefetch(cacheName: string, urls: string[], onProgress: (p: Progress) => void, opts: { concurrency?: number; signal?: AbortSignal } = {}) {
  const cache = await caches.open(cacheName);
  const p: Progress = { done: 0, total: urls.length, bytes: 0, failed: 0 };
  let i = 0;
  const worker = async () => {
    while (i < urls.length && !opts.signal?.aborted) {
      const url = urls[i++];
      try {
        if (!(await cache.match(url))) {
          const res = await fetch(url, { mode: 'cors', signal: opts.signal });
          if (res.ok) {
            const blob = await res.clone().blob();
            p.bytes += blob.size;
            await cache.put(url, res);
          } else p.failed++;
        }
      } catch {
        p.failed++;
      }
      p.done++;
      onProgress({ ...p });
    }
  };
  await Promise.all(Array.from({ length: opts.concurrency ?? 2 }, worker));
  return p;
}

export async function cachedCount(cacheName: string): Promise<number> {
  if (!('caches' in window)) return 0;
  return (await (await caches.open(cacheName)).keys()).length;
}

export async function storageInfo() {
  const est = await navigator.storage?.estimate?.();
  const persisted = await navigator.storage?.persisted?.();
  return { usage: est?.usage ?? 0, quota: est?.quota ?? 0, persisted: !!persisted };
}

export const fmtMb = (b: number) => `${(b / 1024 / 1024).toFixed(b > 100 * 1024 * 1024 ? 0 : 1)} МБ`;
