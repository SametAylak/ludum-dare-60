// Bonus disks: trios of parts that unlock a bonus screen, a CRT scene and a jingle.

import { slots, state, emit } from "./state.js";
import { queueFanfare } from "./audio/engine.js";

export const COMBOS = [
  { id: "boot", name: "BOOT SEQUENCE", parts: ["hdd", "floppy", "crt"], color: "var(--c-beat)",
    lines: ["BEIGEBOX BIOS v4.51", "MEMORY TEST: 640K OK", "DETECTING IDE DRIVES... C: 420MB", "FLOPPY A: 1.44MB 3.5\"", "STARTING BEIGE-DOS...", "", "*** BONUS DISK: BOOT SEQUENCE ***"] },
  { id: "dial", name: "DIAL-UP NIGHTS", parts: ["modem", "speech", "pcspk"], color: "var(--c-fx)",
    lines: ["ATZ", "OK", "ATDT 555-0199", "CONNECT 28800/ARQ", "WELCOME TO THE NIGHT OWL BBS", "YOU HAVE 1 NEW MESSAGE", "", "*** BONUS DISK: DIAL-UP NIGHTS ***"] },
  { id: "main", name: "MAINFRAME OPERA", parts: ["mainframe", "tape", "teletype"], color: "var(--c-mel)",
    lines: ["//JOB042  JOB (ACCT),'OPERA'", "//STEP1   EXEC PGM=SING", "READING 2000 CARDS...", "LINE PRINTER READY", "RETURN CODE 0000", "", "*** BONUS DISK: MAINFRAME OPERA ***"] },
  { id: "lan", name: "LAN PARTY", parts: ["cart", "kbd", "joystick"], color: "var(--c-voc)",
    lines: ["IPX NETWORK FOUND", "PLAYER 2 HAS JOINED", "PLAYER 3 HAS JOINED", "PING 12MS   FRAGLIMIT 20", "GO GO GO", "", "*** BONUS DISK: LAN PARTY ***"] },
];

const STORE = "beigebox.bonus";
export const unlocked = new Set();
try { JSON.parse(localStorage.getItem(STORE) || "[]").forEach(id => unlocked.add(id)); } catch (e) {}
const save = () => { try { localStorage.setItem(STORE, JSON.stringify([...unlocked])); } catch (e) {} };

const live = new Set();
export const bonus = { scene: null };   // { c, at, fresh } most recently formed combo; fresh = first time found
export const isLive = id => live.has(id);

// True while all three parts of the trio are on stage and audible (checked every frame, not just on downbeats).
export const trioOn = c => c.parts.every(id => slots.some(s => s.id === id && s.audible));

function comboLive(c) {
  return c.parts.every(id => {
    const s = slots.find(x => x.id === id);
    return s && s.audible && state.curStep >= s.start;
  });
}

// Called on every downbeat.
export function checkCombos() {
  for (const c of COMBOS) {
    const ok = comboLive(c);
    if (ok && !live.has(c.id)) {
      live.add(c.id);
      const fresh = !unlocked.has(c.id);
      if (fresh) { unlocked.add(c.id); save(); }
      bonus.scene = { c, at: performance.now(), fresh };
      queueFanfare();
      emit("bonus");
    } else if (!ok) live.delete(c.id);
  }
}
