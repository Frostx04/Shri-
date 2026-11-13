import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Place, MenuItem } from '../data/schema';
import { useValue, K } from '../lib/store';
import { useToday, useSettings } from '../lib/settings';
import { fmtLkr, fmtUsd } from '../lib/money';
import { formatShort } from '../lib/time';

/** Своё меню: «сфотографировали ценник и записали» — правится прямо с телефона и синхронизируется. */
export function PlaceMenuExtra({ place }: { place: Place }) {
  const [items, setItems] = useValue<MenuItem[]>(K.menu(place.id));
  const { date } = useToday();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [spicy, setSpicy] = useState(false);
  const list = items ?? [];
  const add = () => {
    const priceLkr = Number(price);
    if (!name.trim() || !priceLkr) return;
    setItems([...list, { name: name.trim(), priceLkr, stomach: spicy ? 'spicy' : 'ok', checkedAt: date }]);
    setName(''); setPrice(''); setSpicy(false); setOpen(false);
  };
  return (
    <section className="px-4 py-2">
      {list.length > 0 && (
        <>
          <h3 className="mb-1.5 font-sans text-sm font-bold text-soft">Наши записи</h3>
          <ul className="card mb-2 divide-y divide-[var(--line)]">
            {list.map((m, i) => (
              <li key={i} className="flex items-center gap-2 px-3 py-2">
                <span className="flex-1">{m.name}{m.stomach === 'spicy' && ' 🌶️'}</span>
                <span className="text-right font-bold">{fmtLkr(m.priceLkr)}<span className="block text-xs font-normal text-soft">~{fmtUsd(m.priceLkr / settings.rate)}{m.checkedAt ? ` · ${formatShort(m.checkedAt)}` : ''}</span></span>
                <button onClick={() => setItems(list.filter((_, k) => k !== i))} aria-label={`Удалить ${m.name}`} className="grid h-10 w-10 place-items-center text-soft"><Trash2 size={18} /></button>
              </li>
            ))}
          </ul>
        </>
      )}
      {open ? (
        <div className="card space-y-2 p-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Блюдо, напр. Chicken kottu" aria-label="Название блюда"
            className="min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3" />
          <div className="flex gap-2">
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Цена, ₨" aria-label="Цена в рупиях"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3" />
            <label className="flex items-center gap-2 rounded-xl bg-surface-2 px-3"><input type="checkbox" checked={spicy} onChange={(e) => setSpicy(e.target.checked)} className="h-5 w-5" /> 🌶️ остро</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn" onClick={() => setOpen(false)}>Отмена</button>
            <button className="btn btn-primary" onClick={add}>Сохранить</button>
          </div>
        </div>
      ) : (
        <button className="btn w-full" onClick={() => setOpen(true)}><Plus size={18} /> Добавить блюдо и цену</button>
      )}
    </section>
  );
}
