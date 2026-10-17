// Performer animation: per-hit reactions, the beat nod and slot states.
import { checkCombos } from "../bonus/show.js";
import { updateCounter } from "./counter.js";
import { clock } from "../music.js";
import { byId } from "../parts/index.js";
import { slots, state } from "../state.js";
import { reduce } from "../util.js";

const BUMP = [{ transform: "scale(1.05,.93)" }, { transform: "scale(1,1)" }];
const BOB_BIG = [{ transform: "translateY(0)" }, { transform: "translateY(9px) scale(1.05,.93)", offset: .2 }, { transform: "translateY(0)" }];
const JUMP = [{ transform: "translateY(0)" }, { transform: "translateY(6px) scale(1.06,.9)", offset: .12 }, { transform: "translateY(-22px) scale(.96,1.05)", offset: .45 }, { transform: "translateY(2px) scale(1.04,.95)", offset: .8 }, { transform: "translateY(0)" }];
const BOB = [{ transform: "translateY(0)" }, { transform: "translateY(5px) scale(1.02,.97)", offset: .2 }, { transform: "translateY(0)" }];
export function fire(ev) {
  const sl = slots[ev.i];
  if (sl.uid !== ev.uid || !sl.audible || !sl.svg) return;
  const p = byId[sl.id], svg = sl.svg, k = ev.kinds;
  if (!reduce && k.includes("bump")) svg.querySelector(".bump").animate(BUMP, { duration: 170, easing: "ease-out" });
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
  if (!reduce && k.includes("alt") && p.alt) p.alt(svg);
}
export function onStep(n) {
  updateCounter(n);
  // the whole band nods on every beat
  // bonus stars bounce harder and jump on every bar
  if (!reduce && n % 4 === 0) for (const sl of slots) {
    if (!sl.svg || !sl.el.classList.contains("on")) continue;
    const star = sl.el.classList.contains("star");
    sl.svg.querySelector(".bob").animate(star ? (n % 16 === 0 ? JUMP : BOB_BIG) : BOB, { duration: clock.SPB * 4000 * .9, easing: "ease-out" });
  }
  if (n % 16 === 0) checkCombos(n);
}
export function updateSlotStates() {
  for (const sl of slots) {
    const wait = !!sl.id && state.running && state.curStep < sl.start;
    const on = !!sl.id && state.running && !wait && sl.audible;
    sl.el.classList.toggle("wait", wait);
    sl.el.classList.toggle("on", on);
    if (wait) sl.bar.style.setProperty("--p", Math.round(Math.max(0, Math.min(1, 1 - (sl.start - state.curStep) / 16)) * 100) + "%");
  }
}
