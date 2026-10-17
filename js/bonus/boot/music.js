// Boot Sequence's show: robot house on its own bus, with a sampled kit, chord stabs, a talk box and an acid peak.
import { audio } from "../../audio/engine.js";
import { createBonusBus } from "../../audio/bonus-bus.js";
import { robot } from "../../audio/robot.js";
import { sample } from "../../audio/samples.js";
import { fm, noise, tone } from "../../audio/synth.js";
import { CHORDS, clock, mtof } from "../../music.js";
import { eventsAt, SCORE } from "./patterns.js";
import { eventsFor, guestNotes, hasBeat, isPeak, sectionAt, stemLevel, VOICINGS } from "./score.js";
import { acid, GUESTS, pad, talkbox } from "./voices.js";

const GUEST_IDS = ["telegraph", "radio"];
const cues = [];
const lastHits = [{ t: -Infinity, strength: 0 }, { t: -Infinity, strength: 0 }];
let bus = null, lastAcid = null;

export function startBoot() {
  bus?.stop(audio.ctx.currentTime);
  bus = createBonusBus(audio.ctx, audio.master);
  // The show fades in over its first bar instead of starting at full level.
  bus.output.gain.setValueAtTime(0, audio.ctx.currentTime);
  cues.length = 0;
  lastHits.forEach(hit => { hit.t = -Infinity; hit.strength = 0; });
}

export function stopBoot(t) {
  cues.length = 0;
  bus?.stop(t); bus = null;
}

export function bootEnergy(now) {
  while (cues.length && cues[0].t <= now) {
    const cue = cues.shift();
    lastHits[cue.side] = cue;
  }
  return lastHits.map(hit => hit.strength * Math.exp(-Math.max(0, now - hit.t) / .16));
}

// Recorded drums, with a short synth sub under the kick for weight. Synths stand in until the samples load.
function kick(t, v) {
  if (sample(bus.drums, t, "kick", { vol: v * 1.05 })) return tone(bus.drums, t, { f: 62, f2: 44, glide: .09, vol: .4 * v, r: .22 });
  tone(bus.drums, t, { f: 168, f2: 46, glide: .075, vol: .9 * v, a: .001, hold: .03, r: .36 });
  tone(bus.drums, t, { type: "triangle", f: 1900, f2: 500, glide: .012, vol: .15 * v, r: .02 });
  noise(bus.drums, t, { type: "highpass", f: 3500, vol: .09 * v, r: .012 });
}

function snare(t, volume) {
  if (sample(bus.drums, t, "snare", { vol: volume * 3, lp: 8000 })) {
    sample(bus.drums, t + .004, "clap", { vol: volume * 1.4, lp: 7000 });
    return noise(bus.music, t, { f: 1900, Q: .45, vol: volume * .4, a: .004, hold: clock.SPB * 1.5, r: .04 });
  }
  tone(bus.drums, t, { type: "triangle", f: 215, f2: 165, glide: .04, vol: volume * 1.3, r: .09 });
  noise(bus.drums, t, { f: 2600, Q: .5, vol: volume * 1.1, r: .16 });
  noise(bus.drums, t, { type: "highpass", f: 6200, vol: volume * .55, r: .1 });
  // A gated room: the reverb tail is cut after a beat and a half.
  noise(bus.music, t, { f: 1900, Q: .45, vol: volume * .55, a: .004, hold: clock.SPB * 1.5, r: .04 });
}

function crash(t, volume) {
  if (sample(bus.drums, t, "crash", { vol: volume * 1.5, lp: 9000 })) return;
  noise(bus.drums, t, { type: "highpass", f: 5600, f2: 3800, vol: volume, r: clock.SPB * 14 });
  noise(bus.music, t, { f: 8500, Q: .4, vol: volume * .6, r: clock.SPB * 8 });
}

const voicingAt = songStep => VOICINGS[(songStep >> 4) & 3];

function impact(t, root, peak) {
  kick(t, peak ? 1.05 : .95);
  crash(t, peak ? .13 : .1);
  tone(bus.drums, t, { f: mtof(root), f2: mtof(root - 12), glide: .2, vol: .14, r: .4 });
  noise(bus.music, t, { type: "lowpass", f: 900, f2: 120, vol: .08, r: clock.SPB * 6 });
  sample(bus.music, t, "impact", { vol: .5 });
}

// A steady kick under the closing filter; the last bar pulls in a reversed cymbal and a rising saw that cut off right
// before the drop.
function build(position, section, t, root) {
  const rise = (position - section.start) / (section.end - section.start);
  if ((position & 3) === 0) kick(t, .35 + rise * .3);
  if (position === section.end - 14) {
    const rest = clock.SPB * 13.6;
    if (!sample(bus.drums, t, "crash", { vol: .2, dur: rest, reverse: true, lp: 7000 }))
      noise(bus.drums, t, { type: "highpass", f: 2500, f2: 9000, vol: .04, a: rest, r: .02 });
    tone(bus.music, t, { type: "sawtooth", f: mtof(root + 12), f2: mtof(root + 36), glide: rest,
      vol: .035, a: rest, r: .02, lp: 4000 });
  }
}

function rhythm(position, songStep, section, t) {
  const ch = CHORDS[(songStep >> 4) & 3], peak = isPeak(section);
  const downbeat = position === section.start && section.id === "drop" || position === 224;
  if (downbeat) impact(t, ch.root, peak);
  for (const event of eventsFor(position, songStep)) {
    if (event.layer !== "drum") continue;
    const at = t + event.offset * clock.SPB;
    if (event.value === "bd" && !downbeat) kick(at, .72);
    if (event.value === "sd") snare(at, .095);
    if (event.value === "hh") {
      const open = Math.round(position + event.offset) % 4 === 2;
      if (!sample(bus.drums, at, open ? "open" : "hat", { vol: (open ? .085 : .05) * (peak ? 1.25 : 1), lp: 9000,
        dur: open ? clock.SPB * 1.8 : undefined }))
        noise(bus.drums, at, { type: "highpass", f: 7600, vol: (open ? .062 : .032) * (peak ? 1.15 : 1), r: open ? .1 : .025 });
    }
  }
}

// A pad on every bar, and a saw arpeggio that fills in until the riff arrives, then gets out of its way.
function harmony(position, songStep, section, t) {
  const b = position & 15, notes = voicingAt(songStep), peak = isPeak(section);
  const building = section.id === "build" || section.id === "lift";
  const arp = !["outro", "groove", "peak", "finale", "break"].includes(section.id) && !stemLevel("riff", section, position);
  if (position === 1) pad(bus, notes, t, clock.SPB * 15, .5, false);
  if (b === 0) pad(bus, notes, t, clock.SPB * Math.min(16, section.end - position), section.id === "arrival" ? .5 : .9, peak);
  for (const event of eventsFor(position, songStep)) {
    if (event.layer !== "arp" || !arp) continue;
    if ((section.id === "arrival" || building && position < 32) && b % 4) continue;
    const at = t + event.offset * clock.SPB, out = b % 4 ? bus.right : bus.left;
    const intensity = building ? .4 + .6 * (position - section.start) / (section.end - section.start) : .75;
    tone(out, at, { type: "sawtooth", f: mtof(notes[event.value] + 12), vol: .026 * intensity, a: .006, r: clock.SPB * 1.4, lp: 2100 });
  }
  if (peak && (b === 6 || b === 14)) fm(b === 6 ? bus.right : bus.left, t, {
    f: mtof(notes[b === 6 ? 3 : 1] + 24), ratio: 1, index: .6, vol: .025, a: .01, r: clock.SPB * 2.5 });
}

// The surprise before the last chorus: the machine loses power. The band drops two octaves and dies, then whines back
// up into the peak. Returns true when it plays through the breath.
function powerCut(position, songStep, t) {
  const ch = CHORDS[(songStep >> 4) & 3];
  if (position === 214) {
    sample(bus.music, t, "spin", { vol: .7 });
    for (const midi of [ch.root, ...ch.n]) tone(midi === ch.root ? bus.bass : bus.music, t, { type: "sawtooth",
      f: mtof(midi), f2: mtof(midi - 24), glide: clock.SPB * 7, vol: .05, hold: clock.SPB * 6, r: .06, lp: 1800 });
  }
  if (position !== 222) return false;
  tone(bus.drums, t, { f: 70, f2: 2400, glide: clock.SPB * 2, vol: .07, a: clock.SPB * 1.9, r: .02 });
  tone(bus.drums, t, { type: "square", f: 35, f2: 1200, glide: clock.SPB * 2, vol: .02, a: clock.SPB * 1.9, r: .02, lp: 3000 });
  return true;
}

// The filter on the show's music closes for each build and opens fully on the drop.
function sweepAt(section, position) {
  const rise = (position - section.start) / (section.end - section.start);
  if (section.id === "build" || section.id === "lift") return 650 * Math.pow(12, rise);
  // The outro closes the show's filter as it fades, so it drifts away instead of stopping.
  if (section.id === "outro") return 20000 * Math.pow(.06, rise);
  return { arrival: 4500, breath: 450, break: 2600 }[section.id] || 20000;
}

// French-house stabs: the chord chopped on every off-beat through a resonant lowpass that opens across the section.
function stabs(position, songStep, section, t, progress) {
  const open = { drop: [900, 2100], groove: [1600, 2400], lift: [500, 1500], peak: [2000, 4000], finale: [3000, 3000], outro: [3000, -2700] }[section.id];
  if (!open || (position & 3) !== 2) return;
  const lp = open[0] + open[1] * progress, accent = (position & 15) === 14 ? 1.3 : 1;
  for (const [i, midi] of voicingAt(songStep).entries()) for (const detune of [-9, 9]) tone(i % 2 ? bus.right : bus.left, t, {
    type: "sawtooth", f: mtof(midi - 12), detune, vol: .11 * accent, a: .004, hold: clock.SPB * .55, r: .07, lp, q: 5 });
}

// The second robot stutters the show's name on the chord root, bouncing between the speakers, while the lead rests.
function chops(position, songStep, section, t, ch) {
  const level = { groove: .8, lift: .45, peak: 1, finale: 1 }[section.id];
  if (!level) return;
  for (const event of eventsFor(position, songStep)) if (event.layer === "chop")
    robot(position & 2 ? bus.right : bus.left, t + event.offset * clock.SPB, { midi: ch.root + 24,
      word: SCORE.chopWords[section.id]?.[event.value] ?? event.value, vol: .11 * level, duration: clock.SPB * 1.3 });
}

// The talk box answers the robot in the chorus bars, and the acid line is held back as the peak's reveal.
function guitarAndAcid(position, songStep, section, t, ch, progress) {
  const talk = { drop: position >= 96 ? .8 : 0, lift: .5, peak: 1, finale: 1 }[section.id];
  const cutoff = { peak: 260 + 1500 * progress, finale: 900 + 900 * progress }[section.id];
  for (const event of eventsFor(position, songStep)) {
    const at = t + event.offset * clock.SPB;
    if (event.layer === "talk" && talk) talkbox(bus.lead, at, { midi: event.value, vol: .5 * talk, duration: clock.SPB * event.length });
    if (event.layer === "acid" && cutoff) {
      const midi = ch.root + event.value, slide = lastAcid?.step === position - 1 && lastAcid.midi !== midi ? lastAcid.midi : undefined;
      acid(bus.bass, at, { midi, slide, vol: .14, duration: clock.SPB, cutoff, accent: event.value === 12 });
      lastAcid = { midi, step: position };
    }
  }
}

export function scheduleBoot(position, songStep, t) {
  if (!bus) return;
  const section = sectionAt(position), pumping = hasBeat(section), ch = CHORDS[(songStep >> 4) & 3];
  const cut = section.id === "lift" && position >= 214;
  const progress = (position - section.start) / (section.end - section.start);
  const outro = section.id === "outro", breath = section.id === "breath";
  // The band eases down through the arrival and starts coming back in the finale's last bar, so the hand-offs at both
  // ends are gradual.
  const handoff = section.id === "finale" && position >= section.end - 16 ? (position - section.end + 16) / 16 : 0;
  const band = outro ? .55 + .45 * progress : section.id === "arrival" ? 1 - (1 - section.band) * progress
    : cut ? .02 : section.band + (.55 - section.band) * handoff;
  const glide = pumping && !handoff ? .025 : breath ? .06 : .3;
  // The drop leaves headroom so the groove and the peak can still grow.
  const level = { drop: .68, groove: .78, peak: .95, finale: .95 }[section.id] || .9;
  const tricked = breath && position >= 222 && powerCut(position, songStep, t);
  let kickAge = 4;
  if (pumping) for (let age = 0; age < 4; age++) {
    if (eventsAt((songStep - age + 64) % 64).some(event => event.layer === "drum" && event.value === "bd")) { kickAge = age; break; }
  }
  audio.bandGain.gain.setTargetAtTime(band * (pumping && !handoff ? [.6, .82, .96, 1, 1][kickAge] : 1), t, glide);
  audio.bandFilter.frequency.setTargetAtTime(section.cutoff, t, breath ? .08 : .35);
  const fadeIn = section.id === "arrival" ? Math.min(1, (position + 1) / 12) : 1;
  bus.output.gain.setTargetAtTime(breath && !tricked ? .015 : outro ? .9 * (1 - progress) ** 1.5 : level * fadeIn, t, .018);
  bus.duck.gain.setTargetAtTime(pumping ? [.42, .7, .91, 1, 1][kickAge] : 1, t, .018);
  bus.bass.gain.setTargetAtTime(pumping ? [.55, .85, 1, 1, 1][kickAge] : 1, t, .012);
  bus.sweep.frequency.setTargetAtTime(sweepAt(section, position), t, position === section.start ? .01 : .03);
  bus.delays.forEach(delay => delay.delayTime.setTargetAtTime(clock.SPB * 3, t, .045));
  if (breath) return;
  // A reversed cymbal swells into the outro in place of a final hit.
  if (section.id === "finale" && position === section.end - 14) {
    const rest = clock.SPB * 13.6;
    if (!sample(bus.drums, t, "crash", { vol: .12, dur: rest, reverse: true, lp: 6000 }))
      noise(bus.drums, t, { type: "highpass", f: 2500, f2: 7000, vol: .03, a: rest, r: .02 });
  }
  // The show signs off with one last hit and a chord that rings out under the band, and the groove winds down under
  // the fade rather than stopping on the outro's first beat.
  if (outro) {
    if (position === section.start) {
      crash(t, .07);
      pad(bus, voicingAt(songStep), t, clock.SPB * 30, 1.1, true);
    }
    if ((position & 3) === 0 && progress < .75) kick(t, .8 * (1 - progress));
    stabs(position, songStep, section, t, progress);
    return;
  }
  powerCut(position, songStep, t);
  if (cut) return;
  if (section.id === "build" || section.id === "lift") build(position, section, t, ch.root);
  if (pumping) rhythm(position, songStep, section, t);
  harmony(position, songStep, section, t);
  stabs(position, songStep, section, t, progress);
  chops(position, songStep, section, t, ch);
  guitarAndAcid(position, songStep, section, t, ch, progress);
  for (const guest of guestNotes(position, songStep)) {
    const at = t + guest.offset * clock.SPB;
    GUESTS[GUEST_IDS[guest.side]](guest.side ? bus.right : bus.left, at, guest);
    cues.push({ side: guest.side, t: at, strength: guest.velocity * (guest.role === "riff" ? 1.1 : 1.6) });
  }
  cues.sort((a, b) => a.t - b.t);
}
