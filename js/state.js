// Shared mutable game state and a tiny event bus.
//   "power"  transport started or paused
//   "tempo"  turbo toggled
//   "slots"  a part was added, removed, muted or soloed

export const bus = new EventTarget();
export const emit = name => bus.dispatchEvent(new Event(name));
export const on = (name, fn) => bus.addEventListener(name, fn);

export const state = {
  running: false,      // audio is playing (not paused)
  transportOn: false,  // the sequencer has been started at least once
  turbo: false,
  step: 0,             // next 16th-note step to schedule
  nextTime: 0,         // AudioContext time of that step
  curStep: -1,         // step currently audible
  uid: 0,
  notice: null,        // { text, until } transient message for the terminal
};

export const slots = Array.from({ length: 7 }, (_, i) => ({
  i, id: null, muted: false, solo: false, start: 0, uid: 0,
  g: null, s: null,    // per-slot gain and delay-send nodes
  audible: false,
}));

// Order in which clicked/keyed parts fill the stage: from the center outward.
export const FILL_ORDER = [3, 2, 4, 1, 5, 0, 6];

export const sq = [];  // scheduled steps   { n, t }
export const vq = [];  // scheduled visuals { t, i, uid, kinds, dur }

export const nextUid = () => ++state.uid;
