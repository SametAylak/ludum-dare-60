// Bonus reveals, guest performances and queued discoveries share the song clock.
import { audio } from "../audio/engine.js";
import { COMBOS, DISK_COLORS } from "./combos.js";
import { drawScene } from "./scenes.js";
import { drawAtmosphere, endAtmosphere, startAtmosphere } from "./atmosphere.js";
import { guestName } from "./guests.js";
import { endWarp, warp, warpColors } from "./warp.js";
import { guestEnergy, startBonusAudio, stopBonusAudio } from "./music.js";
import { INTRO_STEPS, MUSIC_STEPS, sectionAt, SHOW_STEPS } from "./score.js";
import { sectionAt as bootSectionAt, TIMING as BOOT_TIMING } from "./boot/score.js";
import { app } from "../dom.js";
import { clock } from "../music.js";
import { byId } from "../parts/index.js";
import { liveCombos, saveBonus, slots, state, unlocked } from "../state.js";
import { diskEls } from "../ui/hud.js";
import { $, reduce } from "../util.js";

const term = $("#term"), bonusEl = $("#bonus"), unlockEl = $("#unlock"), retroShow = $("#retroShow");
const progress = $("#bonusProgress"), counter = $("#bonusCounter");
const bg = $("#bscene").getContext("2d");
const countdown = [...unlockEl.querySelectorAll(".u-countdown i")];
let termCache = "", counterCache = "";
const pending = [];
// Boot Sequence plays its own, longer arrangement (bonus/boot/); the other shows share score.js.
const TIMING = { intro: INTRO_STEPS, music: MUSIC_STEPS, outro: 8, show: SHOW_STEPS };
const timingFor = c => c.id === "boot" ? BOOT_TIMING : TIMING;
const sectionFor = (c, position) => c.id === "boot" ? bootSectionAt(position) : sectionAt(position);

function startScene(c, n) {
  const idx = COMBOS.indexOf(c), first = !unlocked.has(c.id);
  state.scene = { c, n, idx, first, section: "arrival", time: timingFor(c) };
  state.bonusMus = { c, start: n, to: n + state.scene.time.show };
  startBonusAudio(c);
  if (first) { unlocked.add(c.id); saveBonus(); }
  for (const el of [unlockEl, bonusEl]) el.style.setProperty("--c", DISK_COLORS[idx]);
  $(".u-kicker", unlockEl).textContent = first ? "SECRET FREQUENCY FOUND" : "BACK ON THE AIR";
  // the title pops in letter by letter
  let k = 0;
  $(".u-name", unlockEl).innerHTML = c.name.split(" ").map(w => `<span class="w">${[...w].map(ch => `<span style="--i:${k++}">${ch}</span>`).join("")}</span>`).join(" ");
  $(".u-guests", unlockEl).textContent = c.guests.map(guestName).join(" + ");
  $(".u-countdown span").textContent = "SIGNAL INCOMING";
  $("#bonusTitle").textContent = c.name;
  $(".party-marquee span").textContent = c.live;
  termCache = ""; term.textContent = "";
  counterCache = "";
  startAtmosphere(c);
  warpColors(c.colors); warp("w-in");
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
  endWarp();
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
  const rel = state.curStep + fraction - scene.n, { intro, music, outro, show } = scene.time;
  if (!comboLive(scene.c)) { liveCombos.delete(scene.c.id); endScene(); return false; }
  if (rel >= show || rel < 0) { endScene(); return false; }
  const performing = rel >= intro, ending = Math.max(0, rel - intro - music);
  const section = sectionFor(scene.c, rel);
  app.classList.toggle("party-paused", !state.running);
  retroShow.parentElement.style.setProperty("--beat-time", `${clock.SPB * 4}s`);
  slots.forEach(s => s.el.classList.toggle("star", scene.c.parts.includes(s.id)));
  diskEls.forEach((el, i) => el.classList.toggle("playing", i === scene.idx));
  drawAtmosphere(rel, state.running, ending, guestEnergy(audio.ctx.currentTime), section, scene.time);
  unlockEl.hidden = performing;
  if (!performing) {
    const enter = Math.min(1, rel / 3), exit = Math.max(0, (rel - intro + 4) / 4);
    unlockEl.style.opacity = String(enter * (1 - exit));
    unlockEl.style.transform = `translate(-50%, -50%) scale(${reduce ? 1 : .92 + enter * .08 - exit * .06})`;
    countdown.forEach((el, i) => el.classList.toggle("on", rel >= intro - 16 + i * 4));
  }
  bonusEl.hidden = !performing;
  if (scene.section !== section.id) {
    scene.section = section.id;
    if (section.id === "build") warp("w-build");
    else if (section.id === "drop") warp("w-drop");
    else if (section.id === "outro") warp("w-out");
    $("#partyMessage").textContent = section.id === "groove" ? scene.c.message : scene.c.cues[section.id] ?? section.label;
    $(".u-countdown span").textContent = section.label;
  }
  if (performing) {
    const pos = Math.min(music, rel - intro);
    bonusEl.style.opacity = String(1 - ending / outro);
    drawScene(bg, scene.c.id, reduce ? Math.floor(pos / 4) * 4 : pos, music);
    const typed = scene.c.lines.filter(l => l && !l.startsWith("***")).join("\n").slice(0, Math.floor(pos * 4));
    const out = typed.split("\n").slice(-2).join("\n") + (Math.floor(rel / 4) % 2 ? "_" : " ");
    if (out !== termCache) { termCache = out; term.textContent = out; }
    const bars = music / 16;
    const label = state.running ? ending ? "SIGNING OFF" : `BAR ${Math.min(bars, Math.floor(pos / 16) + 1)} / ${bars}` : "PAUSED";
    if (label !== counterCache) { counterCache = label; counter.textContent = label; }
    progress.style.transform = `scaleX(${Math.max(0, 1 - pos / music)})`;
  }
  return true;
}
