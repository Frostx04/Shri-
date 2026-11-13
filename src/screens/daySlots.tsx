import { lazy, Suspense, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { DayPlan } from '../data/schema';
import { dayRouteKey } from '../lib/routes';

const DayMap = lazy(() => import('../components/map/DayMap').then((m) => ({ default: m.DayMap })));

/** Карта дня сверху экрана (40% высоты), сворачивается. Тап по точке — скролл к шагу. */
export function DayMapSlot({ day }: { day: DayPlan }) {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem('sl-daymap') !== '0'; } catch { return true; } });
  const toggle = () => { setOpen(!open); try { localStorage.setItem('sl-daymap', open ? '0' : '1'); } catch { /* */ } };
  const pick = (id: string) => {
    const i = day.steps.findIndex((s) => s.placeId === id);
    document.getElementById(`step-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  return (
    <div className="relative border-b border-line">
      {open && (
        <Suspense fallback={<div className="h-[40dvh] animate-pulse bg-surface-2" />}>
          <DayMap day={day} routeKey={dayRouteKey(day.date)} className="h-[40dvh] w-full" onPick={pick} />
        </Suspense>
      )}
      <button onClick={toggle} className="absolute bottom-0 left-1/2 z-[500] flex -translate-x-1/2 translate-y-1/2 items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-bold shadow"
        aria-expanded={open}>
        {open ? <><ChevronUp size={16} /> Свернуть карту</> : <><ChevronDown size={16} /> Карта дня</>}
      </button>
    </div>
  );
}
