/** Свои фото: сжимаем до ~1600px JPEG и храним локально в IndexedDB (не синхронизируются). */
import { createStore, set, get, del, keys } from 'idb-keyval';
import { useEffect, useState, useSyncExternalStore } from 'react';

const store = typeof indexedDB !== 'undefined' ? createStore('sri-lanka-2027-photos', 'photos') : null;
let version = 0;
const listeners = new Set<() => void>();
const bump = () => { version++; listeners.forEach((l) => l()); };

export interface OwnPhoto { id: string; placeId: string; url: string; at: number }
interface Stored { blob: Blob; at: number }

export async function compressImage(file: Blob, max = 1600, quality = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(file).catch(() => null);
  let w: number, h: number, src: CanvasImageSource;
  if (bmp) { w = bmp.width; h = bmp.height; src = bmp; }
  else {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();
    w = img.naturalWidth; h = img.naturalHeight; src = img;
  }
  const k = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k); c.height = Math.round(h * k);
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', quality));
}

export async function addPhotos(placeId: string, files: FileList | File[]) {
  if (!store) return;
  for (const f of Array.from(files)) {
    const blob = await compressImage(f);
    const id = `${placeId}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await set(id, { blob, at: Date.now() } satisfies Stored, store);
  }
  bump();
}

export async function deletePhoto(id: string) {
  if (!store) return;
  await del(id, store);
  bump();
}

export async function listPhotos(placeIds: string[]): Promise<OwnPhoto[]> {
  if (!store) return [];
  const all = (await keys(store)) as string[];
  const out: OwnPhoto[] = [];
  for (const k of all) {
    const pid = k.split('/')[0];
    if (!placeIds.includes(pid)) continue;
    const s = await get<Stored>(k, store);
    if (s) out.push({ id: k, placeId: pid, url: URL.createObjectURL(s.blob), at: s.at });
  }
  return out.sort((a, b) => a.at - b.at);
}

export async function photoStats() {
  if (!store) return { count: 0, bytes: 0 };
  const all = (await keys(store)) as string[];
  let bytes = 0;
  for (const k of all) bytes += (await get<Stored>(k, store))?.blob.size ?? 0;
  return { count: all.length, bytes };
}

const sub = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useOwnPhotos(placeIds: string[]): OwnPhoto[] {
  const v = useSyncExternalStore(sub, () => version);
  const [photos, setPhotos] = useState<OwnPhoto[]>([]);
  const key = placeIds.join(',');
  useEffect(() => {
    let alive = true;
    let urls: OwnPhoto[] = [];
    listPhotos(placeIds).then((p) => { urls = p; if (alive) setPhotos(p); });
    return () => { alive = false; urls.forEach((p) => URL.revokeObjectURL(p.url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, v]);
  return photos;
}
