# Beigebox

An Incredibox-style music game where old computer parts are the band. Drag a hard drive, floppy drive, modem, CRT monitor or speech chip onto the desk and each one adds its own loop to the mix.

Every band sound is synthesized live with the Web Audio API. The only audio files are the two recorded voices used by some bonus shows, in `audio/`.

## Play

The game is plain HTML, CSS and JavaScript modules with no build step. Browsers don't load JavaScript modules from `file://`, so serve the folder with a local server:

```sh
pnpm install
pnpm dev
# then open http://localhost:5173
```

`pnpm dev` runs Vite, which reloads the page when you save a file. Any static server works too, for example `python3 -m http.server 8000`.

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
| Record | REC starts recording (and playback). The timer pauses with the mix. Click it again to save the file: WebM/Opus, or M4A in Safari |
| Tempo | Slider or − / + (80–180 BPM), or the `-` and `=` keys. Above 130 BPM the parts overclock: they glow, shake, sweat and finally smoke |

| Group | Parts | Keys |
| --- | --- | --- |
| Beats | Hard Drive, Dot Matrix, Keyboard, Ball Mouse, Tape Drive | `1` – `5` |
| Effects | Modem, CRT Monitor, Cassette, PSU Fan, Teletype | `Q` `W` `E` `R` `T` |
| Melody | Floppy Drive, PC Speaker, Sound Card, Game Cartridge, Vacuum Tube | `A` `S` `D` `F` `G` |
| Voices | Speech Chip, Mainframe, Tower PC, Oscilloscope, Joystick | `Z` `X` `C` `V` `B` |

New parts join on the next bar so everything stays in time. All parts play over the same 4-bar progression (Am, F, C, G), so any combination fits.

Some trios unlock bonus disks. There are five to find. Each brings two animated guests in from the sides, lowers a mirrored disco ball, and turns the stage into a dance floor. A transmission card introduces the guests before becoming a small live monitor, with eight bars of bonus music and a countdown. The show follows the song clock, including pause and tempo changes. Removing or muting a required part ends it. Simultaneous discoveries play in order.

Click a bonus disk for its trio, or replay a discovered show while its trio is audible. Each show has its own guest pairing and lighting colors. Reduced-motion mode stops the crowd from dancing.

<details>
<summary><b>Bonus combinations</b> (spoilers)</summary>

| Bonus | Trio | Keys | Guests |
| --- | --- | --- | --- |
| Boot Sequence | Hard Drive + Floppy Drive + CRT Monitor | `1` `A` `W` | Telegraph, Tube Radio |
| Dial-up Nights | Modem + Speech Chip + PC Speaker | `Q` `Z` `S` | Tube Radio, Gramophone |
| Mainframe Opera | Mainframe + Tape Drive + Teletype | `X` `5` `T` | Rotary Phone, Telegraph |
| LAN Party | Game Cartridge + Keyboard + Joystick | `F` `3` `B` | Gramophone, Rotary Phone |
| Cosmic Telegraph | Teletype + Vacuum Tube + Oscilloscope | `T` `G` `V` | Telegraph, Gramophone |

The trio can sit in any slots, alongside other parts. All three must be audible: a part that is muted, turned down to 0%, or silenced by another part's solo doesn't count. The trios are defined in `js/bonus/combos.js`.

</details>

The guests also change the music. Their entrance filters the band into a rising drum roll, followed by a short gap and a disco drop with bass, claps and stereo call-and-response. A breakdown leads into a second drop with extra harmonies. Telegraph guests play keyed synth melodies, gramophones play brass stabs, radios sing through formant filters, and rotary phones ring FM notes with tape-style echoes. Their movements and lighting follow the scheduled notes. The band mix returns automatically when the show finishes or is cancelled; individual volume and mute settings stay intact.

Two shows use recordings. Boot Sequence opens with a spoken transmission about an extreme amount of radiation, over the intro. In Dial-up Nights a female house vocal hook (recorded at 125 BPM in D minor) sings from the first drop to the end of the finale. It plays as crossfaded 16th-note grains, so it stays in time at any tempo without changing pitch. To move them, set `sample: "speech"` or `sample: "hook"` on a show in `js/bonus/combos.js`. Recordings download and decode when the page loads, so they're ready even when a show opens the moment PLAY is pressed.

## How it works

- **Sequencer:** a look-ahead scheduler queues 16th-note steps about 120 ms ahead on the `AudioContext` clock. Each part's `play(step, time, out, hit)` schedules its notes and visual hits for that step.
- **Synthesis:** oscillators, filtered noise, 2-operator FM and a formant filter bank for the "singing" voices.
- **Visuals:** the parts are inline SVG performers with legs. On stage each group dresses as one act: the beats are a hip-hop crew in baggy jeans, the effects a punk band in ripped skinnies, the melody a jazz combo in suit trousers and the voices a choir in robes. Each part adds its own hat, shades, bow tie or chain, which drop on just after it lands. The palette icons stay bare. The performers are animated with the Web Animations API when their scheduled hits come due. The whole band nods on every beat, and empty slots hold a grey, sleeping stand-in. A faint waveform of the master output (from an `AnalyserNode`) sits behind the stage.

## Project layout

```
index.html            markup only
audio/                recorded voices used by the bonus shows (WAV)
css/                  base, header, stage, bonus, parts, overclock, deck, responsive
js/
  main.js             entry point: init + frame loop
  state.js            shared mutable state (transport position, slots, bonus show)
  music.js            tempo (clock) and the chord progression
  dom.js, util.js     shared elements and helpers
  transport.js        look-ahead sequencer, play/pause, tempo
  mixer.js            per-part gain, mute/solo, master and part volume
  recorder.js         records the master output and saves it as an audio file
  audio/              AudioContext + bus (engine.js), synth voices (synth.js)
  parts/              the 20 parts by category, plus their SVG building blocks (art.js) and stage costumes (outfits.js)
  bonus/              trios, music, monitor scenes, SVG guests, stage lighting, show timing
  ui/                 stage slots, palette, header, HUD, performer animation, waveform
```

To add a part, append an entry to the matching file in `js/parts/`. It needs `id`, `cat`, `key`, `name`, `gain`, an `art()` SVG, an optional `outfit` (`{ back, front }` SVG drawn behind and over the body) and a `play(step, time, out, hit)` function.

Run the bonus arrangement checks with `node tests/bonus-score.test.mjs`. They verify the two drops, the gaps before them, both guest phrases, and chord-compatible melodies for all five shows.
