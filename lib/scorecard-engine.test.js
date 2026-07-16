import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizePlayerNames,
  parseScore,
  columnTotals,
  cumulativeTotalsByRound,
  leaderIndices,
  applyPlayerEdit,
  emptyRound,
  restartGame,
  endGameFresh,
  MIN_PLAYERS,
  MAX_PLAYERS,
} from "./scorecard-engine.js";

test("normalizePlayerNames accepts 1–6 trimmed names", () => {
  assert.deepEqual(normalizePlayerNames([" Alice ", "Bob"]), {
    ok: true,
    names: ["Alice", "Bob"],
  });
  assert.equal(normalizePlayerNames(["Solo"]).ok, true);
  assert.equal(
    normalizePlayerNames(["a", "b", "c", "d", "e", "f"]).ok,
    true
  );
});

test("normalizePlayerNames rejects blanks and out of range", () => {
  assert.equal(normalizePlayerNames([""]).ok, false);
  assert.equal(normalizePlayerNames(["A", ""]).ok, false);
  assert.equal(normalizePlayerNames([]).ok, false);
  assert.equal(
    normalizePlayerNames(["a", "b", "c", "d", "e", "f", "g"]).ok,
    false
  );
  assert.equal(MIN_PLAYERS, 1);
  assert.equal(MAX_PLAYERS, 6);
});

test("parseScore treats blank as 0 and rejects NaN", () => {
  assert.equal(parseScore(""), 0);
  assert.equal(parseScore("  "), 0);
  assert.equal(parseScore(null), 0);
  assert.equal(parseScore("12"), 12);
  assert.equal(parseScore("-3"), -3);
  assert.equal(parseScore("2.5"), 2.5);
  assert.equal(parseScore("abc"), null);
});

test("columnTotals sums each player including edits", () => {
  const rounds = [
    ["10", "5", ""],
    ["3", "7", "2"],
    ["1", "", "4"],
  ];
  assert.deepEqual(columnTotals(rounds, 3), [14, 12, 6]);
});

test("cumulativeTotalsByRound tracks who led after each round", () => {
  const rounds = [
    ["10", "5", "8"],
    ["3", "7", "2"],
  ];
  assert.deepEqual(cumulativeTotalsByRound(rounds, 3), [
    [10, 5, 8],
    [13, 12, 10],
  ]);
});

test("leaderIndices highlights ties for first", () => {
  assert.deepEqual(leaderIndices([10, 5, 10]), [0, 2]);
  assert.deepEqual(leaderIndices([1, 9, 3]), [1]);
});

test("applyPlayerEdit renames, removes, and adds columns", () => {
  const rounds = [
    ["1", "2", "3"],
    ["4", "5", "6"],
  ];
  const result = applyPlayerEdit(rounds, [
    { name: "Ann", fromIndex: 0 },
    { name: "Cara", fromIndex: 2 },
    { name: "Dee", fromIndex: null },
  ]);
  assert.deepEqual(result.players, ["Ann", "Cara", "Dee"]);
  assert.deepEqual(result.rounds, [
    ["1", "3", ""],
    ["4", "6", ""],
  ]);
});

test("applyPlayerEdit reorders columns with scores", () => {
  const rounds = [
    ["1", "2", "3"],
    ["4", "5", "6"],
  ];
  const result = applyPlayerEdit(rounds, [
    { name: "C", fromIndex: 2 },
    { name: "A", fromIndex: 0 },
    { name: "B", fromIndex: 1 },
  ]);
  assert.deepEqual(result.players, ["C", "A", "B"]);
  assert.deepEqual(result.rounds, [
    ["3", "1", "2"],
    ["6", "4", "5"],
  ]);
});

test("emptyRound / restart / end helpers", () => {
  assert.deepEqual(emptyRound(3), ["", "", ""]);
  const restarted = restartGame(["Ann", "Ben"]);
  assert.equal(restarted.view, "game");
  assert.deepEqual(restarted.players, ["Ann", "Ben"]);
  assert.deepEqual(restarted.rounds, [["", ""]]);
  const ended = endGameFresh();
  assert.equal(ended.view, "setup");
  assert.deepEqual(ended.players, ["Player 1", "Player 2"]);
  assert.deepEqual(ended.rounds, []);
});
