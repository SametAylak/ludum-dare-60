// The hint pill and bonus disk icons; a locked disk fills a third per trio part playing.
import { COMBOS, DISK_COLORS } from "../bonus/combos.js";
import { requestReplay, updateShow } from "../bonus/show.js";
import { clock } from "../music.js";
import { slots, state, unlocked } from "../state.js";
import { $ } from "../util.js";

const hintEl = $("#hint");
const disksEl = $("#disks");
export let diskEls = [];
let hintCache = "";
let disksCache = "";
const disk = cls => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h15l3 3v15H3z"/><rect class="sh" x="7" y="3" width="9" height="6"/><rect class="lb" x="6" y="13" width="12" height="8"/></svg>`;
export function initHud() {
  disksEl.insertAdjacentHTML("beforeend", COMBOS.map((c, i) =>
    `<button class="bonus-disk" type="button" style="--c:${DISK_COLORS[i]}" aria-label="Bonus ${i + 1}: show the secret trio" title="Show the secret trio">${disk("dk")}${disk("dkf")}</button>`).join(""));
  diskEls = [...disksEl.querySelectorAll(".dk")];
  disksEl.querySelectorAll("button").forEach((el, i) => el.addEventListener("click", () => requestReplay(COMBOS[i])));
}
export function updateHud() {
  const now = performance.now(), show = updateShow();
  const n = slots.filter(s => s.id).length;
  let hint;
  if (state.notice && now < state.notice.until) hint = state.notice.text;
  else if (show) hint = (state.running ? state.scene.first ? "NEW BONUS: " : "BONUS: " : "PAUSED: ") + state.scene.c.name;
  else if (!state.running) hint = n ? "Press play or Space to start the mix" : "Press play or Space to start";
  else if (n === 0) hint = "Drag an icon onto a performer, or press its key";
  else if (slots.some(s => s.id && state.curStep < s.start)) hint = "New parts join on the next bar";
  else if (clock.BPM >= 165) hint = "WARNING: overclocked! Your parts are overheating";
  else if (clock.BPM >= 130 && n >= 3) hint = "Overclocked. Things are getting warm";
  else if (n < 7) hint = "Add more parts. Some trios unlock bonus disks";
  else hint = "Full band! Click a performer to mute it";
  if (hint !== hintCache) { hintCache = hint; hintEl.textContent = hint; }
  const have = COMBOS.map(c => c.parts.filter(id => slots.some(s => s.id === id && s.audible)).length);
  if (unlocked.size + have.join("") !== disksCache) {
    disksCache = unlocked.size + have.join("");
    COMBOS.forEach((c, i) => {
      const found = unlocked.has(c.id), button = diskEls[i].parentElement, got = have[i];
      diskEls[i].classList.toggle("on", found);
      button.style.setProperty("--p", got / 3);
      button.title = found ? `${c.name} · Replay with its trio` : `${got}/3 playing · Show the secret trio`;
      button.setAttribute("aria-label", found ? `Replay ${c.name}` : `Bonus ${i + 1}: ${got} of 3 parts playing, show the secret trio`);
    });
  }
}
