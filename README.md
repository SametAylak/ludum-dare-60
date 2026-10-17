# Beigebox

An Incredibox-style music game where old computer parts are the band. Drag a hard drive, floppy drive, modem, CRT monitor or speech chip onto the desk and each one adds its own loop to the mix.

Every sound is synthesized live with the Web Audio API. There are no audio files.

## Play

The game is plain HTML, CSS and JavaScript modules with no build step. Browsers don't load JavaScript modules from `file://`, so serve the folder with any static server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

It can be deployed to any static host as is.

## Controls

| Action | How |
| --- | --- |
| Add a part | Drag an icon onto a performer, click an icon, or press its letter |
| Remove a part | Click its icon again, or the ✕ that appears over it on hover |
| Mute / solo | Click the performer, or use the mute / solo buttons over it |
| Play / pause | `Space` or PLAY |
| Master volume | Slider next to the speaker; click the speaker or press `M` to mute everything |
| Part volume | Hover a performer and use its slider (0–125%). Each part remembers its level |
| Tempo | Slider or − / + (80–180 BPM), or the `-` and `=` keys. Above 130 BPM the parts overclock: they glow, shake, sweat and finally smoke |

| Group | Parts | Keys |
| --- | --- | --- |
| Beats | Hard Drive, Dot Matrix, Keyboard, Ball Mouse, Tape Drive | `1` – `5` |
| Effects | Modem, CRT Monitor, Cassette, PSU Fan, Teletype | `Q` `W` `E` `R` `T` |
| Melody | Floppy Drive, PC Speaker, Sound Card, Game Cartridge, Vacuum Tube | `A` `S` `D` `F` `G` |
| Voices | Speech Chip, Mainframe, Tower PC, Oscilloscope, Joystick | `Z` `X` `C` `V` `B` |

New parts join on the next bar so everything stays in time. All parts play over the same 4-bar progression (Am, F, C, G), so any combination fits.

Some trios of parts unlock bonus disks. There are four to find. Hitting one sets off a short show: a fanfare, an extra music layer for two loops, and a themed animation on a pop-up monitor while the three parts take the spotlight.

## How it works

- **Sequencer:** a look-ahead scheduler queues 16th-note steps about 120 ms ahead on the `AudioContext` clock. Each part's `play(step, time, out, hit)` schedules its notes and visual hits for that step.
- **Synthesis:** oscillators, filtered noise, 2-operator FM and a formant filter bank for the "singing" voices.
- **Visuals:** the parts are inline SVG performers with legs, animated with the Web Animations API when their scheduled hits come due. The whole band nods on every beat, and empty slots hold a grey, sleeping stand-in. A faint waveform of the master output (from an `AnalyserNode`) sits behind the stage.

## Project layout

```
index.html            markup only
css/                  base, header, stage, bonus, parts, overclock, deck, responsive
js/
  main.js             entry point: init + frame loop
  state.js            shared mutable state (transport position, slots, bonus show)
  music.js            tempo (clock) and the chord progression
  dom.js, util.js     shared elements and helpers
  transport.js        look-ahead sequencer, play/pause, tempo
  mixer.js            per-part gain, mute/solo, master and part volume
  audio/              AudioContext + bus (engine.js), synth voices (synth.js)
  parts/              the 20 parts by category, plus their SVG building blocks (art.js)
  bonus/              trios (combos.js), bonus music, monitor scenes, the show itself
  ui/                 stage slots, palette, header, HUD, performer animation, waveform, confetti
```

To add a part, append an entry to the matching file in `js/parts/`. It needs `id`, `cat`, `key`, `name`, `gain`, an `art()` SVG and a `play(step, time, out, hit)` function.
