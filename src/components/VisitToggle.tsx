import { Check } from 'lucide-react';
import { useValue, K, type Visit } from '../lib/store';
import { useToday } from '../lib/settings';

export function VisitToggle({ placeId, compact }: { placeId: string; compact?: boolean }) {
  const [v, setV] = useValue<Visit>(K.visited(placeId));
  const { date } = useToday();
  return (
    <button
      onClick={() => setV(v ? null : { at: date })}
      aria-pressed={!!v}
      className={`btn ${compact ? 'min-h-10 px-3' : ''} ${v ? 'bg-[var(--color-jungle)] text-white' : ''}`}
    >
      <span className={`grid h-5 w-5 place-items-center rounded-md border-2 ${v ? 'pop border-white' : 'border-current opacity-60'}`}>
        {v && <Check size={14} strokeWidth={3.5} />}
      </span>
      {v ? 'Были!' : 'Были'}
    </button>
  );
}
