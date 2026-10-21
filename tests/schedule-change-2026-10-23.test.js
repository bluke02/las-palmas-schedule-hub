import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Supreme vs. LP Diamond Girls - Lugo is moved to Oct 23 East Field", () => {
  const game = games.find((entry) => entry.id === "sb-2026-10-24-07");

  assert.ok(game, "Expected the scheduled game to exist");
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
    },
    {
      date: "2026-10-23",
      day: "Friday",
      start: "7:45 PM",
      end: "9:15 PM",
      division: "Softball - Majors",
      away: "Supreme",
      home: "LP Diamond Girls - Lugo",
      location: "Las Palmas",
      field: "East Field",
    }
  );
  assert.equal(gameRevisions[game.id], "2026-10-21T16:47:57Z");
});
