// The bonus show: detection, unlock card, monitor scene and spotlights.
import { audio } from "../audio/engine.js";
import { COMBOS, DISK_COLORS } from "./combos.js";
import { drawScene } from "./scenes.js";
import { app } from "../dom.js";
import { clock } from "../music.js";
import { liveCombos, saveBonus, slots, state, unlocked } from "../state.js";
import { burst } from "../ui/confetti.js";
import { diskEls } from "../ui/hud.js";
import { shelf } from "../ui/stage.js";
import { $, reduce } from "../util.js";

const term = $("#term");
const bonusEl = $("#bonus");
const unlockEl = $("#unlock");
const flashEl = $("#flashfx");
const bg = $("#bscene").getContext("2d");
let termCache = "";


/* ---- bonus show timeline (in steps from the bar it was detected on):
   0-31 unlock card (fanfare plays on bar 2), 32-159 monitor scene + bonus music, then it ends ---- */
const CARD_END = 32;
const SCENE_END = 32 + 128;
function startScene(c, n) {
  const idx = COMBOS.indexOf(c), first = !unlocked.has(c.id);
  state.scene = { c, n, idx, first, flown: false, monAt: 0 };
  state.bonusMus = { id: c.id, from: n + CARD_END, to: n + SCENE_END };
  state.pendingFanfare = true;
  if (first) { unlocked.add(c.id); saveBonus(); }
  unlockEl.style.setProperty("--c", DISK_COLORS[idx]);
  bonusEl.style.setProperty("--c", DISK_COLORS[idx]);
  $(".u-kicker", unlockEl).textContent = first ? "NEW BONUS UNLOCKED" : "BONUS!";
  $(".u-name", unlockEl).textContent = c.name;
  unlockEl.hidden = false;
  unlockEl.animate([
    { transform: "translate(-50%, -50%) scale(.2) rotate(-12deg)", opacity: 0 },
    { transform: "translate(-50%, -50%) scale(1.12) rotate(3deg)", opacity: 1, offset: .65 },
    { transform: "translate(-50%, -50%) scale(1) rotate(0)", opacity: 1 }], { duration: reduce ? 1 : 600, easing: "cubic-bezier(.2,.8,.3,1.2)" });
  if (reduce) return;
  flashEl.animate([{ opacity: .85 }, { opacity: 0 }], { duration: 450, easing: "ease-out" });
  shelf.animate([{ transform: "translate(0,0)" }, { transform: "translate(-6px,3px)" }, { transform: "translate(5px,-3px)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(0,0)" }], { duration: 380 });
  const r = $(".bdisk", unlockEl).getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2);
}
function flyOut() {
  state.scene.flown = true;
  const idx = state.scene.idx, src = $(".bdisk", unlockEl), a = src.getBoundingClientRect(), b = diskEls[idx].getBoundingClientRect();
  unlockEl.animate([{ opacity: 1, transform: "translate(-50%, -50%) scale(1)" }, { opacity: 0, transform: "translate(-50%, -50%) scale(.85)" }],
    { duration: 350, easing: "ease-in", fill: "forwards" }).onfinish = () => { unlockEl.hidden = true; unlockEl.getAnimations().forEach(x => x.cancel()); };
  const pulse = () => diskEls[idx].animate([{ transform: "scale(1)" }, { transform: "scale(1.9)" }, { transform: "scale(1)" }], { duration: 500, easing: "ease-out" });
  if (reduce || !a.width || !b.width) { pulse(); return; }
  const fly = document.createElement("div");
  fly.className = "flydisk";
  fly.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;--c:${DISK_COLORS[idx]}`;
  fly.appendChild(src.cloneNode(true));
  document.body.appendChild(fly);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  fly.animate([{ transform: "translate(0,0) scale(1) rotate(0)" }, { transform: `translate(${dx}px, ${dy}px) scale(${b.width / a.width}) rotate(360deg)` }],
    { duration: 650, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }).onfinish = () => { fly.remove(); pulse(); };
}
function endScene() {
  state.scene = null; state.bonusMus = null;
  unlockEl.hidden = true; bonusEl.hidden = true;
  app.classList.remove("party");
  slots.forEach(s => s.el.classList.remove("star"));
}
const sceneRel = () => state.scene ? state.curStep - state.scene.n : 0;
const isStar = sl => !!(state.scene && sl.id && state.scene.c.parts.includes(sl.id));
function comboLive(c) {
  return c.parts.every(id => { const s = slots.find(x => x.id === id); return s && s.audible && state.curStep >= s.start; });
}
// Called on every bar: start a show when a trio first becomes audible together.
export function checkCombos(n) {
  for (const c of COMBOS) {
    const live = comboLive(c);
    if (live && !liveCombos.has(c.id)) {
      liveCombos.add(c.id);
      startScene(c, n);
    } else if (!live) liveCombos.delete(c.id);
  }
}
// Per frame; returns whether a show is on screen.
export function updateShow(now) {
  const cursor = Math.floor(now / 500) % 2 ? "_" : " ";
  if (state.scene && (!liveCombos.has(state.scene.c.id) || sceneRel() >= SCENE_END)) endScene();
  const rel = sceneRel(), show = !!state.scene && state.running;
  app.classList.toggle("party", show);
  slots.forEach(s => s.el.classList.toggle("star", show && isStar(s)));
  if (state.scene && !state.scene.flown && rel >= CARD_END - 2) flyOut();
  bonusEl.hidden = !(show && rel >= CARD_END);
  if (!bonusEl.hidden) {
    if (!state.scene.monAt) state.scene.monAt = now;
    drawScene(bg, state.scene.c.id, state.curStep + Math.min(1, (audio.ctx.currentTime - state.curT) / clock.SPB) - state.scene.n - CARD_END);
    const typed = state.scene.c.lines.filter(l => l && !l.startsWith("***")).join("\n").slice(0, Math.floor((now - state.scene.monAt) / 1000 * 30));
    const out = typed.split("\n").slice(-2).join("\n") + cursor;
    if (out !== termCache) { termCache = out; term.textContent = out; }
  }
  return show;
}
