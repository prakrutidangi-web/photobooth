'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Scene } from './Scene';
import { STYLES } from '@/lib/filters';

function MiniStrip({ i, rot, x, y }: { i: number; rot: number; x: number; y: number }) {
  const s = STYLES[i];
  return (
    <motion.div className="mini" style={{ background: s.paper, left: `${x}%`, top: y }}
      initial={{ opacity: 0, y: 60, rotate: rot - 10 }} animate={{ opacity: 1, y: [0, -10, 0], rotate: rot }}
      transition={{ opacity: { duration: 0.8, delay: 0.2 + i * 0.15 }, rotate: { duration: 0.8, delay: 0.2 + i * 0.15 }, y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' } }}>
      {[0, 1, 2, 3].map((k) => <div key={k} className="mini-photo" style={{ filter: s.css }}><Scene shift={k} /></div>)}
      <small style={{ color: s.ink }}>NOV 17 2026</small>
    </motion.div>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 500], [0, -70]);
  return (
    <section className="hero">
      <div className="hero-copy">
        <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Open daily &middot; 4 frames &middot; 6 looks</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Four frames.<br /><em>One take.</em>
        </motion.h1>
        <motion.p className="lede" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          Step into the booth, strike a pose, and walk out with a faded, film-style photo strip. Golden, noir, Polaroid and more, all in your browser.
        </motion.p>
        <motion.div className="cta-row" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Link href="/login?next=/studio" className="btn primary big">Enter the booth</Link>
          <a href="#looks" className="btn big">See the looks</a>
        </motion.div>
        <p className="privacy">Private by design: photos stay on your device and are never uploaded.</p>
      </div>
      <motion.div className="hero-art" style={{ y: lift }} aria-hidden>
        <MiniStrip i={0} rot={-8} x={2} y={30} />
        <MiniStrip i={1} rot={3} x={34} y={0} />
        <MiniStrip i={3} rot={11} x={66} y={44} />
      </motion.div>
    </section>
  );
}
