/**
 * Фото мест с Wikimedia Commons (только CC0 / CC BY / CC BY-SA / Public Domain).
 * Качает 2–4 фото на место в public/photos/<placeId>/: N.webp (1600px) и N-thumb.webp (400px),
 * пишет автора, лицензию и ссылку в data/places.json.
 *
 *   npm run photos                    — места без фото
 *   npm run photos -- --only=sigiriya — одно место
 *   npm run photos -- --force         — перекачать
 *   npm run photos -- --dry           — только показать найденное
 */
import { mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { Photo, Place } from '../src/data/schema.ts';
import { readPlaces, writePlaces, root, sleep, UA, arg, argValue } from './lib.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
const MAX = Number(argValue('max') ?? 4);
const SKIP_CATEGORIES = new Set<Place['category']>(['hotel', 'food', 'medical', 'spa']);
const OK_LICENSE = /^(cc0|cc[- ]by(-sa)?([- ]\d(\.\d)?)?([- ]\w+)?|public domain|pd\b.*)$/i;
const BAD_LICENSE = /\b(nc|nd)\b/i;

const strip = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

interface Candidate { title: string; url: string; descUrl: string; author: string; license: string; w: number; h: number }

async function search(q: string): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1600',
  });
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  const j = await res.json();
  const pages = Object.values<any>(j.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const out: Candidate[] = [];
  for (const pg of pages) {
    const ii = pg.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime)) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value);
    if (!OK_LICENSE.test(license) || BAD_LICENSE.test(license)) continue;
    if (ii.width < 800 || ii.width < ii.height * 0.9) continue; // нужны горизонтальные и не крошечные
    out.push({ title: pg.title, url: ii.thumburl ?? ii.url, descUrl: ii.descriptionurl, author: strip(m.Artist?.value) || 'неизвестен', license, w: ii.width, h: ii.height });
  }
  return out;
}

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const places = readPlaces();
const only = argValue('only');
const force = arg('force'), dry = arg('dry');
let changed = 0;

for (const p of places) {
  if (only && p.id !== only) continue;
  if (!only && SKIP_CATEGORIES.has(p.category)) continue;
  if (p.photos.some((ph) => ph.provider !== 'google') && !force) continue;
  const q = p.nameLocal ?? p.name;
  try {
    const cands = (await search(q)).slice(0, MAX);
    await sleep(500);
    if (!cands.length) { console.log(`– ${p.id}: ничего подходящего по «${q}»`); continue; }
    console.log(`${p.id}: ${cands.map((c) => `${c.title} [${c.license}]`).join(' | ')}`);
    if (dry) continue;
    const dir = resolve(root, 'public/photos', p.id);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const photos: Photo[] = [];
    for (const [i, c] of cands.entries()) {
      const buf = await download(c.url);
      await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(dir, `${i + 1}.webp`));
      await sharp(buf).rotate().resize({ width: 400, height: 300, fit: 'cover' }).webp({ quality: 70 }).toFile(resolve(dir, `${i + 1}-thumb.webp`));
      photos.push({ src: `photos/${p.id}/${i + 1}.webp`, thumb: `photos/${p.id}/${i + 1}-thumb.webp`, author: c.author, license: c.license, sourceUrl: c.descUrl, provider: 'wikimedia' });
      await sleep(300);
    }
    p.photos = [...photos, ...p.photos.filter((ph) => ph.provider === 'google')];
    changed++;
  } catch (e) {
    console.warn(`✗ ${p.id}: ${(e as Error).message}`);
  }
}
if (changed) writePlaces(places);
console.log(`\nобновлено мест: ${changed}`);
