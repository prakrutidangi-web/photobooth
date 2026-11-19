/**
 * Square "scene" posts: the finished print placed on a styled square canvas.
 * Theme = backdrop + how the print is attached (tape, pin, pegs on a line, spotlight...).
 * Layout = how many copies and where (one, a pair like a real booth gives you, tilted, or print + caption).
 * Works for any layout: tall strips, grids, wide film rolls and instant prints are fitted automatically.
 */
import { decorBitmap } from './decor';
import { fontFor } from './studio';

export type SceneLayout = 'single' | 'pair' | 'tilt' | 'caption';
export const SCENE_LAYOUTS: { id: SceneLayout; name: string }[] = [
  { id: 'single', name: 'one print' }, { id: 'pair', name: 'pair' }, { id: 'tilt', name: 'tilted' }, { id: 'caption', name: 'with caption' },
];
type Attach = 'tape' | 'tape-dots' | 'pin' | 'pegs' | 'none';
export type SceneTheme = { id: string; name: string; swatch: string; ink: string; attach: Attach; bg: (x: CanvasRenderingContext2D, S: number) => void; over?: (x: CanvasRenderingContext2D, S: number) => void };

/* deterministic noise so previews and downloads match */
const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const speckle = (x: CanvasRenderingContext2D, S: number, n: number, cols: string[], rmax: number, seed = 7) => {
  const r = rand(seed);
  for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; x.globalAlpha = 0.25 + r() * 0.5; x.beginPath(); x.arc(r() * S, r() * S, (0.3 + r()) * rmax, 0, 7); x.fill(); }
  x.globalAlpha = 1;
};
const vignette = (x: CanvasRenderingContext2D, S: number, a = 0.35, col = '0,0,0') => {
  const g = x.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.75);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); x.fillStyle = g; x.fillRect(0, 0, S, S);
};
const sparkle = (x: CanvasRenderingContext2D, cx: number, cy: number, R: number) => {
  const q = R * 0.16; x.beginPath(); x.moveTo(cx, cy - R);
  x.bezierCurveTo(cx + q, cy - q, cx + q, cy - q, cx + R, cy); x.bezierCurveTo(cx + q, cy + q, cx + q, cy + q, cx, cy + R);
  x.bezierCurveTo(cx - q, cy + q, cx - q, cy + q, cx - R, cy); x.bezierCurveTo(cx - q, cy - q, cx - q, cy - q, cx, cy - R); x.fill();
};
const folds = (x: CanvasRenderingContext2D, x0: number, w: number, H: number, base: string, n: number) => {
  const g = x.createLinearGradient(x0, 0, x0 + w, 0);
  for (let i = 0; i <= n; i++) { const t = i / n; g.addColorStop(Math.min(1, t), i % 2 ? 'rgba(255,190,200,.16)' : 'rgba(20,0,6,.55)'); }
  x.fillStyle = base; x.fillRect(x0, 0, w, H); x.fillStyle = g; x.fillRect(x0, 0, w, H);
};

export const SCENE_THEMES: SceneTheme[] = [
  { id: 'gingham', name: 'picnic', swatch: 'repeating-linear-gradient(90deg,#F4A6B8 0 8px,#FBE3EA 8px 16px)', ink: '#A50F2A', attach: 'tape',
    bg: (x, S) => {
      x.fillStyle = '#FCEEF1'; x.fillRect(0, 0, S, S); const u = S / 14; x.fillStyle = 'rgba(244,166,184,.5)';
      for (let i = 0; i < 14; i += 2) { x.fillRect(i * u, 0, u, S); x.fillRect(0, i * u, S, u); }
      vignette(x, S, 0.12, '120,20,40');
    } },
  { id: 'cork', name: 'cork board', swatch: '#C99A63', ink: '#2A0810', attach: 'pin',
    bg: (x, S) => {
      x.fillStyle = '#C79A64'; x.fillRect(0, 0, S, S);
      speckle(x, S, 2600, ['#8A5E33', '#E3BE8C', '#A87542', '#6B4524'], S * 0.0035, 11);
      const f = S * 0.035; x.strokeStyle = '#7A5230'; x.lineWidth = f; x.strokeRect(f / 2, f / 2, S - f, S - f);
      x.strokeStyle = 'rgba(255,230,190,.25)'; x.lineWidth = f * 0.2; x.strokeRect(f * 0.9, f * 0.9, S - f * 1.8, S - f * 1.8);
      vignette(x, S, 0.3);
    } },
  { id: 'velvet', name: 'velvet stage', swatch: '#9C0E26', ink: '#FBF1E6', attach: 'none',
    bg: (x, S) => {
      x.fillStyle = '#1a0307'; x.fillRect(0, 0, S, S);
      const g = x.createRadialGradient(S / 2, S * 0.45, 0, S / 2, S * 0.45, S * 0.5); g.addColorStop(0, 'rgba(255,214,160,.35)'); g.addColorStop(1, 'rgba(255,214,160,0)');
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      folds(x, 0, S * 0.17, S, '#8C0C22', 7); folds(x, S * 0.83, S * 0.17, S, '#8C0C22', 7);
      x.fillStyle = '#7A0A1D'; x.beginPath(); x.moveTo(0, 0); x.lineTo(S, 0); x.lineTo(S, S * 0.07);
      for (let i = 12; i >= 0; i--) x.quadraticCurveTo(S * ((i + 0.5) / 12), S * 0.13, S * (i / 12), S * 0.07);
      x.fill(); x.fillStyle = '#E8B45E'; x.fillRect(0, S * 0.065, S, S * 0.006);
    },
    over: (x, S) => { const g = x.createLinearGradient(0, S * 0.85, 0, S); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = g; x.fillRect(0, 0, S, S); } },
  { id: 'darkroom', name: 'darkroom', swatch: '#5a0a10', ink: '#FFD9D9', attach: 'pegs',
    bg: (x, S) => {
      x.fillStyle = '#2a0306'; x.fillRect(0, 0, S, S);
      const g = x.createRadialGradient(S * 0.8, S * 0.05, 0, S * 0.8, S * 0.05, S * 0.9); g.addColorStop(0, 'rgba(255,40,40,.55)'); g.addColorStop(1, 'rgba(255,40,40,0)');
      x.fillStyle = g; x.fillRect(0, 0, S, S); speckle(x, S, 300, ['#ff6b6b'], S * 0.0015, 3);
    },
    over: (x, S) => { x.fillStyle = 'rgba(255,30,30,.07)'; x.fillRect(0, 0, S, S); } },
  { id: 'editorial', name: 'editorial', swatch: '#FBF1E6', ink: '#2A0810', attach: 'none',
    bg: (x, S) => { x.fillStyle = '#F6ECDF'; x.fillRect(0, 0, S, S); speckle(x, S, 900, ['#d9c7b0'], S * 0.0012, 5); x.strokeStyle = 'rgba(42,8,16,.25)'; x.lineWidth = S * 0.0015; x.strokeRect(S * 0.04, S * 0.04, S * 0.92, S * 0.92); } },
  { id: 'kraft', name: 'scrapbook', swatch: '#C9A77C', ink: '#2A0810', attach: 'tape-dots',
    bg: (x, S) => {
      x.fillStyle = '#CDAA7E'; x.fillRect(0, 0, S, S); speckle(x, S, 1800, ['#B48E5F', '#E2C49C', '#9C784C'], S * 0.0016, 9);
      x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = S * 0.002; for (let y = S * 0.08; y < S; y += S * 0.06) { x.beginPath(); x.moveTo(0, y); x.lineTo(S, y); x.stroke(); }
      vignette(x, S, 0.2);
    },
    over: (x, S) => { x.fillStyle = '#D91F3F'; [[0.08, 0.1, 0.03], [0.92, 0.88, 0.025], [0.9, 0.12, 0.018]].forEach(([a, b, r]) => sparkle(x, a * S, b * S, r * S)); } },
  { id: 'dreamy', name: 'dreamy', swatch: 'linear-gradient(135deg,#F9D3DC,#D5CFE2)', ink: '#5A3A6B', attach: 'none',
    bg: (x, S) => {
      const g = x.createLinearGradient(0, 0, S, S); g.addColorStop(0, '#FBD9E2'); g.addColorStop(0.55, '#EADCF0'); g.addColorStop(1, '#D3D9F2'); x.fillStyle = g; x.fillRect(0, 0, S, S);
      const r = rand(21); x.fillStyle = '#fff';
      for (let i = 0; i < 26; i++) { x.globalAlpha = 0.5 + r() * 0.5; sparkle(x, r() * S, r() * S, S * (0.006 + r() * 0.018)); }
      x.globalAlpha = 1;
    } },
  { id: 'night', name: 'midnight', swatch: '#1d1b24', ink: '#F2C14E', attach: 'none',
    bg: (x, S) => {
      x.fillStyle = '#16141d'; x.fillRect(0, 0, S, S); speckle(x, S, 220, ['#ffffff', '#F2C14E'], S * 0.0022, 13);
      const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.55); g.addColorStop(0, 'rgba(242,193,78,.18)'); g.addColorStop(1, 'rgba(242,193,78,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S);
    } },
];

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();

/** Wait for a decor bitmap (they rasterise asynchronously the first time). */
const art = (key: string, color?: string) => new Promise<HTMLCanvasElement | null>((res) => {
  let done = false; const t = setTimeout(() => { if (!done) { done = true; res(null); } }, 1500);
  const get = () => { const b = decorBitmap(key, color, get); if (b && !done) { done = true; clearTimeout(t); res(b); } };
  get();
});

export async function renderScene(print: HTMLCanvasElement, themeId: string, layout: SceneLayout, caption: string, S = 2048) {
  const theme = SCENE_THEMES.find((t) => t.id === themeId) ?? SCENE_THEMES[0];
  const c = document.createElement('canvas'); c.width = c.height = S;
  const x = c.getContext('2d')!;
  theme.bg(x, S);

  const tall = print.height >= print.width;
  const ratio = print.width / print.height;
  // slots: centre, size box, rotation
  type Slot = { cx: number; cy: number; bw: number; bh: number; r: number };
  let slots: Slot[];
  const topPad = theme.attach === 'pegs' ? 0.15 : theme.id === 'velvet' ? 0.08 : 0.1;
  if (layout === 'pair') slots = tall
    ? [{ cx: 0.36, cy: 0.53, bw: 0.36, bh: 0.78 - topPad + 0.1, r: -4 }, { cx: 0.64, cy: 0.5, bw: 0.36, bh: 0.78 - topPad + 0.1, r: 3.5 }]
    : [{ cx: 0.5, cy: 0.33, bw: 0.84, bh: 0.38, r: -2.5 }, { cx: 0.5, cy: 0.69, bw: 0.84, bh: 0.38, r: 2 }];
  else if (layout === 'caption') slots = tall ? [{ cx: 0.33, cy: 0.53, bw: 0.42, bh: 0.86 - topPad, r: -3 }] : [{ cx: 0.5, cy: 0.42, bw: 0.84, bh: 0.6, r: -2 }];
  else if (layout === 'tilt') slots = [{ cx: 0.5, cy: 0.53, bw: tall ? 0.6 : 0.82, bh: 0.84 - topPad, r: tall ? 9 : -7 }];
  else slots = [{ cx: 0.5, cy: 0.53, bw: tall ? 0.6 : 0.86, bh: 0.88 - topPad, r: theme.attach === 'pegs' || theme.id === 'velvet' ? 0 : -2.5 }];
  if (theme.attach === 'pegs') slots.forEach((s) => { s.r = s.r * 0.4; });

  // the line the pegs hang from
  if (theme.attach === 'pegs') {
    x.strokeStyle = '#E8D9C4'; x.lineWidth = S * 0.004; x.beginPath(); x.moveTo(-10, S * 0.085); x.quadraticCurveTo(S / 2, S * 0.13, S + 10, S * 0.085); x.stroke();
  }

  for (const s of slots) {
    let w = s.bw * S, h = w / ratio;
    if (h > s.bh * S) { h = s.bh * S; w = h * ratio; }
    const cx = s.cx * S, cy = s.cy * S;
    x.save(); x.translate(cx, cy); x.rotate((s.r * Math.PI) / 180);
    x.shadowColor = 'rgba(0,0,0,.38)'; x.shadowBlur = S * 0.03; x.shadowOffsetY = S * 0.014;
    x.drawImage(print, -w / 2, -h / 2, w, h); x.shadowColor = 'transparent';
    // a whisper of paper sheen
    const g = x.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); g.addColorStop(0, 'rgba(255,255,255,.07)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(-w / 2, -h / 2, w, h);

    if (theme.attach === 'tape' || theme.attach === 'tape-dots') {
      const t = await art(theme.attach === 'tape' ? 't-gingham' : 't-dots');
      if (t) { const tw = Math.min(w * 0.7, S * 0.22), th = (tw * t.height) / t.width; x.save(); x.translate(0, -h / 2); x.rotate(-0.06); x.drawImage(t, -tw / 2, -th / 2, tw, th); x.restore(); }
    } else if (theme.attach === 'pin') {
      const p = await art('t-heartpin');
      if (p) { const pw = S * 0.06; x.drawImage(p, -pw / 2, -h / 2 - pw * 0.45, pw, pw); }
    } else if (theme.attach === 'pegs') {
      for (const px of tall ? [0] : [-w * 0.3, w * 0.3]) {
        const pw = S * 0.022, ph = S * 0.085; x.fillStyle = '#C89B6A'; x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = S * 0.006;
        x.beginPath(); x.roundRect(px - pw / 2, -h / 2 - ph * 0.55, pw, ph, pw * 0.3); x.fill(); x.shadowColor = 'transparent';
        x.fillStyle = '#9E7448'; x.fillRect(px - pw / 2, -h / 2 - ph * 0.15, pw, ph * 0.08);
      }
    }
    x.restore();
  }

  // caption / date
  const cap = caption.trim();
  if (layout === 'caption') {
    x.fillStyle = theme.ink; x.textBaseline = 'alphabetic';
    if (tall) {
      x.textAlign = 'left'; const lx = S * 0.6;
      x.font = fontFor('serif', S * 0.11); x.fillText(today(), lx, S * 0.42);
      x.font = fontFor('hand', S * 0.07); wrap(x, cap || 'a night to remember', lx, S * 0.53, S * 0.35, S * 0.075);
      x.globalAlpha = 0.6; x.font = fontFor('type', S * 0.026); x.fillText('PHOTOBOOTH', lx, S * 0.82); x.globalAlpha = 1;
    } else {
      x.textAlign = 'center'; x.font = fontFor('hand', S * 0.075); x.fillText(cap || 'a night to remember', S / 2, S * 0.86);
      x.globalAlpha = 0.6; x.font = fontFor('type', S * 0.026); x.fillText(today().toUpperCase(), S / 2, S * 0.93); x.globalAlpha = 1;
    }
  } else if (cap) {
    x.fillStyle = theme.ink; x.textAlign = 'center'; x.font = fontFor('hand', S * 0.055);
    x.fillText(cap, S / 2, S * (theme.attach === 'pegs' ? 0.965 : 0.97));
  }
  theme.over?.(x, S);
  return c;
}

function wrap(x: CanvasRenderingContext2D, text: string, lx: number, y: number, maxW: number, lh: number) {
  let line = '';
  for (const word of text.split(' ')) {
    const t = line ? `${line} ${word}` : word;
    if (x.measureText(t).width > maxW && line) { x.fillText(line, lx, y); line = word; y += lh; } else line = t;
  }
  if (line) x.fillText(line, lx, y);
}
