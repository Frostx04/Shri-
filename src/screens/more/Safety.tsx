import { ShieldAlert, Ban, PhoneOff, BookOpen, Link2 } from 'lucide-react';
import { PageHeader, Section } from '../../components/ui';
import { info } from '../../lib/data';
import { stripPriceList } from '../../lib/noPrices';

const linkLabels: Record<string, string> = { cars: 'Машины с водителем (Telegram)', reviews: 'Отзывы о Шри-Ланке (Telegram)', exchange: 'Обмен валют (Telegram)' };

export default function Safety() {
  return (
    <div>
      <PageHeader back="/more" title="Правила и безопасность" subtitle="Прочитать до поездки и перечитать на месте" />
      <Section title="Как ездить и заказывать" icon={<BookOpen size={20} className="text-accent" />}>
        <ul className="card divide-y divide-[var(--line)]">{stripPriceList(info.rules).map((r) => <li key={r} className="p-3">{r}</li>)}</ul>
      </Section>
      <Section title="Безопасность" icon={<ShieldAlert size={20} className="text-accent" />}>
        <ul className="space-y-2">
          {stripPriceList(info.safety).map((r, i) => (
            <li key={r} className={`rounded-2xl p-3 ${i < 3 ? 'border border-[#e9c46a] bg-[#fff4d1] font-semibold text-[#5c4300] dark:border-[#7a6420] dark:bg-[#3a3015] dark:text-[#f7e2a6]' : 'card'}`}>{r}</li>
          ))}
        </ul>
      </Section>
      <Section title="Куда не едем" icon={<Ban size={20} className="text-[#c23a3a]" />}>
        <p className="mb-2 text-sm text-soft">Животные без жестокости — эти варианты не предлагаем.</p>
        <ul className="card divide-y divide-[var(--line)]">{stripPriceList(info.dontGo).map((r) => <li key={r} className="flex gap-2 p-3"><span aria-hidden>⛔</span>{r}</li>)}</ul>
      </Section>
      <Section title="Чёрный список номеров" icon={<PhoneOff size={20} className="text-[#c23a3a]" />}>
        <ul className="space-y-2">
          {info.blacklist.map((b) => (
            <li key={b.phone} className="rounded-2xl border-2 border-[#e05a5a] bg-[#e05a5a]/8 p-3">
              <p className="font-mono font-bold text-[#c23a3a]">{b.phone}</p>
              <p className="text-sm">{b.why.replace(/\s*(~?\$\s?\d[\d\s]*|\d[\d\s]*\s?₨)/g, "")}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Полезные ссылки" icon={<Link2 size={20} className="text-accent" />}>
        <div className="grid gap-2">
          {Object.entries(info.links).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer" className="btn justify-start">{linkLabels[k] ?? k}</a>)}
        </div>
      </Section>
    </div>
  );
}
