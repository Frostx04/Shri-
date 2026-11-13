import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarHeart, Sun, Map, MapPin, Menu } from 'lucide-react';
import { useEffect } from 'react';

const tabs = [
  { to: '/', label: 'Календарь', icon: CalendarHeart, end: true },
  { to: '/today', label: 'Сегодня', icon: Sun },
  { to: '/map', label: 'Карта', icon: Map },
  { to: '/places', label: 'Места', icon: MapPin },
  { to: '/more', label: 'Ещё', icon: Menu },
];

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/map')) window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav
        aria-label="Основная навигация"
        className="safe-bottom fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-surface/95 backdrop-blur"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[0.72rem] font-semibold transition-colors ${
                    isActive ? 'text-accent' : 'text-soft'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={24} strokeWidth={isActive ? 2.4 : 1.8} aria-hidden />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
