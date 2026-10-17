// Bonus monitor scenes: 320x180 phosphor drawings driven by the song position.
import { clock } from "../music.js";

const PH = "#5cf58e";
const BGC = "#06170e";
const frac = x => x - Math.floor(x);
const tri = x => 1 - Math.abs(2 * frac(x) - 1);
const SCENES = {
  cosmic(g, pos, beat) {
    g.fillText("CQ / ANDROMEDA / 1844", 12, 8);
    for (let i = 0; i < 20; i++) g.fillRect((i * 97 + 13) % 320, (i * 59 + 33) % 130 + 25, 2, 2);
    const y = 75 + Math.sin(beat * 2) * 5;
    g.beginPath(); g.ellipse(160, y, 35, 27, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = BGC;
    g.beginPath(); g.ellipse(147, y, 8, 12, -.35, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(173, y, 8, 12, .35, 0, Math.PI * 2); g.fill();
    g.fillRect(154, y + 17, 12, 2); g.fillStyle = PH;
    for (let i = 0; i < 3; i++) {
      const r = 42 + frac(beat / 4 + i / 3) * 65;
      g.globalAlpha = 1 - frac(beat / 4 + i / 3);
      g.beginPath(); g.ellipse(160, y, r, r * .6, 0, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 1;
    g.fillText(pos < 64 ? "... . -. -.. / ..-. ..- -. -.-" : "EARTH, YOU HAVE A GREAT BEAT.", 12, 152);
  },
  boot(g, pos, beat) {
    const mem = Math.min(640, Math.floor(pos * 24));
    g.fillText("BEIGEBOX BIOS v4.51", 12, 8);
    g.fillText(`MEMORY TEST: ${mem}K${mem >= 640 ? " OK" : ""}`, 12, 26);
    const hop = Math.abs(Math.sin(beat * Math.PI)), x = 136, y = 66 - hop * 18;
    g.globalAlpha = .35; g.fillRect(x + 8 + hop * 6, 120, 32 - hop * 12, 3); g.globalAlpha = 1;
    g.fillRect(x, y, 48, 48);
    g.fillStyle = BGC; g.fillRect(x + 12, y, 22, 15); g.fillRect(x + 8, y + 26, 32, 19);
    g.fillStyle = PH; g.fillRect(x + 25, y + 3, 5, 9); g.fillRect(x + 12, y + 31, 24, 2); g.fillRect(x + 12, y + 37, 16, 2);
    const pct = Math.min(100, Math.floor(pos / 112 * 100));
    g.strokeRect(30, 134, 260, 14);
    for (let i = 0; i < Math.floor(pct / 4); i++) g.fillRect(33 + i * 10.2, 137, 8, 8);
    g.fillText(pct < 100 ? `LOADING BEIGE-DOS... ${pct}%` : "BEIGE-DOS READY. C:\\>" + (frac(beat / 2) < .5 ? "_" : ""), 30, 154);
  },
  dial(g, pos, beat) {
    const B = [300, 1200, 2400, 9600, 14400, 28800];
    g.fillText(`ATDT 555-0199   CONNECT ${B[Math.min(5, Math.floor(pos / 6))]}`, 12, 8);
    for (const x of [14, 254]) {
      g.strokeRect(x, 58, 52, 40); g.strokeRect(x + 6, 64, 40, 26); g.fillRect(x + 16, 100, 20, 5); g.fillRect(x + 6, 107, 40, 4);
      if (frac(beat) < .5) g.fillRect(x + 10, 80, 6, 3);
    }
    const amp = 3 + 11 * (1 - frac(beat));
    g.beginPath();
    for (let x = 70; x <= 250; x += 2) {
      const y = 80 + Math.sin(x * .09 - pos * 1.6) * amp * Math.sin((x - 70) / 180 * Math.PI);
      x === 70 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    for (let k = 0; k < 4; k++) {
      const u = frac(pos / 8 + k / 4), back = k % 2;
      g.fillRect((back ? 250 - u * 180 : 70 + u * 180) - 3, back ? 60 : 96, 6, 6);
    }
    const sec = Math.floor(pos * clock.SPB);
    g.fillText(`NIGHT OWL BBS   ONLINE 00:${String(sec).padStart(2, "0")}`, 12, 152);
  },
  main(g, pos) {
    const reel = (cx, a) => {
      g.beginPath(); g.arc(cx, 54, 32, 0, 7); g.stroke();
      g.beginPath(); g.arc(cx, 54, 6, 0, 7); g.fill();
      for (let k = 0; k < 3; k++) { const t = a + k * 2.094; g.beginPath(); g.arc(cx + Math.cos(t) * 19, 54 + Math.sin(t) * 19, 6, 0, 7); g.fill(); }
    };
    reel(108, pos * .5); reel(212, pos * .5 + 1);
    g.beginPath(); g.moveTo(108, 86); g.lineTo(212, 86); g.stroke();
    for (let r = 0; r < 3; r++) for (let i = 0; i < 20; i++) {
      const x = 34 + i * 13, y = 98 + r * 10;
      ((i * 7 + r * 13 + Math.floor(pos) * 5) % 9) < 4 ? g.fillRect(x, y, 7, 6) : g.strokeRect(x + 1, y + 1, 5, 4);
    }
    g.fillText("//JOB042  EXEC PGM=OPERA", 12, 6);
    g.fillText(`CPU ${80 + Math.floor(tri(pos / 7) * 19)}%   CARDS READ ${Math.floor(pos * 15)}`, 12, 152);
  },
  lan(g, pos, beat) {
    g.strokeRect(6, 6, 308, 168);
    for (let y = 10; y < 170; y += 12) g.fillRect(159, y, 2, 6);
    // the ball meets a paddle on every beat
    const bx = 24 + tri(beat / 2) * 272, by = 18 + tri(beat * .37 + .2) * 140, ry = 18 + tri((beat - .12) * .37 + .2) * 140;
    const clampY = y => Math.max(10, Math.min(142, y - 14));
    g.fillRect(14, clampY(by), 6, 28); g.fillRect(300, clampY(ry), 6, 28);
    g.fillRect(bx - 4, by - 4, 8, 8);
    if (frac(beat) < .12) { g.globalAlpha = .3; g.fillRect(bx - 10, by - 10, 20, 20); g.globalAlpha = 1; }
    g.font = "34px VT323, monospace";
    g.fillText(String(Math.floor(beat / 3) % 21), 118, 14); g.fillText(String(Math.floor((beat + 1) / 4) % 21), 184, 14);
  },
};
export function drawScene(g, id, pos) {
  g.shadowBlur = 0; g.fillStyle = BGC; g.fillRect(0, 0, 320, 180);
  g.fillStyle = g.strokeStyle = PH; g.lineWidth = 2; g.font = "18px VT323, monospace"; g.textBaseline = "top";
  g.shadowColor = PH; g.shadowBlur = 6;
  SCENES[id](g, Math.max(0, pos), Math.max(0, pos) / 4);
}
