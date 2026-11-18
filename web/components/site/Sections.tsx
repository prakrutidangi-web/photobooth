'use client';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { EnterLink } from './Curtain';
import BoothArt from './BoothArt';
import PoseImage from '../PoseImage';
import { Photo, Polaroid, Strip } from './Art';
import { BOOTHS } from '@/lib/booths';
import { STYLES } from '@/lib/filters';
import { POSES } from '@/lib/poses';

const css = (id: string) => STYLES.find((s) => s.id === id)?.css;

/** Fade + rise for every [data-reveal] child, and 3D tilt on [data-tilt] cards. */
function useMotion(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el, i) =>
        gsap.from(el, { opacity: 0, y: 50, duration: 1.1, ease: 'expo.out', delay: (i % 6) * 0.06, scrollTrigger: { trigger: el, start: 'top 88%' } }));
    }, ref);
    const cards = ref.current.querySelectorAll<HTMLElement>('[data-tilt]');
    const offs: (() => void)[] = [];
    cards.forEach((c) => {
      const rx = gsap.quickTo(c, 'rotateX', { duration: 0.6, ease: 'power3.out' }), ry = gsap.quickTo(c, 'rotateY', { duration: 0.6, ease: 'power3.out' });
      const mv = (e: PointerEvent) => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 12); rx(-((e.clientY - r.top) / r.height - 0.5) * 12); };
      const lv = () => { rx(0); ry(0); };
      c.addEventListener('pointermove', mv); c.addEventListener('pointerleave', lv);
      offs.push(() => { c.removeEventListener('pointermove', mv); c.removeEventListener('pointerleave', lv); });
    });
    return () => { offs.forEach((o) => o()); ctx.revert(); };
  }, [ref]);
}

export function PickBooth() {
  const ref = useRef<HTMLElement>(null); useMotion(ref);
  return (
    <section id="booths" className="sec booths" ref={ref}>
      <header className="sec-head split" data-reveal>
        <div><h2>pick your <em>booth.</em></h2></div>
        <p className="sec-lede">five booths, all free. no app and no sign-up needed.</p>
      </header>
      <div className="bcards">
        {BOOTHS.map((b, i) => (
          <EnterLink key={b.id} href={`/studio?booth=${b.id}`} className={`bcard bc-${i}`}>
            <span className="bc-in" data-tilt data-reveal>
              <span className="bc-no">0{i + 1}</span>
              <BoothArt id={b.id} />
              <strong>{b.name.replace(' Booth', '')} <em>booth</em></strong>
              <span className="bc-blurb">{b.blurb}</span>
              <span className="bc-go">step in &rarr;</span>
            </span>
          </EnterLink>
        ))}
      </div>
    </section>
  );
}

export function Steps() {
  const ref = useRef<HTMLElement>(null); useMotion(ref);
  const steps = [
    ['open the camera', 'or upload photos from your device.'],
    ['take your photos', 'a countdown before each shot, with pose ideas if you want them.'],
    ['edit and download', 'change the look, add a frame, stickers or text, then save your strip.'],
  ];
  return (
    <section className="sec steps-sec" ref={ref}>
      <div className="film-rail" aria-hidden>{Array.from({ length: 30 }, (_, i) => <i key={i} />)}</div>
      <ol className="steps-row">
        {steps.map(([t, d], i) => (
          <li key={t} data-reveal><span className="sn">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>
        ))}
      </ol>
    </section>
  );
}

/** Pinterest-style masonry. Every tile is a placeholder slot for a real strip. */
export function Wall() {
  const ref = useRef<HTMLElement>(null); useMotion(ref);
  const tiles = [
    { k: 'strip', start: 0, look: 'golden', cap: 'golden hour · classic strip' },
    { k: 'pola', i: 4, look: 'polaroid', cap: 'instant · classic' },
    { k: 'single', i: 3, look: 'noir', cap: 'noir · single print' },
    { k: 'strip', start: 2, look: 'kodachrome', cap: 'kodachrome · 4-cut' },
    { k: 'pola', i: 1, look: 'duopink', cap: 'rose duo · mini' },
    { k: 'single', i: 5, look: 'portra', cap: 'portra 400 · single' },
    { k: 'strip', start: 3, look: 'hicon', cap: 'hi-con b&w · 4-cut' },
    { k: 'pola', i: 0, look: 'sunkissed', cap: 'sun kissed · wide', wide: true },
    { k: 'strip', start: 1, look: 'sepia', cap: 'antique sepia · 3-cut', n: 3 },
  ] as const;
  return (
    <section id="wall" className="sec wall" ref={ref}>
      <header className="sec-head" data-reveal><h2>sample <em>strips.</em></h2>
        <p className="sec-lede">examples of what the booth prints, made with sample photos.</p></header>
      <div className="masonry">
        {tiles.map((t, idx) => (
          <figure key={idx} className={`tile t-${t.k}`} data-reveal>
            {t.k === 'strip' && <Strip start={t.start} n={'n' in t ? t.n : 4} look={t.look} slot={idx === 0} />}
            {t.k === 'pola' && <Polaroid i={t.i} look={t.look} wide={'wide' in t} />}
            {t.k === 'single' && <Photo i={t.i} look={t.look} className="single" />}
            {'cap' in t && <figcaption>{t.cap}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function LooksGrid() {
  const ref = useRef<HTMLElement>(null); useMotion(ref);
  const SHOW = ['golden', 'noir', 'kodachrome', 'polaroid', 'sepia', 'vhs', 'duopink', 'cinema', 'pastel', 'darkroom', 'y2k', 'lomo'];
  const pick = SHOW.map((id) => STYLES.find((s) => s.id === id)!).filter(Boolean);
  return (
    <section id="looks" className="sec looks" ref={ref}>
      <div className="looks-copy" data-reveal>
        <h2>{STYLES.length} <em>film looks.</em></h2>
        <p className="sec-lede">portra, kodachrome, vhs, black and white, duotones and more. you see the look live on camera before you shoot.</p>
        <EnterLink href="/studio?booth=filter" className="btn-ghost">try the filter booth &rarr;</EnterLink>
      </div>
      <div className="looks-grid">
        {pick.map((s, i) => (
          <figure key={s.id} data-reveal data-tilt><Photo i={i} look={s.id} /><figcaption>{s.name}</figcaption></figure>
        ))}
      </div>
    </section>
  );
}

export function PoseRail() {
  const ref = useRef<HTMLElement>(null); useMotion(ref);
  return (
    <section className="sec poses" ref={ref}>
      <header className="sec-head split" data-reveal>
        <div><h2>never wonder what to do <em>with your hands.</em></h2></div>
        <p className="sec-lede">sixteen poses, for one person or a group. turn on pose ideas and the booth shows one for every shot. hover a card to see the group version.</p>
      </header>
      <div className="pose-rail">
        {POSES.map((p) => (
          <div key={p.id} className="pose-card" data-reveal data-tilt>
            <div className="pc-img"><PoseImage pose={p} size={200} /><PoseImage pose={{ ...p, group: true }} size={200} className="pc-group" /><i>solo / squad</i></div>
            <strong>{p.name}</strong><span>{p.hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
