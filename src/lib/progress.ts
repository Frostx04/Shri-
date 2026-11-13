import { days, plannedPlaceIds, dayPlaceIds, placeById } from './data';
import { get, K, keys, type Visit, type Expense } from './store';
import type { DayPlan } from '../data/schema';

export const isVisited = (id: string) => !!get<Visit>(K.visited(id));

export function dayProgress(day: Pick<DayPlan, 'steps'>) {
  const ids = dayPlaceIds(day).filter((id) => placeById.get(id)?.category !== 'airport');
  return { done: ids.filter(isVisited).length, total: ids.length };
}

export function tripProgress() {
  return { done: plannedPlaceIds.filter(isVisited).length, total: plannedPlaceIds.length };
}

export function allVisited(): string[] {
  return keys('visited:').map((k) => k.slice(8));
}

export function expenses(): (Expense & { id: string })[] {
  return keys('expense:').map((k) => ({ id: k.slice(8), ...get<Expense>(k)! }));
}

export function totalSpentLkr(): number {
  const daySum = days.reduce((s, d) => s + (get<number>(K.daySpent(d.date)) ?? 0), 0);
  return daySum + expenses().reduce((s, e) => s + e.lkr, 0);
}

export function bestRated(): { id: string; rating: number } | null {
  let best: { id: string; rating: number } | null = null;
  for (const k of keys('rating:')) {
    const r = get<number>(k)!;
    if (!best || r > best.rating) best = { id: k.slice(7), rating: r };
  }
  return best;
}
