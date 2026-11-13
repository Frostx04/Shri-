import type { Place, Contact } from '../data/schema';

/** wa.me принимает номер только цифрами, без +. */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, '');

export function waLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Навигация от текущей точки до места, иначе — поиск по названию. */
export function gmapsLink(place: Pick<Place, 'coords' | 'gmapsQuery'>): string {
  if (place.coords) return `https://www.google.com/maps/dir/?api=1&destination=${place.coords[0]},${place.coords[1]}`;
  return gmapsSearch(place.gmapsQuery);
}
export const gmapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function contactHref(c: Contact, text?: string): string {
  switch (c.kind) {
    case 'whatsapp': return waLink(c.value, text);
    case 'phone': return `tel:${c.value.replace(/[^\d+]/g, '')}`;
    case 'telegram': return c.value.startsWith('http') ? c.value : `https://t.me/${c.value.replace(/^@/, '')}`;
    case 'instagram':
      return c.value.startsWith('http') ? c.value
        : /^[\w.]+$/.test(c.value.replace(/^@/, '')) ? `https://instagram.com/${c.value.replace(/^@/, '')}`
        : `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(c.value)}`;
    case 'site': return c.value.startsWith('http') ? c.value : `https://${c.value}`;
    case 'email': return `mailto:${c.value}`;
    case 'gmaps': return c.value.startsWith('http') ? c.value : gmapsSearch(c.value);
  }
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
