import { applyVintage, type StripStyle } from './filters';
import { drawFigure, poseImages, type Pose } from './poses';

/* ---------- Layouts ---------- */
export type Layout = { id: string; name: string; shots: number; cols: number; rows: number; pw: number; ph: number; side: number; top: number; bottom: number; gap: number; aw?: number /* pose panel beside each photo */ };
export const LAYOUTS: Layout[] = [
  { id: 'strip4', name: 'Classic strip', shots: 4, cols: 1, rows: 4, pw: 540, ph: 405, side: 30, top: 28, bottom: 110, gap: 14 },
  { id: 'strip3', name: '3-cut strip', shots: 3, cols: 1, rows: 3, pw: 540, ph: 405, side: 30, top: 28, bottom: 110, gap: 14 },
  { id: 'grid4', name: '2x2 grid', shots: 4, cols: 2, rows: 2, pw: 540, ph: 405, side: 30, top: 30, bottom: 100, gap: 14 },
  { id: 'strip2', name: '2-cut strip', shots: 2, cols: 1, rows: 2, pw: 540, ph: 405, side: 30, top: 28, bottom: 110, gap: 14 },
  { id: 'grid6', name: '6-grid', shots: 6, cols: 2, rows: 3, pw: 540, ph: 405, side: 30, top: 30, bottom: 100, gap: 14 },
  { id: 'film4', name: 'Film roll', shots: 4, cols: 4, rows: 1, pw: 360, ph: 480, side: 30, top: 28, bottom: 90, gap: 14 },
  { id: 'pose4', name: 'Pose strip', shots: 4, cols: 1, rows: 4, pw: 520, ph: 390, side: 30, top: 28, bottom: 100, gap: 14, aw: 390 },
  { id: 'single', name: 'Single print', shots: 1, cols: 1, rows: 1, pw: 960, ph: 720, side: 24, top: 24, bottom: 70, gap: 0 },
  { id: 'polaroid-wide', name: 'Wide instant', shots: 1, cols: 1, rows: 1, pw: 960, ph: 640, side: 44, top: 44, bottom: 190, gap: 0 },
  { id: 'polaroid-mini', name: 'Mini instant', shots: 1, cols: 1, rows: 1, pw: 540, ph: 720, side: 32, top: 40, bottom: 150, gap: 0 },
  { id: 'polaroid', name: 'Classic instant', shots: 1, cols: 1, rows: 1, pw: 720, ph: 720, side: 40, top: 40, bottom: 200, gap: 0 },
];
export const sizeOf = (l: Layout) => ({
  w: l.side * 2 + l.cols * l.pw + (l.cols - 1) * l.gap + (l.aw ? l.aw + l.gap : 0),
  h: l.top + l.rows * l.ph + (l.rows - 1) * l.gap + l.bottom,
});

/* ---------- Frames ---------- */
export type Frame = { id: string; name: string; bg: string; ink: string; pattern?: 'dots' | 'stripes' | 'checker' | 'hearts'; accent?: string };
export const FRAMES: Frame[] = [
  { id: 'cream', name: 'Cream', bg: '#f1e4c3', ink: '#6a4a33' },
  { id: 'white', name: 'White', bg: '#faf7f0', ink: '#5b5247' },
  { id: 'kraft', name: 'Kraft', bg: '#c9a77c', ink: '#4a3322' },
  { id: 'midnight', name: 'Midnight', bg: '#1d1b24', ink: '#e9dcc0' },
  { id: 'rose', name: 'Rose', bg: '#f4c6cf', ink: '#7a3b4a' },
  { id: 'sage', name: 'Sage', bg: '#cfd9c2', ink: '#44563b' },
  { id: 'dots', name: 'Polka', bg: '#f1e4c3', ink: '#6a4a33', pattern: 'dots', accent: '#e0a458' },
  { id: 'stripes', name: 'Candy', bg: '#fbefe3', ink: '#8a2f3a', pattern: 'stripes', accent: '#e9a1ab' },
  { id: 'checker', name: 'Diner', bg: '#f7f2e8', ink: '#222', pattern: 'checker', accent: '#2b2b2b' },
  { id: 'hearts', name: 'Hearts', bg: '#f8d7dd', ink: '#8a2f4a', pattern: 'hearts', accent: '#e57b92' },
];
export function customFrame(color: string): Frame {
  const n = parseInt(color.slice(1), 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return { id: 'custom', name: 'Custom', bg: color, ink: lum > 140 ? '#4a3a2c' : '#f1e4c3' };
}

function drawFrameBg(ctx: CanvasRenderingContext2D, w: number, h: number, f: Frame) {
  ctx.fillStyle = f.bg; ctx.fillRect(0, 0, w, h);
  if (!f.pattern) return;
  ctx.fillStyle = f.accent!; ctx.strokeStyle = f.accent!;
  if (f.pattern === 'dots') for (let y = 14; y < h; y += 34) for (let x = 14 + ((y / 34) % 2 ? 17 : 0); x < w; x += 34) { ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); }
  if (f.pattern === 'stripes') for (let x = 0; x < w; x += 40) ctx.fillRect(x, 0, 20, h);
  if (f.pattern === 'checker') for (let y = 0; y < h; y += 30) for (let x = 0; x < w; x += 30) if (((x + y) / 30) % 2 === 0) ctx.fillRect(x, y, 30, 30);
  if (f.pattern === 'hearts') { ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; for (let y = 20; y < h; y += 46) for (let x = 20 + ((y / 46) % 2 ? 23 : 0); x < w; x += 46) ctx.fillText('♥', x, y); }
}

/* ---------- Composition ---------- */
export function cropCover(src: HTMLCanvasElement, w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const t = w / h; let sw = src.width, sh = src.width / t;
  if (sh > src.height) { sh = src.height; sw = src.height * t; }
  c.getContext('2d')!.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, w, h);
  return c;
}

export function dateStamp() {
  const d = new Date();
  return `${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()} ${d.getFullYear()}`;
}

/** Photos are raw full-frame canvases; they're cropped per layout, filtered (cached) then framed. */
export function buildBase(raw: HTMLCanvasElement[], L: Layout, look: StripStyle, frame: Frame, cache: Map<string, HTMLCanvasElement>, poses?: Pose[] | null) {
  const { w, h } = sizeOf(L);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  drawFrameBg(ctx, w, h, frame);
  for (let i = 0; i < L.shots; i++) {
    const key = `${look.id}|${i}|${L.pw}x${L.ph}`;
    let p = cache.get(key);
    if (!p) { const cropped = cropCover(raw[i], L.pw, L.ph); p = look.id === 'original' ? cropped : applyVintage(cropped, look.look); cache.set(key, p); }
    const px = L.side + (i % L.cols) * (L.pw + L.gap), py = L.top + Math.floor(i / L.cols) * (L.ph + L.gap);
    ctx.drawImage(p, px, py);
    if (L.aw && poses?.[i]) { // pose card beside the photo
      const ax = px + L.pw + L.gap;
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(ax, py, L.aw, L.ph);
      const pimg = poseImages.get(poses[i].group ? `group:${poses[i].id}` : poses[i].id) ?? poseImages.get(poses[i].id);
      if (pimg && pimg.complete && pimg.naturalWidth) {
        const cw = L.aw - 24, ch = L.ph - 70, k = Math.max(cw / pimg.naturalWidth, ch / pimg.naturalHeight);
        const sw = cw / k, sh = ch / k;
        ctx.drawImage(pimg, (pimg.naturalWidth - sw) / 2, (pimg.naturalHeight - sh) * 0.3, sw, sh, ax + 12, py + 12, cw, ch);
      } else drawFigure(ctx, poses[i], ax + L.aw / 2, py + L.ph * 0.52, L.ph * 0.3, frame.ink);
      ctx.fillStyle = frame.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '700 26px "American Typewriter","Courier New",monospace'; ctx.fillText(poses[i].name.toUpperCase(), ax + L.aw / 2, py + L.ph - 30);
      ctx.font = '48px "Apple Color Emoji","Segoe UI Emoji",sans-serif'; ctx.fillText(poses[i].emoji, ax + L.aw - 44, py + 44);
    }
  }
  ctx.fillStyle = frame.ink; ctx.font = '600 26px "American Typewriter","Courier New",monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = 0.85;
  ctx.fillText(dateStamp(), w / 2, h - L.bottom / 2 + (L.id.startsWith('polaroid') ? 40 : 6)); ctx.globalAlpha = 1;
  return c;
}

/* ---------- Stickers / text / drawing ---------- */
export const STICKERS = ['⭐', '❤️', '✨', '🎀', '🌸', '😎', '🦋', '🌈', '💋', '🍒', '📸', '🔥'];

/** Text fonts are the site's own (next/font), read from their CSS variables at draw time. */
export const FONTS = {
  hand: { label: 'handwritten', v: '--font-hand', w: '600', fb: 'cursive' },
  serif: { label: 'serif', v: '--font-serif', w: '400', fb: 'Georgia,serif' },
  italic: { label: 'italic', v: '--font-italic', w: 'italic 400', fb: 'Georgia,serif' },
  type: { label: 'typewriter', v: '--font-mono', w: '500', fb: '"Courier New",monospace' },
  bold: { label: 'bold', v: '--font-sans', w: '800', fb: 'Arial,sans-serif' },
} as const;
export type FontKey = keyof typeof FONTS;
export const TEXT_STYLES = ['plain', 'outline', 'pill', 'label'] as const;
export type TextStyle = (typeof TEXT_STYLES)[number];
const famCache = new Map<string, string>();
const family = (k: FontKey) => {
  if (!famCache.has(k) && typeof document !== 'undefined') {
    const v = getComputedStyle(document.documentElement).getPropertyValue(FONTS[k].v).trim();
    famCache.set(k, `${v ? v + ',' : ''}${FONTS[k].fb}`);
  }
  return famCache.get(k) ?? FONTS[k].fb;
};
const fontFor = (k: FontKey, px: number) => `${FONTS[k].w} ${px}px ${family(k)}`;

export type Item =
  | { id: number; type: 'sticker'; ch: string; x: number; y: number; s: number; r?: number }
  | { id: number; type: 'art'; key: string; x: number; y: number; s: number; r?: number; color?: string; theme?: boolean }
  | { id: number; type: 'text'; text: string; x: number; y: number; s: number; r?: number; color: string; font: FontKey; style?: TextStyle }
  | { id: number; type: 'stroke'; pts: [number, number][]; color: string; w: number };

/** Art is sized against the short side so themes look the same on strips, grids and wide prints. */
const artPx = (s: number, W: number, H: number) => s * Math.min(W, H);
const ink = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150 ? '#2A0810' : '#FFFFFF'; };

export function itemBox(ctx: CanvasRenderingContext2D, it: Item, W: number, H: number, getArt?: (it: Extract<Item, { type: 'art' }>) => HTMLCanvasElement | null) {
  if (it.type === 'stroke') return null;
  let w: number, h: number;
  if (it.type === 'sticker') { w = it.s * W * 1.1; h = it.s * W * 1.2; }
  else if (it.type === 'art') { const bm = getArt?.(it); const L = artPx(it.s, W, H); w = bm ? (bm.width >= bm.height ? L : (L * bm.width) / bm.height) : L; h = bm ? (bm.width >= bm.height ? (L * bm.height) / bm.width : L) : L; }
  else { ctx.font = fontFor(it.font, it.s * W); w = ctx.measureText(it.text).width + (it.style === 'pill' || it.style === 'label' ? it.s * W * 1.2 : 0); h = it.s * W * 1.5; }
  return { x: it.x * W - w / 2, y: it.y * H - h / 2, w, h };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

export function drawItems(ctx: CanvasRenderingContext2D, items: Item[], W: number, H: number, selId?: number | null, getArt?: (it: Extract<Item, { type: 'art' }>) => HTMLCanvasElement | null) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const it of items) {
    if (it.type === 'stroke') {
      ctx.strokeStyle = it.color; ctx.lineWidth = it.w * W; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); it.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)));
      if (it.pts.length === 1) ctx.lineTo(it.pts[0][0] * W + 0.1, it.pts[0][1] * H);
      ctx.stroke(); continue;
    }
    ctx.save(); ctx.translate(it.x * W, it.y * H); ctx.rotate(((it.r ?? 0) * Math.PI) / 180);
    if (it.type === 'sticker') {
      ctx.font = `${it.s * W}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`; ctx.fillText(it.ch, 0, 0);
    } else if (it.type === 'art') {
      const bm = getArt?.(it), b = itemBox(ctx, it, W, H, getArt);
      if (bm && b) ctx.drawImage(bm, -b.w / 2, -b.h / 2, b.w, b.h);
    } else {
      const px = it.s * W; ctx.font = fontFor(it.font, px);
      const tw = ctx.measureText(it.text).width, style = it.style ?? 'plain';
      if (style === 'pill' || style === 'label') {
        const padX = px * 0.6, bh = px * 1.45;
        ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = px * 0.25; ctx.shadowOffsetY = px * 0.08;
        ctx.fillStyle = it.color;
        if (style === 'pill') rr(ctx, -tw / 2 - padX, -bh / 2, tw + padX * 2, bh, bh / 2);
        else rr(ctx, -tw / 2 - padX, -bh / 2, tw + padX * 2, bh, px * 0.12);
        ctx.fill(); ctx.shadowColor = 'transparent';
        if (style === 'label') { ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = px * 0.05; ctx.stroke(); }
        ctx.fillStyle = ink(it.color); ctx.fillText(it.text, 0, px * 0.04);
      } else if (style === 'outline') {
        ctx.lineJoin = 'round'; ctx.strokeStyle = ink(it.color) === '#2A0810' ? '#2A0810' : '#FFFFFF'; ctx.lineWidth = px * 0.22;
        ctx.strokeText(it.text, 0, 0); ctx.fillStyle = it.color; ctx.fillText(it.text, 0, 0);
      } else {
        ctx.fillStyle = it.color; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = px * 0.15;
        ctx.fillText(it.text, 0, 0);
      }
    }
    ctx.restore();
  }
  if (selId != null) {
    const it = items.find((i) => i.id === selId), b = it && itemBox(ctx, it, W, H, getArt);
    if (it && b && it.type !== 'stroke') {
      ctx.save(); ctx.translate(it.x * W, it.y * H); ctx.rotate(((it.r ?? 0) * Math.PI) / 180);
      ctx.strokeStyle = '#D91F3F'; ctx.lineWidth = Math.max(2, W / 300); ctx.setLineDash([10, 8]);
      ctx.strokeRect(-b.w / 2 - 6, -b.h / 2 - 6, b.w + 12, b.h + 12); ctx.restore();
    }
  }
}

/* ---------- Export ---------- */
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export const toPng = (c: HTMLCanvasElement) => new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));

/** 1080x1920 Instagram-Story sized image with the strip centred on a booth-dark background. */
export function storyCanvas(strip: HTMLCanvasElement) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#3a1a16'); g.addColorStop(1, '#140d0b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  const r = ctx.createRadialGradient(540, 700, 50, 540, 700, 900); r.addColorStop(0, 'rgba(240,162,74,.28)'); r.addColorStop(1, 'transparent');
  ctx.fillStyle = r; ctx.fillRect(0, 0, 1080, 1920);
  const s = Math.min(900 / strip.width, 1640 / strip.height), w = strip.width * s, h = strip.height * s;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  ctx.drawImage(strip, (1080 - w) / 2, (1920 - h) / 2, w, h);
  return c;
}

/** Records the strip sliding out of a booth slot. Returns a video Blob (mp4 on Safari, webm on Chrome). */
export async function printVideo(strip: HTMLCanvasElement): Promise<{ blob: Blob; ext: string }> {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const ctx = c.getContext('2d')!;
  const types = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  const mime = types.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t));
  if (!mime) throw new Error('Video recording is not supported in this browser.');
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = []; rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const done = new Promise<void>((r) => (rec.onstop = () => r()));
  const s = Math.min(760 / strip.width, 1350 / strip.height), w = strip.width * s, h = strip.height * s;
  const slotY = 250, endY = slotY + 60, DUR = 4200, HOLD = 1500;
  rec.start();
  await new Promise<void>((resolve) => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = now - t0, p = Math.min(1, t / DUR), e = 1 - Math.pow(1 - p, 3);
      const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#3a1a16'); g.addColorStop(1, '#140d0b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
      ctx.save(); ctx.beginPath(); ctx.rect(0, slotY, 1080, 1920 - slotY); ctx.clip();
      ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 40;
      const top = slotY - h + e * (h + (endY - slotY));
      ctx.drawImage(strip, (1080 - w) / 2, top, w, h); ctx.restore();
      ctx.fillStyle = '#0b0605'; ctx.fillRect(140, slotY - 36, 800, 40);
      ctx.fillStyle = '#c97b22'; ctx.fillRect(140, slotY + 4, 800, 5);
      if (t < DUR + HOLD) requestAnimationFrame(frame); else resolve();
    };
    requestAnimationFrame(frame);
  });
  rec.stop(); await done;
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext: mime.startsWith('video/mp4') ? 'mp4' : 'webm' };
}
