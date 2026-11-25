// shots.js — deterministic scenes for screenshots: ?shot=start|play|end&seed=1.
// Each scene sets the state up once and freezes the clock, so every render
// of the same shot looks the same.

import { createGameState } from './state.js';
import { starsForScore } from './data.js';

function basePlayingState(seed) {
  const state = createGameState();
  state.seed = seed;
  state.mode = 'playing';
  return state;
}

function applyStartShot(state) {
  // Title screen over a busy kitchen: three tickets, a dish mid-assembly,
  // chicken sizzling on the stove, a full day on the clock.
  state.orders = [
    { id: 1, recipeId: 'nasi-ayam', patience: 30, maxPatience: 38 },
    { id: 2, recipeId: 'telur-sayur', patience: 22, maxPatience: 38 },
    { id: 3, recipeId: 'nasi-telur', patience: 12, maxPatience: 38 },
  ];
  state.nextOrderId = 4;
  state.plate = ['nasi', 'ayam'];
  state.burners = [
    { ingredientId: 'ayam', cooked: 2.8, waiting: 0, state: 'cooking' },
    null,
  ];
  state.board = { ingredientId: 'sayur', chopsDone: 1, chopsTotal: 3 };
  state.timeLeft = 150;
  state.score = 0;
  state.coins = 0;
}

function applyPlayShot(state) {
  // Mid-rush: one ticket nearly out of patience, the plate two thirds of a
  // Nasi Ayam Geprek, an egg on the stove, sayur half-chopped, combo alive.
  state.orders = [
    { id: 4, recipeId: 'nasi-ayam', patience: 9, maxPatience: 38 },
    { id: 5, recipeId: 'ayam-sayur', patience: 24, maxPatience: 38 },
    { id: 6, recipeId: 'sayur-sambal', patience: 33, maxPatience: 38 },
  ];
  state.nextOrderId = 7;
  state.plate = ['nasi', 'ayam'];
  state.burners = [
    { ingredientId: 'telur', cooked: 1.1, waiting: 0, state: 'cooking' },
    null,
  ];
  state.board = { ingredientId: 'sayur', chopsDone: 2, chopsTotal: 3 };
  state.timeLeft = 107;
  state.elapsed = 43;
  state.score = 320;
  state.coins = 230;
  state.served = 3;
  state.combo = 2;
  state.comboTimer = 5.5;
  state.bestCombo = 2;
}

function applyEndShot(state) {
  // End of day: results panel over the kitchen, a finished Komplit on the
  // plate, ready to serve as the day's last dish.
  state.mode = 'dayover';
  state.orders = [
    { id: 8, recipeId: 'komplit', patience: 26, maxPatience: 38 },
  ];
  state.plate = ['nasi', 'ayam', 'telur', 'sambal', 'kerupuk'];
  state.timeLeft = 0;
  state.elapsed = 150;
  state.score = 1240;
  state.coins = 860;
  state.served = 9;
  state.bestCombo = 3;
  state.stars = starsForScore(state.score, state.served);
}

export function applyShot(state, shotName) {
  if (shotName === 'start') applyStartShot(state);
  else if (shotName === 'play') applyPlayShot(state);
  else if (shotName === 'end') applyEndShot(state);
  return state;
}

// Build the state a shot renders from, given the query's shot name and seed.
export function stateForShot(shotName, seed) {
  const state = basePlayingState(seed);
  if (shotName === 'start') state.mode = 'title';
  return applyShot(state, shotName);
}
