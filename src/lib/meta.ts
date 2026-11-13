import type { Category, Tier, Transport, DayPlan } from '../data/schema';

export const categoryMeta: Record<Category, { label: string; color: string; emoji: string }> = {
  beach: { label: 'Пляжи', color: '#0f8b8d', emoji: '🏖️' },
  animals: { label: 'Животные', color: '#c9792b', emoji: '🐾' },
  nature: { label: 'Природа', color: '#2f7d4a', emoji: '🌿' },
  culture: { label: 'Культура', color: '#8a5cb8', emoji: '🛕' },
  food: { label: 'Еда', color: '#e8684a', emoji: '🍽️' },
  spa: { label: 'СПА', color: '#c25b8f', emoji: '💆' },
  shop: { label: 'Покупки', color: '#b08a2e', emoji: '🛍️' },
  hotel: { label: 'Отель', color: '#1d5f8a', emoji: '🏨' },
  airport: { label: 'Аэропорт', color: '#5b6b78', emoji: '✈️' },
  medical: { label: 'Медицина', color: '#d23b3b', emoji: '🏥' },
};

export const tierMeta: Record<Tier, { label: string; short: string; className: string; order: number }> = {
  top: { label: 'Топ', short: '★ топ', className: 'bg-[#ffe3a3] text-[#7a4b00] dark:bg-[#5a4310] dark:text-[#ffd98a]', order: 0 },
  good: { label: 'Хорошо', short: 'хорошо', className: 'bg-[#d5efe0] text-[#1f5b36] dark:bg-[#1f4630] dark:text-[#b4e6c7]', order: 1 },
  optional: { label: 'По желанию', short: 'по желанию', className: 'bg-[#e9e3d8] text-[#5d564a] dark:bg-[#3a3a34] dark:text-[#d6d0c4]', order: 2 },
};

export const transportMeta: Record<Transport, { label: string; emoji: string }> = {
  walk: { label: 'пешком', emoji: '🚶' },
  tuktuk: { label: 'тук-тук', emoji: '🛺' },
  taxi_app: { label: 'такси PickMe/Uber', emoji: '🚕' },
  tuktuk_wait: { label: 'тук-тук с ожиданием', emoji: '🛺' },
  car_day: { label: 'машина на день', emoji: '🚙' },
  car_halfday: { label: 'машина на полдня', emoji: '🚙' },
  operator_pickup: { label: 'забирает оператор', emoji: '🚐' },
  transfer: { label: 'трансфер', emoji: '🚌' },
};

export const moodMeta: Record<DayPlan['mood'], { label: string; bg: string; fg: string }> = {
  active: { label: 'Активный', bg: 'linear-gradient(150deg,#ff9a76,#e8684a)', fg: '#fff' },
  easy: { label: 'Лёгкий', bg: 'linear-gradient(150deg,#5fd0c4,#0f8b8d)', fg: '#fff' },
  rest: { label: 'Отдых', bg: 'linear-gradient(150deg,#9bd88a,#2f7d4a)', fg: '#fff' },
  travel: { label: 'Дорога', bg: 'linear-gradient(150deg,#ffd27a,#e0a12c)', fg: '#3b2a00' },
};

export const stomachMeta = {
  ok: { label: 'мягко для желудка', emoji: '🟢', className: 'bg-[#d5efe0] text-[#1f5b36] dark:bg-[#1f4630] dark:text-[#b4e6c7]' },
  check: { label: 'уточнить, не остро', emoji: '🟡', className: 'bg-[#fff0c2] text-[#6b4d00] dark:bg-[#4d3d10] dark:text-[#ffe08a]' },
  spicy: { label: 'остро', emoji: '🌶️', className: 'bg-[#ffd9cc] text-[#8a2a10] dark:bg-[#5a2618] dark:text-[#ffb9a3]' },
  avoid: { label: 'не идём', emoji: '⛔', className: 'bg-[#ffd4d4] text-[#8a1010] dark:bg-[#5a1818] dark:text-[#ffb3b3]' },
} as const;

export const tripTypeMeta = {
  walk: { label: 'пешком', emoji: '🚶' },
  halfday: { label: 'полдня', emoji: '🌤️' },
  day: { label: 'на день', emoji: '☀️' },
  overnight: { label: 'с ночёвкой', emoji: '🌙' },
  far: { label: 'на будущее', emoji: '🧭' },
} as const;

const regionPalette = ['#0f8b8d', '#e8684a', '#2f7d4a', '#8a5cb8', '#c9792b', '#1d5f8a', '#c25b8f', '#6d8a1f', '#b0452f', '#3d6fb8', '#7a5a3a', '#4a9a8a'];
export function regionColor(region: string, regions: string[]): string {
  const i = regions.indexOf(region);
  return regionPalette[(i < 0 ? 0 : i) % regionPalette.length];
}
