import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, Sparkles } from 'lucide-react';
import type { Animal } from '../data/schema';
import { animals, getPlace } from '../lib/data';
import { familyMeta, familyOrder, familyAnimals, byChance, chanceMeta, inTrip, seenOf, levelFor, starOfDay, type Family } from '../lib/animals';
import { useStoreVersion } from '../lib/store';
import { useToday } from '../lib/settings';
import { formatShort } from '../lib/time';
import { photoUrl } from '../components/PlaceVisual';
import { AnimalScale } from '../components/AnimalScale';
import { AnimalPhoto, AnimalSheet, useAnimalSeen } from '../components/AnimalSheet';
import { Confetti } from '../components/Confetti';

/** Конфетти при переходе на новый уровень шкалы. */
function useLevelParty() {
  const all = animals.filter((a) => seenOf(a.id)).length;
  const prev = useRef(levelFor(all).cur?.n ?? 0);
  const [party, setParty] = useState(false);
  useEffect(() => {
    const l = levelFor(all).cur?.n ?? 0;
    if (l > prev.current) setParty(true);
    prev.current = l;
  }, [all]);
  return party ? <Confetti onDone={() => setParty(false)} /> : null;
}

const cover = (f: Family) => animals.find((a) => a.id === familyMeta[f].cover && a.photos.length) ?? familyAnimals(f).find((a) => a.photos.length);

function FamilyTile({ f, big }: { f: Family; big?: boolean }) {
  const m = familyMeta[f];
  const list = familyAnimals(f);
  const seen = list.filter((a) => seenOf(a.id)).length;
  const c = cover(f);
  return (
    <Link to={`/animals/${f}`} className={`relative block overflow-hidden rounded-[22px] text-white shadow-md active:scale-[0.98] transition-transform ${big ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/5]'}`}
      style={{ background: m.color }} aria-label={`${m.label}: ${seen} из ${list.length}`}>
      {c && <img src={photoUrl(c.photos[0].src)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 35%, ${m.color}ee 88%)` }} />
      <span className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-2xl shadow">{m.emoji}</span>
      {seen > 0 && <span className="absolute right-3 top-3 rounded-full bg-[var(--color-jungle)] px-2 py-0.5 text-sm font-extrabold">✓ {seen}</span>}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className={`font-display leading-tight drop-shadow ${big ? 'text-[1.6rem]' : 'text-[1.15rem]'}`}>{m.label}</p>
        {big && <p className="mt-0.5 text-sm opacity-90">{m.blurb}</p>}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{ width: `${(seen / list.length) * 100}%` }} /></div>
          <span className="text-xs font-bold">{seen}/{list.length}</span>
        </div>
      </div>
    </Link>
  );
}

function StarOfDay() {
  const { date } = useToday();
  const a = starOfDay(date);
  const [open, setOpen] = useState(false);
  if (!a) return null;
  const fam = familyMeta[a.family];
  return (
    <>
      <button onClick={() => setOpen(true)} className="card flex w-full items-center gap-3 overflow-hidden p-2 pr-3 text-left">
        <AnimalPhoto a={a} className="h-20 w-20 shrink-0 rounded-2xl" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--color-coral)]"><Sparkles size={14} /> Зверушка дня</span>
          <span className="block font-display text-xl leading-tight">{a.name}</span>
          <span className="line-clamp-2 text-sm text-soft">{a.note || fam.blurb}</span>
        </span>
      </button>
      <AnimalSheet a={open ? a : null} onClose={() => setOpen(false)} />
    </>
  );
}

export function AnimalsHub() {
  useStoreVersion();
  const party = useLevelParty();
  const trip = animals.filter(inTrip);
  const [big1, big2, ...rest] = familyOrder.filter((f) => familyAnimals(f).length);
  return (
    <div className="pb-4">
      <header className="jungle-bg leaf-pattern safe-top relative overflow-hidden px-4 pb-16 pt-5 text-white">
        <div className="hang right-6 top-0" style={{ ['--vine' as string]: '34px' }}><span className="text-4xl">🦇</span></div>
        <div className="hang right-20 top-0" style={{ ['--vine' as string]: '14px', animationDelay: '-1.4s' }}><span className="text-2xl">🦇</span></div>
        <p className="text-sm font-semibold uppercase tracking-wider opacity-85">Альбом наклеек</p>
        <h1 className="text-[2.3rem] leading-tight">Зверушки<br />Шри-Ланки</h1>
        <p className="mt-1 max-w-[16rem] opacity-90">{animals.length} видов — от гигантских белок до летучих лисиц</p>
        <span className="peek bottom-0 left-[62%] text-5xl" aria-hidden>🐿️</span>
      </header>
      <div className="card relative -mt-10 mx-4 p-4"><AnimalScale seen={trip.filter((a) => seenOf(a.id)).length} total={trip.length} /></div>
      <div className="mx-4 mt-3"><StarOfDay /></div>
      <div className="mt-4 grid grid-cols-2 gap-3 px-4">
        {big1 && <FamilyTile f={big1} big />}
        {big2 && <FamilyTile f={big2} big />}
        {rest.map((f) => <FamilyTile key={f} f={f} />)}
      </div>
      <p className="px-6 pt-5 text-center text-xs text-soft">Не трогаем, не кормим, не фотографируемся с животными на цепи. Фото — iNaturalist, Flickr, Wikimedia; авторы — в «Ещё → Авторы фото».</p>
      {party}
    </div>
  );
}

function Sticker({ a, i, onOpen }: { a: Animal; i: number; onOpen: () => void }) {
  const { seen, toggle } = useAnimalSeen(a.id);
  const tilt = seen ? ((i % 3) - 1) * 1.6 : 0;
  return (
    <li className="relative">
      <button onClick={onOpen} className={`sticker block w-full overflow-hidden rounded-[18px] border-[5px] bg-surface text-left ${seen ? 'is-seen border-white' : 'border-dashed border-[var(--line)]'}`}
        style={{ transform: `rotate(${tilt}deg)` }} aria-label={`${a.name}: подробнее`}>
        <AnimalPhoto a={a} className={`aspect-square w-full ${seen ? '' : 'is-new sticker'}`} />
        <div className="px-2 pb-2.5 pt-1.5">
          <p className="font-bold leading-tight">{a.name}</p>
          {seen ? (
            <p className="mt-0.5 text-xs font-semibold text-[var(--color-jungle)]">{formatShort(seen.at)}{seen.placeId ? ` · ${getPlace(seen.placeId)?.name.split(/[:—(,]/)[0].trim()}` : ''}</p>
          ) : (
            <span className={`chip mt-1 !px-2 !py-0.5 !text-[0.68rem] ${chanceMeta[a.chance].className}`}>{chanceMeta[a.chance].label}</span>
          )}
        </div>
      </button>
      {seen && <span className="stamp pointer-events-none absolute left-2 top-[38%] bg-white/85 text-sm text-[var(--color-jungle)]">увидели!</span>}
      <button onClick={() => toggle()} aria-pressed={!!seen} aria-label={seen ? `${a.name}: снять отметку` : `${a.name}: увидели`}
        className={`absolute -right-1 -top-1 grid h-11 w-11 place-items-center rounded-full border-[3px] border-white shadow-md transition ${seen ? 'pop bg-[var(--color-jungle)] text-white' : 'bg-[var(--color-coral)] text-white'}`}>
        {seen ? <Check size={22} strokeWidth={3.5} /> : <span className="text-xl leading-none">{a.emoji}</span>}
      </button>
    </li>
  );
}

export function AnimalFamily() {
  useStoreVersion();
  const { family } = useParams();
  const nav = useNavigate();
  const party = useLevelParty();
  const [open, setOpen] = useState<Animal | null>(null);
  const f = (family && family in familyMeta ? family : 'squirrels') as Family;
  const m = familyMeta[f];
  const list = familyAnimals(f).sort(byChance);
  const seen = list.filter((a) => seenOf(a.id)).length;
  const c = cover(f);
  const idx = familyOrder.indexOf(f);
  const prev = familyOrder[idx - 1], next = familyOrder[idx + 1];
  return (
    <div className="pb-6">
      <header className="safe-top relative overflow-hidden px-4 pb-6 pt-4 text-white" style={{ background: m.color }}>
        {c && <img src={photoUrl(c.photos[0].src)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${m.color}55, ${m.color}f0)` }} />
        <div className="relative">
          <button onClick={() => nav('/animals')} className="-ml-2 grid h-11 w-11 place-items-center rounded-full bg-black/20" aria-label="Ко всем зверушкам"><ChevronLeft size={26} /></button>
          <p className="mt-2 text-5xl">{m.emoji}</p>
          <h1 className="text-[2rem] leading-tight">{m.label}</h1>
          <p className="opacity-90">{m.blurb}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${(seen / list.length) * 100}%` }} /></div>
            <span className="font-extrabold">{seen} из {list.length}</span>
          </div>
        </div>
      </header>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-4 px-4 pt-5">
        {list.map((a, i) => <Sticker key={a.id} a={a} i={i} onOpen={() => setOpen(a)} />)}
      </ul>
      <nav className="mt-6 flex justify-between gap-2 px-4" aria-label="Другие семейства">
        {prev ? <Link to={`/animals/${prev}`} className="btn min-w-0"><span className="truncate">← {familyMeta[prev].emoji} {familyMeta[prev].label}</span></Link> : <span />}
        {next && <Link to={`/animals/${next}`} className="btn min-w-0"><span className="truncate">{familyMeta[next].emoji} {familyMeta[next].label} →</span></Link>}
      </nav>
      <AnimalSheet a={open} onClose={() => setOpen(null)} />
      {party}
    </div>
  );
}

export default AnimalsHub;
