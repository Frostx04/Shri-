import { useState } from 'react';
import { Heart, CalendarPlus } from 'lucide-react';
import type { Place } from '../data/schema';
import { useValue, K } from '../lib/store';
import { days } from '../lib/data';
import { formatDayRu, formatShort } from '../lib/time';
import { Sheet } from './Sheet';

/** «Добавить в план на день…» и «Хочу в следующий раз». */
export function PlanButtons({ place, compact }: { place: Place; compact?: boolean }) {
  const [wish, setWish] = useValue<boolean>(K.wish(place.id));
  const [addTo, setAddTo] = useValue<string>(K.addTo(place.id));
  const [pick, setPick] = useState(false);
  const cls = compact ? 'btn min-h-10 px-3 text-sm' : 'btn';
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        <button className={`${cls} ${addTo ? 'bg-[var(--accent)] text-white' : ''}`} onClick={(e) => { e.preventDefault(); setPick(true); }}>
          <CalendarPlus size={16} /> {addTo ? `В плане ${formatShort(addTo)}` : 'В план на день…'}
        </button>
        <button className={`${cls} ${wish ? 'bg-[var(--color-coral)] text-white' : ''}`} aria-pressed={!!wish} onClick={(e) => { e.preventDefault(); setWish(wish ? null : true); }}>
          <Heart size={16} className={wish ? 'fill-current' : ''} /> {wish ? 'В вишлисте' : 'В следующий раз'}
        </button>
      </div>
      <Sheet open={pick} onClose={() => setPick(false)} label="Выбрать день">
        <h2 className="mb-3 text-xl">Добавить «{place.name}» в день</h2>
        {place.driveHours && place.driveHours > 3 && <p className="mb-2 rounded-xl bg-[#fff4d1] p-2 text-sm text-[#5c4300]">Дорога ~{place.driveHours} ч в одну сторону — лучше с ночёвкой.</p>}
        <ul className="space-y-1.5">
          {days.slice(1, -1).map((d) => (
            <li key={d.date}>
              <button className={`btn w-full justify-start ${addTo === d.date ? 'btn-primary' : ''}`} onClick={() => { setAddTo(d.date); setPick(false); }}>
                {d.emoji} {formatDayRu(d.date)} <span className="truncate font-normal opacity-75">— {d.title}</span>
              </button>
            </li>
          ))}
        </ul>
        {addTo && <button className="btn mt-3 w-full" onClick={() => { setAddTo(null); setPick(false); }}>Убрать из плана</button>}
      </Sheet>
    </>
  );
}
