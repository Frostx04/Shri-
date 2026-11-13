import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export function PageHeader({ title, subtitle, back, right }: { title: ReactNode; subtitle?: ReactNode; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <header className="safe-top flex items-start gap-2 px-4 pb-3 pt-4">
      {back && (
        <button
          className="-ml-2 mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full"
          aria-label="Назад"
          onClick={() => (typeof back === 'string' ? nav(back) : window.history.length > 1 ? nav(-1) : nav('/'))}
        >
          <ChevronLeft size={28} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[1.75rem] leading-tight">{title}</h1>
        {subtitle && <div className="mt-1 text-soft">{subtitle}</div>}
      </div>
      {right}
    </header>
  );
}

export function Section({ title, icon, children, className = '' }: { title?: ReactNode; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`px-4 py-3 ${className}`}>
      {title && (
        <h2 className="mb-2 flex items-center gap-2 text-[1.2rem]">
          {icon}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="card m-4 p-6 text-center text-soft">{children}</div>;
}
