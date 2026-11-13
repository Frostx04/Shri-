/**
 * Опционально: фото (до 3), рейтинг, часы, адрес и координаты кафе из Google Places API (New).
 * Нужен ключ GOOGLE_PLACES_API_KEY в .env. Без ключа скрипт ничего не делает.
 * Атрибуция обязательна: автор фото и «Google Maps» сохраняются и показываются в карточке и на странице авторов.
 * Кеш: Google разрешает хранить place_id бессрочно, остальное — обновлять (запускайте скрипт перед поездкой).
 *
 *   npm run places:google                 — все кафе (category=food)
 *   npm run places:google -- --only=quinta
 */
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { Photo } from '../src/data/schema.ts';
import { readPlaces, writePlaces, root, sleep, argValue } from './lib.ts';

if (existsSync(resolve(root, '.env'))) {
  for (const line of readFileSync(resolve(root, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.log('GOOGLE_PLACES_API_KEY не задан — пропускаю. В приложении будут заглушки и кнопка «Добавить своё фото».');
  process.exit(0);
}

const API = 'https://places.googleapis.com/v1';
const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const places = readPlaces();
const only = argValue('only');

for (const p of places) {
  if (p.category !== 'food' || p.avoid) continue;
  if (only && p.id !== only) continue;
  try {
    const res = await fetch(`${API}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.regularOpeningHours,places.photos',
      },
      body: JSON.stringify({ textQuery: p.gmapsQuery, languageCode: 'en', regionCode: 'LK', maxResultCount: 1 }),
    });
    const j = await res.json();
    const g = j.places?.[0];
    if (!g) { console.log(`– ${p.id}: не найдено`); continue; }
    if (!p.coords) p.coords = [+g.location.latitude.toFixed(5), +g.location.longitude.toFixed(5)];
    if (g.rating) p.rating = { source: 'Google', value: g.rating, count: g.userRatingCount };
    const per = g.regularOpeningHours?.periods as { open: { day: number; hour: number; minute: number }; close?: { hour: number; minute: number } }[] | undefined;
    if (per?.length && per[0].close) {
      const f = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const openDays = new Set(per.map((x) => x.open.day));
      const off = [0, 1, 2, 3, 4, 5, 6].filter((d) => !openDays.has(d)).map((d) => `${DOW[d]} выходной`);
      p.hours = [`${f(per[0].open.hour, per[0].open.minute)}–${f(per[0].close.hour, per[0].close.minute)}`, ...off].join(', ');
    }
    const photos: Photo[] = [];
    const dir = resolve(root, 'public/photos', p.id);
    mkdirSync(dir, { recursive: true });
    for (const [i, ph] of (g.photos ?? []).slice(0, 3).entries()) {
      const img = await fetch(`${API}/${ph.name}/media?maxWidthPx=1600&key=${KEY}`);
      if (!img.ok) continue;
      const buf = Buffer.from(await img.arrayBuffer());
      await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(dir, `g${i + 1}.webp`));
      await sharp(buf).resize({ width: 400, height: 300, fit: 'cover' }).webp({ quality: 70 }).toFile(resolve(dir, `g${i + 1}-thumb.webp`));
      const a = ph.authorAttributions?.[0];
      photos.push({ src: `photos/${p.id}/g${i + 1}.webp`, thumb: `photos/${p.id}/g${i + 1}-thumb.webp`, author: a?.displayName ?? 'Google Maps user', license: 'Google Maps', sourceUrl: a?.uri ?? `https://www.google.com/maps/place/?q=place_id:${g.id}`, provider: 'google' });
    }
    p.photos = [...p.photos.filter((x) => x.provider !== 'google'), ...photos];
    p.checkedAt = new Date().toISOString().slice(0, 10);
    console.log(`✓ ${p.id}: ${g.displayName?.text}, ${g.rating ?? '—'}★, фото ${photos.length}`);
    await sleep(200);
  } catch (e) {
    console.warn(`✗ ${p.id}: ${(e as Error).message}`);
  }
}
writePlaces(places);
