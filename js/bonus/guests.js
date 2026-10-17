const names = {
  telegraph: "ALIEN TELEGRAPH", gramophone: "LUNAR GRAMOPHONE",
  radio: "ORBITAL RADIO", reel: "REEL TIME TRAVELER",
};
export const guestName = id => names[id];

const eyes = (x, y) => `<g fill="#1c1732" stroke="none"><ellipse cx="${x - 13}" cy="${y}" rx="9" ry="12" transform="rotate(-20 ${x - 13} ${y})"/><ellipse cx="${x + 13}" cy="${y}" rx="9" ry="12" transform="rotate(20 ${x + 13} ${y})"/><circle fill="#fff" cx="${x - 15}" cy="${y - 4}" r="2.5"/><circle fill="#fff" cx="${x + 11}" cy="${y - 4}" r="2.5"/></g>`;
const bolts = [47, 193].map(x => `<circle cx="${x}" cy="188" r="4" fill="#f4dba4"/><path d="M${x - 2} 188h4"/>`).join("");
const feet = `<g fill="#40354e"><path d="M78 199v18h-18q-10 0-10 11h43v-29z"/><path d="M147 199v18h18q10 0 10 11h-43v-29z"/></g>`;
const eq = Array.from({ length: 9 }, (_, i) => `<rect class="guest-eq" x="${68 + i * 12}" y="184" width="6" height="12" rx="2" style="--eq:${i}"/>`).join("");
const art = {
  telegraph: () => `
    <path fill="none" stroke="#a28ecb" stroke-width="5" d="M38 183C4 180 8 147 29 146M200 183c38 0 32-55 15-59"/>
    <g class="guest-dance">
      <path fill="#617242" d="M112 130l-17 35h59l-17-35"/>
      <path fill="#b5e477" d="M79 74q-13-49 32-52h20q48 4 32 52l-11 35q-7 24-32 29-26-5-33-29z"/>
      <path fill="none" stroke="#b5e477" stroke-width="6" d="M98 31L83 14m59 17 15-17"/>
      <g fill="#e4ffad"><circle class="guest-led" cx="81" cy="12" r="6"/><circle class="guest-led" cx="159" cy="12" r="6"/></g>
      <path fill="#dcf6a3" stroke="none" d="M91 50q27-19 58 0-26-7-58 9z"/>
      ${eyes(120, 75)}<path d="M111 109q9 7 18 0" fill="none"/>
      <path d="M88 121q-35 8-35 44" fill="none" stroke="#b5e477" stroke-width="11"/>
      <path class="guest-arm" d="M151 122q29-5 27 38l-24 7" fill="none" stroke="#b5e477" stroke-width="11"/>
      <path d="M73 63q-17-1-17 18v17h17zm94 0q17-1 17 18v17h-17z" fill="#887398"/>
      <path d="M62 70q-2-53 58-53t58 53" stroke="#40354e" stroke-width="8" fill="none"/>
    </g>
    ${feet}<rect x="30" y="170" width="180" height="37" rx="10" fill="#875840"/>
    <rect x="30" y="167" width="180" height="14" rx="6" fill="#dfb679"/>
    <path fill="#b78c51" d="M64 164v-17h25v17m35 0v-23h18v23"/>
    <g class="telegraph-key"><path stroke="#f3d99b" stroke-width="7" d="M80 145l72 10"/><ellipse cx="155" cy="151" rx="17" ry="7" fill="#49394d"/></g>
    <path d="M48 158v-26m-6 4h12m-12 7h12m-12 7h12" stroke="#e7bb69"/>
    <rect x="81" y="185" width="77" height="15" rx="3" fill="#241c32"/><text x="120" y="196" class="device-type" fill="#caff95" stroke="none">CQ · CQ · CQ</text>${bolts}`,
  gramophone: () => `
    ${feet}<g class="guest-dance">
      <path d="M121 148q38-6 29-49L131 76" fill="none" stroke="#b77948" stroke-width="18"/>
      <path d="M148 111Q111 85 74 88L55 26Q125 24 162 76z" fill="#dba256"/>
      <path d="M148 99Q119 69 70 68" fill="none" stroke="#ffe1a0" stroke-width="5"/>
      <ellipse cx="62" cy="56" rx="33" ry="45" transform="rotate(-24 62 56)" fill="#ffe1a0"/>
      <ellipse cx="62" cy="56" rx="24" ry="35" transform="rotate(-24 62 56)" fill="#85503d"/>
      <ellipse cx="66" cy="60" rx="12" ry="19" transform="rotate(-24 66 60)" fill="#352639"/>
      <g class="guest-notes" fill="var(--party-a)" stroke="none"><path d="M12 74V47l18-5v22h-4V48l-10 3v23z"/><ellipse cx="10" cy="75" rx="7" ry="5"/><ellipse cx="24" cy="65" rx="7" ry="5"/></g>
      <path d="M195 182h17v-23h-9" stroke="#d5af74" stroke-width="7" fill="none"/>
    </g>
    <rect x="35" y="148" width="165" height="60" rx="9" fill="#835047"/>
    <path d="M35 152l22-19h125l18 19z" fill="#c58c63"/>
    <ellipse cx="116" cy="145" rx="56" ry="12" fill="#282035"/><ellipse cx="116" cy="145" rx="40" ry="8" fill="none" stroke="#78637b"/>
    <ellipse cx="116" cy="145" rx="16" ry="5" fill="var(--party-b)"/>
    <path d="M175 134l-14 14h-22" stroke="#f5d596" stroke-width="4" fill="none"/>
    <rect x="48" y="162" width="139" height="35" rx="7" fill="#39293f"/>
    <g fill="#f5cf8c" stroke="none"><ellipse cx="98" cy="175" rx="8" ry="9"/><ellipse cx="139" cy="175" rx="8" ry="9"/></g>
    <path d="M111 186q8 9 16 0" fill="none" stroke="#f5cf8c"/>`,
  radio: () => `
    ${feet}<g class="guest-dance">
      <path d="M165 67l30-51" stroke="#d4d2de" stroke-width="5"/><circle class="guest-led" cx="197" cy="13" r="6" fill="var(--party-a)"/>
      <path d="M77 75V56q0-13 15-13h57q15 0 15 13v19" fill="none" stroke="#a5b6a4" stroke-width="9"/>
      <rect x="30" y="71" width="180" height="135" rx="24" fill="#819c93"/>
      <rect x="39" y="80" width="162" height="116" rx="18" fill="#c9d5b7"/>
      <rect x="51" y="91" width="138" height="39" rx="6" fill="#302b40"/>
      <path d="M61 101h117m-107 0v8m17-8v8m17-8v8m17-8v8m17-8v8m17-8v8m17-8v8" stroke="#d3dfad" stroke-width="2"/>
      <path class="radio-needle" d="M119 95v28" stroke="var(--party-b)" stroke-width="3"/>
      <text x="120" y="121" class="device-type" fill="#dcf2b5" stroke="none">FM 108 · OUTER SPACE</text>
      <circle cx="86" cy="164" r="27" fill="#665c60"/><circle class="guest-speaker" cx="86" cy="164" r="19" fill="#292537"/>
      <path d="M129 151h49m-49 8h49m-49 8h49" stroke="#827e6e" stroke-width="3"/>
      <circle cx="140" cy="184" r="8" fill="#f0d69b"/><circle cx="172" cy="184" r="8" fill="#f0d69b"/>
    </g>`,
  reel: () => `
    ${feet}<g class="guest-dance"><rect x="38" y="52" width="164" height="157" rx="13" fill="#b5b4c6"/>
      <rect x="47" y="62" width="146" height="137" rx="7" fill="#e2dccc"/>
      <path d="M76 100l24 45h41l25-45" fill="none" stroke="#49374b" stroke-width="6"/>
      ${[79, 161].map(x => `<g class="guest-reel" style="transform-origin:${x}px 98px"><circle cx="${x}" cy="98" r="35" fill="#817f95"/><circle cx="${x}" cy="98" r="28" fill="#dad6df"/>${[0, 120, 240].map(a => `<ellipse cx="${x}" cy="81" rx="8" ry="11" fill="#45374b" transform="rotate(${a} ${x} 98)"/>`).join("")}<circle cx="${x}" cy="98" r="6" fill="#f4c98f"/></g>`).join("")}
      <rect x="76" y="148" width="88" height="23" rx="5" fill="#332a40"/><path d="M90 158l6 5 6-5m35 0 6 5 6-5" stroke="var(--party-a)" fill="none"/>
      <rect x="57" y="180" width="127" height="20" rx="4" fill="#332a40"/><g fill="var(--party-a)" stroke="none">${eq}</g>
    </g>`,
};

export function guestSvg(id) {
  return `<div class="guest-orbit"></div><svg viewBox="0 0 240 240" fill="none" stroke="#261e34" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${art[id]()}</svg><div class="guest-label"><span>SPECIAL GUEST</span><b>${names[id]}</b></div>`;
}
