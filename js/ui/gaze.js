// Every performer on stage watches the mouse, Incredibox-style.
import { slots } from "../state.js";

const mouse = { x: 0, y: 0, seen: false };
let queued = false;

export function aim() {
  queued = false;
  if (!mouse.seen) return;
  for (const sl of slots) {
    const eyes = sl.svg && sl.svg.querySelector(".eyes");
    if (!eyes) continue;
    const r = eyes.getBoundingClientRect(), dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 120) / d;
    // offsets are in viewBox units, so a translate in px moves the pupils the same amount at any size
    eyes.querySelectorAll(".look").forEach(l => {
      const m = +l.dataset.m;
      l.style.transform = `translate(${(dx * k * m).toFixed(2)}px,${(dy * k * m).toFixed(2)}px)`;
    });
  }
}
export function initGaze() {
  addEventListener("pointermove", e => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true;
    if (!queued) { queued = true; requestAnimationFrame(aim); }
  }, { passive: true });
}
