import assert from "node:assert/strict";
import test from "node:test";
import games from "../src/data/games.json" with { type: "json" };
import practices from "../src/data/schedule.json" with { type: "json" };
import { getTodayActivities } from "../src/utils/todayActivities.js";

test("October 22 activities remain scheduled with the rain cancellation note", () => {
  const activities = getTodayActivities(
    games,
    practices,
    new Date(2026, 9, 22)
  );

  assert.deepEqual(
    activities.map(({ id }) => id).sort(),
    [
      "lp-heavy-hitters-covarrubias",
      "lp-las-chiquipowers-cortez-trinidad",
      "lp-los-coyotes-silva-luke",
      "lp-red-tails-gomez-coach-machine",
      "lp-red-tails-gomez-player-pitch",
      "trinidad",
    ].sort()
  );
  assert.ok(
    activities.every((activity) => activity.notes === "Canceled Due to Rain")
  );
});
