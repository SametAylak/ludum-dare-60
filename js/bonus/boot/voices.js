// Boot Sequence's instruments: supersaw pads, a talk-box guitar, an acid bass and the two guests.
import { audio } from "../../audio/engine.js";
import { fm, pulseWave, tone } from "../../audio/synth.js";
import { clock, mtof } from "../../music.js";
import { sample } from "../../audio/samples.js";
import { robot } from "../../audio/robot.js";

function envelope(param, t, vol, a, hold, r) {
  param.setValueAtTime(.0001, t);
  param.exponentialRampToValueAtTime(vol, t + a);
  param.setValueAtTime(vol, t + a + hold);
  param.exponentialRampToValueAtTime(.0001, t + a + hold + r);
  return t + a + hold + r;
}

// Detuned saws through one lowpass per side that opens on the attack: the wide lead and pad of synthwave.
export function supersaw([left, right], t, { f, vol, a = .008, hold, r, lp = 3200, open = .3, detune = 16, type = "sawtooth" }) {
  const ctx = audio.ctx;
  for (const [side, out] of [left, right].entries()) {
    const filter = ctx.createBiquadFilter(), g = ctx.createGain(), end = envelope(g.gain, t, vol, a, hold, r);
    filter.type = "lowpass"; filter.Q.value = .8;
    filter.frequency.setValueAtTime(lp * open, t);
    filter.frequency.exponentialRampToValueAtTime(lp, t + a + .06);
    filter.frequency.exponentialRampToValueAtTime(lp * .55, end);
    filter.connect(g); g.connect(out);
    for (const cents of side ? [detune, detune * .35, -detune * .7] : [-detune, -detune * .35, detune * .7]) {
      const osc = ctx.createOscillator();
      osc.type = type; osc.frequency.value = f; osc.detune.value = cents;
      osc.connect(filter); osc.start(t + Math.random() * .004); osc.stop(end + .05);
    }
  }
}

// The talk box: a scooped saw through two vowel formants that open from "u" to "a" and close to "o", a guitar that says "wow".
export function talkbox(dest, t, { midi, vol, duration }) {
  const ctx = audio.ctx, osc = ctx.createOscillator(), g = ctx.createGain(), end = envelope(g.gain, t, vol, .01, duration * .75, .08);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(mtof(midi - 1), t);
  osc.frequency.exponentialRampToValueAtTime(mtof(midi), t + .06);
  for (const [u, a, o] of [[350, 800, 500], [800, 1150, 900]]) {
    const f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(u, t);
    f.frequency.linearRampToValueAtTime(a, t + duration * .35);
    f.frequency.linearRampToValueAtTime(o, end);
    osc.connect(f); f.connect(g);
  }
  g.connect(dest); osc.start(t); osc.stop(end + .05);
}

// A 303-style acid line: a saw through a resonant lowpass that snaps open on each note, gliding in from `slide`.
export function acid(dest, t, { midi, slide, vol, duration, cutoff, accent }) {
  const ctx = audio.ctx, osc = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  const end = envelope(g.gain, t, vol * (accent ? 1.3 : 1), .003, duration * .6, .05);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(mtof(slide ?? midi), t);
  if (slide !== undefined) osc.frequency.exponentialRampToValueAtTime(mtof(midi), t + duration * .4);
  f.type = "lowpass"; f.Q.value = accent ? 14 : 9;
  f.frequency.setValueAtTime(cutoff * (accent ? 5 : 3), t);
  f.frequency.exponentialRampToValueAtTime(cutoff, t + .12);
  osc.connect(f); f.connect(g); g.connect(dest); osc.start(t); osc.stop(end + .05);
}

export const GUESTS = {
  telegraph(d, t, note) {
    if (sample(d, t, "blip", { midi: note.midi - 12, vol: .3 * note.velocity, dur: clock.SPB * Math.max(1, note.length) * .9 })) {
      return tone(d, t, { wave: pulseWave(.25), f: mtof(note.midi), vol: .035 * note.velocity, hold: clock.SPB * .3, r: .05, lp: 5000 });
    }
    const f = mtof(note.midi), hold = clock.SPB * note.length * .5;
    tone(d, t, { wave: pulseWave(.25), f: f * 1.02, f2: f, glide: .012, vol: .085 * note.velocity, hold, r: .07, lp: 3600 });
    fm(d, t, { f: f * 2, ratio: 2, index: note.accent ? 1.4 : .7, vol: .022 * note.velocity, r: .12 });
  },
  // The robot sings the show's message; from the groove on as a choir of three: the line, a third and a fifth below.
  radio(d, t, note) {
    [note.midi, ...note.choir || []].forEach((midi, i) => robot(d, t + i * .007, { midi, word: note.word,
      vol: .16 * note.velocity * (i ? .5 : 1), duration: clock.SPB * note.length }));
  },
};

export function pad(bus, notes, t, duration, intensity, peak) {
  for (const midi of notes) supersaw([bus.left, bus.right], t, { f: mtof(midi), vol: .016 * intensity,
    a: Math.min(.3, duration * .25), hold: duration * .55, r: duration * .3, lp: peak ? 3000 : 1500, open: .6, detune: 12 });
  if (peak) for (const midi of [notes[0], notes[2]]) tone(bus.lead, t, { type: "triangle", f: mtof(midi + 12),
    vol: .014 * intensity, a: .15, hold: duration * .65, r: duration * .25 });
}
