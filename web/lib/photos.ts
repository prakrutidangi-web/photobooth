/**
 * Generated illustrative photobooth samples: NOT real customers or reviews.
 * Used across the marketing site (hero strip, booth cards, the wall, looks).
 * Files live in /public/photos (900x900 webp). Square photos are cropped to 4:3 where a slot needs it.
 * If this list is emptied, the site falls back to abstract placeholder art.
 */
export type Photo = { id: string; src: string; alt: string; illustrative: true };

export const photos: Photo[] = [
  { id: '01', src: '/photos/01.webp', alt: 'Two best friends laughing cheek to cheek, one wearing a red hair bow', illustrative: true },
  { id: '02', src: '/photos/02.webp', alt: 'Curly-haired woman flashing a peace sign with gold hoop earrings', illustrative: true },
  { id: '03', src: '/photos/03.webp', alt: 'Woman kissing her surprised partner on the cheek', illustrative: true },
  { id: '04', src: '/photos/04.webp', alt: 'Three playful friends posing together with heart-shaped hands', illustrative: true },
  { id: '05', src: '/photos/05.webp', alt: 'Woman in a cream knit sweater posing with a single cherry', illustrative: true },
  { id: '06', src: '/photos/06.webp', alt: 'Young man with round glasses and a leather jacket striking a thinking pose', illustrative: true },
  { id: '07', src: '/photos/07.webp', alt: 'Laughing bride in a short white dress and veil with a small bouquet', illustrative: true },
  { id: '08', src: '/photos/08.webp', alt: 'Two sisters posing back to back with bold red lipstick', illustrative: true },
  { id: '09', src: '/photos/09.webp', alt: 'Woman with a pixie cut blowing a kiss toward the camera', illustrative: true },
  { id: '10', src: '/photos/10.webp', alt: 'Three friends celebrating with party hats, tinsel, and confetti', illustrative: true },
  { id: '11', src: '/photos/11.webp', alt: 'Young man and his grandmother grinning in heart-shaped sunglasses', illustrative: true },
  { id: '12', src: '/photos/12.webp', alt: 'Hands making a heart in front of a softly blurred smiling face', illustrative: true },
];

/** Hero doorway: someone sitting inside the booth behind the half-open curtain (portrait 2:3). null = empty booth. */
export const boothInside: string | null = null; // e.g. '/photos/booth-inside.webp'

/** Optional real video for the hero booth (people inside, flash going off). e.g. '/video/booth.mp4'. null = animated photos. */
export const boothVideo: string | null = null;

/**
 * Pose-guide photos keyed by pose id (see lib/poses.ts). Square, ~800x800 webp in /public/poses.
 * Any pose without a photo falls back to the stick-figure drawing.
 * e.g. { peace: '/poses/peace.webp', smile: '/poses/smile.webp' }
 */
const POSE_IDS = ['fingerheart', 'peaceeye', 'squish', 'unbothered', 'sideeye', 'shades', 'caught', 'you', 'tooclose', 'hairflip', 'pout', 'selfie', 'ew', 'cherries', 'maincharacter', 'doublepeace'];
/** Solo demonstration of each pose (illustrative, AI generated). */
export const posePhotos: Record<string, string> = Object.fromEntries(POSE_IDS.map((id) => [id, `/poses/${id}.webp`]));
/** The same pose done by a group of friends ("squad" mode in the booth). */
export const posePhotosGroup: Record<string, string> = Object.fromEntries(POSE_IDS.map((id) => [id, `/poses/group/${id}.webp`]));

