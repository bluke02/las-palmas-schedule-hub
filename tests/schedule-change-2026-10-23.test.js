import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Supreme vs. LP Diamond Girls - Lugo is cancelled on Oct 23", () => {
  const game = games.find((entry) => entry.id === "sb-2026-10-24-07");

  assert.equal(game.date, "2026-10-23");
  assert.equal(game.status, "cancelled");
  assert.match(game.notes, /cancelled/i);
  assert.ok(gameRevisions["sb-2026-10-24-07"]);
});

test("cancelled LP Violent Vipers vs. LP Fabulosas game remains available for tracking", () => {
  assert.equal(
    games.some((game) => game.id === "optional-friday-seniors-2026-10-23"),
    true
  );
});
