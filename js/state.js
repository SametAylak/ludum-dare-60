// Mutable game state shared across modules.

export const state = {
  running: false, transportOn: false,
  step: 0, nextTime: 0,      // scheduler position, ahead of the audio
  curStep: -1, curT: 0,      // what the listener hears now, and when it started
  uidN: 0,
  scene: null, bonusMus: null,
  notice: null,
};
export const slots = Array.from({ length: 7 }, (_, i) => ({ i, id: null, muted: false, solo: false, start: 0, uid: 0, g: null, s: null, audible: false }));
export const FILL_ORDER = [3, 2, 4, 1, 5, 0, 6];
export const unlocked = new Set();
try { JSON.parse(localStorage.getItem("beigebox.bonus") || "[]").forEach(id => unlocked.add(id)); } catch (e) {}
export const saveBonus = () => { try { localStorage.setItem("beigebox.bonus", JSON.stringify([...unlocked])); } catch (e) {} };
export const liveCombos = new Set();
