import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Nov 10 Heavy Hitters vs. Thunderbolts game is scheduled on West Field", () => {
  const game = games.find((entry) => entry.id === "d66-2026-11-10-02");

  assert.deepEqual(
    {
      date: game.date,
      day: game.day,
      start: game.start,
      end: game.end,
      division: game.division,
      away: game.away,
      home: game.home,
      location: game.location,
      field: game.field,
      notes: game.notes,
    },
    {
      date: "2026-11-10",
      day: "Tuesday",
      start: "5:30 PM",
      end: "7:00 PM",
      division: "Baseball - Minors B",
      away: "LP Heavy Hitters - Covarrubias",
      home: "LP Thunderbolts - Silva/Dager",
      location: "Las Palmas",
      field: "West Field",
      notes: "During Thunderbolts regular practice",
    }
  );
  assert.equal(gameRevisions["d66-2026-11-10-02"], "2026-11-10T00:24:28Z");
});
