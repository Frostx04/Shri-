import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import type { Place, Category, Tier } from '../data/schema';
import { places, daysForPlace, hotel } from '../lib/data';
import { categoryMeta, tierMeta, stomachMeta } from '../lib/meta';
import { haversineKm } from '../lib/geo';
import { formatShort } from '../lib/time';
import { PageHeader } from '../components/ui';
import { PlaceThumb } from '../components/PlaceVisual';
import { TierBadge, Cost, StomachBadge } from '../components/Badges';
import FoodView from './FoodView';
import CountryView from './CountryView';

type Sort = 'day' | 'tier' | 'distance';

export function distanceFromHotel(p: Place): number {
  if (p.distanceKm != null) return p.distanceKm;
  if (p.coords && hotel.coords) return haversineKm(hotel.coords, p.coords) * 1.3; // дорога ~ +30% к прямой
  return Infinity;
}

function firstDay(p: Place) {
  return daysForPlace.get(p.id)?.[0] ?? '9999';
}

export function PlaceRow({ p, right }: { p: Place; right?: React.ReactNode }) {
  const d = daysForPlace.get(p.id);
  const dist = distanceFromHotel(p);
  return (
    <Link to={`/place/${p.id}`} className={`card flex gap-3 p-2.5 active:scale-[0.99] transition-transform ${p.avoid ? 'border-[#e05a5a]' : ''}`}>
      <PlaceThumb place={p} className="h-20 w-20 shrink-0 rounded-[14px]" />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans text-[1rem] font-bold leading-snug">{p.name}</h3>
          {right}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.8rem]">
          <TierBadge tier={p.tier} />
          {p.stomach && p.category === 'food' && <span title={stomachMeta[p.stomach].label}>{stomachMeta[p.stomach].emoji}</span>}
          {d && <span className="chip bg-[var(--accent)]/15 text-accent">📅 {d.map(formatShort).join(', ')}</span>}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 text-[0.82rem] text-soft">
          {isFinite(dist) && p.id !== 'hotel' && <span>{dist < 10 ? dist.toFixed(1) : Math.round(dist)} км</span>}
          <Cost lkr={p.costLkr} usd={p.costUsd} />
        </div>
      </div>
    </Link>
  );
}

const cats = Object.keys(categoryMeta) as Category[];

export default function Places() {
  const [sp, setSp] = useSearchParams();
  const view = (sp.get('view') ?? 'trip') as 'trip' | 'food' | 'country';
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [sort, setSort] = useState<Sort>('day');

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let l = places.filter((p) => p.region === 'Мирисса' && p.category !== 'food' || p.inPlan);
    if (cat) l = l.filter((p) => p.category === cat);
    if (tier) l = l.filter((p) => p.tier === tier);
    if (ql) l = l.filter((p) => [p.name, p.nameLocal, p.region, p.cuisine, ...p.why].join(' ').toLowerCase().includes(ql));
    const cmp: Record<Sort, (a: Place, b: Place) => number> = {
      day: (a, b) => firstDay(a).localeCompare(firstDay(b)) || tierMeta[a.tier].order - tierMeta[b.tier].order,
      tier: (a, b) => tierMeta[a.tier].order - tierMeta[b.tier].order || distanceFromHotel(a) - distanceFromHotel(b),
      distance: (a, b) => distanceFromHotel(a) - distanceFromHotel(b),
    };
    return [...l].sort(cmp[sort]);
  }, [q, cat, tier, sort]);

  const avoid = list.filter((p) => p.avoid);
  const normal = list.filter((p) => !p.avoid);

  return (
    <div>
      <PageHeader title={view === 'food' ? 'Еда' : view === 'country' ? 'Вся Шри-Ланка' : 'Места'} />
      <div className="sticky top-0 z-10 space-y-2 bg-[var(--bg)]/95 px-4 pb-2 pt-1 backdrop-blur">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1 text-sm font-bold">
          {([['trip', '🌴 Поездка'], ['food', '🍽️ Еда'], ['country', '🇱🇰 Страна']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setSp(v === 'trip' ? {} : { view: v }, { replace: true })}
              className={`min-h-10 rounded-xl ${view === v ? 'bg-surface shadow-sm' : 'text-soft'}`}>{l}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3">
          <Search size={18} className="text-soft" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: черепахи, кафе, Галле…"
            className="min-h-11 w-full bg-transparent outline-none" aria-label="Поиск мест" />
          {q && <button onClick={() => setQ('')} aria-label="Очистить"><X size={18} /></button>}
        </label>
        {view === 'trip' && <>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {cats.filter((c) => places.some((p) => p.category === c)).map((c) => (
            <button key={c} onClick={() => setCat(cat === c ? null : c)}
              className="chip min-h-9" aria-pressed={cat === c}
              style={cat === c ? { background: categoryMeta[c].color, color: '#fff' } : undefined}>
              {categoryMeta[c].emoji} {categoryMeta[c].label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]">
            {(Object.keys(tierMeta) as Tier[]).map((t) => (
              <button key={t} onClick={() => setTier(tier === t ? null : t)} aria-pressed={tier === t}
                className={`chip min-h-9 ${tier === t ? tierMeta[t].className + ' border-current' : ''}`}>{tierMeta[t].label}</button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка"
            className="min-h-9 shrink-0 rounded-xl border border-line bg-surface px-1.5 font-semibold">
            <option value="day">По дням</option>
            <option value="tier">Топ сначала</option>
            <option value="distance">Ближе</option>
          </select>
        </div>
        </>}
      </div>
      {view === 'food' && <FoodView q={q} />}
      {view === 'country' && <CountryView q={q} />}
      {view === 'trip' && <>
      <ul className="space-y-2.5 px-4 pt-2">
        {normal.map((p) => <li key={p.id}><PlaceRow p={p} /></li>)}
      </ul>
      {avoid.length > 0 && (
        <section className="mx-4 mt-6 rounded-[18px] border-2 border-[#e05a5a] bg-[#e05a5a]/8 p-3">
          <h2 className="mb-2 text-lg text-[#c23a3a]">⛔ Не идём</h2>
          <ul className="space-y-2">
            {avoid.map((p) => (
              <li key={p.id}><PlaceRow p={p} right={<StomachBadge stomach="avoid" />} /></li>
            ))}
          </ul>
        </section>
      )}
      {list.length === 0 && <p className="p-8 text-center text-soft">Ничего не нашлось</p>}
      </>}
    </div>
  );
}
