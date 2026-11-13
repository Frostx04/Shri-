import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader, Section } from '../../components/ui';
import { budget, days, info } from '../../lib/data';
import { useSettings, useToday } from '../../lib/settings';
import { fmtLkr, fmtUsd } from '../../lib/money';
import { expenses } from '../../lib/progress';
import { get, set, K, useStoreVersion, type Expense } from '../../lib/store';
import { formatShort } from '../../lib/time';

export default function Budget() {
  useStoreVersion();
  const { settings } = useSettings();
  const { date: today } = useToday();
  const rate = settings.rate;
  const exp = expenses();
  const dayTotals = days.map((d) => ({ d, lkr: get<number>(K.daySpent(d.date)) ?? 0 })).filter((x) => x.lkr > 0);
  const daySum = dayTotals.reduce((s, x) => s + x.lkr, 0);
  const expSum = exp.reduce((s, e) => s + e.lkr, 0);
  const total = daySum + expSum;
  const cash = info.trip.cashUsd;
  const pct = Math.min(1, total / rate / cash);
  const planLo = budget.reduce((s, b) => s + b.planUsd[0], 0), planHi = budget.reduce((s, b) => s + b.planUsd[1], 0);

  const [form, setForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [cur, setCur] = useState<'lkr' | 'usd'>('lkr');
  const [line, setLine] = useState(budget[0].id);
  const add = () => {
    const n = Number(amount.replace(',', '.'));
    if (!n) return;
    const lkr = Math.round(cur === 'usd' ? n * rate : n);
    const date = today >= info.trip.start && today <= info.trip.end ? today : info.trip.start;
    set<Expense>(K.expense(Date.now().toString(36)), { title: title.trim() || budget.find((b) => b.id === line)!.title, lkr, date, budgetId: line });
    setTitle(''); setAmount(''); setForm(false);
  };

  return (
    <div>
      <PageHeader back="/more" title="Бюджет" subtitle={`План $${planLo}–${planHi} · курс ${rate} ₨`} />
      <Section>
        <div className="card p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-soft">Потрачено</p>
              <p className="text-2xl font-extrabold">{fmtUsd(total / rate)} <span className="text-base font-semibold text-soft">из ${cash} наличными</span></p>
              <p className="text-soft">{fmtLkr(total)}</p>
            </div>
            <p className="text-right text-sm text-soft">осталось<br /><b className="text-lg text-[var(--fg)]">{fmtUsd(Math.max(0, cash - total / rate))}</b></p>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Потрачено из наличных">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: pct > 0.9 ? '#e05a5a' : pct > 0.7 ? '#f2b544' : 'var(--color-jungle)' }} />
          </div>
        </div>
      </Section>

      <Section title="По статьям">
        <ul className="card divide-y divide-[var(--line)]">
          {budget.map((b) => {
            const fact = exp.filter((e) => e.budgetId === b.id).reduce((s, e) => s + e.lkr, 0) / rate;
            const over = fact > b.planUsd[1];
            return (
              <li key={b.id} className="px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{b.title}</span>
                  <span className="shrink-0 text-sm"><b className={over ? 'text-[#c23a3a]' : ''}>{fmtUsd(fact)}</b> <span className="text-soft">/ ${b.planUsd[0] === b.planUsd[1] ? b.planUsd[0] : `${b.planUsd[0]}–${b.planUsd[1]}`}</span></span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (fact / b.planUsd[1]) * 100)}%`, background: over ? '#e05a5a' : 'var(--accent)' }} />
                </div>
              </li>
            );
          })}
          <li className="flex items-baseline justify-between px-3 py-2.5">
            <span className="font-semibold">Траты по дням <span className="text-sm font-normal text-soft">(без статьи)</span></span>
            <b>{fmtUsd(daySum / rate)}</b>
          </li>
        </ul>
      </Section>

      <Section title="Добавить трату">
        {form ? (
          <div className="card space-y-2 p-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что: тук-тук, кокос, магнит…" aria-label="Название"
              className="min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3" />
            <div className="flex gap-2">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Сумма" aria-label="Сумма"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-lg font-bold" />
              <div className="grid grid-cols-2 rounded-xl bg-surface-2 p-1 font-bold">
                {(['lkr', 'usd'] as const).map((c) => <button key={c} onClick={() => setCur(c)} className={`min-w-11 rounded-lg ${cur === c ? 'bg-surface shadow-sm' : 'text-soft'}`}>{c === 'lkr' ? '₨' : '$'}</button>)}
              </div>
            </div>
            <select value={line} onChange={(e) => setLine(e.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3" aria-label="Статья">
              {budget.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn" onClick={() => setForm(false)}>Отмена</button>
              <button className="btn btn-primary" onClick={add}>Добавить</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary w-full" onClick={() => setForm(true)}><Plus size={18} /> Трата</button>
        )}
      </Section>

      {(exp.length > 0 || dayTotals.length > 0) && (
        <Section title="История">
          <ul className="card divide-y divide-[var(--line)]">
            {[...exp].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
              <li key={e.id} className="flex items-center gap-2 px-3 py-2">
                <span className="w-12 text-sm text-soft">{formatShort(e.date)}</span>
                <span className="flex-1">{e.title}<span className="block text-xs text-soft">{budget.find((b) => b.id === e.budgetId)?.title}</span></span>
                <b>{fmtLkr(e.lkr)}</b>
                <button onClick={() => confirm('Удалить трату?') && set(K.expense(e.id), null)} aria-label="Удалить" className="grid h-10 w-10 place-items-center text-soft"><Trash2 size={18} /></button>
              </li>
            ))}
            {dayTotals.map(({ d, lkr }) => (
              <li key={d.date}><Link to={`/day/${d.date}`} className="flex items-center gap-2 px-3 py-2">
                <span className="w-12 text-sm text-soft">{formatShort(d.date)}</span>
                <span className="flex-1">{d.emoji} {d.title}<span className="block text-xs text-soft">из плана дня</span></span>
                <b>{fmtLkr(lkr)}</b>
              </Link></li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
