import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" role="dialog" aria-modal aria-label={label}>
      <button className="backdrop absolute inset-0 bg-black/45" onClick={onClose} aria-label="Закрыть" />
      <div className="sheet safe-bottom relative max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-t-[24px] bg-[var(--bg)] p-4 pb-6">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--line)]" />
        {children}
      </div>
    </div>,
    document.body,
  );
}
