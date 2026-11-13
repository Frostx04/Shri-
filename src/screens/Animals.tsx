import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { Animal } from '../data/schema';
import { animals, getPlace } from '../lib/data';
import { groupMeta, chanceMeta, inTrip, seenOf, levelFor } from '../lib/animals';
import { useStoreVersion } from '../lib/store';
import { formatShort } from '../lib/time';
import { PageHeader } from '../components/ui';
import { AnimalScale } from '../components/AnimalScale';
import { AnimalPhoto, AnimalSheet, useAnimalSeen } from '../components/AnimalSheet';
import { Confetti } from '../components/Confetti';

function Card({ a, onOpen }: { a: Animal; onOpen: () => void }) {
  const { seen, toggle } = useAnimalSeen(a.id);
  return (
    <li className={`card relative overflow-hidden ${seen ? 'border-2 border-[var(--color-jungle)]' : ''}`}>
      <button onClick={onOpen} className="block w-full text-left" aria-label={`${a.name}: подробнее`}>
        <AnimalPhoto a={a} className={`aspect-[4/3] w-full transition ${seen ? '' : 'saturate-[.85]'}`} />
        <div className="p-2.5 pb-3">
          <p className="pr-8 font-bold leading-tight">{a.name}</p>
          {seen ? (
            <p className="mt-1 text-xs font-semibold text-[var(--color-jungle)]">✓ {formatShort(seen.at)}{seen.placeId ? ` · ${getPlace(seen.placeId)?.name.split(/[:—(,]/)[0].trim()}` : ''}</p>
          ) : (
            <span className={`chip mt-1 !px-2 !py-0.5 !text-[0.7rem] ${chanceMeta[a.chance].className}`}>{chanceMeta[a.chance].label}</span>
          )}
        </div>
      </button>
      <button onClick={() => toggle()} aria-pressed={!!seen} aria-label={seen ? `${a.name}: снять отметку` : `${a.name}: увидели`}
        className={`absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full border-2 shadow-md transition ${seen ? 'pop border-white bg-[var(--color-jungle)] text-white' : 'border-white/80 bg-black/30 text-white backdrop-blur'}`}>
        {seen ? <Check size={22} strokeWidth={3.5} /> : <span className="text-lg leading-none">{a.emoji}</span>}
      </button>
    </li>
  );
}

type Scope = 'trip' | 'all';
type Show = 'all' | 'seen' | 'left';

export default function Animals() {
  useStoreVersion();
  const [scope, setScope] = useState<Scope>('trip');
  const [show, setShow] = useState<Show>('all');
  const [group, setGroup] = useState<Animal['group'] | null>(null);
  const [open, setOpen] = useState<Animal | null>(null);
  const [party, setParty] = useState(false);

  const base = scope === 'trip' ? animals.filter(inTrip) : animals;
  const seenN = base.filter((a) => seenOf(a.id)).length;
  const list = base.filter((a) => (!group || a.group === group) && (show === 'all' || !!seenOf(a.id) === (show === 'seen')));

  // Конфетти при новом уровне
  const allSeen = animals.filter((a) => seenOf(a.id)).length;
  const prevLevel = useRef(levelFor(allSeen).cur?.n ?? 0);
  useEffect(() => {
    const l = levelFor(allSeen).cur?.n ?? 0;
    if (l > prevLevel.current) setParty(true);
    prevLevel.current = l;
  }, [allSeen]);

  const groups = (Object.keys(groupMeta) as Animal['group'][]).filter((g) => list.some((a) => a.group === g));

  return (
    <div>
      <PageHeader back title="Зверушки" subtitle="Отмечаем всех, кого встретили" />
      <div className="card mx-4 p-4"><AnimalScale seen={seenN} total={base.length} /></div>

      <div className="sticky top-0 z-10 space-y-2 bg-[var(--bg)]/95 px-4 py-2 backdrop-blur">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1 text-sm font-bold">
          {([['trip', '🌴 В этой поездке'], ['all', '🇱🇰 Вся Шри-Ланка']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setScope(v)} className={`min-h-10 rounded-xl ${scope === v ? 'bg-surface shadow-sm' : 'text-soft'}`}>{l}</button>
          ))}
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
          {([['all', 'Все'], ['seen', '✓ Увидели'], ['left', '🔍 Ещё ищем']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setShow(v)} aria-pressed={show === v} className={`chip min-h-9 ${show === v ? 'bg-[var(--accent)] text-white' : ''}`}>{l}</button>
          ))}
          {(Object.keys(groupMeta) as Animal['group'][]).map((g) => (
            <button key={g} onClick={() => setGroup(group === g ? null : g)} aria-pressed={group === g} className={`chip min-h-9 ${group === g ? 'bg-[var(--color-jungle)] text-white' : ''}`}>{groupMeta[g].emoji} {groupMeta[g].label}</button>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <section key={g} className="px-4 pt-3">
          <h2 className="mb-2 text-xl">{groupMeta[g].emoji} {groupMeta[g].label} <span className="font-sans text-base text-soft">{list.filter((a) => a.group === g && seenOf(a.id)).length}/{list.filter((a) => a.group === g).length}</span></h2>
          <ul className="grid grid-cols-2 gap-2.5">
            {list.filter((a) => a.group === g).map((a) => <Card key={a.id} a={a} onOpen={() => setOpen(a)} />)}
          </ul>
        </section>
      ))}
      {list.length === 0 && <p className="p-8 text-center text-soft">{show === 'seen' ? 'Пока никого не отметили — всё впереди!' : 'Всех нашли! 🎉'}</p>}
      <p className="px-4 pt-5 text-center text-xs text-soft">Не трогаем, не кормим, не фотографируемся с животными на цепи. Фото — Wikimedia Commons, авторы на странице «Авторы фото».</p>

      <AnimalSheet a={open} onClose={() => setOpen(null)} />
      {party && <Confetti onDone={() => setParty(false)} />}
    </div>
  );
}
