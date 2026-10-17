// Bonus disks: trios of parts that unlock a CRT scene and a jingle.

import { slots, state } from "./state.js";
import { queueFanfare } from "./audio/engine.js";

export const COMBOS = [
  { id: "boot", name: "BOOT SEQUENCE", parts: ["hdd", "floppy", "crt"],
    lines: ["BEIGEBOX BIOS v4.51", "MEMORY TEST: 640K OK", "DETECTING IDE DRIVES... C: 420MB", "FLOPPY A: 1.44MB 3.5\"", "STARTING BEIGE-DOS...", "", "*** BONUS DISK: BOOT SEQUENCE ***"] },
  { id: "dial", name: "DIAL-UP NIGHTS", parts: ["modem", "speech", "pcspk"],
    lines: ["ATZ", "OK", "ATDT 555-0199", "CONNECT 28800/ARQ", "WELCOME TO THE NIGHT OWL BBS", "YOU HAVE 1 NEW MESSAGE", "", "*** BONUS DISK: DIAL-UP NIGHTS ***"] },
  { id: "main", name: "MAINFRAME OPERA", parts: ["mainframe", "tape", "teletype"],
    lines: ["//JOB042  JOB (ACCT),'OPERA'", "//STEP1   EXEC PGM=SING", "READING 2000 CARDS...", "LINE PRINTER READY", "RETURN CODE 0000", "", "*** BONUS DISK: MAINFRAME OPERA ***"] },
  { id: "lan", name: "LAN PARTY", parts: ["cart", "kbd", "joystick"],
    lines: ["IPX NETWORK FOUND", "PLAYER 2 HAS JOINED", "PLAYER 3 HAS JOINED", "PING 12MS   FRAGLIMIT 20", "GO GO GO", "", "*** BONUS DISK: LAN PARTY ***"] },
];

const STORE = "beigebox.bonus";
export const unlocked = new Set();
try { JSON.parse(localStorage.getItem(STORE) || "[]").forEach(id => unlocked.add(id)); } catch (e) {}
const save = () => { try { localStorage.setItem(STORE, JSON.stringify([...unlocked])); } catch (e) {} };

const live = new Set();
export const bonus = { scene: null };   // { c, at } most recently formed combo
export const isLive = id => live.has(id);

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
      bonus.scene = { c, at: performance.now() };
      queueFanfare();
      if (!unlocked.has(c.id)) { unlocked.add(c.id); save(); }
    } else if (!ok) live.delete(c.id);
  }
}
