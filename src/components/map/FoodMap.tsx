import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import type { Place } from '../../data/schema';
import { hotel } from '../../lib/data';
import { stomachMeta } from '../../lib/meta';
import { gmapsLink } from '../../lib/links';
import { isVisited } from '../../lib/progress';
import { useStoreVersion } from '../../lib/store';
import { MapBase, placeIcon } from './MapBase';
import { StomachBadge } from '../Badges';

/** Цвет метки еды — по «желудку»: зелёный мягко, жёлтый уточнить, оранжевый остро, красный не идём. */
export const STOMACH_COLOR = { ok: '#2f9e57', check: '#e0a82c', spicy: '#e8684a', avoid: '#d23b3b' } as const;

function foodIcon(p: Place, visited: boolean) {
  const c = STOMACH_COLOR[p.stomach ?? 'check'];
  const s = p.inPlan ? 40 : p.tier === 'top' ? 36 : 30;
  const inner = p.avoid ? '⛔' : p.category === 'food' ? (p.emoji && p.emoji !== '🍽️' ? p.emoji : '🍴') : p.emoji ?? '';
  return L.divIcon({
    className: '', iconSize: [s, s], iconAnchor: [s / 2, s],
    html: `<div class="food-pin${p.avoid ? ' is-avoid' : ''}" style="width:${s}px;height:${s}px;background:${c};font-size:${s * 0.48}px"><span>${inner}</span></div>${
      p.inPlan ? '<span class="food-star">★</span>' : ''}${visited ? '<span class="map-pin-check">✓</span>' : ''}`,
  });
}

export default function FoodMap({ list }: { list: Place[] }) {
  useStoreVersion();
  const pts = list.filter((p) => p.coords);
  // По умолчанию — пешая округа отеля (~1 км); если в фильтре другой район — рамка по нему.
  const near = (c: [number, number]) => Math.abs(c[0] - hotel.coords![0]) < 0.008 && Math.abs(c[1] - hotel.coords![1]) < 0.008;
  const close = pts.filter((p) => near(p.coords!)).map((p) => p.coords!);
  const bounds = close.length >= 2 ? [...close, hotel.coords!] : pts.length ? pts.map((p) => p.coords!) : [hotel.coords!];
  return (
    <div className="relative">
      <MapBase className="h-[52dvh] w-full" bounds={bounds}>
        {pts.map((p) => (
          <Marker key={p.id} position={p.coords!} icon={foodIcon(p, isVisited(p.id))} zIndexOffset={p.avoid ? 0 : p.inPlan ? 800 : 400}>
            <Popup>
              <div className="w-56 space-y-1.5">
                <b className="block text-base leading-tight">{p.name}</b>
                {p.cuisine && p.cuisine !== '—' && <p className="text-sm text-soft">{p.cuisine}</p>}
                <StomachBadge stomach={p.stomach} />
                {p.hours && <p className="text-sm">🕐 {p.hours}</p>}
                <div className="flex gap-1.5 pt-1">
                  <Link to={`/place/${p.id}`} className="btn min-h-9 flex-1 px-2 text-sm">Карточка</Link>
                  {!p.avoid && <a href={gmapsLink(p)} target="_blank" rel="noreferrer" className="btn btn-primary min-h-9 flex-1 px-2 text-sm !text-white"><Navigation size={14} /> Дойти</a>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <Marker position={hotel.coords!} icon={placeIcon(hotel)} zIndexOffset={1000} />
      </MapBase>
      <div className="pointer-events-none absolute right-2 top-2 z-[500] flex flex-col gap-1 rounded-xl bg-surface/90 p-2 text-[0.7rem] font-semibold shadow">
        {(Object.keys(STOMACH_COLOR) as (keyof typeof STOMACH_COLOR)[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: STOMACH_COLOR[k] }} />{stomachMeta[k].label}</span>
        ))}
        <span className="flex items-center gap-1.5"><span className="text-[#f2b544]">★</span> в нашем плане</span>
      </div>
    </div>
  );
}
