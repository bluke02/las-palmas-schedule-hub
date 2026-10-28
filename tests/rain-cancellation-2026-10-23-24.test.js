import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

const cancellationDates = new Set(["2026-10-23", "2026-10-24"]);
const cancelledLocations = new Set([
  "Las Palmas",
  "Encanto",
  "Southcrest",
  "South Bay",
]);

test("games at rain-cancelled locations remain with cancelled status for Oct 23–24", () => {
  const cancelledGames = games.filter(
    (game) =>
      cancellationDates.has(game.date) && cancelledLocations.has(game.location)
  );

  assert.ok(cancelledGames.length > 0);
  assert.ok(cancelledGames.every((game) => game.status === "cancelled"));
});

test("preserved cancelled games retain revision timestamps", () => {
  for (const gameId of [
    "tee-ball-17",
    "tee-ball-18",
    "d66-2026-10-24-06",
    "sb-2026-10-24-07",
  ]) {
    assert.ok(gameRevisions[gameId], gameId);
  }
});

test("games at SDA remain on the schedule", () => {
  assert.ok(games.some((game) => game.location === "SDA"));
});
