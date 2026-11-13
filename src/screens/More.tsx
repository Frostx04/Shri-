import { Link, Route, Routes } from 'react-router-dom';
import { PawPrint, Wallet, CalendarCheck, ShieldAlert, Siren, MessageSquareText, Settings as SettingsIcon, Camera, ChevronRight, UtensilsCrossed, Globe2 } from 'lucide-react';
import { PageHeader } from '../components/ui';
import Messages from './more/Messages';
import Settings from './more/Settings';
import Budget from './more/Budget';
import Bookings from './more/Bookings';
import Credits from './more/Credits';
import Safety from './more/Safety';
import Emergency from './more/Emergency';

const items = [
  { to: '/animals', label: 'Зверушки', icon: PawPrint, hint: 'шкала: кого мы уже встретили' },
  { to: 'budget', label: 'Бюджет', icon: Wallet, hint: 'план и факт, $2000 наличными' },
  { to: 'bookings', label: 'Брони', icon: CalendarCheck, hint: 'кому и когда писать' },
  { to: '/places?view=food', label: 'Еда', icon: UtensilsCrossed, hint: 'кафе, меню и цены' },
  { to: '/places?view=country', label: 'Вся Шри-Ланка', icon: Globe2, hint: 'карта страны и мини-маршруты' },
  { to: 'safety', label: 'Правила и безопасность', icon: ShieldAlert, hint: 'океан, бешенство, куда не ехать' },
  { to: 'emergency', label: 'Экстренное', icon: Siren, hint: 'номера и больницы' },
  { to: 'messages', label: 'Сообщения', icon: MessageSquareText, hint: 'все шаблоны' },
  { to: 'settings', label: 'Настройки', icon: SettingsIcon, hint: 'курс, синхронизация, экспорт' },
  { to: 'credits', label: 'Авторы фото', icon: Camera, hint: 'лицензии' },
];

export const moreRoutes: { path: string; element: React.ReactNode }[] = [
  { path: 'messages', element: <Messages /> },
  { path: 'settings', element: <Settings /> },
  { path: 'budget', element: <Budget /> },
  { path: 'bookings', element: <Bookings /> },
  { path: 'credits', element: <Credits /> },
  { path: 'safety', element: <Safety /> },
  { path: 'emergency', element: <Emergency /> },
];

function Menu() {
  return (
    <div>
      <PageHeader title="Ещё" />
      <ul className="card mx-4 divide-y divide-[var(--line)] overflow-hidden">
        {items.map(({ to, label, icon: Icon, hint }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 items-center gap-3 px-4 py-2.5 active:bg-surface-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/12 text-accent"><Icon size={22} /></span>
              <span className="flex-1"><span className="block font-bold">{label}</span><span className="text-sm text-soft">{hint}</span></span>
              <ChevronRight size={20} className="text-soft" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function More() {
  return (
    <Routes>
      <Route index element={<Menu />} />
      {moreRoutes.map((r) => <Route key={r.path} path={r.path} element={r.element} />)}
      <Route path="*" element={<PageHeader back="/more" title="Скоро" subtitle="Этот раздел появится на следующих этапах" />} />
    </Routes>
  );
}
