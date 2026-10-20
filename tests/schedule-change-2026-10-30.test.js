import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Oct 30 Las Palmas games are cancelled", () => {
  assert.deepEqual(
    games.filter(
      (game) => game.date === "2026-10-30" && game.location === "Las Palmas"
    ),
    []
  );
  assert.equal(
    games.some((game) =>
      [
        "d66-2026-10-30-02",
        "optional-friday-seniors-2026-10-30",
      ].includes(game.id)
    ),
    false
  );
  assert.equal(
    gameRevisions["optional-friday-seniors-2026-10-30"],
    undefined
  );
});
