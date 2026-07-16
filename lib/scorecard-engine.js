/** Pure scorecard helpers (no DOM). */

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 6;

/**
 * @param {string[]} names
 * @returns {{ ok: true, names: string[] } | { ok: false, error: string }}
 */
export function normalizePlayerNames(names) {
  if (!Array.isArray(names)) {
    return { ok: false, error: "Enter player names." };
  }
  const trimmed = names.map((n) => String(n ?? "").trim());
  if (trimmed.length < MIN_PLAYERS || trimmed.length > MAX_PLAYERS) {
    return { ok: false, error: `Use ${MIN_PLAYERS}–${MAX_PLAYERS} players.` };
  }
  if (trimmed.some((n) => !n)) {
    return { ok: false, error: "Every player needs a name." };
  }
  return { ok: true, names: trimmed };
}

/**
 * Parse a score cell. Blank → 0. Invalid → null.
 * @param {string | number | null | undefined} value
 * @returns {number | null}
 */
export function parseScore(value) {
  if (value === null || value === undefined) return 0;
  const s = String(value).trim();
  if (s === "") return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * @param {(string | number | null | undefined)[][]} rounds
 * @param {number} playerCount
 * @returns {number[]}
 */
export function columnTotals(rounds, playerCount) {
  const totals = Array.from({ length: playerCount }, () => 0);
  for (const row of rounds) {
    for (let i = 0; i < playerCount; i++) {
      const n = parseScore(row?.[i]);
      if (n !== null) totals[i] += n;
    }
  }
  return totals;
}

/**
 * Cumulative totals after each round (index 0 = after round 1).
 * @param {(string | number | null | undefined)[][]} rounds
 * @param {number} playerCount
 * @returns {number[][]}
 */
export function cumulativeTotalsByRound(rounds, playerCount) {
  /** @type {number[][]} */
  const out = [];
  let running = Array.from({ length: playerCount }, () => 0);
  for (const row of rounds) {
    running = running.map((t, i) => {
      const n = parseScore(row?.[i]);
      return t + (n !== null ? n : 0);
    });
    out.push([...running]);
  }
  return out;
}

/**
 * Indices tied for the highest total.
 * @param {number[]} totals
 * @returns {number[]}
 */
export function leaderIndices(totals) {
  if (!totals.length) return [];
  const max = Math.max(...totals);
  return totals
    .map((t, i) => (t === max ? i : -1))
    .filter((i) => i >= 0);
}

/**
 * Empty round row for N players.
 * @param {number} playerCount
 * @returns {string[]}
 */
export function emptyRound(playerCount) {
  return Array.from({ length: playerCount }, () => "");
}

/**
 * Remap score columns after add / remove / rename / reorder.
 * @param {string[][]} rounds
 * @param {{ name: string, fromIndex: number | null }[]} nextPlayers
 * @returns {{ players: string[], rounds: string[][] }}
 */
export function applyPlayerEdit(rounds, nextPlayers) {
  const players = nextPlayers.map((p) => p.name);
  const newRounds = rounds.map((row) =>
    nextPlayers.map((p) =>
      p.fromIndex == null ? "" : String(row[p.fromIndex] ?? "")
    )
  );
  return { players, rounds: newRounds };
}

/**
 * Restart: same players, one empty round.
 * @param {string[]} players
 */
export function restartGame(players) {
  return {
    view: "game",
    players: [...players],
    rounds: [emptyRound(players.length)],
  };
}

/** Full end: back to setup. */
export function endGameFresh() {
  return {
    view: "setup",
    players: ["", ""],
    rounds: [],
  };
}
