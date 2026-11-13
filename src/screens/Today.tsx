import { Link } from 'react-router-dom';
import { days, dayByDate, info } from '../lib/data';
import { useToday } from '../lib/settings';
import { DayView } from './Day';
import { PageHeader } from '../components/ui';
import { formatDayRu, diffDays, plural } from '../lib/time';
import { moodMeta } from '../lib/meta';

export default function Today() {
  const { date, time } = useToday();
  const day = dayByDate.get(date);
  if (day) return <DayView day={day} back={false} />;
  const before = date < info.trip.start;
  const first = days[0];
  const n = diffDays(info.trip.start, date);
  return (
    <div>
      <PageHeader title={before ? 'Сегодня — ещё дома' : 'Поездка позади'} subtitle={`${formatDayRu(date)}, ${time} по Шри-Ланке`} />
      {before ? (
        <div className="space-y-3 px-4">
          <p className="text-lg">До вылета {n} {plural(n, 'день', 'дня', 'дней')}. А пока — готовимся:</p>
          <Link to="/more/bookings" className="card block p-4"><b>✍️ Брони</b><p className="text-soft">Кому и когда писать: ближайшие дедлайны</p></Link>
          <Link to={`/day/${first.date}`} className="card block overflow-hidden">
            <div className="p-4 text-white" style={{ background: moodMeta[first.mood].bg }}>
              <p className="font-semibold opacity-90">Первый день · {formatDayRu(first.date)}</p>
              <p className="font-display text-2xl">{first.emoji} {first.title}</p>
            </div>
          </Link>
          <Link to="/more/safety" className="card block p-4"><b>🛟 Правила и безопасность</b><p className="text-soft">Прочитать до поездки</p></Link>
        </div>
      ) : (
        <div className="px-4"><Link to="/" className="btn btn-primary">🎁 Итоги на главной</Link></div>
      )}
    </div>
  );
}
