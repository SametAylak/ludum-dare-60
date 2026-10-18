// Packs the two SampleFocus recordings into audio/voices.bin: each one gets a lo-fi treatment (mono, 22 kHz, band-limited,
// lightly crushed) so the game never ships the downloaded sound, then they're stored as masked WAVs behind a length header.
// The order and KEY must match loadPack in js/audio/engine.js. Run after downloading the recordings (see README).
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const KEY = new TextEncoder().encode("beigebox");
const VOICES = [
  ["audio/needed-you-hook.wav", "highpass=f=180,lowpass=f=4500,equalizer=f=1800:t=q:w=1:g=4,acrusher=bits=12:mix=.35:mode=log,asoftclip=type=tanh"],
  ["audio/extreme-radiation.wav", "highpass=f=300,lowpass=f=3200,acrusher=bits=8:mix=.25:mode=log,aecho=.8:.6:45:.3,volume=6dB,asoftclip=type=tanh"],
];

const missing = VOICES.filter(([f]) => !existsSync(f)).map(([f]) => f);
if (missing.length) { console.warn(`pack-voices: missing ${missing.join(", ")}; the shows will play without voices.`); process.exit(0); }
const wavs = VOICES.map(([f, af]) => execFileSync("ffmpeg", ["-v", "error", "-i", f, "-af", af, "-ac", "1", "-ar", "22050", "-c:a", "pcm_s16le", "-f", "wav", "-"], { maxBuffer: 1 << 26 }));
const head = Buffer.alloc(4 + 4 * wavs.length), body = Buffer.concat(wavs);
head.writeUInt32LE(wavs.length, 0); wavs.forEach((w, i) => head.writeUInt32LE(w.length, 4 + 4 * i));
body.forEach((x, i) => body[i] = x ^ KEY[i % KEY.length]);
writeFileSync("audio/voices.bin", Buffer.concat([head, body]));
console.log(`pack-voices: audio/voices.bin, ${(head.length + body.length) / 1e6 | 0} MB`);
