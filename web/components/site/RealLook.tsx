'use client';
import { useEffect, useRef } from 'react';
import { applyVintage } from '@/lib/filters';
import { STYLES } from '@/lib/filters';

/**
 * Renders a sample photo through the SAME per-pixel look engine the studio uses,
 * so the landing page shows each look accurately (CSS filters only approximate them).
 */
export default function RealLook({ src, alt, look, w = 480, h = 360 }: { src: string; alt: string; look: string; w?: number; h?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const style = STYLES.find((s) => s.id === look);
    const img = new Image(); img.decoding = 'async'; img.src = src;
    let alive = true;
    img.onload = () => {
      if (!alive || !ref.current) return;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight), sw = w / k, sh = h / k;
      c.getContext('2d')!.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) * 0.32, sw, sh, 0, 0, w, h);
      const out = style && style.id !== 'original' ? applyVintage(c, style.look) : c;
      const ctx = ref.current.getContext('2d')!; ref.current.width = w; ref.current.height = h; ctx.drawImage(out, 0, 0);
    };
    return () => { alive = false; };
  }, [src, look, w, h]);
  return <canvas ref={ref} width={w} height={h} role="img" aria-label={alt} className="real-look" />;
}
