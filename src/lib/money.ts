/** Деньги: основная валюта — рупии, доллары серым рядом. */
export const DEFAULT_RATE = 330;

const nbsp = ' ';
export function fmtNum(n: number): string {
  const r = Math.round(n);
  return String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, nbsp).replace(/^/, r < 0 ? '−' : '');
}

export const fmtLkr = (n: number) => `${fmtNum(n)}${nbsp}₨`;
export const fmtUsd = (n: number) => `$${fmtNum(n)}`;
export const lkrToUsd = (lkr: number, rate = DEFAULT_RATE) => lkr / rate;
export const usdToLkr = (usd: number, rate = DEFAULT_RATE) => usd * rate;

type Range = [number, number] | undefined;

function fmtRange(r: [number, number], f: (n: number) => string): string {
  return r[0] === r[1] ? f(r[0]) : `${f(r[0]).replace(/[^\d\s −]/g, '').trim()}–${f(r[1])}`;
}

/** Округление долларов для подсказки: <10 — до 1, иначе до 5. */
function roundUsd(n: number) {
  return n < 10 ? Math.max(1, Math.round(n)) : Math.round(n / 5) * 5;
}

/**
 * Форматирует цену: «5 000 ₨ (~$15)», «$50 (~16 500 ₨)», «бесплатно».
 * Возвращает основную и дополнительную части отдельно (вторую показываем серым).
 */
export function formatCost(lkr: Range, usd: Range, rate = DEFAULT_RATE): { main: string; sub?: string } | null {
  if (lkr) {
    if (lkr[0] === 0 && lkr[1] === 0) return { main: 'бесплатно' };
    const u: [number, number] = [roundUsd(lkr[0] / rate), roundUsd(lkr[1] / rate)];
    return { main: fmtRange(lkr, fmtLkr), sub: `~${fmtRange(u, fmtUsd).replace(/^(\d)/, '$$$1')}` };
  }
  if (usd) {
    const l: [number, number] = [Math.round((usd[0] * rate) / 100) * 100, Math.round((usd[1] * rate) / 100) * 100];
    return { main: fmtRange(usd, fmtUsd).replace(/^(\d)/, '$$$1'), sub: `~${fmtRange(l, fmtLkr)}` };
  }
  return null;
}

export function costText(lkr: Range, usd: Range, rate = DEFAULT_RATE): string {
  const c = formatCost(lkr, usd, rate);
  if (!c) return '';
  return c.sub ? `${c.main} (${c.sub})` : c.main;
}

/** Середина диапазона в рупиях (для итогов). */
export function midLkr(lkr: Range, usd: Range, rate = DEFAULT_RATE): number {
  if (lkr) return (lkr[0] + lkr[1]) / 2;
  if (usd) return ((usd[0] + usd[1]) / 2) * rate;
  return 0;
}
export function rangeLkr(lkr: Range, usd: Range, rate = DEFAULT_RATE): [number, number] {
  if (lkr) return lkr;
  if (usd) return [usd[0] * rate, usd[1] * rate];
  return [0, 0];
}
