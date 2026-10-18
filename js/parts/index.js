// Every part, by category.
import { BEATS } from "./beats.js";
import { EFFECTS } from "./effects.js";
import { MELODY } from "./melody.js";
import { VOICES } from "./voices.js";
import { CHOIR } from "./choir.js";

export const CATS = {
  beat: { label: "BEATS", color: "var(--c-beat)" },
  fx: { label: "EFFECTS", color: "var(--c-fx)" },
  mel: { label: "MELODY", color: "var(--c-mel)" },
  voc: { label: "VOICES", color: "var(--c-voc)" },
  cho: { label: "CHOIR", color: "var(--c-cho)" },
};
export const PARTS = [...BEATS, ...EFFECTS, ...MELODY, ...VOICES, ...CHOIR];
export const byId = Object.fromEntries(PARTS.map(p => [p.id, p]));
PARTS.forEach(p => { p.svg = p.art(); });
