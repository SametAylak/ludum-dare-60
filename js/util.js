// Small shared helpers.

export const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const $ = (s, r = document) => r.querySelector(s);
export const fillRange = el => el.style.setProperty("--f", (el.value - el.min) / (el.max - el.min) * 100 + "%");
// The arrow that tucks a side panel (LIVE FX, SETS) away; the choice is kept in localStorage.
// On small screens the panels are chips over the stage: tucked unless chosen otherwise, and one open at a time.
export const small = matchMedia("(max-width:900px), (max-height:520px)");
const tucks = [];
export function hider(panel, label, key) {
  const b = document.createElement("button"), list = $(".list", panel);
  b.type = "button"; b.className = "hider";
  b.innerHTML = `<svg viewBox="0 0 10 16" aria-hidden="true"><path d="M7 3 3 8l4 5"/></svg>`;
  const set = h => {
    panel.classList.toggle("hid", h); list.inert = h;
    b.setAttribute("aria-expanded", !h); b.title = `${h ? "Show" : "Hide"} ${label}`; b.setAttribute("aria-label", b.title);
  };
  const keep = h => { set(h); try { localStorage.setItem(key, h ? "1" : "0"); } catch (e) {} };
  tucks.push(keep);
  b.addEventListener("click", () => {
    const h = !panel.classList.contains("hid");
    if (!h && small.matches) tucks.forEach(t => t !== keep && t(true));
    keep(h);
  });
  let v = null; try { v = localStorage.getItem(key); } catch (e) {}
  set(v ? v === "1" : small.matches);
  panel.appendChild(b);
}
