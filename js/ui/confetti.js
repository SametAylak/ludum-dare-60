// Confetti bursts on a full-window canvas.
import { $ } from "../util.js";

const cfx = $("#confetti");
const cg = cfx.getContext("2d");
const CONF = ["#38c6ea", "#a5d83a", "#ff9636", "#ff5d9e", "#ffffff", "#ffb12b"];
let bits = [];
export function burst(x, y, count = 160) {
  const dpr = Math.min(2, devicePixelRatio || 1);
  cfx.width = innerWidth * dpr; cfx.height = innerHeight * dpr; cg.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 11;
    bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: Math.random() * 6.3, vr: (Math.random() - .5) * .5,
      w: 6 + Math.random() * 7, h: 4 + Math.random() * 4, c: CONF[i % CONF.length] });
  }
}
export function clearConfetti() {
  bits = [];
  cg.clearRect(0, 0, cfx.width, cfx.height);
}
export function drawConfetti(running) {
  if (!bits.length || !running) return;
  cg.clearRect(0, 0, innerWidth, innerHeight);
  for (const b of bits) {
    b.vy += .32; b.vx *= .985; b.vy *= .99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
    cg.save(); cg.translate(b.x, b.y); cg.rotate(b.r); cg.scale(1, Math.cos(b.r * 2)); cg.fillStyle = b.c; cg.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cg.restore();
  }
  bits = bits.filter(b => b.y < innerHeight + 30);
  if (!bits.length) cg.clearRect(0, 0, innerWidth, innerHeight);
}
