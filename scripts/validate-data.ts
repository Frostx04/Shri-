/** Проверка data/*.json: схемы zod + ссылочная целостность. Запускается в CI и перед сборкой. */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import * as S from '../src/data/schema.ts';

const root = resolve(import.meta.dirname, '..');
const read = (f: string) => JSON.parse(readFileSync(resolve(root, 'data', f), 'utf8'));
const errors: string[] = [];
const warnings: string[] = [];

function check<T>(name: string, schema: z.ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    for (const i of r.error.issues) errors.push(`${name}: ${i.path.join('.')} — ${i.message}`);
    return data as T;
  }
  return r.data;
}

const places = check('places.json', z.array(S.Place), read('places.json'));
const days = check('days.json', z.array(S.DayPlan), read('days.json'));
const templates = check('templates.json', z.array(S.MessageTemplate), read('templates.json'));
check('budget.json', z.array(S.BudgetLine), read('budget.json'));
const info = check('info.json', S.Info, read('info.json'));
const itineraries = existsSync(resolve(root, 'data/itineraries.json'))
  ? check('itineraries.json', z.array(S.Itinerary), read('itineraries.json'))
  : [];

const ids = new Set<string>();
for (const p of places) {
  if (ids.has(p.id)) errors.push(`places: дубликат id ${p.id}`);
  ids.add(p.id);
  if (!p.howToGet?.trim()) errors.push(`places.${p.id}: пустой howToGet`);
  if (!p.sources?.trim()) errors.push(`places.${p.id}: пустой sources`);
  if (!info.regions.includes(p.region)) errors.push(`places.${p.id}: неизвестный регион «${p.region}»`);
  if (!p.coords) warnings.push(`places.${p.id}: нет координат`);
}
const tplIds = new Set(templates.map((t) => t.id));
for (const p of places) {
  if (p.messageTemplateId && !tplIds.has(p.messageTemplateId))
    errors.push(`places.${p.id}: нет шаблона ${p.messageTemplateId}`);
}

const start = info.trip.start, end = info.trip.end;
const seen = new Set<string>();
for (const d of days) {
  if (d.date < start || d.date > end) errors.push(`days.${d.date}: вне диапазона ${start}…${end}`);
  if (seen.has(d.date)) errors.push(`days.${d.date}: дубликат даты`);
  seen.add(d.date);
  let prev = '';
  d.steps.forEach((s, i) => {
    if (s.placeId && !ids.has(s.placeId)) errors.push(`days.${d.date}.steps[${i}]: нет места ${s.placeId}`);
    if (prev && s.time < prev) warnings.push(`days.${d.date}.steps[${i}]: время ${s.time} раньше предыдущего`);
    prev = s.time;
  });
}
for (const it of itineraries)
  it.days.forEach((d, di) => d.steps.forEach((s, i) => {
    if (s.placeId && !ids.has(s.placeId)) errors.push(`itineraries.${it.id}[${di}].steps[${i}]: нет места ${s.placeId}`);
  }));

const todo = places.filter((p) => JSON.stringify(p).includes('TODO')).length;
console.log(`places: ${places.length}, days: ${days.length}, templates: ${templates.length}, itineraries: ${itineraries.length}`);
console.log(`мест с TODO: ${todo}; предупреждений: ${warnings.length}`);
if (process.argv.includes('--verbose')) warnings.forEach((w) => console.log('  warn ' + w));
if (errors.length) {
  console.error(`\nОшибки (${errors.length}):`);
  errors.forEach((e) => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log('✓ данные валидны');
