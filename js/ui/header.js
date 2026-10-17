// Header controls (play, turbo, shuffle, clear), the bar indicator and keyboard shortcuts.

import { state, on } from "../state.js";
import { BPM } from "../config.js";
import { PARTS } from "../parts/index.js";
import { setRunning, setTurbo } from "../audio/engine.js";
import { togglePart, shuffle, clearAll } from "./stage.js";

let barEls = [];

export function initHeader() {
  const playBtn = document.getElementById("play"), turboBtn = document.getElementById("turbo");
  barEls = [...document.querySelectorAll("#bars i")];

  playBtn.addEventListener("click", () => setRunning(!state.running));
  turboBtn.addEventListener("click", () => setTurbo(!state.turbo));
  document.getElementById("shuffle").addEventListener("click", shuffle);
  document.getElementById("clear").addEventListener("click", clearAll);

  on("power", () => {
    playBtn.classList.toggle("on", state.running);
    playBtn.querySelector(".lbl").textContent = state.running ? "PAUSE" : "PLAY";
  });
  on("tempo", () => {
    document.getElementById("bpm").textContent = BPM;
    turboBtn.classList.toggle("on", state.turbo);
    turboBtn.setAttribute("aria-pressed", state.turbo);
  });

  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code === "Space") { e.preventDefault(); setRunning(!state.running); return; }
    if (e.repeat) return;
    const p = PARTS.find(p => p.key === e.key.toUpperCase());
    if (p) togglePart(p.id);
  });
}

export function setBar(bar) {
  barEls.forEach((b, i) => b.classList.toggle("on", i === bar));
}
