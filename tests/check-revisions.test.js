import assert from "node:assert/strict";
import test from "node:test";
import { findMissingRevisions } from "../scripts/checkRevisions.js";

const f = "src/data/games.json";
const t1 = "2026-10-14T13:03:00-07:00";
const t2 = "2026-10-15T09:00:00-07:00";

test("flags changed or new entries without a new timestamp", () => {
  const base = { [f]: [{ id: "a", start: "1" }, { id: "b", start: "1" }] };
  const head = { [f]: [{ id: "a", start: "2" }, { id: "b", start: "1" }, { id: "c", start: "1" }] };
  assert.deepEqual(findMissingRevisions(base, head, { a: t1 }, { a: t1 }), [`${f}: a`, `${f}: c`]);
});

test("passes when changed entries have updated timestamps", () => {
  const base = { [f]: [{ id: "a", start: "1" }] };
  const head = { [f]: [{ id: "a", start: "2" }, { id: "c", start: "1" }] };
  assert.deepEqual(findMissingRevisions(base, head, { a: t1 }, { a: t2, c: t2 }), []);
});
