/**
 * Разбор строки часов работы: «12:00–21:00, Пн выходной», «7:00–19:00», «Пн–Сб 8:00–22:00», «круглосуточно».
 * Возвращает null, если формат не распознан (тогда «открыто сейчас» не знаем).
 */
const DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export interface Hours { open: number; close: number; days: Set<number> }

const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };

export function parseHours(s?: string): Hours | null {
  if (!s) return null;
  const t = s.toLowerCase();
  if (/круглосуточно|24\/7/.test(t)) return { open: 0, close: 24 * 60, days: new Set([0, 1, 2, 3, 4, 5, 6]) };
  const m = t.match(/(\d{1,2}[:.]\d{2})\s*[–—-]\s*(\d{1,2}[:.]\d{2})/);
  if (!m) return null;
  const open = toMin(m[1].replace('.', ':')), close = toMin(m[2].replace('.', ':'));
  let days = new Set([0, 1, 2, 3, 4, 5, 6]);
  const range = t.match(/(пн|вт|ср|чт|пт|сб|вс)\s*[–—-]\s*(пн|вт|ср|чт|пт|сб|вс)/);
  if (range) {
    days = new Set();
    const a = DAYS.indexOf(range[1]), b = DAYS.indexOf(range[2]);
    for (let i = a; ; i = (i + 1) % 7) { days.add(i); if (i === b) break; }
  }
  for (const off of t.matchAll(/(пн|вт|ср|чт|пт|сб|вс)\w*\s+выходн/g)) days.delete(DAYS.indexOf(off[1]));
  return { open, close: close <= open ? close + 24 * 60 : close, days };
}

/** weekday: 0=вс; minutes — минуты от полуночи по Шри-Ланке. */
export function isOpen(h: Hours, weekday: number, minutes: number): boolean {
  if (h.days.has(weekday) && minutes >= h.open && minutes < h.close) return true;
  const prev = (weekday + 6) % 7; // после полуночи — хвост вчерашней смены
  return h.close > 24 * 60 && h.days.has(prev) && minutes + 24 * 60 < h.close;
}

export function openNow(hours: string | undefined, weekday: number, minutes: number): boolean | null {
  const h = parseHours(hours);
  return h ? isOpen(h, weekday, minutes) : null;
}
