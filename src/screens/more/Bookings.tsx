import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import { MessageBox } from '../../components/MessageBox';
import { allBookings, bookingStatusMeta, urgency, type Booking } from '../../lib/bookings';
import { useValue, K, type BookingStatus, useStoreVersion, get } from '../../lib/store';
import { useToday } from '../../lib/settings';
import { formatDayRu, diffDays, plural } from '../../lib/time';

function Row({ b, today }: { b: Booking; today: string }) {
  const [status = 'none', setStatus] = useValue<BookingStatus>(K.booking(b.place.id));
  const [open, setOpen] = useState(false);
  const u = urgency(b, status, today);
  const left = diffDays(b.deadline, today);
  const m = bookingStatusMeta[status];
  return (
    <li className={`card overflow-hidden ${u === 'overdue' ? 'border-2 border-[#e05a5a]' : u === 'soon' ? 'border-2 border-[#f2b544]' : ''}`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/place/${b.place.id}`} className="font-bold leading-snug">{b.place.emoji} {b.place.name}</Link>
            <p className="text-sm text-soft">Поездка: {formatDayRu(b.date)}</p>
          </div>
          <button onClick={() => setStatus(m.next === 'none' ? null : m.next)} className={`chip min-h-10 shrink-0 ${m.className}`} aria-label={`Статус: ${m.label}. Нажмите, чтобы сменить`}>
            {m.label}
          </button>
        </div>
        <p className={`mt-2 font-semibold ${u === 'overdue' ? 'text-[#c23a3a]' : ''}`}>
          {u === 'overdue' && <AlertCircle size={16} className="mr-1 inline" />}
          Написать до {formatDayRu(b.deadline)}
          {u !== 'done' && <span className="font-normal text-soft"> · {left < 0 ? `просрочено на ${-left} ${plural(-left, 'день', 'дня', 'дней')}` : left === 0 ? 'сегодня!' : `через ${left} ${plural(left, 'день', 'дня', 'дней')}`}</span>}
        </p>
        <p className="mt-1 text-sm">{b.note}</p>
        {b.templates.length > 0 && (
          <button onClick={() => setOpen(!open)} className="mt-2 flex items-center gap-1 text-sm font-bold text-accent" aria-expanded={open}>
            Сообщение <ChevronDown size={16} className={open ? 'rotate-180' : ''} />
          </button>
        )}
      </div>
      {open && <div className="space-y-2 bg-surface-2 p-2">{b.templates.map((t) => <MessageBox key={t.id} tpl={t} contacts={b.place.contacts} />)}</div>}
    </li>
  );
}

export default function Bookings() {
  useStoreVersion();
  const { date: today } = useToday();
  const list = allBookings();
  const done = list.filter((b) => ['confirmed', 'paid'].includes(get<BookingStatus>(K.booking(b.place.id)) ?? 'none')).length;
  return (
    <div>
      <PageHeader back="/more" title="Брони" subtitle={`Подтверждено ${done} из ${list.length}. Статус меняется нажатием.`} />
      <p className="mx-4 mb-3 rounded-2xl bg-surface-2 p-3 text-sm">Пишем в WhatsApp, не звоним. Предоплату не отправляем — платим наличными на месте.</p>
      <ul className="space-y-3 px-4">{list.map((b) => <Row key={b.place.id} b={b} today={today} />)}</ul>
    </div>
  );
}
