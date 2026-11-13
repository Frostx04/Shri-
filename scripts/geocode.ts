/**
 * Проверка координат через Nominatim (OpenStreetMap): 1 запрос/сек, свой User-Agent.
 * Ничего не перезаписывает — пишет отчёт data/geocode-report.md (старые/новые координаты, расстояние).
 * После проверки руками поправьте coords и поставьте coordsVerified: true.
 *
 *   npm run geocode            — места с coordsVerified: false
 *   npm run geocode -- --all   — все места
 */
import { writeFileSync } from 'node:fs';
import { readPlaces, dataPath, sleep, UA, arg } from './lib.ts';
import { haversineKm } from '../src/lib/geo.ts';

const NOMINATIM = process.env.NOMINATIM_URL ?? 'https://nominatim.openstreetmap.org';
const places = readPlaces().filter((p) => arg('all') || !p.coordsVerified);
const rows: string[] = [];
let n = 0;

for (const p of places) {
  const q = `${p.nameLocal ?? p.name}, Sri Lanka`;
  let found: { lat: number; lon: number; name: string } | null = null;
  let err = '';
  try {
    const url = `${NOMINATIM}/search?${new URLSearchParams({ q, format: 'jsonv2', limit: '1', countrycodes: 'lk', 'accept-language': 'en' })}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    if (j[0]) found = { lat: +(+j[0].lat).toFixed(5), lon: +(+j[0].lon).toFixed(5), name: j[0].display_name };
  } catch (e) {
    err = (e as Error).message;
  }
  const old = p.coords ? `${p.coords[0]}, ${p.coords[1]}` : '—';
  const neu = found ? `${found.lat}, ${found.lon}` : err ? `ошибка: ${err}` : 'не найдено';
  const dist = found && p.coords ? haversineKm(p.coords, [found.lat, found.lon]) : null;
  const flag = dist == null ? (found ? '🆕' : '❓') : dist < 0.3 ? '✅' : dist < 2 ? '⚠️' : '❌';
  rows.push(`| ${flag} | \`${p.id}\` | ${p.nameLocal ?? p.name} | ${old} | ${neu} | ${dist != null ? dist.toFixed(2) : '—'} | ${found ? found.name.replace(/\|/g, '/').slice(0, 90) : ''} |`);
  console.log(`${flag} ${p.id}: ${neu}`);
  n++;
  await sleep(1100); // политика Nominatim: не больше 1 запроса в секунду
}

const md = `# Отчёт геокодинга

Сгенерирован: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · мест: ${n} · источник: Nominatim (OpenStreetMap)

Координаты **не перезаписаны**. Проверьте в Google Maps и перенесите руками в \`data/places.json\`, затем поставьте \`coordsVerified: true\`.

✅ < 300 м · ⚠️ 0.3–2 км · ❌ > 2 км · 🆕 координат не было · ❓ не найдено

| | id | Запрос | Было | Nominatim | Δ, км | Что нашлось |
|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
writeFileSync(dataPath('geocode-report.md'), md);
console.log('\n→ data/geocode-report.md');
