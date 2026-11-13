import placesJson from '../../data/places.json';
import daysJson from '../../data/days.json';
import templatesJson from '../../data/templates.json';
import budgetJson from '../../data/budget.json';
import infoJson from '../../data/info.json';
import animalsJson from '../../data/animals.json';
import type { Place, DayPlan, MessageTemplate, BudgetLine, Info, Itinerary, Animal } from '../data/schema';

const itineraryModules = import.meta.glob<{ default: Itinerary[] }>('../../data/itineraries.json', { eager: true });

export const places = placesJson as unknown as Place[];
export const days = daysJson as unknown as DayPlan[];
export const templates = templatesJson as unknown as MessageTemplate[];
export const budget = budgetJson as unknown as BudgetLine[];
export const info = infoJson as unknown as Info;
export const animals = animalsJson as unknown as Animal[];
export const animalById = new Map(animals.map((a) => [a.id, a]));
/** Звери, которых можно встретить в месте. */
export const animalsAt = (placeId: string) => animals.filter((a) => a.where.includes(placeId));
export const itineraries: Itinerary[] = Object.values(itineraryModules)[0]?.default ?? [];

export const placeById = new Map(places.map((p) => [p.id, p]));
export const templateById = new Map(templates.map((t) => [t.id, t]));
export const dayByDate = new Map(days.map((d) => [d.date, d]));
export const hotel = placeById.get('hotel')!;

export const getPlace = (id?: string) => (id ? placeById.get(id) : undefined);

/** Дни, в которых встречается место. */
export const daysForPlace = (() => {
  const m = new Map<string, string[]>();
  for (const d of days)
    for (const s of d.steps)
      if (s.placeId && s.placeId !== 'hotel') {
        const arr = m.get(s.placeId) ?? [];
        if (!arr.includes(d.date)) arr.push(d.date);
        m.set(s.placeId, arr);
      }
  return m;
})();

/** Уникальные места дня (без отеля), в порядке появления. */
export function dayPlaceIds(day: Pick<DayPlan, 'steps'>): string[] {
  const out: string[] = [];
  for (const s of day.steps) if (s.placeId && s.placeId !== 'hotel' && !out.includes(s.placeId)) out.push(s.placeId);
  return out;
}

/** Все места, запланированные в поездке (для прогресса «Посетили N из M»). */
export const plannedPlaceIds = [...new Set(days.flatMap((d) => dayPlaceIds(d)))].filter(
  (id) => !['mattala'].includes(id),
);

export const specialDay = (date: string) => info.trip.specialDays.find((s) => s.date === date);

export function hasTodo(p: Place): boolean {
  return JSON.stringify(p).includes('TODO');
}
