// The seven desk slots: rendering, placing/removing parts, mute/solo, and hit animations.

import { slots, state, FILL_ORDER, nextUid, emit, partVol } from "../state.js";
import { PARTS, CATS, byId, artSvg } from "../parts/index.js";
import { ensureAudio, makeNodes, dropNodes, updateGains, resetTransport, setRunning } from "../audio/engine.js";
import { reduceMotion } from "../config.js";

const $ = (s, r) => r.querySelector(s);

export function initStage(shelf) {
  slots.forEach(sl => {
    const el = document.createElement("div");
    el.className = "slot"; el.dataset.i = sl.i;
    el.innerHTML = `<div class="char" tabindex="0" role="button"><div class="drop"><span>SLOT ${sl.i + 1}</span><small>DROP A PART</small></div><div class="art-wrap"></div><div class="boot">BOOTING<i></i></div></div>
      <div class="plank"></div>
      <div class="meta"><div class="tag"><span></span></div><input class="fader" type="range" min="0" max="150" step="1" value="100"><div class="tools"><button type="button" data-a="mute" aria-pressed="false">MUTE</button><button type="button" data-a="solo" aria-pressed="false">SOLO</button><button type="button" data-a="del" aria-label="Remove part">✕</button></div></div>`;
    shelf.appendChild(el);
    Object.assign(sl, {
      el, char: $(".char", el), wrap: $(".art-wrap", el), tag: $(".tag span", el), bar: $(".boot i", el),
      muteBtn: $('[data-a="mute"]', el), soloBtn: $('[data-a="solo"]', el), fader: $(".fader", el),
    });
  });

  shelf.addEventListener("input", e => {
    if (!e.target.classList.contains("fader")) return;
    const sl = slots[+e.target.closest(".slot").dataset.i];
    if (!sl.id) return;
    state.vols[sl.id] = e.target.value / 100;
    showVol(sl);
    updateGains();
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
      refresh(); return;
    }
    if (e.target.closest(".char")) { sl.muted = !sl.muted; refresh(); }
  });
  shelf.addEventListener("keydown", e => {
    if (e.key !== "Enter" || !e.target.classList.contains("char")) return;
    const sl = slots[+e.target.closest(".slot").dataset.i];
    if (sl.id) { sl.muted = !sl.muted; refresh(); }
    e.stopPropagation();
  });
}

export function renderSlot(sl, pop) {
  const p = sl.id && byId[sl.id];
  sl.el.classList.toggle("has", !!p);
  sl.el.style.setProperty("--cat", p ? CATS[p.cat].color : "transparent");
  sl.wrap.innerHTML = p ? artSvg(p) : "";
  sl.svg = p ? sl.wrap.firstElementChild : null;
  sl.tag.textContent = p ? p.name : "";
  sl.char.setAttribute("aria-label", p ? `${p.name}. Press to mute or unmute.` : `Empty slot ${sl.i + 1}`);
  sl.fader.setAttribute("aria-label", p ? `${p.name} volume` : "Volume");
  showVol(sl);
  if (pop && p && !reduceMotion) sl.svg.animate([
    { transform: "translateY(-30px) scale(.7)", opacity: 0 },
    { transform: "translateY(4px) scale(1.04)", opacity: 1, offset: .7 },
    { transform: "none", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.2,.8,.3,1.2)" });
}

// Syncs a slot's fader position, fill and tooltip with its part's stored level.
function showVol(sl) {
  const v = sl.id ? Math.round(partVol(sl.id) * 100) : 100;
  sl.fader.value = v;
  sl.fader.style.setProperty("--fill", (v / 150 * 100).toFixed(1) + "%");
  sl.fader.title = `Volume ${v}%`;
}

// Applies mute/solo to the audio and the slot styling, then tells listeners the lineup changed.
export function refresh() {
  const anySolo = updateGains();
  for (const sl of slots) {
    sl.el.classList.toggle("muted", !!sl.id && sl.muted);
    sl.el.classList.toggle("dim", !!sl.id && !sl.muted && anySolo && !sl.solo);
    sl.el.classList.toggle("solo", !!sl.id && sl.solo);
    sl.muteBtn.setAttribute("aria-pressed", sl.muted);
    sl.soloBtn.setAttribute("aria-pressed", sl.solo);
  }
  emit("slots");
}

export function place(id, i) {
  ensureAudio();
  const prev = slots.find(s => s.id === id);
  if (prev) clearSlot(prev);
  const sl = slots[i];
  if (sl.id) clearSlot(sl);
  const others = slots.some(s => s.id);
  sl.id = id; sl.muted = sl.solo = false; sl.uid = nextUid();
  if (!state.running) setRunning(true);
  if (!others) resetTransport();                       // first part starts right away
  else sl.start = Math.ceil(state.step / 16) * 16;     // others join on the next bar
  makeNodes(sl);
  renderSlot(sl, true);
  refresh();
}

export function clearSlot(sl) {
  dropNodes(sl);
  sl.id = null; sl.muted = sl.solo = false; sl.uid = nextUid();
  renderSlot(sl);
  refresh();
}

export const clearAll = () => slots.forEach(s => { if (s.id) clearSlot(s); });

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
  clearAll();
  chosen.forEach((p, i) => place(p.id, i));
}

// Plays a scheduled visual hit: "bump" squash, "led" flash, "mouth" open for `dur`, "alt" part-specific.
const BUMP = [{ transform: "scale(1.05,.93)" }, { transform: "scale(1,1)" }];
export function fire(ev) {
  const sl = slots[ev.i];
  if (sl.uid !== ev.uid || !sl.audible || !sl.svg) return;
  const p = byId[sl.id], svg = sl.svg, k = ev.kinds;
  if (!reduceMotion && k.includes("bump")) svg.querySelector(".bump").animate(BUMP, { duration: 170, easing: "ease-out" });
  if (k.includes("led")) {
    const lits = svg.querySelectorAll(".lit:not(.steady)");
    if (lits.length) (p.ledRand ? [lits[Math.random() * lits.length | 0]] : lits)
      .forEach(l => l.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: "ease-in" }));
  }
  if (k.includes("mouth")) {
    const m = svg.querySelector(".mouth"), o = p.mo || 2.6;
    if (m) m.animate([{ transform: "scaleY(1)" }, { transform: `scaleY(${o})`, offset: .15 }, { transform: `scaleY(${o * .8})`, offset: .8 }, { transform: "scaleY(1)" }],
      { duration: Math.max(140, (ev.dur || .2) * 1000) });
  }
  if (!reduceMotion && k.includes("alt") && p.alt) p.alt(svg);
}

// Per-frame: "wait" while a new part boots until its first bar, "on" while it's audibly playing.
export function updateSlotStates() {
  for (const sl of slots) {
    const wait = !!sl.id && state.running && state.curStep < sl.start;
    const on = !!sl.id && state.running && !wait && sl.audible;
    sl.el.classList.toggle("wait", wait);
    sl.el.classList.toggle("on", on);
    if (wait) sl.bar.style.setProperty("--p", Math.round(Math.max(0, Math.min(1, 1 - (sl.start - state.curStep) / 16)) * 100) + "%");
  }
}
