import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Нижняя шторка. Закрывается: свайпом вниз (когда содержимое прокручено к началу),
 * кнопкой ✕, тапом по фону и клавишей Esc. Пока открыта — страница под ней не прокручивается.
 */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    addEventListener('keydown', k);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = prevOverflow; };
  }, [open]);

  // Свайп вниз: обычные (не пассивные) обработчики, чтобы можно было остановить «резинку» iOS.
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    let startY = 0, startT = 0, dy = 0, dragging = false, tracking = false;
    const set = (y: number, anim: boolean) => {
      el.style.transition = anim ? 'transform .22s cubic-bezier(.2,.8,.2,1)' : 'none';
      el.style.transform = y ? `translateY(${y}px)` : '';
    };
    const start = (e: TouchEvent) => {
      tracking = true; dragging = false; dy = 0;
      startY = e.touches[0].clientY; startT = Date.now();
    };
    const move = (e: TouchEvent) => {
      if (!tracking) return;
      dy = e.touches[0].clientY - startY;
      if (!dragging && dy > 6 && el.scrollTop <= 0) dragging = true;
      if (dragging) {
        if (dy < 0) { dragging = false; set(0, false); return; }
        e.preventDefault();
        set(dy, false);
      }
    };
    const end = () => {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      const fast = dy / Math.max(1, Date.now() - startT) > 0.5;
      if (dy > 110 || (fast && dy > 40)) {
        set(el.offsetHeight, true);
        setTimeout(() => closeRef.current(), 200);
      } else set(0, true);
      dragging = false;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end justify-center" role="dialog" aria-modal aria-label={label}>
      <button className="backdrop absolute inset-0 bg-black/45" onClick={onClose} aria-label="Закрыть" />
      <div ref={ref} className="sheet safe-bottom relative max-h-[88dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-[24px] bg-[var(--bg)] px-4 pb-6">
        <div className="sticky top-0 z-10 -mx-4 flex h-11 items-center justify-center rounded-t-[24px] bg-[var(--bg)]">
          <span className="h-1.5 w-12 rounded-full bg-[var(--line)]" aria-hidden />
          <button onClick={onClose} aria-label="Закрыть"
            className="absolute right-2 top-1 grid h-10 w-10 place-items-center rounded-full text-soft active:bg-surface-2">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
