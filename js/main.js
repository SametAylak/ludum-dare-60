// Entry point: wires the modules together and runs the frame loop.

import { slots, state, sq, vq, nextUid } from "./state.js";
import { byId } from "./parts/index.js";
import { startClock, setTurbo, audioTime } from "./audio/engine.js";
import { checkCombos } from "./combos.js";
import { initStage, renderSlot, refresh, fire, updateSlotStates } from "./ui/stage.js";
import { initDeck } from "./ui/deck.js";
import { initHeader, setBar } from "./ui/header.js";
import { initScreen, drawScope, updateTerm } from "./ui/screen.js";

initStage(document.getElementById("shelf"));
initDeck(document.getElementById("deck"));
initHeader();
initScreen(document.getElementById("scope"), document.getElementById("term"));
startClock();

function onStep(n) {
  setBar((n >> 4) & 3);
  if (n % 16 === 0) checkCombos();
}

// Releases audio steps and visual hits once the AudioContext clock reaches them.
function frame() {
  requestAnimationFrame(frame);
  if (state.running) {
    const now = audioTime();
    while (sq.length && sq[0].t <= now) { const e = sq.shift(); if (e.n !== state.curStep) { state.curStep = e.n; onStep(e.n); } }
    for (let k = vq.length - 1; k >= 0; k--) if (vq[k].t <= now) fire(vq.splice(k, 1)[0]);
  }
  updateSlotStates();
  drawScope();
  updateTerm();
}

// Optional hot-reload hook from the host page: keep the lineup across reloads.
const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(() => ({ slots: slots.map(s => s.id ? { id: s.id, muted: s.muted, solo: s.solo } : null), turbo: state.turbo }));

function start(data) {
  const saved = data && data.slots;
  if (data && data.turbo) setTurbo(true);
  if (saved) saved.forEach((d, i) => { if (d && byId[d.id] && slots[i]) Object.assign(slots[i], { id: d.id, muted: !!d.muted, solo: !!d.solo, uid: nextUid() }); });
  else [["hdd", 3], ["dot", 2], ["floppy", 4]].forEach(([id, i]) => Object.assign(slots[i], { id, uid: nextUid() }));  // demo lineup
  slots.forEach(s => renderSlot(s));
  refresh();
  requestAnimationFrame(frame);
}
if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
