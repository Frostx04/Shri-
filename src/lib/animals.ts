import type { Animal } from '../data/schema';
import { animals, placeById, plannedPlaceIds } from './data';
import { get, K, type AnimalSeen } from './store';

export const groupMeta: Record<Animal['group'], { label: string; emoji: string }> = {
  mammals: { label: 'Звери', emoji: '🐘' },
  reptiles: { label: 'Рептилии', emoji: '🐢' },
  birds: { label: 'Птицы', emoji: '🦚' },
  sea: { label: 'В море', emoji: '🐠' },
  other: { label: 'Букашки и лягушки', emoji: '🦋' },
};

export type Family = Animal['family'];

/** Семейства — плитки меню «Зверушки». Порядок = порядок в меню. */
export const familyMeta: Record<Family, { label: string; emoji: string; color: string; blurb: string; cover: string }> = {
  squirrels: { label: 'Белки', emoji: '🐿️', color: '#c9792b', blurb: 'Гигантские белки, летяги и полосатые малыши', cover: 'giant-squirrel' },
  bats: { label: 'Летучие лисицы и крыланы', emoji: '🦇', color: '#5b4a8a', blurb: 'Фруктовые летучие мыши — тысячи над лагуной на закате', cover: 'flying-fox' },
  primates: { label: 'Обезьяны и лори', emoji: '🐒', color: '#a0662f', blurb: 'Макаки-воришки, лангуры и глазастый лори', cover: 'purple-faced-langur' },
  elephants: { label: 'Слоны', emoji: '🐘', color: '#6d7a80', blurb: 'Стада Удавалаве и слонята-сироты', cover: 'baby-elephant' },
  turtles: { label: 'Черепахи', emoji: '🐢', color: '#0f8b8d', blurb: 'Морские черепахи у берега и сухопутные', cover: 'green-turtle' },
  lizards: { label: 'Вараны и ящерицы', emoji: '🦎', color: '#5f8a2f', blurb: 'От гекконов на стене до двухметровых варанов', cover: 'water-monitor' },
  crocs: { label: 'Крокодилы', emoji: '🐊', color: '#4f6b3a', blurb: 'Гребнистые гиганты реки Нилвала', cover: 'saltwater-croc' },
  snakes: { label: 'Змеи', emoji: '🐍', color: '#3f7d5a', blurb: 'Смотрим издалека — с гидом и на ферме', cover: 'green-pit-viper' },
  'birds-forest': { label: 'Птицы леса и сада', emoji: '🦚', color: '#2f6fa8', blurb: 'Павлины, щурки, попугаи и райская мухоловка', cover: 'peacock' },
  'birds-water': { label: 'Птицы у воды', emoji: '🦩', color: '#c25b8f', blurb: 'Цапли, аисты, пеликаны и зимородки', cover: 'painted-stork' },
  hoofed: { label: 'Олени, буйволы, кабаны', emoji: '🦌', color: '#8a6a3b', blurb: 'Олени-«бэмби» и буйволы в воде', cover: 'spotted-deer' },
  predators: { label: 'Хищники', emoji: '🐆', color: '#b0452f', blurb: 'Леопард, шакалы, мангусты и кошка-рыболов', cover: 'leopard' },
  nocturnal: { label: 'Ночные и необычные', emoji: '🦔', color: '#4a4a6a', blurb: 'Дикобразы, панголины и зайцы на ночной дороге', cover: 'porcupine' },
  sea: { label: 'В море', emoji: '🐠', color: '#1d6fa8', blurb: 'Рыбки, крабы, осьминоги и даже киты', cover: 'reef-fish' },
  bugs: { label: 'Букашки', emoji: '🦋', color: '#b08a2e', blurb: 'Бабочки-гиганты, светлячки и пиявки', cover: 'birdwing' },
  frogs: { label: 'Лягушки', emoji: '🐸', color: '#3f8f3f', blurb: 'Квакши, жабы и лесные лягушки', cover: 'tree-frog' },
  friends: { label: 'Друзья из приюта', emoji: '🐶', color: '#e8684a', blurb: 'Собаки и кошки Animal SOS — их можно гладить!', cover: 'sos-dogs' },
};
export const familyOrder = Object.keys(familyMeta) as Family[];
export const familyAnimals = (f: Family) => animals.filter((a) => a.family === f);
const chanceRank = { high: 0, medium: 1, low: 2 } as const;
export const byChance = (a: Animal, b: Animal) => chanceRank[a.chance] - chanceRank[b.chance];

/** «Звезда дня» — меняется каждый день, чаще белки и летучие лисицы. */
export function starOfDay(date: string): Animal {
  const pool = animals.filter((a) => a.photos.length && (a.family === 'squirrels' || a.family === 'bats' || a.chance !== 'low'));
  const n = [...date].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) >>> 0;
  return pool[n % pool.length];
}

export const chanceMeta: Record<Animal['chance'], { label: string; className: string }> = {
  high: { label: 'точно увидим', className: 'bg-[#d5efe0] text-[#1f5b36] dark:bg-[#1f4630] dark:text-[#b4e6c7]' },
  medium: { label: 'если повезёт', className: 'bg-[#fff0c2] text-[#6b4d00] dark:bg-[#4d3d10] dark:text-[#ffe08a]' },
  low: { label: 'редкость', className: 'bg-[#f1e1f7] text-[#5f2d78] dark:bg-[#3c2348] dark:text-[#e4c3f2]' },
};

const planned = new Set(plannedPlaceIds);
/** Можно встретить в нашей поездке (есть хотя бы одно место из плана). */
export const inTrip = (a: Animal) => a.where.some((w) => planned.has(w) || w === 'hotel' || placeById.get(w)?.inPlan);

export const tripAnimals = () => animals.filter(inTrip);
export const seenOf = (id: string) => get<AnimalSeen>(K.animal(id));
export const seenCount = (list: Animal[] = animals) => list.filter((a) => seenOf(a.id)).length;

/** Уровни шкалы: сколько зверушек нужно увидеть. */
export const LEVELS = [
  { n: 1, emoji: '👀', title: 'Первая встреча' },
  { n: 5, emoji: '🌱', title: 'Юный натуралист' },
  { n: 12, emoji: '🦎', title: 'Следопыт' },
  { n: 20, emoji: '🐘', title: 'Знаток джунглей' },
  { n: 30, emoji: '🦚', title: 'Повелитель сафари' },
  { n: 45, emoji: '🦇', title: 'Подруга летучих лисиц' },
  { n: 60, emoji: '👑', title: 'Королева зверушек' },
];

export function levelFor(n: number) {
  let cur = null as (typeof LEVELS)[number] | null;
  for (const l of LEVELS) if (n >= l.n) cur = l;
  const next = LEVELS.find((l) => l.n > n) ?? null;
  return { cur, next };
}
