import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { PageHeader, Section } from '../../components/ui';
import { info, places } from '../../lib/data';
import { telHref, gmapsLink, gmapsSearch } from '../../lib/links';

export default function Emergency() {
  const medical = places.filter((p) => p.category === 'medical');
  return (
    <div>
      <PageHeader back="/more" title="Экстренное" />
      <Section>
        <ul className="space-y-2">
          {info.emergency.map((e) => (
            <li key={e.phone}>
              <a href={telHref(e.phone)} className="card flex min-h-16 items-center gap-3 p-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e05a5a] text-white"><Phone size={22} /></span>
                <span className="flex-1"><b className="block text-lg">{e.name}</b><span className="text-sm text-soft">{e.phone}{e.note ? ` · ${e.note}` : ''}</span></span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Больницы и аптеки">
        <ul className="space-y-2">
          {medical.map((p) => (
            <li key={p.id} className="card p-3">
              <Link to={`/place/${p.id}`} className="font-bold">{p.emoji} {p.name}</Link>
              <p className="text-sm text-soft">{p.howToGet}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a href={gmapsLink(p)} target="_blank" rel="noreferrer" className="btn"><MapPin size={16} /> Маршрут</a>
                {p.contacts.find((c) => c.kind === 'phone') && <a href={telHref(p.contacts.find((c) => c.kind === 'phone')!.value)} className="btn btn-primary"><Phone size={16} /> Позвонить</a>}
              </div>
            </li>
          ))}
          <li className="grid grid-cols-2 gap-2">
            <a href={gmapsSearch('pharmacy near Mirissa')} target="_blank" rel="noreferrer" className="btn">💊 Аптеки рядом</a>
            <a href={gmapsSearch('hospital near Mirissa')} target="_blank" rel="noreferrer" className="btn">🏥 Больницы рядом</a>
          </li>
        </ul>
      </Section>
      <Section title="Важно">
        <ul className="card space-y-2 p-4 text-sm">
          <li>🐕 Укус или царапина животного — в тот же день к врачу за уколами от бешенства.</li>
          <li>🌡️ Температура — не пить ибупрофен и аспирин, пока не исключили денге.</li>
          <li>📄 Держать под рукой: паспорт, ETA, страховку (номер полиса).</li>
        </ul>
      </Section>
    </div>
  );
}
