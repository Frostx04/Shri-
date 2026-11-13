import { describe, it, expect } from 'vitest';
import { lkParts, formatDayRu, addDays, diffDays, countdown, lkDateTime, plural, addMinutes } from './time';

describe('time (Sri Lanka, UTC+5:30)', () => {
  it('today is computed in LK time, not device time', () => {
    // 2027-03-15 19:00 UTC = 16.03 00:30 в Шри-Ланке (а в Ташкенте ещё 15.03 23:59+)
    expect(lkParts(new Date('2027-03-15T19:00:00Z')).date).toBe('2027-03-16');
    expect(lkParts(new Date('2027-03-15T18:29:00Z')).date).toBe('2027-03-15');
    expect(lkParts(new Date('2027-03-15T18:29:00Z')).time).toBe('23:59');
  });
  it('formats russian dates', () => {
    expect(formatDayRu('2027-03-16')).toBe('Вт, 16 марта');
    expect(formatDayRu('2027-03-13')).toBe('Сб, 13 марта');
    expect(formatDayRu('2027-03-21', true)).toBe('Воскресенье, 21 марта');
  });
  it('date math', () => {
    expect(addDays('2027-03-16', -21)).toBe('2027-02-23');
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01');
    expect(diffDays('2027-03-24', '2027-03-13')).toBe(11);
  });
  it('countdown', () => {
    const c = countdown(lkDateTime('2027-03-13'), new Date('2027-03-11T16:30:00Z'));
    expect(c.days).toBe(1);
    expect(c.hours).toBe(2);
  });
  it('plural', () => {
    expect(plural(1, 'день', 'дня', 'дней')).toBe('день');
    expect(plural(3, 'день', 'дня', 'дней')).toBe('дня');
    expect(plural(11, 'день', 'дня', 'дней')).toBe('дней');
    expect(plural(121, 'день', 'дня', 'дней')).toBe('день');
  });
  it('addMinutes', () => {
    expect(addMinutes('23:30', 45)).toBe('00:15');
  });
});
