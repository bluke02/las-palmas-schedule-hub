import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);

test("Oct 17 and Oct 24 Tee Ball games swap Little Rascals and ChiquiPowers", () => {
  const expectedGames = {
    "tee-ball-13": {
      date: "2026-10-17",
      start: "9:00 AM",
      away: "LP Little Rascals - Valadez",
      home: "LP Pelicans - Michaels/Estavillo",
    },
    "tee-ball-15": {
      date: "2026-10-17",
      start: "11:30 AM",
      away: "LP The Rookies - E Garcia/Sifuentes",
      home: "LP Las ChiquiPowers - Cortez/Trinidad",
    },
    "tee-ball-17": {
      date: "2026-10-24",
      start: "10:15 AM",
      away: "LP The Rookies - E Garcia/Sifuentes",
      home: "LP Little Rascals - Valadez",
    },
    "tee-ball-18": {
      date: "2026-10-24",
      start: "11:30 AM",
      away: "LP - The Little Legends - J Garcia",
      home: "LP Las ChiquiPowers - Cortez/Trinidad",
    },
  };

  for (const [gameId, expected] of Object.entries(expectedGames)) {
    const game = games.find((entry) => entry.id === gameId);

    assert.ok(game, `Expected game ${gameId} to exist`);
    assert.deepEqual(
      {
        date: game.date,
        start: game.start,
        away: game.away,
        home: game.home,
      },
      expected
    );
  }
});
