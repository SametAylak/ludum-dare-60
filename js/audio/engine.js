// The AudioContext and master bus, built on first use.
import { applyGains, makeNodes, masterGain } from "../mixer.js";
import { clock } from "../music.js";
import { slots } from "../state.js";

export const audio = { ctx: null, master: null, analyser: null, delayIn: null, delay: null, fxBus: null };
export function ensureAudio() {
  if (audio.ctx) return;
  audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = audio.ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = .004; comp.release.value = .2;
  audio.master = audio.ctx.createGain(); audio.master.gain.value = masterGain();
  audio.analyser = audio.ctx.createAnalyser(); audio.analyser.fftSize = 2048;
  audio.master.connect(comp); comp.connect(audio.analyser); audio.analyser.connect(audio.ctx.destination);
  audio.delayIn = audio.ctx.createGain();
  audio.delay = audio.ctx.createDelay(2); audio.delay.delayTime.value = clock.SPB * 3;
  const fb = audio.ctx.createGain(); fb.gain.value = .33;
  const dlp = audio.ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 2600;
  const wet = audio.ctx.createGain(); wet.gain.value = .55;
  audio.delayIn.connect(audio.delay); audio.delay.connect(dlp); dlp.connect(fb); fb.connect(audio.delay); dlp.connect(wet); wet.connect(audio.master);
  audio.fxBus = audio.ctx.createGain(); audio.fxBus.connect(audio.master);
  const fs = audio.ctx.createGain(); fs.gain.value = .6; audio.fxBus.connect(fs); fs.connect(audio.delayIn);
  slots.forEach(s => { if (s.id) makeNodes(s); });
  applyGains();
}
