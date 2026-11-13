import { describe, it, expect } from 'vitest';
import { allBookings, bookingDeadline, urgency } from './bookings';

describe('bookings', () => {
  it('deadline from daysBefore', () => {
    expect(bookingDeadline('2027-03-16', 21)).toBe('2027-02-23');
  });
  it('sinharaja is the earliest and has template', () => {
    const b = allBookings();
    expect(b[0].place.id).toBe('sinharaja');
    expect(b[0].templates[0].id).toBe('sinharaja');
    const croc = b.find((x) => x.place.id === 'crocodiles')!;
    expect(croc.templates.map((t) => t.id)).toEqual(['crocs', 'crocs-car']);
  });
  it('urgency', () => {
    const b = allBookings()[0];
    expect(urgency(b, 'none', '2027-03-01')).toBe('overdue');
    expect(urgency(b, 'confirmed', '2027-03-01')).toBe('done');
    expect(urgency(b, 'none', '2027-02-21')).toBe('soon');
    expect(urgency(b, 'none', '2026-12-01')).toBe('later');
  });
});
