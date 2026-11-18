// The five booths. Each is a preset over the same engine: which layouts, which look, which panels to show first.
export type BoothId = 'filter' | 'instant' | 'photo' | 'pose' | 'frames';
export type Booth = { id: BoothId; name: string; blurb: string; layouts: string[]; look: string; guide?: boolean; films?: boolean; framesFirst?: boolean };

export const BOOTHS: Booth[] = [
  { id: 'filter', name: 'Filter Booth', blurb: '36 looks, live on your camera', layouts: ['single', 'strip4', 'grid4'], look: 'kodachrome' },
  { id: 'instant', name: 'Instant Booth', blurb: 'instant-film prints in three sizes', layouts: ['polaroid', 'polaroid-wide', 'polaroid-mini'], look: 'polaroid', films: true },
  { id: 'photo', name: 'Photo Booth', blurb: 'strips, collages & single prints', layouts: ['strip4', 'strip3', 'strip2', 'grid4', 'grid6', 'film4', 'single'], look: 'golden' },
  { id: 'pose', name: 'Pose Booth', blurb: 'copy the pose, side by side', layouts: ['pose4'], look: 'film', guide: true },
  { id: 'frames', name: 'Frames Booth', blurb: 'designed frames, or any colour', layouts: ['strip4', 'grid4', 'polaroid', 'strip3'], look: 'original', framesFirst: true },
];

// Instant Booth "film stock" choices, mapped onto looks.
export const FILMS = [
  { name: 'Color', look: 'polaroid' }, { name: 'B&W', look: 'noir' }, { name: 'Cool', look: 'cool' },
  { name: 'Expired', look: 'faded70s' }, { name: 'Blue duo', look: 'duoblue' }, { name: 'Rose duo', look: 'duopink' }, { name: 'Original', look: 'original' },
];
