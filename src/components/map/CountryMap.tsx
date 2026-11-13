import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import type { Place } from '../../data/schema';
import { info, hotel } from '../../lib/data';
import { regionColor, tripTypeMeta } from '../../lib/meta';
import { MapBase, placeIcon } from './MapBase';

/** Карта страны: цвет — регион, иконка — тип поездки. Отель (Мирисса) виден всегда. */
export default function CountryMap({ list }: { list: Place[] }) {
  const pts = list.filter((p) => p.coords);
  return (
    <MapBase className="h-[48dvh] w-full" bounds={[...pts.map((p) => p.coords!), hotel.coords!]}>
      {pts.map((p) => (
        <Marker key={p.id} position={p.coords!}
          icon={L.divIcon({
            className: '', iconSize: [30, 30], iconAnchor: [15, 15],
            html: `<div class="map-pin" style="width:30px;height:30px;background:${regionColor(p.region, info.regions)};font-size:14px">${p.tripType ? tripTypeMeta[p.tripType].emoji : p.emoji}</div>`,
          })}>
          <Popup>
            <b>{p.emoji} {p.name}</b><br />
            <span>{p.region}{p.distanceKm ? ` · ~${p.distanceKm} км, ${p.driveHours} ч` : ''}</span><br />
            <Link to={`/place/${p.id}`}>Карточка →</Link>
          </Popup>
        </Marker>
      ))}
      <Marker position={hotel.coords!} icon={placeIcon(hotel)} zIndexOffset={1000} />
    </MapBase>
  );
}
