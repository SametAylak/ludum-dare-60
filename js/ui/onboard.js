// First-run coach marks: three tips that each wait for the player to try the thing, shown once.
import { slots, state } from "../state.js";
import { $ } from "../util.js";

const KEY = "beigebox.intro";
const STEPS = [
  { el: () => $("#play"), text: "Welcome to Beigebox! Press play or Space to start the band", done: () => state.running },
  { el: () => $("#deck"), text: "Click a part or press its key to add it to the band", base: () => state.uidN, done: b => state.uidN !== b },
  { el: () => (slots.find(s => s.id) || slots[3]).el, text: "Parts take the next free spot on stage, up to seven. Drag a part onto a performer to swap it, or click it again to send it off", btn: "Let's play" },
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
