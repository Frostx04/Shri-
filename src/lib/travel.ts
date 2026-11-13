import type { DayPlan, Place, Step, Transport } from '../data/schema';
import { haversineKm, type LatLng } from './geo';

/** Средняя скорость по дорогам Шри-Ланки, км/ч (с учётом пробок и серпантинов). */
const SPEED: Record<Transport, number> = {
  walk: 4.5, tuktuk: 22, tuktuk_wait: 22, taxi_app: 30, car_day: 38, car_halfday: 35, operator_pickup: 30, transfer: 45,
};

/** Ориентир из чатов: тук-тук ~500 ₨ за 3 км, 1000 за 6 км; минимум ~300 ₨. */
export function tuktukPriceLkr(km: number): number {
  return Math.max(300, Math.round((km * 170) / 50) * 50);
}

export interface Leg { fromId: string; toId: string; km: number; min: number; transport: Transport; priceLkr?: number }

/** Оценка отрезка: дорога ≈ прямая × 1.3 (или реальная длина из OSRM, если передана). */
export function estimateLeg(a: LatLng, b: LatLng, transport: Transport, roadKm?: number): { km: number; min: number; priceLkr?: number } {
  const km = roadKm ?? haversineKm(a, b) * 1.3;
  const min = Math.max(3, Math.round(((km / SPEED[transport]) * 60) / 5) * 5);
  const priceLkr = transport === 'tuktuk' || transport === 'taxi_app' ? tuktukPriceLkr(km) : undefined;
  return { km, min, priceLkr };
}

/** Транспорт по умолчанию для отрезка без явного указания. */
export function guessTransport(km: number): Transport {
  if (km < 1.2) return 'walk';
  if (km < 25) return 'tuktuk';
  return 'car_day';
}

export interface DayStop { placeId: string; n: number }

/**
 * Последовательность точек маршрута дня. Номер у места = порядок первого появления.
 * День начинается в отеле (кроме дня прилёта — из аэропорта).
 */
export function dayStops(day: Pick<DayPlan, 'steps'>, getPlace: (id: string) => Place | undefined): { order: string[]; numbers: Map<string, number> } {
  const order: string[] = [];
  const first = day.steps.find((s) => s.placeId)?.placeId;
  if (first !== 'mattala' && first !== 'hotel') order.push('hotel');
  for (const s of day.steps) {
    if (!s.placeId || !getPlace(s.placeId)?.coords) continue;
    if (order[order.length - 1] !== s.placeId) order.push(s.placeId);
  }
  const numbers = new Map<string, number>();
  let n = 1;
  for (const id of order) if (id !== 'hotel' && !numbers.has(id)) numbers.set(id, n++);
  return { order, numbers };
}

/** Отрезок, который ведёт к шагу i (если место сменилось). */
export function legBefore(steps: Step[], i: number, getPlace: (id: string) => Place | undefined, startId = 'hotel'): Leg | null {
  const to = steps[i].placeId;
  if (!to) return null;
  let from = startId;
  for (let j = i - 1; j >= 0; j--) if (steps[j].placeId) { from = steps[j].placeId!; break; }
  if (from === to) return null;
  const a = getPlace(from)?.coords, b = getPlace(to)?.coords;
  if (!a || !b) return null;
  const raw = haversineKm(a, b) * 1.3;
  const transport = steps[i].transport ?? getPlace(to)?.transport ?? guessTransport(raw);
  const t: Transport = transport === 'walk' && raw > 3 ? guessTransport(raw) : transport;
  return { fromId: from, toId: to, transport: t, ...estimateLeg(a, b, t) };
}
