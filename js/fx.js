// Live FX: pads that hit the whole mix on the beat grid (crash, drop, stutter, tape stop, sweep, half and double time).
import { audio } from "./audio/engine.js";
import { glide, preload, sd } from "./audio/strudel.js";
import { CHORDS, clock, LOOP } from "./music.js";

// at: the grid (in steps) a press waits for; hold: momentary, active while pressed.
export const FX = [
  { id: "crash", key: "Y", name: "CRASH", at: 4 },
  { id: "drop", key: "U", name: "DROP", at: 16 },
  { id: "stutter", key: "I", name: "STUTTER", at: 2, hold: true },
  { id: "tape", key: "O", name: "TAPE STOP", at: 4 },
  { id: "sweep", key: "P", name: "SWEEP", hold: true },
  { id: "half", key: "H", name: "HALF TIME", at: 16 },
  { id: "double", key: "J", name: "DOUBLE TIME", at: 16 },
];
const byKey = Object.fromEntries(FX.map(f => [f.id, f]));
// Stage reactions in audio-clock order: { t, cls, on, text }, drained by the frame loop.
export const fq = [];
const pending = new Set();
const live = { drop: null, speed: null, stutter: null };
const TAPE_STEPS = 8;
let tapeEnd = 0;

export const loadFx = () => preload([{ s: "cr", bank: "RolandTR909" }, { s: "bd", bank: "RolandTR909" }]);

function crash(n, t) {
  const root = CHORDS[(n % LOOP) >> 4].root;
  sd(audio.hitBus, t, { s: "cr", bank: "RolandTR909", room: .3 }, 2);
  sd(audio.hitBus, t, { s: "bd", bank: "RolandTR909" });
  sd(audio.hitBus, t, { s: "white", hcutoff: 1500, hpenv: 2, hpdecay: 1.2, hpsustain: 0, decay: 1.2, sustain: 0, gain: .3 }, 1.2);
  sd(audio.hitBus, t, { s: "sine", note: root - 12, ...glide(root + 12, root - 12, .3), decay: .9, sustain: 0, gain: .8 }, .9);
  fq.push({ t, cls: "fx-crash" });
}
// Tape stop: the master runs through a delay whose delay grows as t²/2D, so playback slows from full speed to a halt
// over D, then the delay snaps back to zero under a short fade and the band is in time again.
function tape(t) {
  if (t < tapeEnd) return;
  const D = TAPE_STEPS * clock.SPB, curve = new Float32Array(64), d = audio.tape.delayTime, g = audio.tapeGain.gain;
  for (let i = 0; i < curve.length; i++) { const x = i / (curve.length - 1) * D; curve[i] = x * x / (2 * D); }
  d.cancelScheduledValues(t); g.cancelScheduledValues(t);
  d.setValueCurveAtTime(curve, t, D * .999); d.setValueAtTime(0, t + D); tapeEnd = t + D + .05;
  g.setValueAtTime(1, t + D * .6); g.linearRampToValueAtTime(0, t + D - .005); g.linearRampToValueAtTime(1, t + D + .03);
  fq.push({ t, cls: "fx-tape", on: true, text: "TAPE STOP" }, { t: t + D, cls: "fx-tape", on: false });
}
const START = {
  crash: (n, t) => { crash(n, t); fq.push({ t, text: "CRASH!" }); },
  drop: (n, t) => { live.drop = { to: n + 16 }; fq.push({ t, cls: "fx-drop", on: true, text: "DROP!" }); },
  stutter: (n, t) => { live.stutter = { from: n }; fq.push({ t, cls: "fx-stutter", on: true, text: "STUTTER" }); },
  tape: (n, t) => tape(t),
  half: (n, t) => { live.speed = { mode: "half", from: n, to: n + 16 }; fq.push({ t, cls: "fx-half", on: true, text: "HALF TIME" }); },
  double: (n, t) => { live.speed = { mode: "double", from: n, to: n + 16 }; fq.push({ t, cls: "fx-double", on: true, text: "DOUBLE TIME" }); },
};
function sweep(on) {
  const now = audio.ctx.currentTime, f = audio.sweep.frequency;
  f.cancelScheduledValues(now); f.setValueAtTime(f.value, now);
  f.exponentialRampToValueAtTime(on ? 320 : 20000, now + clock.SPB * (on ? 8 : 4));
  audio.sweep.Q.setTargetAtTime(on ? 8 : .5, now, on ? .2 : .05);
  fq.push({ t: now, cls: "fx-sweep", on, text: on ? "FILTER SWEEP" : null });
}

// A press queues the effect for its grid; returns false when the mix isn't playing.
export function press(id, running) {
  if (!running || !audio.ctx) return false;
  if (id === "sweep") sweep(true); else pending.add(id);
  return true;
}
export function release(id) {
  if (id === "sweep" && audio.ctx) sweep(false);
  if (id !== "stutter") return;
  pending.delete("stutter");
  if (live.stutter) { live.stutter = null; fq.push({ t: audio.ctx.currentTime, cls: "fx-stutter", on: false }); }
}
// Called by the scheduler for every step, before the parts: starts queued effects that land on this step, ends windows.
export function fxStep(n, t) {
  for (const id of pending) if (n % byKey[id].at === 0) { pending.delete(id); START[id](n, t); }
  if (live.drop && n >= live.drop.to) { live.drop = null; crash(n, t); fq.push({ t, cls: "fx-drop", on: false }); }
  if (live.speed && n >= live.speed.to) { fq.push({ t, cls: `fx-${live.speed.mode}`, on: false }); live.speed = null; }
}
// The musical steps the parts play at scheduler step n, as [step, seconds after the step's time].
export function musicSteps(n) {
  const st = live.stutter, sp = live.speed;
  if (st) return [[st.from + (n - st.from) % 2, 0]];
  if (sp) {
    const k = n - sp.from;
    return sp.mode === "double" ? [[sp.from + 2 * k, 0], [sp.from + 2 * k + 1, clock.SPB / 2]] : k % 2 ? [] : [[sp.from + k / 2, 0]];
  }
  return [[n, 0]];
}
// During a drop only the beats play.
export const resting = (cat, n) => !!live.drop && n < live.drop.to && cat !== "beat";
// Pause and transport resets cancel everything and open the master back up.
export function resetFx() {
  pending.clear();
  live.drop = live.speed = live.stutter = null;
  tapeEnd = 0;
  fq.length = 0;
  fq.push({ t: 0, clear: true });
  if (!audio.ctx) return;
  const now = audio.ctx.currentTime;
  for (const [p, v] of [[audio.sweep.frequency, 20000], [audio.sweep.Q, .5], [audio.tape.delayTime, 0], [audio.tapeGain.gain, 1]]) {
    p.cancelScheduledValues(now); p.setValueAtTime(v, now);
  }
}
