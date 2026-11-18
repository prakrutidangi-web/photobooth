'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STYLES } from '@/lib/filters';
import { FRAMES, LAYOUTS } from '@/lib/studio';
import { BOOTHS, FILMS, type BoothId } from '@/lib/booths';
import { pickPoses, preloadPosePhotos, type Pose } from '@/lib/poses';
import PoseImage from './PoseImage';
import Editor from './Editor';
import { Beauty, BEAUTY_LEVELS } from '@/lib/beauty';
import { FaceMasks, loadLandmarker } from '@/lib/face';
import StripPreview from './StripPreview';
import LayoutGlyph from './LayoutGlyph';
import { photos as photosList } from '@/lib/photos';

type Phase = 'idle' | 'live' | 'shooting' | 'result';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const BETWEEN_MS = 1500;
const MAX_UPLOAD = 20 * 1024 * 1024;

function explain(err: unknown): [string, string] {
  const e = err as { name?: string; message?: string };
  const where = 'Open System Settings > Privacy & Security > Camera, switch on your browser, then reload this page.';
  switch (e?.name) {
    case 'NotAllowedError': case 'SecurityError': return ['Camera access was blocked.', where + ' Also check the camera icon in the address bar. You can also upload photos instead.'];
    case 'NotFoundError': case 'OverconstrainedError': return ['No camera found.', 'Connect a camera, or upload photos instead.'];
    case 'NotReadableError': return ['The camera is busy.', 'Another app (Zoom, FaceTime...) may be using it. Close it and try again.'];
    default: return ['Could not start the camera.', e?.message ?? ''];
  }
}

async function filesToCanvases(files: File[], n: number): Promise<HTMLCanvasElement[]> {
  const out: HTMLCanvasElement[] = [];
  for (const f of files.slice(0, n)) {
    if (!f.type.startsWith('image/')) throw new Error(`"${f.name}" is not an image.`);
    if (f.size > MAX_UPLOAD) throw new Error(`"${f.name}" is larger than 20 MB.`);
    const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height); bmp.close(); out.push(c);
  }
  if (!out.length) throw new Error('Please choose at least one image.');
  const got = out.length;
  while (out.length < n) out.push(out[out.length % got]); // fewer photos than frames: repeat them
  return out;
}

export default function Booth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const vfRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<[string, string] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [shot, setShot] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [status, setStatus] = useState("press space or the shutter when you're ready.");
  const [photos, setPhotos] = useState<HTMLCanvasElement[]>([]);
  const [mode, setMode] = useState<BoothId>('photo');
  const [layoutId, setLayoutId] = useState('strip4');
  const [lookId, setLookId] = useState('golden');
  const [frameId, setFrameId] = useState('cream');
  const [timer, setTimer] = useState(3);
  const [guide, setGuide] = useState(false);
  const [poses, setPoses] = useState<Pose[]>(() => pickPoses(6));
  const [squad, setSquad] = useState(false);
  const [beauty, setBeauty] = useState(1); // index into BEAUTY_LEVELS: natural by default
  const glRef = useRef<HTMLCanvasElement>(null);
  const fx = useRef<Beauty | null>(null);
  const [glOk, setGlOk] = useState(true);
  const [eyeOn, setEyeOn] = useState(true);   // under-eye concealer
  const [lipOn, setLipOn] = useState(true);   // lip tint
  const [faceState, setFaceState] = useState<'off' | 'loading' | 'ready' | 'none'>('off');
  const lvl = BEAUTY_LEVELS[beauty];
  const strength = lvl.s;
  const strengthRef = useRef(strength); strengthRef.current = strength;
  const touchRef = useRef({ eye: 0, lip: 0 }); touchRef.current = { eye: eyeOn ? lvl.eye : 0, lip: lipOn ? lvl.lip : 0 };
  const masks = useRef<FaceMasks | null>(null);
  const touchUps = strength > 0 && (eyeOn || lipOn);

  const booth = BOOTHS.find((b) => b.id === mode)!;
  const layout = LAYOUTS.find((l) => l.id === layoutId)!;
  const look = STYLES.find((s) => s.id === lookId)!;
  const showGuide = guide || !!layout.aw;
  const shownPoses = squad ? poses.map((p) => ({ ...p, group: true })) : poses;
  const poseIdx = phase === 'shooting' ? Math.min(shot, layout.shots - 1) : 0;
  const locked = phase === 'shooting';

  const pickBooth = (id: BoothId) => {
    const b = BOOTHS.find((x) => x.id === id)!;
    setMode(id); setLayoutId(b.layouts[0]); setLookId(b.look); setGuide(!!b.guide);
  };
  // /studio?booth=instant opens straight into that booth
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('booth');
    if (q && BOOTHS.some((b) => b.id === q)) pickBooth(q as BoothId);
  }, []);

  const surprise = () => {
    const b = BOOTHS[Math.floor(Math.random() * BOOTHS.length)];
    setMode(b.id); setLayoutId(b.layouts[Math.floor(Math.random() * b.layouts.length)]);
    setLookId(STYLES[1 + Math.floor(Math.random() * (STYLES.length - 1))].id);
    setFrameId(FRAMES[Math.floor(Math.random() * FRAMES.length)].id); setGuide(!!b.guide); setPoses(pickPoses(6));
  };

  useEffect(() => { preloadPosePhotos(); }, []);
  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  useEffect(() => stopCamera, []);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) { setError(explain({ name: 'SecurityError' })); return; }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      setPhase('live');
    } catch (e) { setError(explain(e)); }
  }
  useEffect(() => {
    if ((phase === 'live' || phase === 'shooting') && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current; videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  // beauty pass: draw every camera frame through the GPU filter into the preview canvas
  useEffect(() => {
    if (phase !== 'live' && phase !== 'shooting') return;
    const cv = glRef.current; if (!cv) return;
    if (fx.current?.canvas !== cv) { fx.current = Beauty.create(cv); setGlOk(!!fx.current); }
    if (!fx.current) return;
    let raf = 0, alive = true, lastT = -1, frame = 0;
    type LM = Awaited<ReturnType<typeof loadLandmarker>>;
    let lm: LM = null;
    masks.current ??= new FaceMasks();
    // the face model only loads when touch-ups are on (it's ~13 MB, cached after the first visit)
    const ensure = () => {
      if (lm || !touchUps) return;
      setFaceState((st) => (st === 'off' ? 'loading' : st));
      loadLandmarker('VIDEO').then((x) => { if (!alive) return; lm = x; setFaceState(x ? 'ready' : 'none'); });
    };
    ensure();
    const loop = () => {
      const v = videoRef.current, f = fx.current;
      if (v && f && v.readyState >= 2) {
        const t = touchRef.current;
        if (lm && (t.eye || t.lip) && v.currentTime !== lastT && frame++ % 2 === 0) {
          lastT = v.currentTime;
          try { const r = lm.detectForVideo(v, performance.now()); masks.current!.update(r.faceLandmarks, v); f.setMasks(masks.current!.eyes, masks.current!.lips); } catch { /* skip frame */ }
        }
        f.draw(v, strengthRef.current, t);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [phase, touchUps]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]; e.target.value = ''; setError(null);
    if (!files.length) return;
    try {
      let got = await filesToCanvases(files, layout.shots);
      const s = strengthRef.current, t = touchRef.current, b = s > 0 ? Beauty.create() : null;
      if (b) {
        const lm = t.eye || t.lip ? await loadLandmarker('IMAGE') : null, m = new FaceMasks();
        got = got.map((c) => {
          if (lm) { try { m.update(lm.detect(c).faceLandmarks, c, false); b.setMasks(m.eyes, m.lips); } catch { b.setMasks(null, null); } }
          return b.draw(c, s, t) ? b.snapshot() : c;
        });
      }
      setPhotos(got); setPhase('result');
    }
    catch (err) { setError(['Could not use those photos.', err instanceof Error ? err.message : '']); }
  }

  // Full video frame, NOT mirrored. Each layout crops it (centre, no stretching) later.
  const grab = () => {
    const v = videoRef.current!;
    if (fx.current && fx.current.draw(v, strengthRef.current, touchRef.current)) return fx.current.snapshot(); // exactly what the preview shows
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d')!.drawImage(v, 0, 0); return c;
  };

  const take = useCallback(async () => {
    if (busy.current || !videoRef.current) return;
    busy.current = true; setPhase('shooting'); setShot(0);
    const got: HTMLCanvasElement[] = [];
    try {
      for (let i = 0; i < layout.shots; i++) {
        setStatus(`photo ${i + 1} of ${layout.shots}`);
        for (let n = timer; n >= 1; n--) { setCount(n); await sleep(1000); }
        setCount(null); setFlashKey((k) => k + 1); got.push(grab()); setShot(i + 1);
        if (i < layout.shots - 1) { setStatus('cute. next one...'); await sleep(BETWEEN_MS); }
      }
      await sleep(350); setPhotos(got); setPhase('result');
    } finally { busy.current = false; }
  }, [layout.shots, timer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && phase === 'live' && !(e.target instanceof HTMLElement && ['BUTTON', 'INPUT', 'SELECT', 'A'].includes(e.target.tagName))) { e.preventDefault(); take(); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [phase, take]);

  const toLive = () => { setStatus("press space or the shutter when you're ready."); setShot(0); setPhase(streamRef.current ? 'live' : 'idle'); };
  const fullscreen = () => { if (document.fullscreenElement) document.exitFullscreen(); else vfRef.current?.requestFullscreen?.().catch(() => {}); };

  /* ---------- option groups (only what the chosen booth needs) ---------- */
  const sample = photosList[1 % Math.max(1, photosList.length)]?.src;
  const layoutRow = booth.layouts.length > 1 && (
    <div className="opt2"><h3 className="o-h">the print</h3><div className="lay-row" role="radiogroup" aria-label="Layout">
      {booth.layouts.map((id) => { const l = LAYOUTS.find((x) => x.id === id)!; return (
        <button key={id} role="radio" aria-checked={layoutId === id} className="lay" disabled={locked} onClick={() => setLayoutId(id)}>
          <LayoutGlyph id={id} /><span>{l.name.toLowerCase()}</span>
        </button>); })}
    </div></div>
  );
  const lookList = booth.films ? FILMS.map((f) => ({ id: f.look, name: f.name })) : STYLES.map((s) => ({ id: s.id, name: s.name }));
  const lookRow = (
    <div className="opt2"><h3 className="o-h">{booth.films ? 'the film' : 'the look'} <small>{look.name.toLowerCase()}{phase !== 'idle' ? ' · live on camera' : ''}</small></h3>
      <div className="look-rail" role="radiogroup" aria-label="Look">
        {lookList.map((x) => { const st = STYLES.find((s) => s.id === x.id); return (
          <button key={x.name} role="radio" aria-checked={lookId === x.id} className="lk" disabled={locked} onClick={() => setLookId(x.id)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {sample ? <img src={sample} alt="" style={{ filter: st?.css }} loading="lazy" /> : <i style={{ filter: st?.css }} />}
            <span>{x.name.toLowerCase()}</span>
          </button>); })}
      </div>
    </div>
  );
  const frameRow = booth.framesFirst && (
    <div className="opt2"><h3 className="o-h">the frame <small>{FRAMES.find((f) => f.id === frameId)?.name.toLowerCase()}</small></h3><div className="swatches inline">
      {FRAMES.map((f) => <button key={f.id} className="sw" aria-pressed={frameId === f.id} aria-label={f.name} title={f.name} disabled={locked} onClick={() => setFrameId(f.id)}
        style={{ background: f.pattern ? `repeating-linear-gradient(45deg, ${f.bg} 0 6px, ${f.accent} 6px 9px)` : f.bg }} />)}
    </div></div>
  );
  const extraRow = (
    <div className="opt2 extras2">
      <div className="ex">
        <span className="ex-l">beauty</span>
        <div className="seg" role="radiogroup" aria-label="Beauty filter">{BEAUTY_LEVELS.map((b, i) => <button key={b.name} role="radio" aria-checked={beauty === i} onClick={() => setBeauty(i)}>{b.name}</button>)}</div>
      </div>
      {strength > 0 && (
        <div className="ex">
          <span className="ex-l" id="ue">under-eyes</span>
          <button role="switch" aria-checked={eyeOn} aria-labelledby="ue" className="sw2" onClick={() => setEyeOn(!eyeOn)}><i /></button>
          <span className="ex-l" id="lt">lip tint</span>
          <button role="switch" aria-checked={lipOn} aria-labelledby="lt" className="sw2" onClick={() => setLipOn(!lipOn)}><i /></button>
          {phase !== 'idle' && touchUps && faceState === 'loading' && <small className="face-note">finding your face…</small>}
          {phase !== 'idle' && touchUps && faceState === 'none' && <small className="face-note">touch-ups need a newer browser</small>}
        </div>
      )}
      <div className="ex">
        <span className="ex-l">countdown</span>
        <div className="seg" role="radiogroup" aria-label="Countdown">{[3, 5, 10].map((t) => <button key={t} role="radio" aria-checked={timer === t} onClick={() => setTimer(t)} disabled={locked}>{t}s</button>)}</div>
      </div>
      {!layout.aw && (
        <div className="ex">
          <span className="ex-l" id="pg">pose ideas</span>
          <button role="switch" aria-checked={showGuide} aria-labelledby="pg" className="sw2" disabled={locked} onClick={() => setGuide(!guide)}><i /></button>
        </div>
      )}
      {showGuide && (
        <div className="ex">
          <span className="ex-l">poses for</span>
          <div className="seg" role="radiogroup" aria-label="Poses for">
            <button role="radio" aria-checked={!squad} onClick={() => setSquad(false)} disabled={locked}>just me</button>
            <button role="radio" aria-checked={squad} onClick={() => setSquad(true)} disabled={locked}>the squad</button>
          </div>
          <button className="txt" onClick={() => setPoses(pickPoses(6))} disabled={locked}>shuffle</button>
        </div>
      )}
    </div>
  );

  if (phase === 'result') return (
    <Editor photos={photos} layoutId={layoutId} lookId={lookId} frameId={frameId} poses={showGuide ? shownPoses : null}
      onRetake={() => { toLive(); if (streamRef.current) setTimeout(take, 80); }} onNew={toLive} />
  );

  if (phase === 'idle') return (
    <div className="setup2">
      <div className="pv-col">
        <StripPreview layoutId={layoutId} lookId={lookId} frameId={frameId} poses={showGuide ? shownPoses : null} />
        <p className="pv-note">preview, shown with sample photos</p>
      </div>

      <div className="menu-col">
        <header className="m-head">
          <h1 className="m-title">what are we <em>making</em> today?</h1>
        </header>

        <ol className="menu" role="radiogroup" aria-label="Booth">
          {BOOTHS.map((b, i) => (
            <li key={b.id}>
              <button role="radio" aria-checked={mode === b.id} onClick={() => pickBooth(b.id)}>
                <span className="m-no">{i + 1}</span>
                <span className="m-name">{b.name.replace(' Booth', '')} <em>booth</em></span>
                <span className="m-dots" aria-hidden />
                <span className="m-what">{b.blurb}</span>
              </button>
            </li>
          ))}
        </ol>

        {frameRow}{layoutRow}{lookRow}{extraRow}

        <div className="go2">
          <button className="press" onClick={start}><span>open the<br />camera</span></button>
          <div className="go2-side">
            <button className="txt big" onClick={() => fileRef.current?.click()}>or use photos you already have</button>
            <button className="txt" onClick={surprise}>&#10022; surprise me</button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
          </div>
        </div>
        <p className="fine2">{layout.shots} photo{layout.shots > 1 ? 's' : ''}, a {timer} second countdown each. everything stays on this device.</p>
        {error && <div className="error" role="alert"><strong>{error[0]}</strong>{error[1]}</div>}
      </div>
    </div>
  );

  return (
    <div className="studio-live">
      <div className={`live-stage ${showGuide ? 'has-pose' : ''}`}>
      <div className="booth-window">
        <div className="bw-light" aria-hidden />
        <div className="viewfinder" ref={vfRef}>
          <video ref={videoRef} playsInline muted autoPlay style={{ filter: look.css }} className={glOk ? 'src-only' : ''} />
          <canvas ref={glRef} className="live-canvas" style={{ filter: look.css, display: glOk ? undefined : 'none' }} aria-label="Camera preview" />
          <AnimatePresence>
            {count !== null && <motion.div key={count} className="countdown" aria-live="assertive" initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 0.95, opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>{count}</motion.div>}
          </AnimatePresence>
          <button className="fs" onClick={fullscreen} aria-label="Toggle fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          {showGuide && shownPoses[poseIdx] && (
            <div className="posecard" aria-live="polite">
              <PoseImage pose={shownPoses[poseIdx]} color="#2a0810" size={64} />
              <div><strong>{shownPoses[poseIdx].name}</strong><small>{shownPoses[poseIdx].hint}</small></div>
            </div>
          )}
          {flashKey > 0 && <motion.div key={flashKey} className="flash" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />}
        </div>
        <div className="bw-bar">
          <ol className="dots" aria-label="Progress">{Array.from({ length: layout.shots }, (_, i) => <li key={i} className={i < shot ? 'done' : i === shot && phase === 'shooting' ? 'now' : ''} />)}</ol>
          <button className="shutter" onClick={take} disabled={phase !== 'live'} aria-label="Take photos"><span /></button>
          <p className="status" aria-live="polite">{status}</p>
        </div>
      </div>
      {showGuide && shownPoses[poseIdx] && (
        <aside className="pose-big" aria-live="polite">
          <p className="pb-k">copy this <span>{poseIdx + 1} / {layout.shots}</span></p>
          <motion.div key={`${shownPoses[poseIdx].id}-${poseIdx}`} className="pb-img" initial={{ opacity: 0, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <PoseImage pose={shownPoses[poseIdx]} color="#2a0810" size={360} />
          </motion.div>
          <strong>{shownPoses[poseIdx].name}</strong>
          <span className="pb-hint">{shownPoses[poseIdx].hint}</span>
          {poseIdx + 1 < layout.shots && (
            <div className="pb-next"><small>up next</small>
              {shownPoses.slice(poseIdx + 1, layout.shots).map((p, i) => <PoseImage key={`${p.id}-${i}`} pose={p} color="#2a0810" size={56} />)}
            </div>
          )}
        </aside>
      )}
      </div>
      <div className="live-opts">{layoutRow}{lookRow}{extraRow}</div>
    </div>
  );
}
