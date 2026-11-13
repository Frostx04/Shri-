import { Link } from 'react-router-dom';
import { Check, MapPin } from 'lucide-react';
import type { Animal } from '../data/schema';
import { getPlace } from '../lib/data';
import { chanceMeta } from '../lib/animals';
import { useValue, K, type AnimalSeen } from '../lib/store';
import { useToday } from '../lib/settings';
import { photoUrl } from './PlaceVisual';
import { Sheet } from './Sheet';

const PROVIDER: Record<string, string> = { wikimedia: 'Wikimedia Commons', inaturalist: 'iNaturalist', openverse: 'Flickr / Openverse', google: 'Google Maps', own: 'наше фото' };

export function AnimalPhoto({ a, className = '' }: { a: Animal; className?: string }) {
  const ph = a.photos[0];
  return (
    <div className={`overflow-hidden ${className}`}>
      {ph ? <img src={photoUrl(ph.thumb ?? ph.src)} alt={a.name} loading="lazy" className="h-full w-full object-cover" />
        : <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_25%,#5fd0c455,transparent_60%),linear-gradient(140deg,#2f7d4a33,#0f8b8d66)] text-5xl" aria-hidden>{a.emoji}</div>}
    </div>
  );
}

export function useAnimalSeen(id: string) {
  const [seen, setSeen] = useValue<AnimalSeen>(K.animal(id));
  const { date } = useToday();
  const toggle = (placeId?: string) => setSeen(seen ? null : { at: date, placeId });
  return { seen, setSeen, toggle };
}

export function AnimalSheet({ a, onClose, placeHint }: { a: Animal | null; onClose: () => void; placeHint?: string }) {
  return (
    <Sheet open={!!a} onClose={onClose} label={a?.name ?? 'Зверушка'}>
      {a && <AnimalDetails a={a} placeHint={placeHint} />}
    </Sheet>
  );
}

function AnimalDetails({ a, placeHint }: { a: Animal; placeHint?: string }) {
  const { seen, setSeen, toggle } = useAnimalSeen(a.id);
  const ph = a.photos[0];
  return (
    <div className="space-y-3">
      <div className="-mx-4 -mt-2 aspect-[4/3] overflow-hidden">
        {ph ? <img src={photoUrl(ph.src)} alt={a.name} className="h-full w-full object-cover" /> : <AnimalPhoto a={a} className="h-full w-full" />}
      </div>
      {ph && <p className="-mt-2 truncate text-[0.7rem] text-soft">© {ph.author} · {ph.license} · {PROVIDER[ph.provider ?? 'wikimedia'] ?? ''}</p>}
      <div>
        <h2 className="text-2xl">{a.emoji} {a.name}</h2>
        <p className="text-sm italic text-soft">{a.latin}</p>
      </div>
      <span className={`chip ${chanceMeta[a.chance].className}`}>{chanceMeta[a.chance].label}</span>
      {a.note && <p>{a.note}</p>}
      <div>
        <p className="mb-1.5 text-sm font-semibold text-soft">Где можно встретить</p>
        <div className="flex flex-wrap gap-1.5">
          {a.where.map((w) => { const p = getPlace(w); return p ? <Link key={w} to={`/place/${w}`} className="chip"><MapPin size={14} /> {p.name}</Link> : null; })}
        </div>
      </div>
      <button onClick={() => toggle(placeHint)} aria-pressed={!!seen}
        className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left text-lg font-bold ${seen ? 'bg-[var(--color-jungle)] text-white' : 'bg-surface-2'}`}>
        <span className={`grid h-8 w-8 place-items-center rounded-lg border-2 ${seen ? 'pop border-white' : 'border-current opacity-60'}`}>{seen && <Check size={20} strokeWidth={3.5} />}</span>
        {seen ? 'Увидели!' : 'Мы его увидели'}
      </button>
      {seen && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-soft">Когда:
            <input type="date" value={seen.at} onChange={(e) => e.target.value && setSeen({ ...seen, at: e.target.value })}
              className="rounded-lg border border-line bg-surface-2 px-2 py-1 font-semibold text-[var(--fg)]" aria-label="Дата встречи" />
          </label>
          <label className="flex items-center gap-2 text-sm text-soft">Где:
            <select value={seen.placeId ?? ''} onChange={(e) => setSeen({ ...seen, placeId: e.target.value || undefined })}
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2 py-1 font-semibold text-[var(--fg)]" aria-label="Место встречи">
              <option value="">— не важно —</option>
              {a.where.map((w) => <option key={w} value={w}>{getPlace(w)?.name ?? w}</option>)}
            </select>
          </label>
          <textarea value={seen.note ?? ''} onChange={(e) => setSeen({ ...seen, note: e.target.value || undefined })} rows={2} placeholder="Как это было…"
            className="w-full rounded-xl border border-line bg-surface-2 p-3" aria-label="Заметка о встрече" />
        </div>
      )}
    </div>
  );
}
