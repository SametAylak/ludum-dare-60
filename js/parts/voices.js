// Voices: the singers.
import { tone, voice } from "../audio/synth.js";
import { CHORDS, clock, mtof } from "../music.js";
import { anim, E, L, M, reel } from "./art.js";

const SPEECH = [
  [[0, 64, 6, "u"], [6, 62, 2, "a"], [8, 60, 8, "a"]],
  [[0, 60, 6, "u"], [6, 62, 2, "a"], [8, 57, 8, "o"]],
  [[0, 64, 6, "u"], [6, 65, 2, "a"], [8, 67, 8, "a"]],
  [[0, 62, 6, "u"], [6, 60, 2, "a"], [8, 59, 8, "o"]],
];
const WHISTLE = [
  [[0, 76, 8], [8, 81, 8]],
  [[0, 77, 12], [12, 76, 4]],
  [[0, 79, 8], [8, 76, 8]],
  [[0, 74, 6], [6, 79, 6], [12, 71, 4]],
];
const TOWER = [[0, 0], [3, 0], [8, 0], [11, 7], [14, 12]];
let whistleLast = 0;
let stickDir = 1;

export const VOICES = [
  { id: "speech", cat: "voc", key: "Z", name: "SPEECH CHIP", short: "SPEECH", gain: 0.4, send: .25, mo: 2.2,
    art: () => `${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect class="m" x="12" y="${28 + i * 11}" width="14" height="5" rx="1"/><rect class="m" x="94" y="${28 + i * 11}" width="14" height="5" rx="1"/>`).join("")}
      <rect class="k" x="22" y="18" width="76" height="108" rx="4"/>
      <path class="k2" d="M50 18 A10 10 0 0 0 70 18 Z"/><circle class="k2" cx="32" cy="30" r="3"/>
      ${E(60, 56, 30, 11)}${M(60, 86, 26, 7)}
      <text class="chip-t" x="60" y="116">VOX-1</text>`,
    outfit: { front: `<path class="au" d="M36 21 L40 6 L49 14 L60 -2 L71 14 L80 6 L84 21 Z"/><circle class="gem" cx="60" cy="12" r="4"/>
      <circle class="gem" cx="44" cy="16" r="2.4"/><circle class="gem" cx="76" cy="16" r="2.4"/>` },
    play(s, t, d, h) {
      const b = s & 15;
      for (const [st, n, len, v] of SPEECH[s >> 4]) if (st === b) {
        const dur = clock.SPB * len;
        voice(d, t, { f: mtof(n), vowel: v, vol: .22, a: .03, hold: dur * .8, r: .1 });
        h(t, "bump mouth", dur);
      }
    } },
  { id: "mainframe", cat: "voc", key: "X", name: "MAINFRAME", short: "MAINFRAME", gain: 0.7, send: .2,
    art: () => `<rect class="ibm" x="12" y="4" width="96" height="122" rx="3"/>
      <rect class="k" x="20" y="10" width="80" height="34" rx="2"/>${reel(40, 27, 12)}${reel(80, 27, 12)}
      ${E(60, 60, 30, 9)}${M(60, 78, 22, 5)}
      <rect class="k" x="20" y="88" width="80" height="30" rx="2"/>
      ${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5, 6, 7].map(c => {
        const col = ["var(--amber)", "var(--phos)", "var(--red)"][(r + c * 2) % 3];
        return `<circle class="lp" cx="${27 + c * 9.4}" cy="${95 + r * 8}" r="2.6" style="--c:${col};--t:${(.5 + ((r * 7 + c * 3) % 5) * .23).toFixed(2)}s;--d:-${((r * 5 + c * 7) % 9 * .17).toFixed(2)}s"/>`;
      }).join("")).join("")}`,
    outfit: { front: `<rect class="k" x="36" y="-26" width="48" height="30" rx="2"/><rect class="r ns" x="37.3" y="-7" width="45.4" height="7"/>
      <rect class="k" x="24" y="2" width="72" height="6" rx="3"/>
      <circle class="mono" cx="75" cy="60" r="12"/><path class="mchain" d="M86 65 Q92 82 86 92"/>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4, ch = CHORDS[bar];
      if (b === 0) {
        const dur = clock.SPB * 16;
        ch.n.forEach((n, i) => voice(d, t, { f: mtof(n), vowel: bar % 2 ? "o" : "a", vol: .09, a: .25, hold: dur - .5, r: .35, scoop: 1, vib: .008, vibRate: 4.5 + i * .4 }));
        h(t, "mouth", dur * .95);
      }
      if (b % 4 === 0) h(t, "bump");
    } },
  { id: "tower", cat: "voc", key: "C", name: "TOWER PC", short: "TOWER", gain: 0.7,
    art: () => `<rect class="b" x="28" y="4" width="64" height="122" rx="5"/>
      <rect class="bd" x="34" y="11" width="52" height="13" rx="2"/><path class="ln" d="M38 18 H82"/>
      <rect class="bd" x="34" y="27" width="52" height="13" rx="2"/><path class="ln" d="M38 34 H82"/>
      <rect class="bd" x="44" y="44" width="32" height="9" rx="2"/><rect class="k ns" x="49" y="47.5" width="22" height="2.4"/>
      ${E(60, 68, 22, 7.5)}${M(60, 85, 14, 4)}
      <rect class="k" x="35" y="98" width="24" height="14" rx="2"/><text class="seg-t" x="47" y="109.5">66</text>
      <rect class="bd" x="64" y="98" width="20" height="6" rx="1.5"/><rect class="bd" x="64" y="107" width="20" height="8" rx="1.5"/>
      ${L(40, 119, 2.4, "lg steady")}${L(48, 119, 2.4)}
      <rect class="k" x="32" y="124" width="10" height="3"/><rect class="k" x="78" y="124" width="10" height="3"/>`,
    outfit: { back: `<path class="hair" d="M27 14 Q22 -14 54 -16 Q80 -18 96 -4 Q86 -6 80 0 Q92 4 93 14 Z"/>`,
      front: `<path class="hl ns" d="M40 -6 Q52 -12 66 -11"/>` },
    play(s, t, d, h) {
      const b = s & 15, ch = CHORDS[s >> 4];
      for (const [st, iv] of TOWER) if (st === b) {
        voice(d, t, { f: mtof(ch.root + iv), vowel: st === 0 ? "o" : "u", vol: .35, a: .01, hold: clock.SPB * .8, r: .08, scoop: .9, vib: 0 });
        h(t, "bump mouth led", clock.SPB * 1.2);
      }
    } },
  { id: "scope", cat: "voc", key: "V", name: "OSCILLOSCOPE", short: "SCOPE", gain: 0.55, send: .35, mo: 2.8,
    art: () => `<path class="handle" d="M30 22 Q30 10 42 10 L78 10 Q90 10 90 22"/>
      <rect class="osc" x="6" y="22" width="108" height="104" rx="6"/>
      <rect class="k" x="13" y="30" width="66" height="62" rx="6"/>
      <rect class="scr" x="17" y="34" width="58" height="54" rx="5"/>
      <path class="grid" d="M17 61 H75 M46 34 V88 M17 47 H75 M17 75 H75 M31 34 V88 M60 34 V88"/>
      <g class="eyes"><g class="look" data-m="3"><rect class="ph" x="32" y="42" width="8" height="10" rx="1"/><rect class="ph" x="52" y="42" width="8" height="10" rx="1"/></g></g>
      <path class="mouth wave" d="M22 70 Q27 65 32 70 T42 70 T52 70 T62 70 T72 70"/>
      <circle class="k" cx="96" cy="44" r="8"/><path class="kt" d="M96 44 L96 37"/>
      <circle class="k" cx="96" cy="68" r="6.5"/><path class="kt" d="M96 68 L101 64"/>
      <circle class="m" cx="26" cy="108" r="5.5"/><circle class="m" cx="46" cy="108" r="5.5"/>
      ${L(96, 108, 3, "lg steady")}`,
    outfit: { front: `<rect class="k2" x="0" y="40" width="9" height="22" rx="4"/><path class="boom" d="M5 58 Q4 78 18 76"/><circle class="k2" cx="20" cy="76" r="4.5"/>` },
    play(s, t, d, h) {
      const b = s & 15;
      for (const [st, n, len] of WHISTLE[s >> 4]) if (st === b) {
        const dur = clock.SPB * len, f = mtof(n);
        tone(d, t, { f: whistleLast || f, f2: f, glide: .09, vol: .12, a: .04, hold: dur * .85, r: .12, vib: .012, vibRate: 5.5 });
        whistleLast = f;
        h(t, "bump mouth", dur);
      }
    } },
  { id: "joystick", cat: "voc", key: "B", name: "JOYSTICK", short: "JOYSTICK", gain: 0.65, send: .2,
    art: () => `<path class="k2" d="M12 126 L20 86 Q22 76 32 76 L88 76 Q98 76 100 86 L108 126 Z"/>
      <g class="stick" style="transform-origin:60px 82px"><rect class="k" x="56" y="30" width="8" height="54" rx="3"/><circle class="r" cx="60" cy="26" r="15"/><circle class="hi" cx="55" cy="21" r="4"/></g>
      <ellipse class="k" cx="60" cy="82" rx="15" ry="5"/><ellipse class="r" cx="90" cy="82" rx="7" ry="3.2"/>
      ${E(60, 100, 26, 8.5)}${M(60, 116, 16, 4.5)}`,
    alt: s => { stickDir = -stickDir; anim(s, ".stick", [{ transform: "rotate(0)" }, { transform: `rotate(${14 * stickDir}deg)` }, { transform: "rotate(0)" }], 260); },
    outfit: { front: `<g class="stick" style="transform-origin:60px 82px"><path class="au" d="M48 14 L46 1 L54 8 L60 -3 L66 8 L74 1 L72 14 Z"/><circle class="gem" cx="60" cy="8" r="2.4"/></g>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4, ch = CHORDS[bar];
      if (b === 2 || b === 6 || b === 10 || b === 14 || (bar === 3 && b === 15)) {
        const v = (b === 6 || b === 14) ? "a" : "i";
        for (const n of [ch.n[1], ch.n[2]]) voice(d, t, { f: mtof(n), vowel: v, vol: .16, a: .01, hold: clock.SPB * .6, r: .06, scoop: 1.04, vib: 0 });
        h(t, "bump alt mouth", clock.SPB);
      }
    } },
];
