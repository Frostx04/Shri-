import { PageHeader, Section } from '../../components/ui';
import { useSettings } from '../../lib/settings';
import { days, info } from '../../lib/data';
import { formatDayRu } from '../../lib/time';
import { settingsExtraSections } from './settingsSlots';

export default function Settings() {
  const { settings, update } = useSettings();
  return (
    <div>
      <PageHeader back="/more" title="Настройки" />
      <Section title="Курс">
        <label className="card flex items-center gap-3 p-4">
          <span className="flex-1 font-semibold">Рупий за $1</span>
          <input type="number" inputMode="decimal" min={100} max={1000} value={settings.rate}
            onChange={(e) => update({ rate: Math.max(1, Number(e.target.value) || info.trip.lkrPerUsd) })}
            className="min-h-11 w-28 rounded-xl border border-line bg-surface-2 px-3 text-right text-lg font-bold" />
        </label>
        <p className="mt-1 px-1 text-sm text-soft">По умолчанию {info.trip.lkrPerUsd}. Обменник в аэропорту 02.11.2026 давал 329,75.</p>
      </Section>

      {settingsExtraSections.map((S, i) => <S key={i} />)}

      <Section title="Проверка: «как будто сегодня»">
        <div className="card p-4">
          <select value={settings.devDate ?? ''} onChange={(e) => update({ devDate: e.target.value || null })}
            className="min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 font-semibold" aria-label="Подменить дату">
            <option value="">Настоящая дата</option>
            <option value="2027-03-01">01.03 — до поездки</option>
            {days.map((d) => <option key={d.date} value={d.date}>{formatDayRu(d.date)} — {d.title}</option>)}
            <option value="2027-03-26">26.03 — после поездки</option>
          </select>
          <p className="mt-2 text-sm text-soft">Меняет «сегодня» во всём приложении: дверки, вкладку «Сегодня», дедлайны броней.</p>
        </div>
      </Section>
    </div>
  );
}
