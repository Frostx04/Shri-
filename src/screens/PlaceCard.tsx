import { Link, useParams } from 'react-router-dom';
import {
  Navigation, Phone, MessageCircle, Send, Globe, Mail, Camera, MapPin, AlertTriangle, Clock, Wallet,
  Backpack, Sparkles, Route, BookOpen, CalendarDays, Star, ListChecks, Utensils, ChevronLeft,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Contact, Place } from '../data/schema';
import { getPlace, daysForPlace, templateById } from '../lib/data';
import { gmapsLink, contactHref, gmapsSearch } from '../lib/links';
import { transportMeta, tripTypeMeta } from '../lib/meta';
import { formatDayRu, formatDuration } from '../lib/time';
import { fmtLkr, fmtUsd } from '../lib/money';
import { useSettings } from '../lib/settings';
import { Gallery } from '../components/Gallery';
import { TierBadge, CategoryBadge, StomachBadge, Cost } from '../components/Badges';
import { MessageBox } from '../components/MessageBox';
import { Empty } from '../components/ui';
import { slotPlaceExtras } from './placeSlots';

const contactIcon: Record<Contact['kind'], ReactNode> = {
  whatsapp: <MessageCircle size={18} />, phone: <Phone size={18} />, telegram: <Send size={18} />,
  instagram: <Camera size={18} />, site: <Globe size={18} />, email: <Mail size={18} />, gmaps: <MapPin size={18} />,
};
const contactLabel: Record<Contact['kind'], string> = {
  whatsapp: 'WhatsApp', phone: 'Позвонить', telegram: 'Telegram', instagram: 'Instagram', site: 'Сайт', email: 'Почта', gmaps: 'Google Maps',
};

const isTodo = (s?: string) => !s || /^TODO/.test(s.trim());
const clean = (arr: string[]) => arr.filter((s) => !isTodo(s));

function Block({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 flex items-center gap-2 text-[1.15rem]"><span className="text-accent">{icon}</span>{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((s, i) => <li key={i} className="flex gap-2 leading-snug"><span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />{s}</li>)}
    </ul>
  );
}

const Todo = () => <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-soft">Пока не заполнено — уточняем.</p>;

export default function PlaceCard() {
  const { id } = useParams();
  const p = getPlace(id);
  const { settings } = useSettings();
  if (!p) return <Empty>Место не найдено. <Link to="/places" className="text-accent underline">К списку</Link></Empty>;
  const tpl = p.messageTemplateId ? templateById.get(p.messageTemplateId) : undefined;
  const planned = daysForPlace.get(p.id) ?? [];
  const why = clean(p.why), what = clean(p.whatToDo);
  const extras = slotPlaceExtras;

  return (
    <article className="pb-6">
      <div className="relative">
        <Gallery place={p} extra={extras.photos?.(p)} />
        <button onClick={() => (window.history.length > 1 ? window.history.back() : (location.hash = '/places'))}
          className="safe-top absolute left-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white backdrop-blur" aria-label="Назад">
          <ChevronLeft size={26} />
        </button>
      </div>

      <header className="-mt-5 relative rounded-t-[22px] bg-[var(--bg)] px-4 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <TierBadge tier={p.tier} />
          <CategoryBadge category={p.category} />
          {p.category === 'food' && <StomachBadge stomach={p.stomach} />}
          {p.tripType && <span className="chip">{tripTypeMeta[p.tripType].emoji} {tripTypeMeta[p.tripType].label}</span>}
          {p.rating && (
            <span className="chip"><Star size={14} className="fill-[#f2b544] text-[#f2b544]" /> {p.rating.value} · {p.rating.source}{p.rating.count ? ` (${p.rating.count})` : ''}</span>
          )}
        </div>
        <h1 className="mt-2 text-[1.9rem] leading-tight">{p.emoji} {p.name}</h1>
        {p.nameLocal && <p className="text-soft">{p.nameLocal} · {p.region}</p>}
        {planned.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {planned.map((d) => (
              <Link key={d} to={`/day/${d}`} className="chip bg-[var(--accent)]/15 text-accent"><CalendarDays size={14} /> {formatDayRu(d)}</Link>
            ))}
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a className="btn btn-primary" href={gmapsLink(p)} target="_blank" rel="noreferrer"><Navigation size={18} /> Маршрут</a>
          <a className="btn" href={gmapsSearch(p.gmapsQuery)} target="_blank" rel="noreferrer"><MapPin size={18} /> В Google Maps</a>
        </div>
        {!p.coordsVerified && p.coords && <p className="mt-1.5 text-xs text-soft">Координаты приблизительные — проверяем.</p>}
      </header>

      {extras.visited?.(p)}

      {p.avoid && (
        <div className="mx-4 mt-3 rounded-2xl border-2 border-[#e05a5a] bg-[#e05a5a]/10 p-3 font-semibold text-[#c23a3a]">
          ⛔ Не идём: {why.join('; ')}
        </div>
      )}

      {!p.avoid && <Block icon={<Sparkles size={20} />} title="Зачем едем">{why.length ? <Bullets items={why} /> : <Todo />}</Block>}

      <Block icon={<Route size={20} />} title="Как добраться">
        <p className="leading-relaxed">{p.howToGet}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-sm">
          <span className="chip">{transportMeta[p.transport].emoji} {transportMeta[p.transport].label}</span>
          {p.travelTimeMin != null && <span className="chip"><Clock size={14} /> ~{formatDuration(p.travelTimeMin)} в одну сторону</span>}
          {p.distanceKm != null && <span className="chip">~{p.distanceKm} км{p.driveHours ? ` · ${p.driveHours} ч` : ''}</span>}
        </div>
      </Block>

      {p.category !== 'hotel' && <Block icon={<ListChecks size={20} />} title="Чем заняться">{what.length ? <Bullets items={what} /> : <Todo />}</Block>}

      <Block icon={<Clock size={20} />} title="Когда приезжать">
        {isTodo(p.whenToCome) ? <Todo /> : <p>{p.whenToCome}</p>}
        {p.hours && <p className="mt-1 text-soft">Часы: {p.hours}</p>}
      </Block>

      {(p.costLkr || p.costUsd || p.costNote) && (
        <Block icon={<Wallet size={20} />} title="Сколько стоит">
          <p className="text-lg"><Cost lkr={p.costLkr} usd={p.costUsd} /></p>
          {p.costNote && <p className="mt-1 text-soft">{p.costNote}</p>}
        </Block>
      )}

      {p.menu && p.menu.length > 0 && (
        <Block icon={<Utensils size={20} />} title="Меню">
          <ul className="card divide-y divide-[var(--line)]">
            {p.menu.map((m, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 px-3 py-2">
                <span>{m.nameRu ?? m.name}{m.stomach === 'spicy' && ' 🌶️'}{m.nameRu && <span className="block text-xs text-soft">{m.name}</span>}</span>
                <span className="shrink-0 text-right font-bold">{fmtLkr(m.priceLkr)}<span className="block text-xs font-normal text-soft">~{fmtUsd(m.priceLkr / settings.rate)}{m.checkedAt ? ` · ${m.checkedAt}` : ''}</span></span>
              </li>
            ))}
          </ul>
        </Block>
      )}
      {extras.menu?.(p)}

      {p.bring.length > 0 && (
        <Block icon={<Backpack size={20} />} title="Что взять">
          {extras.bring ? extras.bring(p) : <Bullets items={p.bring} />}
        </Block>
      )}

      {p.pitfalls.length > 0 && (
        <section className="mx-4 my-3 rounded-[18px] border border-[#e9c46a] bg-[#fff4d1] p-4 text-[#5c4300] dark:border-[#7a6420] dark:bg-[#3a3015] dark:text-[#f7e2a6]">
          <h2 className="mb-2 flex items-center gap-2 text-[1.15rem]"><AlertTriangle size={20} /> Подводные камни</h2>
          <Bullets items={p.pitfalls} />
        </section>
      )}

      {p.bookAhead && (
        <Block icon={<CalendarDays size={20} />} title="Бронировать заранее">
          <p>За {p.bookAhead.daysBefore} дн.: {p.bookAhead.note}</p>
        </Block>
      )}

      {p.contacts.length > 0 && (
        <Block icon={<Phone size={20} />} title="Контакты">
          <div className="grid gap-2">
            {p.contacts.map((c, i) => (
              <a key={i} className="btn justify-start" href={contactHref(c)} target="_blank" rel="noreferrer">
                {contactIcon[c.kind]} <span className="truncate">{c.label ?? contactLabel[c.kind]}</span>
                <span className="ml-auto truncate text-sm font-normal text-soft">{c.value.replace(/^https?:\/\//, '')}</span>
              </a>
            ))}
          </div>
        </Block>
      )}

      {tpl && (
        <Block icon={<MessageCircle size={20} />} title="Готовое сообщение">
          <MessageBox tpl={tpl} contacts={p.contacts} />
        </Block>
      )}

      <Block icon={<BookOpen size={20} />} title="Источник">
        <p className="text-sm text-soft">{isTodo(p.sources) ? 'Источники собираем.' : p.sources}{p.checkedAt ? ` · проверено ${p.checkedAt}` : ''}</p>
      </Block>
    </article>
  );
}

export type PlaceSlots = {
  photos?: (p: Place) => import('../data/schema').Photo[];
  visited?: (p: Place) => ReactNode;
  bring?: (p: Place) => ReactNode;
  menu?: (p: Place) => ReactNode;
};
