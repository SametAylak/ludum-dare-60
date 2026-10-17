// The round icon palette, with click and drag-to-slot.
import { artSvg } from "../parts/art.js";
import { byId, CATS, PARTS } from "../parts/index.js";
import { slots } from "../state.js";
import { place, togglePart } from "./stage.js";
import { $ } from "../util.js";

const deck = $("#deck");
let drag = null;
let hoverSlot = null;
export function initDeck() {
  for (const cat of Object.keys(CATS)) {
    const g = document.createElement("div");
    g.className = "group"; g.style.setProperty("--cat", CATS[cat].color);
    g.innerHTML = `<h2>${CATS[cat].label}</h2><div class="keys"></div>`;
    for (const p of PARTS.filter(p => p.cat === cat)) {
      const k = document.createElement("button");
      k.type = "button"; k.className = "key"; k.dataset.id = p.id;
      k.setAttribute("aria-label", `${p.name}, ${CATS[cat].label.toLowerCase()}. Key ${p.key}`);
      k.setAttribute("aria-pressed", "false");
      k.title = p.name;
      k.innerHTML = `${artSvg(p, true)}<span class="lg">${p.key}</span>`;
      $(".keys", g).appendChild(k);
    }
    deck.appendChild(g);
  }
  deck.addEventListener("pointerdown", e => {
    const key = e.target.closest(".key");
    if (!key || e.button > 0) return;
    e.preventDefault();
    drag = { id: key.dataset.id, x: e.clientX, y: e.clientY, moved: false, ghost: null, pid: e.pointerId };
    key.setPointerCapture(e.pointerId);
  });
  deck.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.pid) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
      drag.moved = true;
      drag.ghost = document.createElement("div");
      drag.ghost.className = "ghost";
      drag.ghost.innerHTML = artSvg(byId[drag.id], true);
      document.body.appendChild(drag.ghost);
    }
    if (drag.moved) {
      drag.ghost.style.left = e.clientX + "px";
      drag.ghost.style.top = e.clientY + "px";
      setHover(slotAt(e.clientX, e.clientY));
    }
  });
  deck.addEventListener("pointerup", e => {
    if (!drag || e.pointerId !== drag.pid) return;
    const d = drag;
    const target = d.moved ? slotAt(e.clientX, e.clientY) : null;
    endDrag();
    if (!d.moved) togglePart(d.id);
    else if (target) place(d.id, target.i);
  });
  deck.addEventListener("pointercancel", endDrag);
  deck.addEventListener("click", e => {
    const key = e.target.closest(".key");
    if (key && e.detail === 0) togglePart(key.dataset.id);   // keyboard activation only; pointer handled above
  });
}
export function updateKeys() {
  deck.querySelectorAll(".key").forEach(k => {
    const used = slots.some(s => s.id === k.dataset.id);
    k.classList.toggle("used", used);
    k.setAttribute("aria-pressed", used);
  });
}
const slotAt = (x, y) => { const el = document.elementFromPoint(x, y); const s = el && el.closest(".slot"); return s ? slots[+s.dataset.i] : null; };
function setHover(sl) {
  if (hoverSlot === sl) return;
  if (hoverSlot) hoverSlot.el.classList.remove("hover");
  hoverSlot = sl;
  if (sl) sl.el.classList.add("hover");
}
function endDrag() {
  if (drag && drag.ghost) drag.ghost.remove();
  setHover(null); drag = null;
}
