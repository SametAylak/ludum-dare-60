// The SETS panel down the right side of the stage: stored lineups. Tap a set to load it, tap its cassette to store the stage in it.
import { applyGains } from "../mixer.js";
import { byId, CATS } from "../parts/index.js";
import { slots, state } from "../state.js";
import { clearSlot, place } from "./stage.js";
import { $, hider } from "../util.js";

const KEY = "beigebox.sets", N = 6;
let sets = Array(N).fill(null), sig = "", panel;
try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); sets = sets.map((_, i) => Array.isArray(v[i]) ? v[i] : null); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sets)); } catch (e) {} };
const note = text => { state.notice = { text, until: performance.now() + 2000 }; };
const lineup = () => slots.map(s => s.id ? { id: s.id, muted: s.muted } : null);
const same = (a, b) => a.every((d, i) => (d && d.id) === (b[i] && b[i].id) && (!d || !!d.muted === !!b[i].muted));

function store(i) {
  if (!slots.some(s => s.id)) { note("PUT SOME PARTS ON STAGE FIRST"); return; }
  sets[i] = lineup(); save(); render(); note(`STORED IN SET ${i + 1}`);
  const t = panel.querySelectorAll(".tape")[i]; t.classList.remove("rec"); void t.offsetWidth; t.classList.add("rec");
}
function load(i) {
  sets[i].forEach((d, k) => {
    const sl = slots[k], id = d && byId[d.id] ? d.id : null;
    if (sl.id !== id) id ? place(id, k) : clearSlot(sl);
  });
  sets[i].forEach((d, k) => { if (slots[k].id) slots[k].muted = !!(d && d.muted); });
  applyGains(); note(`SET ${i + 1}`);
}
function render() {
  panel.querySelectorAll(".set").forEach((b, i) => {
    const s = sets[i];
    b.classList.toggle("has", !!s);
    $(".dots", b).innerHTML = (s || Array(7).fill(null)).map(d => {
      const p = d && byId[d.id];
      return `<i${p ? ` style="--c:${CATS[p.cat].color}"${d.muted ? ` class="m"` : ""}` : ""}></i>`;
    }).join("");
    b.title = s ? s.filter(d => d && byId[d.id]).map(d => byId[d.id].name).join(", ") : "Empty: tap the cassette to store the stage";
    b.setAttribute("aria-label", `Set ${i + 1}, ${s ? "tap to load" : "empty"}`);
  });
  sig = "";
}
export function initSets() {
  panel = document.createElement("aside");
  panel.className = "setpanel"; panel.setAttribute("aria-label", "Stored sets");
  panel.innerHTML = `<h2>SETS</h2><div class="list"></div>`;
  for (let i = 0; i < N; i++) {
    const w = document.createElement("div");
    w.className = "set-w";
    w.innerHTML = `<button class="set" type="button"><b>${i + 1}</b><span class="dots"></span></button><button class="tape" type="button" aria-label="Store the stage in set ${i + 1}" title="Store the stage here"><svg viewBox="0 0 34 24"><rect class="bd" x="1" y="1" width="32" height="22" rx="3"/><rect class="lb" x="4" y="4" width="26" height="4.5" rx="1"/><rect class="wn" x="7.5" y="9.5" width="19" height="7" rx="3.5"/><g class="rl" style="transform-origin:12px 13px"><circle cx="12" cy="13" r="3.2"/><path d="M12 10.6v4.8M9.9 11.8l4.2 2.4M9.9 14.2l4.2-2.4"/></g><g class="rl" style="transform-origin:22px 13px"><circle cx="22" cy="13" r="3.2"/><path d="M22 10.6v4.8M19.9 11.8l4.2 2.4M19.9 14.2l4.2-2.4"/></g><path class="bt" d="M8 23l2-4.2h14L26 23"/><circle class="sc" cx="4" cy="20" r="1"/><circle class="sc" cx="30" cy="20" r="1"/></svg></button>`;
    $(".set", w).addEventListener("click", () => sets[i] ? load(i) : note("TAP THE CASSETTE TO STORE A SET"));
    $(".tape", w).addEventListener("click", () => store(i));
    $(".list", panel).appendChild(w);
  }
  hider(panel, "sets", "beigebox.hide.sets");
  $(".app").appendChild(panel);
  render();
}
// Light the set that matches what is on stage.
export function updateSets() {
  const l = lineup(), k = JSON.stringify(l);
  if (k === sig) return;
  sig = k;
  panel.querySelectorAll(".set").forEach((b, i) => b.classList.toggle("on", !!sets[i] && same(l, sets[i])));
}
