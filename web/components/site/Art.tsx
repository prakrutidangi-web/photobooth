import type { CSSProperties } from 'react';
import { photos } from '@/lib/photos';
import RealLook from './RealLook';

/* Placeholder photographs in a cherry / blush / cream palette with a soft backlit silhouette.
   Every one is a drop-in slot: replace the .ph background with a real image later. */
const SCENES = [
  'radial-gradient(60% 55% at 30% 22%,#ffe9d6,transparent 62%),radial-gradient(60% 60% at 80% 85%,#b5122e,transparent 64%),linear-gradient(165deg,#f0cfc9,#d9707e)',
  'radial-gradient(55% 55% at 72% 24%,#fff6ee,transparent 60%),radial-gradient(60% 60% at 22% 82%,#7a1426,transparent 62%),linear-gradient(170deg,#e9a3a8,#5a0f1d)',
  'radial-gradient(60% 55% at 24% 28%,#fff3dd,transparent 60%),radial-gradient(55% 60% at 80% 80%,#e3b15c,transparent 62%),linear-gradient(160deg,#f6dccb,#c0574f)',
  'radial-gradient(55% 55% at 70% 30%,#ffd7d7,transparent 60%),radial-gradient(60% 60% at 24% 84%,#2a0810,transparent 62%),linear-gradient(165deg,#c73a52,#3a0a14)',
  'radial-gradient(60% 55% at 30% 25%,#fffaf2,transparent 62%),radial-gradient(55% 60% at 80% 80%,#e9a3a8,transparent 62%),linear-gradient(165deg,#fbf1e6,#e8c3b5)',
  'radial-gradient(55% 55% at 66% 24%,#ffe2c0,transparent 60%),radial-gradient(60% 60% at 20% 80%,#8f1c2c,transparent 62%),linear-gradient(165deg,#d98b7a,#4a0d18)',
];

export function Photo({ i = 0, css, look, slot = false, square = false, className = '' }: { i?: number; css?: string; look?: string; slot?: boolean; square?: boolean; className?: string }) {
  const dx = [0, -8, 7, -4, 6, -6][i % 6];
  const p = photos.length ? photos[i % photos.length] : null;
  if (p && look) return (
    <div className={`ph photo ${square ? 'sq' : ''} ${className}`}>
      <RealLook src={p.src} alt={p.alt} look={look} w={square ? 420 : 480} h={square ? 420 : 360} />
      {slot && <span className="slot-tag">sample</span>}
    </div>
  );
  if (p) return (
    <div className={`ph photo ${square ? 'sq' : ''} ${className}`} style={{ filter: css }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
      {slot && <span className="slot-tag">sample</span>}
    </div>
  );
  return (
    <div className={`ph ${square ? 'sq' : ''} ${className}`} style={{ background: SCENES[i % 6], filter: css }}>
      <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <g fill="rgba(42,8,16,.55)" transform={`translate(${dx} 0)`}><circle cx="50" cy="36" r="11" /><path d="M24 80c0-20 11-29 26-29s26 9 26 29z" /></g>
      </svg>
      {slot && <span className="slot-tag">photo slot</span>}
    </div>
  );
}

export function Strip({ start = 0, n = 4, css, look, paper = '#fffaf4', slot = false, date = true, style, className = '' }:
  { start?: number; n?: number; css?: string; look?: string; paper?: string; slot?: boolean; date?: boolean; style?: CSSProperties; className?: string }) {
  return (
    <div className={`a-strip ${className}`} style={{ background: paper, ...style }}>
      {Array.from({ length: n }, (_, k) => <Photo key={k} i={start + k} css={css} look={look} slot={slot && k === 0} />)}
      {date && <small>nov 18 &rsquo;26</small>}
    </div>
  );
}

export function Polaroid({ i = 0, css, look, caption, slot = false, wide = false, className = '' }: { i?: number; css?: string; look?: string; caption?: string; slot?: boolean; wide?: boolean; className?: string }) {
  return (
    <div className={`a-pola ${wide ? 'wide' : ''} ${className}`}>
      <Photo i={i} css={css} look={look} slot={slot} square={!wide} />
      {caption && <small>{caption}</small>}
    </div>
  );
}
