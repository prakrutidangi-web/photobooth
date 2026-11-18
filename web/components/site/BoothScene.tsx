'use client';
import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/gsap';
import { photos, boothVideo } from '@/lib/photos';
import { Strip } from './Art';

/**
 * A real photobooth cabinet that "films" itself: friends pile in, the red light counts down,
 * the flash fires four times, then the strip drops out of the delivery slot. Loops forever,
 * pauses when off screen. If `boothVideo` is set, a real clip plays inside instead.
 */
const SESSIONS = [0, 4, 8]; // each session = 4 consecutive sample photos
const LINES = [['cheese!', 'squish in', 'one more!', "ok that's the one"], ['3, 2, 1...', 'tongues out', 'serve', 'perfect!!'], ['say cherry', 'closer!', 'act natural', 'frame that one']];
type Pile = { id: number; start: number; r: number; x: number; y: number };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function BoothScene() {
  const root = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const [session, setSession] = useState(0);
  const [shot, setShot] = useState(0);
  const [taken, setTaken] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const [curtain, setCurtain] = useState<'open' | 'closed' | 'sway'>('open');
  const [printing, setPrinting] = useState(false);
  const [say, setSay] = useState<string | null>(null);
  const [pile, setPile] = useState<Pile[]>([]);
  const n = photos.length;

  useEffect(() => {
    if (prefersReducedMotion() || !n) { setPrinting(true); setTaken(4); return; }
    let alive = true;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting && !document.hidden; }, { threshold: 0.15 });
    if (root.current) io.observe(root.current);
    // every pause point waits while the booth is scrolled away
    const beat = async (ms: number) => { await wait(ms); while (alive && !visible.current) await wait(300); return alive; };

    (async () => {
      let s = 0;
      await wait(900);
      while (alive) {
        setSession(s); setShot(0); setTaken(0); setPrinting(false); setCurtain('closed');
        if (!(await beat(700))) return;
        setCurtain('open'); // someone ducks in
        if (!(await beat(1100))) return;
        for (let k = 0; k < 4; k++) {
          setShot(k);
          if (!boothVideo) for (let c = 3; c >= 1; c--) { setCount(c); if (!(await beat(420))) return; }
          setCount(null); setFlash((f) => f + 1); setTaken(k + 1); setSay(LINES[s][k]);
          if (!(await beat(k < 3 ? 950 : 600))) return;
        }
        setSay(null); setCurtain('sway');
        if (!(await beat(500))) return;
        setPrinting(true); // ...and the strip develops into the slot
        if (!(await beat(3800))) return;
        // the finished strip gets tossed onto the pile of memories by the booth
        const id = Date.now(), start = SESSIONS[s];
        setPile((p) => [...p.slice(-4), { id, start, r: -18 + Math.random() * 36, x: Math.random() * 60 - 30, y: Math.random() * 16 }]);
        setPrinting(false);
        if (!(await beat(500))) return;
        s = (s + 1) % SESSIONS.length;
      }
    })();
    const vis = () => { if (document.hidden) visible.current = false; };
    document.addEventListener('visibilitychange', vis);
    return () => { alive = false; io.disconnect(); document.removeEventListener('visibilitychange', vis); };
  }, [n]);

  const set = [0, 1, 2, 3].map((k) => (n ? (SESSIONS[session] + k) % n : 0));

  return (
    <div className="cab" ref={root} aria-hidden>
      <div className="cab-top">
        <div className="cab-sign">
          <span className="cs-bulbs">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</span>
          <b>photos</b>
        </div>
      </div>

      <div className="cab-body" data-jolt={flash % 2}>
        <div className="cab-side">
          <div className="cab-glass">
            <Strip start={2} n={3} look="sunkissed" className="cg-a" date={false} />
            <Strip start={6} n={3} look="noir" className="cg-b" date={false} />
          </div>
          <div className="cab-coin"><i /></div>
          <div className="cab-lamp" data-on={printing || undefined}><i />developing</div>
          <div className="cab-deliv">
            <span className="cd-label">photo delivery</span>
            <div className="cd-slot" />
            <div className="cd-out">
              {SESSIONS.map((start, i) => (
                <div key={i} className={`cd-strip ${i === session && printing ? 'out' : ''}`}><Strip start={start} look="golden" /></div>
              ))}
            </div>
          </div>
        </div>

        <div className="cab-door">
          <div className="cab-inside">
            {boothVideo
              ? <video className="ci-video" src={boothVideo} autoPlay muted loop playsInline />
              : set.map((p, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${session}-${k}`} src={photos[p]?.src} alt="" className={`ci-shot ${k === shot ? 'on' : ''} ${k < taken ? 'snapped' : ''}`} />
              ))}
            <div className="ci-light" />
            <div className="ci-cam"><i className={count !== null ? 'blink' : ''} /></div>
            {count !== null && <div key={`c${count}`} className="ci-count">{count}</div>}
            <div className="ci-shots">{[0, 1, 2, 3].map((k) => <i key={k} className={k < taken ? 'on' : ''} />)}</div>
            {flash > 0 && <div key={`f${flash}`} className="ci-flash" />}
          </div>
          <div className="cab-rod" />
          <div className={`cab-curtain velvet c-${curtain}`} />
        </div>
      </div>
      <div className="cab-base"><i /><i /></div>
      {flash > 0 && <div key={`g${flash}`} className="cab-glow" />}
      {say && <div key={`s${flash}`} className="cab-say">{say}</div>}
      <div className="cab-pile">
        {pile.map((p) => (
          <div key={p.id} className="pile-strip" style={{ ['--r' as string]: `${p.r}deg`, ['--x' as string]: `${p.x}%`, ['--y' as string]: `${p.y}%` }}>
            <Strip start={p.start} look="golden" />
          </div>
        ))}
      </div>
    </div>
  );
}

