// The seven slots on stage: rendering, placing, removing and clicking performers.
import { ensureAudio } from "../audio/engine.js";
import { applyGains, dropNodes, makeNodes, setPartVol, volOf } from "../mixer.js";
import { artSvg, emptySvg } from "../parts/art.js";
import { byId, CATS, PARTS } from "../parts/index.js";
import { FILL_ORDER, slots, state } from "../state.js";
import { resetTransport, setRunning } from "../transport.js";
import { updateKeys } from "./deck.js";
import { clearEnter, enter } from "./entrance.js";
import { aim } from "./gaze.js";
import { $, fillRange, reduce } from "../util.js";

export const shelf = $("#shelf");
export function initStage() {
  slots.forEach(sl => {
    const el = document.createElement("div");
    el.className = "slot"; el.dataset.i = sl.i;
    el.innerHTML = `<div class="char" tabindex="0" role="button"><div class="art-wrap"></div><div class="oc" aria-hidden="true"><i></i><i></i><i></i><b></b><s></s><s></s></div><div class="boot"><i></i></div></div>
      <div class="tools">
        <label class="pvol" title="Part volume"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z"/></svg><input class="rng" type="range" min="0" max="125" step="1" value="100" aria-label="Part volume"></label>
        <div class="row">
        <button type="button" data-a="mute" aria-pressed="false" aria-label="Mute" title="Mute"><svg viewBox="0 0 24 24"><path d="M3 9h4l5-4v14l-5-4H3z"/><path class="st" d="m16 9 5 6m0-6-5 6"/></svg></button>
        <button type="button" data-a="solo" aria-pressed="false" aria-label="Solo" title="Solo"><svg viewBox="0 0 24 24"><path class="st" d="M4 15a8 8 0 0 1 16 0"/><rect x="2.5" y="13" width="6" height="8" rx="2.5"/><rect x="15.5" y="13" width="6" height="8" rx="2.5"/></svg></button>
        <button type="button" data-a="del" aria-label="Remove part" title="Remove"><svg viewBox="0 0 24 24"><path class="st" d="M6 6l12 12M18 6 6 18"/></svg></button>
        </div>
      </div>
      <div class="tag"><span></span></div>`;
    shelf.appendChild(el);
    sl.el = el; sl.char = $(".char", el); sl.wrap = $(".art-wrap", el); sl.tag = $(".tag span", el); sl.bar = $(".boot i", el);
    sl.muteBtn = $('[data-a="mute"]', el); sl.soloBtn = $('[data-a="solo"]', el); sl.volIn = $(".pvol input", el);
    sl.volIn.addEventListener("input", () => {
      if (!sl.id) return;
      fillRange(sl.volIn);
      setPartVol(sl.id, +sl.volIn.value);
    });
  });
  shelf.addEventListener("click", e => {
    const slEl = e.target.closest(".slot"); if (!slEl) return;
    const sl = slots[+slEl.dataset.i]; if (!sl.id) return;
    const b = e.target.closest("button[data-a]");
    if (b) {
      const a = b.dataset.a;
      if (a === "mute") sl.muted = !sl.muted;
      else if (a === "solo") sl.solo = !sl.solo;
      else if (a === "del") { clearSlot(sl); return; }
      applyGains(); return;
    }
    if (e.target.closest(".char")) { sl.muted = !sl.muted; applyGains(); }
  });
  shelf.addEventListener("keydown", e => {
    if (e.key !== "Enter" || !e.target.classList.contains("char")) return;
    const sl = slots[+e.target.closest(".slot").dataset.i];
    if (sl.id) { sl.muted = !sl.muted; applyGains(); }
    e.stopPropagation();
  });
}
export function renderSlot(sl, pop) {
  const p = sl.id && byId[sl.id];
  sl.el.classList.toggle("has", !!p);
  sl.el.style.setProperty("--cat", p ? CATS[p.cat].color : "transparent");
  sl.wrap.innerHTML = p ? artSvg(p) : emptySvg();
  sl.svg = p ? sl.wrap.firstElementChild : null;
  sl.tag.textContent = p ? p.name : "";
  if (p) aim();
  if (p) { sl.volIn.value = volOf(p.id); fillRange(sl.volIn); sl.volIn.setAttribute("aria-label", `${p.name} volume`); }
  sl.char.setAttribute("aria-label", p ? `${p.name}. Press to mute or unmute.` : `Empty slot ${sl.i + 1}`);
  clearEnter(sl);
  if (pop && p && !reduce) enter(sl, p.cat);
  // then the costume drops on, piece by piece
  if (pop && p && !reduce) sl.svg.querySelectorAll(".outfit").forEach((o, i) => o.animate([
    { transform: "translateY(-18px)", opacity: 0 },
    { transform: "none", opacity: 1 }], { duration: 260, delay: 450 + i * 110, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "backwards" }));
}
export function place(id, i) {
  ensureAudio();
  const prev = slots.find(s => s.id === id);
  if (prev) clearSlot(prev);
  const sl = slots[i];
  if (sl.id) clearSlot(sl);
  const others = slots.some(s => s.id);
  sl.id = id; sl.muted = sl.solo = false; sl.uid = ++state.uidN;
  if (!state.running) setRunning(true);
  if (!others) resetTransport();
  else sl.start = Math.ceil(state.step / 16) * 16;
  makeNodes(sl);
  renderSlot(sl, true);
  applyGains(); updateKeys();
}
export function clearSlot(sl) {
  dropNodes(sl);
  sl.id = null; sl.muted = sl.solo = false; sl.uid = ++state.uidN;
  renderSlot(sl);
  applyGains(); updateKeys();
}
export function togglePart(id) {
  const on = slots.find(s => s.id === id);
  if (on) { clearSlot(on); return; }
  const free = FILL_ORDER.find(i => !slots[i].id);
  if (free === undefined) { state.notice = { text: "ALL 7 SLOTS ARE FULL. REMOVE A PART FIRST.", until: performance.now() + 2600 }; return; }
  place(id, free);
}
export function shuffle() {
  const pick = (cat, k) => PARTS.filter(p => p.cat === cat).sort(() => Math.random() - .5).slice(0, k);
  const chosen = [...pick("beat", 2), ...pick("fx", 1), ...pick("mel", 2), ...pick("voc", 2)].sort(() => Math.random() - .5);
  slots.forEach(s => { if (s.id) clearSlot(s); });
  chosen.forEach((p, i) => place(p.id, i));
}
