import { lazy, Suspense, useMemo, useState } from 'react';
import { Map as MapIcon, List, ExternalLink } from 'lucide-react';
import { gmapsSearch } from '../lib/links';

const FoodMap = lazy(() => import('../components/map/FoodMap'));
import { places } from '../lib/data';
import { openNow } from '../lib/hours';
import { useToday } from '../lib/settings';
import { PlaceRow } from './Places';
import { StomachBadge } from '../components/Badges';


export default function FoodView({ q }: { q: string }) {
  const food = places.filter((p) => p.category === 'food');
  const areas = [...new Set(food.map((p) => p.area ?? p.region))];
  const cuisines = [...new Set(food.flatMap((p) => (p.cuisine ?? '').split(',').map((c) => c.trim())).filter((c) => c && c !== '—'))].sort();
  const [area, setArea] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState('');
  const [soft, setSoft] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'map' | 'list'>(() => { try { return (localStorage.getItem('sl-foodmode') as 'map' | 'list') || 'map'; } catch { return 'map'; } });
  const setModeSaved = (m: 'map' | 'list') => { setMode(m); try { localStorage.setItem('sl-foodmode', m); } catch { /* */ } };
  const { weekday, minutes } = useToday();

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return food.filter((p) => {
      if (area && (p.area ?? p.region) !== area) return false;
      if (cuisine && !(p.cuisine ?? '').includes(cuisine)) return false;
      if (soft && p.stomach !== 'ok') return false;
      if (open && openNow(p.hours, weekday, minutes) !== true) return false;
      if (ql && ![p.name, p.cuisine, p.area, ...(p.menu ?? []).map((m) => m.name + ' ' + (m.nameRu ?? ''))].join(' ').toLowerCase().includes(ql)) return false;
      return true;
    }).sort((a, b) => Number(!!a.avoid) - Number(!!b.avoid) || Number(b.inPlan) - Number(a.inPlan) || a.tier.localeCompare(b.tier) * -1);
  }, [food, area, cuisine, soft, open, q, weekday, minutes]);

  const good = list.filter((p) => !p.avoid), bad = list.filter((p) => p.avoid);
  return (
    <div>
      <div className="space-y-2 px-4 pt-1">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
          {areas.map((a) => (
            <button key={a} onClick={() => setArea(area === a ? null : a)} aria-pressed={area === a}
              className={`chip min-h-9 ${area === a ? 'bg-[var(--color-coral)] text-white' : ''}`}>📍 {a}</button>
          ))}
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
          <button onClick={() => setSoft(!soft)} aria-pressed={soft} className={`chip min-h-9 ${soft ? 'bg-[var(--color-jungle)] text-white' : ''}`}>🟢 Мягко для желудка</button>
          <button onClick={() => setOpen(!open)} aria-pressed={open} className={`chip min-h-9 ${open ? 'bg-[var(--accent)] text-white' : ''}`}>🕐 Открыто сейчас</button>
        </div>
        <div className="flex gap-2">
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} aria-label="Кухня" className="min-h-10 min-w-0 flex-1 rounded-xl border border-line bg-surface px-2 font-semibold">
            <option value="">Любая кухня</option>
            {cuisines.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="grid shrink-0 grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm font-bold" role="tablist" aria-label="Вид">
            <button role="tab" aria-selected={mode === 'map'} onClick={() => setModeSaved('map')} className={`flex min-h-9 items-center gap-1 rounded-lg px-2.5 ${mode === 'map' ? 'bg-surface shadow-sm' : 'text-soft'}`}><MapIcon size={16} /> Карта</button>
            <button role="tab" aria-selected={mode === 'list'} onClick={() => setModeSaved('list')} className={`flex min-h-9 items-center gap-1 rounded-lg px-2.5 ${mode === 'list' ? 'bg-surface shadow-sm' : 'text-soft'}`}><List size={16} /> Список</button>
          </div>
        </div>
        {open && <p className="text-xs text-soft">Показаны только кафе с известными часами работы — у многих часы ещё не заполнены.</p>}
      </div>
      {mode === 'map' && (
        <div className="mt-3 border-y border-line">
          <Suspense fallback={<div className="h-[52dvh] animate-pulse bg-surface-2" />}><FoodMap list={list} /></Suspense>
        </div>
      )}
      {mode === 'map' && list.some((p) => !p.coords && !p.avoid) && (
        <section className="px-4 pt-3">
          <h3 className="mb-1.5 font-sans text-sm font-bold text-soft">Пока без точки на карте — открыть в Google Maps:</h3>
          <div className="flex flex-wrap gap-1.5">
            {list.filter((p) => !p.coords && !p.avoid).map((p) => (
              <a key={p.id} href={gmapsSearch(p.gmapsQuery)} target="_blank" rel="noreferrer" className="chip min-h-9"><ExternalLink size={13} /> {p.name.split(/[:—]/)[0].trim()}</a>
            ))}
          </div>
        </section>
      )}
      {mode === 'map' && <h2 className="px-4 pt-4 text-lg">Все места</h2>}
      <ul className="space-y-2.5 px-4 pt-3">
        {good.map((p) => (
          <li key={p.id}>
            <PlaceRow p={p} />
          </li>
        ))}
      </ul>
      {good.length === 0 && <p className="p-8 text-center text-soft">Под фильтры ничего не подошло</p>}
      {bad.length > 0 && (
        <section className="mx-4 mt-6 rounded-[18px] border-2 border-[#e05a5a] bg-[#e05a5a]/8 p-3">
          <h2 className="text-lg text-[#c23a3a]">⛔ Не идём</h2>
          <p className="mb-2 text-sm text-soft">Плохие свежие отзывы: санитария, желудок.</p>
          <ul className="space-y-2">{bad.map((p) => <li key={p.id}><PlaceRow p={p} right={<StomachBadge stomach="avoid" />} /></li>)}</ul>
        </section>
      )}
    </div>
  );
}
