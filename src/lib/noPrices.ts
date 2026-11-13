/**
 * Приложение — подарок: цены не показываем. Эти функции вырезают упоминания денег из текстов данных.
 * (Сами цены остаются в data/*.json — для того, кто планирует.)
 */
const MONEY = /(\$\s?\d|\d[\d\s .,–-]*\s?(₨|рупи|руп\.|lkr|usd|\$|долл))/i;

/** Убирает скобки и хвосты с ценами: «Тук-тук 5–7 минут (~400 ₨).» → «Тук-тук 5–7 минут.» */
export function stripPrices(text: string): string {
  let t = text.replace(/\s*\([^()]*\)/g, (m) => (MONEY.test(m) ? '' : m));
  // предложения/части через «;» или «.», где есть деньги — выкидываем
  t = t.split(/(?<=[.;!?])\s+/).filter((s) => !MONEY.test(s)).join(' ');
  t = t.split(/,\s+/).filter((s) => !MONEY.test(s)).join(', ');
  return t.replace(/\s{2,}/g, ' ').replace(/\s+([.,;])/g, '$1').trim();
}

/** Для списков: пункты целиком про деньги убираем, остальные чистим. */
export function stripPriceList(items: string[]): string[] {
  return items.map(stripPrices).filter((s) => s.length > 2);
}

export const hasMoney = (s: string) => MONEY.test(s);
