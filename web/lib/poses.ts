// Original pose guide: a simple figure + emoji + caption. Arm points are relative to the shoulders.
export type Pose = { id: string; name: string; emoji: string; hint: string; l: [number, number][]; r: [number, number][]; tilt?: number; group?: boolean /* show the squad version */ };
const D: [number, number][] = [[-0.3, -0.25], [-0.28, 0.1]], DR: [number, number][] = [[0.3, -0.25], [0.28, 0.1]];
export const POSES: Pose[] = [
  { id: 'fingerheart', name: 'finger heart', emoji: '🫰', hint: 'cross thumb and index finger near your cheek', l: D, r: [[0.4, -0.4], [0.18, -0.75]] },
  { id: 'peaceeye', name: 'peace over one eye', emoji: '✌️', hint: 'peace sign framing one eye, head tilted', l: D, r: [[0.42, -0.5], [0.12, -0.88]], tilt: -0.1 },
  { id: 'squish', name: 'cheek squish', emoji: '🥹', hint: 'both palms squishing your cheeks, tiny pout', l: [[-0.38, -0.45], [-0.22, -0.82]], r: [[0.38, -0.45], [0.22, -0.82]] },
  { id: 'unbothered', name: 'unbothered', emoji: '😐', hint: 'chin on both fists, flat stare, zero smile', l: [[-0.35, -0.3], [-0.08, -0.65]], r: [[0.35, -0.3], [0.08, -0.65]] },
  { id: 'sideeye', name: 'the side-eye', emoji: '👀', hint: 'arms crossed, eyes slide sideways, lips pressed', l: [[-0.15, -0.15], [0.22, -0.2]], r: [[0.15, -0.1], [-0.22, -0.25]], tilt: 0.12 },
  { id: 'shades', name: 'shades down', emoji: '🕶️', hint: 'pull sunglasses down your nose, eyebrow up', l: [[-0.35, -0.5], [-0.12, -0.85]], r: [[0.35, -0.5], [0.12, -0.85]], tilt: -0.08 },
  { id: 'caught', name: 'caught laughing', emoji: '🤭', hint: 'hand over your mouth mid-laugh, eyes squeezed', l: D, r: [[0.32, -0.4], [0.06, -0.72]], tilt: 0.15 },
  { id: 'you', name: 'you!', emoji: '🫵', hint: 'point straight down the lens, dramatic', l: D, r: [[0.55, -0.35], [0.85, -0.45]] },
  { id: 'tooclose', name: 'too close to the lens', emoji: '🔎', hint: 'lean right into the camera, big nose, big eyes', l: [[-0.55, -0.6], [-0.4, -0.95]], r: [[0.55, -0.6], [0.4, -0.95]] },
  { id: 'hairflip', name: 'hair flip', emoji: '💁', hint: 'flip your hair mid-motion, eyes on camera', l: D, r: [[0.45, -0.7], [0.3, -1.15]], tilt: 0.3 },
  { id: 'pout', name: 'soft pout', emoji: '💋', hint: 'glossy pout, eyes half closed, chin down', l: D, r: DR, tilt: -0.15 },
  { id: 'selfie', name: 'selfie in a selfie', emoji: '🤳', hint: 'hold your phone up and take a pic of the booth', l: D, r: [[0.5, -0.7], [0.55, -1.1]] },
  { id: 'ew', name: 'ew, no', emoji: '👎', hint: 'double thumbs down, nose scrunched', l: [[-0.4, -0.3], [-0.55, 0]], r: [[0.4, -0.3], [0.55, 0]] },
  { id: 'cherries', name: 'cherry earrings', emoji: '🍒', hint: 'hang cherry pairs over your ears like earrings', l: [[-0.4, -0.55], [-0.25, -0.95]], r: [[0.4, -0.55], [0.25, -0.95]] },
  { id: 'maincharacter', name: 'main character', emoji: '✨', hint: 'eyes closed, chin up, hand on your collarbone', l: [[-0.3, -0.3], [-0.08, -0.5]], r: DR, tilt: -0.05 },
  { id: 'doublepeace', name: 'double peace', emoji: '🤞', hint: 'two peace signs, tongue out, total chaos', l: [[-0.5, -0.55], [-0.42, -1.0]], r: [[0.5, -0.55], [0.42, -1.0]], tilt: 0.2 },
];

/** Shapes for drawing, in a unit box centred on the torso (y up is negative). */
export function figure(p: Pose) {
  const sh = { x: 0, y: -0.7 }, tilt = p.tilt ?? 0;
  const arm = (side: -1 | 1, pts: [number, number][]) => [[side * 0.2, sh.y + 0.02] as [number, number], ...pts.map(([x, y]) => [x, y + sh.y + 0.5] as [number, number])];
  return {
    head: { cx: tilt * 0.4, cy: -1.05, r: 0.24 },
    lines: [
      [[0, -0.82], [0, 0.1]] as [number, number][], // torso
      [[0, 0.1], [-0.22, 0.95]] as [number, number][], [[0, 0.1], [0.22, 0.95]] as [number, number][], // legs
      arm(-1, p.l), arm(1, p.r),
    ],
  };
}

import { posePhotos, posePhotosGroup } from './photos';

/** Loaded pose photos for canvas drawing. Call preloadPosePhotos() once on the client. */
export const poseImages = new Map<string, HTMLImageElement>();
export function preloadPosePhotos() {
  const load = (key: string, src: string) => { if (poseImages.has(key)) return; const img = new Image(); img.decoding = 'async'; img.src = src; poseImages.set(key, img); };
  for (const [id, src] of Object.entries(posePhotos)) load(id, src);
  for (const [id, src] of Object.entries(posePhotosGroup)) load(`group:${id}`, src);
}

export function drawFigure(ctx: CanvasRenderingContext2D, p: Pose, cx: number, cy: number, s: number, color: string) {
  const f = figure(p);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = s * 0.14;
  f.lines.forEach((ln) => { ctx.beginPath(); ln.forEach(([x, y], i) => (i ? ctx.lineTo(cx + x * s, cy + y * s) : ctx.moveTo(cx + x * s, cy + y * s))); ctx.stroke(); });
  ctx.beginPath(); ctx.arc(cx + f.head.cx * s, cy + f.head.cy * s, f.head.r * s, 0, 7); ctx.fill();
  ctx.restore();
}

export function pickPoses(n: number, avoid: string[] = []): Pose[] {
  const pool = POSES.filter((p) => !avoid.includes(p.id)).sort(() => Math.random() - 0.5);
  return pool.slice(0, n);
}
