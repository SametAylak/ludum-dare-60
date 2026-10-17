// The AudioContext and master bus, built on first use.
import { applyGains, makeNodes, masterGain } from "../mixer.js";
import { clock } from "../music.js";
import { slots } from "../state.js";

export const audio = { ctx: null, master: null, analyser: null, delayIn: null, delay: null,
  bandFilter: null, bandGain: null, fxBus: null, fxLeft: null, fxRight: null };
export function ensureAudio() {
  if (audio.ctx) return;
  audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = audio.ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = .004; comp.release.value = .2;
  audio.master = audio.ctx.createGain(); audio.master.gain.value = masterGain();
  audio.bandFilter = audio.ctx.createBiquadFilter(); audio.bandFilter.type = "lowpass"; audio.bandFilter.frequency.value = 20000; audio.bandFilter.Q.value = .5;
  audio.bandGain = audio.ctx.createGain(); audio.bandFilter.connect(audio.bandGain); audio.bandGain.connect(audio.master);
  audio.analyser = audio.ctx.createAnalyser(); audio.analyser.fftSize = 2048;
  // Leave ordinary samples unchanged and round off peaks when seven parts hit with the guests.
  const shaperInput = audio.ctx.createGain(); shaperInput.gain.value = .5;
  const ceiling = audio.ctx.createWaveShaper(), curve = new Float32Array(8193);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1) * 2 - 1) * 2, a = Math.abs(x);
    curve[i] = a <= .85 ? x : Math.sign(x) * (.85 + .12 * Math.tanh((a - .85) / .12));
  }
  ceiling.curve = curve; ceiling.oversample = "4x";
  // Oversampling can overshoot the curve, so keep headroom after its reconstruction filter.
  const output = audio.ctx.createGain(); output.gain.value = .88;
  audio.master.connect(comp); comp.connect(shaperInput); shaperInput.connect(ceiling);
  ceiling.connect(output); output.connect(audio.analyser); audio.analyser.connect(audio.ctx.destination);
  audio.delayIn = audio.ctx.createGain();
  audio.delay = audio.ctx.createDelay(2); audio.delay.delayTime.value = clock.SPB * 3;
  const fb = audio.ctx.createGain(); fb.gain.value = .33;
  const dlp = audio.ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 2600;
  const wet = audio.ctx.createGain(); wet.gain.value = .55;
  audio.delayIn.connect(audio.delay); audio.delay.connect(dlp); dlp.connect(fb); fb.connect(audio.delay); dlp.connect(wet); wet.connect(audio.master);
  audio.fxBus = audio.ctx.createGain(); audio.fxBus.connect(audio.master);
  audio.fxLeft = audio.ctx.createStereoPanner(); audio.fxLeft.pan.value = -.55; audio.fxLeft.connect(audio.fxBus);
  audio.fxRight = audio.ctx.createStereoPanner(); audio.fxRight.pan.value = .55; audio.fxRight.connect(audio.fxBus);
  const fxHighpass = audio.ctx.createBiquadFilter(); fxHighpass.type = "highpass"; fxHighpass.frequency.value = 700;
  const fs = audio.ctx.createGain(); fs.gain.value = .18;
  audio.fxBus.connect(fxHighpass); fxHighpass.connect(fs); fs.connect(audio.delayIn);
  slots.forEach(s => { if (s.id) makeNodes(s); });
  applyGains();
}
