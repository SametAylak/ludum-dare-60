// Show transitions over the stage: a signal wipe on arrival, the iris closing through the build, a shockwave and confetti on the drop, a wipe back out.
import { app } from "../dom.js";
import { $, reduce } from "../util.js";

const el = $("#warp"), KINDS = ["w-in", "w-build", "w-drop", "w-out"];
const r = (a, b) => a + Math.random() * (b - a);
el.innerHTML = `<i class="wipe"></i><i class="iris"></i><i class="flash"></i><i class="ring"></i><i class="ring"></i><i class="ring"></i><div class="cf">` +
  Array.from({ length: 48 }, () => { const a = r(0, Math.PI * 2), d = r(18, 46);
    return `<b style="--dx:${(Math.cos(a) * d).toFixed(1)}vw;--dy:${(Math.sin(a) * d * .6 - 10).toFixed(1)}vh;--r:${r(-720, 720) | 0}deg;--d:${r(1.4, 2.4).toFixed(2)}s"></b>`; }).join("") + `</div>`;

export function warpColors([a, b]) { el.style.setProperty("--c1", a); el.style.setProperty("--c2", b); }

// restart the transition's CSS animations; the drop also lifts the build's iris
export function warp(kind) {
  if (reduce) return;
  app.classList.remove(kind, ...(kind === "w-drop" || kind === "w-out" ? ["w-build"] : []));
  void app.offsetWidth;
  app.classList.add(kind);
}

export function endWarp() { app.classList.remove(...KINDS); }
