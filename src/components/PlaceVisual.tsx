import type { Place, Photo } from '../data/schema';
import { categoryMeta } from '../lib/meta';

const base = import.meta.env.BASE_URL;
export const photoUrl = (src: string) => (/^(https?:|blob:|data:)/.test(src) ? src : base + src.replace(/^\//, ''));

/** Заглушка без фото: эмодзи на фоне цвета категории. */
export function Placeholder({ place, size = 'md' }: { place: Pick<Place, 'emoji' | 'category'>; size?: 'sm' | 'md' | 'lg' }) {
  const c = categoryMeta[place.category].color;
  const font = size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-5xl' : 'text-7xl';
  return (
    <div
      className={`grid h-full w-full place-items-center ${font}`}
      style={{ background: `radial-gradient(circle at 30% 25%, ${c}55, transparent 60%), linear-gradient(140deg, ${c}33, ${c}88)` }}
      aria-hidden
    >
      <span className="drop-shadow-sm">{place.emoji ?? categoryMeta[place.category].emoji}</span>
    </div>
  );
}

export function PlaceThumb({ place, extra, className = '' }: { place: Place; extra?: Photo[]; className?: string }) {
  const photo = place.photos[0] ?? extra?.[0];
  return (
    <div className={`overflow-hidden ${className}`}>
      {photo ? (
        <img src={photoUrl(photo.thumb ?? photo.src)} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Placeholder place={place} size="sm" />
      )}
    </div>
  );
}
