import { useState } from 'react';
import type { Place, Photo } from '../data/schema';
import { Placeholder, photoUrl } from './PlaceVisual';

export function Gallery({ place, extra = [] }: { place: Place; extra?: Photo[] }) {
  const photos = [...extra, ...place.photos];
  const [i, setI] = useState(0);
  if (!photos.length)
    return <div className="aspect-[16/10] w-full"><Placeholder place={place} size="lg" /></div>;
  return (
    <div className="relative">
      <div
        className="flex aspect-[16/10] w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {photos.map((ph, k) => (
          <figure key={k} className="relative h-full w-full shrink-0 snap-center">
            <img src={photoUrl(ph.src)} alt={place.name} className="h-full w-full object-cover" loading={k ? 'lazy' : 'eager'} />
            <figcaption className="absolute bottom-0 right-0 max-w-[80%] truncate rounded-tl-lg bg-black/45 px-2 py-0.5 text-[0.65rem] text-white">
              {ph.provider === 'own' ? 'наше фото' : `© ${ph.author} · ${ph.license}${ph.provider === 'inaturalist' ? ' · iNaturalist' : ph.provider === 'openverse' ? ' · Flickr' : ph.provider === 'wikimedia' ? ' · Wikimedia' : ''}`}
            </figcaption>
          </figure>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-1.5">
          {photos.map((_, k) => <span key={k} className={`h-1.5 rounded-full bg-white transition-all ${k === i ? 'w-5' : 'w-1.5 opacity-60'}`} />)}
        </div>
      )}
    </div>
  );
}
