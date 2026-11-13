import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { PageHeader, Section } from '../../components/ui';
import { places, animals } from '../../lib/data';
import { photoUrl } from '../../components/PlaceVisual';

export default function Credits() {
  const withPhotos = places.filter((p) => p.photos.length);
  const google = withPhotos.some((p) => p.photos.some((ph) => ph.provider === 'google'));
  return (
    <div>
      <PageHeader back="/more" title="Авторы фото" subtitle="Спасибо всем, кто делится фотографиями" />
      <Section title="Карта">
        <p className="card p-4">Картографические данные © <a className="text-accent underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">участники OpenStreetMap</a>, лицензия ODbL. Маршруты — OSRM.</p>
      </Section>
      {google && (
        <Section title="Google">
          <p className="card p-4">Часть фото кафе, рейтинги и часы работы — Google Maps (Places API). Авторы указаны под каждым фото.</p>
        </Section>
      )}
      <Section title={`Фото мест (${withPhotos.reduce((s, p) => s + p.photos.length, 0)})`}>
        {withPhotos.length === 0 ? (
          <p className="card p-4 text-soft">Фото ещё не загружены. Запустите <code>npm run photos</code> — скрипт возьмёт снимки со свободными лицензиями с Wikimedia Commons.</p>
        ) : (
          <ul className="space-y-3">
            {withPhotos.map((p) => (
              <li key={p.id} className="card p-3">
                <Link to={`/place/${p.id}`} className="font-bold">{p.emoji} {p.name}</Link>
                <ul className="mt-2 space-y-2">
                  {p.photos.map((ph, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <img src={photoUrl(ph.thumb ?? ph.src)} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1"><b>{ph.author}</b><br /><span className="text-soft">{ph.license}{ph.provider === 'google' ? ' · Google Maps' : ph.provider === 'wikimedia' ? ' · Wikimedia Commons' : ''}</span></span>
                      <a href={ph.sourceUrl} target="_blank" rel="noreferrer" aria-label="Источник фото" className="grid h-10 w-10 place-items-center text-accent"><ExternalLink size={18} /></a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Section>
      {animals.some((a) => a.photos.length) && (
        <Section title={`Фото зверушек (${animals.reduce((s, a) => s + a.photos.length, 0)})`}>
          <ul className="card divide-y divide-[var(--line)]">
            {animals.filter((a) => a.photos.length).flatMap((a) => a.photos.map((ph, i) => (
              <li key={a.id + i} className="flex items-center gap-3 p-2.5 text-sm">
                <img src={photoUrl(ph.thumb ?? ph.src)} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1"><b>{a.name}</b><br /><span className="text-soft">{ph.author} · {ph.license}</span></span>
                <a href={ph.sourceUrl} target="_blank" rel="noreferrer" aria-label="Источник фото" className="grid h-10 w-10 place-items-center text-accent"><ExternalLink size={18} /></a>
              </li>
            )))}
          </ul>
        </Section>
      )}
      <Section title="Иконки и шрифты">
        <p className="card p-4 text-sm">Иконки — Lucide (ISC). Шрифты — Manrope и Yeseva One (SIL Open Font License).</p>
      </Section>
    </div>
  );
}
