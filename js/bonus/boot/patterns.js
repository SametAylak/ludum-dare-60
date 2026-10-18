import { cat, noteToMidi, stack } from "@strudel/core";
import { mini } from "@strudel/mini";

// Boot Sequence's score in Strudel mini-notation. One cycle is one game bar over Am | F | C | G; @ gives a note its
// length, ~ leaves space. Melodies run eight bars: the chorus phrase, then a variation for the groove and the break.
// Robot house: a vocoder sings the show's message over disk-seek bleeps, with no hook and no bass line. A second robot
// stutters the show's name in the lead's gaps, and off-beat chord stabs open a filter underneath. A talk-box guitar
// answers the robot in the chorus, and an acid bass slides in only for the peak.
export const SCORE = {
  roles: ["riff", "answer"],
  levels: { build: { riff: .4 }, drop: { riff: .75 }, break: { riff: 0, answer: .9 }, lift: { riff: .6, answer: .5 },
    peak: { riff: .9, answer: 1 } },
  answer: ["~@8 e5 e5 e5@2 d5@2 c5@2", "c5@6 ~@10", "~@8 e5 g5 g5@2 e5@2 d5@2", "d5@6 ~@10",
    "~@8 e5 e5 a5@2 g5@4", "~@8 f5 f5 a5@2 f5@4", "~@8 e5 e5 g5@2 c6@4", "~@8 b4@2 d5@6"],
  words: ["~@8 the ma chines@2 are@2 a@2", "live@6 ~@10", "~@8 the ma chines@2 are@2 a@2", "live@6 ~@10",
    "~@8 sys tem on@2 line@4", "~@8 sys tem on@2 line@4", "~@8 press a ny@2 key@4", "~@8 to@2 start@6"],
  riff: ["a5 ~ ~ e6 ~ ~ a5 ~ ~ c6 ~ ~ e6 ~ ~ ~", "a5 ~ ~ f6 ~ ~ a5 ~ ~ c6 ~ ~ f6 ~ ~ ~",
    "g5 ~ ~ e6 ~ ~ g5 ~ ~ c6 ~ ~ e6 ~ ~ ~", "g5 ~ ~ d6 ~ ~ g5 ~ ~ b5 ~ ~ d6 ~ g6 ~",
    "a5 e6 a6 ~ e6 a5 ~ c6 a5 e6 a6 ~ c6 ~ b5 c6", "a5 f6 a6 ~ f6 a5 ~ c6 a5 f6 a6 ~ c6 ~ g5 a5",
    "g5 e6 g6 ~ e6 g5 ~ c6 g5 e6 g6 ~ c6 ~ a5 b5", "g5 d6 g6 ~ d6 g5 ~ b5 g5 d6 g6 ~ b5 ~ c6 d6"],
  chops: ["boot ~ boot ~ se ~ quence ~ ~@8", "~@12 boot ~ boot boot", "boot ~ boot ~ se ~ quence ~ ~@8", "~@12 boot ~ se quence",
    "boot ~ boot ~ se ~ quence ~ ~@8", "~ ~ boot boot ~ ~ boot ~ ~@8", "boot ~ boot ~ se ~ quence ~ ~@8", "se quence se quence boot ~ ~ ~ ~@8"],
  chopWords: { groove: { boot: "load", se: "load", quence: "ing" }, lift: { boot: "re", se: "re", quence: "boot" },
    finale: { boot: "on", se: "on", quence: "line" } },
  talk: ["~", "~@6 a4 c5 f5@2 e5 c5@2 ~@4", "~", "~@6 g4 b4 d5@2 c5 b4@2 ~@4", "~", "~", "~", "~"],
  acid: "0 0 12 0 ~ 0 7 12 0 ~ 7 0 12 ~ 5 7",
  drums: ["bd*4", "~ sd ~ sd", "[~ hh]*4"],
  arp: "0 2 1 3 2 1 3 2",
};

const layer = (name, pattern) => pattern.fmap(value => ({ layer: name, value }));
const bars = (name, sources, to = value => value) => layer(name, cat(...sources.map(bar => mini(bar))).fmap(to));
export const PATTERN = stack(
  bars("answer", SCORE.answer, noteToMidi), bars("word", SCORE.words), bars("chop", SCORE.chops),
  bars("talk", SCORE.talk, noteToMidi), layer("acid", mini(SCORE.acid)), bars("riff", SCORE.riff, noteToMidi),
  ...SCORE.drums.map(source => layer("drum", mini(source))), layer("arp", mini(SCORE.arp)),
);

// Query the eight bars once; the audio thread only visits this step's events.
const EVENTS = Array.from({ length: 128 }, () => []);
for (const hap of PATTERN.queryArc(0, 8)) {
  const begin = Number(hap.whole.begin) * 16, end = Number(hap.whole.end) * 16, step = Math.floor(begin);
  EVENTS[step].push({ ...hap.value, offset: begin - step, length: end - begin });
}
// A sung line carries its syllable on the note itself.
for (const events of EVENTS) for (const word of events.filter(event => event.layer === "word"))
  events.find(event => event.layer === "answer" && event.offset === word.offset).word = word.value;
EVENTS.forEach(events => events.sort((a, b) => a.offset - b.offset));

// The variation keeps the song's chord: bar n of the second phrase still falls on chord n.
export const eventsAt = (songStep, variation = 0) => EVENTS[songStep % 64 + (variation ? 64 : 0)];
