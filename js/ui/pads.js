// The LIVE FX pads down the left side of the stage: tap a one-shot, hold a momentary one; each has a key.
import { app } from "../dom.js";
import { FX, fq, press, release } from "../fx.js";
import { state } from "../state.js";
import { $, hider, reduce } from "../util.js";

const CLS = ["fx-drop", "fx-stutter", "fx-tape", "fx-sweep", "fx-half", "fx-double"];
const pads = {};
const down = new Set();
function on(id) {
  if (down.has(id)) return;
  if (!press(id, state.running)) { state.notice = { text: "Press play to use the live FX", until: performance.now() + 2000 }; return; }
  down.add(id); pads[id].classList.add("on");
  if (!FX.find(f => f.id === id).hold) setTimeout(() => off(id), 160);
}
function off(id) {
  if (!down.delete(id)) return;
  pads[id].classList.remove("on");
  release(id);
}
export function initPads() {
  const g = document.createElement("aside");
  g.className = "fxpanel"; g.setAttribute("aria-label", "Live FX");
  g.innerHTML = `<h2>LIVE FX</h2><div class="list"></div>`;
  for (const f of FX) {
    const b = pads[f.id] = document.createElement("button");
    b.type = "button"; b.className = "pad";
    b.title = `${f.name}${f.hold ? " (hold)" : ""}`;
    b.setAttribute("aria-label", `${f.name}${f.hold ? ", hold" : ""}. Key ${f.key}`);
    b.innerHTML = `<b>${f.name}</b><span class="lg">${f.key}</span>`;
    b.addEventListener("pointerdown", e => { if (e.button > 0) return; e.preventDefault(); b.setPointerCapture(e.pointerId); on(f.id); });
    for (const ev of ["pointerup", "pointercancel"]) b.addEventListener(ev, () => off(f.id));
    b.addEventListener("click", e => { if (e.detail === 0) on(f.id); });   // keyboard activation only
    $(".list", g).appendChild(b);
  }
  hider(g, "Live FX", "beigebox.hide.fx");
  app.appendChild(g);
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const f = FX.find(f => f.key === e.key.toUpperCase());
    if (f) on(f.id);
  });
  addEventListener("keyup", e => { const f = FX.find(f => f.key === e.key.toUpperCase()); if (f) off(f.id); });
  addEventListener("blur", () => [...down].forEach(off));
}
// Stage reactions for effects that have reached the speakers.
export function updatePads(now) {
  for (let k = fq.length - 1; k >= 0; k--) {
    const e = fq[k];
    if (e.t > now) continue;
    fq.splice(k, 1);
    if (e.clear) { app.classList.remove("fx-crash", ...CLS); continue; }
    if (e.text) state.notice = { text: e.text, until: performance.now() + 1800 };
    if (e.cls === "fx-crash") {
      app.classList.remove("fx-crash"); void app.offsetWidth; app.classList.add("fx-crash");
      if (!reduce) $("#shelf").animate([{ transform: "none" }, { transform: "translate(-6px, 5px)", offset: .15 }, { transform: "translate(5px, -2px)", offset: .4 },
        { transform: "translate(-2px, 1px)", offset: .7 }, { transform: "none" }], { duration: 420, easing: "ease-out" });
      document.querySelectorAll(".slot.on .bump").forEach(b => b.animate([{ transform: "scale(1.12,.86)" }, { transform: "none" }], { duration: 300, easing: "ease-out" }));
    } else if (e.cls) app.classList.toggle(e.cls, e.on);
  }
}
