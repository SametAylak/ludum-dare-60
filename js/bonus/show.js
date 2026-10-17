// Bonus reveals, guest performances and queued discoveries share the song clock.
import { audio } from "../audio/engine.js";
import { COMBOS, DISK_COLORS } from "./combos.js";
import { drawScene } from "./scenes.js";
import { drawAtmosphere, endAtmosphere, startAtmosphere } from "./atmosphere.js";
import { guestName } from "./guests.js";
import { guestEnergy, startBonusAudio, stopBonusAudio } from "./music.js";
import { INTRO_STEPS, MUSIC_STEPS, sectionAt, SHOW_STEPS } from "./score.js";
import { app } from "../dom.js";
import { clock } from "../music.js";
import { byId } from "../parts/index.js";
import { liveCombos, saveBonus, slots, state, unlocked } from "../state.js";
import { burst, clearConfetti } from "../ui/confetti.js";
import { diskEls } from "../ui/hud.js";
import { $, reduce } from "../util.js";

const term = $("#term"), bonusEl = $("#bonus"), unlockEl = $("#unlock"), retroShow = $("#retroShow");
const progress = $("#bonusProgress"), counter = $("#bonusCounter");
const bg = $("#bscene").getContext("2d");
const countdown = [...unlockEl.querySelectorAll(".u-countdown i")];
let termCache = "", counterCache = "";
const pending = [];
const CARD_END = INTRO_STEPS, MUSIC_END = CARD_END + MUSIC_STEPS;

function startScene(c, n) {
  const idx = COMBOS.indexOf(c), first = !unlocked.has(c.id);
  state.scene = { c, n, idx, first, section: "arrival" };
  state.bonusMus = { c, start: n, to: n + SHOW_STEPS };
  startBonusAudio();
  if (first) { unlocked.add(c.id); saveBonus(); }
  for (const el of [unlockEl, bonusEl]) el.style.setProperty("--c", DISK_COLORS[idx]);
  $(".u-kicker", unlockEl).textContent = first ? "SECRET FREQUENCY FOUND" : "BACK ON THE AIR";
  $(".u-name", unlockEl).textContent = c.name;
  $(".u-guests", unlockEl).textContent = c.guests.map(guestName).join(" + ");
  $(".u-countdown span").textContent = "SIGNAL INCOMING";
  $("#bonusTitle").textContent = c.name;
  termCache = ""; term.textContent = "";
  counterCache = "";
  startAtmosphere(c);
  app.classList.add("party");
}

function endScene() {
  state.scene = null; state.bonusMus = null;
  stopBonusAudio();
  unlockEl.hidden = true; bonusEl.hidden = true;
  app.classList.remove("party", "party-paused");
  slots.forEach(s => s.el.classList.remove("star"));
  diskEls.forEach(el => el.classList.remove("playing"));
  endAtmosphere();
  clearConfetti();
}

export function resetShow() {
  endScene();
  pending.length = 0;
  liveCombos.clear();
}

function comboLive(c) {
  return c.parts.every(id => {
    const s = slots.find(x => x.id === id);
    return s && s.audible && state.curStep >= s.start;
  });
}

export function requestReplay(c) {
  if (!unlocked.has(c.id) || !comboLive(c)) {
    state.notice = { text: c.parts.map(id => byId[id].name).join(" + "), until: performance.now() + 6500 };
    return;
  }
  if (state.scene?.c.id === c.id || pending.includes(c)) return;
  pending.push(c);
  state.notice = { text: `${c.name} queued for the next show`, until: performance.now() + 3500 };
}

export function checkCombos(n) {
  for (const c of COMBOS) {
    const live = comboLive(c);
    if (live && !liveCombos.has(c.id)) {
      liveCombos.add(c.id);
      if (!pending.includes(c)) pending.push(c);
    } else if (!live) liveCombos.delete(c.id);
  }
  for (let i = pending.length - 1; i >= 0; i--) if (!comboLive(pending[i])) pending.splice(i, 1);
  if (!state.scene && pending.length) startScene(pending.shift(), n);
}

export function updateShow() {
  if (!state.scene) return false;
  const scene = state.scene;
  const fraction = Math.max(0, Math.min(1, (audio.ctx.currentTime - state.curT) / clock.SPB));
  const rel = state.curStep + fraction - scene.n;
  if (!comboLive(scene.c)) { liveCombos.delete(scene.c.id); endScene(); return false; }
  if (rel >= SHOW_STEPS || rel < 0) { endScene(); return false; }
  const performing = rel >= CARD_END, ending = Math.max(0, rel - MUSIC_END);
  const section = sectionAt(rel);
  app.classList.toggle("party-paused", !state.running);
  retroShow.style.setProperty("--beat-time", `${clock.SPB * 4}s`);
  slots.forEach(s => s.el.classList.toggle("star", scene.c.parts.includes(s.id)));
  diskEls.forEach((el, i) => el.classList.toggle("playing", i === scene.idx));
  drawAtmosphere(rel, state.running, ending, guestEnergy(audio.ctx.currentTime), section);
  unlockEl.hidden = performing;
  if (!performing) {
    const enter = Math.min(1, rel / 3), exit = Math.max(0, (rel - CARD_END + 4) / 4);
    unlockEl.style.opacity = String(enter * (1 - exit));
    unlockEl.style.transform = `translate(-50%, -50%) scale(${reduce ? 1 : .92 + enter * .08 - exit * .06})`;
    countdown.forEach((el, i) => el.classList.toggle("on", rel >= 16 + i * 4));
  }
  bonusEl.hidden = !performing;
  if (scene.section !== section.id) {
    scene.section = section.id;
    $("#partyMessage").textContent = section.id === "groove" ? scene.c.message : section.label;
    $(".u-countdown span").textContent = section.label;
    if (!reduce && (section.id === "drop" || section.id === "peak")) {
      const r = $(".stage").getBoundingClientRect();
      const count = r.width < 640 ? 36 : 80;
      burst(r.left + r.width * .16, r.top + r.height * .46, count);
      burst(r.left + r.width * .84, r.top + r.height * .46, count);
    }
  }
  if (performing) {
    const pos = Math.min(128, rel - CARD_END);
    bonusEl.style.opacity = String(1 - ending / 8);
    drawScene(bg, scene.c.id, reduce ? Math.floor(pos / 4) * 4 : pos);
    const typed = scene.c.lines.filter(l => l && !l.startsWith("***")).join("\n").slice(0, Math.floor(pos * 4));
    const out = typed.split("\n").slice(-2).join("\n") + (Math.floor(rel / 4) % 2 ? "_" : " ");
    if (out !== termCache) { termCache = out; term.textContent = out; }
    const label = state.running ? ending ? "SIGNING OFF" : `BAR ${Math.min(8, Math.floor(pos / 16) + 1)} / 8` : "PAUSED";
    if (label !== counterCache) { counterCache = label; counter.textContent = label; }
    progress.style.transform = `scaleX(${Math.max(0, 1 - pos / 128)})`;
  }
  return true;
}
