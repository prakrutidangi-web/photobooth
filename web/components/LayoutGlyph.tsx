import { LAYOUTS, sizeOf } from '@/lib/studio';

/** A tiny paper diagram of a print layout (strip, grid, instant...). */
export default function LayoutGlyph({ id }: { id: string }) {
  const L = LAYOUTS.find((l) => l.id === id)!;
  const { w, h } = sizeOf(L);
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
  return (
    <span className="glyph" style={{ aspectRatio: `${w} / ${h}`, height: h >= w ? 46 : undefined, width: h < w ? 52 : undefined,
      padding: `${pct(L.top, w)} ${pct(L.side, w)} ${pct(L.bottom, w)}` /* % padding is always of width */ }} aria-hidden>
      <span style={{ display: 'grid', height: '100%', gap: 2, gridTemplateColumns: `repeat(${L.cols}, 1fr)${L.aw ? ` ${(L.aw / L.pw).toFixed(2)}fr` : ''}`, gridTemplateRows: `repeat(${L.rows}, 1fr)` }}>
        {Array.from({ length: L.shots * (L.aw ? 2 : 1) }, (_, i) => <i key={i} className={L.aw && i % 2 ? 'pz' : ''} />)}
      </span>
    </span>
  );
}
