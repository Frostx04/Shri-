import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { itineraries, getPlace } from '../lib/data';
import { transportMeta, categoryMeta } from '../lib/meta';
import { formatDuration } from '../lib/time';
import { legBefore, dayStops } from '../lib/travel';
import { PageHeader, Empty } from '../components/ui';
import { PlanButtons } from '../components/PlanButtons';
import { stripPrices } from '../lib/noPrices';

const DayMap = lazy(() => import('../components/map/DayMap').then((m) => ({ default: m.DayMap })));

export default function Itinerary() {
  const { id } = useParams();
  const it = itineraries.find((x) => x.id === id);
  if (!it) return <Empty>Маршрут не найден. <Link to="/places?view=country" className="text-accent underline">Вся Шри-Ланка</Link></Empty>;
  return (
    <div className="pb-6">
      <PageHeader back="/places?view=country" title={`${it.emoji} ${it.title}`} subtitle={`${it.region} · ${it.summary}`} />
      {it.days.map((d, di) => {
        const { numbers } = dayStops(d, getPlace);
        const startId = d.steps.find((s) => s.placeId)?.placeId ?? 'hotel';
        return (
          <section key={di} className="mb-6">
            <h2 className="px-4 pb-2 text-xl">День {di + 1}: {d.emoji} {d.title}</h2>
            <Suspense fallback={<div className="h-[34dvh] animate-pulse bg-surface-2" />}>
              <DayMap day={d} routeKey={`it-${it.id}-${di + 1}`} className="h-[34dvh] w-full" />
            </Suspense>
            {d.backupNote && <p className="mx-4 mt-3 rounded-2xl bg-[#fff4d1] p-3 text-sm text-[#5c4300] dark:bg-[#3a3015] dark:text-[#f7e2a6]">{d.backupNote}</p>}
            <ol className="mt-3 space-y-2 px-4">
              {d.steps.map((s, i) => {
                const p = getPlace(s.placeId);
                const leg = di === 0 && i === 0 ? null : legBefore(d.steps, i, getPlace, startId);
                const n = s.placeId ? numbers.get(s.placeId) : undefined;
                return (
                  <li key={i}>
                    {leg && <p className="mb-1 ml-14 text-sm text-soft">{transportMeta[leg.transport].emoji} ~{formatDuration(leg.min)}, ~{Math.round(leg.km)} км</p>}
                    <div className="flex gap-3">
                      <span className="w-11 shrink-0 pt-2.5 text-right font-extrabold tabular-nums">{s.time}</span>
                      <div className="card min-w-0 flex-1 p-3">
                        <div className="flex gap-2">
                          {n && p && <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: categoryMeta[p.category].color }}>{n}</span>}
                          <div className="min-w-0">
                            <p className="font-bold leading-snug">{s.title}</p>
                            {p && <Link to={`/place/${p.id}`} className="text-sm text-accent">{p.emoji} {p.name}</Link>}
                            <p className="text-sm text-soft">{s.durationMin ? `⏱ ${formatDuration(s.durationMin)} ` : ''}{s.transport ? `${transportMeta[s.transport].emoji} ${transportMeta[s.transport].label} ` : ''}</p>
                            {s.note && stripPrices(s.note) && <p className="mt-1 text-sm">{stripPrices(s.note)}</p>}
                          </div>
                        </div>
                        {p && p.id !== 'hotel' && d.steps.findIndex((x) => x.placeId === p.id) === i && <div className="mt-2"><PlanButtons place={p} compact /></div>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
