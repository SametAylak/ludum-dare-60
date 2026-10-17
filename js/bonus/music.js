// The guests take over for a build, a drop, a breakdown and a bigger second drop.
import { audio, loadSample } from "../audio/engine.js";
import { fm, kick, noise, pulseWave, tone, voice } from "../audio/synth.js";
import { CHORDS, clock, mtof } from "../music.js";
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
const hook = { url: new URL("../../audio/needed-you-hook.wav", import.meta.url), buffer: null, loading: null, out: null, on: false };
// "speech": a spoken transmission comes in with the show and talks over the intro.
const SPEECH_GAIN = .8;
const speech = { url: new URL("../../audio/extreme-radiation.wav", import.meta.url), buffer: null, loading: null, src: null, due: false };

export function loadSamples() {
  for (const [name, sample] of [["hook", hook], ["speech", speech]])
    if (COMBOS.some(c => c.sample === name)) loadSample(sample);
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
    const f = mtof(note.midi), hold = clock.SPB * note.length;
    tone(d, t, { wave: pulseWave(.25), f, vol: .14 * note.velocity, hold, r: .045, lp: 3600 });
    fm(d, t, { f: f * 2, ratio: 2, index: .7, vol: .035 * note.velocity, r: .11 });
    noise(d, t, { f: 2600, Q: 3, vol: .025 * note.velocity, r: .014 });
  },
  gramophone(d, t, note) {
    const f = mtof(note.midi), hold = clock.SPB * note.length;
    for (const detune of [-8, 8]) tone(d, t, { type: "sawtooth", f: f * .97, f2: f, glide: .035,
      detune, vol: .11 * note.velocity, a: .012, hold, r: .12, lp: 2100, q: 1.8 });
    tone(d, t, { type: "triangle", f: f * 2, vol: .06 * note.velocity, hold: hold * .65, r: .13 });
    if (note.accent) noise(d, t, { f: 4200, vol: .035, r: .06 });
  },
  radio(d, t, note) {
    voice(d, t, { f: mtof(note.midi), vowel: note.accent ? "a" : "o", vol: .2 * note.velocity,
      a: .015, hold: clock.SPB * note.length, r: .1, scoop: note.accent ? .82 : 1.08, vib: .009 });
    fm(d, t, { f: mtof(note.midi + 12), ratio: 1, index: 1.5, vol: .035 * note.velocity, r: .22 });
  },
  phone(d, t, note) {
    const f = mtof(note.midi);
    fm(d, t, { f, ratio: 1, index: 3.5, vol: .22 * note.velocity, hold: clock.SPB * note.length * .4, r: .22 });
    tone(d, t, { type: "triangle", f: f / 2, vol: .065 * note.velocity, hold: clock.SPB * .4, r: .13 });
    fm(d, t + clock.SPB * .75, { f, ratio: 1, index: 1.6, vol: .04 * note.velocity, r: .17 });
  },
};

function clap(t, volume) {
  for (const offset of [0, .012, .024]) noise(audio.fxBus, t + offset, { f: 1550, Q: .7, vol: volume, r: offset ? .065 : .025 });
  noise(audio.fxBus, t, { type: "highpass", f: 5200, vol: volume * .4, r: .1 });
}

function impact(t, root, peak) {
  kick(audio.fxBus, t, peak ? .66 : .6);
  noise(audio.fxBus, t, { type: "highpass", f: 6100, f2: 1800, vol: .14, r: clock.SPB * 5 });
  tone(audio.fxBus, t, { f: mtof(root + 12), f2: mtof(root - 12), glide: .22, vol: .22, r: .38 });
}

function build(position, songStep, t) {
  const step = position & 15, ch = CHORDS[(songStep >> 4) & 3];
  const intensity = position >= 108 ? .8 + (position - 108) * .05 : (position - 16) / 16;
  if (position === 16 || position === 108) {
    const duration = clock.SPB * (position === 16 ? 13 : 3.5);
    noise(audio.fxBus, t, { f: 650, f2: 6500, Q: .6, vol: .12, a: duration * .85, r: duration * .15 });
    tone(audio.fxBus, t, { type: "sawtooth", f: mtof(ch.n[0]), f2: mtof(ch.n[0] + 24),
      glide: duration, vol: .035, a: duration * .8, r: duration * .2, lp: 2400 });
  }
  if (step % 2 === 0 || intensity > .6) {
    noise(audio.fxBus, t, { f: 1600 + intensity * 1800, vol: .035 + intensity * .06, r: .055 });
    tone(audio.fxBus, t, { type: "triangle", f: 190 + intensity * 160, vol: .04, r: .045 });
  }
  if (intensity > .8) noise(audio.fxBus, t + clock.SPB * .5, { f: 3800, vol: .04, r: .025 });
}

function rhythm(combo, position, songStep, t) {
  const b = position & 15, ch = CHORDS[(songStep >> 4) & 3];
  const peak = position >= 112, downbeat = position === 32 || position === 112;
  if (downbeat) impact(t, ch.root, peak);
  else if (b % 4 === 0) kick(audio.fxBus, t, .46);
  if (b === 4 || b === 12) clap(t, .07);
  if (b % 2 === 0) noise(audio.fxBus, t, { type: "highpass", f: 7300, vol: b % 4 === 2 ? .075 : .035, r: b % 4 === 2 ? .1 : .025 });
  if (peak && b % 2) noise(audio.fxBus, t, { type: "highpass", f: 8500, vol: .024, r: .018 });
  if (BASS[b] !== undefined) {
    const f = mtof(ch.root + BASS[b]), hold = clock.SPB * (b === 0 || b === 8 ? 1.3 : .65);
    tone(audio.fxBus, t, { type: "sawtooth", f, vol: .15, hold, r: .075, lp: peak ? 1100 : 750, q: 1.4 });
    tone(audio.fxBus, t, { f: f / 2, vol: .2, hold, r: .09 });
  }
  if (b === 2 || b === 10) for (const n of ch.n) {
    const d = b === 2 ? audio.fxRight : audio.fxLeft;
    fm(d, t, { f: mtof(n + 12), ratio: 1, index: 1.6, vol: .032, hold: clock.SPB * .45, r: .12 });
  }
  if (position === 32 || position === 112) for (const side of [0, 1]) {
    voice(side ? audio.fxRight : audio.fxLeft, t + clock.SPB * (side ? 2 : 0), {
      f: mtof(ch.n[side] + (combo.id === "main" ? 12 : 0)), vowel: side ? "a" : "o", vol: .1,
      hold: clock.SPB, r: .13, scoop: .8, vib: .015 });
    cues.push({ side, t: t + clock.SPB * (side ? 2 : 0), strength: 1 });
  }
  if ((position >= 92 && position < 96 || position >= 156) && b % 2 === 0) {
    noise(audio.fxBus, t, { f: 2100, vol: .075, r: .07 });
    tone(audio.fxBus, t, { f: 180 - (b - 12) * 20, f2: 65, glide: .08, vol: .12, r: .1 });
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
