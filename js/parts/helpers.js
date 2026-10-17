// SVG building blocks shared by the part drawings (viewBox 0 0 120 130, ground at y≈126).

export const E = (x, y, g = 22, r = 8) =>
  `<g class="eyes"><circle class="ew" cx="${x - g / 2}" cy="${y}" r="${r}"/><circle class="ew" cx="${x + g / 2}" cy="${y}" r="${r}"/>` +
  `<circle class="ep" cx="${x - g / 2 + r * .22}" cy="${y + r * .15}" r="${r * .48}"/><circle class="ep" cx="${x + g / 2 + r * .22}" cy="${y + r * .15}" r="${r * .48}"/>` +
  `<circle class="es" cx="${x - g / 2 + r * .05}" cy="${y - r * .2}" r="${r * .16}"/><circle class="es" cx="${x + g / 2 + r * .05}" cy="${y - r * .2}" r="${r * .16}"/></g>`;

export const M = (x, y, w = 14, h = 4, cls = "") =>
  `<rect class="mouth ${cls}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}"/>`;

export const L = (x, y, r = 3.2, c = "") =>
  `<circle class="ledb" cx="${x}" cy="${y}" r="${r}"/><circle class="lit ${c}" cx="${x}" cy="${y}" r="${r}"/>`;

const rad = a => a * Math.PI / 180;

export const reel = (cx, cy, r = 16) =>
  `<g class="spin" style="transform-origin:${cx}px ${cy}px"><circle class="k" cx="${cx}" cy="${cy}" r="${r}"/><circle class="mh" cx="${cx}" cy="${cy}" r="${r * .3}"/>` +
  [0, 120, 240].map(a => `<circle class="m" cx="${(cx + r * .56 * Math.cos(rad(a))).toFixed(1)}" cy="${(cy + r * .56 * Math.sin(rad(a))).toFixed(1)}" r="${(r * .21).toFixed(1)}"/>`).join("") + `</g>`;

export const spool = (cx, cy) =>
  `<circle class="ew" cx="${cx}" cy="${cy}" r="9.5"/><g class="spin" style="transform-origin:${cx}px ${cy}px"><circle class="k" cx="${cx}" cy="${cy}" r="5"/>` +
  [0, 120, 240].map(a => `<rect class="w ns" x="${cx - 1}" y="${cy - 5}" width="2" height="3" transform="rotate(${a} ${cx} ${cy})"/>`).join("") + `</g>`;

// Runs a one-shot Web Animation on every element matching `sel` inside a part's svg.
export const anim = (svg, sel, kf, dur, ease = "ease-out") =>
  svg.querySelectorAll(sel).forEach(el => el.animate(kf, { duration: dur, easing: ease }));
