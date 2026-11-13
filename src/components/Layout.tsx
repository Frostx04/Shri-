import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarHeart, Sun, Map, MapPin, Menu, PawPrint } from 'lucide-react';
import { useEffect } from 'react';
import { OfflineBanner } from './OfflineBanner';

const left = [
  { to: '/', label: 'Календарь', icon: CalendarHeart, end: true },
  { to: '/today', label: 'Сегодня', icon: Sun },
  { to: '/map', label: 'Карта', icon: Map },
];
const right = [
  { to: '/places', label: 'Места', icon: MapPin },
  { to: '/more', label: 'Ещё', icon: Menu },
];

function Tab({ to, label, icon: Icon, end }: (typeof left)[number]) {
  return (
    <li className="min-w-0 flex-1">
      <NavLink to={to} end={end}
        className={({ isActive }) => `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[0.68rem] font-semibold transition-colors ${isActive ? 'text-accent' : 'text-soft'}`}>
        {({ isActive }) => (<><Icon size={23} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden /><span className="truncate">{label}</span></>)}
      </NavLink>
    </li>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/map')) window.scrollTo(0, 0);
  }, [pathname]);
  const onAnimals = pathname.startsWith('/animals');
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <OfflineBanner />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav aria-label="Основная навигация" className="safe-bottom fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-surface/95 backdrop-blur">
        <ul className="mx-auto flex max-w-xl items-stretch">
          {left.map((t) => <Tab key={t.to} {...t} />)}
          <li className="relative w-[4.6rem] shrink-0">
            <NavLink to="/animals" aria-label="Зверушки"
              className={`paw-btn absolute left-1/2 top-0 grid h-[3.9rem] w-[3.9rem] -translate-x-1/2 -translate-y-[38%] place-items-center rounded-full text-white transition-transform active:scale-95 ${onAnimals ? 'bg-[var(--color-jungle)]' : 'bg-[var(--color-coral)]'}`}>
              <PawPrint size={30} strokeWidth={2.2} aria-hidden />
            </NavLink>
            <span className={`absolute inset-x-0 bottom-1.5 text-center text-[0.68rem] font-semibold ${onAnimals ? 'text-[var(--color-jungle)]' : 'text-soft'}`}>Зверушки</span>
          </li>
          {right.map((t) => <Tab key={t.to} {...t} />)}
        </ul>
      </nav>
    </div>
  );
}
