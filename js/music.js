// Tempo and harmony shared by every part.

// Tempo lives in one object so every module sees changes.
export const clock = { BPM: 110, SPB: 60 / 110 / 4 };
export const BPM_MIN = 80;
export const BPM_MAX = 180;
export const LOOP = 64;
// Am - F - C - G, one chord per bar
export const CHORDS = [
  { root: 45, n: [57, 60, 64] },
  { root: 41, n: [53, 57, 60] },
  { root: 48, n: [55, 60, 64] },
  { root: 43, n: [55, 59, 62] },
];
export const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
