/**
 * On-device face tracking for the beauty touch-ups (MediaPipe Face Landmarker, 478 points/face).
 * Everything runs in the browser from files in /public/mediapipe: no frame ever leaves the device.
 *
 * Per frame it paints two small mask textures in video coordinates:
 *  - eyes:  rgb = concealer colour (that person's own cheek tone), a = soft under-eye area
 *  - lips:  rgb = a natural lip shade (from skin tone + the colour of their top), a = lip area (teeth excluded)
 * The WebGL beauty shader (lib/beauty.ts) blends with these.
 */
import type { FaceLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

type Mode = 'VIDEO' | 'IMAGE';
const cache: Partial<Record<Mode, Promise<FaceLandmarker | null>>> = {};

/** MediaPipe's WASM prints routine "INFO:"/"W0000" startup lines through console.error; keep real errors. */
let quieted = false;
function quietMediaPipeLogs() {
  if (quieted) return; quieted = true;
  for (const k of ['error', 'warn', 'info', 'log'] as const) {
    const orig = console[k].bind(console);
    console[k] = (...a: unknown[]) => {
      if (typeof a[0] === 'string' && /^(INFO:|W\d{4} |I\d{4} )|XNNPACK|TensorFlow Lite|gl_context|OpenGL error checking/.test(a[0])) return;
      orig(...a);
    };
  }
}

export function loadLandmarker(mode: Mode): Promise<FaceLandmarker | null> {
  quietMediaPipeLogs();
  cache[mode] ??= (async () => {
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const files = await FilesetResolver.forVisionTasks('/mediapipe');
      const opts = (delegate: 'GPU' | 'CPU') => ({ baseOptions: { modelAssetPath: '/mediapipe/face_landmarker.task', delegate }, runningMode: mode, numFaces: 4 });
      try { return await FaceLandmarker.createFromOptions(files, opts('GPU')); }
      catch { return await FaceLandmarker.createFromOptions(files, opts('CPU')); }
    } catch (e) { console.warn('Face touch-ups unavailable:', e); return null; }
  })();
  return cache[mode]!;
}

/* ---------- landmark indices (MediaPipe face mesh) ---------- */
const LIPS_OUT = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const LIPS_IN = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
const LID_A = [33, 7, 163, 144, 145, 153, 154, 155, 133]; // lower lid, corner to corner
const LID_B = [263, 249, 390, 373, 374, 380, 381, 382, 362];
const CHEEK = [118, 347, 50, 280, 101, 330];

/* ---------- colour helpers ---------- */
type RGB = [number, number, number];
function toHsl([r, g, b]: RGB): RGB {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function toRgb([h, s, l]: RGB): RGB {
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
/** Mix two hues the short way round. */
const hueMix = (a: number, b: number, t: number) => { const d = ((b - a + 540) % 360) - 180; return (a + d * t + 360) % 360; };

/**
 * A natural lip shade: the person's skin tone, deepened and pulled toward rose,
 * then nudged to sit well with what they're wearing. Never a costume colour.
 */
export function lipShade(skin: RGB, top: RGB | null): RGB {
  const [, ss, sl] = toHsl(skin);
  let h = 356, s = clamp(ss + 0.22, 0.32, 0.62), l = clamp(sl - 0.13, 0.22, 0.6); // "your lips but better"
  if (top) {
    const [th, ts, tl] = toHsl(top);
    if (ts > 0.22 && tl > 0.12 && tl < 0.9) {
      if (th < 45 || th >= 330) { h = hueMix(h, 6, 0.8); s += 0.06; }        // reds, oranges, corals: warm red-coral
      else if (th < 75) { h = hueMix(h, 12, 0.7); }                          // yellows: peachy nude
      else if (th < 170) { h = 352; s -= 0.04; }                             // greens: classic rose
      else if (th < 260) { h = hueMix(h, 338, 0.6); s -= 0.02; }             // blues: cool pink
      else { h = 334; l -= 0.03; }                                           // purples/pinks: berry mauve
    } else if (tl < 0.2) { l -= 0.04; s += 0.04; }                           // black: a touch deeper
    else if (tl > 0.8) { l += 0.03; s -= 0.04; }                             // white/cream: soft pink nude
  }
  return toRgb([h, clamp(s, 0.25, 0.68), clamp(l, 0.2, 0.62)]);
}

/** Builds the eye/lip mask canvases from landmarks. Colours are smoothed over time so nothing flickers. */
export class FaceMasks {
  readonly eyes = document.createElement('canvas');
  readonly lips = document.createElement('canvas');
  private sample = document.createElement('canvas');
  private sctx = this.sample.getContext('2d', { willReadFrequently: true })!;
  private colors: { cheek: RGB; lip: RGB }[] = [];
  faces = 0;

  constructor() { this.eyes.width = this.lips.width = 1; this.eyes.height = this.lips.height = 1; }

  update(faces: NormalizedLandmark[][], src: HTMLVideoElement | HTMLCanvasElement, smooth = true) {
    const W = src instanceof HTMLVideoElement ? src.videoWidth : src.width, H = src instanceof HTMLVideoElement ? src.videoHeight : src.height;
    if (!W || !H) return;
    const mw = 384, mh = Math.round((mw * H) / W);
    for (const c of [this.eyes, this.lips]) if (c.width !== mw || c.height !== mh) { c.width = mw; c.height = mh; }
    const ex = this.eyes.getContext('2d')!, lx = this.lips.getContext('2d')!;
    ex.clearRect(0, 0, mw, mh); lx.clearRect(0, 0, mw, mh);
    this.faces = faces.length;
    if (!faces.length) return;

    // low-res copy of the frame for colour sampling
    const sw = 160, sh = Math.round((sw * H) / W);
    this.sample.width = sw; this.sample.height = sh;
    this.sctx.drawImage(src, 0, 0, sw, sh);
    const px = this.sctx.getImageData(0, 0, sw, sh).data;
    const at = (x: number, y: number): RGB | null => {
      const ix = Math.round(x * (sw - 1)), iy = Math.round(y * (sh - 1));
      if (ix < 0 || iy < 0 || ix >= sw || iy >= sh) return null;
      const i = (iy * sw + ix) * 4; return [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255];
    };
    const avg = (pts: (RGB | null)[]): RGB | null => {
      const ok = pts.filter((p): p is RGB => !!p); if (!ok.length) return null;
      return [0, 1, 2].map((k) => ok.reduce((a, p) => a + p[k], 0) / ok.length) as RGB;
    };

    faces.forEach((lm, fi) => {
      const P = (i: number) => ({ x: lm[i].x * mw, y: lm[i].y * mh });
      const top = P(10), chin = P(152);
      const fh = Math.hypot(chin.x - top.x, chin.y - top.y) || 1;
      const down = { x: (chin.x - top.x) / fh, y: (chin.y - top.y) / fh };

      /* colours */
      const cheek = avg(CHEEK.map((i) => at(lm[i].x, lm[i].y))) ?? [0.8, 0.62, 0.52];
      const tx = lm[152].x + (lm[152].x - lm[10].x) * 0.55, ty = lm[152].y + (lm[152].y - lm[10].y) * 0.55;
      const shirt = ty < 0.98 ? avg([-0.04, 0, 0.04].flatMap((dx) => [0, 0.03].map((dy) => at(tx + dx, ty + dy)))) : null;
      const lip = lipShade(cheek, shirt);
      const prev = this.colors[fi];
      const k = smooth && prev ? 0.15 : 1;
      const mix = (a: RGB, b: RGB) => a.map((v, j) => v + (b[j] - v) * k) as RGB;
      const col = (this.colors[fi] = prev ? { cheek: mix(prev.cheek, cheek), lip: mix(prev.lip, lip) } : { cheek, lip });
      const css = (c: RGB) => `rgb(${c.map((v) => Math.round(v * 255)).join(',')})`;

      /* under-eye concealer: a soft crescent below each lower lid */
      ex.fillStyle = css(col.cheek);
      for (const lid of [LID_A, LID_B]) {
        const pts = lid.map(P);
        const w = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
        ex.filter = `blur(${Math.max(1, w * 0.14)}px)`;
        ex.beginPath();
        pts.forEach((p, i) => { const o = w * 0.1; (i ? ex.lineTo : ex.moveTo).call(ex, p.x + down.x * o, p.y + down.y * o); });
        for (let i = pts.length - 1; i >= 0; i--) {
          const t = i / (pts.length - 1), o = w * (0.1 + 0.42 * (0.3 + 0.7 * Math.sin(Math.PI * t)));
          ex.lineTo(pts[i].x + down.x * o, pts[i].y + down.y * o);
        }
        ex.closePath(); ex.globalAlpha = 0.9; ex.fill();
      }

      /* lips, minus the open mouth */
      const fw = Math.hypot(P(234).x - P(454).x, P(234).y - P(454).y);
      lx.filter = `blur(${Math.max(0.6, fw * 0.012)}px)`;
      lx.globalCompositeOperation = 'source-over'; lx.globalAlpha = 1; lx.fillStyle = css(col.lip);
      lx.beginPath(); LIPS_OUT.map(P).forEach((p, i) => (i ? lx.lineTo(p.x, p.y) : lx.moveTo(p.x, p.y))); lx.closePath(); lx.fill();
      lx.globalCompositeOperation = 'destination-out';
      lx.beginPath(); LIPS_IN.map(P).forEach((p, i) => (i ? lx.lineTo(p.x, p.y) : lx.moveTo(p.x, p.y))); lx.closePath(); lx.fill();
      lx.globalCompositeOperation = 'source-over';
    });
    ex.filter = lx.filter = 'none'; ex.globalAlpha = 1;
  }
}
