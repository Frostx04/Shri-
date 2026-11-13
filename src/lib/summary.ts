import { days, getPlace } from './data';
import { dayStops } from './travel';
import { haversineKm } from './geo';
import { allVisited, bestRated, totalSpentLkr } from './progress';

/** Примерный километраж дня (туда-обратно по точкам), км. */
export function dayKm(date: string): number {
  const d = days.find((x) => x.date === date);
  if (!d) return 0;
  const { order } = dayStops(d, getPlace);
  let km = 0;
  for (let i = 1; i < order.length; i++) {
    const a = getPlace(order[i - 1])?.coords, b = getPlace(order[i])?.coords;
    if (a && b) km += haversineKm(a, b) * 1.3;
  }
  return km;
}

export function tripSummary(upTo: string) {
  const passed = days.filter((d) => d.date <= upTo);
  const best = bestRated();
  return {
    places: allVisited().filter((id) => id !== 'hotel').length,
    km: Math.round(passed.reduce((s, d) => s + dayKm(d.date), 0)),
    spentLkr: totalSpentLkr(),
    best: best ? { place: getPlace(best.id), rating: best.rating } : null,
    days: passed.length,
  };
}
