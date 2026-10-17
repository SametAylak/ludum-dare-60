import test from "node:test";
import assert from "node:assert/strict";
import { COMBOS } from "../js/bonus/combos.js";
import { CHORDS } from "../js/music.js";
import { guestNote, sectionAt, SHOW_STEPS } from "../js/bonus/score.js";

test("two drops have a short gap and a breakdown before them", () => {
  assert.equal(sectionAt(29).id, "build");
  assert.equal(sectionAt(30).id, "breath");
  assert.equal(sectionAt(31).id, "breath");
  assert.equal(sectionAt(32).id, "drop");
  assert.equal(sectionAt(96).id, "break");
  assert.equal(sectionAt(108).id, "lift");
  assert.equal(sectionAt(112).id, "peak");
  assert.equal(sectionAt(160).id, "outro");
});

for (const combo of COMBOS) {
  test(`${combo.id}: both guests introduce themselves and take turns leading`, () => {
    for (const side of [0, 1]) {
      assert.ok(guestNote(combo, side, 4 + side * 8, 4 + side * 8));
      const foreground = [], answer = [];
      for (let p = 32; p < 96; p++) {
        const note = guestNote(combo, side, p, (p + 16) % 64);
        if (!note) continue;
        ((p % 16 < 8) === (side === 0) ? foreground : answer).push(note);
        const chord = CHORDS[((p + 16) % 64) >> 4];
        assert.ok(chord.n.some(n => (note.midi - n) % 12 === 0));
        assert.ok(note.length > 0);
      }
      assert.ok(foreground.length >= 12);
      assert.ok(answer.length >= 4);
      assert.ok(foreground.every(n => n.velocity > answer[0].velocity));
    }
  });

  test(`${combo.id}: rests leave space for the drop and the second drop adds harmony`, () => {
    for (const side of [0, 1]) {
      for (const p of [30, 31, 108, 109, 110, 111, 160, SHOW_STEPS - 1])
        assert.equal(guestNote(combo, side, p, p % 64), null);
      assert.equal(guestNote(combo, side, 32 + side * 8, (32 + side * 8) % 64).harmony, null);
      assert.notEqual(guestNote(combo, side, 112 + side * 8, (112 + side * 8) % 64).harmony, null);
    }
  });
}
