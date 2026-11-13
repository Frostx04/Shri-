import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, type ReactNode } from 'react';
import type { Place } from '../../data/schema';
import { categoryMeta, tierMeta } from '../../lib/meta';

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export const MIRISSA: [number, number] = [5.9484, 80.4587];

export function MapBase({ children, center = MIRISSA, zoom = 12, className = '', bounds }: {
  children?: ReactNode; center?: [number, number]; zoom?: number; className?: string; bounds?: [number, number][];
}) {
  return (
    <MapContainer center={center} zoom={zoom} className={className} zoomControl={false} attributionControl
      style={{ background: 'var(--surface-2)' }}>
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={18} />
      {bounds && bounds.length > 0 && <FitBounds bounds={bounds} />}
      {children}
    </MapContainer>
  );
}

export function FitBounds({ bounds, pad = 36 }: { bounds: [number, number][]; pad?: number }) {
  const map = useMap();
  const key = JSON.stringify(bounds);
  useEffect(() => {
    if (bounds.length === 1) map.setView(bounds[0], 14);
    else if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), { padding: [pad, pad], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/** Круглый маркер: цвет — категория, размер — tier; номер или эмодзи внутри. */
export function placeIcon(p: Place, opts: { n?: number; visited?: boolean; color?: string; dim?: boolean } = {}) {
  const size = p.id === 'hotel' ? 40 : p.tier === 'top' ? 36 : p.tier === 'good' ? 30 : 25;
  const color = opts.color ?? categoryMeta[p.category].color;
  const inner = p.id === 'hotel' ? '🏠' : opts.n != null ? `<b>${opts.n}</b>` : (p.emoji ?? '');
  const fs = opts.n != null ? size * 0.46 : size * 0.5;
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="map-pin${opts.dim ? ' is-dim' : ''}" style="width:${size}px;height:${size}px;background:${color};font-size:${fs}px">${inner}${
      opts.visited ? '<span class="map-pin-check">✓</span>' : ''}</div>`,
  });
}

export const tierZ = (p: Place) => (p.id === 'hotel' ? 1000 : 300 - tierMeta[p.tier].order * 100);
