// Stage entrances: beats stomp in, effects glitch on like a CRT, melody spins up, voices step into a spotlight,
// the choir rise in a glow under a settling halo.
import { $ } from "../util.js";

const rnd = (a, b) => a + Math.random() * (b - a);
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");
const PERSP = (y, r, s) => `perspective(500px) translateY(${y}px) rotateY(${r}deg) scale(${s})`;
const ENTER = {
  beat: {
    dur: 560, origin: "50% 100%",
    kf: [
      { transform: "translateY(-130%) scale(.9,1.12)", opacity: 0 },
      { transform: "translateY(-130%) scale(.9,1.12)", opacity: 1, offset: .08, easing: "ease-in" },
      { transform: "translateY(0) scale(.92,1.08)", offset: .45 },
      { transform: "translateY(0) scale(1.2,.78)", offset: .56 },
      { transform: "translateY(0) scale(.95,1.06)", offset: .74 },
      { transform: "none" }],
    fx: () => `<i class="ring"></i>` + rep(8, i => `<b style="--x:${(i % 2 ? 1 : -1) * rnd(20, 70)}px;--y:${-rnd(4, 26)}px;--s:${rnd(8, 18)}px;--dl:${rnd(0, 60)}ms"></b>`),
    land: 250,
  },
  fx: {
    dur: 640, origin: "50% 55%",
    kf: [
      { transform: "scale(.2,.02)", filter: "brightness(4)", opacity: 0 },
      { transform: "scale(1.1,.02)", filter: "brightness(4)", opacity: 1, offset: .15 },
      { transform: "scale(1,1.08)", filter: "brightness(2)", offset: .35 },
      { transform: "translateX(-7px) skewX(12deg)", filter: "hue-rotate(90deg) brightness(1.4)", offset: .45 },
      { transform: "translateX(6px) skewX(-8deg)", filter: "hue-rotate(-60deg) brightness(1.2)", offset: .55 },
      { transform: "translateX(-3px) skewX(3deg)", filter: "hue-rotate(30deg)", offset: .66 },
      { transform: "translateX(2px)", filter: "hue-rotate(0deg)", offset: .78 },
      { transform: "none", filter: "none" }],
    fx: () => rep(3, i => `<s style="--dl:${i * 90}ms"></s>`) + rep(12, () => `<b style="--x:${rnd(5, 95)}%;--y:${rnd(10, 90)}%;--dl:${rnd(150, 450)}ms"></b>`),
  },
  mel: {
    dur: 720, origin: "50% 60%",
    kf: [
      { transform: PERSP(40, -540, .4), opacity: 0 },
      { transform: PERSP(-14, -30, 1.05), opacity: 1, offset: .6 },
      { transform: PERSP(3, 8, .98), offset: .8 },
      { transform: PERSP(0, 0, 1) }],
    fx: () => rep(6, i => `<b style="--x:${rnd(15, 85)}%;--dx:${rnd(-30, 30)}px;--r:${rnd(-25, 25)}deg;--dl:${200 + i * 110}ms">${"♪♫♩♬"[i % 4]}</b>`),
  },
  voc: {
    dur: 680, origin: "50% 100%",
    kf: [
      { transform: "scale(.85)", filter: "brightness(0)", opacity: 0 },
      { transform: "scale(.95)", filter: "brightness(0)", opacity: 1, offset: .3 },
      { transform: "scale(1.08)", filter: "brightness(1.8)", offset: .6 },
      { transform: "none", filter: "none" }],
    fx: () => `<i class="cone"></i>` + rep(10, i => `<b style="--a:${i * 36 + rnd(-12, 12)}deg;--r:${rnd(55, 95)}px;--dl:${rnd(380, 480)}ms"></b>`),
  },
  cho: {
    dur: 760, origin: "50% 100%",
    kf: [
      { transform: "translateY(26px) scale(.92)", filter: "blur(4px) brightness(2.2)", opacity: 0 },
      { transform: "translateY(-6px) scale(1.03)", filter: "blur(0) brightness(1.6)", opacity: 1, offset: .55 },
      { transform: "none", filter: "none" }],
    fx: () => `<i class="halo"></i>` + rep(10, () => `<b style="--x:${rnd(10, 90)}%;--dy:${rnd(70, 130)}px;--dl:${rnd(0, 400)}ms"></b>`),
  },
};
export function enter(sl, cat) {
  const e = ENTER[cat]; if (!e) return;
  sl.svg.animate(e.kf.map(k => ({ transformOrigin: e.origin, ...k })), { duration: e.dur, easing: "linear" });
  const o = document.createElement("div");
  o.className = `enter enter-${cat}`; o.setAttribute("aria-hidden", "true"); o.innerHTML = e.fx();
  sl.char.appendChild(o);
  setTimeout(() => o.remove(), 1800);
  if (e.land) $("#shelf").animate([{ transform: "none" }, { transform: "translateY(4px)", offset: .3 }, { transform: "none" }], { duration: 220, delay: e.land, easing: "ease-out" });
}
export const clearEnter = sl => sl.char.querySelectorAll(".enter").forEach(o => o.remove());
