import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);

test("South Crest Majors schedule updates and Oct 24 game cancellation", () => {
  const updatedMatchups = {
    "d66-2026-11-07-07": ["TH Majors", "LP Coyotes - Rodriguez"],
    "d66-2026-11-14-05": ["LP Dirtbags - Ybarra", "LP Coyotes - Rodriguez"],
    "d66-2026-11-21-06": ["SDA Majors", "LP Dirtbags - Ybarra"],
  };

  for (const [gameId, [away, home]] of Object.entries(updatedMatchups)) {
    const game = games.find((entry) => entry.id === gameId);

    assert.ok(game, `Expected game ${gameId} to exist`);
    assert.deepEqual([game.away, game.home], [away, home]);
  }

  assert.equal(
    games.some((game) => game.id === "d66-2026-10-24-06"),
    false
  );

  const affectedMajorsGames = games.filter(
    (game) =>
      game.division === "Baseball - Majors" &&
      game.date >= "2026-10-24" &&
      game.date <= "2026-11-21"
  );

  assert.equal(
    affectedMajorsGames.some(
      (game) => game.away === "SC Majors" || game.home === "SC Majors"
    ),
    false
  );
  assert.equal(affectedMajorsGames.some((game) => game.bye), false);
});
