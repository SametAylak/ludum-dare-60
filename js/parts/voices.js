// Voices: the singers.
import { loop, note, s, stack } from "../audio/strudel.js";
import { anim, E, L, M, reel } from "./art.js";

let stickDir = 1;
// The Speech Chip's robot line: a stuttered call in bar 1 and 3, an answer in bar 2 and a triple-hit pickup in bar 4.
const SPEECH = note("<[a4 ~ c5 ~ e5 ~ c5 ~ a4 ~ ~ ~ ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ ~ ~ a4 ~ c5 ~ f5 ~ ~ ~] [g4 ~ c5 ~ e5 ~ c5 ~ g4 ~ ~ ~ ~ ~ ~ ~] [g4 g4 g4 ~ g4 ~ b4 ~ d5 ~ ~ ~ ~ ~ ~ ~]>");

export const VOICES = [
  { id: "speech", cat: "voc", key: "Z", name: "SPEECH CHIP", short: "SPEECH", gain: 0.8, send: .25, mo: 2.2,
    art: () => `${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect class="m" x="12" y="${28 + i * 11}" width="14" height="5" rx="1"/><rect class="m" x="94" y="${28 + i * 11}" width="14" height="5" rx="1"/>`).join("")}
      <rect class="k" x="22" y="18" width="76" height="108" rx="4"/>
      <path class="k2" d="M50 18 A10 10 0 0 0 70 18 Z"/><circle class="k2" cx="32" cy="30" r="3"/>
      ${E(60, 56, 30, 11)}${M(60, 86, 26, 7)}
      <text class="chip-t" x="60" y="116">VOX-1</text>`,
    outfit: { front: `<path class="au" d="M36 21 L40 6 L49 14 L60 -2 L71 14 L80 6 L84 21 Z"/><circle class="gem" cx="60" cy="12" r="4"/>
      <circle class="gem" cx="44" cy="16" r="2.4"/><circle class="gem" cx="76" cy="16" r="2.4"/>` },
    play: loop(stack(
      SPEECH.s("square").vowel("o").decay(.15).sustain(.2).release(.05).room(.15).gain(.5),
      SPEECH.s("sawtooth").vowel("a").octave(-1).decay(.2).sustain(.2).release(.05).cutoff(1800).gain(.35)
    ), v => v.s === "square" ? "bump mouth" : null) },
  { id: "mainframe", cat: "voc", key: "X", name: "MAINFRAME", short: "MAINFRAME", gain: 0.31, send: .2,
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
    play: loop(stack(
      note("<[a3,c4,e4,a4] [f3,a3,c4,f4] [e3,g3,c4,g4] [d3,g3,b3,g4]>").struct("x@6 x@2 x@8").s("gm_choir_aahs").attack(.15).release(.5).room(.4),
      note("<e5 f5 g5 g5>").s("gm_choir_aahs").attack(.4).release(.6).room(.4).gain(.5),
      note("<[a5 ~ e6 ~ c6 ~ ~ a5 ~ e6 ~ ~ c6 ~ ~ ~] [a5 ~ f6 ~ c6 ~ ~ a5 ~ f6 ~ ~ c6 ~ ~ ~] [g5 ~ e6 ~ c6 ~ ~ g5 ~ e6 ~ ~ c6 ~ ~ ~] [g5 ~ d6 ~ b5 ~ ~ g5 ~ d6 ~ ~ b5 ~ ~ ~]>")
        .s("square").cutoff(4000).decay(.04).sustain(0).pan(.3).gain(.12)
    ), v => v.s === "square" ? "led" : "mouth") },
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
    play: loop(stack(
      note("<[a2@3 a2@3 a2@4 c3@2 e3@4] [f2@3 f2@3 f2@4 a2@2 c3@4] [c3@3 c3@3 c3@4 e3@2 g3@4] [g2@3 g2@3 g2@4 b2@2 d3@4]>")
        .s("gm_voice_oohs").decay(.25).sustain(.5).release(.08).gain(1.2),
      s("mouth:2 ~ ~ mouth:7 ~ ~ mouth:2 ~ ~ ~ mouth:13 ~ ~ ~ ~ ~").gain(.6)
    ), v => v.s === "gm_voice_oohs" ? "bump mouth led" : null) },
  { id: "scope", cat: "voc", key: "V", name: "OSCILLOSCOPE", short: "SCOPE", gain: 0.37, send: .35, mo: 2.8,
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
    play: loop(stack(
      note("<[a4@6 c5@2 e5@8] [f5@6 e5@2 c5@8] [e5@6 d5@2 c5@4 g4@4] [b4@6 c5@2 d5@8]>")
        .s("gm_voice_oohs").vib(5).vibmod(.15).attack(.08).release(.3).room(.35),
      note("<[a5@6 c6@2 e6@8] [f6@6 e6@2 c6@8] [e6@6 d6@2 c6@4 g5@4] [b5@6 c6@2 d6@8]>")
        .s("gm_whistle").attack(.05).release(.3).delay(.3).delayfeedback(.3).pan(.6).gain(.35)
    ), v => v.s === "gm_voice_oohs" ? "bump mouth" : null) },
  { id: "joystick", cat: "voc", key: "B", name: "JOYSTICK", short: "JOYSTICK", gain: 2, send: .2,
    art: () => `<path class="k2" d="M12 126 L20 86 Q22 76 32 76 L88 76 Q98 76 100 86 L108 126 Z"/>
      <g class="stick" style="transform-origin:60px 82px"><rect class="k" x="56" y="30" width="8" height="54" rx="3"/><circle class="r" cx="60" cy="26" r="15"/><circle class="hi" cx="55" cy="21" r="4"/></g>
      <ellipse class="k" cx="60" cy="82" rx="15" ry="5"/><ellipse class="r" cx="90" cy="82" rx="7" ry="3.2"/>
      ${E(60, 100, 26, 8.5)}${M(60, 116, 16, 4.5)}`,
    alt: s => { stickDir = -stickDir; anim(s, ".stick", [{ transform: "rotate(0)" }, { transform: `rotate(${14 * stickDir}deg)` }, { transform: "rotate(0)" }], 260); },
    outfit: { front: `<g class="stick" style="transform-origin:60px 82px"><path class="au" d="M48 14 L46 1 L54 8 L60 -3 L66 8 L74 1 L72 14 Z"/><circle class="gem" cx="60" cy="8" r="2.4"/></g>` },
    play: loop(stack(
      note("<[~ ~ e4 ~ ~ ~ e4 ~ ~ ~ e4 ~ ~ ~ c4 e4] [~ ~ c4 ~ ~ ~ c4 ~ ~ ~ c4 ~ ~ ~ a3 c4] [~ ~ e4 ~ ~ ~ e4 ~ ~ ~ g4 ~ ~ ~ e4 g4] [~ ~ d4 ~ ~ ~ d4 ~ ~ ~ b3 ~ ~ ~ d4 ~]>")
        .s("gm_synth_choir").decay(.2).sustain(0).release(.1).pan("<.3 .7>"),
      note("<[~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ e6 c6 a5 ~] [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ f6 c6 a5 ~] [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ g6 e6 c6 ~] [~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ d6 b5 g5 ~]>")
        .s("square").cutoff(5000).decay(.06).sustain(0).pan(.7).gain(.18)
    ), v => v.s === "square" ? "led" : "bump alt mouth") },
];
