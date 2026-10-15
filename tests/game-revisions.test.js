import assert from "node:assert/strict";
import test from "node:test";
import { getLatestGameRevision } from "../src/utils/gameRevisions.js";

test("returns the latest timestamp regardless of object order", () => {
  assert.equal(
    getLatestGameRevision({
      older: "2026-10-01T12:00:00-07:00",
      latest: "2026-10-14T13:03:00-07:00",
      middle: "2026-10-10T19:10:35-07:00",
    }),
    "2026-10-14T13:03:00-07:00"
  );
});

test("returns null when there are no valid timestamps", () => {
  assert.equal(
    getLatestGameRevision({ invalid: "not a timestamp", missing: null }),
    null
  );
});
