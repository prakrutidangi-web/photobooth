'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { STYLES } from '@/lib/filters';
import type { Pose } from '@/lib/poses';
import {
  FONTS, FRAMES, LAYOUTS, STICKERS, buildBase, customFrame, drawItems, itemBox, printVideo, saveBlob, sizeOf, storyCanvas, toPng,
  type FontKey, type Item,
} from '@/lib/studio';

type Props = { photos: HTMLCanvasElement[]; layoutId: string; lookId: string; frameId?: string; poses: Pose[] | null; onRetake: () => void; onNew: () => void };
type NewItem = Item extends infer I ? (I extends { id: number } ? Omit<I, 'id'> : never) : never;
type Tab = 'look' | 'frame' | 'decorate';

export default function Editor({ photos, layoutId, lookId, frameId: frameInit = 'cream', poses, onRetake, onNew }: Props) {
  const [layoutSel, setLayoutSel] = useState(layoutId);
  const [lookSel, setLookSel] = useState(lookId);
  const [frameId, setFrameId] = useState(frameInit);
  const [custom, setCustom] = useState('#f1e4c3');
  const [tab, setTab] = useState<Tab>('look');
  const [items, setItems] = useState<Item[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [mode, setMode] = useState<'move' | 'draw'>('move');
  const [pen, setPen] = useState({ color: '#f0a24a', w: 0.008 });
  const [text, setText] = useState('');
  const [font, setFont] = useState<FontKey>('typewriter');
  const [tcolor, setTcolor] = useState('#ffffff');
  const [base, setBase] = useState<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const display = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<string, HTMLCanvasElement>());
  const nextId = useRef(1);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const drawing = useRef<number | null>(null);

  const layout = LAYOUTS.find((l) => l.id === layoutSel)!;
  const look = STYLES.find((s) => s.id === lookSel)!;
  const frame = frameId === 'custom' ? customFrame(custom) : FRAMES.find((f) => f.id === frameId)!;
  const available = LAYOUTS.filter((l) => photos.length >= l.shots && (!l.aw || (poses && poses.length >= l.shots)));
  const thumb = useMemo(() => photos[0].toDataURL('image/jpeg', 0.5), [photos]);

  useEffect(() => { cache.current.clear(); }, [photos]);
  useEffect(() => { setBase(buildBase(photos, layout, look, frame, cache.current, poses)); }, [photos, layout, look, frame.id, frame.bg, poses]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = display.current; if (!c || !base) return;
    c.width = base.width; c.height = base.height;
    const ctx = c.getContext('2d')!; ctx.drawImage(base, 0, 0);
    drawItems(ctx, items, c.width, c.height, sel);
  }, [base, items, sel]);

  const final = () => {
    const c = document.createElement('canvas'); c.width = base!.width; c.height = base!.height;
    const ctx = c.getContext('2d')!; ctx.drawImage(base!, 0, 0); drawItems(ctx, items, c.width, c.height); return c;
  };
  const stamp = () => `photobooth-${layout.id}-${look.id}`;
  const run = async (label: string, fn: () => Promise<void>) => {
    setErr(''); setBusy(label);
    try { await fn(); } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(''); }
  };
  const dlPng = () => run('Saving...', async () => saveBlob(await toPng(final()), `${stamp()}.png`));
  const dlStory = () => run('Saving...', async () => saveBlob(await toPng(storyCanvas(final())), `${stamp()}-story.png`));
  const dlVideo = () => run('Recording (about 6s)...', async () => { const { blob, ext } = await printVideo(final()); saveBlob(blob, `${stamp()}-printing.${ext}`); });

  /* ---- items ---- */
  const add = (it: NewItem) => { const id = nextId.current++; setItems((l) => [...l, { ...it, id } as Item]); setSel(id); setMode('move'); };
  const patchSel = (p: Record<string, unknown>) => setItems((l) => l.map((i) => (i.id === sel ? ({ ...i, ...p } as Item) : i)));
  const selItem = items.find((i) => i.id === sel);

  const pos = (e: React.PointerEvent) => {
    const c = display.current!, r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width), y: ((e.clientY - r.top) / r.height) };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = display.current!, p = pos(e); c.setPointerCapture(e.pointerId);
    if (mode === 'draw') {
      const id = nextId.current++; drawing.current = id;
      setItems((l) => [...l, { id, type: 'stroke', pts: [[p.x, p.y]], color: pen.color, w: pen.w }]); return;
    }
    const ctx = c.getContext('2d')!;
    for (const it of [...items].reverse()) {
      const b = itemBox(ctx, it, c.width, c.height);
      if (b && p.x * c.width >= b.x - 10 && p.x * c.width <= b.x + b.w + 10 && p.y * c.height >= b.y - 10 && p.y * c.height <= b.y + b.h + 10) {
        setSel(it.id); drag.current = { id: it.id, dx: (it as { x: number }).x - p.x, dy: (it as { y: number }).y - p.y }; return;
      }
    }
    setSel(null);
  };
  const move = (e: React.PointerEvent) => {
    const p = pos(e);
    if (drawing.current != null) { const id = drawing.current; setItems((l) => l.map((i) => (i.id === id && i.type === 'stroke' ? { ...i, pts: [...i.pts, [p.x, p.y]] } : i))); }
    else if (drag.current) { const d = drag.current; setItems((l) => l.map((i) => (i.id === d.id && i.type !== 'stroke' ? { ...i, x: p.x + d.dx, y: p.y + d.dy } : i))); }
  };
  const up = () => { drawing.current = null; drag.current = null; };

  const { w: W, h: H } = sizeOf(layout);
  return (
    <div className="editor">
      <div className="stage">
        <motion.canvas ref={display} className={`strip ${mode === 'draw' ? 'pen' : ''}`} style={{ aspectRatio: `${W} / ${H}` }}
          initial={{ y: -30, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 110, damping: 16 }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          role="img" aria-label={`Your ${layout.name}, ${look.name} look. Drag stickers and text to move them.`} />
      </div>

      <div className="panel-side">
        <div className="tabs3" role="tablist">
          {(['look', 'frame', 'decorate'] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'look' ? 'Look' : t === 'frame' ? 'Frame' : 'Decorate'}</button>
          ))}
        </div>

        {tab === 'look' && (<>
          <h3 className="eyebrow">Layout</h3>
          <div className="chips">{available.map((l) => <button key={l.id} className="chip" aria-pressed={layoutSel === l.id} onClick={() => setLayoutSel(l.id)}>{l.name}</button>)}</div>
          <h3 className="eyebrow">Look</h3>
          <div className="looks-pick">
            {STYLES.map((s) => (
              <button key={s.id} className="lpick" aria-pressed={lookSel === s.id} onClick={() => setLookSel(s.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt="" style={{ filter: s.css }} /><span>{s.name}</span>
              </button>
            ))}
          </div>
        </>)}

        {tab === 'frame' && (<>
          <h3 className="eyebrow">Frame</h3>
          <div className="swatches">
            {FRAMES.map((f) => (
              <button key={f.id} className="sw" aria-pressed={frameId === f.id} aria-label={f.name} title={f.name} onClick={() => setFrameId(f.id)}
                style={{ background: f.pattern ? `repeating-linear-gradient(45deg, ${f.bg} 0 6px, ${f.accent} 6px 9px)` : f.bg }} />
            ))}
          </div>
          <label className="colorrow">Custom colour
            <input type="color" value={custom} onChange={(e) => { setCustom(e.target.value); setFrameId('custom'); }} />
          </label>
        </>)}

        {tab === 'decorate' && (<>
          <h3 className="eyebrow">Stickers</h3>
          <div className="stickers">{STICKERS.map((s) => <button key={s} onClick={() => add({ type: 'sticker', ch: s, x: 0.5, y: 0.5, s: 0.18 })} aria-label={`Add ${s}`}>{s}</button>)}</div>
          <h3 className="eyebrow">Text</h3>
          <div className="textrow">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={40} placeholder="Add a caption..." aria-label="Caption text" />
            <button className="btn small primary" disabled={!text.trim()} onClick={() => { add({ type: 'text', text: text.trim(), x: 0.5, y: layout.id === 'polaroid' ? 0.88 : 0.5, s: 0.07, color: tcolor, font }); setText(''); }}>Add</button>
          </div>
          <div className="textrow">
            <select value={font} onChange={(e) => setFont(e.target.value as FontKey)} aria-label="Font">{(Object.keys(FONTS) as FontKey[]).map((f) => <option key={f} value={f}>{f}</option>)}</select>
            <input type="color" value={tcolor} onChange={(e) => { setTcolor(e.target.value); if (selItem?.type === 'text') patchSel({ color: e.target.value }); }} aria-label="Text colour" />
          </div>
          <h3 className="eyebrow">Draw</h3>
          <div className="textrow">
            <button className="btn small" aria-pressed={mode === 'draw'} onClick={() => setMode(mode === 'draw' ? 'move' : 'draw')}>{mode === 'draw' ? 'Drawing: on' : 'Pen: off'}</button>
            <input type="color" value={pen.color} onChange={(e) => setPen({ ...pen, color: e.target.value })} aria-label="Pen colour" />
            <input type="range" min={0.003} max={0.03} step={0.001} value={pen.w} onChange={(e) => setPen({ ...pen, w: +e.target.value })} aria-label="Pen size" />
          </div>
          {selItem && selItem.type !== 'stroke' && (
            <label className="colorrow">Size<input type="range" min={0.03} max={0.5} step={0.005} value={selItem.s} onChange={(e) => patchSel({ s: +e.target.value })} /></label>
          )}
          <div className="textrow">
            <button className="btn small" disabled={sel == null} onClick={() => { setItems((l) => l.filter((i) => i.id !== sel)); setSel(null); }}>Delete selected</button>
            <button className="btn small" disabled={!items.length} onClick={() => { setItems((l) => l.slice(0, -1)); setSel(null); }}>Undo</button>
          </div>
        </>)}

        <div className="exports">
          <button className="btn primary" onClick={dlPng} disabled={!!busy || !base}>Download PNG</button>
          <button className="btn" onClick={dlStory} disabled={!!busy || !base}>Story size</button>
          <button className="btn" onClick={dlVideo} disabled={!!busy || !base}>Printing video</button>
        </div>
        {busy && <p className="muted" role="status">{busy}</p>}
        {err && <p className="msg err" role="alert">{err}</p>}
        <div className="exports">
          <button className="btn small" onClick={onRetake}>Retake</button>
          <button className="btn small" onClick={onNew}>New strip</button>
        </div>
      </div>
    </div>
  );
}
