/**
 * Считает маршруты дней заранее через OSRM и пишет GeoJSON в public/routes/day-XX.json.
 * В рантайме ничего не запрашиваем → работает офлайн. Если OSRM недоступен,
 * файл не пишется, и приложение рисует прямые пунктирные линии.
 *
 *   npm run routes            — все дни и мини-маршруты
 *   npm run routes -- --force — пересчитать даже существующие
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Place, DayPlan, Itinerary } from '../src/data/schema.ts';
import { dayStops } from '../src/lib/travel.ts';

const root = resolve(import.meta.dirname, '..');
const OSRM = process.env.OSRM_URL ?? 'https://router.project-osrm.org';
const force = process.argv.includes('--force');
const read = <T>(f: string): T => JSON.parse(readFileSync(resolve(root, 'data', f), 'utf8'));

const places = read<Place[]>('places.json');
const byId = new Map(places.map((p) => [p.id, p]));
const days = read<DayPlan[]>('days.json');
const itineraries = existsSync(resolve(root, 'data/itineraries.json')) ? read<Itinerary[]>('itineraries.json') : [];

const outDir = resolve(root, 'public/routes');
mkdirSync(outDir, { recursive: true });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const legCache = new Map<string, { coords: [number, number][]; km: number; min: number }>();

async function leg(a: Place, b: Place) {
  const key = `${a.id}>${b.id}`;
  if (legCache.has(key)) return legCache.get(key)!;
  const [la, lo] = a.coords!, [lb, lo2] = b.coords!;
  const url = `${OSRM}/route/v1/driving/${lo},${la};${lo2},${lb}?overview=full&geometries=geojson`;
  const res = await fetch(url, { headers: { 'User-Agent': 'sri-lanka-2027-trip-app (build script)' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const j = await res.json();
  if (j.code !== 'Ok') throw new Error(`OSRM ${j.code}`);
  const r = j.routes[0];
  const out = { coords: r.geometry.coordinates as [number, number][], km: +(r.distance / 1000).toFixed(1), min: Math.round(r.duration / 60) };
  legCache.set(key, out);
  await sleep(1100); // вежливо к публичному серверу
  return out;
}

async function build(key: string, day: Pick<DayPlan, 'steps'>) {
  const file = resolve(outDir, `${key}.json`);
  if (existsSync(file) && !force) return console.log(`skip ${key}`);
  const { order } = dayStops(day, (id) => byId.get(id));
  const features = [];
  for (let i = 1; i < order.length; i++) {
    const a = byId.get(order[i - 1])!, b = byId.get(order[i])!;
    const l = await leg(a, b);
    features.push({ type: 'Feature', properties: { from: a.id, to: b.id, km: l.km, min: l.min }, geometry: { type: 'LineString', coordinates: l.coords } });
  }
  writeFileSync(file, JSON.stringify({ type: 'FeatureCollection', features }));
  const km = features.reduce((s, f) => s + f.properties.km, 0);
  console.log(`✓ ${key}: ${features.length} отрезков, ${km.toFixed(1)} км`);
}

let ok = 0, fail = 0;
const jobs: [string, Pick<DayPlan, 'steps'>][] = [
  ...days.map((d) => [`day-${d.date.slice(8, 10)}`, d] as [string, DayPlan]),
  ...itineraries.flatMap((it) => it.days.map((d, i) => [`it-${it.id}-${i + 1}`, d] as [string, Pick<DayPlan, 'steps'>])),
];
for (const [key, d] of jobs) {
  try { await build(key, d); ok++; } catch (e) {
    fail++;
    console.warn(`✗ ${key}: ${(e as Error).message} — будут прямые пунктиры`);
  }
}
console.log(`\nготово: ${ok}, ошибок: ${fail}`);
