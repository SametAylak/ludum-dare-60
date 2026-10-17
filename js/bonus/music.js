// The fanfare and each bonus's extra music layer.
import { audio } from "../audio/engine.js";
import { fm, noise, pulseWave, tone, voice } from "../audio/synth.js";
import { CHORDS, clock, mtof } from "../music.js";

// Each bonus adds its own layer for two loops after the fanfare.
const ARP8 = [0, 1, 2, 3, 4, 3, 2, 1];
const CHOIR = [[76, 72], [77, 81], [79, 76], [74, 79]];
const LAN_LEAD = [
  [[0, 76, 2], [2, 81, 2], [4, 84, 2], [6, 81, 2], [8, 88, 3], [11, 84, 1], [12, 81, 4]],
  [[0, 77, 2], [2, 81, 2], [4, 84, 2], [6, 81, 2], [8, 89, 3], [11, 84, 1], [12, 81, 4]],
  [[0, 76, 2], [2, 79, 2], [4, 84, 2], [6, 79, 2], [8, 88, 3], [11, 84, 1], [12, 79, 4]],
  [[0, 74, 2], [2, 79, 2], [4, 83, 2], [6, 86, 2], [8, 91, 4], [12, 86, 2], [14, 83, 2]],
];
export const BONUS_MUSIC = {
  boot(s, t, d) {   // fast BIOS arpeggio, with a POST beep at the top of the loop
    const ch = CHORDS[s >> 4], b = s & 15, ns = [...ch.n, ch.n[0] + 12, ch.n[1] + 12];
    tone(d, t, { wave: pulseWave(.125), f: mtof(ns[ARP8[b % 8]] + 12), vol: .04, hold: clock.SPB * .4, r: .02 });
    if (s === 0) tone(d, t, { f: 1046, vol: .08, hold: .12, r: .03 });
  },
  dial(s, t, d) {   // glassy FM bells on eighths
    const ch = CHORDS[s >> 4], b = s & 15, ns = [...ch.n, ch.n[0] + 12];
    if (b % 2 === 0) fm(d, t, { f: mtof(ns[[2, 1, 0, 1, 2, 3, 2, 1][b >> 1]] + 24), ratio: 3.5, index: 2.5, vol: .035, r: .45 });
  },
  main(s, t, d) {   // soprano line over a low choir
    const bar = s >> 4, b = s & 15;
    if (b === 0 || b === 8) voice(d, t, { f: mtof(CHOIR[bar][b >> 3]), vowel: "a", vol: .13, a: .06, hold: clock.SPB * 7, r: .2, vib: .018 });
    if (b === 0) voice(d, t, { f: mtof(CHORDS[bar].root + 12), vowel: "o", vol: .07, a: .2, hold: clock.SPB * 14, r: .3, scoop: 1 });
  },
  lan(s, t, d) {    // chiptune victory lead with offbeat hats
    const b = s & 15;
    for (const [st, n, len] of LAN_LEAD[s >> 4]) if (st === b)
      tone(d, t, { wave: pulseWave(.125), f: mtof(n), vol: .05, hold: clock.SPB * len * .7, r: .04, vib: .008, vibRate: 7 });
    if (b % 4 === 2) noise(d, t, { type: "highpass", f: 8000, vol: .06, r: .025 });
  },
};
export function fanfare(t, ch) {
  const ns = [...ch.n, ch.n[0] + 12, ch.n[1] + 12, ch.n[2] + 12, ch.n[0] + 24, ch.n[2] + 12];
  ns.forEach((n, i) => tone(audio.fxBus, t + i * clock.SPB * .5, { wave: pulseWave(.125), f: mtof(n + 12), vol: .05, hold: clock.SPB * .3, r: .06 }));
}
