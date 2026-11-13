import { describe, it, expect } from 'vitest';
import { set, get, merge, dump } from './store';

describe('store last-write-wins', () => {
  it('newer incoming wins, older is ignored', () => {
    set('rating:x', 3, { t: 1000, d: 'a' });
    expect(merge({ 'rating:x': { v: 5, t: 500, d: 'b' } })).toBe(0);
    expect(get('rating:x')).toBe(3);
    expect(merge({ 'rating:x': { v: 5, t: 2000, d: 'b' } })).toBe(1);
    expect(get('rating:x')).toBe(5);
  });
  it('deletion is a tombstone that syncs', () => {
    set('visited:y', { at: '2027-03-14' }, { t: 1000 });
    set('visited:y', null, { t: 3000 });
    expect(get('visited:y')).toBeUndefined();
    expect(dump()['visited:y'].t).toBe(3000);
    expect(merge({ 'visited:y': { v: { at: '2027-03-14' }, t: 2000, d: 'z' } })).toBe(0);
  });
});
