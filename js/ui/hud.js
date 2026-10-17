// The hint pill and bonus disk icons.
import { COMBOS, DISK_COLORS } from "../bonus/combos.js";
import { updateShow } from "../bonus/show.js";
import { clock } from "../music.js";
import { slots, state, unlocked } from "../state.js";
import { $ } from "../util.js";

const hintEl = $("#hint");
const disksEl = $("#disks");
export let diskEls = [];
let hintCache = "";
let disksCache = -1;
export function initHud() {
  disksEl.insertAdjacentHTML("beforeend", COMBOS.map((c, i) =>
    `<svg class="dk" viewBox="0 0 24 24" style="--c:${DISK_COLORS[i]}"><title>??????</title><path d="M3 3h15l3 3v15H3z"/><rect class="sh" x="7" y="3" width="9" height="6"/><rect class="lb" x="6" y="13" width="12" height="8"/></svg>`).join(""));
  diskEls = [...disksEl.querySelectorAll(".dk")];
}
export function updateHud() {
  const now = performance.now(), show = updateShow(now);
  const n = slots.filter(s => s.id).length;
  let hint;
  if (show) hint = (state.scene.first ? "NEW BONUS: " : "BONUS: ") + state.scene.c.name;
  else if (state.notice && now < state.notice.until) hint = state.notice.text;
  else if (!state.running) hint = n ? "Press play or Space to start the mix" : "Press play or Space to start";
  else if (n === 0) hint = "Drag an icon onto a performer, or press its key";
  else if (slots.some(s => s.id && state.curStep < s.start)) hint = "New parts join on the next bar";
  else if (clock.BPM >= 165) hint = "WARNING: overclocked! Your parts are overheating";
  else if (clock.BPM >= 130 && n >= 3) hint = "Overclocked. Things are getting warm";
  else if (n < 7) hint = "Add more parts. Some trios unlock bonus disks";
  else hint = "Full band! Click a performer to mute it";
  if (hint !== hintCache) { hintCache = hint; hintEl.textContent = hint; }
  if (unlocked.size !== disksCache) {
    disksCache = unlocked.size;
    COMBOS.forEach((c, i) => { diskEls[i].classList.toggle("on", unlocked.has(c.id)); diskEls[i].firstElementChild.textContent = unlocked.has(c.id) ? c.name : "??????"; });
  }
}
