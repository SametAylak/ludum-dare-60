# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm install` then `pnpm dev` — serves the game with Vite at http://localhost:5173 (hot reload). Any static server works (`python3 -m http.server 8000`); `file://` does not, because the code is ES modules.
- `node tests/bonus-score.test.mjs` — the only test suite (Node's built-in `node:test`). Run a single test with `node --test-name-pattern="<regex>" tests/bonus-score.test.mjs`.
- There is no build step, bundler config, linter or formatter. The repo is deployed as-is to a static host.

## What this is

Beigebox: an Incredibox-style browser music game (Ludum Dare entry) where retro computer parts are performers. Plain HTML/CSS/vanilla JS modules, no framework. Sound comes from [Strudel](https://strudel.cc/) (superdough, @strudel/core, @strudel/mini), imported pinned from jsDelivr in `js/audio/strudel.js`; samples come from the Dirt-Samples and tidal-drum-machines banks on GitHub and GM soundfonts from webaudiofontdata, so the game needs the network. Strudel is AGPL-3.0. The only audio files in the repo are two recorded bonus samples in `audio/` (loaded by `bonus/music.js` via `loadSample`, enabled per trio with `sample` in `combos.js`). The README has the controls, part/key table and bonus trios.

## Architecture

**Timing model (the core idea).** Everything is driven by a look-ahead sequencer on the `AudioContext` clock, not by `requestAnimationFrame`:
- `js/transport.js` runs `tick()` every 25 ms and schedules 16th-note steps ~120 ms ahead. For each step it calls every occupied slot's `part.play(step % LOOP, time, slotGainNode, hit)`, and the bonus music when a show is active.
- Parts never touch the DOM. They schedule audio and call `hit(time, kinds, dur)`, which pushes a visual event onto `vq`; each step is also pushed onto `sq`.
- `js/main.js`'s frame loop drains `sq`/`vq` when `audio.ctx.currentTime` reaches each event's time, firing `onStep` and performer animations (`ui/performers.js`). So visuals stay in sync with what is actually heard.
- `LOOP = 64` steps = 4 bars over the fixed Am–F–C–G progression in `js/music.js` (`CHORDS`). Anything melodic must fit those chords. `clock` is a shared mutable object (`BPM`, `SPB` = seconds per 16th); always read it at call time.
- New parts join on the next bar (`slot.start`).

**Shared state.** `js/state.js` holds mutable singletons imported everywhere: `state` (transport position, current scene/bonus show), `slots` (7 stage slots; filled in `FILL_ORDER`), `unlocked` (bonus IDs persisted to `localStorage` key `beigebox.bonus`), `liveCombos`.

**Audio graph.** `js/audio/engine.js` builds the graph lazily on first user gesture (`ensureAudio`): per-slot gains (from `mixer.js`) → `bandFilter` → `bandGain` → `master` → compressor/shaper → output, plus a tempo-synced delay send and an `fxBus` (panned `fxLeft`/`fxRight`) used by bonus guests. Bonus shows duck/filter the band by automating `bandGain`/`bandFilter` and restore them on exit. `js/audio/strudel.js` hands superdough our `AudioContext` and gives each destination node its own Strudel orbit, re-routed from superdough's output into that node (a slot's gain, `fxLeft`/`fxRight`, `fxBus`), so mixer and ducking apply; `releaseOrbit` frees it when the slot drops its nodes. It registers the sample banks and a small GM soundfont loader (the `@strudel/soundfonts` package doesn't load from the CDN), and `preload` decodes every sound the patterns use at page load. `sd(dest, t, value, dur)` plays one event; bonus music uses it directly. `mixer.js` owns mute/solo/volume and decides `slot.audible`.

**Parts.** `js/parts/{beats,effects,melody,voices,choir}.js` each export an array of part objects (`id`, `cat`, `key`, `name`, `gain`, `art()` SVG string, optional `alt`, optional `outfit {back, front}`, `play(...)`). Each `play` is `loop(pattern, kinds)`: a Strudel mini-notation pattern where one cycle is one bar (so `<a b c d>` steps through the 4-bar loop), queried a 16th at a time by the transport; `kinds(value)` picks the performer animation for each event. Melodic patterns spell notes out over Am–F–C–G (no `@strudel/tonal`). Dirt-Samples with unknown root pitch are only used for unpitched sounds. `parts/index.js` merges them into `PARTS`/`byId`. SVG helpers (eyes `E`, mouth `M`, LED `L`, `anim`) live in `parts/art.js`; costume pieces in `parts/outfits.js`. Animation keys passed in `hit` kinds (e.g. `"bump alt"`, `"led"`) are interpreted by `ui/performers.js` and CSS classes.

**Bonus shows** (`js/bonus/`). `combos.js` defines the five trios and guests. When all three parts of a trio are audible, `show.js` queues a show that runs on the song clock (step counts, so it follows pause and tempo): `INTRO_STEPS` card → `MUSIC_STEPS` of guest music → outro (`SHOW_STEPS` total). `score.js` is pure (no DOM/audio) — section layout (`sectionAt`) and guest note generation (`guestNote`) — which is why it's the part under test. `music.js` turns the score into sound, `scenes.js` draws the ON AIR monitor, `guests.js` draws the two old-tech guests with the band's own `artSvg` (legs, eyes, palette), and `atmosphere.js` paints the party canvas (crowd, disco ball, and the beams that spotlight the trio's `.slot.star` performers). Guests stand on the floor beside the shelf, which narrows during a show (`--gw`). Muting/removing a required part cancels the show.

**Overclock.** `setBpm` in `transport.js` sets CSS vars `--oc`/`--spd` and classes `oc1`–`oc3` on the app root; the heat visuals are pure CSS (`css/overclock.css`).

**Layout.** The header (`.top`) and palette (`.deck`) are frosted glass floating over the stage; `ui/header.js` measures them into `--top-h`/`--deck-h` on `.app`, and the stage pads by those. Anything absolutely positioned in the stage, or drawn on its canvases, must offset by them. The header's bonus disks fill a third per audible trio part (`ui/hud.js`).

**Live FX** (`js/fx.js`, pads in `ui/pads.js`). Whole-mix effects queued from a pad or key and started by `fxStep` on their grid (next beat, 8th or bar). Rhythm effects hook the scheduler: `resting` mutes non-beat slots during a drop, and `musicSteps` maps the real step to the musical step(s) the parts play (stutter repeats an 8th, half/double time play steps at half or twice the rate for a bar, then the band is back on `n % LOOP`). Master effects sit between `master` and the compressor: `sweep` (low-pass) and `tape` (a delay whose delay grows as t²/2D, which winds the whole mix down, then snaps to 0). `fq` carries stage reactions (classes on `.app`, the hint text) to the frame loop.

**Other UI.** `recorder.js` records the master output (tapped from `audio.analyser`) with `MediaRecorder`; `ui/visualizer.js` draws the media-player visualization behind the stage from the same analyser; `ui/onboard.js` is the first-run tour; `ui/gaze.js` makes performers and guests follow the mouse; `ui/entrance.js` holds the per-category stage entrances. Other `localStorage` keys: `beigebox.vol` (mixer volumes) and `beigebox.intro` (tour seen).

**Hot-reload hook.** `main.js` integrates with an optional `window.claude.hot` (snapshot/ready) to persist slots and BPM across reloads; it falls back to a default lineup when absent.

## Conventions

- Code is deliberately terse: dense one-liners, short local names, few comments (one header comment per file). Match that style.
- `index.html` is markup only; styles are split by area under `css/`.
- Respect `prefers-reduced-motion` (`reduce` in `util.js`) for new animation.
