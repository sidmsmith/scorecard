# Scorecard

Mobile-friendly scorekeeper for 1–6 players. Enter names, add round scores in any order, edit any cell by tapping it, and watch column totals update live.

No database or realtime services — state is stored in the browser (`localStorage`).

## Local development

```bash
cd scorecard
npm test
npx vercel dev
```

Open `http://localhost:3000/scorecard` (or open `scorecard.html` directly).

## Deploy

Repo: [https://github.com/sidmsmith/scorecard](https://github.com/sidmsmith/scorecard)

See [DEPLOY.md](DEPLOY.md). Vercel framework preset: **Other**. No environment variables.

## Gameflow

1. Choose 1–6 players, enter names, **Confirm**.
2. Enter scores in any cell / any order. Tap a cell to edit; totals recalculate immediately.
3. Thin rows under each round show **running totals** through that round (leader subtly highlighted).
4. Bottom **Σ** row shows overall totals (current leader highlighted).
5. **Add round** for another row. **Change players** to rename, remove, or add players mid-game.
6. **End game** → final totals.
7. **Restart** clears scores but keeps the same players. **End** returns to name entry.
