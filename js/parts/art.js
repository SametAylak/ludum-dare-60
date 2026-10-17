// SVG building blocks for the parts, and the on-stage figure wrapper.
import { WEAR } from "./outfits.js";


export const E = (x, y, g = 22, r = 8) =>
  `<g class="eyes"><circle class="ew" cx="${x - g / 2}" cy="${y}" r="${r}"/><circle class="ew" cx="${x + g / 2}" cy="${y}" r="${r}"/>` +
  `<circle class="ep" cx="${x - g / 2 + r * .22}" cy="${y + r * .15}" r="${r * .48}"/><circle class="ep" cx="${x + g / 2 + r * .22}" cy="${y + r * .15}" r="${r * .48}"/>` +
  `<circle class="es" cx="${x - g / 2 + r * .05}" cy="${y - r * .2}" r="${r * .16}"/><circle class="es" cx="${x + g / 2 + r * .05}" cy="${y - r * .2}" r="${r * .16}"/></g>`;
export const M = (x, y, w = 14, h = 4, cls = "") => `<rect class="mouth ${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}"/>`;
export const L = (x, y, r = 3.2, c = "") => `<circle class="ledb" cx="${x}" cy="${y}" r="${r}"/><circle class="lit ${c}" cx="${x}" cy="${y}" r="${r}"/>`;
const rad = a => a * Math.PI / 180;
export const reel = (cx, cy, r = 16) =>
  `<g class="spin" style="transform-origin:${cx}px ${cy}px"><circle class="k" cx="${cx}" cy="${cy}" r="${r}"/><circle class="mh" cx="${cx}" cy="${cy}" r="${r * .3}"/>` +
  [0, 120, 240].map(a => `<circle class="m" cx="${(cx + r * .56 * Math.cos(rad(a))).toFixed(1)}" cy="${(cy + r * .56 * Math.sin(rad(a))).toFixed(1)}" r="${(r * .21).toFixed(1)}"/>`).join("") + `</g>`;
export const spool = (cx, cy) =>
  `<circle class="ew" cx="${cx}" cy="${cy}" r="9.5"/><g class="spin" style="transform-origin:${cx}px ${cy}px"><circle class="k" cx="${cx}" cy="${cy}" r="5"/>` +
  [0, 120, 240].map(a => `<rect class="w ns" x="${cx - 1}" y="${cy - 5}" width="2" height="3" transform="rotate(${a} ${cx} ${cy})"/>`).join("") + `</g>`;
export const anim = (svg, sel, kf, dur, ease = "ease-out") => svg.querySelectorAll(sel).forEach(el => el.animate(kf, { duration: dur, easing: ease }));

// Palette icons use the bare part; on stage every part stands on legs and wears its costume, Incredibox-style.
const legs = (wear = "") => `<ellipse class="shadow" cx="60" cy="178" rx="40" ry="5"/>
  <path class="leg" d="M47 118 V167 M73 118 V167"/>${wear && `<g class="outfit">${wear}</g>`}
  <path class="shoe" d="M34 177 Q34 164 46 164 Q54 164 55 171 L55 177 Z"/><path class="shoe" d="M86 177 Q86 164 74 164 Q66 164 65 171 L65 177 Z"/>
  <ellipse class="shoe-hi" cx="44" cy="168" rx="4" ry="1.8"/><ellipse class="shoe-hi" cx="76" cy="168" rx="4" ry="1.8"/>`;
const fit = s => s ? `<g class="outfit">${s}</g>` : "";
const bd = () => (-Math.random() * 5).toFixed(2);
export const artSvg = (p, mini) => mini
  ? `<svg class="art" viewBox="0 0 120 130" style="--bd:${bd()}s" aria-hidden="true"><g class="bump">${p.svg}</g></svg>`
  : `<svg class="art fig" viewBox="0 -4 120 188" style="--bd:${bd()}s" aria-hidden="true">${legs(WEAR[p.cat])}<g class="bob"><g class="bump">${fit(p.outfit?.back)}${p.svg}${fit(p.outfit?.front)}</g></g></svg>`;
export const emptySvg = () =>
  `<svg class="art fig empty" viewBox="0 -4 120 188" style="--bd:${bd()}s" aria-hidden="true">${legs()}<g class="idle">
    <rect class="gb" x="22" y="28" width="76" height="98" rx="16"/>
    <rect class="gs" x="32" y="40" width="56" height="44" rx="10"/>
    <path class="closed" d="M42 60 Q48 65 54 60 M66 60 Q72 65 78 60 M55 73 H65"/>
    <rect class="gs" x="34" y="98" width="30" height="7" rx="3.5"/><circle class="gs" cx="84" cy="106" r="4"/>
    <path class="gb" d="M58 28 V14"/><circle class="gb" cx="58" cy="11" r="4"/></g></svg>`;
