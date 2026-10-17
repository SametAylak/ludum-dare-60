import { CHORDS } from "../music.js";

export const INTRO_STEPS = 32;
export const MUSIC_STEPS = 128;
export const SHOW_STEPS = INTRO_STEPS + MUSIC_STEPS + 8;

const SECTIONS = {
  arrival: { id: "arrival", label: "SIGNAL INCOMING", energy: .35, band: .85, cutoff: 6500 },
  build: { id: "build", label: "GET READY", energy: .65, band: .6, cutoff: 2400 },
  breath: { id: "breath", label: "HOLD THAT THOUGHT...", energy: .15, band: .12, cutoff: 850 },
  drop: { id: "drop", label: "WE HAVE CONTACT", energy: 1, band: .68, cutoff: 16000 },
  groove: { id: "groove", label: "CALL / RESPONSE", energy: .85, band: .72, cutoff: 16000 },
  break: { id: "break", label: "ONE MORE TIME...", energy: .28, band: .4, cutoff: 1700 },
  lift: { id: "lift", label: "HERE WE GO", energy: .7, band: .25, cutoff: 1200 },
  peak: { id: "peak", label: "EVERYBODY IN ORBIT", energy: 1.2, band: .62, cutoff: 18000 },
  finale: { id: "finale", label: "SEND IT TO THE STARS", energy: 1.1, band: .68, cutoff: 18000 },
  outro: { id: "outro", label: "BACK TO YOUR MIX", energy: .3, band: 1, cutoff: 20000 },
};

export function sectionAt(position) {
  if (position < 16) return SECTIONS.arrival;
  if (position < 30) return SECTIONS.build;
  if (position < 32) return SECTIONS.breath;
  if (position < 64) return SECTIONS.drop;
  if (position < 96) return SECTIONS.groove;
  if (position < 108) return SECTIONS.break;
  if (position < 112) return SECTIONS.lift;
  if (position < 144) return SECTIONS.peak;
  if (position < 160) return SECTIONS.finale;
  return SECTIONS.outro;
}

const MOTIFS = {
  boot: [0, 1, 2, 1, 0, 2, 1, 2], dial: [2, 1, 0, 1, 2, 0, 1, 0],
  main: [0, 2, 1, 0, 2, 1, 0, 2], lan: [0, 2, 0, 1, 2, 1, 2, 0],
  cosmic: [0, 0, 2, 1, 2, 1, 0, 2],
};
const RHYTHMS = {
  telegraph: [0, 2, 3, 6], gramophone: [0, 3, 6],
  radio: [0, 4, 6], reel: [0, 2, 5, 7],
};

// Both guests get a foreground phrase, then an answering accent in the other half-bar.
export function guestNote(combo, side, position, songStep) {
  const section = sectionAt(position).id, guest = combo.guests[side];
  const step = position & 15, local = (step + side * 8) & 15;
  let velocity = 1, length = guest === "telegraph" ? .55 : guest === "radio" ? 1.5 : .9;
  if (section === "outro" || section === "breath" || section === "lift") return null;
  if (section === "arrival") {
    if (position !== 4 + side * 8) return null;
    velocity = .65; length = 2;
  } else if (section === "build") {
    if (step % 4 !== side * 2 || position >= 28) return null;
    velocity = .65;
  } else if (section === "break") {
    if (step !== side * 6) return null;
    velocity = .7; length = 3;
  } else {
    const foreground = local < 8 && RHYTHMS[guest].includes(local);
    const answer = local === 12 || section === "peak" && local === 14;
    if (!foreground && !answer) return null;
    velocity = foreground ? 1 : .48;
    if (section === "peak" || section === "finale") velocity *= 1.12;
  }
  const ch = CHORDS[(songStep >> 4) & 3];
  const degree = MOTIFS[combo.id][local % 8];
  const octave = guest === "radio" || guest === "gramophone" ? 0 : 12;
  return { midi: ch.n[degree] + octave, velocity, length, accent: local === 0,
    harmony: section === "peak" && local === 0 ? ch.n[(degree + 1) % 3] + octave : null };
}
