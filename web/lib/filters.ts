export type Look = {
  saturation: number; warmR: number; warmG: number; warmB: number; contrast: number;
  blackLift: number; whiteCap: number; vignette: number; vignetteStart: number; grain: number;
};
export type StripStyle = { id: string; name: string; paper: string; ink: string; look: Look; css: string };

// Tweak the strengths here. saturation 0 = black & white; warm* values tint B&W into sepia.
// `css` is an approximate CSS filter used only for the marketing previews.
export const STYLES: StripStyle[] = [
  { id: 'golden', name: 'Golden hour', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.35) saturate(.85) contrast(1.08) brightness(1.03)',
    look: { saturation: 0.82, warmR: 14, warmG: 5, warmB: -16, contrast: 1.1, blackLift: 26, whiteCap: 247, vignette: 0.38, vignetteStart: 0.55, grain: 12 } },
  { id: 'noir', name: 'Noir', paper: '#ece9e2', ink: '#3a3835', css: 'grayscale(1) contrast(1.25)',
    look: { saturation: 0, warmR: 2, warmG: 0, warmB: -3, contrast: 1.22, blackLift: 18, whiteCap: 245, vignette: 0.48, vignetteStart: 0.5, grain: 18 } },
  { id: 'hicon', name: 'Hi-con B&W', paper: '#f4f2ec', ink: '#111111', css: 'grayscale(1) contrast(1.7) brightness(.95)',
    look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 1.6, blackLift: 6, whiteCap: 252, vignette: 0.5, vignetteStart: 0.5, grain: 22 } },
  { id: 'polaroid', name: 'Polaroid', paper: '#faf7f0', ink: '#5b5247', css: 'saturate(.9) sepia(.12) hue-rotate(-8deg) brightness(1.08) contrast(.95)',
    look: { saturation: 0.92, warmR: 6, warmG: 9, warmB: -2, contrast: 1.04, blackLift: 40, whiteCap: 238, vignette: 0.28, vignetteStart: 0.6, grain: 9 } },
  { id: 'sepia', name: 'Antique sepia', paper: '#e8d6ae', ink: '#4e3622', css: 'sepia(.9) contrast(1.1) brightness(.98)',
    look: { saturation: 0, warmR: 34, warmG: 14, warmB: -28, contrast: 1.12, blackLift: 30, whiteCap: 240, vignette: 0.45, vignetteStart: 0.5, grain: 15 } },
  { id: 'faded70s', name: "Faded '70s", paper: '#efe0cf', ink: '#7a4a3c', css: 'saturate(.6) sepia(.2) contrast(.95) brightness(1.08)',
    look: { saturation: 0.6, warmR: 18, warmG: -2, warmB: -6, contrast: 0.98, blackLift: 48, whiteCap: 236, vignette: 0.3, vignetteStart: 0.6, grain: 14 } },
];

export const STRIP = {
  shots: 4, countdownFrom: 3, betweenShotsMs: 1500,
  width: 600, height: 1800, side: 30, top: 28, bottom: 110, gap: 14,
  stampFont: '600 26px "American Typewriter", "Courier New", monospace',
};

const c255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

export function photoSize() {
  const w = STRIP.width - 2 * STRIP.side;
  const h = Math.round((STRIP.height - STRIP.top - STRIP.bottom - STRIP.gap * (STRIP.shots - 1)) / STRIP.shots);
  return { w, h };
}

export function applyVintage(src: HTMLCanvasElement, L: Look): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width; canvas.height = src.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data, cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy), range = L.whiteCap - L.blackLift;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    let r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * L.saturation; g = lum + (g - lum) * L.saturation; b = lum + (b - lum) * L.saturation;
    r += L.warmR; g += L.warmG; b += L.warmB;
    r = (r - 128) * L.contrast + 128; g = (g - 128) * L.contrast + 128; b = (b - 128) * L.contrast + 128;
    r = L.blackLift + (c255(r) / 255) * range; g = L.blackLift + (c255(g) / 255) * range; b = L.blackLift + (c255(b) / 255) * range;
    const dist = Math.hypot(x - cx, y - cy) / maxD;
    if (dist > L.vignetteStart) { const t = (dist - L.vignetteStart) / (1 - L.vignetteStart); const k = 1 - L.vignette * t * t; r *= k; g *= k; b *= k; }
    const n = (Math.random() - 0.5) * 2 * L.grain;
    d[i] = c255(r + n); d[i + 1] = c255(g + n); d[i + 2] = c255(b + n);
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function dateStamp() {
  const d = new Date();
  return `${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()} ${d.getFullYear()}`;
}

export async function renderStrip(photos: HTMLCanvasElement[], style: StripStyle): Promise<string> {
  const { w, h } = photoSize();
  const c = document.createElement('canvas');
  c.width = STRIP.width; c.height = STRIP.height;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = style.paper; ctx.fillRect(0, 0, c.width, c.height);
  photos.forEach((p, i) => ctx.drawImage(applyVintage(p, style.look), STRIP.side, STRIP.top + i * (h + STRIP.gap), w, h));
  ctx.fillStyle = style.ink; ctx.font = STRIP.stampFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.85; ctx.fillText(dateStamp(), c.width / 2, c.height - STRIP.bottom / 2 + 6); ctx.globalAlpha = 1;
  const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), 'image/png'));
  return URL.createObjectURL(blob);
}
