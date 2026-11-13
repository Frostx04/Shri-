import { describe, it, expect } from 'vitest';
import { openNow, parseHours } from './hours';

describe('hours', () => {
  it('parses day off', () => {
    const h = parseHours('12:00–21:00, Пн выходной')!;
    expect(h.days.has(1)).toBe(false);
    expect(openNow('12:00–21:00, Пн выходной', 2, 13 * 60)).toBe(true);
    expect(openNow('12:00–21:00, Пн выходной', 1, 13 * 60)).toBe(false);
    expect(openNow('12:00–21:00, Пн выходной', 2, 22 * 60)).toBe(false);
  });
  it('parses day range', () => {
    expect(openNow('Пн–Сб 8:00–22:00', 0, 10 * 60)).toBe(false);
    expect(openNow('Пн–Сб 8:00–22:00', 6, 10 * 60)).toBe(true);
  });
  it('past midnight', () => {
    expect(openNow('18:00–02:00', 3, 60)).toBe(true);
  });
  it('unknown', () => {
    expect(openNow('Смотреть часы в Google Maps', 3, 60)).toBe(null);
    expect(openNow('круглосуточно', 3, 60)).toBe(true);
  });
});
