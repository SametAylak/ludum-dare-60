// The backdrop CRT: DOS-style status text and a live oscilloscope of the master output.

import { slots, state } from "../state.js";
import { BPM } from "../config.js";
import { getAnalyser } from "../audio/engine.js";
import { COMBOS, unlocked, bonus, isLive } from "../combos.js";

let term, scope, sg, scopeBuf = null, termCache = "";

export function initScreen(scopeEl, termEl) {
  scope = scopeEl; term = termEl; sg = scope.getContext("2d");
  new ResizeObserver(() => {
    const r = scope.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    scope.width = Math.max(1, Math.round(r.width * dpr));
    scope.height = Math.max(1, Math.round(r.height * dpr));
  }).observe(scope);
}

function hintText(now, n) {
  if (state.notice && now < state.notice.until) return state.notice.text;
  if (!state.running) return n ? "PRESS PLAY OR SPACE TO START THE MIX" : "PRESS PLAY OR SPACE TO POWER ON";
  if (n === 0) return "DRAG A PART ONTO A SLOT, OR PRESS ITS KEY";
  if (slots.some(s => s.id && state.curStep < s.start)) return "BOOTING... NEW PARTS JOIN ON THE NEXT BAR";
  if (n < 7) return "ADD PARTS. SOME TRIOS UNLOCK BONUS DISKS";
  return "FULL BAND. CLICK A PART TO MUTE IT";
}

export function updateTerm() {
  const now = performance.now(), cursor = Math.floor(now / 500) % 2 ? "_" : " ";
  const scene = bonus.scene;
  let out;
  if (scene && state.running && now - scene.at < 15000 && isLive(scene.c.id)) {
    const full = scene.c.lines.join("\n");
    out = "C:\\> BONUS.EXE\n\n" + full.slice(0, Math.floor((now - scene.at) / 1000 * 40)) + cursor;
  } else {
    const n = slots.filter(s => s.id).length, cs = state.curStep;
    const pos = cs >= 0 ? cs % 16 : -1;
    const bar = cs >= 0 ? ((cs >> 4) & 3) + 1 : 1;
    out = [
      "BEIGEBOX SOUND SYSTEM v1.0",
      `C:\\> MIX.EXE /BPM:${BPM}${state.turbo ? " /TURBO" : ""}`,
      "",
      `BAR ${bar}/4 [${Array.from({ length: 16 }, (_, i) => i <= pos ? "#" : ".").join("")}]  PARTS ${n}/7`,
      `BONUS DISKS ${unlocked.size}/4: ${COMBOS.map(c => unlocked.has(c.id) ? c.name : "??????").join(" | ")}`,
      "",
      "> " + hintText(now, n) + cursor,
    ].join("\n");
  }
  if (out !== termCache) { termCache = out; term.textContent = out; }
}

export function drawScope() {
  const w = scope.width, hgt = scope.height, dpr = Math.min(2, devicePixelRatio || 1);
  const analyser = getAnalyser();
  sg.fillStyle = "rgba(6,23,14,0.38)";               // partial clear = phosphor persistence
  sg.fillRect(0, 0, w, hgt);
  const y0 = hgt * .7, amp = hgt * .4;
  sg.lineWidth = 2 * dpr; sg.strokeStyle = "#5cf58e"; sg.shadowColor = "#5cf58e"; sg.shadowBlur = 10 * dpr;
  sg.beginPath();
  if (analyser && state.running) {
    if (!scopeBuf) scopeBuf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(scopeBuf);
    let st = 1;                                       // trigger on a rising zero crossing
    while (st < scopeBuf.length / 2 && !(scopeBuf[st - 1] < 0 && scopeBuf[st] >= 0)) st++;
    const N = scopeBuf.length / 2;
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1) * w, y = y0 - scopeBuf[st + i] * amp;
      i ? sg.lineTo(x, y) : sg.moveTo(x, y);
    }
  } else { sg.moveTo(0, y0); sg.lineTo(w, y0); }
  sg.stroke();
  sg.shadowBlur = 0;
}
