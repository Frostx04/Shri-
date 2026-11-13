import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { places, info, itineraries } from '../lib/data';
import { regionColor, tripTypeMeta } from '../lib/meta';
import { get, K, useStoreVersion } from '../lib/store';
import { PlaceRow, distanceFromHotel } from './Places';
import { PlanButtons } from '../components/PlanButtons';

const CountryMap = lazy(() => import('../components/map/CountryMap'));
type TT = keyof typeof tripTypeMeta;

export default function CountryView({ q }: { q: string }) {
  useStoreVersion();
  const [tt, setTt] = useState<TT | null>(null);
  const [wishOnly, setWishOnly] = useState(false);
  const country = useMemo(() => places.filter((p) => p.region !== 'Мирисса' && p.category !== 'food'), []);
  const ql = q.trim().toLowerCase();
  const list = country.filter((p) =>
    (!tt || p.tripType === tt) && (!wishOnly || get(K.wish(p.id))) &&
    (!ql || [p.name, p.nameLocal, p.region, ...p.why].join(' ').toLowerCase().includes(ql)));
  const regions = info.regions.filter((r) => list.some((p) => p.region === r));

  return (
    <div>
      <Suspense fallback={<div className="h-[48dvh] animate-pulse bg-surface-2" />}><CountryMap list={list} /></Suspense>
      <div className="space-y-2 px-4 pt-3">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
          {(Object.keys(tripTypeMeta) as TT[]).filter((t) => country.some((p) => p.tripType === t)).map((t) => (
            <button key={t} onClick={() => setTt(tt === t ? null : t)} aria-pressed={tt === t} className={`chip min-h-9 ${tt === t ? 'bg-[var(--accent)] text-white' : ''}`}>
              {tripTypeMeta[t].emoji} {tripTypeMeta[t].label}
            </button>
          ))}
          <button onClick={() => setWishOnly(!wishOnly)} aria-pressed={wishOnly} className={`chip min-h-9 ${wishOnly ? 'bg-[var(--color-coral)] text-white' : ''}`}><Heart size={14} /> Вишлист</button>
        </div>
      </div>

      {itineraries.length > 0 && !ql && (
        <section className="px-4 pt-4">
          <h2 className="mb-2 text-xl">🗺️ Мини-маршруты</h2>
          <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {itineraries.map((it) => (
              <Link key={it.id} to={`/itinerary/${it.id}`} className="card w-60 shrink-0 snap-start p-3">
                <div className="text-3xl">{it.emoji}</div>
                <p className="mt-1 font-bold leading-snug">{it.title}</p>
                <p className="text-sm text-soft">{it.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {regions.map((r) => (
        <section key={r} className="px-4 pt-5">
          <h2 className="mb-2 flex items-center gap-2 text-xl"><span className="h-3.5 w-3.5 rounded-full" style={{ background: regionColor(r, info.regions) }} />{r}</h2>
          <ul className="space-y-2.5">
            {list.filter((p) => p.region === r).sort((a, b) => distanceFromHotel(a) - distanceFromHotel(b)).map((p) => (
              <li key={p.id} className="space-y-1.5">
                <PlaceRow p={p} right={p.tripType ? <span className="shrink-0 text-sm" title={tripTypeMeta[p.tripType].label}>{tripTypeMeta[p.tripType].emoji}</span> : undefined} />
                <div className="flex items-center gap-2 pl-1">
                  {p.driveHours && <span className="text-sm text-soft">🚗 ~{p.driveHours} ч</span>}
                  <div className="ml-auto"><PlanButtons place={p} compact /></div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {list.length === 0 && <p className="p-8 text-center text-soft">Ничего не нашлось</p>}
    </div>
  );
}
