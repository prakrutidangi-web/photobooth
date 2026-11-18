'use client';
import { useEffect, useRef, useState } from 'react';
import { photos } from '@/lib/photos';
import { STYLES } from '@/lib/filters';
import { FRAMES, LAYOUTS, buildBase } from '@/lib/studio';
import type { Pose } from '@/lib/poses';

/** Order the sample photos appear in the preview (varied people, not 01-02-03...). */
const ORDER = [1, 8, 3, 0, 9, 5];
let rawPromise: Promise<HTMLCanvasElement[]> | null = null;
function loadRaw() {
  rawPromise ??= Promise.all(ORDER.map((i) => new Promise<HTMLCanvasElement>((res) => {
    const img = new Image(); img.decoding = 'async'; img.src = photos[i % photos.length].src;
    img.onload = () => { const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d')!.drawImage(img, 0, 0); res(c); };
    img.onerror = () => { const c = document.createElement('canvas'); c.width = c.height = 8; res(c); };
  })));
  return rawPromise;
}

/**
 * What you'll walk out with: the chosen layout, look and frame rendered by the real
 * print engine on sample photos. It "prints" down out of a slot whenever something changes.
 */
export default function StripPreview({ layoutId, lookId, frameId, poses }: { layoutId: string; lookId: string; frameId: string; poses: Pose[] | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<string, HTMLCanvasElement>());
  const [ver, setVer] = useState(0);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    if (!photos.length) return;
    let alive = true;
    const t = setTimeout(async () => {
      const raw = await loadRaw();
      if (!alive || !ref.current) return;
      const L = LAYOUTS.find((l) => l.id === layoutId)!, look = STYLES.find((s) => s.id === lookId)!, frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0];
      const out = buildBase(raw, L, look, frame, cache.current, poses);
      const c = ref.current; c.width = out.width; c.height = out.height; c.getContext('2d')!.drawImage(out, 0, 0);
      setWide(out.width > out.height * 0.9); setVer((v) => v + 1);
    }, 40);
    return () => { alive = false; clearTimeout(t); };
  }, [layoutId, lookId, frameId, poses]);

  if (!photos.length) return null;
  return (
    <div className={`pv ${wide ? 'wide' : ''}`}>
      <div className="pv-slot" aria-hidden />
      <div className="pv-paper">
        <canvas ref={ref} className="pv-canvas" data-v={ver === 0 ? 'x' : ver % 2} role="img" aria-label="Preview of your print, shown with sample photos" />
      </div>
    </div>
  );
}
