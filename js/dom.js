// Elements shared by several modules.
import { $ } from "./util.js";

export const app = $(".app");
export const playBtn = $("#play");
export const bpmEl = $("#bpm");
export const bpmIn = $("#bpmIn");
export const barEls = [...document.querySelectorAll("#bars i")];
export const volIn = $("#volIn");
export const muteAll = $("#muteAll");
export const recBtn = $("#rec");
export const recTime = $("#recTime");
