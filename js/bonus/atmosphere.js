import { aim } from "../ui/gaze.js";
import { guestSvg } from "./guests.js";
import { $, reduce } from "../util.js";

const stage = $(".stage"), show = $("#retroShow"), canvas = $("#partyScene");
const g = canvas.getContext("2d");
const guests = [$("#guestLeft"), $("#guestRight")];
let width = 1, height = 1, top = 0, bottom = 0, colors = [], lastBeat = -1;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => 1 - (1 - clamp(x)) ** 3;
const fract = x => x - Math.floor(x);
const stars = Array.from({ length: 72 }, (_, i) => ({ x: fract(Math.sin(i * 127.1 + 4) * 43758.5), y: fract(Math.sin(i * 311.7 + 9) * 96453.3), size: 1 + i % 3 * .5 }));
const crowd = Array.from({ length: 132 }, (_, i) => ({ x: fract(Math.sin(i * 91.7 + 1) * 43758.5), row: i % 3, size: .85 + fract(Math.sin(i * 12.9 + 3) * 9631.1) * .35,
  phase: fract(Math.sin(i * 5.3 + 7) * 311.7) * Math.PI * 2, arms: i % 5 === 0 ? 2 : i % 4 === 0 ? 1 : 0 }));

new ResizeObserver(() => {
  const css = getComputedStyle(stage);
  width = stage.clientWidth; height = stage.clientHeight; top = parseFloat(css.paddingTop) || 0; bottom = parseFloat(css.paddingBottom) || 0;
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
  aim();
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

// Soft beams fanning out of the ball; they sweep slowly with the song and never flash.
function ballBeams(x, y, beat, alpha) {
  g.save(); g.globalCompositeOperation = "screen";
  for (let i = 0; i < 10; i++) {
    const angle = i / 10 * Math.PI * 2 + beat * .04, reach = Math.max(width, height) * .8, spread = .05 + i % 3 * .02;
    const beam = g.createLinearGradient(x, y, x + Math.sin(angle) * reach, y + Math.cos(angle) * reach);
    beam.addColorStop(0, colors[i % 2]); beam.addColorStop(1, "transparent");
    g.fillStyle = beam; g.globalAlpha = .09 * alpha;
    g.beginPath(); g.moveTo(x, y);
    g.lineTo(x + Math.sin(angle - spread) * reach, y + Math.cos(angle - spread) * reach);
    g.lineTo(x + Math.sin(angle + spread) * reach, y + Math.cos(angle + spread) * reach);
    g.closePath(); g.fill();
  }
  g.restore();
}

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, t) => `rgb(${rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t)).join(",")})`;

// The trio's spotlights shine from the ball onto each star performer: they sway a little, drift between the show colors and swell on the beat.
function starBeams(x, y, beat, alpha) {
  const box = stage.getBoundingClientRect(), swell = .65 + .35 * Math.exp(-fract(beat) * 3);
  g.save(); g.globalCompositeOperation = "screen";
  document.querySelectorAll(".slot.star .char").forEach((el, i) => {
    const r = el.getBoundingClientRect(), half = r.width * .62;
    const cx = r.left - box.left + r.width / 2 + Math.sin(beat * Math.PI / 4 + i * 2.1) * r.width * .18, floor = r.bottom - box.top;
    const color = mix(colors[0], colors[1], Math.sin(beat * Math.PI / 8 + i * 1.7) * .5 + .5);
    g.globalAlpha = .32 * alpha * swell; g.fillStyle = color;
    g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(cx + half, floor); g.lineTo(cx - half, floor); g.closePath(); g.fill();
  });
  g.restore();
}

function mirrorBall(x, y, r, turn, from) {
  g.strokeStyle = "#a297bc"; g.lineWidth = 2;
  if (y - r > from) { g.beginPath(); g.moveTo(x, from); g.lineTo(x, y - r); g.stroke(); }
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

function danceFloor(alpha) {
  const horizon = height * .72, depth = height - horizon;
  g.save(); g.lineWidth = 1; g.strokeStyle = colors[0];
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
      g.globalAlpha = .04 * alpha; g.fill();
      g.globalAlpha = .15 * alpha; g.stroke();
    }
  }
  g.restore();
}

function person(x, y, s, arms, rim, alpha) {
  g.globalAlpha = alpha; g.fillStyle = g.strokeStyle = "#120d24"; g.lineWidth = 7 * s; g.lineCap = "round";
  if (arms) {
    g.beginPath(); g.moveTo(x - 11 * s, y - 30 * s); g.lineTo(x - 19 * s, y - 60 * s);
    if (arms > 1) { g.moveTo(x + 11 * s, y - 30 * s); g.lineTo(x + 19 * s, y - 60 * s); }
    g.stroke();
  }
  g.beginPath(); g.roundRect(x - 16 * s, y - 36 * s, 32 * s, 46 * s, 13 * s); g.fill();
  g.beginPath(); g.arc(x, y - 46 * s, 10 * s, 0, Math.PI * 2); g.fill();
  g.globalAlpha = alpha * .6; g.strokeStyle = rim; g.lineWidth = 1.6;
  g.beginPath(); g.arc(x, y - 46 * s, 10 * s, Math.PI * 1.05, Math.PI * 1.8); g.stroke();
  g.globalAlpha = 1;
}

// Three rows of dancers: two behind the band, the front row half hidden by the palette glass.
function drawCrowd(beat, alpha, dancing) {
  const horizon = height * .72, k = Math.max(.6, Math.min(1.2, width / 1400));
  const rows = [[horizon + (height - horizon) * .12, .72], [horizon + (height - horizon) * .34, .95], [height - bottom * .2, 1.3]];
  rows.forEach(([y, scale], row) => {
    for (const p of crowd) if (p.row === row) {
      const s = scale * p.size * k, lift = dancing ? Math.abs(Math.sin(beat * Math.PI + p.phase)) * 7 * s : 0;
      person(p.x * width, y - lift, s, p.arms, colors[p.x < .5 ? 0 : 1], alpha * (.75 + row * .1));
    }
  });
}

export function drawAtmosphere(position, running, ending, hits, section) {
  const intro = reduce ? 1 : ease(position / 22), fade = 1 - ease(ending / 8);
  const beat = reduce ? 8 : Math.max(0, position - 32) / 4;
  show.style.opacity = String(fade);
  show.classList.toggle("paused", !running);
  show.classList.toggle("dropped", position >= 32);
  show.dataset.section = section.id;
  g.clearRect(0, 0, width, height);
  const backdrop = g.createLinearGradient(0, 0, 0, height);
  backdrop.addColorStop(0, "#100d26"); backdrop.addColorStop(.6, "#201438"); backdrop.addColorStop(1, "#121126");
  g.globalAlpha = intro * .94; g.fillStyle = backdrop; g.fillRect(0, 0, width, height); g.globalAlpha = 1;
  glow(width * .08, height * .5, width * .5, colors[0], .08 * intro);
  glow(width * .9, height * .5, width * .5, colors[1], .08 * intro);

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    g.globalAlpha = intro * (.2 + i % 4 * .1); g.fillStyle = i % 3 ? "#d8d2ee" : colors[0];
    g.fillRect(s.x * width, s.y * height * .84, s.size, s.size);
  }
  g.globalAlpha = 1;
  danceFloor(intro);
  drawCrowd(beat, intro, !reduce && running && position >= 32);
  const exit = reduce ? 0 : ease(ending / 8);
  // the ball hangs in the middle of the open stage, under the show title; its beams reach the walls and the floor
  const radius = width < 640 ? 30 : 44, drop = reduce ? 1 : ease((position - 26) / 8);
  const ballX = width / 2, ballY = (width < 640 ? top + 114 : (top + 186 + height * .72) / 2) - (1 - drop + exit) * 190;
  ballBeams(ballX, ballY, beat, drop * (1 - exit));
  starBeams(ballX, ballY, beat, drop * (1 - exit));
  mirrorBall(ballX, ballY, radius, beat * .15, top + (width < 640 ? 62 : 186));

  guests.forEach((el, i) => {
    const enter = reduce ? 1 : ease((position - 3 - i * 2) / 17);
    const hit = reduce ? 0 : hits[i];
    el.style.transform = `translateX(${(1 - enter + exit) * (i ? 1 : -1) * (width * .5 + 240)}px)`;
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
