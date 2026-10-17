# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm install` then `pnpm dev` — serves the game with Vite at http://localhost:5173 (hot reload). Any static server works (`python3 -m http.server 8000`); `file://` does not, because the code is ES modules.
- `node tests/bonus-score.test.mjs` — the only test suite (Node's built-in `node:test`). Run a single test with `node --test-name-pattern="<regex>" tests/bonus-score.test.mjs`.
- There is no build step, bundler config, linter or formatter. The repo is deployed as-is to a static host.

## What this is

Beigebox: an Incredibox-style browser music game (Ludum Dare entry) where retro computer parts are performers. Plain HTML/CSS/vanilla JS modules, no framework, no runtime dependencies. All sound is synthesized live with Web Audio — there are no audio files. The README has the controls, part/key table and bonus trios.

## Architecture

**Timing model (the core idea).** Everything is driven by a look-ahead sequencer on the `AudioContext` clock, not by `requestAnimationFrame`:
- `js/transport.js` runs `tick()` every 25 ms and schedules 16th-note steps ~120 ms ahead. For each step it calls every occupied slot's `part.play(step % LOOP, time, slotGainNode, hit)`, and the bonus music when a show is active.
- Parts never touch the DOM. They schedule audio and call `hit(time, kinds, dur)`, which pushes a visual event onto `vq`; each step is also pushed onto `sq`.
- `js/main.js`'s frame loop drains `sq`/`vq` when `audio.ctx.currentTime` reaches each event's time, firing `onStep` and performer animations (`ui/performers.js`). So visuals stay in sync with what is actually heard.
- `LOOP = 64` steps = 4 bars over the fixed Am–F–C–G progression in `js/music.js` (`CHORDS`). Anything melodic must fit those chords. `clock` is a shared mutable object (`BPM`, `SPB` = seconds per 16th); always read it at call time.
- New parts join on the next bar (`slot.start`).

**Shared state.** `js/state.js` holds mutable singletons imported everywhere: `state` (transport position, current scene/bonus show), `slots` (7 stage slots; filled in `FILL_ORDER`), `unlocked` (bonus IDs persisted to `localStorage` key `beigebox.bonus`), `liveCombos`.

**Audio graph.** `js/audio/engine.js` builds the graph lazily on first user gesture (`ensureAudio`): per-slot gains (from `mixer.js`) → `bandFilter` → `bandGain` → `master` → compressor/shaper → output, plus a tempo-synced delay send and an `fxBus` (panned `fxLeft`/`fxRight`) used by bonus guests. Bonus shows duck/filter the band by automating `bandGain`/`bandFilter` and restore them on exit. `js/audio/synth.js` has the voice primitives (`kick`, `noise`, `tone`, `fm`, `voice` formant, `pulseWave`) that parts compose. `mixer.js` owns mute/solo/volume and decides `slot.audible`.

**Parts.** `js/parts/{beats,effects,melody,voices}.js` each export an array of part objects (`id`, `cat`, `key`, `name`, `gain`, `art()` SVG string, optional `alt`, optional `outfit {back, front}`, `play(...)`). `parts/index.js` merges them into `PARTS`/`byId`. SVG helpers (eyes `E`, mouth `M`, LED `L`, `anim`) live in `parts/art.js`; costume pieces in `parts/outfits.js`. Animation keys passed in `hit` kinds (e.g. `"bump alt"`, `"led"`) are interpreted by `ui/performers.js` and CSS classes.

**Bonus shows** (`js/bonus/`). `combos.js` defines the five trios and guests. When all three parts of a trio are audible, `show.js` queues a show that runs on the song clock (step counts, so it follows pause and tempo): `INTRO_STEPS` card → `MUSIC_STEPS` of guest music → outro (`SHOW_STEPS` total). `score.js` is pure (no DOM/audio) — section layout (`sectionAt`) and guest note generation (`guestNote`) — which is why it's the part under test. `music.js` turns the score into sound, `scenes.js`/`guests.js`/`atmosphere.js` draw the monitor, SVG guests and lighting. Muting/removing a required part cancels the show.

**Overclock.** `setBpm` in `transport.js` sets CSS vars `--oc`/`--spd` and classes `oc1`–`oc3` on the app root; the heat visuals are pure CSS (`css/overclock.css`).

**Hot-reload hook.** `main.js` integrates with an optional `window.claude.hot` (snapshot/ready) to persist slots and BPM across reloads; it falls back to a default lineup when absent.

## Conventions

- Code is deliberately terse: dense one-liners, short local names, few comments (one header comment per file). Match that style.
- `index.html` is markup only; styles are split by area under `css/`.
- Respect `prefers-reduced-motion` (`reduce` in `util.js`) for new animation.
