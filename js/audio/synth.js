// Synth voices: oscillators, filtered noise, 2-op FM and a formant singer.
import { audio } from "./engine.js";

function noiseBuf() {
  if (!audio.ctx._nb) {
    const b = audio.ctx.createBuffer(1, audio.ctx.sampleRate * 2, audio.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    audio.ctx._nb = b;
  }
  return audio.ctx._nb;
}
export function pulseWave(duty) {
  audio.ctx._pw = audio.ctx._pw || {};
  if (!audio.ctx._pw[duty]) {
    const N = 40, re = new Float32Array(N), im = new Float32Array(N);
    for (let k = 1; k < N; k++) re[k] = 2 / (k * Math.PI) * Math.sin(k * Math.PI * duty);
    audio.ctx._pw[duty] = audio.ctx.createPeriodicWave(re, im);
  }
  return audio.ctx._pw[duty];
}
function env(p, t, vol, a, hold, r) {
  p.setValueAtTime(0.0001, t);
  p.exponentialRampToValueAtTime(vol, t + a);
  if (hold > 0) p.setValueAtTime(vol, t + a + hold);
  const end = t + a + Math.max(0, hold) + r;
  p.exponentialRampToValueAtTime(0.0001, end);
  return end;
}
export function tone(dest, t, o) {
  const { type = "sine", f, f2, glide = .05, vol = .3, a = .003, hold = 0, r = .15, wave, lp, q = .7, detune = 0, vib = 0, vibRate = 5.5 } = o;
  const osc = audio.ctx.createOscillator();
  if (wave) osc.setPeriodicWave(wave); else osc.type = type;
  osc.frequency.setValueAtTime(f, t);
  if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t + glide);
  osc.detune.value = detune;
  const g = audio.ctx.createGain();
  const end = env(g.gain, t, vol, a, hold, r);
  let node = osc;
  if (lp) { const fl = audio.ctx.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; fl.Q.value = q; osc.connect(fl); node = fl; }
  node.connect(g); g.connect(dest);
  if (vib) {
    const l = audio.ctx.createOscillator(), lg = audio.ctx.createGain();
    l.frequency.value = vibRate;
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime((f2 || f) * vib, t + Math.min(.35, end - t));
    l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(end + .05);
  }
  osc.start(t); osc.stop(end + .05);
  return end;
}
export function noise(dest, t, o) {
  const { vol = .3, a = .002, hold = 0, r = .1, type = "bandpass", f = 2000, f2, Q = 1 } = o;
  const s = audio.ctx.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
  const fl = audio.ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = Q;
  const g = audio.ctx.createGain();
  const end = env(g.gain, t, vol, a, hold, r);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, end);
  s.connect(fl); fl.connect(g); g.connect(dest);
  s.start(t, Math.random() * 1.5); s.stop(end + .05);
  return end;
}
export function fm(dest, t, o) {
  const { f, ratio = 1, index = 2, vol = .1, a = .004, hold = 0, r = .3 } = o;
  const c = audio.ctx.createOscillator(), m = audio.ctx.createOscillator(), mg = audio.ctx.createGain(), g = audio.ctx.createGain();
  c.frequency.value = f; m.frequency.value = f * ratio;
  const end = env(g.gain, t, vol, a, hold, r);
  mg.gain.setValueAtTime(f * index, t);
  mg.gain.exponentialRampToValueAtTime(f * index * .15 + .01, end);
  m.connect(mg); mg.connect(c.frequency); c.connect(g); g.connect(dest);
  c.start(t); m.start(t); c.stop(end + .05); m.stop(end + .05);
  return end;
}
// formant "singing" voice: sawtooth through three vowel band-passes
const VOW = {
  a: [[800, 1], [1150, .5], [2900, .2]],
  o: [[450, 1], [800, .45], [2830, .12]],
  u: [[325, 1], [700, .3], [2530, .08]],
  e: [[400, 1], [1700, .4], [2600, .25]],
  i: [[300, 1], [2200, .35], [3000, .25]],
};
export function voice(dest, t, o) {
  const { f, vowel = "a", vowelEnd = vowel, vol = .3, a = .03, hold = .2, r = .12, scoop = .94, vib = .012, vibRate = 5.2 } = o;
  const osc = audio.ctx.createOscillator(); osc.type = "sawtooth";
  osc.frequency.setValueAtTime(f * scoop, t);
  osc.frequency.exponentialRampToValueAtTime(f, t + .07);
  const g = audio.ctx.createGain();
  const end = env(g.gain, t, vol, a, hold, r);
  const l = audio.ctx.createOscillator(), lg = audio.ctx.createGain();
  l.frequency.value = vibRate;
  lg.gain.setValueAtTime(0, t);
  lg.gain.linearRampToValueAtTime(f * vib, t + Math.max(.08, (end - t) * .6));
  l.connect(lg); lg.connect(osc.frequency);
  for (const [i, [ff, amp]] of VOW[vowel].entries()) {
    const bp = audio.ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = ff; bp.Q.value = ff / 90;
    bp.frequency.setValueAtTime(ff, t);
    bp.frequency.exponentialRampToValueAtTime(VOW[vowelEnd][i][0], t + a + hold * .8);
    const fg = audio.ctx.createGain(); fg.gain.value = amp * 3.5;
    osc.connect(bp); bp.connect(fg); fg.connect(g);
  }
  g.connect(dest);
  osc.start(t); l.start(t); osc.stop(end + .05); l.stop(end + .05);
  return end;
}
export function kick(d, t, v = 1) {
  tone(d, t, { f: 150, f2: 44, glide: .12, vol: .95 * v, a: .002, r: .38 });
  noise(d, t, { type: "highpass", f: 3500, vol: .12 * v, r: .012 });
}
