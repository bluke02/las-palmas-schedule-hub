import assert from "node:assert/strict";
import test from "node:test";
import { getTodayActivities } from "../src/utils/todayActivities.js";

test("combines today's games and practices sorted by start time", () => {
  const games = [
    { id: "g1", date: "2026-10-22", start: "6:00 PM" },
    { id: "g2", date: "2026-10-23", start: "5:00 PM" },
    { id: "g3", date: "2026-10-22", start: "BYE", bye: true },
  ];
  const practices = [
    { id: "p1", day: "Thursday", start: "5:30 PM" },
    { id: "p2", day: "Friday", start: "5:30 PM" },
  ];
  const result = getTodayActivities(games, practices, new Date(2026, 9, 22));
  assert.deepEqual(
    result.map((a) => a.id),
    ["p1", "g1", "g3"]
  );
});
