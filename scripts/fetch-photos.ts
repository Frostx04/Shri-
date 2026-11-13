/**
 * Фото мест и зверей с Wikimedia Commons (только CC0 / CC BY / CC BY-SA / Public Domain).
 * Качает в public/photos/<id>/ (места) и public/photos/animals/<id>/ (звери):
 * N.webp (1280px — стандартный размер превью Wikimedia, не нагружает их сервер) и N-thumb.webp (400px), пишет автора, лицензию и ссылку в data/*.json.
 *
 * Запрос: photoQuery (варианты через «|», пробуются по очереди) или nameLocal.
 *
 *   npm run photos                     — места и звери без фото
 *   npm run photos -- --only=sigiriya  — одно место/зверь
 *   npm run photos -- --animals        — только звери;  --places — только места
 *   npm run photos -- --force          — перекачать;    --dry — только показать находки
 *   --plan — только места из плана; --trip — звери кроме редких; --max=N — фото на объект
 *
 * Wikimedia ограничивает частоту запросов (429 + Retry-After). Скрипт ждёт и сохраняет прогресс
 * после каждого объекта — его можно прервать и запустить снова, готовое пропустится.
 */
import { mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { Photo, Place, Animal } from '../src/data/schema.ts';
import { readPlaces, writePlaces, root, sleep, arg, argValue, politeFetch, dataPath } from './lib.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
const SKIP_CATEGORIES = new Set<Place['category']>(['hotel', 'food', 'medical', 'spa']);
const OK_LICENSE = /^(cc0|cc[- ]by(-sa)?([- ]\d(\.\d)?)?([- ]\w+)?|public domain|pd\b.*)$/i;
const BAD_LICENSE = /\b(nc|nd)\b/i;
const BAD_TITLE = /\b(map|karte|logo|flag|coat of arms|diagram|stamp|svg|drawing|illustration|skull|museum specimen|taxidermy)\b/i;

const strip = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

interface Candidate { title: string; url: string; descUrl: string; author: string; license: string }

async function search(q: string, minRatio: number): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: '6', gsrlimit: '24', prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1280',
  });
  const res = await politeFetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  const j = await res.json();
  const pages = Object.values<any>(j.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const out: Candidate[] = [];
  for (const pg of pages) {
    const ii = pg.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime) || BAD_TITLE.test(pg.title)) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value);
    if (!OK_LICENSE.test(license) || BAD_LICENSE.test(license)) continue;
    if (ii.width < 900 || ii.width < ii.height * minRatio) continue;
    out.push({ title: pg.title, url: ii.thumburl ?? ii.url, descUrl: ii.descriptionurl, author: strip(m.Artist?.value).slice(0, 120) || 'неизвестен', license });
  }
  return out;
}

/** Превью отдаются и с upload.wikimedia.org по тому же пути; utm-метки не нужны. */
const normalizeThumb = (u: string) => u.replace('://thumb.wikimedia.org/', '://upload.wikimedia.org/').replace(/\?utm_[^#]*$/, '');

async function download(url: string): Promise<Buffer> {
  const res = await politeFetch(normalizeThumb(url));
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

interface Item { id: string; queries: string[]; dir: string; max: number; minRatio: number; photos: Photo[]; set: (p: Photo[]) => void }

async function processItem(it: Item, dry: boolean): Promise<boolean> {
  let cands: Candidate[] = [];
  for (const q of it.queries) {
    cands = (await search(q, it.minRatio)).slice(0, it.max);
    await sleep(2000);
    if (cands.length) break;
  }
  if (!cands.length) { console.log(`– ${it.id}: ничего подходящего по «${it.queries.join(' | ')}»`); return false; }
  console.log(`${it.id}: ${cands.map((c) => `${c.title.replace('File:', '')} [${c.license}]`).join(' | ')}`);
  if (dry) return false;
  const abs = resolve(root, 'public', it.dir);
  rmSync(abs, { recursive: true, force: true });
  mkdirSync(abs, { recursive: true });
  const photos: Photo[] = [];
  for (const [i, c] of cands.entries()) {
    try {
      const buf = await download(c.url);
      await sharp(buf).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(abs, `${i + 1}.webp`));
      await sharp(buf).rotate().resize({ width: 400, height: 300, fit: 'cover', position: 'attention' }).webp({ quality: 68 }).toFile(resolve(abs, `${i + 1}-thumb.webp`));
      photos.push({ src: `${it.dir}/${i + 1}.webp`, thumb: `${it.dir}/${i + 1}-thumb.webp`, author: c.author, license: c.license, sourceUrl: c.descUrl, provider: 'wikimedia' });
    } catch (e) {
      console.warn(`  ✗ ${c.title}: ${(e as Error).message}`);
    }
    await sleep(1500);
  }
  it.set([...photos, ...it.photos.filter((ph) => ph.provider === 'google')]);
  return photos.length > 0;
}

const only = argValue('only');
const force = arg('force'), dry = arg('dry');
const doPlaces = !arg('animals'), doAnimals = !arg('places');
const planOnly = arg('plan'), tripOnly = arg('trip');
const queriesOf = (q: string | undefined, fallback: string) => (q ?? fallback).split('|').map((s) => s.trim()).filter(Boolean);
const hasOwn = (ph: Photo[]) => ph.some((x) => x.provider !== 'google');

if (doPlaces) {
  const places = readPlaces();
  let changed = 0;
  for (const p of places) {
    if (only && p.id !== only) continue;
    if (!only && SKIP_CATEGORIES.has(p.category)) continue;
    if (planOnly && !p.inPlan) continue;
    if (hasOwn(p.photos) && !force) continue;
    try {
      if (await processItem({ id: p.id, queries: queriesOf(p.photoQuery, p.nameLocal ?? p.name), dir: `photos/${p.id}`, max: Number(argValue('max') ?? 2), minRatio: 0.9, photos: p.photos, set: (ph) => (p.photos = ph) }, dry)) {
        changed++;
        writePlaces(places); // сохраняем по ходу — можно прервать и продолжить
      }
    } catch (e) { console.warn(`✗ ${p.id}: ${(e as Error).message}`); }
  }
  console.log(`\nмест обновлено: ${changed}`);
}

if (doAnimals) {
  const file = dataPath('animals.json');
  const animals: Animal[] = JSON.parse(readFileSync(file, 'utf8'));
  let changed = 0;
  for (const a of animals) {
    if (only && a.id !== only) continue;
    if (hasOwn(a.photos) && !force) continue;
    if (tripOnly && a.chance === 'low') continue;
    try {
      if (await processItem({ id: a.id, queries: queriesOf(a.photoQuery, a.latin), dir: `photos/animals/${a.id}`, max: Number(argValue('max') ?? 2), minRatio: 0.75, photos: a.photos, set: (ph) => (a.photos = ph) }, dry)) {
        changed++;
        writeFileSync(file, JSON.stringify(animals, null, 2) + '\n');
      }
    } catch (e) { console.warn(`✗ ${a.id}: ${(e as Error).message}`); }
  }
  console.log(`зверей обновлено: ${changed}`);
}
