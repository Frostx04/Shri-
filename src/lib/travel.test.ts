import { describe, it, expect } from 'vitest';
import { tuktukPriceLkr, estimateLeg, dayStops, legBefore } from './travel';
import { getPlace, dayByDate } from './data';

describe('travel', () => {
  it('tuk-tuk price follows chat rule of thumb', () => {
    expect(tuktukPriceLkr(3)).toBe(500);
    expect(tuktukPriceLkr(6)).toBe(1000);
    expect(tuktukPriceLkr(0.5)).toBe(300);
  });
  it('estimates leg time', () => {
    const r = estimateLeg([5.9484, 80.4587], [5.953, 80.444], 'tuktuk');
    expect(r.km).toBeGreaterThan(1.5);
    expect(r.km).toBeLessThan(3);
    expect(r.min).toBeGreaterThanOrEqual(3);
  });
  it('day stops start at hotel and are numbered', () => {
    const d = dayByDate.get('2027-03-19')!;
    const { order, numbers } = dayStops(d, getPlace);
    expect(order[0]).toBe('hotel');
    expect(order[order.length - 1]).toBe('hotel');
    expect(numbers.get('animal-sos')).toBe(1);
    expect(numbers.has('hotel')).toBe(false);
  });
  it('arrival day starts from airport', () => {
    const { order } = dayStops(dayByDate.get('2027-03-13')!, getPlace);
    expect(order[0]).toBe('mattala');
  });
  it('leg before step', () => {
    const d = dayByDate.get('2027-03-15')!;
    const leg = legBefore(d.steps, 0, getPlace);
    expect(leg?.toId).toBe('thalaramba');
    expect(leg?.transport).toBe('tuktuk');
  });
});
