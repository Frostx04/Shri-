import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { Animal } from '../data/schema';
import { animals } from '../lib/data';
import { useStoreVersion } from '../lib/store';
import { seenOf } from '../lib/animals';
import { AnimalSheet } from './AnimalSheet';

/** «Кого здесь можно встретить»: чипсы с фото; тап — карточка с кнопкой «Увидели». */
export function AnimalChips({ placeIds, title = 'Кого можно встретить' }: { placeIds: string[]; title?: string }) {
  useStoreVersion();
  const [open, setOpen] = useState<Animal | null>(null);
  const list = animals.filter((a) => a.where.some((w) => placeIds.includes(w)));
  if (!list.length) return null;
  const seen = list.filter((a) => seenOf(a.id)).length;
  return (
    <section className="px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[1.15rem]">🐾 {title}</h2>
        <Link to="/animals" className="text-sm font-bold text-accent">{seen}/{list.length} →</Link>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {list.map((a) => {
          const s = !!seenOf(a.id);
          return (
            <button key={a.id} onClick={() => setOpen(a)} className="relative w-[5.5rem] shrink-0 text-center" aria-label={`${a.name}${s ? ', увидели' : ''}`}>
              <div className={`relative mx-auto h-[5.5rem] w-[5.5rem] overflow-hidden rounded-2xl border-2 ${s ? 'border-[var(--color-jungle)]' : 'border-transparent'}`}>
                {a.photos[0] ? <img src={import.meta.env.BASE_URL + (a.photos[0].thumb ?? a.photos[0].src)} alt="" loading="lazy" className={`h-full w-full object-cover ${s ? '' : 'opacity-90'}`} />
                  : <div className="grid h-full w-full place-items-center bg-surface-2 text-4xl">{a.emoji}</div>}
                {s && <span className="pop absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--color-jungle)] text-white"><Check size={15} strokeWidth={3.5} /></span>}
              </div>
              <span className="mt-1 block text-[0.75rem] font-semibold leading-tight">{a.name}</span>
            </button>
          );
        })}
      </div>
      <AnimalSheet a={open} onClose={() => setOpen(null)} placeHint={placeIds.length === 1 ? placeIds[0] : undefined} />
    </section>
  );
}
