import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, Navigation, SlidersHorizontal, X } from 'lucide-react';
import type { Category, Tier } from '../../data/schema';
import { places, days, dayByDate, dayPlaceIds, hotel } from '../../lib/data';
import { categoryMeta, tierMeta } from '../../lib/meta';
import { gmapsLink } from '../../lib/links';
import { formatDayRu, formatShort } from '../../lib/time';
import { isVisited } from '../../lib/progress';
import { useStoreVersion } from '../../lib/store';
import { dayRouteKey } from '../../lib/routes';
import { MapBase, placeIcon, tierZ } from './MapBase';
import { RouteLayer } from './DayMap';
import { TierBadge } from '../Badges';

function LocateButton() {
  const map = useMap();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const locate = () => {
    if (!navigator.geolocation) return setErr('Геолокация недоступна');
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false); setErr('');
        const ll: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(map);
        map.setView(ll, 15);
      },
      () => { setBusy(false); setErr('Не удалось определить место'); },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };
  return (
    <div className="absolute bottom-24 right-3 z-[800] flex flex-col items-end gap-2">
      {err && <span className="rounded-xl bg-surface px-2 py-1 text-sm shadow">{err}</span>}
      <button onClick={locate} className="grid h-12 w-12 place-items-center rounded-full bg-surface shadow-lg" aria-label="Где я">
        <LocateFixed size={22} className={busy ? 'animate-spin text-accent' : 'text-accent'} />
      </button>
    </div>
  );
}

type Seen = 'all' | 'yes' | 'no';
const cats = (Object.keys(categoryMeta) as Category[]).filter((c) => places.some((p) => p.category === c && p.coords));

export default function MapView() {
  useStoreVersion();
  const [sp, setSp] = useSearchParams();
  const day = sp.get('day') ?? '';
  const [cat, setCat] = useState<Set<Category>>(() => new Set(sp.get('cat') ? [sp.get('cat') as Category] : []));
  const [tier, setTier] = useState<Tier | null>(null);
  const [seen, setSeen] = useState<Seen>('all');
  const [panel, setPanel] = useState(false);

  const dayPlan = day ? dayByDate.get(day) : undefined;
  const dayIds = useMemo(() => (dayPlan ? new Set(dayPlaceIds(dayPlan)) : null), [dayPlan]);

  const shown = places.filter((p) => {
    if (!p.coords) return false;
    if (p.id === 'hotel') return true;
    if (dayIds && !dayIds.has(p.id)) return false;
    if (cat.size && !cat.has(p.category)) return false;
    if (!cat.has('food') && p.category === 'food' && !(dayIds && dayIds.has(p.id))) return false; // еда — во вкладке «Еда»
    if (tier && p.tier !== tier) return false;
    if (seen !== 'all' && isVisited(p.id) !== (seen === 'yes')) return false;
    return true;
  });
  const noCoords = places.filter((p) => !p.coords).length;
  const activeFilters = cat.size + (tier ? 1 : 0) + (seen !== 'all' ? 1 : 0);
  const toggleCat = (c: Category) => setCat((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const nearby = places.filter((p) => p.coords && (p.region === 'Мирисса')).map((p) => p.coords!);

  return (
    <div className="relative h-[calc(100dvh-60px-env(safe-area-inset-bottom))]">
      <MapBase className="h-full w-full" bounds={dayPlan ? undefined : nearby}>
        {dayPlan && <RouteLayer day={dayPlan} routeKey={dayRouteKey(dayPlan.date)} />}
        {shown.filter((p) => !(dayPlan && (dayIds?.has(p.id) || p.id === 'hotel'))).map((p) => (
          <Marker key={p.id} position={p.coords!} icon={placeIcon(p, { visited: isVisited(p.id), dim: p.avoid })} zIndexOffset={tierZ(p)}>
            <Popup>
              <div className="w-56">
                <div className="mb-1 flex gap-1"><TierBadge tier={p.tier} /></div>
                <b className="text-base">{p.emoji} {p.name}</b>
                <div className="mt-2 flex gap-1.5">
                  <Link to={`/place/${p.id}`} className="btn min-h-9 flex-1 px-2 text-sm">Карточка</Link>
                  <a href={gmapsLink(p)} target="_blank" rel="noreferrer" className="btn btn-primary min-h-9 flex-1 px-2 text-sm !text-white"><Navigation size={14} /> Доехать</a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {dayPlan && <Marker position={hotel.coords!} icon={placeIcon(hotel)} zIndexOffset={1000} />}
        <LocateButton />
      </MapBase>

      <div className="safe-top pointer-events-none absolute inset-x-0 top-0 z-[800] flex flex-col gap-2 p-3">
        <div className="pointer-events-auto flex items-center gap-2">
          <select value={day} onChange={(e) => setSp(e.target.value ? { day: e.target.value } : {}, { replace: true })}
            className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-3 font-bold shadow" aria-label="День">
            <option value="">Все места</option>
            {days.map((d) => <option key={d.date} value={d.date}>{formatShort(d.date)} {d.emoji} {d.title}</option>)}
          </select>
          <button onClick={() => setPanel(!panel)} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line bg-surface shadow" aria-label="Фильтры" aria-expanded={panel}>
            <SlidersHorizontal size={20} />
            {activeFilters > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--color-coral)] text-xs font-bold text-white">{activeFilters}</span>}
          </button>
        </div>
        {dayPlan && (
          <Link to={`/day/${dayPlan.date}`} className="pointer-events-auto self-start rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-accent shadow">
            ← {formatDayRu(dayPlan.date)}: план дня
          </Link>
        )}
        {panel && (
          <div className="card pointer-events-auto space-y-3 p-3">
            <div className="flex items-center justify-between"><b>Фильтры</b>
              <button onClick={() => setPanel(false)} aria-label="Закрыть"><X size={20} /></button></div>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button key={c} onClick={() => toggleCat(c)} aria-pressed={cat.has(c)} className="chip min-h-9"
                  style={cat.has(c) ? { background: categoryMeta[c].color, color: '#fff' } : undefined}>{categoryMeta[c].emoji} {categoryMeta[c].label}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(tierMeta) as Tier[]).map((t) => (
                <button key={t} onClick={() => setTier(tier === t ? null : t)} aria-pressed={tier === t} className={`chip min-h-9 ${tier === t ? tierMeta[t].className : ''}`}>{tierMeta[t].label}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1 text-sm font-bold">
              {([['all', 'Все'], ['yes', 'Были ✓'], ['no', 'Не были']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setSeen(v)} className={`min-h-9 rounded-lg ${seen === v ? 'bg-surface shadow-sm' : 'text-soft'}`}>{l}</button>
              ))}
            </div>
            <p className="text-xs text-soft">На карте {shown.length} мест{noCoords ? ` · ${noCoords} пока без координат` : ''}</p>
            {activeFilters > 0 && <button className="btn w-full" onClick={() => { setCat(new Set()); setTier(null); setSeen('all'); }}>Сбросить</button>}
          </div>
        )}
      </div>
    </div>
  );
}
