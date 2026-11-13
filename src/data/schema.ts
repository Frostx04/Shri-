import { z } from 'zod';

export const Tier = z.enum(['top', 'good', 'optional']);
export const Transport = z.enum([
  'walk', 'tuktuk', 'taxi_app', 'tuktuk_wait', 'car_day', 'car_halfday', 'operator_pickup', 'transfer',
]);
export const Category = z.enum([
  'beach', 'animals', 'nature', 'culture', 'food', 'spa', 'shop', 'hotel', 'airport', 'medical',
]);
const Range = z.tuple([z.number(), z.number()]);

export const Contact = z.object({
  kind: z.enum(['whatsapp', 'phone', 'telegram', 'instagram', 'site', 'email', 'gmaps']),
  value: z.string().min(1),
  label: z.string().optional(),
});

export const Photo = z.object({
  src: z.string(),
  thumb: z.string().optional(),
  author: z.string(),
  license: z.string(),
  sourceUrl: z.string(),
  provider: z.enum(['wikimedia', 'google', 'own']).optional(),
});

export const MenuItem = z.object({
  name: z.string(),
  nameRu: z.string().optional(),
  priceLkr: z.number(),
  note: z.string().optional(),
  stomach: z.enum(['ok', 'spicy']).optional(),
  photo: Photo.optional(),
  checkedAt: z.string().optional(),
});

export const Place = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameLocal: z.string().optional(),
  category: Category,
  tier: Tier,
  emoji: z.string().optional(),
  coords: z.tuple([z.number().min(5).max(10.5), z.number().min(79).max(82.5)]).nullable(),
  coordsVerified: z.boolean(),
  gmapsQuery: z.string().min(1),
  why: z.array(z.string()),
  howToGet: z.string().min(1, 'нет howToGet'),
  transport: Transport,
  travelTimeMin: z.number().optional(),
  whatToDo: z.array(z.string()),
  whenToCome: z.string(),
  costLkr: Range.optional(),
  costUsd: Range.optional(),
  costNote: z.string().optional(),
  bring: z.array(z.string()),
  pitfalls: z.array(z.string()),
  contacts: z.array(Contact),
  bookAhead: z.object({ daysBefore: z.number().int().min(0), note: z.string() }).optional(),
  messageTemplateId: z.string().optional(),
  hours: z.string().optional(),
  photos: z.array(Photo),
  sources: z.string().min(1, 'нет sources'),
  rating: z.object({ source: z.string(), value: z.number(), count: z.number().optional() }).optional(),
  tags: z.array(z.string()).optional(),
  region: z.string(),
  distanceKm: z.number().optional(),
  driveHours: z.number().optional(),
  tripType: z.enum(['walk', 'halfday', 'day', 'overnight', 'far']).optional(),
  inPlan: z.boolean(),
  area: z.string().optional(),            // район для еды: «Мирисса», «Велигама», «Галле и Унаватуна»…
  cuisine: z.string().optional(),
  stomach: z.enum(['ok', 'check', 'spicy', 'avoid']).optional(),
  avoid: z.boolean().optional(),
  priceLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  order: z.array(z.string()).optional(),
  menu: z.array(MenuItem).optional(),
  checkedAt: z.string().optional(),
});

export const Step = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  placeId: z.string().optional(),
  title: z.string(),
  kind: z.enum(['move', 'activity', 'food', 'rest', 'book']),
  transport: Transport.optional(),
  durationMin: z.number().optional(),
  costLkr: Range.optional(),
  costUsd: Range.optional(),
  note: z.string().optional(),
});

export const DayPlan = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
  emoji: z.string(),
  mood: z.enum(['active', 'easy', 'rest', 'travel']),
  doorTeaser: z.string(),
  backupNote: z.string().optional(),
  weather: z.string().optional(),
  steps: z.array(Step),
});

export const Itinerary = z.object({
  id: z.string(),
  title: z.string(),
  emoji: z.string(),
  region: z.string(),
  summary: z.string(),
  days: z.array(DayPlan.omit({ date: true }).extend({ date: z.string().optional(), fromHotel: z.boolean().optional() })),
});

export const MessageTemplate = z.object({
  id: z.string(),
  to: z.string(),
  lang: z.enum(['en', 'ru']),
  text: z.string(),
});

export const BudgetLine = z.object({ id: z.string(), title: z.string(), planUsd: Range });

export const Info = z.object({
  trip: z.object({
    start: z.string(),
    end: z.string(),
    travelers: z.array(z.string()),
    cashUsd: z.number(),
    lkrPerUsd: z.number(),
    timezone: z.string(),
    flights: z.array(z.string()),
    specialDays: z.array(z.object({ date: z.string(), note: z.string() })),
  }),
  rules: z.array(z.string()),
  safety: z.array(z.string()),
  dontGo: z.array(z.string()),
  blacklist: z.array(z.object({ phone: z.string(), why: z.string() })),
  emergency: z.array(z.object({ name: z.string(), phone: z.string(), note: z.string().optional() })),
  links: z.record(z.string(), z.string()),
  regions: z.array(z.string()),
});

export type Tier = z.infer<typeof Tier>;
export type Transport = z.infer<typeof Transport>;
export type Category = z.infer<typeof Category>;
export type Contact = z.infer<typeof Contact>;
export type Photo = z.infer<typeof Photo>;
export type MenuItem = z.infer<typeof MenuItem>;
export type Place = z.infer<typeof Place>;
export type Step = z.infer<typeof Step>;
export type DayPlan = z.infer<typeof DayPlan>;
export type Itinerary = z.infer<typeof Itinerary>;
export type MessageTemplate = z.infer<typeof MessageTemplate>;
export type BudgetLine = z.infer<typeof BudgetLine>;
export type Info = z.infer<typeof Info>;
