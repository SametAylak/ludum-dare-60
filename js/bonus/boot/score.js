// Boot Sequence's arrangement: a longer show than the others, with its own section layout and guest parts.
import { eventsAt, SCORE } from "./patterns.js";

export const TIMING = { intro: 64, music: 256, outro: 32 };
TIMING.show = TIMING.intro + TIMING.music + TIMING.outro;

const SECTIONS = [
  { start: 0, end: 16, id: "arrival", label: "SIGNAL INCOMING", energy: .3, band: .7, cutoff: 5600 },
  { start: 16, end: 62, id: "build", label: "FOLLOW THE FREQUENCY", energy: .7, band: .32, cutoff: 2200 },
  { start: 62, end: 64, id: "breath", label: "BREATHE...", energy: .1, band: .04, cutoff: 700 },
  { start: 64, end: 128, id: "drop", label: "WE HAVE CONTACT", energy: 1, band: .27, cutoff: 14000 },
  { start: 128, end: 160, id: "groove", label: "CALL / RESPONSE", energy: .85, band: .32, cutoff: 14000 },
  { start: 160, end: 192, id: "break", label: "FLOAT WITH ME", energy: .3, band: .18, cutoff: 1400 },
  { start: 192, end: 222, id: "lift", label: "ONE MORE SKY", energy: .8, band: .16, cutoff: 1800 },
  { start: 222, end: 224, id: "breath", label: "BREATHE...", energy: .1, band: .03, cutoff: 700 },
  { start: 224, end: 288, id: "peak", label: "EVERYBODY IN ORBIT", energy: 1.2, band: .22, cutoff: 16000 },
  { start: 288, end: 320, id: "finale", label: "SEND IT TO THE STARS", energy: 1.1, band: .3, cutoff: 16000 },
  { start: 320, end: TIMING.show, id: "outro", label: "BACK TO YOUR MIX", energy: .3, band: 1, cutoff: 20000 },
];

export const sectionAt = position => SECTIONS.find(section => position < section.end) || SECTIONS.at(-1);
export const hasBeat = section => ["drop", "groove", "peak", "finale"].includes(section.id);
export const isPeak = section => section.id === "peak" || section.id === "finale";

// Close upper voices above the root bass: Am9, Fmaj9, Cmaj9, Gadd9.
export const VOICINGS = [[60, 64, 67, 71], [60, 64, 67, 69], [59, 62, 64, 67], [59, 62, 67, 69]];

// The guests arrive one at a time and lock together at the peak.
const LEVELS = {
  arrival: { answer: .6, riff: .6 },
  build: { answer: 0, riff: 0 },
  drop: { answer: .8, riff: 0 },
  groove: { answer: .8, riff: .75 },
  break: { answer: .45, riff: .5 },
  lift: { answer: 0, riff: .6 },
  peak: { answer: .9, riff: .85 },
  finale: { answer: .75, riff: .7 },
};
// The groove and the break play the second phrase; the choruses keep the first.
export const variationAt = section => section.id === "groove" || section.id === "break" ? 1 : 0;
export const eventsFor = (position, songStep) => eventsAt(songStep, variationAt(sectionAt(position)));
const SCALE = [0, 2, 4, 5, 7, 9, 11];
export const thirdBelow = midi => {
  let n = midi - 1;
  for (let steps = 0; steps < 2; n--) if (SCALE.includes(n % 12) && ++steps === 2) return n;
};

export function stemLevel(stem, section, position) {
  const level = SCORE.levels[section.id]?.[stem] ?? LEVELS[section.id]?.[stem] ?? 0, b = position & 15;
  if (stem === "answer" && section.id === "drop" && position < 96) return 0;
  // The guests introduce themselves in turn: the riff in the first half bar, the answer in the second.
  if (section.id === "arrival" && (stem === "riff") !== b < 8) return 0;
  return level;
}

export function guestNotes(position, songStep) {
  const section = sectionAt(position), notes = [];
  for (const event of eventsFor(position, songStep)) {
    const side = SCORE.roles.indexOf(event.layer), velocity = side < 0 ? 0 : stemLevel(event.layer, section, position);
    if (!velocity) continue;
    // From the groove on, the robot sings as a choir of three: the line, a third and a fifth below.
    const choir = event.word && ["groove", "break", "peak", "finale"].includes(section.id)
      ? [thirdBelow(event.value), thirdBelow(thirdBelow(event.value))] : null;
    notes.push({ side, role: event.layer, midi: event.value, word: event.word, choir, offset: event.offset, velocity,
      length: Math.min(event.length, section.end - position), accent: (position & 3) === 0 });
  }
  return notes;
}
