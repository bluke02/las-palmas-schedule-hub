import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Oct 31 Coyotes vs Little Rascals game is rescheduled to 12:30 PM", () => {
  const game = games.find((entry) => entry.id === "tee-ball-20");

  assert.deepEqual(
    {
      date: game.date,
      day: game.day,
      start: game.start,
      end: game.end,
      away: game.away,
      home: game.home,
    },
    {
      date: "2026-10-31",
      day: "Saturday",
      start: "12:30 PM",
      end: "1:30 PM",
      away: "LP Los Coyotes - Silva/Luke",
      home: "LP Little Rascals - Valadez",
    }
  );
  assert.equal(gameRevisions[game.id], "2026-10-29T23:56:54Z");
});
