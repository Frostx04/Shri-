import type { Place } from '../data/schema';
import { tierMeta, stomachMeta, categoryMeta } from '../lib/meta';
import { useSettings } from '../lib/settings';
import { formatCost } from '../lib/money';

export function TierBadge({ tier }: { tier: Place['tier'] }) {
  return <span className={`chip ${tierMeta[tier].className}`}>{tierMeta[tier].short}</span>;
}

export function StomachBadge({ stomach }: { stomach?: Place['stomach'] }) {
  if (!stomach) return null;
  const m = stomachMeta[stomach];
  return <span className={`chip ${m.className}`}>{m.emoji} {m.label}</span>;
}

export function CategoryBadge({ category }: { category: Place['category'] }) {
  const m = categoryMeta[category];
  return (
    <span className="chip" style={{ background: m.color + '22', color: m.color }}>
      {m.emoji} {m.label}
    </span>
  );
}

export function Cost({ lkr, usd, className = '' }: { lkr?: [number, number]; usd?: [number, number]; className?: string }) {
  const { settings } = useSettings();
  const c = formatCost(lkr, usd, settings.rate);
  if (!c) return null;
  return (
    <span className={className}>
      <span className="font-bold">{c.main}</span>
      {c.sub && <span className="text-soft"> ({c.sub})</span>}
    </span>
  );
}
