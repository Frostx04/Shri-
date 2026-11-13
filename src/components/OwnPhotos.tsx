import { useRef, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { addPhotos, deletePhoto, useOwnPhotos, type OwnPhoto } from '../lib/photos';
import { createPortal } from 'react-dom';

export function PhotoGrid({ photos, onDelete }: { photos: OwnPhoto[]; onDelete?: (id: string) => void }) {
  const [open, setOpen] = useState<OwnPhoto | null>(null);
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)} className="aspect-square overflow-hidden rounded-xl" aria-label="Открыть фото">
            <img src={p.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-[2500] flex flex-col bg-black" role="dialog" aria-modal>
          <div className="safe-top flex justify-between p-3">
            {onDelete ? (
              <button className="btn bg-white/15 text-white" onClick={() => { if (confirm('Удалить фото?')) { onDelete(open.id); setOpen(null); } }}><Trash2 size={18} /> Удалить</button>
            ) : <span />}
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white" onClick={() => setOpen(null)} aria-label="Закрыть"><X /></button>
          </div>
          <img src={open.url} alt="" className="min-h-0 flex-1 object-contain" />
        </div>, document.body)}
    </>
  );
}

export function OwnPhotos({ placeId }: { placeId: string }) {
  const photos = useOwnPhotos([placeId]);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      {photos.length > 0 && <PhotoGrid photos={photos} onDelete={deletePhoto} />}
      <input ref={input} type="file" accept="image/*" multiple hidden
        onChange={async (e) => { if (e.target.files?.length) { setBusy(true); try { await addPhotos(placeId, e.target.files); } finally { setBusy(false); e.target.value = ''; } } }} />
      <button className="btn w-full" onClick={() => input.current?.click()} disabled={busy}>
        <ImagePlus size={18} /> {busy ? 'Сжимаем…' : 'Добавить своё фото'}
      </button>
    </div>
  );
}
