import { Star } from 'lucide-react';

export function Stars({ value, onChange, size = 30 }: { value?: number; onChange?: (v: number | null) => void; size?: number }) {
  return (
    <div className="flex gap-1" role={onChange ? 'radiogroup' : undefined} aria-label="Оценка">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = (value ?? 0) >= n;
        const icon = <Star size={size} className={on ? 'fill-[#f2b544] text-[#f2b544]' : 'text-[var(--line)]'} strokeWidth={1.6} />;
        return onChange ? (
          <button key={n} role="radio" aria-checked={value === n} aria-label={`${n} из 5`} onClick={() => onChange(value === n ? null : n)}
            className={`grid min-h-11 min-w-11 place-items-center ${on ? 'pop' : ''}`}>{icon}</button>
        ) : <span key={n}>{icon}</span>;
      })}
    </div>
  );
}
