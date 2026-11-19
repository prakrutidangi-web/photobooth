/**
 * Decorations for the editor: vector stickers (drawn as SVG, rasterised once), washi tape,
 * recolourable doodles, word badges, and one-tap theme packs that place a set around the print.
 * "cut" stickers get an automatic white die-cut border + soft shadow, like real vinyl stickers.
 */
export type DecorCat = 'cute' | 'words' | 'tape' | 'doodles';
export type Decor = { key: string; name: string; cat: DecorCat; w: number; h: number; cut: boolean; tint?: boolean; svg: (c: string) => string };

const C = { red: '#D91F3F', deep: '#A50F2A', pink: '#F4A6B8', rose: '#EF8FA6', blush: '#F9D3DC', cream: '#FFF8EE', gold: '#F2C14E', ink: '#2A0810', white: '#FFFFFF' };
const SERIF = `Georgia,'Times New Roman',serif`;
const MONO = `'Courier New',Courier,monospace`;

/* ---------- shape helpers ---------- */
const star = (cx: number, cy: number, R: number, r: number, n = 5) =>
  'M' + Array.from({ length: n * 2 }, (_, i) => { const a = (Math.PI * i) / n - Math.PI / 2, d = i % 2 ? r : R; return `${(cx + Math.cos(a) * d).toFixed(1)} ${(cy + Math.sin(a) * d).toFixed(1)}`; }).join('L') + 'Z';
const sparkle = (cx: number, cy: number, R: number, k = 0.16) => {
  const q = R * k;
  return `M${cx} ${cy - R}C${cx + q} ${cy - q} ${cx + q} ${cy - q} ${cx + R} ${cy}C${cx + q} ${cy + q} ${cx + q} ${cy + q} ${cx} ${cy + R}C${cx - q} ${cy + q} ${cx - q} ${cy + q} ${cx - R} ${cy}C${cx - q} ${cy - q} ${cx - q} ${cy - q} ${cx} ${cy - R}Z`;
};
const scallop = (cx: number, cy: number, R: number, n = 16, bump = 0.12) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (2 * Math.PI * i) / n, a1 = (2 * Math.PI * (i + 1)) / n, am = (a0 + a1) / 2;
    const p0 = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], p1 = [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R], pm = [cx + Math.cos(am) * R * (1 + bump * 2), cy + Math.sin(am) * R * (1 + bump * 2)];
    d += `${i ? '' : `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`}Q${pm[0].toFixed(1)} ${pm[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  }
  return d + 'Z';
};
const heartPath = (s = 1, dx = 0, dy = 0) => {
  const P = (x: number, y: number) => `${(x * s + dx).toFixed(1)} ${(y * s + dy).toFixed(1)}`;
  return `M${P(50, 88)}C${P(22, 68)} ${P(8, 52)} ${P(8, 34)}C${P(8, 20)} ${P(19, 10)} ${P(31, 10)}C${P(39, 10)} ${P(46, 14)} ${P(50, 21)}C${P(54, 14)} ${P(61, 10)} ${P(69, 10)}C${P(81, 10)} ${P(92, 20)} ${P(92, 34)}C${P(92, 52)} ${P(78, 68)} ${P(50, 88)}Z`;
};
const zigzagRect = (w: number, h: number, t = 5) => {
  let d = `M${t} 0H${w - t}`;
  for (let y = 0; y < h; y += t * 2) d += `L${w} ${Math.min(h, y + t)}L${w - t} ${Math.min(h, y + t * 2)}`;
  d += `H${t}`;
  for (let y = h; y > 0; y -= t * 2) d += `L0 ${Math.max(0, y - t)}L${t} ${Math.max(0, y - t * 2)}`;
  return d + 'Z';
};
const txt = (x: number, y: number, size: number, fill: string, s: string, font = SERIF, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${fill}" text-anchor="middle" dominant-baseline="central" ${extra}>${s}</text>`;

/* ---------- the sticker sheet ---------- */
export const DECOR: Decor[] = [
  // cute, die-cut
  { key: 'heart', name: 'Heart', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `<path d="${heartPath()}" fill="${C.red}"/><path d="M26 24c-6 3-10 8-10 15" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".7"/>` },
  { key: 'bow', name: 'Bow', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `
    <path d="M46 46c-6 12-14 26-20 40l10-2 4 8c4-14 8-28 10-44z" fill="${C.rose}"/><path d="M54 46c6 12 14 26 20 40l-10-2-4 8c-4-14-8-28-10-44z" fill="${C.rose}"/>
    <path d="M50 44C38 30 18 22 10 30c-7 8 0 24 12 26 10 2 20-4 28-12z" fill="${C.pink}"/><path d="M50 44c12-14 32-22 40-14 7 8 0 24-12 26-10 2-20-4-28-12z" fill="${C.pink}"/>
    <path d="M18 34c5-4 11-3 17 1M82 34c-5-4-11-3-17 1" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/><ellipse cx="50" cy="45" rx="8" ry="9" fill="#E77B96"/>` },
  { key: 'star', name: 'Star', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `<path d="${star(50, 53, 44, 20)}" fill="${C.gold}" stroke="${C.gold}" stroke-width="8" stroke-linejoin="round"/><path d="${star(50, 53, 30, 13)}" fill="#F7D774"/>` },
  { key: 'sparkle', name: 'Sparkle', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `<path d="${sparkle(46, 52, 42)}" fill="${C.gold}"/><path d="${sparkle(46, 52, 20)}" fill="#FFF3C4"/><path d="${sparkle(82, 18, 12)}" fill="${C.gold}"/>` },
  { key: 'butterfly', name: 'Butterfly', cat: 'cute', w: 100, h: 100, cut: true, svg: () => {
    const wing = `<path d="M47 50C40 28 18 14 9 24c-9 10 3 27 20 30-14 4-19 19-10 25 9 6 23-7 28-29z" fill="${C.pink}"/><circle cx="24" cy="33" r="5" fill="#fff" opacity=".8"/><circle cx="27" cy="66" r="4" fill="#fff" opacity=".8"/>`;
    return `${wing}<g transform="translate(100 0) scale(-1 1)">${wing}</g><rect x="46" y="30" width="8" height="46" rx="4" fill="${C.ink}"/><path d="M48 31c-3-8-8-12-13-13M52 31c3-8 8-12 13-13" stroke="${C.ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; } },
  { key: 'daisy', name: 'Daisy', cat: 'cute', w: 100, h: 100, cut: true, svg: () =>
    Array.from({ length: 12 }, (_, i) => `<ellipse cx="50" cy="24" rx="9" ry="22" fill="#fff" stroke="#F1E4D8" stroke-width="1.5" transform="rotate(${i * 30} 50 50)"/>`).join('') + `<circle cx="50" cy="50" r="14" fill="${C.gold}"/><circle cx="46" cy="46" r="4" fill="#FFE59A"/>` },
  { key: 'lips', name: 'Kiss', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `
    <path d="M8 50c10-14 22-22 30-20 5 1 9 4 12 4s7-3 12-4c8-2 20 6 30 20-12 2-24 4-42 4S20 52 8 50z" fill="${C.red}"/>
    <path d="M8 50c14 4 28 6 42 6s28-2 42-6c-8 16-24 26-42 26S16 66 8 50z" fill="#B5122E"/><path d="M32 65c8 3 15 4 21 4" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55" fill="none"/>` },
  { key: 'smiley', name: 'Smiley', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `<circle cx="50" cy="50" r="42" fill="#F7D046"/><ellipse cx="37" cy="40" rx="5" ry="8" fill="${C.ink}"/><ellipse cx="63" cy="40" rx="5" ry="8" fill="${C.ink}"/><path d="M28 58c8 14 36 14 44 0" stroke="${C.ink}" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="24" cy="56" r="6" fill="#F59AA8" opacity=".7"/><circle cx="76" cy="56" r="6" fill="#F59AA8" opacity=".7"/>` },
  { key: 'cherries', name: 'Cherries', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `
    <path d="M52 12C48 26 40 38 32 52M52 12c5 16 12 30 18 44" fill="none" stroke="#5B3A1E" stroke-width="4" stroke-linecap="round"/><path d="M52 12c8-9 20-10 28-5-7 8-18 9-28 5z" fill="#5E8F3E"/>
    <circle cx="70" cy="68" r="18" fill="${C.deep}"/><circle cx="31" cy="66" r="20" fill="${C.red}"/><circle cx="24" cy="58" r="5" fill="#fff" opacity=".7"/><circle cx="64" cy="61" r="4" fill="#fff" opacity=".6"/>` },
  { key: 'camera', name: 'Camera', cat: 'cute', w: 100, h: 100, cut: true, svg: () => `
    <rect x="10" y="28" width="80" height="58" rx="14" fill="${C.cream}" stroke="${C.blush}" stroke-width="3"/><rect x="30" y="18" width="24" height="14" rx="5" fill="${C.cream}" stroke="${C.blush}" stroke-width="3"/>
    <circle cx="50" cy="57" r="21" fill="${C.pink}"/><circle cx="50" cy="57" r="15" fill="${C.ink}"/><circle cx="44" cy="51" r="5" fill="#fff" opacity=".85"/><circle cx="76" cy="40" r="4.5" fill="${C.red}"/>` },
  { key: 'disco', name: 'Disco', cat: 'cute', w: 100, h: 100, cut: true, svg: () => {
    let g = '';
    for (let y = 14; y < 90; y += 10) for (let x = 14; x < 90; x += 10) if ((x - 50) ** 2 + (y - 54) ** 2 < 38 ** 2) g += `<rect x="${x}" y="${y}" width="9" height="9" fill="${['#E9E4F0', '#B9B3C9', '#FFFFFF', '#D5CFE2', '#9D96B3'][(x * 7 + y * 3) % 5]}"/>`;
    return `<line x1="50" y1="0" x2="50" y2="16" stroke="${C.ink}" stroke-width="2"/><clipPath id="b"><circle cx="50" cy="54" r="38"/></clipPath><circle cx="50" cy="54" r="38" fill="#7D7690"/><g clip-path="url(#b)">${g}</g><path d="${sparkle(30, 36, 10)}" fill="#fff"/>`; } },
  { key: 'cloud', name: 'Cloud', cat: 'cute', w: 100, h: 70, cut: true, svg: () => `<path d="M22 62c-11 0-18-8-18-17 0-10 8-17 18-17 2-12 12-21 25-21 11 0 20 6 24 16 2-1 5-1 7-1 11 0 18 9 18 20s-8 20-19 20z" fill="#fff" stroke="#E6DCEF" stroke-width="2"/><circle cx="38" cy="40" r="3.5" fill="${C.ink}"/><circle cx="60" cy="40" r="3.5" fill="${C.ink}"/><path d="M44 47c3 3 8 3 11 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="31" cy="46" r="4" fill="#F59AA8" opacity=".6"/><circle cx="67" cy="46" r="4" fill="#F59AA8" opacity=".6"/>` },

  // words, die-cut badges
  { key: 'w-xoxo', name: 'xoxo', cat: 'words', w: 150, h: 64, cut: true, svg: () => `<rect x="4" y="4" width="142" height="56" rx="28" fill="${C.pink}"/>${txt(75, 33, 34, C.white, 'xoxo', SERIF, 'font-style="italic" font-weight="700"')}` },
  { key: 'w-besties', name: 'besties', cat: 'words', w: 120, h: 120, cut: true, svg: () => `<path d="${scallop(60, 60, 48)}" fill="${C.red}"/><circle cx="60" cy="60" r="40" fill="none" stroke="${C.cream}" stroke-width="2" stroke-dasharray="4 4"/>${txt(60, 60, 26, C.cream, 'besties', SERIF, 'font-style="italic" font-weight="700"')}` },
  { key: 'w-core', name: 'core memory', cat: 'words', w: 180, h: 70, cut: true, svg: () => `<path d="M10 4h160a6 6 0 0 0 6 6v14a11 11 0 0 0 0 22v14a6 6 0 0 0-6 6H10a6 6 0 0 0-6-6V46a11 11 0 0 0 0-22V10a6 6 0 0 0 6-6z" fill="${C.cream}"/><rect x="16" y="12" width="148" height="46" rx="3" fill="none" stroke="${C.red}" stroke-width="2" stroke-dasharray="5 4"/>${txt(90, 36, 22, C.red, 'CORE MEMORY', MONO, 'font-weight="700" letter-spacing="2"')}` },
  { key: 'w-date', name: 'date night', cat: 'words', w: 190, h: 64, cut: true, svg: () => `<path d="M4 14h22v40H4l10-20z" fill="${C.deep}"/><path d="M186 14h-22v40h22l-10-20z" fill="${C.deep}"/><rect x="18" y="6" width="154" height="44" rx="4" fill="${C.red}"/>${txt(95, 29, 26, C.cream, 'date night', SERIF, 'font-style="italic" font-weight="700"')}` },
  { key: 'w-bday', name: 'happy birthday', cat: 'words', w: 220, h: 64, cut: true, svg: () => `<path d="M4 8h212l-12 24 12 24H4l12-24z" fill="${C.pink}"/>${txt(110, 33, 24, C.ink, 'happy birthday', SERIF, 'font-style="italic" font-weight="700"')}<path d="${sparkle(30, 32, 7)}" fill="#fff"/><path d="${sparkle(190, 32, 7)}" fill="#fff"/>` },
  { key: 'w-cheese', name: 'cheese!', cat: 'words', w: 140, h: 100, cut: true, svg: () => `<path d="M14 8h112a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H54L30 94l6-22H14A10 10 0 0 1 4 62V18A10 10 0 0 1 14 8z" fill="#fff" stroke="${C.ink}" stroke-width="3"/>${txt(70, 40, 30, C.ink, 'cheese!', SERIF, 'font-weight="700"')}` },
  { key: 'w-bff', name: 'bff', cat: 'words', w: 110, h: 110, cut: true, svg: () => `<path d="${heartPath(1.1, 0, 2)}" fill="${C.red}"/>${txt(55, 50, 32, C.cream, 'bff', SERIF, 'font-weight="700" font-style="italic"')}` },
  { key: 'w-cheers', name: 'cheers', cat: 'words', w: 160, h: 70, cut: true, svg: () => `<rect x="4" y="6" width="152" height="58" rx="10" fill="${C.ink}"/>${txt(80, 35, 30, C.gold, 'cheers!', SERIF, 'font-style="italic" font-weight="700"')}` },

  // tape & paper (no border, slightly see-through like real washi)
  { key: 't-gingham', name: 'Pink gingham', cat: 'tape', w: 220, h: 56, cut: false, svg: () => `<defs><pattern id="g" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#FBE3EA"/><rect width="8" height="16" fill="#F4A6B8" opacity=".55"/><rect width="16" height="8" fill="#F4A6B8" opacity=".55"/></pattern></defs><path d="${zigzagRect(220, 56)}" fill="url(#g)" opacity=".92"/>` },
  { key: 't-stripe', name: 'Cherry stripe', cat: 'tape', w: 220, h: 56, cut: false, svg: () => `<defs><pattern id="s" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="#FFF3F0"/><rect width="8" height="18" fill="${C.red}" opacity=".85"/></pattern></defs><path d="${zigzagRect(220, 56)}" fill="url(#s)" opacity=".9"/>` },
  { key: 't-dots', name: 'Cream dots', cat: 'tape', w: 220, h: 56, cut: false, svg: () => `<defs><pattern id="d" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#F3E3C7"/><circle cx="8" cy="8" r="3" fill="${C.red}" opacity=".7"/></pattern></defs><path d="${zigzagRect(220, 56)}" fill="url(#d)" opacity=".9"/>` },
  { key: 't-clear', name: 'Clear tape', cat: 'tape', w: 200, h: 54, cut: false, svg: () => `<path d="${zigzagRect(200, 54)}" fill="#FFFFFF" opacity=".55"/><path d="M8 10h184" stroke="#fff" stroke-width="3" opacity=".7"/>` },
  { key: 't-corner', name: 'Photo corner', cat: 'tape', w: 80, h: 80, cut: false, tint: true, svg: (c) => `<path d="M0 0h80L0 80z" fill="${c}"/><path d="M8 8h50" stroke="#fff" stroke-width="2" opacity=".25"/>` },
  { key: 't-heartpin', name: 'Heart pin', cat: 'tape', w: 60, h: 60, cut: false, svg: () => `<ellipse cx="30" cy="52" rx="14" ry="4" fill="#000" opacity=".2"/><path d="${heartPath(0.56, 2, 0)}" fill="${C.red}"/><circle cx="22" cy="18" r="4" fill="#fff" opacity=".6"/>` },

  // doodles: hand-drawn line art in any colour
  ...(([
    ['d-hearts', 'Hearts', 120, 100, (c: string) => `<path d="${heartPath(0.62, 4, 26)}" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><path d="${heartPath(0.4, 66, 6)}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round"/>`],
    ['d-arrow', 'Arrow', 140, 90, (c: string) => `<path d="M10 70C30 20 80 10 120 34" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M102 20l20 14-22 10" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`],
    ['d-crown', 'Crown', 120, 80, (c: string) => `<path d="M14 66 8 18l28 24 24-34 24 34 28-24-6 48z" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/><circle cx="8" cy="14" r="4" fill="${c}"/><circle cx="60" cy="6" r="4" fill="${c}"/><circle cx="112" cy="14" r="4" fill="${c}"/>`],
    ['d-sparkles', 'Sparkles', 120, 100, (c: string) => `<path d="${sparkle(40, 54, 30, 0.18)}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round"/><path d="${sparkle(92, 26, 16, 0.2)}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><path d="${sparkle(94, 80, 10, 0.2)}" fill="${c}"/>`],
    ['d-circle', 'Circle it', 160, 120, (c: string) => `<path d="M88 12C40 8 8 34 12 64s52 48 96 40 50-40 34-66S78 4 44 22" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`],
    ['d-squiggle', 'Squiggle', 180, 40, (c: string) => `<path d="M6 22c14-16 22 16 36 0s22 16 36 0 22 16 36 0 22 16 36 0 16 10 24 4" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`],
    ['d-stars', 'Stars', 120, 90, (c: string) => `<path d="${star(36, 50, 28, 12)}" fill="none" stroke="${c}" stroke-width="4.5" stroke-linejoin="round"/><path d="${star(94, 30, 16, 7)}" fill="${c}"/>`],
    ['d-xo', 'xo', 130, 80, (c: string) => `<path d="M14 22l34 38M48 22 14 60" stroke="${c}" stroke-width="6" stroke-linecap="round"/><ellipse cx="90" cy="41" rx="24" ry="21" fill="none" stroke="${c}" stroke-width="6" transform="rotate(-8 90 41)"/>`],
  ]) as [string, string, number, number, (c: string) => string][]).map(([key, name, w, h, svg]) => ({ key, name, cat: 'doodles' as const, w, h, cut: false, tint: true, svg })),
];
export const DECOR_CATS: { id: DecorCat; name: string }[] = [{ id: 'cute', name: 'stickers' }, { id: 'words', name: 'words' }, { id: 'tape', name: 'tape' }, { id: 'doodles', name: 'doodles' }];
export const byKey = (k: string) => DECOR.find((d) => d.key === k);

/** Data URL of the raw SVG (used for the picker thumbnails). */
export const decorUrl = (d: Decor, color = C.red) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.w} ${d.h}" width="${d.w * 4}" height="${d.h * 4}">${d.svg(color)}</svg>`)}`;

/* ---------- rasterised, die-cut versions for the canvas ---------- */
const ready = new Map<string, HTMLCanvasElement>();
const pending = new Set<string>();
const RES = 480; // longest side of the cached bitmap

/** Returns the ready bitmap, or null while it loads (call onReady to redraw). */
export function decorBitmap(key: string, color: string | undefined, onReady: () => void): HTMLCanvasElement | null {
  const d = byKey(key); if (!d) return null;
  const col = d.tint ? color || C.red : '';
  const id = `${key}|${col}`;
  const hit = ready.get(id); if (hit) return hit;
  if (!pending.has(id)) {
    pending.add(id);
    const img = new Image();
    img.onload = () => {
      const k = RES / Math.max(d.w, d.h), w = Math.round(d.w * k), h = Math.round(d.h * k);
      const pad = d.cut ? Math.round(RES * 0.045) : 2, c = document.createElement('canvas');
      c.width = w + pad * 2; c.height = h + pad * 2;
      const x = c.getContext('2d')!;
      if (d.cut) {
        // white silhouette stamped in a ring = die-cut border
        const sil = document.createElement('canvas'); sil.width = w; sil.height = h;
        const sx = sil.getContext('2d')!; sx.drawImage(img, 0, 0, w, h); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#fff'; sx.fillRect(0, 0, w, h);
        x.shadowColor = 'rgba(42,8,16,.28)'; x.shadowBlur = pad * 0.9; x.shadowOffsetY = pad * 0.35;
        for (let a = 0; a < 24; a++) x.drawImage(sil, pad + Math.cos((a / 24) * Math.PI * 2) * pad * 0.8, pad + Math.sin((a / 24) * Math.PI * 2) * pad * 0.8);
        x.shadowColor = 'transparent';
      }
      x.drawImage(img, pad, pad, w, h);
      ready.set(id, c); pending.delete(id); onReady();
    };
    img.onerror = () => pending.delete(id);
    img.src = decorUrl(d, col || undefined);
  }
  return null;
}

/* ---------- one-tap theme packs ---------- */
export type Placed = { key: string; x: number; y: number; s: number; r: number; color?: string };
export const THEMES: { id: string; name: string; preview: string[]; items: Placed[] }[] = [
  { id: 'coquette', name: 'coquette', preview: ['bow', 'heart'], items: [
    { key: 'bow', x: 0.14, y: 0.035, s: 0.34, r: -16 }, { key: 'bow', x: 0.9, y: 0.5, s: 0.22, r: 14 },
    { key: 'heart', x: 0.88, y: 0.12, s: 0.16, r: 12 }, { key: 'heart', x: 0.1, y: 0.72, s: 0.13, r: -10 },
    { key: 'd-sparkles', x: 0.86, y: 0.86, s: 0.2, r: 0, color: '#F4A6B8' }, { key: 'w-xoxo', x: 0.2, y: 0.955, s: 0.28, r: -6 } ] },
  { id: 'scrapbook', name: 'scrapbook', preview: ['t-gingham', 'w-core'], items: [
    { key: 't-gingham', x: 0.5, y: 0.012, s: 0.55, r: -3 }, { key: 't-stripe', x: 0.86, y: 0.975, s: 0.42, r: -32 },
    { key: 't-corner', x: 0.06, y: 0.5, s: 0.1, r: 0, color: '#2A0810' }, { key: 'w-core', x: 0.66, y: 0.62, s: 0.42, r: 6 },
    { key: 'd-arrow', x: 0.26, y: 0.3, s: 0.26, r: 18, color: '#D91F3F' }, { key: 'daisy', x: 0.12, y: 0.9, s: 0.16, r: -8 } ] },
  { id: 'party', name: 'party', preview: ['disco', 'w-bday'], items: [
    { key: 'disco', x: 0.86, y: 0.06, s: 0.24, r: 0 }, { key: 'star', x: 0.12, y: 0.2, s: 0.14, r: -12 }, { key: 'sparkle', x: 0.9, y: 0.4, s: 0.13, r: 0 },
    { key: 'star', x: 0.1, y: 0.62, s: 0.11, r: 14 }, { key: 'd-stars', x: 0.86, y: 0.78, s: 0.2, r: 0, color: '#F2C14E' }, { key: 'w-bday', x: 0.5, y: 0.928, s: 0.5, r: -3 } ] },
  { id: 'y2k', name: 'y2k', preview: ['butterfly', 'smiley'], items: [
    { key: 'butterfly', x: 0.86, y: 0.08, s: 0.22, r: 16 }, { key: 'sparkle', x: 0.14, y: 0.08, s: 0.15, r: 0 }, { key: 'smiley', x: 0.12, y: 0.46, s: 0.15, r: -10 },
    { key: 'cloud', x: 0.86, y: 0.66, s: 0.22, r: 0 }, { key: 'd-sparkles', x: 0.16, y: 0.84, s: 0.2, r: 0, color: '#9D96B3' }, { key: 'w-bff', x: 0.84, y: 0.94, s: 0.2, r: 10 } ] },
  { id: 'date', name: 'date night', preview: ['lips', 'w-date'], items: [
    { key: 'lips', x: 0.86, y: 0.07, s: 0.18, r: 14 }, { key: 'd-hearts', x: 0.14, y: 0.3, s: 0.2, r: -8, color: '#D91F3F' }, { key: 'heart', x: 0.88, y: 0.52, s: 0.13, r: 10 },
    { key: 'cherries', x: 0.12, y: 0.74, s: 0.16, r: -12 }, { key: 'w-date', x: 0.5, y: 0.93, s: 0.46, r: 3 } ] },
  { id: 'doodle', name: 'doodles', preview: ['d-crown', 'd-circle'], items: [
    { key: 'd-crown', x: 0.5, y: 0.03, s: 0.26, r: -6, color: '#F2C14E' }, { key: 'd-squiggle', x: 0.5, y: 0.935, s: 0.5, r: -2, color: '#D91F3F' },
    { key: 'd-xo', x: 0.86, y: 0.36, s: 0.2, r: 10, color: '#D91F3F' }, { key: 'd-hearts', x: 0.14, y: 0.6, s: 0.2, r: -10, color: '#F4A6B8' }, { key: 'd-sparkles', x: 0.86, y: 0.8, s: 0.18, r: 0, color: '#2A0810' } ] },
];
export const PALETTE = ['#FFFFFF', '#2A0810', '#D91F3F', '#F4A6B8', '#F2C14E', '#9D96B3', '#5E8F3E', '#6FA8DC'];
