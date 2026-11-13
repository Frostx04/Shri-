import type { Animal } from '../data/schema';
import { animals, placeById, plannedPlaceIds } from './data';
import { get, K, type AnimalSeen } from './store';

export const groupMeta: Record<Animal['group'], { label: string; emoji: string }> = {
  mammals: { label: 'Звери', emoji: '🐘' },
  reptiles: { label: 'Рептилии', emoji: '🐢' },
  birds: { label: 'Птицы', emoji: '🦚' },
  sea: { label: 'В море', emoji: '🐠' },
  other: { label: 'Букашки и лягушки', emoji: '🦋' },
};

export const chanceMeta: Record<Animal['chance'], { label: string; className: string }> = {
  high: { label: 'точно увидим', className: 'bg-[#d5efe0] text-[#1f5b36] dark:bg-[#1f4630] dark:text-[#b4e6c7]' },
  medium: { label: 'если повезёт', className: 'bg-[#fff0c2] text-[#6b4d00] dark:bg-[#4d3d10] dark:text-[#ffe08a]' },
  low: { label: 'редкость', className: 'bg-[#f1e1f7] text-[#5f2d78] dark:bg-[#3c2348] dark:text-[#e4c3f2]' },
};

const planned = new Set(plannedPlaceIds);
/** Можно встретить в нашей поездке (есть хотя бы одно место из плана). */
export const inTrip = (a: Animal) => a.where.some((w) => planned.has(w) || w === 'hotel' || placeById.get(w)?.inPlan);

export const tripAnimals = () => animals.filter(inTrip);
export const seenOf = (id: string) => get<AnimalSeen>(K.animal(id));
export const seenCount = (list: Animal[] = animals) => list.filter((a) => seenOf(a.id)).length;

/** Уровни шкалы: сколько зверушек нужно увидеть. */
export const LEVELS = [
  { n: 1, emoji: '👀', title: 'Первая встреча' },
  { n: 5, emoji: '🌱', title: 'Юный натуралист' },
  { n: 12, emoji: '🦎', title: 'Следопыт' },
  { n: 20, emoji: '🐘', title: 'Знаток джунглей' },
  { n: 30, emoji: '🦚', title: 'Повелитель сафари' },
  { n: 40, emoji: '👑', title: 'Королева зверушек' },
];

export function levelFor(n: number) {
  let cur = null as (typeof LEVELS)[number] | null;
  for (const l of LEVELS) if (n >= l.n) cur = l;
  const next = LEVELS.find((l) => l.n > n) ?? null;
  return { cur, next };
}
