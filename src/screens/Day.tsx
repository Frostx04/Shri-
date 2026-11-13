import { Link, useParams } from 'react-router-dom';
import { Navigation, MessageCircle, Info, ChevronLeft, ChevronRight, CloudSun, Moon, Waves, StickyNote, Wallet, MapPin } from 'lucide-react';
import type { DayPlan, Step } from '../data/schema';
import { dayByDate, days, getPlace, specialDay, templateById, placeById } from '../lib/data';
import { formatDayRu, formatDuration, addMinutes } from '../lib/time';
import { transportMeta, moodMeta, categoryMeta } from '../lib/meta';
import { gmapsLink, waLink } from '../lib/links';
import { dayStops, legBefore, type Leg } from '../lib/travel';
import { midLkr, rangeLkr, fmtLkr, fmtUsd } from '../lib/money';
import { useSettings } from '../lib/settings';
import { useValue, K } from '../lib/store';
import { dayProgress } from '../lib/progress';
import { Cost } from '../components/Badges';
import { VisitToggle } from '../components/VisitToggle';
import { Empty } from '../components/ui';
import { DayMapSlot } from './daySlots';

const DEFAULT_WEATHER = 'Март в Мириссе: +29…31°, жарко и влажно, море тёплое. Возможен короткий ливень после обеда.';

const kindIcon: Record<Step['kind'], string> = { move: '🚗', activity: '✨', food: '🍽️', rest: '🌴', book: '✍️' };

/** Цена шага: своя, иначе цена места (только на первом шаге этого места в дне). */
export function stepCost(day: Pick<DayPlan, 'steps'>, i: number): { lkr?: [number, number]; usd?: [number, number] } {
  const s = day.steps[i];
  if (s.costLkr || s.costUsd) return { lkr: s.costLkr, usd: s.costUsd };
  if (!s.placeId || s.placeId === 'hotel') return {};
  if (day.steps.findIndex((x) => x.placeId === s.placeId) !== i) return {};
  const p = getPlace(s.placeId)!;
  if (p.category === 'food' && !p.inPlan) return {};
  return { lkr: p.costLkr, usd: p.costUsd };
}

export function dayPlanTotal(day: Pick<DayPlan, 'steps'>, rate: number): [number, number] {
  let lo = 0, hi = 0;
  day.steps.forEach((_, i) => {
    const c = stepCost(day, i);
    const [a, b] = rangeLkr(c.lkr, c.usd, rate);
    lo += a; hi += b;
  });
  return [lo, hi];
}

function LegRow({ leg }: { leg: Leg }) {
  const t = transportMeta[leg.transport];
  return (
    <div className="ml-[3.1rem] flex items-center gap-2 border-l-2 border-dashed border-[var(--line)] py-2 pl-4 text-sm text-soft">
      <span className="text-base">{t.emoji}</span>
      <span>{t.label} ~{formatDuration(leg.min)}{leg.km >= 1 ? `, ~${Math.round(leg.km)} км` : ''}{leg.priceLkr ? `, ~${fmtLkr(leg.priceLkr)}` : ''}</span>
    </div>
  );
}

function StepCard({ day, i, n, id }: { day: DayPlan; i: number; n?: number; id: string }) {
  const s = day.steps[i];
  const p = getPlace(s.placeId);
  const tpl = p?.messageTemplateId ? templateById.get(p.messageTemplateId) : undefined;
  const wa = p?.contacts.find((c) => c.kind === 'whatsapp');
  const cost = stepCost(day, i);
  const showPlaceActions = p && p.id !== 'hotel' && day.steps.findIndex((x) => x.placeId === p.id) === i;
  return (
    <li id={id} className="flex gap-3 scroll-mt-24">
      <div className="w-[2.6rem] shrink-0 pt-3 text-right font-extrabold tabular-nums">{s.time}</div>
      <div className={`card min-w-0 flex-1 p-3 ${s.kind === 'book' ? 'border-dashed bg-transparent shadow-none' : ''}`}>
        <div className="flex items-start gap-2">
          {n ? (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: categoryMeta[p!.category].color }}>{n}</span>
          ) : (
            <span className="text-xl leading-7" aria-hidden>{p?.id === 'hotel' ? '🏠' : kindIcon[s.kind]}</span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-sans font-bold leading-snug">{s.title}</h3>
            {p && p.id !== 'hotel' && <Link to={`/place/${p.id}`} className="text-sm text-accent">{p.emoji} {p.name}</Link>}
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-soft">
              {s.durationMin && <span>⏱ {formatDuration(s.durationMin)} (до {addMinutes(s.time, s.durationMin)})</span>}
              {s.transport && s.kind === 'move' && <span>{transportMeta[s.transport].emoji} {transportMeta[s.transport].label}</span>}
              {(cost.lkr || cost.usd) && <Cost lkr={cost.lkr} usd={cost.usd} />}
            </div>
            {s.note && <p className="mt-1 text-sm">{s.note}</p>}
            {s.kind === 'food' && !p && <p className="mt-1 text-sm text-soft">Проверенные места: Shady Lane, Dewmini (попросить не остро), Quinta.</p>}
          </div>
        </div>
        {showPlaceActions && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Link to={`/place/${p.id}`} className="btn min-h-10 px-3 text-sm"><Info size={16} /> Карточка</Link>
            <a href={gmapsLink(p)} target="_blank" rel="noreferrer" className="btn min-h-10 px-3 text-sm"><Navigation size={16} /> Maps</a>
            {tpl && (
              <a href={wa ? waLink(wa.value, tpl.text) : `https://wa.me/?text=${encodeURIComponent(tpl.text)}`} target="_blank" rel="noreferrer" className="btn min-h-10 px-3 text-sm">
                <MessageCircle size={16} /> Написать
              </a>
            )}
            {p.category !== 'airport' && <VisitToggle placeId={p.id} compact />}
          </div>
        )}
      </div>
    </li>
  );
}

export function DayView({ day, back = true }: { day: DayPlan; back?: boolean }) {
  const { settings } = useSettings();
  const [spent, setSpent] = useValue<number>(K.daySpent(day.date));
  const [note, setNote] = useValue<string>(K.dayNote(day.date));
  const idx = days.findIndex((d) => d.date === day.date);
  const prev = days[idx - 1], next = days[idx + 1];
  const special = specialDay(day.date);
  const { numbers } = dayStops(day, getPlace);
  const startId = day.steps.find((s) => s.placeId)?.placeId === 'mattala' ? 'mattala' : 'hotel';
  const total = dayPlanTotal(day, settings.rate);
  const prog = dayProgress(day);
  const hasBeach = day.steps.some((s) => s.placeId && ['beach'].includes(placeById.get(s.placeId)?.category ?? '') || ['turtle-beach', 'thalaramba', 'polhena'].includes(s.placeId ?? ''));
  const mood = moodMeta[day.mood];

  return (
    <div className="pb-6">
      <header className="safe-top relative overflow-hidden px-4 pb-5 pt-4" style={{ background: mood.bg, color: mood.fg }}>
        <div className="flex items-center justify-between">
          {back ? (
            <Link to="/" className="-ml-2 grid h-11 w-11 place-items-center rounded-full bg-black/10" aria-label="К календарю"><ChevronLeft size={26} /></Link>
          ) : <span />}
          <div className="flex gap-1">
            {prev && <Link to={`/day/${prev.date}`} className="grid h-11 w-11 place-items-center rounded-full bg-black/10" aria-label="Предыдущий день"><ChevronLeft size={22} /></Link>}
            {next && <Link to={`/day/${next.date}`} className="grid h-11 w-11 place-items-center rounded-full bg-black/10" aria-label="Следующий день"><ChevronRight size={22} /></Link>}
          </div>
        </div>
        <p className="mt-1 font-semibold opacity-90">{formatDayRu(day.date, true)} · день {idx + 1}</p>
        <h1 className="text-[2rem] leading-tight">{day.emoji} {day.title}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5 text-sm">
          <span className="chip bg-black/15 text-inherit">{mood.label}</span>
          {prog.total > 0 && <span className="chip bg-black/15 text-inherit">✓ {prog.done}/{prog.total}</span>}
          {special && <span className="chip bg-[#fff3c4] text-[#6b4d00]"><Moon size={14} /> Особый день</span>}
        </div>
      </header>

      <DayMapSlot day={day} />

      <div className="space-y-2 px-4 pt-6">
        <p className="flex gap-2 text-sm text-soft"><CloudSun size={18} className="shrink-0" /> {day.weather ?? DEFAULT_WEATHER}</p>
        {special && <div className="rounded-2xl bg-[#fff3c4] p-3 font-semibold text-[#6b4d00] dark:bg-[#3e3510] dark:text-[#ffe08a]">🌕 {special.note}</div>}
        {day.backupNote && (
          <div className="rounded-2xl border border-[#e9c46a] bg-[#fff4d1] p-3 text-[#5c4300] dark:border-[#7a6420] dark:bg-[#3a3015] dark:text-[#f7e2a6]">
            <b>Запасной план:</b> {day.backupNote}
          </div>
        )}
        {!hasBeach && <p className="flex gap-2 rounded-2xl bg-[var(--accent)]/12 p-3 text-sm"><Waves size={18} className="shrink-0 text-accent" /> Сегодня без пляжа — вечером бассейн в отеле.</p>}
      </div>

      <ol className="mt-3 px-4">
        {day.steps.map((s, i) => {
          const leg = legBefore(day.steps, i, getPlace, startId);
          const n = s.placeId ? numbers.get(s.placeId) : undefined;
          return (
            <div key={i}>
              {leg ? <LegRow leg={leg} /> : i > 0 && <div className="ml-[3.1rem] h-2.5 border-l-2 border-dashed border-[var(--line)]" />}
              <StepCard day={day} i={i} n={n} id={`step-${i}`} />
            </div>
          );
        })}
      </ol>

      <section className="card mx-4 mt-5 space-y-3 p-4">
        <h2 className="flex items-center gap-2 text-lg"><Wallet size={20} className="text-accent" /> Деньги дня</h2>
        <p>План: <b>{total[1] ? (total[0] === total[1] ? fmtLkr(total[0]) : `${fmtLkr(total[0])} – ${fmtLkr(total[1])}`) : '—'}</b>
          {total[1] > 0 && <span className="text-soft"> (~{fmtUsd(midLkr(total, undefined) / settings.rate)})</span>}</p>
        <label className="block">
          <span className="text-sm font-semibold text-soft">Сколько потратили, ₨</span>
          <input type="number" inputMode="numeric" min={0} value={spent ?? ''} placeholder="0"
            onChange={(e) => setSpent(e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
            className="mt-1 min-h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-lg font-bold" />
          {spent ? <span className="text-sm text-soft">≈ {fmtUsd(spent / settings.rate)}</span> : null}
        </label>
        <label className="block">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-soft"><StickyNote size={16} /> Заметка дня</span>
          <textarea value={note ?? ''} onChange={(e) => setNote(e.target.value || null)} rows={3} placeholder="Что запомнилось…"
            className="mt-1 w-full rounded-xl border border-line bg-surface-2 p-3" />
        </label>
      </section>
      <div className="mt-4 flex justify-center">
        <Link to={`/map?day=${day.date}`} className="btn"><MapPin size={18} /> Этот день на большой карте</Link>
      </div>
    </div>
  );
}

export default function Day() {
  const { date } = useParams();
  const day = date ? dayByDate.get(date) : undefined;
  if (!day) return <Empty>Такого дня нет в поездке. <Link className="text-accent underline" to="/">К календарю</Link></Empty>;
  return <DayView day={day} />;
}
