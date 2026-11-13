export function ProgressRing({ done, total, size = 76, label }: { done: number; total: number; size?: number; label?: string }) {
  const r = (size - 10) / 2, c = 2 * Math.PI * r, pct = total ? done / total : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label ?? `${done} из ${total}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-jungle)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <span className="font-extrabold">{done}<span className="text-sm text-soft">/{total}</span></span>
      </div>
    </div>
  );
}
