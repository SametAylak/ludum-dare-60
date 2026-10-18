// The robot vocoder that sings Boot Sequence: each note sings one syllable.
import { noise, pulseWave, tone, voice } from "./synth.js";
import { mtof } from "../music.js";

// The vocoder: one syllable per note, a consonant of shaped noise, then a vowel glide on a buzzing carrier
// doubled an octave down. No scoop and no vibrato, so it stays a machine.
const SYLLABLES = { the: ["d", "e", "e"], ma: ["m", "a", "a"], chines: ["ch", "i", "i"], are: ["", "a", "o"], a: ["", "a", "e"],
  live: ["l", "a", "i"], sys: ["s", "i", "i"], tem: ["t", "e", "e"], on: ["", "o", "o"], line: ["l", "a", "i"],
  press: ["p", "e", "e"], ny: ["n", "e", "i"], key: ["k", "i", "i"], to: ["t", "u", "u"], start: ["s", "a", "a"],
  boot: ["b", "u", "u"], se: ["s", "e", "e"], quence: ["k", "e", "i"], load: ["l", "o", "o"], ing: ["", "i", "i"],
  re: ["r", "i", "i"], plug: ["p", "a", "a"], me: ["m", "i", "i"], in: ["", "i", "i"], now: ["n", "a", "o"],
  turn: ["t", "e", "e"], up: ["", "a", "a"], loud: ["l", "a", "o"], we: ["", "u", "i"], beige: ["b", "e", "i"],
  box: ["b", "o", "o"], ah: ["", "a", "a"], oh: ["", "o", "o"], doo: ["d", "u", "u"], dm: ["d", "u", "o"],
  hey: ["", "e", "i"], go: ["k", "o", "u"], ba: ["b", "a", "a"] };
const CONSONANTS = { s: [6500, .09, .07], ch: [3200, .07, .06], t: [3800, .06, .015], k: [2600, .06, .02], p: [1500, .05, .012], d: [2400, .03, .01],
  b: [900, .04, .01] };
// `sub` sets the octave-below double: full for a bass, none for a thin lead that should stay out of the mids.
export function robot(dest, t, { midi, word, vol, duration, sub = .75 }) {
  const [consonant, vowel, vowelEnd] = SYLLABLES[word] || ["", "a", "o"], hiss = CONSONANTS[consonant];
  const onset = hiss ? Math.min(hiss[2], duration * .3) : 0, hold = Math.max(.02, duration * .7 - onset);
  if (hiss) noise(dest, t, { type: consonant === "s" || consonant === "ch" ? "highpass" : "bandpass", f: hiss[0], Q: 1.2,
    vol: hiss[1] * vol / .1, hold: onset * .6, r: onset * .4 + .01 });
  for (const [octave, level] of [[0, 1], [-12, sub]].filter(([, level]) => level)) voice(dest, t + onset, { f: mtof(midi + octave), vowel, vowelEnd,
    vol: vol * level, a: .012, hold, r: .06, scoop: 1, vib: 0 });
  tone(dest, t + onset, { wave: pulseWave(.5), f: mtof(midi), vol: vol * .12, a: .01, hold, r: .05, lp: 2400 });
}
