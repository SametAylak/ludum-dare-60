// The full parts catalog.

import beats from "./beats.js";
import effects from "./effects.js";
import melody from "./melody.js";
import voices from "./voices.js";

export const CATS = {
  beat: { label: "BEATS", color: "var(--c-beat)" },
  fx: { label: "EFFECTS", color: "var(--c-fx)" },
  mel: { label: "MELODY", color: "var(--c-mel)" },
  voc: { label: "VOICES", color: "var(--c-voc)" },
};

export const PARTS = [...beats, ...effects, ...melody, ...voices];
export const byId = Object.fromEntries(PARTS.map(p => [p.id, p]));
PARTS.forEach(p => { p.svg = p.art(); });

// Full drawing for the stage; `mini` drops the ground shadow for keycaps and the drag ghost.
export const artSvg = (p, mini) =>
  `<svg class="art" viewBox="0 0 120 130" style="--bd:${(-Math.random() * 5).toFixed(2)}s" aria-hidden="true">` +
  (mini ? "" : `<ellipse class="shadow" cx="60" cy="127" rx="46" ry="4"/>`) +
  `<g class="bump">${p.svg}</g></svg>`;
