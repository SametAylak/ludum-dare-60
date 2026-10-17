// Small shared helpers.

export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const $ = (s, r = document) => r.querySelector(s);
export const fillRange = el => el.style.setProperty("--f", (el.value - el.min) / (el.max - el.min) * 100 + "%");
