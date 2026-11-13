import { Marker, Polyline } from 'react-leaflet';
import type { DayPlan } from '../../data/schema';
import { getPlace } from '../../lib/data';
import { dayStops } from '../../lib/travel';
import { useRoute } from '../../lib/routes';
import { isVisited } from '../../lib/progress';
import { useStoreVersion } from '../../lib/store';
import { MapBase, placeIcon } from './MapBase';

/** Карта маршрута дня: дорога из OSRM или прямые пунктиры; точки пронумерованы. */
export function RouteLayer({ day, routeKey, onPick }: { day: Pick<DayPlan, 'steps'>; routeKey: string | null; onPick?: (placeId: string) => void }) {
  useStoreVersion();
  const route = useRoute(routeKey);
  const { order, numbers } = dayStops(day, getPlace);
  const pts = order.map((id) => getPlace(id)!.coords!);
  const unique = [...new Set(order)];
  return (
    <>
      {route?.features.length ? (
        route.features.map((f, i) => (
          <Polyline key={i} positions={f.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])}
            pathOptions={{ color: '#e8684a', weight: 5, opacity: 0.9 }} />
        ))
      ) : (
        <Polyline positions={pts} pathOptions={{ color: '#e8684a', weight: 4, dashArray: '8 10', opacity: 0.85 }} />
      )}
      {unique.map((id) => {
        const p = getPlace(id)!;
        return (
          <Marker key={id} position={p.coords!} icon={placeIcon(p, { n: numbers.get(id), visited: id !== 'hotel' && isVisited(id) })}
            zIndexOffset={id === 'hotel' ? 1000 : 500} eventHandlers={{ click: () => onPick?.(id) }} />
        );
      })}
    </>
  );
}

export function DayMap({ day, routeKey, className = '', onPick }: { day: Pick<DayPlan, 'steps'>; routeKey: string | null; className?: string; onPick?: (id: string) => void }) {
  const { order } = dayStops(day, getPlace);
  const bounds = order.map((id) => getPlace(id)!.coords!);
  return (
    <MapBase className={className} bounds={bounds}>
      <RouteLayer day={day} routeKey={routeKey} onPick={onPick} />
    </MapBase>
  );
}
