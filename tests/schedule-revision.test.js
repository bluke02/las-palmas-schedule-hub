import assert from "node:assert/strict";
import test from "node:test";
import { getLatestScheduleRevision } from "../src/utils/scheduleRevision.js";

test("getLatestScheduleRevision returns the chronologically latest revision", () => {
  assert.equal(
    getLatestScheduleRevision({
      earlier: "2026-10-14T13:03:00-07:00",
      latest: "2026-10-14T20:27:11Z",
      laterTextually: "2026-10-14T19:30:00-07:00",
    }),
    "2026-10-14T19:30:00-07:00"
  );
});

test("getLatestScheduleRevision returns null when no valid revisions exist", () => {
  assert.equal(getLatestScheduleRevision({ invalid: "not a timestamp" }), null);
  assert.equal(getLatestScheduleRevision({}), null);
});
