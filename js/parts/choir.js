// Choir: five singers, one per section, every note on the chord of the bar.
import { loop, note, s, stack } from "../audio/strudel.js";
import { anim, E, L, M } from "./art.js";
import { halo } from "./outfits.js";

export const CHOIR = [
  { id: "ram", cat: "cho", key: "6", name: "RAM CHOIR", short: "RAM", gain: 0.5, send: .25, mo: 2.4,
    art: () => `<rect class="g" x="10" y="20" width="100" height="92" rx="4"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<rect class="au" x="${15.5 + i * 8.4}" y="111" width="5" height="12" rx="1"/>`).join("")}
      <rect class="g" x="56" y="110" width="8" height="10" rx="1"/>
      <path class="trace" d="M18 40 H30 L36 34 M18 62 H26 M94 62 H102 M84 40 H92 L98 46"/>
      ${E(60, 46, 30, 10)}${M(60, 68, 22, 6)}
      <rect class="w" x="72" y="24" width="30" height="11" rx="2"/><text class="ct" x="87" y="33">512K</text>${L(20, 29, 3, "lg")}
      ${[0, 1, 2, 3].map(i => { const x = 16 + i * 23;
        return `<rect class="k" x="${x}" y="80" width="19" height="24" rx="2"/><circle class="ew" cx="${x + 6}" cy="87" r="2.6"/><circle class="ew" cx="${x + 13}" cy="87" r="2.6"/>` +
          `<rect class="mouth cm" x="${x + 6.5}" y="94" width="6" height="4" rx="2"/>`; }).join("")}`,
    // the four chips sing their own little wave across the stick
    alt: s => s.querySelectorAll(".cm").forEach((m, i) => m.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(2.4)", offset: .3 }, { transform: "scaleY(1)" }],
      { duration: 300, delay: i * 45, easing: "ease-out" })),
    outfit: { front: halo(8) },
    play: loop(stack(
      note("<[c5,e5,a5] [c5,f5,a5] [c5,e5,g5] [b4,d5,g5]>").struct("~ ~ x ~ ~ x ~ ~ ~ ~ x ~ x ~ ~ ~")
        .s("gm_choir_aahs").attack(.01).decay(.3).sustain(.3).release(.2).room(.3),
      note("<[a3,e4] [f3,c4] [c4,g4] [g3,d4]>").s("gm_voice_oohs").attack(.25).sustain(1).release(.4).gain(.5),
      note("<~ [~ ~ ~ [a5 c6]] ~ [~ ~ ~ [g5 b5]]>").s("sawtooth").vowel("e").decay(.12).sustain(.4).release(.08).cutoff(3500).pan(.65).gain(.3)
    ), v => v.s === "gm_choir_aahs" ? "bump mouth alt" : v.s === "sawtooth" ? "mouth" : null) },
  { id: "cdrom", cat: "cho", key: "7", name: "CD-ROM", short: "CD-ROM", gain: 0.42, send: .3,
    art: () => `<rect class="b" x="12" y="34" width="96" height="92" rx="8"/><rect class="bd" x="12" y="34" width="96" height="16" rx="7"/>
      ${E(60, 64, 30, 10)}${M(60, 80, 18, 4.5)}
      <g class="tray"><rect class="k2" x="20" y="90" width="80" height="9" rx="2"/><ellipse class="cd" cx="60" cy="90" rx="30" ry="5"/></g>
      <rect class="k" x="20" y="108" width="62" height="6" rx="3"/><circle class="m" cx="94" cy="111" r="5"/>${L(24, 120, 2.6, "lg")}`,
    alt: s => anim(s, ".tray", [{ transform: "translateY(0)" }, { transform: "translateY(4px)" }, { transform: "translateY(0)" }], 360),
    outfit: { front: halo(22) },
    // soprano: a high descant floating over the band
    play: loop(stack(
      note("<[e6@8 d6@4 c6@4] [c6@8 a5@8] [g5@8 c6@4 e6@4] [d6@12 b5@4]>").s("gm_voice_oohs").vib(5).vibmod(.12).attack(.12).release(.5).room(.5),
      note("<[e6@8 d6@4 c6@4] [c6@8 a5@8] [g5@8 c6@4 e6@4] [d6@12 b5@4]>").s("gm_choir_aahs").attack(.2).release(.5).pan(.6).gain(.4)
    ), v => v.s === "gm_voice_oohs" ? "bump mouth alt" : null) },
  { id: "zip", cat: "cho", key: "8", name: "ZIP DRIVE", short: "ZIP", gain: 2.2, send: .2,
    art: () => `<rect class="blu" x="14" y="22" width="92" height="104" rx="14"/><rect class="k" x="26" y="34" width="68" height="8" rx="4"/>
      ${E(60, 64, 30, 10)}${M(60, 86, 20, 5)}
      <circle class="w" cx="60" cy="108" r="9"/><text class="ct" x="60" y="112">Z</text>${L(92, 112, 3, "lg")}`,
    outfit: { front: halo(10) },
    // tenor: a staccato chant, the same rhythm every bar
    play: loop(stack(
      note("<[a4 ~ a4 a4 ~ ~ c5 ~ a4 ~ ~ ~ e4 ~ ~ ~] [a4 ~ a4 a4 ~ ~ c5 ~ a4 ~ ~ ~ f4 ~ ~ ~] [g4 ~ g4 g4 ~ ~ c5 ~ g4 ~ ~ ~ e4 ~ ~ ~] [g4 ~ g4 g4 ~ ~ b4 ~ g4 ~ ~ ~ d4 ~ ~ ~]>")
        .s("gm_choir_aahs").decay(.18).sustain(.2).release(.1).room(.2),
      note("<[a3 ~ a3 a3 ~ ~ c4 ~ a3 ~ ~ ~ e3 ~ ~ ~] [a3 ~ a3 a3 ~ ~ c4 ~ a3 ~ ~ ~ f3 ~ ~ ~] [g3 ~ g3 g3 ~ ~ c4 ~ g3 ~ ~ ~ e3 ~ ~ ~] [g3 ~ g3 g3 ~ ~ b3 ~ g3 ~ ~ ~ d3 ~ ~ ~]>")
        .s("sawtooth").vowel("a").decay(.12).sustain(0).cutoff(2200).pan(.35).gain(.25)
    ), v => v.s === "gm_choir_aahs" ? "bump mouth led" : null) },
  { id: "ups", cat: "cho", key: "9", name: "UPS BATTERY", short: "UPS", gain: 0.44,
    art: () => `<rect class="k2" x="16" y="16" width="88" height="110" rx="6"/><rect class="k" x="26" y="26" width="68" height="34" rx="3"/>
      ${E(60, 43, 28, 9)}${M(60, 74, 22, 6)}
      ${[0, 1, 2, 3].map(i => `<rect class="ph" x="${30 + i * 16}" y="88" width="12" height="8" rx="1"/>`).join("")}
      <circle class="m" cx="60" cy="112" r="7"/><path class="cord" d="M60 107 V112"/>${L(88, 112, 3, "lg")}`,
    outfit: { front: halo(4) },
    // bass: long low notes, root then fifth
    play: loop(stack(
      note("<[a2@6 a2@2 e2@8] [f2@6 f2@2 c3@8] [c3@6 c3@2 g2@8] [g2@6 g2@2 d3@8]>").s("gm_choir_aahs").attack(.05).release(.3).gain(1.2),
      note("<[a1@6 a1@2 e1@8] [f1@6 f1@2 c2@8] [c2@6 c2@2 g1@8] [g1@6 g1@2 d2@8]>").s("sine").attack(.02).sustain(1).release(.2).gain(.35)
    ), v => v.s === "sine" ? null : "bump mouth led") },
  { id: "rack", cat: "cho", key: "0", name: "SERVER RACK", short: "RACK", gain: 0.4, send: .2,
    art: () => `<rect class="k" x="14" y="2" width="92" height="124" rx="3"/>
      ${[8, 92, 108].map((y, i) => `<rect class="k2" x="20" y="${y}" width="80" height="13" rx="2"/>${L(28, y + 6.5, 2.4, i === 1 ? "lr" : "lg")}${L(36, y + 6.5, 2.4)}<path class="grill" d="M48 ${y + 4} H92 M48 ${y + 9} H92"/>`).join("")}
      <rect class="k2" x="20" y="26" width="80" height="62" rx="3"/>${E(60, 46, 30, 10)}${M(60, 72, 24, 6)}`,
    outfit: { front: halo(-10, 28) },
    // the full choir: wide chords that swell into each bar, and a hal-le-lu stab in bar 4
    play: loop(stack(
      note("<[a3,e4,a4,c5,e5] [f3,c4,f4,a4,c5] [c4,e4,g4,c5,e5] [[g3,d4,g4,b4,d5]@2 [g3,d4,g4,b4,d5] [g3,d4,g4,b4,d5]]>")
        .s("gm_choir_aahs").attack(.5).release(.8).room(.6).gain(.6),
      note("<[a3,e4,a4] [f3,c4,f4] [c4,g4,c5] [g3,d4,g4]>").s("gm_synth_choir").attack(.8).release(1).pan(.4).gain(.35)
    ), v => v.s === "gm_choir_aahs" ? "mouth led" : null) },
];
