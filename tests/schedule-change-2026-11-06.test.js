import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Nov 6 seniors game is updated to Sooners at East Field", () => {
  const game = games.find(
    (entry) => entry.id === "optional-friday-seniors-2026-11-06"
  );

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
      date: "2026-11-06",
      day: "Friday",
      start: "7:45 PM",
      end: "9:15 PM",
      division: "Softball - Seniors",
      away: "Sooners",
      home: "LP Fabulosas - Masino",
      location: "Las Palmas",
      field: "East Field",
    }
  );
  assert.equal(gameRevisions[game.id], "2026-10-28T23:28:19Z");
});
