'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STRIP, STYLES, photoSize, renderStrip } from '@/lib/filters';

type Phase = 'idle' | 'live' | 'shooting' | 'developing' | 'result';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function explain(err: unknown): [string, string] {
  const e = err as { name?: string; message?: string };
  const where = 'Open System Settings > Privacy & Security > Camera, switch on your browser, then reload this page.';
  switch (e?.name) {
    case 'NotAllowedError': case 'SecurityError': return ['Camera access was blocked.', where + ' Also check the camera icon in the address bar.'];
    case 'NotFoundError': case 'OverconstrainedError': return ['No camera found.', 'Make sure a camera is connected and enabled, then try again.'];
    case 'NotReadableError': return ['The camera is busy.', 'Another app (Zoom, FaceTime...) may be using it. Close it and try again.'];
    default: return ['Could not start the camera.', e?.message ?? ''];
  }
}

export default function Booth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const busy = useRef(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<[string, string] | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [shot, setShot] = useState(0);        // photos finished
  const [flashKey, setFlashKey] = useState(0);
  const [status, setStatus] = useState("Press Space or the button when you're ready.");
  const [urls, setUrls] = useState<string[]>([]);
  const [sel, setSel] = useState(0);
  const urlsRef = useRef<string[]>([]);

  const stopCamera = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  const freeUrls = () => { urlsRef.current.forEach(URL.revokeObjectURL); urlsRef.current = []; };
  useEffect(() => () => { stopCamera(); freeUrls(); }, []);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) { setError(explain({ name: 'SecurityError' })); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = s;
      setPhase('live');
    } catch (e) { setError(explain(e)); }
  }
  // attach stream once the <video> exists
  useEffect(() => {
    if ((phase === 'live' || phase === 'shooting') && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  // Centre 4:3 crop of the video, not stretched and NOT mirrored.
  const grab = () => {
    const v = videoRef.current!, { w, h } = photoSize();
    const vw = v.videoWidth, vh = v.videoHeight, t = w / h;
    let sw = vw, sh = vw / t; if (sh > vh) { sh = vh; sw = vh * t; }
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, w, h);
    return c;
  };

  const take = useCallback(async () => {
    if (busy.current || !videoRef.current) return;
    busy.current = true; setPhase('shooting'); setShot(0);
    const photos: HTMLCanvasElement[] = [];
    try {
      for (let i = 0; i < STRIP.shots; i++) {
        setStatus(`Photo ${i + 1} of ${STRIP.shots}`);
        for (let n = STRIP.countdownFrom; n >= 1; n--) { setCount(n); await sleep(1000); }
        setCount(null); setFlashKey((k) => k + 1);
        photos.push(grab()); setShot(i + 1);
        if (i < STRIP.shots - 1) { setStatus('Nice! Get ready for the next one...'); await sleep(STRIP.betweenShotsMs); }
      }
      setPhase('developing'); await sleep(350);
      freeUrls();
      const out: string[] = [];
      for (const s of STYLES) { out.push(await renderStrip(photos, s)); await sleep(0); }
      urlsRef.current = out; setUrls(out); setSel(0); setPhase('result');
    } finally { busy.current = false; }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && phase === 'live' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); take(); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [phase, take]);

  const back = () => { setShot(0); setStatus("Press Space or the button when you're ready."); setPhase('live'); };
  const download = () => {
    const a = document.createElement('a'); a.href = urls[sel];
    a.download = `photobooth-${STYLES[sel].id}-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.append(a); a.click(); a.remove();
  };

  if (phase === 'idle') return (
    <div className="panel center">
      <h1 className="h2">Ready when you are</h1>
      <p className="muted">We'll ask for camera access. Your photos stay on this device. They are never uploaded.</p>
      <button className="btn primary big" onClick={start}>Start camera</button>
      {error && <div className="error" role="alert"><strong>{error[0]}</strong>{error[1]}</div>}
    </div>
  );

  if (phase === 'result') return (
    <motion.div className="result-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AnimatePresence mode="wait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img key={sel} src={urls[sel]} alt={`Your photo strip, ${STYLES[sel].name} style`} className="strip"
          initial={{ y: -40, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
      </AnimatePresence>
      <div className="result-side">
        <h2 className="eyebrow">Pick a look</h2>
        <div className="picker" role="group" aria-label="Choose a style">
          {STYLES.map((s, i) => (
            <button key={s.id} className="thumb" aria-pressed={sel === i} onClick={() => setSel(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urls[i]} alt="" /><span>{s.name}</span>
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="btn primary" onClick={download}>Download PNG</button>
          <button className="btn" onClick={() => { back(); setTimeout(take, 50); }}>Retake</button>
          <button className="btn" onClick={back}>New strip</button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="center">
      <div className="viewfinder">
        <video ref={videoRef} playsInline muted autoPlay />
        <AnimatePresence>
          {count !== null && (
            <motion.div key={count} className="countdown" aria-live="assertive" initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 0.95, opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>{count}</motion.div>
          )}
        </AnimatePresence>
        {flashKey > 0 && <motion.div key={flashKey} className="flash" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />}
        {phase === 'developing' && <div className="countdown small">Developing...</div>}
      </div>
      <ol className="dots" aria-label="Progress">
        {Array.from({ length: STRIP.shots }, (_, i) => <li key={i} className={i < shot ? 'done' : i === shot && phase === 'shooting' ? 'now' : ''} />)}
      </ol>
      <p className="muted" aria-live="polite">{status}</p>
      <button className="btn primary big" onClick={take} disabled={phase !== 'live'}>Take photos</button>
    </div>
  );
}
