import { describe, it, expect } from 'vitest';
import { stripPrices, stripPriceList } from './noPrices';

describe('noPrices', () => {
  it('removes price parentheses and sentences', () => {
    expect(stripPrices('Тук-тук 5–7 минут (~400 ₨). Ориентир — Eat Out Restaurant.')).toBe('Тук-тук 5–7 минут. Ориентир — Eat Out Restaurant.');
    expect(stripPrices('Гид от $50 с человека, вход ~$15 с гидом')).toBe('');
    expect(stripPrices('Пешком 4 минуты.')).toBe('Пешком 4 минуты.');
  });
  it('lists', () => {
    expect(stripPriceList(['Купаться', 'Инструктор ~3000 ₨ с человека', 'Маска (500 рупий) в прокате'])).toEqual(['Купаться', 'Маска в прокате']);
  });
});
