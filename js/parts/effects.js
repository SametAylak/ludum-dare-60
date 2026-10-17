// Effects: texture and ear candy.
import { noise, tone } from "../audio/synth.js";
import { CHORDS, clock, mtof } from "../music.js";
import { anim, E, L, M, spool } from "./art.js";
import { shades } from "./outfits.js";

const DTMF = [[697, 1209], [770, 1336], [852, 1477], [941, 1336], [697, 1336], [770, 1209], [852, 1209], [941, 1477]];

export const EFFECTS = [
  { id: "modem", cat: "fx", key: "Q", name: "MODEM", short: "MODEM", gain: 1.1, ledRand: true, send: .25,
    art: () => `<rect class="b" x="6" y="56" width="108" height="70" rx="9"/>
      <rect class="bd" x="6" y="56" width="108" height="14" rx="8"/>
      <path class="k2" d="M18 40 Q20 26 36 26 L84 26 Q100 26 102 40 L102 46 L88 46 Q86 38 80 38 L40 38 Q34 38 32 46 L18 46 Z"/>
      <rect class="k2" x="10" y="42" width="30" height="20" rx="7"/><rect class="k2" x="80" y="42" width="30" height="20" rx="7"/>
      ${E(60, 86, 26, 8.5)}${M(60, 103, 16, 4)}
      ${[20, 34, 48, 72, 86, 100].map(x => L(x, 116, 3, "lg")).join("")}`,
    outfit: { front: shades(60, 86, 27, 25, 16) },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      if (bar === 0 && b % 2 === 0 && b < 12) {
        const [lo, hi] = DTMF[(b / 2) % 8];
        tone(d, t, { f: lo, vol: .07, hold: clock.SPB * .7, r: .02 });
        tone(d, t, { f: hi, vol: .07, hold: clock.SPB * .7, r: .02 });
        h(t, "led bump");
      }
      if (bar === 1) {
        if (b === 0) { tone(d, t, { f: 2100, vol: .05, a: .02, hold: clock.SPB * 5, r: .05 }); h(t, "led"); }
        if (b === 8) { noise(d, t, { type: "bandpass", f: 1800, Q: .8, vol: .18, a: .02, hold: clock.SPB * 3, r: .1 }); h(t, "bump led"); }
        if (b === 12 || b === 14) { tone(d, t, { type: "triangle", f: 1650, f2: 2400, glide: clock.SPB, vol: .06, r: clock.SPB }); h(t, "led"); }
      }
      if (bar === 2 && "x.xxx.x.xx.x.xxx"[b] === "x") {
        const f = (b & 1) ? 1270 : 1070;
        tone(d, t, { type: "triangle", f, vol: .09, hold: clock.SPB * .4, r: .02 });
        tone(d, t + clock.SPB * .5, { type: "triangle", f: f + 200, vol: .07, hold: clock.SPB * .3, r: .02 });
        h(t, b % 4 === 0 ? "led bump" : "led");
      }
      if (bar === 3) {
        if (b === 0) {
          noise(d, t, { type: "bandpass", f: 2400, Q: 5, vol: .25, a: .01, hold: clock.SPB * 5, r: .1 });
          tone(d, t, { type: "sawtooth", f: 2400, f2: 1200, glide: clock.SPB * 6, vol: .03, hold: clock.SPB * 5, r: .1, lp: 3000 });
          h(t, "bump led");
        }
        if (b === 8 || b === 10 || b === 12) { tone(d, t, { type: "square", f: b === 12 ? 880 : 1320, vol: .03, hold: clock.SPB * .8, r: .03, lp: 3000 }); h(t, "led"); }
      }
    } },
  { id: "crt", cat: "fx", key: "W", name: "CRT MONITOR", short: "CRT", gain: 1.4,
    art: () => `<rect class="bd" x="46" y="102" width="28" height="12"/>
      <rect class="b" x="26" y="110" width="68" height="16" rx="5"/>
      <rect class="b" x="6" y="6" width="108" height="100" rx="11"/>
      <rect class="bd" x="14" y="13" width="92" height="78" rx="9"/>
      <rect class="scr" x="20" y="18" width="80" height="66" rx="12"/>
      <rect class="flash" x="20" y="18" width="80" height="66" rx="12"/>
      <g class="eyes"><g class="look" data-m="4"><rect class="ph" x="38" y="36" width="11" height="15" rx="1"/><rect class="ph" x="71" y="36" width="11" height="15" rx="1"/></g></g>
      ${M(60, 64, 22, 5, "ph")}
      <rect class="hi" x="26" y="23" width="16" height="5" rx="2.5"/>
      <circle class="bd" cx="88" cy="98" r="3"/>${L(100, 98, 3, "lg steady")}`,
    alt: s => anim(s, ".flash", [{ opacity: .75 }, { opacity: 0 }], 320),
    outfit: { back: `<path class="hawk" d="M28 12 L30 -8 L42 6 L46 -20 L56 4 L62 -26 L68 4 L76 -20 L80 6 L92 -8 L94 12 Z"/>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      if ((bar === 0 || bar === 2) && b === 0) {
        tone(d, t, { type: "sawtooth", f: 62, vol: .3, a: .01, r: 1.1, lp: 420, vib: .25, vibRate: 13 });
        noise(d, t, { type: "lowpass", f: 500, vol: .25, r: .6 });
        h(t, "bump alt mouth", .6);
      }
      if (bar === 1 && b === 8) {
        noise(d, t, { type: "highpass", f: 2500, vol: .2, r: .3 });
        for (let i = 0; i < 5; i++) noise(d, t + i * .03, { type: "highpass", f: 6000, vol: .15, r: .01 });
        h(t, "alt");
      }
      if (bar === 3 && b === 0) noise(d, t, { type: "bandpass", f: 300, f2: 6000, Q: 3, vol: .2, a: clock.SPB * 15, r: .05 });
      if (bar === 3 && b % 4 === 0) h(t, "alt");
    } },
  { id: "cassette", cat: "fx", key: "E", name: "CASSETTE", short: "CASSETTE", gain: 1.2, send: .2,
    art: () => `<rect class="k2" x="6" y="30" width="108" height="78" rx="7"/>
      <circle class="k" cx="12" cy="36" r="2"/><circle class="k" cx="108" cy="36" r="2"/>
      <rect class="bl" x="14" y="36" width="92" height="50" rx="3"/>
      <rect class="ns lab" x="14" y="41" width="92" height="7"/>
      <rect class="scr2" x="28" y="55" width="64" height="25" rx="12.5"/>
      <g class="eyes">${spool(44, 67)}${spool(76, 67)}</g>
      <path class="m" d="M30 108 L36 91 L84 91 L90 108 Z"/>
      <circle class="k" cx="44" cy="100" r="2.6"/><circle class="k" cx="76" cy="100" r="2.6"/>${M(60, 100, 12, 4)}`,
    outfit: { front: `<rect class="r" x="5" y="25" width="110" height="10" rx="3"/><path class="r" d="M10 30 L-2 22 L0 38 Z M10 30 L-1 42 L8 46 Z"/>
      ${[20, 36, 52, 68, 84, 100].map(x => `<circle class="w ns" cx="${x}" cy="30" r="1.8"/>`).join("")}` },
    play(s, t, d, h) {
      const b = s & 15, ch = CHORDS[s >> 4];
      if ("x.x.xx.x.xx.x.x."[b] === "x") {
        const f = mtof(ch.root + 36 + (((b >> 1) & 1) ? 7 : 0));
        tone(d, t, { type: "square", f, vol: .05, hold: clock.SPB * .55, r: .02, lp: f * 2.5 });
        tone(d, t + clock.SPB * .25, { type: "square", f: f * 2, vol: .03, hold: clock.SPB * .2, r: .02, lp: f * 4 });
        h(t, b % 4 === 0 ? "bump mouth" : "mouth", clock.SPB * .6);
      }
    } },
  { id: "fan", cat: "fx", key: "R", name: "PSU FAN", short: "PSU FAN", gain: 2,
    art: () => `<rect class="m" x="8" y="18" width="104" height="108" rx="5"/>
      <rect class="k" x="16" y="25" width="22" height="13" rx="2"/><rect class="r" x="44" y="25" width="9" height="13" rx="1.5"/>
      <circle class="k" cx="60" cy="80" r="38"/>
      <g class="spin" style="transform-origin:60px 80px">${[0, 72, 144, 216, 288].map(a => `<path class="mh" transform="rotate(${a} 60 80)" d="M60 80 C62 66 70 54 84 50 C82 64 74 74 60 80 Z"/>`).join("")}</g>
      <circle class="grill" cx="60" cy="80" r="30"/><circle class="grill" cx="60" cy="80" r="21"/>
      <path class="grill" d="M22 80 H98 M60 42 V118"/>
      <circle class="bl" cx="60" cy="80" r="15"/>${E(60, 77, 12, 4.6)}${M(60, 87, 8, 2.6)}
      ${L(102, 31, 3, "lg steady")}`,
    outfit: { back: `<path class="r" d="M18 24 Q12 4 26 -8 Q24 8 36 22 Z"/><path class="r" d="M102 24 Q108 4 94 -8 Q96 8 84 22 Z"/>` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      if (b % 4 === 2) {
        noise(d, t, { type: "lowpass", f: 400, f2: 2600 + bar * 600, Q: 5, vol: .22, a: clock.SPB * 1.4, r: clock.SPB * .7 });
        h(t, "bump");
      }
    } },
  { id: "teletype", cat: "fx", key: "T", name: "TELETYPE", short: "TELETYPE", gain: 1.8, send: .2,
    art: () => `<g class="paper"><rect class="w" x="32" y="4" width="56" height="42"/><path class="ln" d="M38 12 H76 M38 19 H70 M38 26 H80 M38 33 H62"/></g>
      <rect class="bd" x="20" y="38" width="80" height="13" rx="6.5"/>
      <circle class="k" cx="20" cy="44" r="6"/><circle class="k" cx="100" cy="44" r="6"/>
      <path class="tt" d="M8 126 L15 50 L105 50 L112 126 Z"/>
      ${E(60, 70, 26, 8.5)}${M(60, 88, 16, 4.5)}
      ${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle class="k" cx="${25 + i * 10 + r * 2.5}" cy="${103 + r * 8}" r="3"/>`).join("")).join("")}
      ${L(98, 62, 3.4)}`,
    alt: s => anim(s, ".paper", [{ transform: "translateY(0)" }, { transform: "translateY(-3px)" }, { transform: "translateY(0)" }], 140),
    outfit: { front: `<path class="k2" d="M14 51 H106 L107 60 H13 Z"/>
      ${[22, 34, 46, 58, 70, 82, 94].map(x => `<path class="stud" d="M${x - 3.5} 52 L${x} 44 L${x + 3.5} 52 Z"/>`).join("")}` },
    play(s, t, d, h) {
      const b = s & 15, bar = s >> 4;
      const pat = bar === 3 ? "x.xx.x.x........" : "x.xx.x.xx.xx.x.x";
      if (pat[b] === "x") {
        noise(d, t, { type: "bandpass", f: 1300 + ((s * 37) % 5) * 120, Q: 1.6, vol: .24, r: .03 });
        tone(d, t, { type: "square", f: 320, vol: .035, r: .012 });
        h(t, "bump alt");
      }
      if (bar === 3 && b === 8) { noise(d, t, { type: "bandpass", f: 700, f2: 3200, Q: 2, vol: .14, a: .02, hold: clock.SPB * 2, r: .05 }); h(t, "alt"); }
      if (bar === 3 && b === 12) {
        tone(d, t, { f: mtof(93), vol: .16, r: 1.6 });
        tone(d, t, { f: mtof(93) * 2.76, vol: .05, r: .5 });
        tone(d, t, { f: mtof(93) * 5.4, vol: .02, r: .25 });
        h(t, "led mouth", .5);
      }
    } },
];
