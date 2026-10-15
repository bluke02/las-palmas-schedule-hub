import assert from "node:assert/strict";
import test from "node:test";
import { validateGameRevisions } from "../scripts/validate-game-revisions.mjs";

const baseGames = [{ id: "game-1", start: "6:00 PM" }];
const baseRevisions = { "game-1": "2026-10-01T12:00:00-07:00" };

test("unchanged games do not need a new timestamp", () => {
  assert.deepEqual(
    validateGameRevisions(baseGames, baseRevisions, baseGames, baseRevisions),
    []
  );
});

test("changed games require a timestamp later than the base timestamp", () => {
  assert.deepEqual(
    validateGameRevisions(
      baseGames,
      baseRevisions,
      [{ id: "game-1", start: "7:00 PM" }],
      baseRevisions
    ),
    [
      'Changed game "game-1" needs a timestamp later than its base-branch timestamp.',
    ]
  );
});

test("changed games pass with a newer ISO 8601 timestamp", () => {
  assert.deepEqual(
    validateGameRevisions(
      baseGames,
      baseRevisions,
      [{ id: "game-1", start: "7:00 PM" }],
      { "game-1": "2026-10-02T12:00:00-07:00" }
    ),
    []
  );
});

test("new games require a valid timestamp", () => {
  assert.deepEqual(
    validateGameRevisions(
      baseGames,
      baseRevisions,
      [...baseGames, { id: "game-2", start: "8:00 PM" }],
      baseRevisions
    ),
    [
      'Changed game "game-2" needs a valid ISO 8601 timestamp in gameRevisions.json.',
    ]
  );
});

test("changed games reject invalid calendar dates in timestamps", () => {
  assert.deepEqual(
    validateGameRevisions(
      baseGames,
      baseRevisions,
      [{ id: "game-1", start: "7:00 PM" }],
      { "game-1": "2026-02-30T12:00:00Z" }
    ),
    [
      'Changed game "game-1" needs a valid ISO 8601 timestamp in gameRevisions.json.',
    ]
  );
});
