import { LEVELS, levelFor } from '../lib/animals';
import { plural } from '../lib/time';

/** Шкала зверушек: полоса с отметками уровней. */
export function AnimalScale({ seen, total, compact }: { seen: number; total: number; compact?: boolean }) {
  // Отметки уровней стоят равномерно; заполнение — по участкам между ними.
  const stops = [0, ...LEVELS.map((l) => Math.min(l.n, total))];
  const pos = (i: number) => i / (stops.length - 1);
  let pct = 1;
  for (let i = 1; i < stops.length; i++) {
    if (seen < stops[i]) { pct = pos(i - 1) + ((seen - stops[i - 1]) / Math.max(1, stops[i] - stops[i - 1])) * (pos(i) - pos(i - 1)); break; }
  }
  const { cur, next } = levelFor(seen);
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className={`${compact ? 'text-lg' : 'text-2xl'} font-extrabold leading-tight`}>
            {seen} <span className="text-base font-semibold text-soft">из {total} {plural(total, 'зверушки', 'зверушек', 'зверушек')}</span>
          </p>
          <p className="text-sm text-soft">{cur ? `${cur.emoji} ${cur.title}` : 'Пока никого — всё впереди!'}</p>
        </div>
        {next && <p className="text-right text-sm text-soft">до «{next.title}»<br /><b className="text-[var(--fg)]">ещё {next.n - seen}</b></p>}
      </div>
      <div className="relative mt-3 h-5" role="progressbar" aria-valuenow={seen} aria-valuemax={total} aria-label="Увидели зверушек">
        <div className="absolute inset-0 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct * 100}%`, background: 'linear-gradient(90deg,#5fd0c4,#2f7d4a 45%,#f2b544 80%,#e8684a)' }} />
        </div>
        {LEVELS.map((l, i) => {
          const x = pos(i + 1) * 100;
          const got = seen >= l.n;
          return (
            <span key={l.n} className={`absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 transition-transform ${compact ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm'} ${got ? 'scale-110 border-white bg-[#f2b544] shadow' : 'border-[var(--line)] bg-surface grayscale'}`}
              style={{ left: `min(calc(100% - ${compact ? 12 : 16}px), max(${compact ? 12 : 16}px, ${x}%))` }} title={`${l.n}: ${l.title}`}>
              {l.emoji}
            </span>
          );
        })}
      </div>
    </div>
  );
}
