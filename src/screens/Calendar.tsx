import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, Check, Plane } from 'lucide-react';
import type { DayPlan } from '../data/schema';
import { days, info, specialDay } from '../lib/data';
import { moodMeta } from '../lib/meta';
import { countdown, lkDateTime, plural, weekdayShort, dayOfMonth, formatDayRu, diffDays } from '../lib/time';
import { useNow, useToday, useSettings } from '../lib/settings';
import { dayProgress, tripProgress } from '../lib/progress';
import { tripSummary } from '../lib/summary';
import { get, set, K, useStoreVersion } from '../lib/store';
import { fmtLkr, fmtUsd } from '../lib/money';
import { Sheet } from '../components/Sheet';
import { Confetti } from '../components/Confetti';
import { ProgressRing } from '../components/ProgressRing';

const { start, end } = info.trip;
const ARRIVAL = lkDateTime(start, '16:35');

function Countdown() {
  const now = useNow(1000);
  const c = countdown(ARRIVAL, now);
  const cell = (n: number, w: [string, string, string]) => (
    <div className="flex flex-col items-center">
      <span className="font-display text-[2.6rem] leading-none tabular-nums">{n}</span>
      <span className="text-[0.8rem] font-semibold opacity-85">{plural(n, ...w)}</span>
    </div>
  );
  return (
    <div className="relative overflow-hidden rounded-[22px] p-5 text-white" style={{ background: 'linear-gradient(140deg,#0f8b8d,#0b6e70 55%,#2f7d4a)' }}>
      <div className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-[#ffb86b] opacity-80 blur-[2px]" />
      <p className="relative font-semibold opacity-90">До Шри-Ланки</p>
      <div className="relative mt-2 flex items-end gap-5">
        {cell(c.days, ['день', 'дня', 'дней'])}
        {cell(c.hours, ['час', 'часа', 'часов'])}
        {cell(c.minutes, ['минута', 'минуты', 'минут'])}
      </div>
      <p className="relative mt-3 flex items-center gap-1.5 text-sm opacity-90"><Plane size={16} /> {info.trip.flights[0]}</p>
    </div>
  );
}

type DoorState = 'locked' | 'today' | 'past';

function Door({ day, state, onTap }: { day: DayPlan; state: DoorState; onTap: (el: HTMLElement) => void }) {
  useStoreVersion();
  const mood = moodMeta[day.mood];
  const opened = state === 'past' || (state === 'today' && !!get(K.opened(day.date)));
  const prog = dayProgress(day);
  const isHome = day.date === end;
  const special = specialDay(day.date);
  return (
    <button
      onClick={(e) => onTap(e.currentTarget)}
      className={`door-wrap relative aspect-[3/4] w-full rounded-[18px] text-left ${opened ? 'is-open' : ''} ${state === 'today' && !opened ? 'door-today' : ''}`}
      aria-label={`${formatDayRu(day.date)}: ${opened ? day.title : 'закрыто'}`}
    >
      {/* Что за дверкой */}
      <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[18px] p-2.5" style={{ background: mood.bg, color: mood.fg }}>
        <div className="flex items-start justify-between text-[0.78rem] font-bold opacity-90">
          <span>{dayOfMonth(day.date)} · {weekdayShort(day.date)}</span>
          {state === 'past' && prog.total > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-black/20 px-1.5"><Check size={12} />{prog.done}/{prog.total}</span>
          )}
        </div>
        <div className="text-center text-[2.1rem] leading-none">{day.emoji}</div>
        <div className="text-[0.78rem] font-bold leading-tight">{isHome ? 'Итоги' : day.title}</div>
      </div>
      {/* Сама дверка */}
      {!(state === 'past') && (
        <div className="door-panel absolute inset-0 flex flex-col items-center justify-center rounded-[18px] border-2 border-[#d9c39b] bg-[#f6e6c8] text-[#6b4a1d] shadow-md dark:border-[#5d4d33] dark:bg-[#3a3123] dark:text-[#f0d9ae]"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 18px, rgba(120,80,30,.06) 18px 20px)' }}>
          <span className="font-display text-[2.4rem] leading-none">{dayOfMonth(day.date)}</span>
          <span className="text-[0.8rem] font-bold uppercase tracking-wide">{weekdayShort(day.date)}</span>
          <span className="mt-1 text-xl">{isHome ? '🎁' : special ? '🌕' : day.emoji}</span>
          <span className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#c9a15a] shadow-inner" />
          {state === 'locked' && <Lock size={14} className="absolute left-2 top-2 opacity-50" />}
        </div>
      )}
    </button>
  );
}

function BonusSummary({ upTo }: { upTo: string }) {
  useStoreVersion();
  const { settings } = useSettings();
  const s = tripSummary(upTo);
  const items = [
    ['📍', `${s.places}`, plural(s.places, 'место', 'места', 'мест')],
    ['🛣️', `~${s.km}`, 'км по острову'],
    ['💸', fmtLkr(s.spentLkr), `~${fmtUsd(s.spentLkr / settings.rate)}`],
    ['⭐', s.best ? `${s.best.rating}★` : '—', s.best?.place?.name ?? 'лучшая оценка'],
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(([e, v, l]) => (
        <div key={l} className="card p-3">
          <div className="text-2xl">{e}</div>
          <div className="mt-1 text-xl font-extrabold">{v}</div>
          <div className="text-sm leading-tight text-soft">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function Calendar() {
  useStoreVersion();
  const nav = useNavigate();
  const { date: today } = useToday();
  const [peek, setPeek] = useState<DayPlan | null>(null);
  const [peekOpen, setPeekOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const phase = today < start ? 'before' : today > end ? 'after' : 'during';
  const tp = tripProgress();

  const stateOf = (d: DayPlan): DoorState => (d.date < today ? 'past' : d.date === today ? 'today' : 'locked');

  const openDay = useCallback((d: DayPlan, el: HTMLElement) => {
    const st = stateOf(d);
    if (st === 'past') return nav(`/day/${d.date}`);
    if (st === 'locked') { setPeek(d); setPeekOpen(false); return; }
    if (get(K.opened(d.date))) return nav(`/day/${d.date}`);
    el.classList.add('is-open');
    set(K.opened(d.date), true);
    setConfetti(true);
    setTimeout(() => nav(`/day/${d.date}`), 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  useEffect(() => { if (peek) { const t = setTimeout(() => setPeekOpen(true), 60); return () => clearTimeout(t); } }, [peek]);

  return (
    <div className="px-4">
      <header className="safe-top pb-3 pt-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Мирисса · 13–24 марта 2027</p>
        <h1 className="text-[2.1rem] leading-tight">Шри-Ланка {info.trip.travelers.join(' и ')}</h1>
      </header>

      {phase === 'before' && <Countdown />}
      {phase !== 'before' && (
        <div className="card flex items-center gap-4 p-4">
          <ProgressRing done={tp.done} total={tp.total} />
          <div>
            <p className="text-lg font-bold">{phase === 'during' ? `День ${diffDays(today, start) + 1} из ${days.length}` : 'Поездка позади 🌴'}</p>
            <p className="text-soft">Посетили {tp.done} из {tp.total} {plural(tp.total, 'места', 'мест', 'мест')}</p>
            {phase === 'during' && <Link to="/today" className="mt-1 inline-block font-bold text-accent">Что сегодня →</Link>}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {days.map((d) => <Door key={d.date} day={d} state={stateOf(d)} onTap={(el) => openDay(d, el)} />)}
      </div>
      <p className="mt-3 text-center text-sm text-soft">
        {phase === 'before' ? 'Дверки откроются в свой день. Можно подглядеть — нажмите на дверку.' : 'Нажмите на дверку, чтобы открыть план дня.'}
      </p>

      {(phase === 'after' || today === end) && (
        <section className="mt-5">
          <h2 className="mb-2 text-xl">🎁 Итоги поездки</h2>
          <BonusSummary upTo={today} />
        </section>
      )}

      <Sheet open={!!peek} onClose={() => setPeek(null)} label="Подглядываем">
        {peek && (
          <div>
            <div className={`door-wrap relative mx-auto aspect-[3/4] w-44 ${peekOpen ? 'is-peek' : ''}`}>
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[18px] p-3 text-center" style={{ background: moodMeta[peek.mood].bg, color: moodMeta[peek.mood].fg }}>
                <span className="text-4xl">{peek.emoji}</span>
                <span className="mt-2 text-sm font-bold leading-snug">{peek.doorTeaser}</span>
              </div>
              <div className="door-panel absolute inset-0 flex flex-col items-center justify-center rounded-[18px] border-2 border-[#d9c39b] bg-[#f6e6c8] text-[#6b4a1d] shadow-lg dark:border-[#5d4d33] dark:bg-[#3a3123] dark:text-[#f0d9ae]">
                <span className="font-display text-5xl">{dayOfMonth(peek.date)}</span>
                <span className="font-bold uppercase">{weekdayShort(peek.date)}</span>
                <span className="absolute right-3 top-1/2 h-3.5 w-3.5 rounded-full bg-[#c9a15a]" />
              </div>
            </div>
            <p className="mt-4 text-center text-soft">{formatDayRu(peek.date)} · откроется через {diffDays(peek.date, today)} {plural(diffDays(peek.date, today), 'день', 'дня', 'дней')}</p>
            <p className="mt-1 text-center text-lg font-bold">«{peek.doorTeaser}»</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="btn" onClick={() => setPeek(null)}>Подожду</button>
              <button className="btn btn-primary" onClick={() => nav(`/day/${peek.date}`)}><Eye size={18} /> Всё равно открыть</button>
            </div>
          </div>
        )}
      </Sheet>
      {confetti && <Confetti onDone={() => setConfetti(false)} />}
    </div>
  );
}
