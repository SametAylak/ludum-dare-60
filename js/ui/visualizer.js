// A Windows Media Player style visualization behind the stage, reading the master output. It cycles presets every 8 bars.
import { audio } from "../audio/engine.js";
import { state } from "../state.js";
import { $, reduce } from "../util.js";

const cv = $("#viz"), g = cv.getContext("2d"), buf = document.createElement("canvas"), bg = buf.getContext("2d"), label = $("#vizName");
const TAU = Math.PI * 2, RES = .5, BARS = 24, lv = { b: 0, m: 0, h: 0, p: 0 };
let fq = null, rings = [], peaks = new Float32Array(BARS), cur = -1, lastBeat = -1, labelT = 0;
const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += fq[i]; return s / (b - a) / 255; };

const star = (n, r, ri) => { g.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = i * Math.PI / n, q = i % 2 ? ri : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.stroke(); };
const glow = (x, y, r, c) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, "transparent"); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };

// Each preset sets how the last frame is fed back (zoom, turn, how much survives) and draws the new layer on top.
const PRESETS = [
  { name: "Alchemy: Swirl", zoom: 1.012, rot: .02, keep: .95, draw(w, h, s, t, hue) {
    for (let k = 0; k < 6; k++) for (let i = 0; i < 3; i++) {
      const a = t * .9 + k * TAU / 6 + i * .5, r = s * (.06 + .2 * lv.b + .1 * Math.sin(t * 1.1 + i * 2));
      glow(w / 2 + Math.cos(a) * r, h * .42 + Math.sin(a) * r * .8, s * (.012 + .025 * lv.h + .015 * lv.p), `hsla(${hue + k * 25 + i * 50},100%,65%,.9)`);
    } } },
  { name: "Battery: Kaleidovision", zoom: .955, rot: -.025, keep: .88, draw(w, h, s, t, hue) {
    g.translate(w / 2, h * .42); g.lineWidth = s * (.006 + .012 * lv.p);
    for (let k = 0; k < 8; k++) {
      g.rotate(TAU / 8); g.save(); g.translate(s * (.2 + .22 * lv.m), 0); g.rotate(t * 1.5);
      g.strokeStyle = `hsla(${hue + k * 45},100%,${55 + 20 * lv.h}%,.85)`; star(5, s * (.03 + .1 * lv.b), s * (.012 + .03 * lv.h)); g.restore();
    } } },
  { name: "Ambience: Water", zoom: 1.004, rot: .002, keep: .93, draw(w, h, s, t, hue) {
    for (let i = 0; i < 3; i++) glow(w / 2 + Math.sin(t * .31 + i * 2.1) * w * .3, h * .42 + Math.cos(t * .23 + i * 1.7) * h * .2,
      s * (.18 + .25 * lv.m), `hsla(${hue + i * 90},90%,55%,${.05 + .1 * lv.b})`);
    g.lineWidth = s * .003;
    for (const r of rings) { r.r += s * .006 * (1 + 2 * lv.b); g.strokeStyle = `hsla(${r.hue},100%,70%,${Math.max(0, .7 - r.r / s)})`;
      g.beginPath(); g.ellipse(w / 2, h * .42, r.r, r.r * .6, 0, 0, TAU); g.stroke(); }
    rings = rings.filter(r => r.r < s); } },
  { name: "Bars and Waves: Bars", zoom: 1, rot: 0, keep: .55, draw(w, h, s) {
    const base = h * .72, bw = w / BARS / 2, top = g.createLinearGradient(0, base, 0, base - h * .4);
    top.addColorStop(0, "#2bff6a"); top.addColorStop(.6, "#f6ff3a"); top.addColorStop(1, "#ff4a2a"); g.fillStyle = top;
    // lows at the wings, highs meeting in the middle, mirrored so the band stays framed
    for (let i = 0; i < BARS; i++) {
      const a = Math.round(2 * Math.pow(220, i / BARS)), v = Math.max(0, band(a, Math.max(a + 1, Math.round(2 * Math.pow(220, (i + 1) / BARS)))) - .45) / .55;
      peaks[i] = Math.max(v, peaks[i] - .012); const bh = v * h * .4, ph = peaks[i] * h * .4 + 3;
      for (const x of [i * bw + bw * .12, w - (i + 1) * bw + bw * .12]) { g.fillRect(x, base - bh, bw * .76, bh); g.fillRect(x, base - ph, bw * .76, 2); }
    } } },
];

function size() {
  const r = cv.getBoundingClientRect();
  cv.width = buf.width = Math.max(1, Math.round(r.width * RES)); cv.height = buf.height = Math.max(1, Math.round(r.height * RES));
}

export function drawViz() {
  if (reduce || !audio.analyser || !state.running) return;
  fq ||= new Uint8Array(audio.analyser.frequencyBinCount);
  audio.analyser.getByteFrequencyData(fq);
  for (const [k, a, b] of [["b", 1, 8], ["m", 8, 80], ["h", 80, 300]]) lv[k] = Math.max(band(a, b) * 1.3, lv[k] * .9);
  const step = Math.max(0, state.curStep), i = (step >> 7) % PRESETS.length, p = PRESETS[i];
  if (i !== cur) { cur = i; label.textContent = p.name; labelT = performance.now(); rings = []; peaks.fill(0); }
  label.classList.toggle("on", performance.now() - labelT < 3500);
  if (step >> 2 !== lastBeat) { lastBeat = step >> 2; lv.p = 1; rings.push({ r: 0, hue: (performance.now() / 50 + step * 7) % 360 }); }
  lv.p *= .88;
  const w = cv.width, h = cv.height, s = Math.min(w, h * 1.6), t = performance.now() / 1000, hue = t * 20 % 360;
  bg.clearRect(0, 0, w, h); bg.drawImage(cv, 0, 0); g.clearRect(0, 0, w, h);
  g.save(); g.globalAlpha = p.keep; g.translate(w / 2, h * .42); g.rotate(p.rot); g.scale(p.zoom, p.zoom); g.drawImage(buf, -w / 2, -h * .42); g.restore();
  g.save(); g.globalCompositeOperation = "lighter"; p.draw(w, h, s, t, hue); g.restore();
}

export function initViz() {
  if (reduce) return cv.remove();
  new ResizeObserver(size).observe(cv);
}
