// Header buttons and keyboard shortcuts.
import { bpmIn, playBtn } from "../dom.js";
import { toggleMasterMute } from "../mixer.js";
import { clock } from "../music.js";
import { PARTS } from "../parts/index.js";
import { slots, state } from "../state.js";
import { setBpm, setRunning } from "../transport.js";
import { clearSlot, shuffle, togglePart } from "./stage.js";
import { $ } from "../util.js";

export function initHeader() {
  const top = $(".top"), deck = $("#deck"), ro = new ResizeObserver(() => {
    top.parentElement.style.setProperty("--top-h", top.offsetHeight + "px");
    top.parentElement.style.setProperty("--deck-h", deck.offsetHeight + "px");
  });
  ro.observe(top); ro.observe(deck);
  playBtn.addEventListener("click", () => setRunning(!state.running));
  bpmIn.addEventListener("input", () => setBpm(+bpmIn.value));
  $("#bpmDown").addEventListener("click", () => setBpm(clock.BPM - 5));
  $("#bpmUp").addEventListener("click", () => setBpm(clock.BPM + 5));
  $("#shuffle").addEventListener("click", shuffle);
  $("#clear").addEventListener("click", () => slots.forEach(s => { if (s.id) clearSlot(s); }));
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code === "Space") { e.preventDefault(); setRunning(!state.running); return; }
    if (e.target.matches && e.target.matches("input[type=range]") && e.key.startsWith("Arrow")) return;
    if (e.key === "m" || e.key === "M") { toggleMasterMute(); return; }
    if (e.key === "-" || e.key === "_") { setBpm(clock.BPM - 5); return; }
    if (e.key === "=" || e.key === "+") { setBpm(clock.BPM + 5); return; }
    if (e.repeat) return;
    const p = PARTS.find(p => p.key === e.key.toUpperCase());
    if (p) togglePart(p.id);
  });
}
