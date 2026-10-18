// Stage costumes: each group dresses as one act, and each part adds its own piece on top.
// Beats are a hip-hop crew, effects a punk band, melody a jazz combo in suits, voices a gospel group in robes,
// and the choir wear robes with gold stoles under halos.

// A gold halo floating above the head, at y.
export const halo = (y, rx = 24) => `<ellipse class="trim" cx="60" cy="${y}" rx="${rx}" ry="6"/>`;
export const bowtie = (x, y, w = 26, h = 13, c = "r") =>
  `<path class="${c}" d="M${x} ${y} Q${x - w * .25} ${y - h * .65} ${x - w / 2} ${y - h / 2} Q${x - w * .42} ${y} ${x - w / 2} ${y + h / 2} Q${x - w * .25} ${y + h * .65} ${x} ${y} Z` +
  ` M${x} ${y} Q${x + w * .25} ${y - h * .65} ${x + w / 2} ${y - h / 2} Q${x + w * .42} ${y} ${x + w / 2} ${y + h / 2} Q${x + w * .25} ${y + h * .65} ${x} ${y} Z"/>` +
  `<rect class="${c}" x="${x - 3.5}" y="${y - 4}" width="7" height="8" rx="2.5"/>`;
// A gold rope chain sagging between two points, with a floppy-disk medallion.
export const chain = (x1, x2, y, sag, r = 7) => {
  const mx = (x1 + x2) / 2, my = y + sag;
  return `<path class="chain-o" d="M${x1} ${y} Q${mx} ${y + sag * 2} ${x2} ${y}"/><path class="chain" d="M${x1} ${y} Q${mx} ${y + sag * 2} ${x2} ${y}"/>` +
    `<circle class="au" cx="${mx}" cy="${my + r * .6}" r="${r}"/><rect class="k ns" x="${mx - r * .45}" y="${my + r * .1}" width="${r * .9}" height="${r * .45}"/>`;
};
export const shades = (x, y, g, w = 24, h = 15) =>
  `<path class="cord" d="M${x - g / 2 + w / 2 - 2} ${y - h * .2} H${x + g / 2 - w / 2 + 2}"/>` +
  [x - g / 2, x + g / 2].map(cx => `<path class="shade" d="M${cx - w / 2} ${y - h / 2} H${cx + w / 2} Q${cx + w / 2} ${y + h / 2} ${cx} ${y + h / 2} Q${cx - w / 2} ${y + h / 2} ${cx - w / 2} ${y - h / 2} Z"/>` +
    `<path class="hl ns" d="M${cx - w / 2 + 4} ${y - h / 2 + 3.5} L${cx - w / 2 + 9} ${y - h / 2 + 3.5}"/>`).join("");

// Legwear, drawn over the bare legs and under the sneakers.
export const WEAR = {
  beat: `<path class="denim" d="M33 112 H59 L58 158 Q46 161 34 158 Z"/><path class="denim" d="M61 112 H87 L86 158 Q74 161 62 158 Z"/>
    <path class="denim2" d="M33.6 150 H58.2 L58 158 Q46 161 34 158 Z"/><path class="denim2" d="M61.8 150 H86.4 L86 158 Q74 161 62 158 Z"/>
    <path class="seam" d="M40 116 L39 148 M80 116 L81 148"/>`,
  fx: `<path class="jeans" d="M40 112 H57 L55 160 H42 Z"/><path class="jeans" d="M63 112 H80 L78 160 H65 Z"/>
    <path class="rip" d="M44 136 Q48.5 133 53 136.5 M45 140 H52 M68 126 Q72 123.5 76 126.5"/>
    <path class="seam" d="M48.5 116 V156 M71.5 116 V156"/>`,
  mel: `<path class="suit" d="M37 112 H58 L57 160 H38 Z"/><path class="suit" d="M62 112 H83 L82 160 H63 Z"/>
    <path class="crease" d="M47.5 118 V158 M72.5 118 V158"/>`,
  voc: `<path class="robe" d="M26 110 H94 L101 163 Q60 170 19 163 Z"/>
    <path class="fold" d="M42 128 L37 164 M78 128 L83 164 M60 132 V167"/>
    <path class="trim" d="M19.8 158.5 Q60 165.5 100.2 158.5"/>`,
  cho: `<path class="robe" d="M26 110 H94 L101 163 Q60 170 19 163 Z"/>
    <path class="fold" d="M60 132 V167"/>
    <path class="stole" d="M38 110 H50 L48 166 H39 Z M70 110 H82 L81 166 H72 Z"/>`,
};
