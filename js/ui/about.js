// Credits and license dialog behind the header's ⓘ button: the AGPL's legal notices and a link to the source.
import { $ } from "../util.js";

export function initAbout() {
  const dlg = $("#about");
  $("#aboutBtn").addEventListener("click", () => dlg.showModal());
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest(".about-x")) dlg.close(); });
  // While it's open the game's shortcuts stay quiet; Escape still closes it.
  addEventListener("keydown", e => { if (dlg.open && e.key !== "Escape") e.stopImmediatePropagation(); }, true);
}
