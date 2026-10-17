import { guestSvg } from "./guests.js";
import { $, reduce } from "../util.js";

const stage = $(".stage"), show = $("#retroShow"), canvas = $("#partyScene");
const g = canvas.getContext("2d");
const guests = [$("#guestLeft"), $("#guestRight")];
let width = 1, height = 1, colors = [], lastBeat = -1;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => 1 - (1 - clamp(x)) ** 3;
const fract = x => x - Math.floor(x);
const stars = Array.from({ length: 72 }, (_, i) => ({ x: fract(Math.sin(i * 127.1 + 4) * 43758.5), y: fract(Math.sin(i * 311.7 + 9) * 96453.3), size: 1 + i % 3 * .5 }));

new ResizeObserver(([entry]) => {
  width = entry.contentRect.width; height = entry.contentRect.height;
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
}).observe(stage);

export function startAtmosphere(combo) {
  colors = combo.colors;
  show.hidden = false;
  stage.style.setProperty("--party-a", colors[0]);
  stage.style.setProperty("--party-b", colors[1]);
  guests.forEach((el, i) => { el.innerHTML = guestSvg(combo.guests[i]); });
  $("#partyMessage").textContent = combo.message;
  lastBeat = -1;
}

export function endAtmosphere() {
  show.hidden = true;
  show.style.opacity = "";
  guests.forEach(el => el.replaceChildren());
  g.clearRect(0, 0, width, height);
}

function glow(x, y, radius, color, alpha) {
  const light = g.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, color); light.addColorStop(1, "transparent");
  g.globalAlpha = alpha; g.fillStyle = light;
  g.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  g.globalAlpha = 1;
}

function mirrorBall(x, y, r, turn) {
  g.strokeStyle = "#a297bc"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x, 0); g.lineTo(x, y - r); g.stroke();
  glow(x, y, r * 3.6, colors[0], .18);
  g.fillStyle = "#393550"; g.beginPath(); g.arc(x, y, r + 2, 0, Math.PI * 2); g.fill();
  const rows = 12, cols = 24;
  for (let row = 0; row < rows; row++) {
    const lat1 = -Math.PI / 2 + row / rows * Math.PI + .025;
    const lat2 = lat1 + Math.PI / rows - .05;
    for (let col = 0; col < cols; col++) {
      const a = col / cols * Math.PI * 2 + turn;
      const b = a + Math.PI * 2 / cols - .035;
      if (Math.cos((a + b) / 2) < .05) continue;
      const shine = Math.max(0, Math.cos(a - .6) * Math.cos(lat1 + .4));
      const hue = (row + col) % 5 === 0 ? 285 : (row + col) % 3 === 0 ? 165 : 215;
      g.fillStyle = `hsl(${hue} ${25 + shine * 38}% ${25 + shine * 65}%)`;
      g.beginPath();
      g.moveTo(x + Math.sin(a) * Math.cos(lat1) * r, y + Math.sin(lat1) * r);
      g.lineTo(x + Math.sin(b) * Math.cos(lat1) * r, y + Math.sin(lat1) * r);
      g.lineTo(x + Math.sin(b) * Math.cos(lat2) * r, y + Math.sin(lat2) * r);
      g.lineTo(x + Math.sin(a) * Math.cos(lat2) * r, y + Math.sin(lat2) * r);
      g.closePath(); g.fill();
    }
  }
  sparkle(x - r * .34, y - r * .45, r * .32, "#fff5da");
  sparkle(x + r * .75, y + r * .22, r * .16, colors[0]);
}

function sparkle(x, y, r, color) {
  g.fillStyle = color; g.beginPath();
  g.moveTo(x, y - r); g.lineTo(x + r * .2, y - r * .2);
  g.lineTo(x + r, y); g.lineTo(x + r * .2, y + r * .2);
  g.lineTo(x, y + r); g.lineTo(x - r * .2, y + r * .2);
  g.lineTo(x - r, y); g.lineTo(x - r * .2, y - r * .2);
  g.closePath(); g.fill();
}

function danceFloor(beat, energy) {
  const horizon = height * .72, depth = height - horizon;
  g.save();
  for (let row = 0; row < 7; row++) {
    const near = (row + 1) / 7, far = row / 7;
    const y1 = horizon + far * far * depth, y2 = horizon + near * near * depth;
    for (let col = -8; col < 8; col++) {
      const unit = width / 9;
      g.beginPath();
      g.moveTo(width / 2 + col * unit * (.28 + far), y1);
      g.lineTo(width / 2 + (col + 1) * unit * (.28 + far), y1);
      g.lineTo(width / 2 + (col + 1) * unit * (.28 + near), y2);
      g.lineTo(width / 2 + col * unit * (.28 + near), y2);
      g.closePath();
      g.fillStyle = colors[Math.abs(col + row) % 2];
      const lit = ((col + row + Math.floor(beat / 2)) % 4 + 4) % 4 === 0;
      g.globalAlpha = (lit ? .18 : .025) * energy; g.fill();
      g.globalAlpha = .15 * energy; g.lineWidth = 1; g.strokeStyle = colors[0]; g.stroke();
    }
  }
  g.restore();
}

export function drawAtmosphere(position, running, ending, hits, section) {
  const intro = reduce ? 1 : ease(position / 22), fade = 1 - ease(ending / 8);
  const beat = reduce ? 8 : Math.max(0, position - 32) / 4;
  const pulse = reduce ? .3 : Math.exp(-fract(beat) * 5);
  const energy = reduce ? .7 : section.energy;
  show.style.opacity = String(fade);
  show.classList.toggle("paused", !running);
  show.classList.toggle("dropped", position >= 32);
  show.dataset.section = section.id;
  g.clearRect(0, 0, width, height);
  const backdrop = g.createLinearGradient(0, 0, 0, height);
  backdrop.addColorStop(0, "#100d26"); backdrop.addColorStop(.6, "#201438"); backdrop.addColorStop(1, "#121126");
  g.globalAlpha = intro * .94; g.fillStyle = backdrop; g.fillRect(0, 0, width, height); g.globalAlpha = 1;
  glow(width * .08, height * .5, width * .5, colors[0], (.07 + (reduce ? 0 : hits[0] * .12)) * intro);
  glow(width * .9, height * .5, width * .5, colors[1], (.08 + (reduce ? 0 : hits[1] * .12)) * intro);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i], x = s.x * width, y = s.y * height * .84;
    g.globalAlpha = intro * (.2 + (Math.sin(beat * .6 + i) + 1) * .22);
    g.fillStyle = i % 3 ? "#d8d2ee" : colors[0];
    g.fillRect(x, y, s.size, s.size);
    if (i % 13 === 0) sparkle(x, y, 4, colors[1]);
  }
  g.globalAlpha = 1;
  const exit = reduce ? 0 : ease(ending / 8);
  const ballX = width / 2, ballY = (width < 640 ? 114 : 103) - (1 - intro + exit) * 190;
  const radius = width < 640 ? 30 : 44;
  g.save(); g.globalCompositeOperation = "screen";
  for (let i = 0; i < 8; i++) {
    const angle = Math.sin(beat * .17 + i * 1.1) * 1.3 + (i % 2 ? .7 : -.7);
    const reach = height * 1.5, spread = .055 + i % 3 * .025;
    const beam = g.createLinearGradient(ballX, ballY, ballX + Math.sin(angle) * reach, ballY + Math.cos(angle) * reach);
    beam.addColorStop(0, colors[i % 2]); beam.addColorStop(1, "transparent");
    g.fillStyle = beam; g.globalAlpha = intro * (.045 + pulse * .035) * energy;
    g.beginPath(); g.moveTo(ballX, ballY);
    g.lineTo(ballX + Math.sin(angle - spread) * reach, ballY + Math.cos(angle - spread) * reach);
    g.lineTo(ballX + Math.sin(angle + spread) * reach, ballY + Math.cos(angle + spread) * reach);
    g.closePath(); g.fill();
  }
  g.restore();
  danceFloor(beat, intro * energy);

  if (position >= 32) {
    for (let i = 0; i < 38; i++) {
      const a = i * 2.4 + beat * .12, spread = 100 + i * 17;
      const x = ballX + Math.cos(a) * spread, y = height * .5 + Math.sin(a * .7) * height * .43;
      g.globalAlpha = .12 + pulse * .17; g.fillStyle = colors[i % 2];
      g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-3, -2, 6, 4); g.restore();
    }
    g.globalAlpha = 1;
    if (!reduce) for (let i = 0; i < 3; i++) {
      const phase = fract(beat / 4 + i / 3);
      g.strokeStyle = colors[i % 2]; g.globalAlpha = (1 - phase) * .2;
      g.beginPath(); g.ellipse(ballX, ballY, radius + phase * width * .46, radius * .4 + phase * 80, 0, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 1;
  }
  mirrorBall(ballX, ballY, radius, beat * .15);

  guests.forEach((el, i) => {
    const enter = reduce ? 1 : ease((position - 3 - i * 2) / 17);
    const hit = reduce ? 0 : hits[i];
    const bob = reduce || position < 32 ? 0 : Math.sin(beat * Math.PI * 2 + i * Math.PI) * 3 - hit * 12;
    el.style.transform = `translate(${(1 - enter + exit) * (i ? 1 : -1) * (width * .5 + 240)}px, ${bob}px) rotate(${reduce ? 0 : Math.sin(beat * Math.PI + i) * 2}deg)`;
    el.style.opacity = String(enter);
    el.style.setProperty("--hit", hit.toFixed(3));
    el.classList.toggle("playing", hit > .3);
  });
  const currentBeat = Math.floor(beat);
  if (currentBeat !== lastBeat) {
    lastBeat = currentBeat;
    show.style.setProperty("--beat", `${currentBeat % 4}`);
  }
}
