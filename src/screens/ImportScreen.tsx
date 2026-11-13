import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { decodeLink, importData } from '../lib/sync';

export default function ImportScreen() {
  const [sp] = useSearchParams();
  const [data, setData] = useState<unknown>(null);
  const [msg, setMsg] = useState('Читаем ссылку…');
  useEffect(() => {
    const d = sp.get('d');
    if (!d) { setMsg('В ссылке нет данных'); return; }
    decodeLink(d).then((x) => { setData(x); setMsg(''); }).catch(() => setMsg('Ссылка повреждена'));
  }, [sp]);
  const f = data as { exportedAt?: string; entries?: object } | null;
  return (
    <div>
      <PageHeader title="Импорт прогресса" />
      <div className="card mx-4 space-y-3 p-4">
        {msg && <p>{msg}</p>}
        {f?.entries && (
          <>
            <p>Записей: <b>{Object.keys(f.entries).length}</b>, сохранено {f.exportedAt ? new Date(f.exportedAt).toLocaleString('ru') : ''}.</p>
            <p className="text-sm text-soft">Объединим с прогрессом на этом телефоне — свежие записи побеждают.</p>
            <button className="btn btn-primary w-full" onClick={() => { try { setMsg(`Готово, применено: ${importData(data)}`); setData(null); } catch (e) { setMsg((e as Error).message); } }}>Импортировать</button>
          </>
        )}
        <Link to="/" className="btn w-full">На главную</Link>
      </div>
    </div>
  );
}
