'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { STYLES } from '@/lib/filters';
import type { Pose } from '@/lib/poses';
import {
  FONTS, FRAMES, LAYOUTS, STICKERS, TEXT_STYLES, buildBase, customFrame, drawItems, itemBox, printVideo, saveBlob, sizeOf, storyCanvas, toPng,
  type FontKey, type Item, type TextStyle,
} from '@/lib/studio';
import { SCENE_LAYOUTS, SCENE_THEMES, renderScene, type SceneLayout } from '@/lib/scene';
import { DECOR, DECOR_CATS, PALETTE, THEMES, byKey, decorBitmap, decorUrl, type DecorCat } from '@/lib/decor';

type Props = { photos: HTMLCanvasElement[]; layoutId: string; lookId: string; frameId?: string; poses: Pose[] | null; onRetake: () => void; onNew: () => void };
type NewItem = Item extends infer I ? (I extends { id: number } ? Omit<I, 'id'> : never) : never;
type Tab = 'look' | 'frame' | 'decorate' | 'scene';

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
  const [font, setFont] = useState<FontKey>('hand');
  const [tstyle, setTstyle] = useState<TextStyle>('plain');
  const [tcolor, setTcolor] = useState('#FFFFFF');
  const [cat, setCat] = useState<DecorCat | 'emoji'>('cute');
  const [themeId, setThemeId] = useState<string | null>(null);
  const [, setArtTick] = useState(0);
  const [sceneTheme, setSceneTheme] = useState('gingham');
  const [sceneLayout, setSceneLayout] = useState<SceneLayout>('single');
  const [caption, setCaption] = useState('');
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [base, setBase] = useState<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const display = useRef<HTMLCanvasElement>(null);
  const cache = useRef(new Map<string, HTMLCanvasElement>());
  const nextId = useRef(1);
  const getArt = (it: Extract<Item, { type: 'art' }>) => decorBitmap(it.key, it.color, () => setArtTick((t) => t + 1));
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
    drawItems(ctx, items, c.width, c.height, sel, getArt);
  }); // redraws every render: cheap, and picks up stickers as their bitmaps finish loading

  const final = () => {
    const c = document.createElement('canvas'); c.width = base!.width; c.height = base!.height;
    const ctx = c.getContext('2d')!; ctx.drawImage(base!, 0, 0); drawItems(ctx, items, c.width, c.height, null, getArt); return c;
  };
  const stamp = () => `photobooth-${layout.id}-${look.id}`;

  // square scene preview (re-rendered when anything that affects it changes)
  useEffect(() => {
    if (tab !== 'scene' || !base) return;
    let alive = true; setSceneReady(false);
    const t = setTimeout(async () => {
      const sc = await renderScene(final(), sceneTheme, sceneLayout, caption, 1000);
      const c = sceneRef.current; if (!alive || !c) return;
      c.width = sc.width; c.height = sc.height; c.getContext('2d')!.drawImage(sc, 0, 0); setSceneReady(true);
    }, 120);
    return () => { alive = false; clearTimeout(t); };
  }, [tab, base, items, sceneTheme, sceneLayout, caption]); // eslint-disable-line react-hooks/exhaustive-deps
  const dlScene = () => run('Saving...', async () => saveBlob(await toPng(await renderScene(final(), sceneTheme, sceneLayout, caption, 2048)), `${stamp()}-${sceneTheme}-square.png`));
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
  const tilt = () => Math.round(Math.random() * 16 - 8);
  const addArt = (key: string) => { const d = byKey(key)!; add({ type: 'art', key, x: 0.5, y: 0.5, s: d.cat === 'tape' ? (d.w > 100 ? 0.42 : 0.12) : d.cat === 'words' ? 0.32 : 0.2, r: tilt(), color: d.tint ? (d.key === 't-corner' ? '#2A0810' : '#D91F3F') : undefined }); };
  const applyTheme = (id: string) => {
    const t = THEMES.find((x) => x.id === id)!;
    setItems((l) => [...l.filter((i) => !(i.type === 'art' && i.theme)), ...t.items.map((p) => ({ id: nextId.current++, type: 'art' as const, ...p, theme: true }))]);
    setThemeId(id); setSel(null);
  };
  const clearTheme = () => { setItems((l) => l.filter((i) => !(i.type === 'art' && i.theme))); setThemeId(null); };
  const toFront = () => setItems((l) => { const it = l.find((i) => i.id === sel); return it ? [...l.filter((i) => i !== it), it] : l; });
  const duplicate = () => { if (selItem && selItem.type !== 'stroke') add({ ...selItem, x: selItem.x + 0.04, y: selItem.y + 0.03 } as NewItem); };
  const recolor = (c: string) => { setTcolor(c); if (selItem?.type === 'text' || (selItem?.type === 'art' && byKey(selItem.key)?.tint)) patchSel({ color: c }); };

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
      const b = itemBox(ctx, it, c.width, c.height, getArt);
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
        {tab === 'scene' && <canvas ref={sceneRef} className={`scene-cv ${sceneReady ? 'on' : ''}`} role="img" aria-label="Square post preview" />}
        <motion.canvas hidden={tab === 'scene'} ref={display} className={`strip ${mode === 'draw' ? 'pen' : ''}`} style={{ aspectRatio: `${W} / ${H}` }}
          initial={{ y: -30, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 110, damping: 16 }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          role="img" aria-label={`Your ${layout.name}, ${look.name} look. Drag stickers and text to move them.`} />
      </div>

      <div className="panel-side">
        <div className="tabs3" role="tablist">
          {(['look', 'frame', 'decorate', 'scene'] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{{ look: 'Look', frame: 'Frame', decorate: 'Decorate', scene: 'Square' }[t]}</button>
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
          <h3 className="eyebrow">Themes</h3>
          <div className="themes">
            {THEMES.map((t) => (
              <button key={t.id} className="theme" aria-pressed={themeId === t.id} onClick={() => applyTheme(t.id)}>
                <span className="th-art">{t.preview.map((k) => { const d = byKey(k)!; /* eslint-disable-next-line @next/next/no-img-element */ return <img key={k} src={decorUrl(d)} alt="" />; })}</span>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          {themeId && <button className="txt" onClick={clearTheme}>remove theme</button>}

          <h3 className="eyebrow">Stickers</h3>
          <div className="dtabs" role="tablist">
            {[...DECOR_CATS, { id: 'emoji' as const, name: 'emoji' }].map((c) => <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</button>)}
          </div>
          <div className={`dgrid ${cat}`}>
            {cat === 'emoji'
              ? STICKERS.map((e) => <button key={e} className="demoji" onClick={() => add({ type: 'sticker', ch: e, x: 0.5, y: 0.5, s: 0.16, r: tilt() })} aria-label={`Add ${e}`}>{e}</button>)
              : DECOR.filter((d) => d.cat === cat).map((d) => (
                <button key={d.key} onClick={() => addArt(d.key)} aria-label={`Add ${d.name}`} title={d.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={decorUrl(d, d.key === 't-corner' ? '#2A0810' : '#D91F3F')} alt="" />
                </button>
              ))}
          </div>

          <h3 className="eyebrow">Text</h3>
          <div className="textrow">
            <input value={text} onChange={(e) => { setText(e.target.value); if (selItem) setSel(null); /* new caption: style picks apply to it, not the old one */ }} maxLength={40} placeholder="add a caption..." aria-label="Caption text" />
            <button className="btn small primary" disabled={!text.trim()} onClick={() => { add({ type: 'text', text: text.trim(), x: 0.5, y: layout.id.startsWith('polaroid') ? 0.9 : 0.5, s: 0.075, r: 0, color: tcolor, font, style: tstyle }); setText(''); }}>Add</button>
          </div>
          <div className="fontrow" role="radiogroup" aria-label="Font">
            {(Object.keys(FONTS) as FontKey[]).map((f) => (
              <button key={f} role="radio" aria-checked={font === f} className={`ff ff-${f}`} onClick={() => { setFont(f); if (selItem?.type === 'text') patchSel({ font: f }); }}>Aa<small>{FONTS[f].label}</small></button>
            ))}
          </div>
          <div className="seg" role="radiogroup" aria-label="Text style">
            {TEXT_STYLES.map((t) => <button key={t} role="radio" aria-checked={tstyle === t} onClick={() => { setTstyle(t); if (selItem?.type === 'text') patchSel({ style: t }); }}>{t}</button>)}
          </div>
          <div className="palette" role="radiogroup" aria-label="Colour">
            {PALETTE.map((c) => <button key={c} role="radio" aria-checked={tcolor === c} aria-label={c} style={{ background: c }} onClick={() => recolor(c)} />)}
            <input type="color" value={tcolor} onChange={(e) => recolor(e.target.value)} aria-label="Custom colour" />
          </div>

          {selItem && selItem.type !== 'stroke' && (
            <div className="selbox">
              <label className="colorrow">Size<input type="range" min={0.03} max={selItem.type === 'art' ? 1 : 0.5} step={0.005} value={selItem.s} onChange={(e) => patchSel({ s: +e.target.value })} /></label>
              <label className="colorrow">Rotate<input type="range" min={-180} max={180} step={1} value={selItem.r ?? 0} onChange={(e) => patchSel({ r: +e.target.value })} /></label>
              <div className="textrow">
                <button className="btn small" onClick={toFront}>Bring to front</button>
                <button className="btn small" onClick={duplicate}>Duplicate</button>
                <button className="btn small" onClick={() => { setItems((l) => l.filter((i) => i.id !== sel)); setSel(null); }}>Delete</button>
              </div>
            </div>
          )}

          <h3 className="eyebrow">Draw</h3>
          <div className="textrow">
            <button className="btn small" aria-pressed={mode === 'draw'} onClick={() => setMode(mode === 'draw' ? 'move' : 'draw')}>{mode === 'draw' ? 'Pen: on' : 'Pen: off'}</button>
            <input type="color" value={pen.color} onChange={(e) => setPen({ ...pen, color: e.target.value })} aria-label="Pen colour" />
            <input type="range" min={0.003} max={0.03} step={0.001} value={pen.w} onChange={(e) => setPen({ ...pen, w: +e.target.value })} aria-label="Pen size" />
          </div>
          <div className="textrow">
            <button className="btn small" disabled={!items.length} onClick={() => { setItems((l) => l.slice(0, -1)); setSel(null); }}>Undo</button>
            <button className="btn small" disabled={!items.length} onClick={() => { setItems([]); setSel(null); setThemeId(null); }}>Clear all</button>
          </div>
        </>)}

        {tab === 'scene' && (<>
          <h3 className="eyebrow">Backdrop</h3>
          <div className="scenes">
            {SCENE_THEMES.map((t) => (
              <button key={t.id} className="scene-t" aria-pressed={sceneTheme === t.id} onClick={() => setSceneTheme(t.id)}>
                <i style={{ background: t.swatch }} /><span>{t.name}</span>
              </button>
            ))}
          </div>
          <h3 className="eyebrow">Layout</h3>
          <div className="seg" role="radiogroup" aria-label="Scene layout">
            {SCENE_LAYOUTS.map((l) => <button key={l.id} role="radio" aria-checked={sceneLayout === l.id} onClick={() => setSceneLayout(l.id)}>{l.name}</button>)}
          </div>
          <h3 className="eyebrow">Caption</h3>
          <input className="cap-in" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={48} placeholder="optional, e.g. sarah's 21st" aria-label="Scene caption" />
          <button className="btn primary" onClick={dlScene} disabled={!!busy || !base}>Download square (2048 px)</button>
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
