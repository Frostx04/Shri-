import { useEffect, useRef, useState } from 'react';
import { Download, Map, Check, HardDrive } from 'lucide-react';
import { Section } from '../../components/ui';
import { tileList, photoList, routeList, prefetch, cachedCount, storageInfo, fmtMb, AVG_TILE_KB, type Progress } from '../../lib/offline';
import { photoStats } from '../../lib/photos';

function Bar({ p }: { p: Progress }) {
  return (
    <div className="mt-2">
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={p.done} aria-valuemax={p.total}>
        <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${(p.done / Math.max(1, p.total)) * 100}%` }} />
      </div>
      <p className="mt-1 text-sm text-soft">{p.done} из {p.total} · {fmtMb(p.bytes)}{p.failed ? ` · не скачалось: ${p.failed}` : ''}</p>
    </div>
  );
}

export function OfflineSection() {
  const tiles = useRef(tileList()).current;
  const photos = useRef([...photoList(), ...routeList()]).current;
  const [tp, setTp] = useState<Progress | null>(null);
  const [pp, setPp] = useState<Progress | null>(null);
  const [cachedTiles, setCachedTiles] = useState(0);
  const [info, setInfo] = useState({ usage: 0, quota: 0, persisted: false });
  const [own, setOwn] = useState({ count: 0, bytes: 0 });
  const [online, setOnline] = useState(navigator.onLine);

  const refresh = async () => {
    setCachedTiles(await cachedCount('osm-tiles'));
    setInfo(await storageInfo());
    setOwn(await photoStats());
  };
  useEffect(() => {
    refresh();
    const on = () => setOnline(navigator.onLine);
    addEventListener('online', on); addEventListener('offline', on);
    return () => { removeEventListener('online', on); removeEventListener('offline', on); };
  }, []);

  const run = async (kind: 'tiles' | 'photos') => {
    await navigator.storage?.persist?.().catch(() => false);
    if (kind === 'tiles') await prefetch('osm-tiles', tiles, setTp, { concurrency: 2 });
    else await prefetch('photos', photos, setPp, { concurrency: 4 });
    refresh();
  };

  return (
    <Section title="Офлайн">
      <div className="card space-y-4 p-4">
        {!online && <p className="rounded-xl bg-[#fff4d1] p-2 text-sm text-[#5c4300]">Сейчас нет сети — скачать не получится.</p>}
        <div>
          <p className="flex items-center gap-2 font-bold"><Map size={18} className="text-accent" /> Карта района</p>
          <p className="text-sm text-soft">Галле — Матара — Удавалаве, ~{tiles.length} тайлов, ≈{fmtMb(tiles.length * AVG_TILE_KB * 1024)}. Уже в кеше: {cachedTiles}.</p>
          {tp ? <Bar p={tp} /> : (
            <button className="btn mt-2 w-full" disabled={!online} onClick={() => run('tiles')}><Download size={18} /> Скачать карту района</button>
          )}
          {tp && tp.done === tp.total && <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[var(--color-jungle)]"><Check size={16} /> Готово</p>}
        </div>
        <div>
          <p className="flex items-center gap-2 font-bold"><Download size={18} className="text-accent" /> Фото мест и маршруты</p>
          <p className="text-sm text-soft">Превью кешируются всегда; большие фото — при открытии. Кнопка скачает всё ({photos.length} файлов).</p>
          {pp ? <Bar p={pp} /> : <button className="btn mt-2 w-full" disabled={!online} onClick={() => run('photos')}><Download size={18} /> Скачать всё для офлайна</button>}
        </div>
        <p className="flex items-start gap-2 text-sm text-soft">
          <HardDrive size={16} className="mt-0.5 shrink-0" />
          Занято: {fmtMb(info.usage)}{info.quota ? ` из ${fmtMb(info.quota)}` : ''}. Свои фото: {own.count} ({fmtMb(own.bytes)}). {info.persisted ? 'Хранилище защищено от очистки.' : 'Браузер может очистить кеш при нехватке места.'}
        </p>
      </div>
    </Section>
  );
}
