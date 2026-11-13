import { describe, it, expect } from 'vitest';
import { waLink, gmapsLink, contactHref } from './links';

describe('links', () => {
  it('whatsapp', () => {
    expect(waLink('+94 77 916 9058', 'Hi! 2 adults')).toBe('https://wa.me/94779169058?text=Hi!%202%20adults');
  });
  it('gmaps', () => {
    expect(gmapsLink({ coords: [5.9, 80.4], gmapsQuery: 'x' })).toBe('https://www.google.com/maps/dir/?api=1&destination=5.9,80.4');
    expect(gmapsLink({ coords: null, gmapsQuery: 'Quinta Mirissa' })).toBe('https://www.google.com/maps/search/?api=1&query=Quinta%20Mirissa');
  });
  it('contacts', () => {
    expect(contactHref({ kind: 'telegram', value: '@abc' })).toBe('https://t.me/abc');
    expect(contactHref({ kind: 'phone', value: '+94 74 243 0000' })).toBe('tel:+94742430000');
  });
});
