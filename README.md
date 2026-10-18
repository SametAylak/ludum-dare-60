# Beigebox

An Incredibox-style music game where old computer parts are the band. Drag a hard drive, floppy drive, modem, CRT monitor or speech chip onto the desk and each one adds its own loop to the mix.

The band plays through [Strudel](https://strudel.cc/): each part is a Strudel mini-notation pattern using its synths, the Dirt-Samples and tidal drum machine banks, and General MIDI soundfonts. Strudel's libraries load from jsDelivr and its samples from GitHub, so the game needs a network connection. The only audio files in the repo are Boot Sequence's CC0 drum kit, in `samples/`. The two recorded voices some bonus shows use are not in the repo (see [Recordings](#recordings)).

## Play

The game is plain HTML, CSS and JavaScript modules with no build step. Browsers don't load JavaScript modules from `file://`, so serve the folder with a local server:

```sh
pnpm install
pnpm dev
# then open http://localhost:5173
```

`pnpm dev` runs Vite, which reloads the page when you save a file. Any static server works too, for example `python3 -m http.server 8000`.

## Deploy

`pnpm build` packs the recorded voices (see [Recordings](#recordings)) and builds the game into `dist/` with relative paths, so it runs from any folder of any static host. Upload that, not the repo: Boot Sequence's score imports Strudel by package name, which only works through Vite.

`pnpm pages` builds and publishes `dist/` as the `gh-pages` branch for GitHub Pages (Settings → Pages → Deploy from a branch → `gh-pages`, root), at https://sametaylak.github.io/ludum-dare-60/. It builds locally rather than in CI because the recordings aren't in the repo, and stops if `audio/voices.bin` is missing. For itch.io, zip the contents of `dist/` with `index.html` at the top.

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
| Live FX | The pads on the left of the stage hit the whole mix, in time: `Y` crash, `U` drop (only the beats play for a bar), `I` stutter (hold), `O` tape stop, `P` filter sweep (hold), `H` half time and `J` double time for a bar |

| Group | Parts | Keys |
| --- | --- | --- |
| Beats | Hard Drive, Dot Matrix, Keyboard, Ball Mouse, Tape Drive | `1` – `5` |
| Effects | Modem, CRT Monitor, Cassette, PSU Fan, Teletype | `Q` `W` `E` `R` `T` |
| Melody | Floppy Drive, PC Speaker, Sound Card, Game Cartridge, Vacuum Tube | `A` `S` `D` `F` `G` |
| Voices | Speech Chip, Mainframe, Tower PC, Oscilloscope, Joystick | `Z` `X` `C` `V` `B` |
| Choir | RAM Choir, CD-ROM, Zip Drive, UPS Battery, Server Rack | `6` – `0` |

New parts join on the next bar so everything stays in time. All parts play over the same 4-bar progression (Am, F, C, G), so any combination fits.

Some trios unlock bonus disks. There are five to find. Each brings two animated guests in from the sides, lowers a mirrored disco ball, and turns the stage into a dance floor. A transmission card introduces the guests before becoming a small live monitor, with eight bars of bonus music and a countdown. The show follows the song clock, including pause and tempo changes. Removing or muting a required part ends it. Simultaneous discoveries play in order.

Boot Sequence plays a longer show of its own: sixteen bars of robot house, written in [Strudel](https://strudel.cc) mini-notation in `js/bonus/boot/`. A vocoder robot sings "the machines are alive" over disk-seek bleeps and a sampled kit. A second robot stutters the show's name, a talk-box guitar answers in the chorus, and the machine loses power before the last chorus, then an acid bass slides in for the peak.

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

### Recordings

The recordings are SampleFocus samples. Their license lets the game use them, but not redistribute the sound on its own, in substantially the same form, or in a readily extractable format. So the downloads stay out of the repo (`audio/*.wav` is in `.gitignore`), and the game never ships them: `pnpm voices` (`tools/pack-voices.mjs`, needs `ffmpeg`) gives each a lo-fi treatment (mono, 22 kHz, band-limited, lightly bitcrushed; the speech also gets a short radio echo) and packs both into one masked file, `audio/voices.bin`, which is also gitignored. That file is the only one the game loads. Download the recordings from SampleFocus and save them as:

| File | Show | Sample |
| --- | --- | --- |
| `audio/extreme-radiation.wav` | Boot Sequence | the spoken transmission about an extreme amount of radiation (12 s) |
| `audio/needed-you-hook.wav` | Dial-up Nights | the "needed you" female house vocal hook, 125 BPM, D minor (17.3 s) |

Then run `pnpm voices` (`pnpm build` runs it too). Without `audio/voices.bin` the game still runs, and those two shows play without the voice.

## How it works

- **Sequencer:** a look-ahead scheduler queues 16th-note steps about 120 ms ahead on the `AudioContext` clock. Each part's `play(step, time, out, hit)` schedules its notes and visual hits for that step.
- **Synthesis:** oscillators, filtered noise, 2-operator FM and a formant filter bank for the "singing" voices.
- **Visuals:** the parts are inline SVG performers with legs. On stage each group dresses as one act: the beats are a hip-hop crew in baggy jeans, the effects a punk band in ripped skinnies, the melody a jazz combo in suit trousers and the voices a choir in robes. Each part adds its own hat, shades, bow tie or chain, which drop on just after it lands. The palette icons stay bare. The performers are animated with the Web Animations API when their scheduled hits come due. The whole band nods on every beat, and empty slots hold a grey, sleeping stand-in. The band plays in a neon venue under a starry sky full of comets: a lighting truss whose lamps chase the beat, speaker towers whose woofers pump and EQ meters bounce with the master output (from an `AnalyserNode`), and a skyline on the horizon.

## Project layout

```
index.html            markup only
audio/                recorded voices for the bonus shows, packed into voices.bin (not in the repo)
samples/              Boot Sequence's drum kit and hits (Sonic Pi, CC0)
tools/                pack-voices.mjs packs the recordings into audio/voices.bin; deploy-pages.sh publishes to GitHub Pages
css/                  base, header, stage, bonus, parts, overclock, deck, responsive
js/
  main.js             entry point: init + frame loop
  state.js            shared mutable state (transport position, slots, bonus show)
  music.js            tempo (clock) and the chord progression
  dom.js, util.js     shared elements and helpers
  transport.js        look-ahead sequencer, play/pause, tempo
  mixer.js            per-part gain, mute/solo, master and part volume
  recorder.js         records the master output and saves it as an audio file
  audio/              AudioContext + bus (engine.js), Strudel patterns, samples and soundfonts (strudel.js)
  parts/              the 25 parts by category, plus their SVG building blocks (art.js) and stage costumes (outfits.js)
  bonus/              trios, music, monitor scenes, SVG guests, stage lighting, show timing
    boot/             Boot Sequence's own score (Strudel), arrangement and instruments
  ui/                 stage slots, palette, header, HUD, performer animation, venue and sky
```

To add a part, append an entry to the matching file in `js/parts/`. It needs `id`, `cat`, `key`, `name`, `gain`, an `art()` SVG, an optional `outfit` (`{ back, front }` SVG drawn behind and over the body) and a `play(step, time, out, hit)` function, usually `loop(pattern, kinds)` from `js/audio/strudel.js` with a Strudel pattern (one cycle is one bar) and a function naming the performer animation for each event.

Run the bonus arrangement checks with `pnpm test`. They verify the two drops, the gaps before them, both guest phrases, and chord-compatible melodies for all five shows, plus Boot Sequence's own arrangement.

## Credits

- [Strudel](https://strudel.cc/) (`superdough`, `@strudel/core`, `@strudel/mini`) by Felix Roos and contributors, AGPL-3.0. It plays every part and Boot Sequence's score.
- [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) from TidalCycles, and [tidal-drum-machines](https://github.com/ritchse/tidal-drum-machines) through [dough-samples](https://github.com/felixroos/dough-samples). Both are loaded from GitHub at runtime.
- General MIDI soundfonts from [webaudiofontdata](https://github.com/surikov/webaudiofontdata) by Sergey Surikov, built from the FluidR3 (MIT, Frank Wen), JCLive, Aspirin and Chaos soundfonts. They are loaded at runtime.
- Boot Sequence's drum kit in `samples/` comes from [Sonic Pi](https://github.com/sonic-pi-net/sonic-pi/tree/dev/etc/samples) (CC0).
- The two recordings in `audio/` come from [SampleFocus](https://samplefocus.com/), under its Standard License. The game plays processed versions of them. They are not part of the repo or covered by its license.
- The fonts are [Fredoka](https://fonts.google.com/specimen/Fredoka) and [VT323](https://fonts.google.com/specimen/VT323) from Google Fonts (SIL Open Font License 1.1).

## License

Copyright (C) 2026 the Beigebox contributors.

Beigebox is free software under the [GNU Affero General Public License v3.0](LICENSE) or later, the same license as Strudel. The third-party sounds and fonts listed above keep their own licenses.
