/**
 * Реальные фото мест и зверей со свободными лицензиями (CC0 / CC BY / CC BY-SA / Public Domain).
 *
 * Источники:
 *  - звери  → iNaturalist (наблюдения со Шри-Ланки, research grade), запасной — Openverse;
 *  - места  → Openverse (Flickr и др.), запасной — Wikimedia Commons.
 * Commons сильно ограничивает частоту запросов с общих IP, поэтому он последний в очереди.
 *
 * Пишет public/photos/<id>/N.webp (1280px) + N-thumb.webp (400px) и автора/лицензию/ссылку в data/*.json.
 * Запрос — photoQuery (варианты через «|») или nameLocal / латинское название.
 *
 *   npm run photos                       — всё, где ещё нет фото
 *   npm run photos -- --only=sigiriya    — один объект;  --animals / --places — только одно
 *   npm run photos -- --force --max=3    — перекачать, по 3 фото;  --dry — только показать находки
 */
import { mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { Photo, Place, Animal } from '../src/data/schema.ts';
import { readPlaces, writePlaces, root, sleep, arg, argValue, politeFetch, dataPath } from './lib.ts';

type Provider = NonNullable<Photo['provider']>;
interface Candidate { url: string; descUrl: string; author: string; license: string; provider: Provider; title: string }

const OK_LICENSE = /^(cc0|cc[- ]by(-sa)?([- ]\d(\.\d)?)?([- ]\w+)?|public domain|pd\b.*|pdm)$/i;
const BAD_LICENSE = /\b(nc|nd)\b/i;
const BAD_TITLE = /\b(map|karte|logo|flag|coat of arms|diagram|stamp|drawing|illustration|skull|specimen|taxidermy|poster|menu)\b/i;
const strip = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const SRI_LANKA_INAT = 6967;

/* ——— iNaturalist ——— */
const INAT_LIC: Record<string, string> = { cc0: 'CC0', 'cc-by': 'CC BY 4.0', 'cc-by-sa': 'CC BY-SA 4.0' };
/** Точный таксон по названию: если taxon_name не распознан, API игнорирует фильтр и отдаёт что попало. */
async function inatTaxon(q: string): Promise<{ id: number; name: string } | null> {
  const res = await politeFetch(`https://api.inaturalist.org/v1/taxa?${new URLSearchParams({ q, per_page: '5' })}`);
  if (!res.ok) throw new Error(`iNaturalist taxa ${res.status}`);
  const j = await res.json();
  const norm = (s: string) => s.toLowerCase().trim();
  const t = (j.results ?? []).find((r: any) => norm(r.name) === norm(q)) ?? (j.results ?? []).find((r: any) => norm(q).startsWith(norm(r.name)));
  return t ? { id: t.id, name: t.name } : null;
}

async function inaturalist(q: string, max: number): Promise<Candidate[]> {
  const out: Candidate[] = [];
  const taxon = await inatTaxon(q);
  await sleep(1100);
  if (!taxon) { console.log(`  iNaturalist: таксон «${q}» не найден`); return out; }
  for (const place of [SRI_LANKA_INAT, null]) {
    const params = new URLSearchParams({ taxon_id: String(taxon.id), photo_license: 'cc0,cc-by,cc-by-sa', quality_grade: 'research', order_by: 'votes', per_page: '20', photos: 'true' });
    if (place) params.set('place_id', String(place));
    const res = await politeFetch(`https://api.inaturalist.org/v1/observations?${params}`);
    if (!res.ok) throw new Error(`iNaturalist ${res.status}`);
    const j = await res.json();
    for (const o of j.results ?? []) {
      const p = o.photos?.[0];
      if (!p || !INAT_LIC[p.license_code]) continue;
      const d = p.original_dimensions;
      if (d && (d.width < 800 || d.width < d.height * 0.75)) continue;
      out.push({ url: p.url.replace('/square.', '/large.'), descUrl: o.uri, author: strip(p.attribution).replace(/^\(c\)\s*/i, '').replace(/,? some rights reserved.*$/i, '').replace(/, no rights reserved.*$/i, ''), license: INAT_LIC[p.license_code], provider: 'inaturalist', title: o.taxon?.name ?? q });
      if (out.length >= max) return out;
    }
    await sleep(1100);
    if (out.length) return out;
  }
  return out;
}

/* ——— Openverse ——— */
const OV_LIC: Record<string, string> = { by: 'CC BY', 'by-sa': 'CC BY-SA', cc0: 'CC0', pdm: 'Public Domain' };
async function openverse(q: string, max: number): Promise<Candidate[]> {
  const params = new URLSearchParams({ q, license: 'by,by-sa,cc0,pdm', page_size: '20', mature: 'false', excluded_source: 'wikimedia' });
  const res = await politeFetch(`https://api.openverse.org/v1/images/?${params}`);
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const j = await res.json();
  const out: Candidate[] = [];
  for (const r of j.results ?? []) {
    if (!OV_LIC[r.license] || BAD_TITLE.test(r.title ?? '')) continue;
    if (r.width && (r.width < 800 || r.width < r.height * 0.9)) continue;
    if (!/^https:\/\/live\.staticflickr\.com\//.test(r.url)) continue; // скачиваем только с разрешённого хоста
    out.push({ url: r.url, descUrl: r.foreign_landing_url, author: r.creator || 'неизвестен', license: `${OV_LIC[r.license]}${r.license_version && r.license !== 'pdm' && r.license !== 'cc0' ? ' ' + r.license_version : ''}`, provider: 'openverse', title: r.title ?? q });
    if (out.length >= max) break;
  }
  return out;
}

/* ——— Wikimedia Commons ——— */
async function commons(q: string, max: number): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: '6', gsrlimit: '24', prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: '1280',
  });
  const res = await politeFetch(`https://commons.wikimedia.org/w/api.php?${params}`, {}, 2);
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  const j = await res.json();
  const pages = Object.values<any>(j.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const out: Candidate[] = [];
  for (const pg of pages) {
    const ii = pg.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime) || BAD_TITLE.test(pg.title)) continue;
    const m = ii.extmetadata ?? {};
    const license = strip(m.LicenseShortName?.value);
    if (!OK_LICENSE.test(license) || BAD_LICENSE.test(license) || ii.width < 900 || ii.width < ii.height * 0.9) continue;
    out.push({ url: (ii.thumburl ?? ii.url).replace(/\?utm_[^#]*$/, ''), descUrl: ii.descriptionurl, author: strip(m.Artist?.value).slice(0, 120) || 'неизвестен', license, provider: 'wikimedia', title: pg.title });
    if (out.length >= max) break;
  }
  return out;
}

const SEARCH: Record<'inaturalist' | 'openverse' | 'wikimedia', (q: string, max: number) => Promise<Candidate[]>> = { inaturalist, openverse, wikimedia: commons };

async function download(url: string): Promise<Buffer> {
  const res = await politeFetch(url, {}, 3);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

interface Item { id: string; queries: string[]; sources: (keyof typeof SEARCH)[]; dir: string; max: number; photos: Photo[]; set: (p: Photo[]) => void }

async function processItem(it: Item, dry: boolean): Promise<boolean> {
  let cands: Candidate[] = [];
  outer: for (const src of it.sources)
    for (const q of it.queries) {
      try { cands = await SEARCH[src](q, it.max); } catch (e) { console.warn(`  ${src}: ${(e as Error).message}`); }
      await sleep(1200);
      if (cands.length) break outer;
    }
  if (!cands.length) { console.log(`– ${it.id}: ничего подходящего`); return false; }
  console.log(`${it.id}: ${cands.map((c) => `[${c.provider} ${c.license}] ${c.title.replace('File:', '').slice(0, 50)}`).join(' | ')}`);
  if (dry) return false;
  const abs = resolve(root, 'public', it.dir);
  rmSync(abs, { recursive: true, force: true });
  mkdirSync(abs, { recursive: true });
  const photos: Photo[] = [];
  for (const c of cands) {
    const n = photos.length + 1;
    try {
      const buf = await download(c.url);
      await sharp(buf).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(abs, `${n}.webp`));
      await sharp(buf).rotate().resize({ width: 400, height: 300, fit: 'cover', position: 'attention' }).webp({ quality: 68 }).toFile(resolve(abs, `${n}-thumb.webp`));
      photos.push({ src: `${it.dir}/${n}.webp`, thumb: `${it.dir}/${n}-thumb.webp`, author: c.author, license: c.license, sourceUrl: c.descUrl, provider: c.provider });
    } catch (e) {
      console.warn(`  ✗ ${c.url}: ${(e as Error).message}`);
    }
    await sleep(400);
  }
  if (!photos.length) return false;
  it.set([...photos, ...it.photos.filter((ph) => ph.provider === 'google' || ph.provider === 'own')]);
  return true;
}

const only = argValue('only');
const force = arg('force'), dry = arg('dry');
const doPlaces = !arg('animals'), doAnimals = !arg('places');
const SKIP_CATEGORIES = new Set<Place['category']>(['hotel', 'food', 'medical', 'spa']);
const split = (q: string) => q.split('|').map((s) => s.trim()).filter(Boolean);
const hasFree = (ph: Photo[]) => ph.some((x) => x.provider && x.provider !== 'google' && x.provider !== 'own');
const withCountry = (q: string) => (/sri lanka/i.test(q) ? q : `${q} Sri Lanka`);

if (doAnimals) {
  const file = dataPath('animals.json');
  const animals: Animal[] = JSON.parse(readFileSync(file, 'utf8'));
  let changed = 0;
  for (const a of animals) {
    if (only && a.id !== only) continue;
    if (hasFree(a.photos) && !force) continue;
    const ov = a.photoSource === 'openverse';
    const item: Item = {
      id: a.id, dir: `photos/animals/${a.id}`, max: Number(argValue('max') ?? 2), photos: a.photos, set: (ph) => (a.photos = ph),
      queries: ov ? split(a.photoQuery ?? a.latin) : [a.latin, ...split(a.photoQuery ?? '')],
      sources: ov ? ['openverse', 'inaturalist'] : ['inaturalist', 'openverse'],
    };
    if (await processItem(item, dry)) { changed++; writeFileSync(file, JSON.stringify(animals, null, 2) + '\n'); }
  }
  console.log(`зверей обновлено: ${changed}`);
}

if (doPlaces) {
  const places = readPlaces();
  let changed = 0;
  for (const p of places) {
    if (only && p.id !== only) continue;
    if (!only && SKIP_CATEGORIES.has(p.category)) continue;
    if (hasFree(p.photos) && !force) continue;
    const qs = split(p.photoQuery ?? p.nameLocal ?? p.name);
    const item: Item = {
      id: p.id, dir: `photos/${p.id}`, max: Number(argValue('max') ?? 3), photos: p.photos, set: (ph) => (p.photos = ph),
      queries: qs.map(withCountry), sources: ['openverse', 'wikimedia'],
    };
    if (await processItem(item, dry)) { changed++; writePlaces(places); }
  }
  console.log(`мест обновлено: ${changed}`);
}
