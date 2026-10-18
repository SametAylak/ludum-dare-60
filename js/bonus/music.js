// The guests take over for a build, a drop, a breakdown and a bigger second drop.
import { audio, loadPack } from "../audio/engine.js";
import { glide, preload, sd } from "../audio/strudel.js";
import { CHORDS, clock } from "../music.js";
import { COMBOS } from "./combos.js";
import { guestNote, sectionAt } from "./score.js";
import { bootEnergy, scheduleBoot, startBoot, stopBoot } from "./boot/music.js";

const cues = [];
const lastHits = [{ t: -Infinity, strength: 0 }, { t: -Infinity, strength: 0 }];
const BASS = { 0: 0, 3: 0, 6: 12, 8: 0, 10: 7, 14: 12 };
// Boot Sequence hands its music to bonus/boot/ and keeps only the recorded transmission here.
let boot = false;

// Shows with a `sample` in combos.js add a recorded voice on top of the guests.
// "hook": an 8-bar vocal hook recorded at 125 BPM covers the drop through the finale.
// It plays as one crossfaded grain per 16th step, so it follows any tempo at its own pitch.
const HOOK_STEP = 60 / 125 / 4, HOOK_FROM = 32, HOOK_TO = 160, HOOK_FADE = .012;
const hook = { buffer: null, out: null, on: false };
// "speech": a spoken transmission comes in with the show and talks over the intro.
const SPEECH_GAIN = .8;
const speech = { buffer: null, src: null, due: false };
// Both recordings ship processed and packed in one file, in this order (tools/pack-voices.mjs).
const voices = { url: new URL("../../audio/voices.bin", import.meta.url), loading: null };

// The drum machine hits the show's rhythm section uses.
const KIT = [..."bd cp hh oh sd".split(" ").map(s => ({ s, bank: "RolandTR909" })), { s: "hh", bank: "RolandTR808" }, { s: "mt", bank: "RolandTR808" }];

export function loadSamples() {
  preload(KIT);
  if (COMBOS.some(c => c.sample)) loadPack(voices, [hook, speech]);
}

function hookGrain(combo, position, t) {
  // Only start on the downbeat, so a hook that loads late never comes in mid-phrase.
  if (position === HOOK_FROM) hook.on = combo.sample === "hook" && !!hook.buffer;
  if (!hook.on || position < HOOK_FROM || position >= HOOK_TO) return;
  if (!hook.out) { hook.out = audio.ctx.createGain(); hook.out.gain.value = .5; hook.out.connect(audio.fxBus); }
  const src = audio.ctx.createBufferSource(), env = audio.ctx.createGain(), hold = clock.SPB;
  src.buffer = hook.buffer;
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1, t + HOOK_FADE);
  env.gain.setValueAtTime(1, t + hold);
  env.gain.linearRampToValueAtTime(0, t + hold + HOOK_FADE);
  src.connect(env); env.connect(hook.out);
  src.start(t, (position - HOOK_FROM) * HOOK_STEP, hold + HOOK_FADE);
}

// The bar a show starts on is usually queued already, so speak on the first step the show schedules.
function speak(combo, t) {
  speech.due = false;
  if (combo.sample !== "speech" || !speech.buffer) return;
  const src = speech.src = audio.ctx.createBufferSource(), level = audio.ctx.createGain();
  src.buffer = speech.buffer; level.gain.value = SPEECH_GAIN;
  src.connect(level); level.connect(audio.fxBus);
  src.start(t);
  src.onended = () => { if (speech.src === src) speech.src = null; };
}

export function startBonusAudio(combo) {
  boot = combo.id === "boot";
  if (boot) startBoot();
  cues.length = 0;
  hook.on = false;
  speech.due = true;
  loadSamples();
  lastHits.forEach(hit => { hit.t = -Infinity; hit.strength = 0; });
  const t = audio.ctx.currentTime;
  audio.fxBus.gain.cancelScheduledValues(t);
  audio.fxBus.gain.setTargetAtTime(1, t, .025);
}

export function stopBonusAudio() {
  cues.length = 0;
  speech.due = false;
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime;
  if (boot) stopBoot(t);
  // Boot Sequence hands the band back more slowly, so the end of its show is a fade rather than a cut.
  for (const [param, value] of [[audio.fxBus.gain, 0], [audio.bandGain.gain, 1], [audio.bandFilter.frequency, 20000]]) {
    param.cancelScheduledValues(t);
    param.setTargetAtTime(value, t, boot && param !== audio.fxBus.gain ? .2 : .04);
  }
  // Stop a cut-off transmission after the fade, so it can't resurface when the next show opens the bus.
  speech.src?.stop(t + .2);
  speech.src = null;
  boot = false;
}

export function guestEnergy(now) {
  if (boot) return bootEnergy(now);
  while (cues.length && cues[0].t <= now) {
    const cue = cues.shift();
    lastHits[cue.side] = cue;
  }
  return lastHits.map(hit => hit.strength * Math.exp(-Math.max(0, now - hit.t) / .16));
}

const INSTRUMENTS = {
  telegraph(d, t, note) {
    const { midi, velocity: v } = note;
    sd(d, t, { s: "pulse", pw: .25, note: midi, cutoff: 3600, sustain: 1, release: .045, gain: .32 * v }, clock.SPB * note.length);
    sd(d, t, { s: "sine", note: midi + 12, fmh: 2, fmi: .7, decay: .11, sustain: 0, gain: .09 * v }, .11);
    sd(d, t, { s: "white", bandf: 2600, bandq: 3, decay: .014, sustain: 0, gain: .07 * v }, .014);
  },
  gramophone(d, t, note) {
    const { midi, velocity: v } = note, hold = clock.SPB * note.length;
    sd(d, t, { s: "supersaw", note: midi, unison: 2, detune: .16, ...glide(midi - .5, midi, .035), cutoff: 2100, resonance: 1.8,
      attack: .012, sustain: 1, release: .12, gain: .5 * v }, hold);
    sd(d, t, { s: "triangle", note: midi + 12, sustain: 1, release: .13, gain: .14 * v }, hold * .65);
    if (note.accent) sd(d, t, { s: "crackle", density: .4, decay: .06, sustain: 0, gain: .22 }, .06);
  },
  radio(d, t, note) {
    const { midi, velocity: v } = note;
    sd(d, t, { s: "sawtooth", note: midi, vowel: note.accent ? "a" : "o", ...glide(midi + (note.accent ? -3.4 : 1.3), midi, .07),
      vib: 5.2, vibmod: .15, attack: .015, sustain: 1, release: .1, gain: .47 * v }, clock.SPB * note.length);
    sd(d, t, { s: "sine", note: midi + 12, fmi: 1.5, decay: .22, sustain: 0, gain: .09 * v }, .22);
  },
  phone(d, t, note) {
    const { midi, velocity: v } = note;
    sd(d, t, { s: "sine", note: midi, fmi: 3.5, fmdecay: .3, fmsustain: .15, sustain: 1, release: .22, gain: .5 * v }, clock.SPB * note.length * .4);
    sd(d, t, { s: "triangle", note: midi - 12, sustain: 1, release: .13, gain: .16 * v }, clock.SPB * .4);
    sd(d, t + clock.SPB * .75, { s: "sine", note: midi, fmi: 1.6, decay: .17, sustain: 0, gain: .09 * v }, .17);
  },
};

const drum = (t, s, bank, v = {}) => sd(audio.fxBus, t, { s, bank, ...v });

function impact(t, root, peak) {
  drum(t, "bd", "RolandTR909", { gain: peak ? .48 : .43 });
  sd(audio.fxBus, t, { s: "white", hcutoff: 1800, hpenv: 1.76, hpdecay: clock.SPB * 5, hpsustain: 0, decay: clock.SPB * 5, sustain: 0, gain: .32 }, clock.SPB * 5);
  sd(audio.fxBus, t, { s: "sine", note: root - 12, ...glide(root + 12, root - 12, .22), decay: .38, sustain: 0, gain: .54 }, .38);
}

function build(position, songStep, t) {
  const step = position & 15, ch = CHORDS[(songStep >> 4) & 3];
  const intensity = position >= 108 ? .8 + (position - 108) * .05 : (position - 16) / 16;
  if (position === 16 || position === 108) {
    const duration = clock.SPB * (position === 16 ? 13 : 3.5), n = ch.n[0];
    sd(audio.fxBus, t, { s: "white", bandf: 650, bandq: .6, bpenv: 3.3, bpattack: duration, bpsustain: 1,
      attack: duration * .85, sustain: 1, release: duration * .15, gain: .29 }, duration * .85);
    sd(audio.fxBus, t, { s: "sawtooth", note: n + 24, ...glide(n, n + 24, duration), cutoff: 2400,
      attack: duration * .8, sustain: 1, release: duration * .2, gain: .09 }, duration * .8);
  }
  if (step % 2 === 0 || intensity > .6) {
    drum(t, "hh", "RolandTR909", { speed: .8 + intensity * .5, gain: .14 + intensity * .25 });
    drum(t, "sd", "RolandTR909", { speed: 1 + intensity * .3, gain: .06 + intensity * .09 });
  }
  if (intensity > .8) drum(t + clock.SPB * .5, "hh", "RolandTR909", { speed: 1.3, gain: .18 });
}

function rhythm(combo, position, songStep, t) {
  const b = position & 15, ch = CHORDS[(songStep >> 4) & 3];
  const peak = position >= 112, downbeat = position === 32 || position === 112;
  if (downbeat) impact(t, ch.root, peak);
  else if (b % 4 === 0) drum(t, "bd", "RolandTR909", { gain: .33 });
  if (b === 4 || b === 12) drum(t, "cp", "RolandTR909", { gain: .29 });
  if (b % 2 === 0) drum(t, b % 4 === 2 ? "oh" : "hh", "RolandTR909", { gain: b % 4 === 2 ? .22 : .18, release: .08 });
  if (peak && b % 2) drum(t, "hh", "RolandTR808", { gain: .11 });
  if (BASS[b] !== undefined) {
    const note = ch.root + BASS[b], hold = clock.SPB * (b === 0 || b === 8 ? 1.3 : .65);
    sd(audio.fxBus, t, { s: "sawtooth", note, cutoff: peak ? 1100 : 750, resonance: 1.4, sustain: 1, release: .075, gain: .36 }, hold);
    sd(audio.fxBus, t, { s: "sine", note: note - 12, sustain: 1, release: .09, gain: .47 }, hold);
  }
  if (b === 2 || b === 10) for (const n of ch.n)
    sd(b === 2 ? audio.fxRight : audio.fxLeft, t, { s: "sine", note: n + 12, fmi: 1.6, sustain: 1, release: .12, gain: .07 }, clock.SPB * .45);
  if (position === 32 || position === 112) for (const side of [0, 1]) {
    const note = ch.n[side] + (combo.id === "main" ? 12 : 0);
    sd(side ? audio.fxRight : audio.fxLeft, t + clock.SPB * (side ? 2 : 0), { s: "sawtooth", note, vowel: side ? "a" : "o",
      ...glide(note - 3.4, note, .07), vib: 5.2, vibmod: .25, sustain: 1, release: .13, gain: .24 }, clock.SPB);
    cues.push({ side, t: t + clock.SPB * (side ? 2 : 0), strength: 1 });
  }
  if ((position >= 92 && position < 96 || position >= 156) && b % 2 === 0) {
    drum(t, "sd", "RolandTR909", { gain: .25 });
    drum(t, "mt", "RolandTR808", { speed: 1 + (12 - b) * .08, gain: .36 });
  }
}

export function scheduleBonusMusic(combo, position, songStep, t) {
  if (boot) {
    if (speech.due) speak(combo, t);
    return scheduleBoot(position, songStep, t);
  }
  const section = sectionAt(position), b = position & 15;
  const pumping = ["drop", "groove", "peak", "finale"].includes(section.id);
  audio.bandGain.gain.setTargetAtTime(section.band * (pumping ? [.52, .76, .94, 1][b % 4] : 1), t, .018);
  audio.bandFilter.frequency.setTargetAtTime(section.cutoff, t, .06);
  if (section.id === "build" || section.id === "lift") build(position, songStep, t);
  if (speech.due) speak(combo, t);
  if (pumping) rhythm(combo, position, songStep, t);
  hookGrain(combo, position, t);
  for (const side of [0, 1]) {
    const note = guestNote(combo, side, position, songStep);
    if (!note) continue;
    const out = side ? audio.fxRight : audio.fxLeft;
    const play = INSTRUMENTS[combo.guests[side]];
    play(out, t, note);
    if (note.harmony !== null) play(out, t, { ...note, midi: note.harmony, velocity: note.velocity * .4, accent: false });
    cues.push({ side, t, strength: note.velocity });
  }
  cues.sort((a, b) => a.t - b.t);
}
