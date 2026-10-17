// Beats: the rhythm section.
import { kick, noise, tone } from "../audio/synth.js";
import { clock, mtof } from "../music.js";
import { anim, E, L, M, reel } from "./art.js";
import { chain } from "./outfits.js";

export const BEATS = [
  { id: "hdd", cat: "beat", key: "1", name: "HARD DRIVE", short: "HDD", gain: 0.85,
    art: () => `<rect class="m" x="14" y="14" width="92" height="112" rx="7"/>
      <circle class="k" cx="21" cy="21" r="2.4"/><circle class="k" cx="99" cy="21" r="2.4"/><circle class="k" cx="21" cy="119" r="2.4"/>
      <circle class="mh" cx="60" cy="58" r="36"/>
      <g class="spin" style="transform-origin:60px 58px"><path class="hl" d="M60 27 A31 31 0 0 1 89 48"/><path class="hl" d="M60 89 A31 31 0 0 1 31 68"/></g>
      ${E(60, 52, 24, 8.5)}${M(60, 72, 16, 4.5)}
      <rect class="w" x="22" y="100" width="46" height="18" rx="2"/><path class="ln" d="M27 106 H58 M27 112 H50"/>
      <g class="arm" style="transform-origin:96px 112px"><path class="k" d="M98 110 L80 80 L75 82 L92 113 Z"/><circle class="m" cx="96" cy="112" r="6.5"/></g>
      ${L(99, 21, 3, "lr")}`,
    alt: s => anim(s, ".arm", [{ transform: "rotate(0)" }, { transform: "rotate(-12deg)" }, { transform: "rotate(0)" }], 220),
    outfit: { front: `<path class="r" d="M30 17 Q30 -3 60 -3 Q90 -3 90 17 Z"/><path class="r" d="M86 17 Q100 9 114 15 Q104 21 88 21 Z"/>
      <path class="seam" d="M60 -3 V16"/><circle class="r" cx="60" cy="-3" r="3"/>${chain(28, 92, 78, 11)}` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      const pat = bar === 3 ? "x.....x...x..x.." : "x.....x...x.....";
      if (pat[b] === "x") { kick(d, t, 1); h(t, "bump alt"); }
      if (b === 3 || b === 13) {
        noise(d, t, { type: "bandpass", f: 5200, Q: 4, vol: .12, r: .02 });
        noise(d, t + clock.SPB * .5, { type: "bandpass", f: 4200, Q: 4, vol: .08, r: .02 });
        h(t, "led");
      }
    } },
  { id: "dot", cat: "beat", key: "2", name: "DOT MATRIX", short: "PRINTER", gain: 1.4,
    art: () => `<g class="paper"><rect class="w" x="26" y="4" width="68" height="64"/>
      ${[10, 18, 26, 34, 42, 50].map(y => `<circle class="hole" cx="31" cy="${y}" r="1.8"/><circle class="hole" cx="89" cy="${y}" r="1.8"/>`).join("")}
      <path class="ln" d="M38 14 H80 M38 22 H72 M38 30 H82 M38 38 H66 M38 46 H78"/></g>
      <rect class="b" x="8" y="54" width="104" height="72" rx="9"/>
      <rect class="bd" x="8" y="54" width="104" height="18" rx="8"/>
      <rect class="k" x="24" y="58" width="72" height="7" rx="3"/>
      ${E(60, 88, 26, 9)}${M(60, 108, 22, 5)}
      ${L(18, 117, 3)}${L(28, 117, 3, "lg steady")}`,
    alt: s => anim(s, ".paper", [{ transform: "translateY(0)" }, { transform: "translateY(-4px)" }, { transform: "translateY(0)" }], 160),
    outfit: { front: `<rect class="r" x="7" y="67" width="106" height="10" rx="2"/><path class="r" d="M108 72 L118 66 L117 80 Z M108 72 L120 77 L111 86 Z"/>
      ${[16, 30, 44, 58, 72, 86, 100].map(x => `<circle class="w ns" cx="${x}" cy="72" r="1.8"/>`).join("")}` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      if (b === 4 || b === 12) {
        noise(d, t, { type: "bandpass", f: 1800, Q: .7, vol: .55, r: .2 });
        noise(d, t, { type: "highpass", f: 5000, vol: .15, r: .08 });
        tone(d, t, { type: "triangle", f: 230, f2: 160, glide: .07, vol: .35, r: .1 });
        h(t, "bump alt");
      }
      if ((bar === 1 || bar === 3) && b === 7) { noise(d, t, { type: "bandpass", f: 2200, Q: 1, vol: .15, r: .06 }); h(t, "led"); }
      if (bar === 3 && b >= 14) {
        for (let i = 0; i < 4; i++) noise(d, t + i * clock.SPB / 4, { type: "bandpass", f: 3000 + i * 200, Q: 3, vol: .22, r: .025 });
        h(t, "alt led");
      }
    } },
  { id: "kbd", cat: "beat", key: "3", name: "KEYBOARD", short: "KEYBOARD", gain: 1.8,
    art: () => `<rect class="bd" x="4" y="100" width="112" height="26" rx="5"/>
      <rect class="b" x="8" y="105" width="12" height="13" rx="2"/><rect class="b" x="100" y="105" width="12" height="13" rx="2"/>
      <g class="cap"><path class="b" d="M32 18 L88 18 Q96 18 97 26 L100 90 Q100 98 92 98 L28 98 Q20 98 20 90 L23 26 Q24 18 32 18 Z"/>
      <rect class="bl" x="31" y="25" width="58" height="56" rx="8"/>${E(60, 47, 22, 8)}${M(60, 67, 16, 5)}</g>`,
    alt: s => anim(s, ".cap", [{ transform: "translateY(0)" }, { transform: "translateY(5px)" }, { transform: "translateY(0)" }], 120),
    outfit: { front: `<g class="cap"><path class="beanie" d="M30 25 Q30 1 60 1 Q90 1 90 25 Z"/><rect class="beanie2" x="27" y="17" width="66" height="11" rx="4"/>
      <path class="seam" d="M38 19 V26 M46 19 V26 M54 19 V26 M62 19 V26 M70 19 V26 M78 19 V26"/><circle class="w" cx="60" cy="0" r="6"/></g>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      const acc = b % 4 === 2 ? 1 : b % 2 === 0 ? .6 : .35;
      noise(d, t, { type: "highpass", f: 7000, vol: .16 * acc, r: .03 + (b % 4 === 2 ? .03 : 0) });
      tone(d, t, { type: "square", f: 2400, vol: .025 * acc, r: .008 });
      if (b % 2 === 0) h(t, "alt");
      if (b === 14 && (bar & 1)) {
        noise(d, t, { type: "bandpass", f: 450, Q: 2, vol: .35, r: .06 });
        tone(d, t, { f: 170, vol: .2, r: .05 });
        h(t, "bump");
      }
    } },
  { id: "mouse", cat: "beat", key: "4", name: "BALL MOUSE", short: "MOUSE", gain: 2.6,
    art: () => `<path class="cord" d="M60 52 C60 36 80 38 80 22 C80 10 66 8 62 2"/>
      <path class="b" d="M60 50 C90 50 102 72 102 94 C102 116 86 126 60 126 C34 126 18 116 18 94 C18 72 30 50 60 50 Z"/>
      <path class="bl btnL" d="M58 53 C38 54 23 66 21 82 L58 82 Z"/>
      <path class="bl btnR" d="M62 53 C82 54 97 66 99 82 L62 82 Z"/>
      ${E(60, 98, 24, 8)}${M(60, 115, 14, 4)}`,
    alt: s => {
      anim(s, ".btnL", [{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], 110);
      setTimeout(() => anim(s, ".btnL", [{ transform: "translateY(0)" }, { transform: "translateY(3px)" }, { transform: "translateY(0)" }], 110), clock.SPB * 500);
    },
    outfit: { front: `<g transform="rotate(-12 60 52)"><path class="au" d="M37 58 Q37 35 60 35 Q83 35 83 58 Z"/><path class="au" d="M30 58 H98 Q99 64 92 64 H30 Z"/>
      <circle class="au" cx="60" cy="35" r="2.6"/><rect class="w" x="54" y="44" width="12" height="8" rx="1.5"/></g>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      const v = b % 4 === 2 ? 1 : b % 2 ? .45 : .3;
      noise(d, t, { type: "bandpass", f: 6500, Q: 1.2, a: .012, vol: .14 * v, r: .05 });
      if (b % 4 === 2) h(t, "bump");
      if ((bar === 1 || bar === 3) && b === 8) {
        for (const dt of [0, clock.SPB * .5]) {
          tone(d, t + dt, { type: "square", f: 2600, vol: .06, r: .01 });
          noise(d, t + dt, { type: "bandpass", f: 3200, Q: 3, vol: .25, r: .015 });
        }
        h(t, "alt");
      }
    } },
  { id: "tape", cat: "beat", key: "5", name: "TAPE DRIVE", short: "TAPE", gain: 1,
    art: () => `<rect class="m" x="16" y="6" width="88" height="120" rx="6"/>
      <rect class="mh" x="22" y="12" width="76" height="48" rx="4"/>
      <path class="tape" d="M25 34 L32 54 L88 54 L95 34"/>
      ${reel(40, 34)}${reel(80, 34)}
      ${E(60, 78, 26, 8.5)}${M(60, 96, 18, 4.5)}
      ${[26, 40, 54, 68].map(x => `<rect class="bd" x="${x}" y="106" width="11" height="8" rx="1.5"/>`).join("")}
      ${L(92, 110, 3, "lr")}`,
    outfit: { front: `<path class="hband" d="M14 40 Q14 -8 60 -8 Q106 -8 106 40"/>
      <rect class="k2" x="5" y="28" width="15" height="28" rx="6"/><rect class="pad" x="15" y="31" width="6" height="22" rx="3"/>
      <rect class="k2" x="100" y="28" width="15" height="28" rx="6"/><rect class="pad" x="99" y="31" width="6" height="22" rx="3"/>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      if (b === 3 || (bar === 3 && b === 13)) { tone(d, t, { f: mtof(57), f2: mtof(50), glide: .15, vol: .45, r: .25 }); h(t, "bump"); }
      if (b === 11) { tone(d, t, { f: mtof(52), f2: mtof(45), glide: .15, vol: .5, r: .3 }); h(t, "bump"); }
      if (b === 7 || (b === 15 && (bar & 1))) {
        tone(d, t, { type: "triangle", f: 820, vol: .18, r: .03 });
        noise(d, t, { type: "bandpass", f: 2600, Q: 2, vol: .22, r: .035 });
        h(t, "led");
      }
    } },
];
