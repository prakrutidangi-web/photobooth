export type Look = {
  saturation: number; warmR: number; warmG: number; warmB: number; contrast: number;
  blackLift: number; whiteCap: number; vignette: number; vignetteStart: number; grain: number;
  duo?: [[number, number, number], [number, number, number]]; // map luminance between two colours
  flash?: number;    // 0-1 on-camera flash: brighter centre, falloff to the edges
  bloom?: number;    // 0-1 warm glow around highlights (film halation)
  redBoost?: number; // 0-1 extra richness in reds (lips, velvet curtains)
};
export type StripStyle = { id: string; name: string; paper: string; ink: string; look: Look; css: string };

// Tweak the strengths here. saturation 0 = black & white; warm* values tint B&W into sepia.
// `css` is an approximate CSS filter used only for the marketing previews.
export const STYLES: StripStyle[] = [
  { id: 'original', name: 'Original', paper: '#f1e4c3', ink: '#6a4a33', css: 'none',
    look: { saturation: 1, warmR: 0, warmG: 0, warmB: 0, contrast: 1, blackLift: 0, whiteCap: 255, vignette: 0, vignetteStart: 1, grain: 0, flash: 0, bloom: 0, redBoost: 0 } },
  { id: 'golden', name: 'Golden hour', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.18) saturate(1.15) contrast(1.08) brightness(1.04)',
    look: { saturation: 1.06, warmR: 12, warmG: 5, warmB: -8, contrast: 1.1, blackLift: 8, whiteCap: 250, vignette: 0.22, vignetteStart: 0.5, grain: 8, flash: 0.16, bloom: 0.28, redBoost: 0.18 } },
  { id: 'noir', name: 'Noir', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) contrast(1.3) brightness(1.04)',
    look: { saturation: 0, warmR: 4, warmG: 2, warmB: 0, contrast: 1.28, blackLift: 6, whiteCap: 250, vignette: 0.3, vignetteStart: 0.45, grain: 12, flash: 0.2, bloom: 0.3, redBoost: 0 } },
  { id: 'hicon', name: 'Hi-con B&W', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) contrast(1.7) brightness(1.02)',
    look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 1.55, blackLift: 0, whiteCap: 255, vignette: 0.35, vignetteStart: 0.45, grain: 16, flash: 0.22, bloom: 0.2, redBoost: 0 } },
  { id: 'polaroid', name: 'Polaroid', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.95) sepia(.1) contrast(1.02) brightness(1.08)',
    look: { saturation: 0.95, warmR: 8, warmG: 8, warmB: -2, contrast: 1.02, blackLift: 22, whiteCap: 244, vignette: 0.18, vignetteStart: 0.55, grain: 7, flash: 0.12, bloom: 0.25, redBoost: 0.1 } },
  { id: 'sepia', name: 'Antique sepia', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.85) contrast(1.1) brightness(1.02)',
    look: { saturation: 0, warmR: 32, warmG: 14, warmB: -24, contrast: 1.1, blackLift: 14, whiteCap: 242, vignette: 0.3, vignetteStart: 0.45, grain: 12, flash: 0.15, bloom: 0.25, redBoost: 0 } },
  { id: 'faded70s', name: 'Faded \'70s', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.8) sepia(.2) contrast(.98) brightness(1.06)',
    look: { saturation: 0.8, warmR: 16, warmG: 4, warmB: -6, contrast: 0.98, blackLift: 30, whiteCap: 240, vignette: 0.2, vignetteStart: 0.55, grain: 10, flash: 0.1, bloom: 0.2, redBoost: 0.1 } },
  { id: 'vivid', name: 'Vivid', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(1.45) contrast(1.12)',
    look: { saturation: 1.3, warmR: 4, warmG: 0, warmB: -4, contrast: 1.12, blackLift: 0, whiteCap: 255, vignette: 0.15, vignetteStart: 0.55, grain: 4, flash: 0.15, bloom: 0.2, redBoost: 0.3 } },
  { id: 'bright', name: 'Bright', paper: '#f1e4c3', ink: '#6a4a33', css: 'brightness(1.16) contrast(1.02) saturate(1.05)',
    look: { saturation: 1.05, warmR: 18, warmG: 16, warmB: 14, contrast: 1.0, blackLift: 6, whiteCap: 255, vignette: 0.05, vignetteStart: 0.7, grain: 3, flash: 0.25, bloom: 0.3, redBoost: 0.1 } },
  { id: 'warm', name: 'Warm', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.25) saturate(1.25) brightness(1.03)',
    look: { saturation: 1.08, warmR: 20, warmG: 8, warmB: -14, contrast: 1.06, blackLift: 6, whiteCap: 252, vignette: 0.15, vignetteStart: 0.55, grain: 5, flash: 0.15, bloom: 0.25, redBoost: 0.2 } },
  { id: 'cool', name: 'Cool', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(1.05) hue-rotate(10deg) contrast(1.06)',
    look: { saturation: 1.0, warmR: -10, warmG: 2, warmB: 14, contrast: 1.08, blackLift: 4, whiteCap: 252, vignette: 0.15, vignetteStart: 0.55, grain: 5, flash: 0.15, bloom: 0.2, redBoost: 0.05 } },
  { id: 'softskin', name: 'Soft skin', paper: '#f1e4c3', ink: '#6a4a33', css: 'brightness(1.08) contrast(.94) saturate(1.02)',
    look: { saturation: 0.95, warmR: 14, warmG: 9, warmB: 6, contrast: 0.94, blackLift: 14, whiteCap: 250, vignette: 0.05, vignetteStart: 0.7, grain: 3, flash: 0.2, bloom: 0.4, redBoost: 0.1 } },
  { id: 'rose', name: 'Rosé', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.15) hue-rotate(-20deg) saturate(1.25) brightness(1.05)',
    look: { saturation: 1.05, warmR: 18, warmG: -2, warmB: 8, contrast: 1.02, blackLift: 14, whiteCap: 250, vignette: 0.12, vignetteStart: 0.6, grain: 4, flash: 0.15, bloom: 0.35, redBoost: 0.25 } },
  { id: 'pastel', name: 'Pastel', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.75) brightness(1.14) contrast(.9)',
    look: { saturation: 0.75, warmR: 12, warmG: 10, warmB: 14, contrast: 0.9, blackLift: 36, whiteCap: 246, vignette: 0.05, vignetteStart: 0.7, grain: 3, flash: 0.15, bloom: 0.35, redBoost: 0.05 } },
  { id: 'mono', name: 'Mono', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) contrast(1.1)',
    look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 1.12, blackLift: 4, whiteCap: 252, vignette: 0.22, vignetteStart: 0.5, grain: 6, flash: 0.18, bloom: 0.25, redBoost: 0 } },
  { id: 'darkroom', name: 'Dark room', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) sepia(.6) hue-rotate(-30deg) saturate(2.4) contrast(1.3)',
    look: { saturation: 0, warmR: 26, warmG: -4, warmB: -10, contrast: 1.3, blackLift: 4, whiteCap: 250, vignette: 0.4, vignetteStart: 0.45, grain: 16, flash: 0.15, bloom: 0.2, redBoost: 0 } },
  { id: 'softmono', name: 'Soft mono', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) contrast(.9) brightness(1.1)',
    look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 0.9, blackLift: 30, whiteCap: 240, vignette: 0.1, vignetteStart: 0.6, grain: 8, flash: 0.15, bloom: 0.35, redBoost: 0 } },
  { id: 'film', name: 'Film', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.18) contrast(1.08) saturate(1.05)',
    look: { saturation: 0.95, warmR: 10, warmG: 4, warmB: -6, contrast: 1.08, blackLift: 12, whiteCap: 248, vignette: 0.22, vignetteStart: 0.5, grain: 12, flash: 0.15, bloom: 0.3, redBoost: 0.15 } },
  { id: 'flash', name: 'Flash', paper: '#f1e4c3', ink: '#6a4a33', css: 'brightness(1.15) contrast(1.28)',
    look: { saturation: 1.0, warmR: 14, warmG: 12, warmB: 10, contrast: 1.25, blackLift: 0, whiteCap: 255, vignette: 0.3, vignetteStart: 0.4, grain: 6, flash: 0.35, bloom: 0.25, redBoost: 0.15 } },
  { id: 'sunkissed', name: 'Sun kissed', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.3) saturate(1.35) brightness(1.07)',
    look: { saturation: 1.12, warmR: 26, warmG: 12, warmB: -8, contrast: 1.05, blackLift: 8, whiteCap: 252, vignette: 0.15, vignetteStart: 0.55, grain: 6, flash: 0.18, bloom: 0.35, redBoost: 0.2 } },
  { id: 'autumn', name: 'Autumn', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.45) saturate(1.3) contrast(1.08)',
    look: { saturation: 1.0, warmR: 24, warmG: 6, warmB: -22, contrast: 1.1, blackLift: 12, whiteCap: 248, vignette: 0.28, vignetteStart: 0.5, grain: 8, flash: 0.12, bloom: 0.2, redBoost: 0.15 } },
  { id: 'lomo', name: 'Lomo', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(1.45) contrast(1.28)',
    look: { saturation: 1.3, warmR: 6, warmG: 0, warmB: -4, contrast: 1.28, blackLift: 0, whiteCap: 255, vignette: 0.55, vignetteStart: 0.35, grain: 10, flash: 0.22, bloom: 0.15, redBoost: 0.3 } },
  { id: 'portra', name: 'Portra 400', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.12) saturate(1.02) brightness(1.05)',
    look: { saturation: 0.92, warmR: 12, warmG: 6, warmB: -2, contrast: 1.0, blackLift: 14, whiteCap: 248, vignette: 0.15, vignetteStart: 0.6, grain: 7, flash: 0.14, bloom: 0.3, redBoost: 0.1 } },
  { id: 'velvia', name: 'Velvia', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(1.65) contrast(1.15)',
    look: { saturation: 1.45, warmR: 4, warmG: 0, warmB: -4, contrast: 1.18, blackLift: 0, whiteCap: 255, vignette: 0.2, vignetteStart: 0.55, grain: 5, flash: 0.15, bloom: 0.2, redBoost: 0.35 } },
  { id: 'kodachrome', name: 'Kodachrome', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.25) saturate(1.45) contrast(1.15)',
    look: { saturation: 1.18, warmR: 14, warmG: 2, warmB: -12, contrast: 1.18, blackLift: 6, whiteCap: 252, vignette: 0.25, vignetteStart: 0.5, grain: 8, flash: 0.15, bloom: 0.25, redBoost: 0.3 } },
  { id: 'bleach', name: 'Bleach bypass', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.5) contrast(1.35)',
    look: { saturation: 0.45, warmR: 0, warmG: 0, warmB: 0, contrast: 1.35, blackLift: 8, whiteCap: 250, vignette: 0.3, vignetteStart: 0.5, grain: 14, flash: 0.18, bloom: 0.2, redBoost: 0 } },
  { id: 'cross', name: 'Cross process', paper: '#f1e4c3', ink: '#6a4a33', css: 'hue-rotate(-15deg) saturate(1.35) contrast(1.2)',
    look: { saturation: 1.25, warmR: 12, warmG: -4, warmB: 16, contrast: 1.22, blackLift: 4, whiteCap: 252, vignette: 0.2, vignetteStart: 0.55, grain: 8, flash: 0.15, bloom: 0.2, redBoost: 0.2 } },
  { id: 'retro', name: 'Retro', paper: '#f1e4c3', ink: '#6a4a33', css: 'sepia(.35) saturate(.95) contrast(1.02)',
    look: { saturation: 0.85, warmR: 16, warmG: 10, warmB: -6, contrast: 1.02, blackLift: 22, whiteCap: 246, vignette: 0.3, vignetteStart: 0.5, grain: 12, flash: 0.12, bloom: 0.25, redBoost: 0.1 } },
  { id: 'y2k', name: 'Y2K chrome', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.85) hue-rotate(8deg) contrast(1.28) brightness(1.1)',
    look: { saturation: 0.85, warmR: -8, warmG: 2, warmB: 12, contrast: 1.28, blackLift: 6, whiteCap: 255, vignette: 0.1, vignetteStart: 0.6, grain: 5, flash: 0.3, bloom: 0.35, redBoost: 0 } },
  { id: 'ccd', name: 'CCD 200', paper: '#f1e4c3', ink: '#6a4a33', css: 'hue-rotate(5deg) contrast(1.12) brightness(1.06)',
    look: { saturation: 0.95, warmR: -2, warmG: 8, warmB: 10, contrast: 1.12, blackLift: 8, whiteCap: 252, vignette: 0.2, vignetteStart: 0.55, grain: 10, flash: 0.3, bloom: 0.3, redBoost: 0.05 } },
  { id: 'vapor', name: 'Vapor', paper: '#f1e4c3', ink: '#6a4a33', css: 'hue-rotate(-35deg) saturate(1.4) brightness(1.05)',
    look: { saturation: 1.2, warmR: 24, warmG: -6, warmB: 28, contrast: 1.08, blackLift: 14, whiteCap: 250, vignette: 0.2, vignetteStart: 0.55, grain: 6, flash: 0.15, bloom: 0.35, redBoost: 0.15 } },
  { id: 'vhs', name: 'VHS', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.9) contrast(1.05) blur(.4px)',
    look: { saturation: 0.85, warmR: 8, warmG: 0, warmB: 12, contrast: 1.05, blackLift: 22, whiteCap: 245, vignette: 0.3, vignetteStart: 0.5, grain: 26, flash: 0.12, bloom: 0.25, redBoost: 0.1 } },
  { id: 'dreamy', name: 'Dreamy glow', paper: '#f1e4c3', ink: '#6a4a33', css: 'brightness(1.12) contrast(.86) saturate(1.1) blur(.5px)',
    look: { saturation: 1.0, warmR: 10, warmG: 6, warmB: 10, contrast: 0.85, blackLift: 24, whiteCap: 250, vignette: 0.05, vignetteStart: 0.7, grain: 4, flash: 0.18, bloom: 0.6, redBoost: 0.1 } },
  { id: 'duopink', name: 'Duotone pink', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) sepia(1) hue-rotate(290deg) saturate(2.5)',
    look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 1.05, blackLift: 0, whiteCap: 255, vignette: 0.25, vignetteStart: 0.5, grain: 8, flash: 0.15, bloom: 0.3, redBoost: 0, duo: [[50, 10, 40], [255, 170, 200]] } },
  { id: 'duoblue', name: 'Duotone blue', paper: '#f1e4c3', ink: '#6a4a33', css: 'grayscale(1) sepia(1) hue-rotate(170deg) saturate(3)',
    look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 1.05, blackLift: 0, whiteCap: 255, vignette: 0.25, vignetteStart: 0.5, grain: 8, flash: 0.15, bloom: 0.3, redBoost: 0, duo: [[10, 20, 60], [180, 220, 255]] } },
  { id: 'cinema', name: 'Cinematic', paper: '#f1e4c3', ink: '#6a4a33', css: 'saturate(.95) contrast(1.2) brightness(.98)',
    look: { saturation: 0.9, warmR: -4, warmG: 2, warmB: 8, contrast: 1.22, blackLift: 6, whiteCap: 248, vignette: 0.4, vignetteStart: 0.45, grain: 8, flash: 0.12, bloom: 0.2, redBoost: 0.15 } },
];

const c255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

export function applyVintage(src: HTMLCanvasElement, L: Look): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width; canvas.height = src.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data, cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy), range = L.whiteCap - L.blackLift;
  const flash = L.flash ?? 0, red = L.redBoost ?? 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    let r = d[i], g = d[i + 1], b = d[i + 2];
    if (red) { const k = Math.max(0, r - Math.max(g, b)) / 255; r += k * red * 90; g -= k * red * 25; b -= k * red * 25; }
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * L.saturation; g = lum + (g - lum) * L.saturation; b = lum + (b - lum) * L.saturation;
    if (L.duo) { const t = Math.min(1, Math.max(0, lum / 255)), [a, c] = L.duo; r = a[0] + (c[0] - a[0]) * t; g = a[1] + (c[1] - a[1]) * t; b = a[2] + (c[2] - a[2]) * t; }
    r += L.warmR; g += L.warmG; b += L.warmB;
    const dist = Math.hypot(x - cx, y - cy) / maxD;
    if (flash) { const f = 1 + flash * (0.45 - dist); r *= f; g *= f; b *= f; }
    // gentle S-curve contrast keeps skin smooth and blacks clean
    r = curve(r, L.contrast); g = curve(g, L.contrast); b = curve(b, L.contrast);
    r = L.blackLift + (c255(r) / 255) * range; g = L.blackLift + (c255(g) / 255) * range; b = L.blackLift + (c255(b) / 255) * range;
    if (dist > L.vignetteStart) { const t = (dist - L.vignetteStart) / (1 - L.vignetteStart); const k = 1 - L.vignette * t * t; r *= k; g *= k; b *= k; }
    const n = (Math.random() - 0.5) * 2 * L.grain;
    d[i] = c255(r + n); d[i + 1] = c255(g + n); d[i + 2] = c255(b + n);
  }
  ctx.putImageData(img, 0, 0);
  // bloom / halation: a blurred, warm copy of the highlights screened back on top
  if (L.bloom && 'filter' in ctx) {
    const glow = document.createElement('canvas'); glow.width = w; glow.height = h;
    const gctx = glow.getContext('2d')!;
    gctx.filter = `brightness(.85) contrast(2.4) sepia(.5) saturate(1.6) blur(${Math.max(4, Math.round(w * 0.018))}px)`;
    gctx.drawImage(canvas, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = L.bloom * 0.55; ctx.drawImage(glow, 0, 0); ctx.restore();
  }
  return canvas;
}

/** Smooth contrast around mid-grey: blends linear contrast with a smoothstep S-curve. */
function curve(v: number, k: number) {
  const t = Math.min(1, Math.max(0, v / 255)), s = t * t * (3 - 2 * t);
  const lin = (t - 0.5) * k + 0.5, sc = t + (s - t) * (k - 1) * 2;
  return (k >= 1 ? sc * 0.6 + lin * 0.4 : lin) * 255;
}

