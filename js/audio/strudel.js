// Strudel: parts are mini-notation patterns, played through superdough with Strudel's sample banks and GM soundfonts.
import { getADSRValues, getAudioContext, getParamADSR, getSampleInfo, getSound, getSuperdoughAudioController, getVibratoOscillator,
  loadBuffer, loadWorklets, onceEnded, registerSound, registerSynthSounds, samples, setAudioContext, superdough }
  from "https://cdn.jsdelivr.net/npm/superdough@1.3.0/+esm";
import { noteToMidi } from "https://cdn.jsdelivr.net/npm/@strudel/core@1.2.6/+esm";
import { miniAllStrings } from "https://cdn.jsdelivr.net/npm/@strudel/mini@1.2.6/+esm";
import { clock } from "../music.js";
export { cat, n, note, s, sine, stack } from "https://cdn.jsdelivr.net/npm/@strudel/core@1.2.6/+esm";

miniAllStrings();
registerSynthSounds();

// The sample banks Strudel's REPL ships with: Dirt-Samples and the tidal drum machines.
const BANKS = ["https://raw.githubusercontent.com/tidalcycles/dirt-samples/master/strudel.json",
  "https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json"];

// General MIDI soundfonts (webaudiofont presets, as in Strudel's gm_ sounds).
const GM = { gm_choir_aahs: "0520_Aspirin_sf2_file", gm_voice_oohs: "0530_Aspirin_sf2_file", gm_synth_choir: "0540_Aspirin_sf2_file",
  gm_epiano1: "0040_JCLive_sf2_file", gm_vibraphone: "0110_JCLive_sf2_file", gm_music_box: "0100_JCLive_sf2_file",
  gm_kalimba: "1080_JCLive_sf2_file", gm_synth_bass_1: "0380_Chaos_sf2_file", gm_pad_warm: "0890_JCLive_sf2_file",
  gm_whistle: "0780_FluidR3_GM_sf2_file" };
const presets = {}, zoneBuffers = new Map();
const preset = file => presets[file] ??= fetch(`https://felixroos.github.io/webaudiofontdata/sound/${file}.js`).then(r => r.text())
  .then(js => new Function(`return ${js.slice(js.indexOf("={") + 1).trim().replace(/;$/, "")}`)().zones);
const midiOf = v => typeof v.note === "string" ? noteToMidi(v.note) : v.note ?? 60;
async function zoneFor(file, midi, ac) {
  const zones = await preset(file), z = zones.find(z => z.keyRangeLow <= midi && z.keyRangeHigh + 1 >= midi) ?? zones.at(-1);
  if (!zoneBuffers.has(z)) zoneBuffers.set(z, ac.decodeAudioData(Uint8Array.from(atob(z.file), c => c.charCodeAt(0)).buffer));
  return { z, buffer: await zoneBuffers.get(z) };
}
for (const [name, file] of Object.entries(GM)) registerSound(name, async (t, v, onended) => {
  const ac = getAudioContext(), midi = midiOf(v), { z, buffer } = await zoneFor(file, midi, ac);
  const src = ac.createBufferSource(), env = ac.createGain(), end = t + v.duration;
  src.buffer = buffer;
  src.playbackRate.value = 2 ** ((100 * midi - z.originalPitch + 100 * z.coarseTune + z.fineTune) / 1200);
  if (z.loopStart > 1 && z.loopStart < z.loopEnd) Object.assign(src, { loop: true, loopStart: z.loopStart / z.sampleRate, loopEnd: z.loopEnd / z.sampleRate });
  const [a, d, sus, r] = getADSRValues([v.attack, v.decay, v.sustain, v.release]);
  getParamADSR(env.gain, a, d, sus, r, 0, .3, t, end, "linear");
  getVibratoOscillator(src.detune, v, t)?.stop(end + r);
  src.connect(env); src.start(t); src.stop(end + r + .01);
  onceEnded(src, onended);
  return { node: env, stop: () => {} };
}, { type: "soundfont" });

// Decode every sound the patterns use at page load (an offline context decodes without a click), so nothing comes in late.
let banks = null, decoder = null;
function load(v) {
  const key = v.bank ? `${v.bank}_${v.s}` : v.s, snd = getSound(key);
  if (GM[key]) return zoneFor(GM[key], midiOf(v), decoder);
  if (snd?.data.type === "sample") return loadBuffer(getSampleInfo({ ...v, s: key }, snd.data.samples).url, decoder);
}
export function preload(values) {
  decoder ??= new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 1, 48000);
  banks ??= Promise.all(BANKS.map(url => samples(url))).catch(() => { banks = null; });
  banks.then(() => values.forEach(v => load(v)?.catch(() => {})));
}
const loops = [];
export const loadSounds = () => preload(loops.flatMap(pat => pat.queryArc(0, 4).map(hap => hap.value)));

// Each destination (a slot's gain, a guest's panner, the fx bus) gets its own orbit, so mixer and ducking still apply.
const orbits = new Map(), outs = {};
let nextOrbit = 1;
export function initStrudel(ctx) {
  setAudioContext(ctx);
  // superdough widens the destination to every hardware channel; keep ours stereo, or what a mono device allows.
  const ch = ctx.destination.channelCount, ctl = getSuperdoughAudioController(), base = ctl.getOrbit.bind(ctl);
  try { ctx.destination.channelCount = Math.min(ch, ctx.destination.maxChannelCount); } catch (e) {}
  ctl.getOrbit = (n, c) => {
    const fresh = !ctl.nodes[n], o = base(n, c);
    if (fresh) { o.output.disconnect(); o.output.connect(outs[n]); }
    return o;
  };
  loadWorklets();
  loadSounds();
}
export function releaseOrbit(dest) {
  const n = orbits.get(dest), ctl = getSuperdoughAudioController();
  if (!n) return;
  ctl.nodes[n]?.disconnect();
  delete ctl.nodes[n]; delete outs[n]; orbits.delete(dest);
}
// A pitch envelope that slides from midi `from` to the event's note over `time`.
export const glide = (from, to, time) => ({ penv: from - to, pattack: .001, pdecay: time, psustain: 0, prelease: .001, panchor: 0 });
// Play one Strudel event (a hap value: s, note, bank, cutoff, room...) into dest at t, held for dur seconds.
export function sd(dest, t, v, dur = clock.SPB) {
  let n = orbits.get(dest);
  if (!n) { orbits.set(dest, n = nextOrbit++); outs[n] = dest; }
  superdough({ ...v, orbit: n }, t, dur, clock.BPM / 240).catch(e => console.warn("[strudel]", e.message));
}
// A part's play(): one cycle is one bar, so each 16th step queries a sixteenth of a cycle and plays the onsets in it.
// kinds(value) names the performer animation for an event (see ui/performers.js), or nothing; a chord animates once.
export function loop(pat, kinds) {
  loops.push(pat);
  return (step, t, d, h) => {
    const fired = new Set();
    for (const hap of pat.queryArc(step / 16, (step + 1) / 16)) {
      if (!hap.hasOnset()) continue;
      const at = t + (hap.whole.begin - step / 16) * 16 * clock.SPB, dur = hap.duration * 16 * clock.SPB, k = kinds(hap.value);
      sd(d, at, hap.value, dur);
      if (k && !fired.has(k + at)) { fired.add(k + at); h(at, k, dur); }
    }
  };
}
