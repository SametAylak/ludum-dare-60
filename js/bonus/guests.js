// Guest stars: old tech drawn like the band, on legs, with the same eyes, mouths and palette.
import { artSvg, E, L, M } from "../parts/art.js";

const names = {
  telegraph: "TELEGRAPH", gramophone: "GRAMOPHONE",
  radio: "TUBE RADIO", phone: "ROTARY PHONE",
};
export const guestName = id => names[id];

const rad = a => a * Math.PI / 180;
const art = {
  telegraph: () => `<path class="cord" d="M10 112 Q-2 104 4 90"/>
    <rect class="tan2" x="8" y="66" width="104" height="60" rx="8"/><rect class="tan" x="8" y="66" width="104" height="14" rx="6"/>
    <rect class="m" x="14" y="38" width="20" height="30" rx="4"/><rect class="mh" x="17" y="42" width="14" height="6" rx="2"/>
    <rect class="au" x="58" y="54" width="10" height="14" rx="2"/>
    <g class="tkey" style="transform-origin:63px 56px"><rect class="au" x="38" y="51" width="64" height="7" rx="3.5"/><ellipse class="k" cx="100" cy="51" rx="11" ry="6"/></g>
    <circle class="au" cx="18" cy="73" r="3.5"/><circle class="au" cx="102" cy="73" r="3.5"/>
    ${E(60, 98, 26, 8.5)}${M(60, 116, 18, 4.5)}${L(24, 112, 3, "lr")}`,
  radio: () => `<path class="tan2" d="M14 126 V62 Q14 14 60 14 Q106 14 106 62 V126 Z"/>
    <path class="tan" d="M23 120 V64 Q23 24 60 24 Q97 24 97 64 V120 Z"/>
    <path class="bd" d="M33 66 Q33 34 60 34 Q87 34 87 66 Z"/><path class="ln" d="M42 66 V44 M51 66 V37 M60 66 V35 M69 66 V37 M78 66 V44"/>
    ${E(60, 82, 24, 8)}${M(60, 99, 16, 4.5)}
    <rect class="au" x="47" y="106" width="26" height="9" rx="3"/><path class="ln" d="M60 107 V114"/>
    <circle class="k" cx="35" cy="111" r="6"/><circle class="k" cx="85" cy="111" r="6"/>${L(60, 18, 3, "lg")}`,
  gramophone: () => `<path class="au" d="M72 66 L84 60 L56 8 L18 34 Z"/>
    <ellipse class="au" cx="36" cy="21" rx="27" ry="17" transform="rotate(-34 36 21)"/><ellipse class="k" cx="36" cy="21" rx="18" ry="10" transform="rotate(-34 36 21)"/>
    <rect class="tan2" x="16" y="78" width="88" height="48" rx="6"/><rect class="tan" x="12" y="70" width="96" height="11" rx="4"/>
    <ellipse class="k" cx="60" cy="70" rx="36" ry="4"/>
    <path class="handle" d="M104 100 H114 V112"/>
    ${E(60, 98, 26, 8.5)}${M(60, 115, 18, 4.5)}`,
  phone: () => `<path class="cord" d="M96 114 Q110 112 104 98 Q98 86 108 80 Q116 74 108 58"/>
    <path class="r" d="M20 126 L28 72 Q30 62 40 62 H80 Q90 62 92 72 L100 126 Z"/>
    <path class="k" d="M8 50 Q8 34 24 36 H96 Q112 34 112 50 Q112 58 104 58 H92 Q88 48 80 48 H40 Q32 48 28 58 H16 Q8 58 8 50 Z"/>
    <circle class="w" cx="60" cy="96" r="27"/>
    <g class="spin" style="transform-origin:60px 96px">${Array.from({ length: 10 }, (_, i) => rad(i * 30 - 60)).map(a =>
      `<circle class="mh" cx="${(60 + 21 * Math.cos(a)).toFixed(1)}" cy="${(96 + 21 * Math.sin(a)).toFixed(1)}" r="3.2"/>`).join("")}</g>
    ${E(60, 92, 18, 6.5)}${M(60, 107, 12, 4)}`,
};

export function guestSvg(id) {
  return `<div class="guest-orbit"></div><div class="guest-body">${artSvg({ cat: "guest", svg: art[id]() })}<div class="guest-label"><span>SPECIAL GUEST</span><b>${names[id]}</b></div></div>`;
}
