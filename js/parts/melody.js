// Melody: bass, arpeggios, chords and lead.
import { loop, note, s, stack } from "../audio/strudel.js";
import { anim, E, L, M } from "./art.js";
import { bowtie } from "./outfits.js";

// A syncopated root-octave-fifth line under Am F C G.
const BASS = note(`<[a1 ~ a2 ~ ~ a1 ~ e2 ~ a1 ~ g1 ~ a1 c2 ~] [f1 ~ f2 ~ ~ f1 ~ c2 ~ f1 ~ e2 ~ f1 a1 ~]
  [c2 ~ c3 ~ ~ c2 ~ g2 ~ c2 ~ b1 ~ c2 e2 ~] [g1 ~ g2 ~ ~ g1 ~ d2 ~ g1 ~ f2 ~ g1 b1 ~]>`);
// The Game Cartridge hook and a chord-tone harmony under it.
const LEAD = "<[e5@3 c5@3 a4@4 c5@2 e5@2 d5@2] [c5@3 a4@3 f4@4 a4@2 c5@4] [e5@3 g5@3 e5@4 c5@2 d5@2 e5@2] [d5@3 b4@3 g4@4 a4@2 b4@4]>";
const HARMONY = "<[c5@3 a4@3 e4@4 a4@2 c5@2 b4@2] [a4@3 f4@3 c4@4 f4@2 a4@4] [c5@3 e5@3 c5@4 g4@2 b4@2 c5@2] [b4@3 g4@3 d4@4 f4@2 g4@4]>";

export const MELODY = [
  { id: "floppy", cat: "mel", key: "A", name: "FLOPPY DRIVE", short: "FLOPPY", gain: 0.31,
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
    play: loop(stack(
      BASS.s("square").cutoff(500).resonance(6).lpenv(3).lpdecay(.12).lpsustain(.2).decay(.2).sustain(.6).release(.05).gain(.8),
      BASS.s("sine").sustain(1).release(.05).gain(.9),
      note("<a3 f3 c4 g3>").struct("~ x ~ x ~ x ~ x ~ x ~ x ~ x ~ x").s("square").cutoff(1500).decay(.03).sustain(0).gain(.15),
      s("click:0 ~ ~ ~ ~ ~ ~ ~ click:0 ~ ~ ~ ~ ~ ~ ~").speed(.7).gain(.3)
    ), v => v.resonance ? "bump led mouth" : null) },
  { id: "pcspk", cat: "mel", key: "S", name: "PC SPEAKER", short: "PC SPKR", gain: 1.3, send: .3,
    art: () => `<path class="wire" d="M48 110 C48 120 40 122 40 128"/><path class="wire2" d="M72 110 C72 120 80 122 80 128"/>
      <rect class="m" x="14" y="20" width="92" height="92" rx="14"/>
      <circle class="k" cx="23" cy="29" r="2.4"/><circle class="k" cx="97" cy="29" r="2.4"/><circle class="k" cx="23" cy="103" r="2.4"/><circle class="k" cx="97" cy="103" r="2.4"/>
      <g class="cone"><circle class="k2" cx="60" cy="66" r="38"/><circle class="tan" cx="60" cy="66" r="31"/><circle class="tan2" cx="60" cy="66" r="20"/>
      ${E(60, 60, 20, 7)}${M(60, 77, 14, 4)}</g>`,
    alt: s => anim(s, ".cone", [{ transform: "scale(1)" }, { transform: "scale(1.07)" }, { transform: "scale(1)" }], 110),
    outfit: { front: `<g transform="rotate(-7 60 20)"><path class="felt" d="M33 22 L37 2 Q48 -2 60 4 Q72 -2 83 2 L87 22 Z"/><path class="r ns" d="M35.2 13 H84.8 L86 20 H34 Z"/>
      <path class="felt" d="M14 23 Q60 13 106 23 Q60 31 14 23 Z"/></g>` },
    play: loop(stack(
      note("<[a4 c5 e5 a5]*4 [f4 a4 c5 f5]*4 [c5 e5 g5 c6]*4 [g4 b4 d5 g5]*4>").struct("x ~ x x ~ x x ~ x ~ x x ~ x ~ x")
        .s("square").cutoff(3000).decay(.07).sustain(0).delay(.25).pan(.6).gain(.35),
      note("<a3 f3 c4 g3>").struct("x ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~").s("square").cutoff(1200).decay(.15).sustain(0).gain(.35)
    ), v => v.pan ? "alt" : "bump") },
  { id: "fmcard", cat: "mel", key: "D", name: "SOUND CARD", short: "SOUND CRD", gain: 0.38, send: .2,
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
    play: loop(stack(
      note("<[a3,c4,e4,g4] [f3,a3,c4,e4] [e3,g3,c4] [d3,g3,b3]>").struct("x ~ ~ x ~ ~ x ~ ~ ~ x ~ x ~ ~ ~").s("gm_epiano1").release(.3).room(.2),
      note("<[a4 e5 c5 e5]*2 [a4 f5 c5 f5]*2 [g4 e5 c5 e5]*2 [g4 d5 b4 d5]*2>").s("sine").fmi(2).fmh(2).decay(.15).sustain(0).pan(.65).gain(.35)
    ), v => v.s === "gm_epiano1" ? "bump led mouth" : null) },
  { id: "cart", cat: "mel", key: "F", name: "GAME CARTRIDGE", short: "CARTRIDGE", gain: 0.94, send: .3,
    art: () => `<path class="cg" d="M14 8 L106 8 L106 110 L98 118 L22 118 L14 110 Z"/>
      <path class="ridge" d="M22 16 H98 M22 22 H98 M22 28 H98"/>
      <rect class="lab" x="22" y="36" width="76" height="62" rx="4"/>
      <rect class="w ns" x="24" y="86" width="72" height="10"/><text class="ct" x="60" y="94">LEVEL 1</text>
      ${E(60, 56, 26, 8.5)}${M(60, 74, 16, 4.5)}
      <rect class="au" x="30" y="118" width="60" height="8"/>`,
    outfit: { front: `<path class="straw" d="M36 9 L37 -11 H83 L84 9 Z"/><rect class="lab ns" x="36.6" y="-3" width="46.8" height="7"/><path class="seam" d="M36.7 -3 H83.3 M36.4 4 H83.6"/>
      <path class="straw" d="M22 9 Q60 3 98 9 Q60 15 22 9 Z"/>` },
    play: loop(stack(
      note(LEAD).s("pulse").pw(.25).vib(6).vibmod(.1).attack(.005).sustain(.8).release(.08).gain(.45),
      note(LEAD).s("triangle").octave(1).decay(.2).sustain(.3).release(.1).gain(.15),
      note(HARMONY).s("gm_kalimba").pan(.35).gain(.5)
    ), v => v.s === "pulse" ? "bump mouth" : null) },
  { id: "tube", cat: "mel", key: "G", name: "VACUUM TUBE", short: "TUBE", gain: 0.34, send: .15,
    art: () => `<path class="glass" d="M36 98 L36 40 C36 10 84 10 84 40 L84 98 Z"/>
      <ellipse class="glow lit" cx="60" cy="62" rx="20" ry="32"/>
      <path class="wireg" d="M50 98 V86 M70 98 V86 M60 20 V38"/>
      <path class="getter" d="M48 22 Q60 16 72 22"/>
      <rect class="mh" x="45" y="38" width="30" height="48" rx="3"/>
      ${E(60, 55, 14, 5.6)}${M(60, 70, 10, 3)}
      <rect class="k" x="32" y="96" width="56" height="20" rx="4"/>
      <path class="pin" d="M44 116 V126 M54 116 V126 M66 116 V126 M76 116 V126"/>`,
    outfit: { front: `<path class="k" d="M46 19 Q46 4 60 4 Q74 4 74 19 Z"/><path class="k" d="M40 19 Q60 14 80 19 Q60 23 40 19 Z"/>${bowtie(60, 98, 24, 11)}` },
    play: loop(stack(
      note("<[a3,c4,e4] [f3,a3,c4] [g3,c4,e4] [g3,b3,d4]>").s("gm_pad_warm").attack(.3).release(.6).gain(.7),
      note("<[a4 e4 c5 e4] [a4 f4 c5 f4] [g4 e4 c5 e4] [g4 d4 b4 d4]>").s("gm_vibraphone").release(.4).gain(.3),
      note("<[a5,e6] [a5,c6] [g5,c6] [g5,d6]>").s("sine").attack(1).sustain(1).release(1).room(.5).gain(.1)
    ), v => v.s === "gm_pad_warm" ? "mouth" : v.s === "gm_vibraphone" ? "led bump" : null) },
];
