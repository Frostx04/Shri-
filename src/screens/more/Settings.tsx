import { PageHeader, Section } from '../../components/ui';
import { useSettings } from '../../lib/settings';
import { days } from '../../lib/data';
import { formatDayRu } from '../../lib/time';
import { settingsExtraSections } from './settingsSlots';

export default function Settings() {
  const { settings, update } = useSettings();
  return (
    <div>
      <PageHeader back="/more" title="Настройки" />
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
