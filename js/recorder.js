// Records the master output with MediaRecorder and saves it as an audio file.
import { audio, ensureAudio } from "./audio/engine.js";
import { recBtn, recTime } from "./dom.js";
import { state } from "./state.js";
import { setRunning } from "./transport.js";

// First format the browser can record wins: Chrome/Firefox take WebM or Ogg Opus, Safari takes MP4/AAC.
const TYPES = [["audio/webm;codecs=opus", "webm"], ["audio/ogg;codecs=opus", "ogg"], ["audio/mp4", "m4a"], ["audio/webm", "webm"]];
export const canRecord = typeof MediaRecorder !== "undefined" && TYPES.some(([t]) => MediaRecorder.isTypeSupported(t));

let rec = null, dest = null, chunks = [];
let elapsed = 0, since = 0;   // recorded ms, not counting pauses
let shown = "";

const ms = () => elapsed + (since ? performance.now() - since : 0);
const fmt = t => { const s = Math.floor(t / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const notify = (text, dur = 3200) => { state.notice = { text, until: performance.now() + dur }; };

export function startRec() {
  if (rec || !canRecord) return;
  ensureAudio();
  if (!dest) { dest = audio.ctx.createMediaStreamDestination(); audio.analyser.connect(dest); }
  const [type, ext] = TYPES.find(([t]) => MediaRecorder.isTypeSupported(t));
  const r = rec = new MediaRecorder(dest.stream, { mimeType: type, audioBitsPerSecond: 192000 });
  chunks = []; elapsed = 0; since = 0;
  r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  r.onstop = () => { if (!r.discard) save(new Blob(chunks, { type: r.mimeType || type }), ext); chunks = []; };
  r.start(1000);
  if (state.running) since = performance.now(); else { r.pause(); setRunning(true); }
  recBtn.classList.add("on"); recBtn.setAttribute("aria-pressed", "true"); recBtn.setAttribute("aria-label", "Stop recording and save");
  notify("Recording the mix. Click REC again to save it");
}
export function stopRec() {
  if (!rec) return;
  const t = ms();
  if (t < 500) { rec.discard = true; notify("Recording was too short to save"); }
  rec.stop(); rec = null; since = 0;
  recBtn.classList.remove("on", "held"); recBtn.setAttribute("aria-pressed", "false"); recBtn.setAttribute("aria-label", "Record the mix");
}
// Called by play/pause so a paused mix doesn't fill the file with silence.
export function syncRec(on) {
  if (!rec) return;
  if (on && rec.state === "paused") { rec.resume(); since = performance.now(); }
  else if (!on && rec.state === "recording") { rec.pause(); elapsed += performance.now() - since; since = 0; }
}
function save(blob, ext) {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  const name = `beigebox-mix-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.${ext}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  notify("Mix saved as " + name, 4200);
}
export function updateRec() {
  const s = rec ? fmt(ms()) : "REC";
  if (s !== shown) { shown = s; recTime.textContent = s; }
  if (rec) recBtn.classList.toggle("held", rec.state === "paused");
}
export const toggleRec = () => rec ? stopRec() : startRec();
export function initRecorder() {
  if (!canRecord) { recBtn.hidden = true; return; }
  recBtn.addEventListener("click", toggleRec);
}
