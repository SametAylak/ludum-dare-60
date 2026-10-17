// The faint waveform of the master output behind the stage.
import { audio } from "../audio/engine.js";
import { state } from "../state.js";
import { $ } from "../util.js";

const scope = $("#scope");
const sg = scope.getContext("2d");
let scopeBuf = null;
function sizeScope() {
  const r = scope.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  scope.width = Math.max(1, Math.round(r.width * dpr)); scope.height = Math.max(1, Math.round(r.height * dpr));
}
export function drawScope() {
  const w = scope.width, hgt = scope.height, dpr = Math.min(2, devicePixelRatio || 1);
  // fade the previous frames out to leave a soft trail on the transparent backdrop
  sg.globalCompositeOperation = "destination-out";
  sg.fillStyle = "rgba(0,0,0,0.3)";
  sg.fillRect(0, 0, w, hgt);
  sg.globalCompositeOperation = "source-over";
  const y0 = hgt * .55, amp = hgt * .35;
  sg.lineWidth = 3 * dpr; sg.strokeStyle = "rgba(200,205,255,0.22)"; sg.shadowColor = "rgba(160,170,255,0.6)"; sg.shadowBlur = 14 * dpr;
  sg.beginPath();
  if (audio.analyser && state.running) {
    if (!scopeBuf) scopeBuf = new Float32Array(audio.analyser.fftSize);
    audio.analyser.getFloatTimeDomainData(scopeBuf);
    let st = 1;
    while (st < scopeBuf.length / 2 && !(scopeBuf[st - 1] < 0 && scopeBuf[st] >= 0)) st++;
    const N = scopeBuf.length / 2;
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1) * w, y = y0 - scopeBuf[st + i] * amp;
      i ? sg.lineTo(x, y) : sg.moveTo(x, y);
    }
  } else { sg.moveTo(0, y0); sg.lineTo(w, y0); }
  sg.stroke();
  sg.shadowBlur = 0;
}
export function initScope() {
  new ResizeObserver(sizeScope).observe(scope);
}
