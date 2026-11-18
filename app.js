'use strict';

/* ---------- Tweak me ---------- */
const CONFIG = {
  shots: 4,
  countdownFrom: 3,
  betweenShotsMs: 1500,

  strip: {
    width: 600, height: 1800,
    side: 30,          // left/right border
    top: 28,           // top border
    bottom: 110,       // thicker bottom margin (holds the date stamp)
    gap: 14,           // gap between photos
    stampFont: '600 26px "American Typewriter", "Courier New", monospace',
  },

  // Each style = a full "look" + paper/ink colours. Add, remove or tweak freely.
  // saturation 0 = black & white; warm* values also tint B&W into sepia.
  styles: [
    { id: 'golden', name: 'Golden hour', paper: '#f1e4c3', ink: '#6a4a33',
      look: { saturation: 0.82, warmR: 14, warmG: 5, warmB: -16, contrast: 1.10,
              blackLift: 26, whiteCap: 247, vignette: 0.38, vignetteStart: 0.55, grain: 12 } },
    { id: 'noir', name: 'Noir', paper: '#ece9e2', ink: '#3a3835',
      look: { saturation: 0, warmR: 2, warmG: 0, warmB: -3, contrast: 1.22,
              blackLift: 18, whiteCap: 245, vignette: 0.48, vignetteStart: 0.5, grain: 18 } },
    { id: 'hicon', name: 'Hi-con B&W', paper: '#f4f2ec', ink: '#111111',
      look: { saturation: 0, warmR: 0, warmG: 0, warmB: 0, contrast: 1.6,
              blackLift: 6, whiteCap: 252, vignette: 0.5, vignetteStart: 0.5, grain: 22 } },
    { id: 'polaroid', name: 'Polaroid', paper: '#faf7f0', ink: '#5b5247',
      look: { saturation: 0.92, warmR: 6, warmG: 9, warmB: -2, contrast: 1.04,
              blackLift: 40, whiteCap: 238, vignette: 0.28, vignetteStart: 0.6, grain: 9 } },
    { id: 'sepia', name: 'Antique sepia', paper: '#e8d6ae', ink: '#4e3622',
      look: { saturation: 0, warmR: 34, warmG: 14, warmB: -28, contrast: 1.12,
              blackLift: 30, whiteCap: 240, vignette: 0.45, vignetteStart: 0.5, grain: 15 } },
    { id: 'faded70s', name: "Faded '70s", paper: '#efe0cf', ink: '#7a4a3c',
      look: { saturation: 0.6, warmR: 18, warmG: -2, warmB: -6, contrast: 0.98,
              blackLift: 48, whiteCap: 236, vignette: 0.3, vignetteStart: 0.6, grain: 14 } },
  ],
};

/* ---------- Elements ---------- */
const $ = (id) => document.getElementById(id);
const screens = { start: $('screen-start'), live: $('screen-live'), result: $('screen-result') };
const video = $('video'), flashEl = $('flash'), countdownEl = $('countdown');
const dotsEl = $('dots'), statusEl = $('status'), errorEl = $('error');
const btnTake = $('btn-take'), stripImg = $('strip'), pickerEl = $('picker');

let stream = null;
let busy = false;
let stripBlobUrl = null;
let state = 'start';

function show(name) {
  state = name;
  for (const [k, el] of Object.entries(screens)) el.hidden = k !== name;
}

/* ---------- Camera ---------- */
function explain(err) {
  const where = 'Open System Settings > Privacy & Security > Camera, switch on your browser (Chrome or Safari), then reload this page.';
  switch (err && err.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return ['Camera access was blocked.', where + ' Also check the camera icon in the address bar.'];
    case 'NotFoundError':
    case 'OverconstrainedError':
      return ['No camera found.', 'Make sure a camera is connected and not disabled, then try again.'];
    case 'NotReadableError':
      return ['The camera is busy.', 'Another app (Zoom, FaceTime, Photo Booth...) may be using it. Close it and try again.'];
    default:
      return ['Could not start the camera.', (window.isSecureContext ? '' : 'This page needs a secure context: open it at http://localhost:8000. ') + (err && err.message ? err.message : '')];
  }
}

function showError(err) {
  const [title, body] = explain(err);
  errorEl.replaceChildren();
  const s = document.createElement('strong'); s.textContent = title;
  errorEl.append(s, body);
  errorEl.hidden = false;
}

async function startCamera() {
  errorEl.hidden = true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError({ name: 'SecurityError' });
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    resetLive();
    show('live');
    btnTake.focus();
  } catch (err) {
    showError(err);
  }
}

/* ---------- Capture flow ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildDots() {
  dotsEl.replaceChildren();
  for (let i = 0; i < CONFIG.shots; i++) dotsEl.append(document.createElement('li'));
}
function setDots(current) { // current = index being taken, or -1
  [...dotsEl.children].forEach((li, i) => {
    li.className = i < current ? 'done' : i === current ? 'now' : '';
  });
}
function resetLive() {
  buildDots();
  statusEl.textContent = "Press Space or the button when you're ready.";
  countdownEl.textContent = '';
  btnTake.disabled = false;
}

async function runCountdown() {
  for (let n = CONFIG.countdownFrom; n >= 1; n--) {
    countdownEl.classList.remove('tick');
    void countdownEl.offsetWidth; // restart animation
    countdownEl.innerHTML = '';
    const span = document.createElement('span'); span.textContent = n;
    countdownEl.append(span);
    countdownEl.classList.add('tick');
    await sleep(1000);
  }
  countdownEl.textContent = '';
}

function flash() {
  flashEl.classList.remove('go');
  void flashEl.offsetWidth;
  flashEl.classList.add('go');
}

// Capture the centre 4:3 of the video into a canvas. Not stretched, NOT mirrored.
function grabFrame() {
  const { width: W, height: H } = stripLayout().photo;
  const vw = video.videoWidth, vh = video.videoHeight;
  const target = W / H;
  let sw = vw, sh = vw / target;
  if (sh > vh) { sh = vh; sw = vh * target; }
  const sx = (vw - sw) / 2, sy = (vh - sh) / 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  c.getContext('2d').drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
  return c;
}

async function takePhotos() {
  if (busy) return;
  busy = true;
  btnTake.disabled = true;
  buildDots();
  const photos = [];
  try {
    for (let i = 0; i < CONFIG.shots; i++) {
      setDots(i);
      statusEl.textContent = `Photo ${i + 1} of ${CONFIG.shots}`;
      await runCountdown();
      flash();
      photos.push(grabFrame());
      setDots(i + 1);
      if (i < CONFIG.shots - 1) {
        statusEl.textContent = 'Nice! Get ready for the next one...';
        await sleep(CONFIG.betweenShotsMs);
      }
    }
    await sleep(350);
    statusEl.textContent = 'Developing your strips...';
    await renderAll(photos);
    show('result');
    $('btn-download').focus();
  } finally {
    busy = false;
    btnTake.disabled = false;
  }
}

/* ---------- Vintage filter ---------- */
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

function applyVintage(src, L) {
  const canvas = document.createElement('canvas');
  canvas.width = src.width; canvas.height = src.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(src, 0, 0);
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy);
  const range = L.whiteCap - L.blackLift;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      let r = d[i], g = d[i + 1], b = d[i + 2];

      // desaturate
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * L.saturation;
      g = lum + (g - lum) * L.saturation;
      b = lum + (b - lum) * L.saturation;

      // warm tint
      r += L.warmR; g += L.warmG; b += L.warmB;

      // contrast around mid-grey
      r = (r - 128) * L.contrast + 128;
      g = (g - 128) * L.contrast + 128;
      b = (b - 128) * L.contrast + 128;

      // faded film: squeeze 0-255 into blackLift..whiteCap
      r = L.blackLift + (clamp255(r) / 255) * range;
      g = L.blackLift + (clamp255(g) / 255) * range;
      b = L.blackLift + (clamp255(b) / 255) * range;

      // vignette (smooth falloff)
      const dist = Math.hypot(x - cx, y - cy) / maxD;
      if (dist > L.vignetteStart) {
        const t = (dist - L.vignetteStart) / (1 - L.vignetteStart);
        const k = 1 - L.vignette * t * t;
        r *= k; g *= k; b *= k;
      }

      // grain (same value on all channels = monochrome grain)
      const n = (Math.random() - 0.5) * 2 * L.grain;
      d[i] = clamp255(r + n);
      d[i + 1] = clamp255(g + n);
      d[i + 2] = clamp255(b + n);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ---------- Strip rendering (offscreen canvas) ---------- */
function stripLayout() {
  const S = CONFIG.strip;
  const width = S.width - 2 * S.side;
  const height = Math.round(
    (S.height - S.top - S.bottom - S.gap * (CONFIG.shots - 1)) / CONFIG.shots
  );
  return { photo: { width, height } };
}

function dateStamp() {
  const d = new Date();
  const m = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return `${m} ${d.getDate()} ${d.getFullYear()}`;
}

async function renderStrip(photos, style) {
  const S = CONFIG.strip;
  const { photo } = stripLayout();
  const canvas = new OffscreenCanvasOrElement(S.width, S.height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = style.paper;
  ctx.fillRect(0, 0, S.width, S.height);

  photos.forEach((p, i) => {
    ctx.drawImage(applyVintage(p, style.look), S.side, S.top + i * (photo.height + S.gap));
  });

  // date stamp, centred in the bottom margin
  ctx.fillStyle = style.ink;
  ctx.font = S.stampFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.85;
  ctx.fillText(dateStamp(), S.width / 2, S.height - S.bottom / 2 + 6);
  ctx.globalAlpha = 1;

  return URL.createObjectURL(await canvasToBlob(canvas));
}

// Render every style from the same raw photos, then show the picker.
let variants = [], current = 0;
async function renderAll(photos) {
  variants.forEach((v) => URL.revokeObjectURL(v.url));
  variants = [];
  for (const style of CONFIG.styles) {
    variants.push({ style, url: await renderStrip(photos, style) });
    await sleep(0); // keep UI responsive
  }
  buildPicker();
  select(0);
}

function buildPicker() {
  pickerEl.replaceChildren();
  variants.forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'thumb';
    b.setAttribute('aria-label', v.style.name);
    const img = document.createElement('img'); img.src = v.url; img.alt = '';
    const l = document.createElement('span'); l.textContent = v.style.name;
    b.append(img, l);
    b.addEventListener('click', () => select(i));
    pickerEl.append(b);
  });
}

function select(i) {
  current = i;
  stripBlobUrl = variants[i].url;
  stripImg.src = stripBlobUrl;
  stripImg.alt = `Your photo strip, ${variants[i].style.name} style`;
  [...pickerEl.children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
}

// Plain offscreen <canvas> (never attached to the DOM) for max compatibility.
function OffscreenCanvasOrElement(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
const canvasToBlob = (c) => new Promise((res) => c.toBlob(res, 'image/png'));

/* ---------- Result actions ---------- */
function download() {
  const a = document.createElement('a');
  a.href = stripBlobUrl;
  a.download = `photobooth-${variants[current].style.id}-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.append(a); a.click(); a.remove();
}

function backToLive() {
  resetLive();
  show('live');
  btnTake.focus();
}

/* ---------- Wiring ---------- */
$('btn-start').addEventListener('click', startCamera);
btnTake.addEventListener('click', takePhotos);
$('btn-download').addEventListener('click', download);
$('btn-retake').addEventListener('click', () => { backToLive(); takePhotos(); }); // straight into a new countdown
$('btn-new').addEventListener('click', backToLive);                              // back to live preview, wait for you

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return;
  if (state === 'live' && !busy && !(e.target instanceof HTMLButtonElement)) {
    e.preventDefault();
    takePhotos();
  }
});

window.addEventListener('pagehide', () => stream && stream.getTracks().forEach((t) => t.stop()));
buildDots();
