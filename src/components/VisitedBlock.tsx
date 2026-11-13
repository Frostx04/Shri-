import { Check, CalendarDays } from 'lucide-react';
import type { Place } from '../data/schema';
import { useValue, K, type Visit } from '../lib/store';
import { useToday } from '../lib/settings';
import { formatDayRu } from '../lib/time';
import { Stars } from './Stars';
import { OwnPhotos } from './OwnPhotos';

export function VisitedBlock({ place }: { place: Place }) {
  const [visit, setVisit] = useValue<Visit>(K.visited(place.id));
  const [rating, setRating] = useValue<number>(K.rating(place.id));
  const [note, setNote] = useValue<string>(K.placeNote(place.id));
  const { date } = useToday();
  if (place.avoid) return null;
  return (
    <section className={`card mx-4 mt-4 space-y-3 p-4 ${visit ? 'border-[var(--color-jungle)]' : ''}`}>
      <button onClick={() => setVisit(visit ? null : { at: date })} aria-pressed={!!visit}
        className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left font-bold transition-colors ${visit ? 'bg-[var(--color-jungle)] text-white' : 'bg-surface-2'}`}>
        <span className={`grid h-8 w-8 place-items-center rounded-lg border-2 ${visit ? 'pop border-white' : 'border-current opacity-60'}`}>
          {visit && <Check size={20} strokeWidth={3.5} />}
        </span>
        <span className="flex-1 text-lg">{visit ? 'Мы тут были!' : 'Мы тут были?'}</span>
      </button>
      {visit && (
        <>
          <label className="flex items-center gap-2 text-sm text-soft">
            <CalendarDays size={16} /> Когда:
            <input type="date" value={visit.at} min="2027-03-13" max="2027-03-24" onChange={(e) => e.target.value && setVisit({ at: e.target.value })}
              className="rounded-lg border border-line bg-surface-2 px-2 py-1 font-semibold text-[var(--fg)]" aria-label="Дата посещения" />
            <span className="hidden sm:inline">{formatDayRu(visit.at)}</span>
          </label>
          <div>
            <p className="text-sm font-semibold text-soft">Наша оценка</p>
            <Stars value={rating} onChange={setRating} />
          </div>
        </>
      )}
      <label className="block">
        <span className="text-sm font-semibold text-soft">Заметка</span>
        <textarea value={note ?? ''} onChange={(e) => setNote(e.target.value || null)} rows={2} placeholder="Впечатления, что не забыть…"
          className="mt-1 w-full rounded-xl border border-line bg-surface-2 p-3" />
      </label>
      <OwnPhotos placeId={place.id} />
    </section>
  );
}

export function BringList({ place }: { place: Place }) {
  return (
    <ul className="space-y-1.5">
      {place.bring.map((b, i) => <BringItem key={i} placeId={place.id} i={i} label={b} />)}
    </ul>
  );
}

function BringItem({ placeId, i, label }: { placeId: string; i: number; label: string }) {
  const [on, setOn] = useValue<boolean>(K.bring(placeId, i));
  return (
    <li>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-3">
        <input type="checkbox" checked={!!on} onChange={(e) => setOn(e.target.checked || null)} className="h-5 w-5 accent-[var(--color-jungle)]" />
        <span className={on ? 'text-soft line-through' : ''}>{label}</span>
      </label>
    </li>
  );
}
