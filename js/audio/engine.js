// Audio graph, transport and the look-ahead step scheduler.

import { ctx, setContext, tone, pulseWave } from "./synth.js";
import { SPB, LOOP, CHORDS, mtof, setBpm, BPM_NORMAL, BPM_TURBO } from "../config.js";
import { slots, state, sq, vq, emit } from "../state.js";
import { byId } from "../parts/index.js";

let master, analyser, delayIn, delay, fxBus;
let pendingFanfare = false;

export const getAnalyser = () => analyser;
export const audioTime = () => (ctx ? ctx.currentTime : 0);

export function ensureAudio() {
  if (ctx) return;
  setContext(new (window.AudioContext || window.webkitAudioContext)());
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = .004; comp.release.value = .2;
  master = ctx.createGain(); master.gain.value = .8;
  analyser = ctx.createAnalyser(); analyser.fftSize = 2048;
  master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);

  // shared dotted-eighth echo
  delayIn = ctx.createGain();
  delay = ctx.createDelay(2); delay.delayTime.value = SPB * 3;
  const fb = ctx.createGain(); fb.gain.value = .33;
  const dlp = ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 2600;
  const wet = ctx.createGain(); wet.gain.value = .55;
  delayIn.connect(delay); delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(wet); wet.connect(master);

  // bonus jingles
  fxBus = ctx.createGain(); fxBus.connect(master);
  const fs = ctx.createGain(); fs.gain.value = .6; fxBus.connect(fs); fs.connect(delayIn);

  slots.forEach(s => { if (s.id) makeNodes(s); });
  updateGains();
}

export function makeNodes(sl) {
  const p = byId[sl.id];
  sl.g = ctx.createGain(); sl.g.gain.value = 0; sl.g.connect(master);
  if (p.send) { sl.s = ctx.createGain(); sl.s.gain.value = p.send; sl.g.connect(sl.s); sl.s.connect(delayIn); }
}

export function dropNodes(sl) {
  if (!sl.g) return;
  const g = sl.g, s = sl.s;
  g.gain.setTargetAtTime(0, ctx.currentTime, .03);
  setTimeout(() => { g.disconnect(); if (s) s.disconnect(); }, 600);
  sl.g = sl.s = null;
}

// Works out which slots are audible (mute/solo) and fades their gains. Returns whether any slot is soloed.
export function updateGains() {
  const anySolo = slots.some(s => s.id && s.solo);
  for (const sl of slots) {
    sl.audible = !!sl.id && !sl.muted && (!anySolo || sl.solo);
    if (sl.g) sl.g.gain.setTargetAtTime(sl.audible ? byId[sl.id].gain : 0, ctx.currentTime, .015);
  }
  return anySolo;
}

export function resetTransport() {
  state.step = 0; state.nextTime = ctx.currentTime + .06; state.curStep = -1;
  sq.length = 0; vq.length = 0;
  slots.forEach(s => { s.start = 0; });
}

export function setRunning(on) {
  ensureAudio();
  state.running = on;
  if (on) {
    ctx.resume();
    if (!state.transportOn) { state.transportOn = true; resetTransport(); }
  } else ctx.suspend();
  emit("power");
}

export function setTurbo(on) {
  state.turbo = on;
  setBpm(on ? BPM_TURBO : BPM_NORMAL);
  if (delay) delay.delayTime.setTargetAtTime(SPB * 3, ctx.currentTime, .05);
  emit("tempo");
}

// Plays a short arpeggio on the next downbeat.
export function queueFanfare() { pendingFanfare = true; }

function fanfare(t, ch) {
  const ns = [...ch.n, ch.n[0] + 12, ch.n[1] + 12, ch.n[2] + 12, ch.n[0] + 24, ch.n[2] + 12];
  ns.forEach((n, i) => tone(fxBus, t + i * SPB * .5, { wave: pulseWave(.125), f: mtof(n + 12), vol: .05, hold: SPB * .3, r: .06 }));
}

function scheduleStep(n, t) {
  const s = n % LOOP;
  sq.push({ n, t });
  if (pendingFanfare && s % 16 === 0) { fanfare(t, CHORDS[s >> 4]); pendingFanfare = false; }
  for (const sl of slots) {
    if (!sl.id || n < sl.start || !sl.g) continue;
    const uid = sl.uid, i = sl.i;
    byId[sl.id].play(s, t, sl.g, (tt, kinds, dur) => vq.push({ t: tt, i, uid, kinds, dur }));
  }
}

function tick() {
  if (!ctx || !state.running || ctx.state !== "running") return;
  while (state.nextTime < ctx.currentTime + .12) {
    scheduleStep(state.step, state.nextTime);
    state.nextTime += SPB; state.step++;
  }
}

export function startClock() { setInterval(tick, 25); }
