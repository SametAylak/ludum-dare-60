// Effects: texture and ear candy.
import { loop, note, s, sine, stack } from "../audio/strudel.js";
import { anim, E, L, M, spool } from "./art.js";
import { shades } from "./outfits.js";


export const EFFECTS = [
  { id: "modem", cat: "fx", key: "Q", name: "MODEM", short: "MODEM", gain: 1.2, ledRand: true, send: .25,
    art: () => `<rect class="b" x="6" y="56" width="108" height="70" rx="9"/>
      <rect class="bd" x="6" y="56" width="108" height="14" rx="8"/>
      <path class="k2" d="M18 40 Q20 26 36 26 L84 26 Q100 26 102 40 L102 46 L88 46 Q86 38 80 38 L40 38 Q34 38 32 46 L18 46 Z"/>
      <rect class="k2" x="10" y="42" width="30" height="20" rx="7"/><rect class="k2" x="80" y="42" width="30" height="20" rx="7"/>
      ${E(60, 86, 26, 8.5)}${M(60, 103, 16, 4)}
      ${[20, 34, 48, 72, 86, 100].map(x => L(x, 116, 3, "lg")).join("")}`,
    outfit: { front: shades(60, 86, 27, 25, 16) },
    play: loop(stack(
      note("a6 ~ c7 ~ e7 ~ ~ ~ a6 ~ c7 ~ e7 ~ <g7 ~ a7 [g7 e7]> ~").s("triangle").fmh(1.5).fmi("<1 2 1 4>")
        .decay(.08).sustain(0).delay(.3).delayfeedback(.35).gain(.35),
      note("<~ [a5,c6] ~ ~>").s("sine").attack(.02).sustain(1).release(.1).gain(.12),
      s("<~ ~ ~ [~ ~ ~ ~ ~ ~ ~ ~ crackle@8]>").density(.4).bandf(2400).bandq(2).sustain(1).release(.1).gain(.8)
    ), v => v.s === "crackle" ? "bump led" : v.s === "sine" ? "mouth" : "led") },
  { id: "crt", cat: "fx", key: "W", name: "CRT MONITOR", short: "CRT", gain: 0.41,
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
    play: loop(stack(
      note("<a1 ~ c2 ~>").s("sawtooth").cutoff(320).vib(12).vibmod(.5).decay(1.2).sustain(0).gain(1.2),
      note("<[a4,c5,e5] ~ [g4,c5,e5] ~>").s("square").crush(5).cutoff(2500).decay(.4).sustain(0).gain(.25),
      s("~ ~ ~ ~ ~ ~ ~ ~ white@8").bandf(400).bandq(3).bpenv(3.5).bpattack(.9).bpsustain(1).attack(.8).sustain(1).release(.05).gain(.5),
      s("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ <~ glitch:6> <~ ~ ~ glitch:2>").gain(.7)
    ), v => v.s === "sawtooth" ? "bump alt mouth" : v.s === "white" ? "alt" : "led") },
  { id: "cassette", cat: "fx", key: "E", name: "CASSETTE", short: "CASSETTE", gain: 0.24, send: .2,
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
    play: loop(stack(
      s("~ ~ speedupdown:6 ~ ~ speedupdown:7 ~ ~ ~ ~ speedupdown:6 ~ speedupdown:7 ~ <~ [speedupdown:6 speedupdown:7]> ~")
        .speed("<1 1 1 [1 -1]>").gain(.8),
      note("<[a3,c4,e4] [f3,a3,c4] [g3,c4,e4] [g3,b3,d4]>").struct("~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~").s("triangle")
        .vib(4).vibmod(.15).cutoff(1800).decay(.3).sustain(.4).release(.3).gain(.5),
      note("<~ ~ ~ [~@12 e3@4]>").s("sawtooth").penv(24).pattack(.001).pdecay(.5).psustain(0).panchor(0).cutoff(1600).gain(.5)
    ), v => v.s === "speedupdown" ? "bump alt" : "mouth") },
  { id: "fan", cat: "fx", key: "R", name: "PSU FAN", short: "PSU FAN", gain: 0.3,
    art: () => `<rect class="m" x="8" y="18" width="104" height="108" rx="5"/>
      <rect class="k" x="16" y="25" width="22" height="13" rx="2"/><rect class="r" x="44" y="25" width="9" height="13" rx="1.5"/>
      <circle class="k" cx="60" cy="80" r="38"/>
      <g class="spin" style="transform-origin:60px 80px">${[0, 72, 144, 216, 288].map(a => `<path class="mh" transform="rotate(${a} 60 80)" d="M60 80 C62 66 70 54 84 50 C82 64 74 74 60 80 Z"/>`).join("")}</g>
      <circle class="grill" cx="60" cy="80" r="30"/><circle class="grill" cx="60" cy="80" r="21"/>
      <path class="grill" d="M22 80 H98 M60 42 V118"/>
      <circle class="bl" cx="60" cy="80" r="15"/>${E(60, 77, 12, 4.6)}${M(60, 87, 8, 2.6)}
      ${L(102, 31, 3, "lg steady")}`,
    outfit: { back: `<path class="r" d="M18 24 Q12 4 26 -8 Q24 8 36 22 Z"/><path class="r" d="M102 24 Q108 4 94 -8 Q96 8 84 22 Z"/>` },
    play: loop(stack(
      s("pink*4").cutoff(sine.range(500, 3000).slow(4)).resonance(6).attack(.12).decay(.1).sustain(.3).release(.15).gain(.6),
      s("<wind:0 wind:3 wind:6 wind:4>").gain(.9),
      note("<[a4,e5] [a4,c5] [g4,c5] [g4,d5]>").s("sine").attack(.6).sustain(1).release(1).room(.4).gain(.15)
    ), v => v.s === "pink" ? "bump" : null) },
  { id: "teletype", cat: "fx", key: "T", name: "TELETYPE", short: "TELETYPE", gain: 0.33, send: .2,
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
    play: loop(stack(
      s("[tok:1 ~ tok:1 tok:2] [~ tok:1 ~ tok:3] [tok:1 tok:2 ~ tok:1] [~ tok:3 <tok:1 ~> ~]").speed(1.8).gain(.7),
      s("<~ ~ ~ [~ ~ print:7 ~]>").gain(.6),
      s("<~ ~ ~ [~ ~ ~ lt]>").bank("RolandTR808").gain(.4),
      note("<~ [~ ~ ~ c6] ~ [~ ~ ~ g6]>").s("gm_music_box").release(1).room(.3)
    ), v => v.s === "gm_music_box" ? "led mouth" : v.s === "print" ? "alt" : v.s === "tok" ? "bump alt" : null) },
];
