/**
 * Синхронизация через Supabase (по флагу: есть VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY + код поездки).
 * Без ключей приложение работает локально. Свои фото не синхронизируются.
 */
import { dump, merge, onChange, deviceId, type Entry } from './store';

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const syncAvailable = !!(URL_ && KEY);

/** Что синкаем: галочки, оценки, заметки, траты, брони, меню, вишлист. */
const SYNC_PREFIXES = ['visited:', 'rating:', 'note:', 'spent:', 'expense:', 'booking:', 'bring:', 'menu:', 'wish:', 'addto:'];
export const isSynced = (key: string) => SYNC_PREFIXES.some((p) => key.startsWith(p));

interface Row { key: string; value: unknown; updated_at: number; device: string }

export type SyncState = { status: 'off' | 'idle' | 'syncing' | 'error'; lastSync?: number; error?: string; pulled?: number; pushed?: number };
let state: SyncState = { status: 'off' };
const listeners = new Set<(s: SyncState) => void>();
const setState = (s: Partial<SyncState>) => { state = { ...state, ...s }; listeners.forEach((l) => l(state)); };
export const getSyncState = () => state;
export const onSyncState = (l: (s: SyncState) => void) => { listeners.add(l); return () => listeners.delete(l); };

function headers(code: string): HeadersInit {
  return { apikey: KEY!, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', 'x-trip-code': code };
}

const LAST_PULL = 'sl-last-pull';
const PENDING = 'sl-pending';
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* */ } },
};

function pending(): Set<string> { return new Set(JSON.parse(ls.get(PENDING) ?? '[]')); }
function savePending(s: Set<string>) { ls.set(PENDING, JSON.stringify([...s])); }

export async function pull(code: string): Promise<number> {
  const since = Number(ls.get(LAST_PULL + code) ?? 0);
  const q = `${URL_}/rest/v1/progress?select=key,value,updated_at,device&trip_code=eq.${encodeURIComponent(code)}&updated_at=gt.${since}&order=updated_at.asc&limit=5000`;
  const res = await fetch(q, { headers: headers(code) });
  if (!res.ok) throw new Error(`pull ${res.status}`);
  const rows: Row[] = await res.json();
  const incoming: Record<string, Entry> = {};
  let max = since;
  for (const r of rows) {
    incoming[r.key] = { v: r.value, t: r.updated_at, d: r.device };
    max = Math.max(max, r.updated_at);
  }
  const n = merge(incoming);
  ls.set(LAST_PULL + code, String(max));
  return n;
}

export async function push(code: string, keys?: string[]): Promise<number> {
  const all = dump();
  const list = (keys ?? Object.keys(all)).filter((k) => isSynced(k) && all[k]);
  if (!list.length) return 0;
  const rows = list.map((k) => ({ key: k, value: all[k].v, updated_at: all[k].t, device: all[k].d }));
  const res = await fetch(`${URL_}/rest/v1/rpc/push_progress`, { method: 'POST', headers: headers(code), body: JSON.stringify({ rows }) });
  if (!res.ok) throw new Error(`push ${res.status}`);
  return list.length;
}

export async function syncNow(code: string, full = false) {
  if (!syncAvailable || !code) return setState({ status: 'off' });
  setState({ status: 'syncing', error: undefined });
  try {
    const p = pending();
    const pushed = await push(code, full ? undefined : [...p]);
    savePending(new Set());
    const pulled = await pull(code);
    setState({ status: 'idle', lastSync: Date.now(), pulled, pushed });
  } catch (e) {
    setState({ status: 'error', error: navigator.onLine ? (e as Error).message : 'нет сети' });
  }
}

let stop: (() => void) | null = null;

/** Запуск фоновой синхронизации: изменения отправляются через 2 с, опрос раз в 30 с и при возврате в приложение. */
export function startSync(code: string) {
  stop?.();
  if (!syncAvailable || !code) { setState({ status: 'off' }); return; }
  let t: ReturnType<typeof setTimeout> | undefined;
  const off = onChange((key) => {
    if (!isSynced(key)) return;
    const p = pending(); p.add(key); savePending(p);
    clearTimeout(t);
    t = setTimeout(() => syncNow(code), 2000);
  });
  const tick = () => document.visibilityState === 'visible' && syncNow(code);
  const iv = setInterval(tick, 30_000);
  addEventListener('online', tick);
  document.addEventListener('visibilitychange', tick);
  syncNow(code, !ls.get(LAST_PULL + code));
  stop = () => { off(); clearInterval(iv); clearTimeout(t); removeEventListener('online', tick); document.removeEventListener('visibilitychange', tick); };
}

export function randomTripCode(): string {
  const a = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => a[b % a.length]).join('').replace(/(.{4})(?=.)/g, '$1-');
}

/* ——— Экспорт / импорт ——— */

export interface ExportFile { app: 'sri-lanka-2027'; version: 1; exportedAt: string; device: string; entries: Record<string, Entry> }

export function exportData(): ExportFile {
  const entries = Object.fromEntries(Object.entries(dump()).filter(([k]) => isSynced(k) || k.startsWith('opened:')));
  return { app: 'sri-lanka-2027', version: 1, exportedAt: new Date().toISOString(), device: deviceId(), entries };
}

export function importData(json: unknown): number {
  const f = json as ExportFile;
  if (!f || f.app !== 'sri-lanka-2027' || typeof f.entries !== 'object') throw new Error('Это не файл прогресса поездки');
  return merge(f.entries);
}

async function gzip(s: string): Promise<Uint8Array> {
  const stream = new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function gunzip(b: Uint8Array): Promise<string> {
  const stream = new Blob([b as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}
const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

/** Ссылка для передачи прогресса на другой телефон (без сервера). */
export async function exportLink(): Promise<string> {
  const json = JSON.stringify(exportData());
  const payload = 'CompressionStream' in window ? 'z' + b64url(await gzip(json)) : 'j' + b64url(new TextEncoder().encode(json));
  return `${location.origin}${location.pathname}#/import?d=${payload}`;
}

export async function decodeLink(d: string): Promise<unknown> {
  const raw = unb64url(d.slice(1));
  return JSON.parse(d[0] === 'z' ? await gunzip(raw) : new TextDecoder().decode(raw));
}
