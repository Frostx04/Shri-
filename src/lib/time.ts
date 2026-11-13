/** Время Шри-Ланки: UTC+5:30, без перехода на летнее. «Сегодня» считаем только по нему. */
export const LK_OFFSET_MIN = 330;

const pad = (n: number) => String(n).padStart(2, '0');

/** Текущий момент, сдвинутый на часовой пояс Шри-Ланки (поля UTC = местное время LK). */
export function lkParts(now: Date = new Date()) {
  const d = new Date(now.getTime() + LK_OFFSET_MIN * 60_000);
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
    weekday: d.getUTCDay(),
    minutes: d.getUTCHours() * 60 + d.getUTCMinutes(),
  };
}

/** Момент начала дня (00:00 по Шри-Ланке) в UTC-миллисекундах. */
export function lkMidnight(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d) - LK_OFFSET_MIN * 60_000;
}

/** Момент «дата + время» по Шри-Ланке → Date. */
export function lkDateTime(isoDate: string, hhmm = '00:00'): Date {
  const [h, mi] = hhmm.split(':').map(Number);
  return new Date(lkMidnight(isoDate) + (h * 60 + mi) * 60_000);
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function diffDays(a: string, b: string): number {
  return Math.round((lkMidnight(a) - lkMidnight(b)) / 86_400_000);
}

const WD_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WD_LONG = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export function weekday(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** «Вт, 16 марта» */
export function formatDayRu(isoDate: string, long = false): string {
  const [, m, d] = isoDate.split('-').map(Number);
  const wd = weekday(isoDate);
  return `${long ? WD_LONG[wd][0].toUpperCase() + WD_LONG[wd].slice(1) : WD_SHORT[wd]}, ${d} ${MONTHS_GEN[m - 1]}`;
}

export const weekdayShort = (isoDate: string) => WD_SHORT[weekday(isoDate)];
export const dayOfMonth = (isoDate: string) => Number(isoDate.slice(8, 10));

/** «16.03» */
export const formatShort = (isoDate: string) => `${isoDate.slice(8, 10)}.${isoDate.slice(5, 7)}`;

export function plural(n: number, one: string, few: string, many: string): string {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export interface Countdown { days: number; hours: number; minutes: number; seconds: number; total: number }

export function countdown(target: Date, now: Date = new Date()): Countdown {
  const total = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(total / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, total };
}

export function addMinutes(hhmm: string, min: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const t = (h * 60 + m + min + 24 * 60) % (24 * 60);
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}
