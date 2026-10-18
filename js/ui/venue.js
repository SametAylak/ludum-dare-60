// The venue around the band: a lighting truss for a roof, speaker towers in the wings and a neon skyline, all driven by the master output.
import { audio } from "../audio/engine.js";
import { state } from "../state.js";
import { $, reduce } from "../util.js";

const venue = $("#venue"), COLS = ["#38c6ea", "#a5d83a", "#ff9636", "#ff5d9e", "#a07cff", "#5cf5d0"];
const LAMPS = [5, 15, 25, 35, 65, 75, 85, 95], EQ = 6, lv = { b: 0, m: 0, h: 0 };
const r = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
let fq = null, lamps = [], cols = [], glow = [], lastBeat = -1, idle = false;
const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += fq[i]; return s / (b - a) / 255; };

const tower = side => `<div class="tower ${side}"><div class="cab tw"><i class="cone sm"></i><i class="cone sm"></i></div>
  <div class="cab eq">${"<span><s></s></span>".repeat(EQ)}</div><div class="cab"><i class="cone"></i></div><div class="cab sub"><i class="cone"></i></div></div>`;

function skyline(side) {
  let h = "", x = 0;
  while (x < 100) { const w = r(5, 11); h += `<i style="left:${x}%;width:${w}%;height:${r(25, 100)}%;--c:${pick(COLS)}"></i>`; x += w + r(0, 2); }
  return `<div class="city ${side}">${h}</div>`;
}

export function initVenue() {
  venue.innerHTML = skyline("l") + skyline("r") + `<div class="truss"></div>` +
    LAMPS.map((x, i) => `<div class="lamp" style="left:${x}%;--a:${(x - 50) * .45}deg;--c:${COLS[i % COLS.length]}"><i></i></div>`).join("") + tower("l") + tower("r");
  lamps = [...venue.querySelectorAll(".lamp")].map(el => ({ el, on: 0 }));
  cols = [...venue.querySelectorAll(".eq span")];
  if (reduce) lamps.forEach(l => l.el.style.setProperty("--on", .5));
}

const set = (k, v) => venue.style.setProperty(k, v.toFixed(3));
export function drawVenue() {
  if (reduce) return;
  const on = audio.analyser && state.running;
  if (!on) { if (!idle) { idle = true; for (const k of ["--bass", "--mid", "--high"]) set(k, 0); cols.forEach(c => c.style.setProperty("--l", 0)); lamps.forEach(l => l.el.style.setProperty("--on", 0)); } return; }
  idle = false;
  fq ||= new Uint8Array(audio.analyser.frequencyBinCount);
  audio.analyser.getByteFrequencyData(fq);
  for (const [k, a, b] of [["b", 1, 8], ["m", 8, 80], ["h", 80, 300]]) lv[k] = Math.max(Math.min(1, band(a, b) * 1.3), lv[k] * .88);
  set("--bass", lv.b); set("--mid", lv.m); set("--high", lv.h);
  // each tower shows the spectrum low to high, from the outside in
  for (let i = 0; i < EQ; i++) {
    const a = Math.round(2 * Math.pow(160, i / EQ)), b = Math.round(2 * Math.pow(160, (i + 1) / EQ)), v = Math.max(0, band(a, Math.max(a + 1, b)) - .3) / .7;
    glow[i] = Math.max(v, (glow[i] || 0) - .03);
    cols[i].style.setProperty("--l", glow[i].toFixed(2)); cols[EQ * 2 - 1 - i].style.setProperty("--l", glow[i].toFixed(2));
  }
  // the lamps chase across the truss on the beat and all fire on the downbeat
  const beat = Math.max(0, state.curStep) >> 2;
  if (beat !== lastBeat) { lastBeat = beat; lamps.forEach((l, i) => { if (beat % 4 === 0 || (i + beat) % 2 === 0) l.on = 1; }); }
  for (const l of lamps) { l.on *= .9; l.el.style.setProperty("--on", l.on.toFixed(2)); }
}
