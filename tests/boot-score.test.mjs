import test from "node:test";
import assert from "node:assert/strict";
import { eventsAt } from "../js/bonus/boot/patterns.js";
import { guestNotes, sectionAt, TIMING } from "../js/bonus/boot/score.js";

test("sections cover the show with a breath before each drop", () => {
  assert.equal(TIMING.show, TIMING.intro + TIMING.music + TIMING.outro);
  assert.equal(sectionAt(63).id, "breath");
  assert.equal(sectionAt(64).id, "drop");
  assert.equal(sectionAt(223).id, "breath");
  assert.equal(sectionAt(224).id, "peak");
  assert.equal(sectionAt(TIMING.intro + TIMING.music).id, "outro");
});

test("every sung note carries a word", () => {
  for (let step = 0; step < 64; step++) for (const variation of [0, 1])
    for (const event of eventsAt(step, variation).filter(event => event.layer === "answer")) assert.ok(event.word, `step ${step}`);
});

test("the guests stay in A minor and the robot waits for the second half of the drop", () => {
  const scale = [0, 2, 4, 5, 7, 9, 11], heard = new Set();
  for (let position = 0; position < TIMING.show; position++) for (const note of guestNotes(position, position + 32)) {
    for (const midi of [note.midi, ...note.choir || []]) assert.ok(scale.includes(midi % 12), `${midi} at ${position}`);
    heard.add(`${position < 96 ? "early" : sectionAt(position).id}:${note.role}`);
  }
  assert.ok(heard.has("early:answer") && heard.has("drop:answer") && heard.has("peak:riff") && heard.has("peak:answer"));
  for (let position = 16; position < 96; position++)
    assert.ok(!guestNotes(position, position).some(note => note.role === "answer"), `robot at ${position}`);
});
