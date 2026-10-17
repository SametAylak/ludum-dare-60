// The loop position in the header: four bars of four beats, lit as they sound.
import { clock } from "../music.js";
import { slots } from "../state.js";
import { $, reduce } from "../util.js";

const el = $("#counter");
let bars = [], cells = [], posEl = null, last = -1;
export function initCounter() {
  el.innerHTML = `<div class="bars">${[0, 1, 2, 3].map(() => `<span class="bar"><i></i><i></i><i></i><i></i></span>`).join("")}</div><span class="pos">-<i>.</i>-</span>`;
  bars = [...el.querySelectorAll(".bar")];
  cells = [...el.querySelectorAll(".bar i")];
  posEl = $(".pos", el);
}
export function updateCounter(n) {
  const beat = n >> 2 & 15;
  // a waiting part joins on its start bar, so cue that bar's downbeat
  const wait = slots.filter(s => s.id && n < s.start).map(s => s.start >> 4 & 3);
  bars.forEach((b, i) => b.classList.toggle("cue", wait.includes(i) && i !== beat >> 2));
  if (beat === last) return;
  last = beat;
  const bar = beat >> 2;
  bars.forEach((b, i) => { b.classList.toggle("cur", i === bar); b.classList.toggle("done", i < bar); });
  cells.forEach((c, i) => { c.classList.toggle("on", i === beat); c.classList.toggle("past", i >> 2 === bar && i < beat); });
  posEl.innerHTML = `${bar + 1}<i>.</i>${(beat & 3) + 1}`;
  if (!reduce) cells[beat].animate([{ transform: "scaleY(1.45)", filter: "brightness(1.6)" }, { transform: "none", filter: "none" }],
    { duration: clock.SPB * 4000 * .85, easing: "cubic-bezier(.2,.7,.3,1)" });
}
