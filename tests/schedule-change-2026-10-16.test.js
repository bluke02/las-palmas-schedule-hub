import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);

test("Oct 16 Minors B away teams are swapped between the two field games", () => {
  const fieldsByGameId = Object.fromEntries(
    games
      .filter((game) =>
        ["d66-2026-10-16-01", "d66-2026-10-16-02"].includes(game.id)
      )
      .map((game) => [game.id, game])
  );

  assert.deepEqual(
    {
      away: fieldsByGameId["d66-2026-10-16-01"].away,
      home: fieldsByGameId["d66-2026-10-16-01"].home,
      field: fieldsByGameId["d66-2026-10-16-01"].field,
      time: [
        fieldsByGameId["d66-2026-10-16-01"].start,
        fieldsByGameId["d66-2026-10-16-01"].end,
      ],
    },
    {
      away: "LP Thunderbolts - Silva/Dager",
      home: "LP Red Tails Minors B - Gomez",
      field: "West Field",
      time: ["6:00 PM", "7:30 PM"],
    }
  );

  assert.deepEqual(
    {
      away: fieldsByGameId["d66-2026-10-16-02"].away,
      home: fieldsByGameId["d66-2026-10-16-02"].home,
      field: fieldsByGameId["d66-2026-10-16-02"].field,
      time: [
        fieldsByGameId["d66-2026-10-16-02"].start,
        fieldsByGameId["d66-2026-10-16-02"].end,
      ],
    },
    {
      away: "LP The Mighty A's - Beltran",
      home: "LP Strikers - Salas",
      field: "East Field",
      time: ["6:00 PM", "7:30 PM"],
    }
  );
});
