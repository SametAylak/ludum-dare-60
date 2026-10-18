// CC0 Sonic Pi one-shots (see samples/README.md) for Boot Sequence's drum kit, decoded once on the first gesture.
// Until they arrive, or if they never do, callers fall back to synths.
import { audio } from "./engine.js";

// Pitched samples note their root as a MIDI number so they can be played on any note.
export const SAMPLES = {
  kick: { file: "bd_haus" }, snare: { file: "sn_dolf" }, clap: { file: "perc_snap" },
  hat: { file: "drum_cymbal_closed" }, open: { file: "drum_cymbal_open" }, crash: { file: "drum_splash_hard" },
  impact: { file: "perc_impact1" }, spin: { file: "vinyl_backspin" }, blip: { file: "elec_blip", root: 74 },
};
const buffers = {};
let loading = null;

export function loadSamples() {
  loading ||= Promise.all(Object.entries(SAMPLES).map(async ([name, { file }]) => {
    try {
      const data = await (await fetch(new URL(`../../samples/${file}.flac`, import.meta.url))).arrayBuffer();
      buffers[name] = await audio.ctx.decodeAudioData(data);
    } catch { /* the synth fallback stays in place */ }
  }));
  return loading;
}

export const hasSample = name => !!buffers[name];

// A reversed copy is made on first use, for swells that suck into a downbeat.
function reversed(name) {
  const key = `${name}~`;
  if (!buffers[key]) {
    const source = buffers[name], copy = audio.ctx.createBuffer(source.numberOfChannels, source.length, source.sampleRate);
    for (let c = 0; c < source.numberOfChannels; c++) copy.getChannelData(c).set(source.getChannelData(c).slice().reverse());
    buffers[key] = copy;
  }
  return buffers[key];
}

// Plays a sample: `midi` repitches it (gliding in from `from` over `glide` seconds), `rate` scales speed, `dur` cuts it
// with a short fade, `lp` darkens it, `reverse` ends it exactly at t + its length. With `hold`, it plays as a note
// instead: attack `a`, held (looping if it can) for `hold`, released over `r`.
export function sample(dest, t, name, { vol = 1, midi, from, glide = .08, rate = 1, dur, lp, reverse = false, pan, detune = 0,
  hold, a = .003, r = .05 } = {}) {
  if (!buffers[name]) return false;
  const ctx = audio.ctx, src = ctx.createBufferSource(), g = ctx.createGain(), info = SAMPLES[name];
  const ratio = m => rate * (m === undefined ? 1 : Math.pow(2, (m - (info.root ?? 60)) / 12));
  src.buffer = reverse ? reversed(name) : buffers[name];
  src.detune.value = detune;
  src.playbackRate.setValueAtTime(ratio(from ?? midi), t);
  if (from !== undefined) src.playbackRate.exponentialRampToValueAtTime(ratio(midi), t + glide);
  let length;
  if (hold !== undefined) {
    if (info.loop) { src.loop = true; [src.loopStart, src.loopEnd] = info.loop; }
    length = info.loop ? a + hold + r : Math.min(a + hold + r, src.buffer.duration / ratio(midi));
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.setValueAtTime(vol, t + Math.max(a, length - r));
    g.gain.exponentialRampToValueAtTime(.0001, t + length);
  } else {
    length = Math.min(dur ?? Infinity, src.buffer.duration / ratio(midi));
    g.gain.setValueAtTime(vol, t);
    g.gain.setValueAtTime(vol, t + Math.max(0, length - .02));
    g.gain.linearRampToValueAtTime(0, t + length);
  }
  let node = src;
  if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; node.connect(f); node = f; }
  if (pan !== undefined) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); node = p; }
  node.connect(g); g.connect(dest);
  src.start(t, reverse ? Math.max(0, src.buffer.duration - (dur ?? Infinity) * ratio(midi)) : 0);
  src.stop(t + length + .01);
  return true;
}
