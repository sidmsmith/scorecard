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
 * rows × players
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
 * Empty round row for N players.
 * @param {number} playerCount
 * @returns {string[]}
 */
export function emptyRound(playerCount) {
  return Array.from({ length: playerCount }, () => "");
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
