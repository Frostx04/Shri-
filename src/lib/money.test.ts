import { describe, it, expect } from 'vitest';
import { costText, fmtLkr, fmtNum, midLkr } from './money';

describe('money', () => {
  it('formats numbers with nbsp thousands', () => {
    expect(fmtNum(5000)).toBe('5 000');
    expect(fmtNum(150)).toBe('150');
    expect(fmtLkr(12500)).toBe('12 500 ₨');
  });
  it('formats lkr with usd hint', () => {
    expect(costText([5000, 5000], undefined, 330)).toBe('5 000 ₨ (~$15)');
    expect(costText([0, 0], undefined)).toBe('бесплатно');
    expect(costText([6800, 7600], undefined, 330)).toBe('6 800–7 600 ₨ (~$20–$25)');
  });
  it('formats usd with lkr hint', () => {
    expect(costText(undefined, [50, 50], 330)).toBe('$50 (~16 500 ₨)');
    expect(costText(undefined, [180, 220], 330)).toBe('$180–$220 (~59 400–72 600 ₨)');
  });
  it('mid', () => {
    expect(midLkr(undefined, [10, 20], 300)).toBe(4500);
  });
});
