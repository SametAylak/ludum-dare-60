// First-run coach marks: a handful of tips that each wait for the player to try the thing, shown once.
import { muteAll, volIn } from "../dom.js";
import { clock } from "../music.js";
import { slots, state } from "../state.js";
import { $ } from "../util.js";

const KEY = "beigebox.intro";
const STEPS = [
  { el: () => $("#play"), text: "Welcome to Beigebox! Press play or Space to start the band", done: () => state.running },
  { el: () => $("#deck"), text: "Click a part, drag it onto a performer, or press its key", base: () => state.uidN, done: b => state.uidN !== b },
  { el: () => (slots.find(s => s.id) || {}).char, text: "Click a performer to mute it, and again to bring it back", done: () => slots.some(s => s.muted) },
  { el: () => (slots.find(s => s.id) || {}).soloBtn, text: "Solo a part to hear it alone, and click again to undo. The slider above sets its own volume", done: () => slots.some(s => s.solo) },
  { el: () => $(".tempo"), text: "Change the tempo here, or with the - and = keys. Push past 130 BPM and things overheat", base: () => clock.BPM, done: b => clock.BPM !== b },
  { el: () => $(".vol"), text: "Master volume. Click the speaker or press M to mute everything", base: () => volIn.value, done: b => volIn.value !== b || muteAll.getAttribute("aria-pressed") === "true" },
  { el: () => $("#rec"), text: "REC records your mix. Click it again to save the file" },
  { el: () => $(".fxpanel"), text: "The Live FX pads hit the whole mix in time. Tap one, or hold Stutter and Sweep" },
  { el: () => $("#clear"), text: "Clear sends everyone off stage so you can start fresh", done: () => !slots.some(s => s.id) },
  { el: () => $("#disks"), text: "Some trios unlock these bonus disks. Five to find!", btn: "Let's play" },
];
let tip, i = -1, base = 0, target = null, wait = 0;
const seen = () => { try { return !!localStorage.getItem(KEY); } catch (e) { return true; } };
export function initOnboard() {
  if (seen()) return;
  tip = document.createElement("div");
  tip.className = "coach"; tip.setAttribute("role", "status");
  tip.innerHTML = `<p></p><div class="coach-row"><span class="coach-n"></span><button type="button" class="coach-skip">Skip</button><button type="button" class="coach-go"></button></div>`;
  $(".coach-skip", tip).addEventListener("click", finish);
  $(".coach-go", tip).addEventListener("click", () => go(i + 1));
  document.body.appendChild(tip);
  go(0);
}
function go(n) {
  if (n >= STEPS.length) return finish();
  i = n; wait = 0;
  const s = STEPS[i];
  base = s.base && s.base();
  $("p", tip).textContent = s.text;
  $(".coach-n", tip).textContent = `${i + 1}/${STEPS.length}`;
  $(".coach-go", tip).textContent = s.btn || "Next";
  tip.classList.remove("in"); void tip.offsetWidth; tip.classList.add("in");
}
function finish() {
  try { localStorage.setItem(KEY, "1"); } catch (e) {}
  if (target) target.classList.remove("coach-on");
  if (tip) tip.remove();
  tip = null; i = -1;
}
export function updateOnboard() {
  if (!tip) return;
  const s = STEPS[i];
  if (s.done && s.done(base) && ++wait > 30) return go(i + 1);   // ~half a second so the tip doesn't vanish mid-click
  const el = s.el();
  if (el !== target) { if (target) target.classList.remove("coach-on"); target = el; if (el) el.classList.add("coach-on"); }
  if (!el) { if (s.done) go(i + 1); return; }
  const r = el.getBoundingClientRect(), below = r.top + r.height / 2 < innerHeight / 2, w = tip.offsetWidth;
  const x = Math.min(Math.max(r.left + r.width / 2 - w / 2, 12), innerWidth - w - 12);
  tip.classList.toggle("up", !below);
  tip.style.left = x + "px";
  tip.style.top = (below ? r.bottom + 14 : r.top - tip.offsetHeight - 14) + "px";
  tip.style.setProperty("--ax", r.left + r.width / 2 - x + "px");
}
