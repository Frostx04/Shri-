/**
 * Разносит data/seed.json по отдельным файлам data/*.json.
 * Запускается один раз (этап 1). Повторный запуск перезапишет файлы — используйте --force.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const seed = JSON.parse(readFileSync(resolve(root, 'data/seed.json'), 'utf8'));
const force = process.argv.includes('--force');

const out: Record<string, unknown> = {
  'places.json': seed.places,
  'days.json': seed.days,
  'templates.json': seed.templates,
  'budget.json': seed.budget,
  'info.json': { ...seed.info, regions: seed.regions },
};

for (const [name, data] of Object.entries(out)) {
  const p = resolve(root, 'data', name);
  if (existsSync(p) && !force) {
    console.log(`skip ${name} (exists, use --force)`);
    continue;
  }
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${name}`);
}
