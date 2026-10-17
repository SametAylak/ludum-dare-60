// Look-ahead sequencer, play/pause and tempo.
import { audio, ensureAudio } from "./audio/engine.js";
import { loadSamples, scheduleBonusMusic } from "./bonus/music.js";
import { resetShow } from "./bonus/show.js";
import { app, bpmEl, bpmIn, playBtn } from "./dom.js";
import { BPM_MAX, BPM_MIN, clock, LOOP } from "./music.js";
import { byId } from "./parts/index.js";
import { syncRec } from "./recorder.js";
import { liveCombos, slots, state } from "./state.js";

// Step events for the visuals, in audio-clock order.
export const sq = [];
export const vq = [];
export function resetTransport() {
  resetShow();
  state.step = 0; state.nextTime = audio.ctx.currentTime + .06; state.curStep = -1;
  sq.length = 0; vq.length = 0;
  slots.forEach(s => { s.start = 0; });
}
function tick() {
  if (!audio.ctx || !state.running || audio.ctx.state !== "running") return;
  while (state.nextTime < audio.ctx.currentTime + .12) {
    scheduleStep(state.step, state.nextTime);
    state.nextTime += clock.SPB; state.step++;
  }
}
function scheduleStep(n, t) {
  const s = n % LOOP;
  sq.push({ n, t });
  const bonus = state.bonusMus;
  if (bonus && n >= bonus.start && n < bonus.to && liveCombos.has(bonus.c.id))
    scheduleBonusMusic(bonus.c, n - bonus.start, s, t);
  for (const sl of slots) {
    if (!sl.id || n < sl.start || !sl.g) continue;
    const uid = sl.uid, i = sl.i;
    byId[sl.id].play(s, t, sl.g, (tt, kinds, dur) => vq.push({ t: tt, i, uid, kinds, dur }));
  }
}
export function setRunning(on) {
  ensureAudio();
  loadSamples();
  state.running = on;
  if (on) {
    audio.ctx.resume();
    if (!state.transportOn) { state.transportOn = true; resetTransport(); }
  } else audio.ctx.suspend();
  syncRec(on);
  playBtn.classList.toggle("on", on);
  playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
  app.classList.toggle("live", on);
}
export function setBpm(v) {
  clock.BPM = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v))); clock.SPB = 60 / clock.BPM / 4;
  if (audio.delay) audio.delay.delayTime.setTargetAtTime(clock.SPB * 3, audio.ctx.currentTime, .05);
  bpmEl.textContent = clock.BPM;
  if (+bpmIn.value !== clock.BPM) bpmIn.value = clock.BPM;
  // overclock heat: CSS reads --oc for intensity, --spd for spinning parts, oc1-3 for tiers
  app.style.setProperty("--oc", Math.max(0, Math.min(1, (clock.BPM - 125) / 50)).toFixed(3));
  app.style.setProperty("--spd", (110 / clock.BPM).toFixed(3));
  app.classList.toggle("oc1", clock.BPM >= 130);
  app.classList.toggle("oc2", clock.BPM >= 150);
  app.classList.toggle("oc3", clock.BPM >= 165);
}
export function initTransport() {
  setInterval(tick, 25);
}
