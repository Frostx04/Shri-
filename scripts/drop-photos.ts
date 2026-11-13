/**
 * Убрать неудачные фото: npm run drop-photos -- sinharaja:3 lagoon:1,3 animal:sos-dogs:2
 * Номера — порядковые (1 = первое фото в данных). Файлы удаляются, запись из data — тоже.
 */
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, dataPath } from './lib.ts';

const load = (f: string) => JSON.parse(readFileSync(dataPath(f), 'utf8'));
const files = { places: load('places.json'), animals: load('animals.json') } as Record<string, { id: string; photos: { src: string; thumb?: string }[] }[]>;
for (const arg of process.argv.slice(2)) {
  const parts = arg.split(':');
  const [kind, id, nums] = parts.length === 3 ? ['animals', parts[1], parts[2]] : ['places', parts[0], parts[1]];
  const item = files[kind].find((x) => x.id === id);
  if (!item) { console.warn(`нет ${kind}/${id}`); continue; }
  const drop = new Set((nums ?? '').split(',').map((n) => Number(n) - 1));
  item.photos = item.photos.filter((ph, i) => {
    if (!drop.has(i)) return true;
    for (const f of [ph.src, ph.thumb]) if (f) rmSync(resolve(root, 'public', f), { force: true });
    return false;
  });
  console.log(`${id}: осталось ${item.photos.length}`);
}
writeFileSync(dataPath('places.json'), JSON.stringify(files.places, null, 2) + '\n');
writeFileSync(dataPath('animals.json'), JSON.stringify(files.animals, null, 2) + '\n');
