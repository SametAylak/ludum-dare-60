# Beigebox

An Incredibox-style music game where old computer parts are the band. Drag a hard drive, floppy drive, modem, CRT monitor or speech chip onto the desk and each one adds its own loop to the mix.

Every sound is synthesized live with the Web Audio API. There are no audio files.

## Play

Open `index.html` in a browser. Because it's a single file, it can also be served from any static host:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Controls

| Action | How |
| --- | --- |
| Add a part | Drag a key onto a slot, click a key, or press its letter |
| Remove a part | Click its key again, or the ✕ under it |
| Mute / solo | Click the part, or use the MUTE / SOLO buttons under it |
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

## How it works

- **Sequencer:** a look-ahead scheduler queues 16th-note steps about 120 ms ahead on the `AudioContext` clock. Each part's `play(step, time, out, hit)` schedules its notes and visual hits for that step.
- **Synthesis:** oscillators, filtered noise, 2-operator FM and a formant filter bank for the "singing" voices.
- **Visuals:** the parts are inline SVG, animated with the Web Animations API when their scheduled hits come due. The CRT backdrop draws the master output from an `AnalyserNode`.
