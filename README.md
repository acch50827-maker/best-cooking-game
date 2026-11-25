# best-cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/acch50827-maker/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/acch50827-maker/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Warung Rasa — Dapur Kilat**: run a tiny Indonesian warung kitchen against the clock. Orders land on the order board, ingredients wait on the counter, and every dish is assembled by hand on the plate.

## How it plays

- **Orders arrive on the board** — each ticket names a dish and the exact ingredients it needs, with a patience bar draining away. A ticket that runs out costs a heart.
- **Cook at the stations** — chicken and eggs fry on the two-burner stove (take them off when the ring turns green, or they burn), vegetables need three chops on the board, and rice, sambal and kerupuk go straight to the plate.
- **Assemble and serve** — click the plate to build the dish, then serve it to the matching ticket (or press `S`). Serve dishes back-to-back to build a combo multiplier before the meter drains.
- **One day, 150 seconds** — three hearts, six recipes including the five-ingredient Nasi Komplit Spesial, and a results screen with stars at the end of the day.

Mouse and keyboard: click ingredients and stations, or use keys `1–6` for ingredients, `F` to take food off the stove, `C` to chop, `S` to serve, `T` to clear the plate, `P` to pause, `M` to mute. All art is drawn in code and all sound is synthesized with WebAudio — no files are fetched over the network.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

## Layout

- `game/` — the playable game as static files: `index.html` plus `src/` modules, one clear job per file (`data.js` ingredients and recipes, `orders.js` the ticket board, `kitchen.js` stove/board/plate, `render.js` all canvas drawing, `input.js` mouse and keyboard, `audio.js` synthesized sound, `shots.js` deterministic screenshot scenes, `main.js` boot and loop).
- `main.ts` — copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier`.
- `serve.ts` — a small static server for local play.
- `screenshots/` — real renders of the game's own code: title kitchen, mid-rush plating, and the end-of-day results.

Entered on [make.fun](https://make.fun/?ref=xzdd07z5&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards
