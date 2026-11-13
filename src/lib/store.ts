/**
 * Прогресс поездки: галочки, оценки, заметки, траты, статусы броней…
 * Хранится в IndexedDB как пары key → { v, t, d } (значение, время изменения, устройство).
 * Last-write-wins по t — это же используется для синхронизации и импорта.
 */
import { createStore, entries, set as idbSet, del as idbDel, clear as idbClear } from 'idb-keyval';
import { useSyncExternalStore } from 'react';

export interface Entry<T = unknown> { v: T | null; t: number; d: string }

const idb = typeof indexedDB !== 'undefined' ? createStore('sri-lanka-2027', 'progress') : null;
const data = new Map<string, Entry>();
const listeners = new Set<() => void>();
const changeHooks = new Set<(key: string, e: Entry) => void>();
let version = 0;
let loaded = false;

export function deviceId(): string {
  try {
    let id = localStorage.getItem('sl-device');
    if (!id) {
      id = Math.random().toString(36).slice(2, 8);
      localStorage.setItem('sl-device', id);
    }
    return id;
  } catch {
    return 'local';
  }
}

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export async function loadStore() {
  if (loaded || !idb) { loaded = true; return; }
  try {
    for (const [k, e] of await entries<string, Entry>(idb)) data.set(k, e);
  } catch (err) {
    console.warn('IndexedDB недоступен', err);
  }
  loaded = true;
  emit();
}

export function get<T>(key: string): T | undefined {
  const e = data.get(key);
  return e && e.v !== null ? (e.v as T) : undefined;
}

/** Записать значение (null/undefined = удалить, но оставить «надгробие» для синхронизации). */
export function set<T>(key: string, value: T | null | undefined, opts: { t?: number; d?: string; silent?: boolean } = {}) {
  const e: Entry = { v: value ?? null, t: opts.t ?? Date.now(), d: opts.d ?? deviceId() };
  data.set(key, e);
  if (idb) idbSet(key, e, idb).catch(() => {});
  emit();
  if (!opts.silent) changeHooks.forEach((h) => h(key, e));
}

/** Слить внешние записи (импорт/синк): побеждает более позднее t. Возвращает число применённых. */
export function merge(incoming: Record<string, Entry>): number {
  let n = 0;
  for (const [k, e] of Object.entries(incoming)) {
    const cur = data.get(k);
    if (!cur || e.t > cur.t) {
      data.set(k, e);
      if (idb) idbSet(k, e, idb).catch(() => {});
      n++;
    }
  }
  if (n) emit();
  return n;
}

export function dump(): Record<string, Entry> {
  return Object.fromEntries(data);
}

export async function resetAll() {
  data.clear();
  if (idb) await idbClear(idb);
  emit();
}

export function keys(prefix: string): string[] {
  return [...data.keys()].filter((k) => k.startsWith(prefix) && data.get(k)!.v !== null);
}

export function onChange(h: (key: string, e: Entry) => void) {
  changeHooks.add(h);
  return () => changeHooks.delete(h);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Подписка на весь стор (перерисовка при любом изменении). */
export function useStoreVersion() {
  return useSyncExternalStore(subscribe, () => version);
}

export function useValue<T>(key: string): [T | undefined, (v: T | null | undefined) => void] {
  useStoreVersion();
  return [get<T>(key), (v) => set(key, v)];
}

export const isLoaded = () => loaded;
export const _rawDelete = (k: string) => { data.delete(k); if (idb) idbDel(k, idb); emit(); };

/* ——— Ключи ——— */
export const K = {
  visited: (placeId: string) => `visited:${placeId}`,          // { at: ISO-дата }
  rating: (placeId: string) => `rating:${placeId}`,            // 1..5
  placeNote: (placeId: string) => `note:place:${placeId}`,
  dayNote: (date: string) => `note:day:${date}`,
  daySpent: (date: string) => `spent:day:${date}`,             // ₨
  bring: (placeId: string, i: number) => `bring:${placeId}:${i}`,
  booking: (placeId: string) => `booking:${placeId}`,           // BookingStatus
  expense: (id: string) => `expense:${id}`,                     // Expense
  menu: (placeId: string) => `menu:${placeId}`,                 // MenuItem[]
  wish: (placeId: string) => `wish:${placeId}`,                 // true
  addTo: (placeId: string) => `addto:${placeId}`,               // date
  opened: (date: string) => `opened:${date}`,                   // true — дверка открыта, конфетти уже было
  photos: (placeId: string) => `photos:${placeId}`,             // string[] id фото (локально)
  animal: (id: string) => `animal:${id}`,                       // AnimalSeen
};

export interface Visit { at: string }
export interface AnimalSeen { at: string; placeId?: string; note?: string }
export type BookingStatus = 'none' | 'written' | 'confirmed' | 'paid';
export interface Expense { title: string; lkr: number; date: string; budgetId: string }
