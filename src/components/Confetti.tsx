import { useEffect, useRef } from 'react';

const COLORS = ['#e8684a', '#0f8b8d', '#f2b544', '#2f7d4a', '#ff9ec4', '#5fd0c4'];

/** Лёгкое конфетти на canvas, без библиотек. Уважает prefers-reduced-motion. */
export function Confetti({ onDone }: { onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onDone?.(); return; }
    const c = ref.current!, ctx = c.getContext('2d')!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const parts = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80, y: innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, c: COLORS[(Math.random() * COLORS.length) | 0],
    }));
    let raf = 0, t = 0;
    const tick = () => {
      t++;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - t / 160);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
        ctx.restore();
      }
      if (t < 160) raf = requestAnimationFrame(tick); else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[3000] h-full w-full" aria-hidden />;
}
