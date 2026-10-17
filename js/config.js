// Tempo, harmony and other global constants.

export const LOOP = 64;                 // 4 bars of 16th notes
export const BPM_NORMAL = 110, BPM_TURBO = 128;

// Live bindings: importers always see the current tempo.
export let BPM = BPM_NORMAL;
export let SPB = 60 / BPM / 4;          // seconds per 16th note
export function setBpm(bpm) { BPM = bpm; SPB = 60 / bpm / 4; }

// Am - F - C - G, one chord per bar
export const CHORDS = [
  { root: 45, n: [57, 60, 64] },
  { root: 41, n: [53, 57, 60] },
  { root: 48, n: [55, 60, 64] },
  { root: 43, n: [55, 59, 62] },
];
export const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
