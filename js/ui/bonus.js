// Bonus screen: a full-stage overlay that plays a short text-mode scene when a bonus-disk trio forms,
// with the trio playing along in front. The DISKS button reopens it to replay any disk already found.

import { slots, state, on } from "../state.js";
import { SPB, reduceMotion } from "../config.js";
import { CATS, byId, artSvg } from "../parts/index.js";
import { COMBOS, unlocked, bonus, trioOn } from "../combos.js";
import { animateHit, onHit } from "./stage.js";

const LEN = 128;    // scene length in 16th steps (8 bars)
const INTRO = 16;   // first bar: the disk ejects and BONUS.EXE loads
const ROWS = 12;    // terminal rows; older lines scroll off the top

let root, els, btn, cur = null, ttyCache = "";
// cur = { c, k, live, t }: c = combo (null: no disks found yet), k = steps played, live = opened by the trio forming

// ---------- text-mode scenes: lines for step t of the scene (t = 0 when the intro ends) ----------

const pad = (n, w) => String(n).padStart(w, "0");
const meter = (p, w) => { const n = Math.round(Math.max(0, Math.min(1, p)) * w); return "#".repeat(n) + ".".repeat(w - n); };
const rnd = n => { n = Math.imul(n ^ (n >>> 15), 2246822507); n = Math.imul(n ^ (n >>> 13), 3266489909); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
const SPIN = "|/-\\";
const at = (t, list) => list.filter(([s]) => t >= s).map(([, l]) => l);   // [[step, line], ...] shown once reached

const SCENES = {
  boot(t) {
    const mem = Math.min(640, t * 40);
    const out = ["BEIGEBOX BIOS v4.51  (C) 1993 BEIGE CORP.", "CPU: 486DX2-66   CACHE: 8K", `MEMORY TEST: ${pad(mem, 6)}K${mem >= 640 ? " OK" : ""}`];
    if (t >= 18) out.push("DETECTING IDE DRIVES... " + (t >= 24 ? "C: 420MB" : SPIN[t % 4]));
    if (t >= 26) out.push('FLOPPY A: 1.44MB 3.5"');
    if (t >= 32) out.push("", `STARTING BEIGE-DOS... [${meter((t - 32) / 24, 16)}]${t >= 56 ? " OK" : ""}`);
    return out.concat(at(t, [
      [60, ""], [60, "C:\\> DIR A:"], [64, " BOOT     SYS      3,141"], [66, " HDD      DRV     65,536"],
      [68, " FLOPPY   DRV      1,440"], [70, " CRT      DRV     14,400"], [72, " BONUS    EXE    128,000"],
      [78, ""], [78, "C:\\> A:BONUS"], [84, "LOADING HDD.DRV FLOPPY.DRV CRT.DRV"], [90, "3 DEVICES ON THE BUS. ALL OK."],
    ]));
  },

  dial(t) {
    if (t < 32) {
      const noise = Array.from({ length: Math.min(34, Math.max(0, t - 12) * 2) }, (_, i) => "~^`'-_=+*#%&<>"[rnd(i * 7 + 3) * 14 | 0]).join("");
      return at(t, [[0, "ATZ"], [2, "OK"], [4, "ATDT 555-0199".slice(0, (t - 3) * 2)], [12, noise], [28, "CONNECT 28800/ARQ"]]);
    }
    const blink = t % 16 >= 14, led = n => rnd(t * 3 + n) > .45 ? "*" : ".";
    return [
      "   ,_,     WELCOME TO THE NIGHT OWL BBS",
      `  (${blink ? "-,-" : "O,O"})    SYSOP: CAPTAIN ZERO`,
      `  (   )    NODE 2   RX ${led(1)}  TX ${led(2)}`,
      '---"-"---  28800 BPS',
      "",
    ].concat(at(t, [
      [40, "[M]SG  [F]ILES  [D]OORS  [G]OODBYE"], [48, "YOU HAVE 1 NEW MESSAGE"], [54, "COMMAND? " + (t >= 58 ? "M" : "")],
      [62, "FROM: SYSOP   SUBJ: THAT TRIO"], [66, "NICE MIX. KEEP IT DOWN AFTER 11PM."], [76, "COMMAND? " + (t >= 80 ? "G" : "")],
      [86, "NO CARRIER"],
    ]));
  },

  main(t) {
    const out = at(t, [[0, "//JOB042  JOB (ACCT),'OPERA'"], [2, "//STEP1   EXEC PGM=SING"], [4, "//SYSIN   DD *"]]);
    if (t >= 6 && t < 48) {
      const card = t >> 1, row = r => Array.from({ length: 31 }, (_, x) => rnd(card * 131 + r * 37 + x) < .2 ? "o" : " ").join("");
      out.push(`READING CARDS  ${pad(Math.min(2000, (t - 6) * 50), 4)}/2000`,
        " _______________________________", `/${row(0)}|`, `|${row(1)}|`, `|${row(2)}|`, "|_______________________________|");
      return out;
    }
    if (t >= 48) out.push("2000 CARDS READ", "LINE PRINTER 1403 READY");
    if (t >= 54) {
      const n = Math.min(LIBRETTO.length, (t - 54 >> 2) + 1);
      for (let r = 0; r < 5; r++) {
        const l = LIBRETTO[n - 5 + r] || "", h = (n + r) % 2 ? "o" : " ";
        out.push(` ${h}| ${l.padEnd(28)}|${h}`);
      }
    }
    if (t >= 94) out.push("RETURN CODE 0000");
    return out;
  },

  lan(t, c) {
    const who = c.parts.map(id => byId[id].short);
    if (t < 16) return at(t, [[0, "IPX NETWORK FOUND"], [2, `PLAYER 2 (${who[1]}) HAS JOINED`], [4, `PLAYER 3 (${who[2]}) HAS JOINED`],
      [6, "MAP: E1M1   PING 12MS"], [12, "GO GO GO"]]);
    const done = FRAGS.filter(([s]) => t >= s), score = [0, 1, 2].map(p => done.filter(f => f[1] === p).length);
    if (t >= 96) {
      const rank = [0, 1, 2].sort((a, b) => score[b] - score[a]);
      return ["== MATCH OVER ==", ""].concat(rank.map((p, i) => `${i + 1}. ${who[p].padEnd(12)}${score[p]} FRAGS`), "", "GG. SAME TIME NEXT WEEK?");
    }
    const grid = ARENA.map(r => [...r]);
    const pos = p => [Math.round(16.5 + 15 * Math.sin(t * .19 + p * 2.1)), Math.round(3 + 3 * Math.sin(t * .31 + p * 1.3))];
    [0, 1, 2].forEach(p => { const [x, y] = pos(p); grid[y][x] = String(p + 1); });
    done.filter(([s]) => t - s < 3).forEach(([, , v]) => { const [x, y] = pos(v); grid[y][x] = "*"; });
    return [who.map((w, p) => `${p + 1}:${w} ${score[p]}`).join("  "), "+" + "-".repeat(34) + "+"]
      .concat(grid.map(r => "|" + r.join("") + "|"), "+" + "-".repeat(34) + "+",
        done.slice(-2).map(([, k, v]) => `> ${who[k]} FRAGGED ${who[v]}`));
  },
};

const LIBRETTO = ["FIGARO! FIGARO! FIGARO!", "LA DONNA E MOBILE", "QUAL PIUMA AL VENTO", "O SOLE... SYNTAX ERROR", "NESSUN DORMA (EXCEPT IBM)",
  "TOREADOR, EN GARDE", "AAAAAAAAAAAAAAAAAAH", "*** END OF ACT I ***"];
const ARENA = ["      ##                ##        ", "                                  ", "            ####                  ",
  "   ##                      ##     ", "                  ####            ", "                                  ", "      ##                ##        "];
const FRAGS = [[24, 0, 1], [34, 2, 0], [42, 1, 2], [50, 0, 2], [58, 1, 0], [66, 0, 1], [74, 2, 1], [82, 0, 2], [90, 1, 2]];   // [step, killer, victim]

const EMPTY = ["A:\\> DIR", "", " NO BONUS DISKS FOUND YET.", "", " SOME TRIOS OF PARTS UNLOCK A DISK.", " TRY PARTS THAT BELONG TOGETHER."];

function frame(c, k) {
  let out;
  if (!c) out = EMPTY.slice();
  else if (k < INTRO) out = ["C:\\> A:", "A:\\> BONUS.EXE", "", `LOADING ${c.name}...`, `[${meter(k / (INTRO - 2), 24)}]`];
  else {
    out = SCENES[c.id](k - INTRO, c);
    if (k >= LEN - 16) out.push("", `*** BONUS DISK: ${c.name} ***`);
  }
  out = out.slice(-ROWS);
  out[out.length - 1] += k % 8 < 4 ? "_" : " ";   // cursor blinks on the beat
  return out.join("\n");
}

// ---------- overlay ----------

const disk = (c, big) => `<svg class="disk" viewBox="0 0 40 40" aria-hidden="true"${c ? ` style="--dc:${c.color}"` : ""}>` +
  `<path class="dk" d="M3 2.5 H33 L37.5 7 V37.5 H3 Z"/><rect class="dk-sh" x="11" y="2.5" width="17" height="12" rx="1"/><rect class="dk-win" x="21" y="4.5" width="4" height="8"/>` +
  `<rect class="dk-lb" x="7" y="19" width="26" height="16" rx="1.5"/>` +
  (!c ? `<text class="dk-q" x="20" y="32">?</text>` : big ? `<path class="dk-ln" d="M10 25 H30 M10 30 H24"/>` : "") + `</svg>`;

const BAY = `<svg class="bay" viewBox="0 0 64 20" aria-hidden="true"><rect class="by" x="1" y="1" width="62" height="18" rx="2"/>` +
  `<rect class="by-slot" x="8" y="5" width="38" height="3" rx="1"/><rect class="by-btn" x="49" y="12" width="9" height="4" rx="1"/><circle class="by-led" cx="53.5" cy="6.5" r="1.7"/></svg>`;

export function initBonus(stage, disksBtn) {
  btn = disksBtn;
  root = document.createElement("div");
  root.className = "bonus"; root.hidden = true;
  root.setAttribute("role", "dialog"); root.setAttribute("aria-labelledby", "bn-title");
  root.innerHTML = `<div class="bn-panel">
      <div class="bn-head"><div class="bn-drive" aria-hidden="true"></div>
        <div aria-live="polite"><p class="bn-kick"></p><h2 class="bn-title" id="bn-title"></h2></div>
        <button type="button" class="btn bn-x" aria-label="Close bonus screen">✕</button></div>
      <div class="bn-screen"><pre class="bn-tty" aria-hidden="true"></pre><div class="scan"></div></div>
      <div class="bn-desk"><div class="bn-band"></div>
        <div class="bn-foot"><span class="bn-count"></span><div class="bn-disks"></div><span class="bn-hint">CLICK OR ESC TO CLOSE</span></div></div>
      <div class="bn-prog"><i></i></div>
    </div>`;
  stage.appendChild(root);
  const q = s => root.querySelector(s);
  els = { panel: q(".bn-panel"), drive: q(".bn-drive"), kick: q(".bn-kick"), title: q(".bn-title"), x: q(".bn-x"), tty: q(".bn-tty"),
    band: q(".bn-band"), count: q(".bn-count"), disks: q(".bn-disks"), prog: q(".bn-prog i") };

  // Any click closes the screen, except on a found disk, which replays it.
  root.addEventListener("click", e => {
    const d = e.target.closest("button.bn-d");
    if (!d) { close(); return; }
    open(COMBOS.find(c => c.id === d.dataset.id), false);
    els.disks.querySelector(".cur").focus();
  });
  addEventListener("keydown", e => { if (e.key === "Escape" && cur) { e.preventDefault(); close(); } });

  btn.addEventListener("click", () => {
    const last = [...unlocked].pop();
    open(COMBOS.find(c => c.id === last) || null, false);
    els.x.focus();
  });

  on("bonus", () => { open(bonus.scene.c, true, bonus.scene.fresh); showCount(); });
  on("slots", markBand);
  on("tempo", setTempo);
  onHit((id, kinds, dur) => {
    const svg = cur && els.band.querySelector(`[data-id="${id}"] svg`);
    if (svg) animateHit(svg, byId[id], kinds, dur);
  });
  setTempo();
  showCount();
}

function showCount() {
  btn.querySelector("span").textContent = `${unlocked.size}/${COMBOS.length}`;
  btn.setAttribute("aria-label", `Bonus disks, ${unlocked.size} of ${COMBOS.length} found`);
}

function setTempo() {
  root.style.setProperty("--bar", (16 * SPB).toFixed(3) + "s");
}

// Lights up the trio's copies whose part is audibly on stage, so they spin and glow along with it.
function markBand() {
  els.band.querySelectorAll(".bn-part").forEach(el => el.classList.toggle("on", slots.some(s => s.id === el.dataset.id && s.audible)));
}

function open(c, live, fresh) {
  cur = { c, k: 0, live, t: performance.now() };
  root.hidden = false;
  root.style.setProperty("--dc", c ? c.color : "var(--phos)");
  els.kick.textContent = !c ? `${unlocked.size} / ${COMBOS.length} FOUND` : !live ? "BONUS DISK REPLAY" : fresh ? "NEW BONUS DISK FOUND!" : "BONUS DISK FOUND";
  els.title.textContent = c ? c.name : "BONUS DISKS";
  els.drive.innerHTML = `<div class="bn-pop">${disk(c, true)}</div>${BAY}`;   // fresh nodes restart the eject animation
  els.band.innerHTML = c ? c.parts.map(id => { const p = byId[id];
    return `<div class="bn-part" data-id="${id}" style="--cat:${CATS[p.cat].color}">${artSvg(p)}<div class="tag"><span>${p.name}</span></div></div>`; }).join("") : "";
  markBand();
  els.count.textContent = `${unlocked.size} / ${COMBOS.length} BONUS DISKS FOUND`;
  els.disks.innerHTML = COMBOS.map(d => unlocked.has(d.id)
    ? `<button type="button" class="bn-d${d === c ? " cur" : ""}" data-id="${d.id}" title="${d.name}" aria-label="Replay ${d.name}">${disk(d)}</button>`
    : `<span class="bn-d locked" role="img" title="LOCKED" aria-label="Locked disk">${disk(null)}</span>`).join("");
  root.classList.toggle("empty", !c);
  ttyCache = "";
  updateBonus();
  if (!reduceMotion) els.panel.animate([{ transform: "scale(.94)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 260, easing: "cubic-bezier(.2,.8,.3,1.2)" });
}

function close() {
  if (!cur) return;
  const hadFocus = root.contains(document.activeElement);
  cur = null; root.hidden = true;
  if (hadFocus) btn.focus();
}

// Called on every audible step: the scene follows the music.
export function bonusStep() {
  if (cur) cur.k++;
}

// Per-frame. While the music is paused a live scene holds still; a replay keeps going on the wall clock.
export function updateBonus() {
  if (!cur) return;
  const now = performance.now();
  if (!state.running && !cur.live) cur.k += (now - cur.t) / 1000 / SPB;
  cur.t = now;
  if (cur.c && (cur.k >= LEN || (cur.live && !trioOn(cur.c)))) { close(); return; }
  root.classList.toggle("paused", cur.live && !state.running);
  const k = Math.floor(cur.k), txt = frame(cur.c, reduceMotion ? k - k % 4 : k);
  if (txt !== ttyCache) { ttyCache = txt; els.tty.textContent = txt; }
  els.prog.style.width = (cur.c ? Math.min(1, cur.k / LEN) * 100 : 0).toFixed(1) + "%";
}
