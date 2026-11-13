import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Download, Upload, Link2, Trash2, Cloud, CloudOff } from 'lucide-react';
import { Section } from '../../components/ui';
import { useSettings } from '../../lib/settings';
import { syncAvailable, startSync, syncNow, getSyncState, onSyncState, randomTripCode, exportData, importData, exportLink, type SyncState } from '../../lib/sync';
import { resetAll } from '../../lib/store';
import { copyText } from '../../components/MessageBox';

export function SyncSection() {
  const { settings, update } = useSettings();
  const [code, setCode] = useState(settings.syncCode);
  const [st, setSt] = useState<SyncState>(getSyncState());
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { const off = onSyncState(setSt); return () => { off(); }; }, []);

  const save = () => {
    const c = code.trim().toLowerCase();
    update({ syncCode: c });
    startSync(c);
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sri-lanka-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const upload = async (f: File) => {
    try { setMsg(`Импортировано записей: ${importData(JSON.parse(await f.text()))}`); }
    catch (e) { setMsg(`Ошибка: ${(e as Error).message}`); }
  };
  const share = async () => {
    const link = await exportLink();
    if (navigator.share) { try { await navigator.share({ title: 'Прогресс поездки', url: link }); return; } catch { /* отмена */ } }
    setMsg((await copyText(link)) ? 'Ссылка скопирована — отправьте её на второй телефон' : link);
  };

  return (
    <>
      <Section title="Синхронизация">
        <div className="card space-y-3 p-4">
          {syncAvailable ? (
            <>
              <p className="text-sm text-soft">Общий «код поездки» на обоих телефонах — и галочки, оценки, заметки, траты и брони совпадут. Свои фото остаются на телефоне.</p>
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="код поездки" aria-label="Код поездки" autoCapitalize="none" spellCheck={false}
                  className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 font-mono" />
                <button className="btn" onClick={() => setCode(randomTripCode())}>Новый</button>
              </div>
              <button className="btn btn-primary w-full" onClick={save} disabled={code.trim().length < 8}><Cloud size={18} /> {settings.syncCode ? 'Сохранить код' : 'Включить синхронизацию'}</button>
              {settings.syncCode && (
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className={st.status === 'error' ? 'text-[#c23a3a]' : 'text-soft'}>
                    {st.status === 'syncing' ? 'Синхронизация…' : st.status === 'error' ? `Ошибка: ${st.error}` : st.lastSync ? `Синхронизировано в ${new Date(st.lastSync).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}` : 'Ожидание'}
                  </span>
                  <button className="btn min-h-10 px-3" onClick={() => syncNow(settings.syncCode, true)} aria-label="Синхронизировать сейчас"><RefreshCw size={16} className={st.status === 'syncing' ? 'animate-spin' : ''} /></button>
                </div>
              )}
            </>
          ) : (
            <p className="flex gap-2 text-sm text-soft"><CloudOff size={18} className="shrink-0" /> Синхронизация выключена: при сборке не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY (см. README). Пока можно переносить прогресс файлом или ссылкой.</p>
          )}
        </div>
      </Section>
      <Section title="Экспорт и импорт">
        <div className="card grid gap-2 p-4">
          <button className="btn" onClick={share}><Link2 size={18} /> Отправить ссылкой</button>
          <button className="btn" onClick={download}><Download size={18} /> Скачать файл (JSON)</button>
          <button className="btn" onClick={() => file.current?.click()}><Upload size={18} /> Загрузить файл</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          {msg && <p className="break-all rounded-xl bg-surface-2 p-2 text-sm">{msg}</p>}
          <p className="text-xs text-soft">При импорте побеждает более свежая запись — ничего не затрётся старым.</p>
          <button className="btn mt-2 text-[#c23a3a]" onClick={async () => { if (confirm('Стереть весь прогресс на этом телефоне? Фото останутся.')) { await resetAll(); setMsg('Прогресс сброшен'); } }}>
            <Trash2 size={18} /> Сбросить прогресс
          </button>
        </div>
      </Section>
    </>
  );
}
