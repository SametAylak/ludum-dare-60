// Melody: bass, arpeggios, chords and lead.
import { fm, pulseWave, tone } from "../audio/synth.js";
import { CHORDS, clock, mtof } from "../music.js";
import { anim, E, L, M } from "./art.js";
import { bowtie } from "./outfits.js";

const FLOPPY_BASS = [[0, 0, 2], [3, 0, 1], [6, 0, 2], [8, 12, 1], [10, 0, 2], [14, 7, 2]];
const ARP = [0, 1, 2, 3, 1, 2, 3, 2, 0, 1, 2, 3, 2, 3, -1, -1];
const LEAD = [
  [[0, 69, 3], [3, 72, 3], [6, 76, 2], [8, 74, 2], [10, 72, 2], [12, 76, 4]],
  [[0, 77, 3], [3, 76, 3], [6, 72, 2], [8, 69, 4], [12, 72, 2], [14, 74, 2]],
  [[0, 76, 3], [3, 79, 3], [6, 76, 2], [8, 72, 4], [12, 74, 2], [14, 76, 2]],
  [[0, 74, 3], [3, 71, 3], [6, 67, 2], [8, 71, 2], [10, 74, 2], [12, 71, 4]],
];

export const MELODY = [
  { id: "floppy", cat: "mel", key: "A", name: "FLOPPY DRIVE", short: "FLOPPY", gain: 0.6,
    art: () => `<g class="disk"><g transform="rotate(-9 60 30)"><rect class="blu" x="34" y="6" width="52" height="52" rx="3"/>
      <rect class="m" x="46" y="6" width="28" height="18" rx="1"/><rect class="k ns" x="62" y="9" width="6" height="12"/>
      <rect class="w" x="40" y="32" width="40" height="22" rx="1.5"/><path class="ln" d="M45 39 H74 M45 46 H66"/></g></g>
      <rect class="b" x="6" y="54" width="108" height="72" rx="8"/>
      <rect class="bl" x="13" y="61" width="94" height="58" rx="4"/>
      ${E(60, 78, 26, 8.5)}${M(60, 99, 64, 7, "slotm")}
      <rect class="bd" x="54" y="106" width="12" height="8" rx="1.5"/>${L(97, 111, 3, "lg")}`,
    mo: 1.9,
    alt: s => anim(s, ".disk", [{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(-7px) rotate(4deg)" }, { transform: "translateY(0) rotate(0)" }], 260),
    outfit: { front: bowtie(60, 112, 28, 13) },
    play(s, t, d, h) {
      const b = s & 15, ch = CHORDS[s >> 4];
      for (const [st, iv, len] of FLOPPY_BASS) if (st === b) {
        const f = mtof(ch.root + iv), hold = clock.SPB * len * .75;
        tone(d, t, { type: "square", f, vol: .13, hold, r: .05, lp: 1100, q: 4 });
        tone(d, t, { type: "sawtooth", f: f * 1.006, vol: .07, hold, r: .05, lp: 700 });
        tone(d, t, { f: f / 2, vol: .22, hold, r: .06 });
        h(t, b === 0 || b === 8 ? "bump led mouth alt" : "bump led mouth", hold);
      }
    } },
  { id: "pcspk", cat: "mel", key: "S", name: "PC SPEAKER", short: "PC SPKR", gain: 1.5, send: .3,
    art: () => `<path class="wire" d="M48 110 C48 120 40 122 40 128"/><path class="wire2" d="M72 110 C72 120 80 122 80 128"/>
      <rect class="m" x="14" y="20" width="92" height="92" rx="14"/>
      <circle class="k" cx="23" cy="29" r="2.4"/><circle class="k" cx="97" cy="29" r="2.4"/><circle class="k" cx="23" cy="103" r="2.4"/><circle class="k" cx="97" cy="103" r="2.4"/>
      <g class="cone"><circle class="k2" cx="60" cy="66" r="38"/><circle class="tan" cx="60" cy="66" r="31"/><circle class="tan2" cx="60" cy="66" r="20"/>
      ${E(60, 60, 20, 7)}${M(60, 77, 14, 4)}</g>`,
    alt: s => anim(s, ".cone", [{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }], 110),
    outfit: { front: `<g transform="rotate(-7 60 20)"><path class="felt" d="M33 22 L37 2 Q48 -2 60 4 Q72 -2 83 2 L87 22 Z"/><path class="r ns" d="M35.2 13 H84.8 L86 20 H34 Z"/>
      <path class="felt" d="M14 23 Q60 13 106 23 Q60 31 14 23 Z"/></g>` },
    play(s, t, d, h) {
      const b = s & 15, ch = CHORDS[s >> 4], i = ARP[b];
      if (i < 0) return;
      const notes = [...ch.n, ch.n[0] + 12];
      tone(d, t, { type: "square", f: mtof(notes[i] + 12), vol: .045, hold: clock.SPB * .45, r: .015 });
      h(t, b % 4 === 0 ? "bump alt" : "alt");
    } },
  { id: "fmcard", cat: "mel", key: "D", name: "SOUND CARD", short: "SOUND CRD", gain: 1.1, send: .2,
    art: () => `<rect class="m" x="8" y="6" width="12" height="114" rx="2"/>
      <circle class="k" cx="14" cy="30" r="3.6"/><circle class="k" cx="14" cy="46" r="3.6"/><circle class="k" cx="14" cy="62" r="3.6"/><rect class="k" x="10.5" y="80" width="7" height="16" rx="2"/>
      <rect class="g" x="18" y="12" width="96" height="96" rx="3"/>
      <path class="trace" d="M24 100 H40 V86 M30 20 V26 H44 M100 18 V28 M108 60 H98 V76"/>
      <rect class="k" x="40" y="28" width="56" height="42" rx="2"/>
      ${E(68, 45, 22, 7.5)}${M(68, 60, 14, 4)}
      <rect class="k" x="28" y="80" width="22" height="14" rx="1.5"/><rect class="k" x="58" y="82" width="16" height="10" rx="1.5"/>
      <circle class="blu" cx="90" cy="88" r="6"/><circle class="k2" cx="104" cy="88" r="4.5"/>
      <rect class="g" x="36" y="106" width="64" height="18"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<rect class="au ns" x="${39.5 + i * 6}" y="109" width="3.6" height="13"/>`).join("")}
      ${L(104, 20, 2.8, "lr")}`,
    outfit: { front: `<path class="k2" d="M42 15 Q42 -1 68 -1 Q96 -1 98 11 Q82 17 42 15 Z"/><path class="k2" d="M68 -1 L70 -6"/>` },
    play(s, t, d, h) {
      const b = s & 15, ch = CHORDS[s >> 4];
      if ("x..x..x...x.x..."[b] === "x") {
        const len = b === 0 ? 2.5 : 1.2;
        for (const n of ch.n) fm(d, t, { f: mtof(n), ratio: 1, index: 2.2, vol: .06, hold: clock.SPB * len * .5, r: clock.SPB * len });
        h(t, "bump led mouth", clock.SPB * len);
      }
    } },
  { id: "cart", cat: "mel", key: "F", name: "GAME CARTRIDGE", short: "CARTRIDGE", gain: 1.6, send: .3,
    art: () => `<path class="cg" d="M14 8 L106 8 L106 110 L98 118 L22 118 L14 110 Z"/>
      <path class="ridge" d="M22 16 H98 M22 22 H98 M22 28 H98"/>
      <rect class="lab" x="22" y="36" width="76" height="62" rx="4"/>
      <rect class="w ns" x="24" y="86" width="72" height="10"/><text class="ct" x="60" y="94">LEVEL 1</text>
      ${E(60, 56, 26, 8.5)}${M(60, 74, 16, 4.5)}
      <rect class="au" x="30" y="118" width="60" height="8"/>`,
    outfit: { front: `<path class="straw" d="M36 9 L37 -11 H83 L84 9 Z"/><rect class="lab ns" x="36.6" y="-3" width="46.8" height="7"/><path class="seam" d="M36.7 -3 H83.3 M36.4 4 H83.6"/>
      <path class="straw" d="M22 9 Q60 3 98 9 Q60 15 22 9 Z"/>` },
    play(s, t, d, h) {
      const b = s & 15;
      for (const [st, n, len] of LEAD[s >> 4]) if (st === b) {
        tone(d, t, { wave: pulseWave(.25), f: mtof(n), vol: .07, a: .004, hold: clock.SPB * len * .8, r: .05, vib: .006, vibRate: 6 });
        h(t, "bump mouth", clock.SPB * len);
      }
    } },
  { id: "tube", cat: "mel", key: "G", name: "VACUUM TUBE", short: "TUBE", gain: 1, send: .15,
    art: () => `<path class="glass" d="M36 98 L36 40 C36 10 84 10 84 40 L84 98 Z"/>
      <ellipse class="glow lit" cx="60" cy="62" rx="20" ry="32"/>
      <path class="wireg" d="M50 98 V86 M70 98 V86 M60 20 V38"/>
      <path class="getter" d="M48 22 Q60 16 72 22"/>
      <rect class="mh" x="45" y="38" width="30" height="48" rx="3"/>
      ${E(60, 55, 14, 5.6)}${M(60, 70, 10, 3)}
      <rect class="k" x="32" y="96" width="56" height="20" rx="4"/>
      <path class="pin" d="M44 116 V126 M54 116 V126 M66 116 V126 M76 116 V126"/>`,
    outfit: { front: `<path class="k" d="M46 19 Q46 4 60 4 Q74 4 74 19 Z"/><path class="k" d="M40 19 Q60 14 80 19 Q60 23 40 19 Z"/>${bowtie(60, 98, 24, 11)}` },
    play(s, t, d, h) {
      const b = s & 15, ch = CHORDS[s >> 4];
      if (b === 0) {
        const len = clock.SPB * 16;
        for (const n of ch.n) for (const dt of [-8, 8])
          tone(d, t, { type: "sawtooth", f: mtof(n), detune: dt, vol: .035, a: .3, hold: len - .55, r: .4, lp: 1100 });
        h(t, "mouth", len * .9);
      }
      if (b % 4 === 0) h(t, "led bump");
    } },
];
