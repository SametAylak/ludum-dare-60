// Entry point: wires the modules together and runs the frame loop.
import { audio } from "./audio/engine.js";
import { loadSamples } from "./bonus/music.js";
import { applyGains, initMixer } from "./mixer.js";
import { clock } from "./music.js";
import { byId } from "./parts/index.js";
import { initRecorder, updateRec } from "./recorder.js";
import { slots, state } from "./state.js";
import { initTransport, setBpm, sq, vq } from "./transport.js";
import { initCounter } from "./ui/counter.js";
import { initDeck, updateKeys } from "./ui/deck.js";
import { initGaze } from "./ui/gaze.js";
import { initHeader } from "./ui/header.js";
import { initHud, updateHud } from "./ui/hud.js";
import { initOnboard, updateOnboard } from "./ui/onboard.js";
import { fire, onStep, updateSlotStates } from "./ui/performers.js";
import { initStage, renderSlot } from "./ui/stage.js";
import { drawViz, initViz } from "./ui/visualizer.js";

initStage();
initDeck();
initHeader();
initCounter();
initMixer();
initHud();
initViz();
initTransport();
initGaze();
initRecorder();
loadSamples();
initOnboard();

function frame() {
  requestAnimationFrame(frame);
  if (audio.ctx && state.running) {
    const now = audio.ctx.currentTime;
    while (sq.length && sq[0].t <= now) { const e = sq.shift(); if (e.n !== state.curStep) { state.curStep = e.n; state.curT = e.t; onStep(e.n); } }
    for (let k = vq.length - 1; k >= 0; k--) if (vq[k].t <= now) fire(vq.splice(k, 1)[0]);
  }
  updateSlotStates();
  drawViz();
  updateHud();
  updateRec();
  updateOnboard();
}

const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(() => ({ slots: slots.map(s => s.id ? { id: s.id, muted: s.muted, solo: s.solo } : null), bpm: clock.BPM }));
function start(data) {
  const saved = data && data.slots;
  setBpm((data && data.bpm) || (data && data.turbo ? 128 : 110));
  if (saved) saved.forEach((d, i) => { if (d && byId[d.id] && slots[i]) Object.assign(slots[i], { id: d.id, muted: !!d.muted, solo: !!d.solo, uid: ++state.uidN }); });
  else [["hdd", 3], ["dot", 2], ["floppy", 4]].forEach(([id, i]) => Object.assign(slots[i], { id, uid: ++state.uidN }));
  slots.forEach(s => renderSlot(s));
  applyGains(); updateKeys();
  requestAnimationFrame(frame);
}
if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
