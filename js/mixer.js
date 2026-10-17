// Per-part gain nodes, mute/solo and volume (master and per part).
import { audio } from "./audio/engine.js";
import { muteAll, volIn } from "./dom.js";
import { byId } from "./parts/index.js";
import { slots } from "./state.js";
import { fillRange } from "./util.js";

// Volumes are 0-100 (master) and 0-125 (each part, remembered per part); squared for a natural-feeling taper.
let masterVol = 80;
let masterMuted = false;
const partVol = {};
try {
  const v = JSON.parse(localStorage.getItem("beigebox.vol") || "{}");
  if (typeof v.master === "number") masterVol = v.master;
  Object.assign(partVol, v.parts || {});
} catch (e) {}
const saveVol = () => { try { localStorage.setItem("beigebox.vol", JSON.stringify({ master: masterVol, parts: partVol })); } catch (e) {} };
export const volOf = id => partVol[id] ?? 100;
export const masterGain = () => masterMuted ? 0 : (masterVol / 100) ** 2 * 1.25;
export function makeNodes(sl) {
  const p = byId[sl.id];
  sl.g = audio.ctx.createGain(); sl.g.gain.value = 0; sl.g.connect(audio.master);
  if (p.send) { sl.s = audio.ctx.createGain(); sl.s.gain.value = p.send; sl.g.connect(sl.s); sl.s.connect(audio.delayIn); }
}
export function dropNodes(sl) {
  if (!sl.g) return;
  const g = sl.g, s = sl.s;
  g.gain.setTargetAtTime(0, audio.ctx.currentTime, .03);
  setTimeout(() => { g.disconnect(); if (s) s.disconnect(); }, 600);
  sl.g = sl.s = null;
}
export function applyGains() {
  const anySolo = slots.some(s => s.id && s.solo);
  for (const sl of slots) {
    sl.audible = !!sl.id && !sl.muted && (!anySolo || sl.solo) && volOf(sl.id) > 0;
    if (sl.g) sl.g.gain.setTargetAtTime(sl.audible ? byId[sl.id].gain * (volOf(sl.id) / 100) ** 2 : 0, audio.ctx.currentTime, .015);
    sl.el.classList.toggle("silent", !!sl.id && volOf(sl.id) === 0);
    sl.el.classList.toggle("muted", !!sl.id && sl.muted);
    sl.el.classList.toggle("dim", !!sl.id && !sl.muted && anySolo && !sl.solo);
    sl.el.classList.toggle("solo", !!sl.id && sl.solo);
    sl.muteBtn.setAttribute("aria-pressed", sl.muted);
    sl.soloBtn.setAttribute("aria-pressed", sl.solo);
  }
}
function setMaster(v, muted = masterMuted) {
  masterVol = Math.max(0, Math.min(100, Math.round(v))); masterMuted = muted;
  volIn.value = masterVol; fillRange(volIn);
  muteAll.setAttribute("aria-pressed", masterMuted);
  if (audio.master) audio.master.gain.setTargetAtTime(masterGain(), audio.ctx.currentTime, .02);
}
export function setPartVol(id, v) {
  partVol[id] = v;
  applyGains(); saveVol();
}
export const toggleMasterMute = () => setMaster(masterVol, !masterMuted);
export function initMixer() {
  volIn.addEventListener("input", () => { setMaster(+volIn.value, false); saveVol(); });
  muteAll.addEventListener("click", toggleMasterMute);
  setMaster(masterVol);
}
