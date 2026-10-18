// The night sky behind the stage: neon comets raining toward the band and twinkling bokeh dots. Pure CSS animation once built.
import { $, reduce } from "../util.js";

const COLS = ["#38c6ea", "#a5d83a", "#ff9636", "#ff5d9e", "#a07cff", "#5cf5d0", "#ffe36a"];
const r = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];

export function initSky() {
  const sky = $("#sky"), f = document.createDocumentFragment();
  for (let i = 0; i < 70; i++) {
    const b = document.createElement("b"), soft = i < 12;
    if (soft) b.className = "soft";
    b.style.cssText = `left:${r(0, 100)}%;top:${r(0, 75)}%;--s:${soft ? r(30, 80) : r(3, 12)}px;--c:${pick(COLS)};--d:${soft ? r(8, 14) : r(2, 5)}s;--dl:${-r(0, 8)}s;opacity:${soft ? r(.08, .2) : r(.4, .95)}`;
    f.append(b);
  }
  // comets come in from both sides and slant toward the middle of the floor
  if (!reduce) for (let i = 0; i < 10; i++) {
    const L = i % 2 === 0, x = L ? r(-10, 42) : r(58, 110), c = document.createElement("i");
    c.style.cssText = `left:${x}%;top:${r(-25, 30)}%;--a:${L ? r(48, 68) : r(112, 132)}deg;--c:${pick(COLS)};--len:${r(120, 260)}px;--d:${r(9, 16)}s;--dl:${-r(0, 16)}s;--z:${r(.6, 1.15)}`;
    f.append(c);
  }
  sky.append(f);
}
