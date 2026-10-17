# Beigebox

An Incredibox-style music game where old computer parts are the band. Drag a hard drive, floppy drive, modem, CRT monitor or speech chip onto the desk and each one adds its own loop to the mix.

Every sound is synthesized live with the Web Audio API. There are no audio files.

## Play

The game uses native ES modules, so it has to be served over HTTP. Opening `index.html` straight from disk (`file://`) won't load the scripts. There's no build step; any static server works:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

It also runs as-is on GitHub Pages.

## Controls

| Action | How |
| --- | --- |
| Add a part | Drag a key onto a slot, click a key, or press its letter |
| Remove a part | Click its key again, or the ✕ under it |
| Mute / solo | Click the part, or use the MUTE / SOLO buttons under it |
| Part volume | Fader under each part (0–150%); remembered per part while the page is open |
| Master volume | VOL fader in the header; remembered in this browser |
| Play / pause | `Space` or PLAY |
| Faster tempo | TURBO (110 → 128 BPM) |

| Group | Parts | Keys |
| --- | --- | --- |
| Beats | Hard Drive, Dot Matrix, Keyboard, Ball Mouse, Tape Drive | `1` – `5` |
| Effects | Modem, CRT Monitor, Cassette, PSU Fan, Teletype | `Q` `W` `E` `R` `T` |
| Melody | Floppy Drive, PC Speaker, Sound Card, Game Cartridge, Vacuum Tube | `A` `S` `D` `F` `G` |
| Voices | Speech Chip, Mainframe, Tower PC, Oscilloscope, Joystick | `Z` `X` `C` `V` `B` |

New parts join on the next bar so everything stays in time. All parts play over the same 4-bar progression (Am, F, C, G), so any combination fits.

Some trios of parts unlock bonus disks. There are four to find.

## Project layout

```
index.html              page markup; loads the CSS and js/main.js
css/
  base.css              color/type tokens, page shell, header
  stage.css             CRT backdrop, desk, slots
  art.css               styling and animations for the part drawings
  deck.css              keyboard palette and drag ghost
  responsive.css        breakpoints and reduced motion
js/
  main.js               entry point: wires modules, frame loop, boot
  config.js             tempo, chord progression, mtof
  state.js              shared state, slots, event bus
  combos.js             bonus-disk trios and unlock storage
  audio/
    synth.js            tone / noise / fm / formant voice primitives
    engine.js           audio graph, transport, step scheduler
  parts/
    helpers.js          SVG building blocks (eyes, mouths, LEDs, reels)
    beats.js effects.js melody.js voices.js   the 20 parts
    index.js            catalog: PARTS, byId, CATS, artSvg
  ui/
    stage.js            slots: place/remove, mute/solo, hit animations
    deck.js             keycaps and drag-and-drop
    header.js           buttons, bar indicator, keyboard shortcuts
    screen.js           CRT terminal text and oscilloscope
```

### Adding a part

Add an object to one of the files in `js/parts/`:

```js
{ id: "zip", cat: "fx", key: "Y", name: "ZIP DRIVE", short: "ZIP", gain: 1,
  art: () => `<rect class="b" x="10" y="40" width="100" height="86" rx="8"/>${E(60, 70)}${M(60, 92)}`,
  play(s, t, out, hit) {          // s = step 0–63, t = audio time
    if (s % 16 === 0) { noise(out, t, { f: 1500, r: .2 }); hit(t, "bump"); }
  } }
```

`hit(time, kinds, dur)` schedules a visual reaction: `bump`, `led`, `mouth` (open for `dur` seconds) or `alt` (the part's own `alt(svg)` animation).

## How it works

- **Sequencer:** a look-ahead scheduler queues 16th-note steps about 120 ms ahead on the `AudioContext` clock. Each part's `play(step, time, out, hit)` schedules its notes and visual hits for that step.
- **Synthesis:** oscillators, filtered noise, 2-operator FM and a formant filter bank for the "singing" voices.
- **Visuals:** the parts are inline SVG, animated with the Web Animations API when their scheduled hits come due. The CRT backdrop draws the master output from an `AnalyserNode`.
