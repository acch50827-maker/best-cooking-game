// state.js — the whole game state: one plain object, created fresh per day.

import { DAY_LENGTH_SECONDS, MAX_HEARTS } from './data.js';

export function createGameState() {
  return {
    mode: 'title', // 'title' | 'playing' | 'paused' | 'dayover'
    day: 1,
    elapsed: 0,
    timeLeft: DAY_LENGTH_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    served: 0,
    servedNames: [],
    hearts: MAX_HEARTS,
    orders: [], // { id, recipeId, patience, maxPatience }
    nextOrderId: 1,
    spawnIn: 1.5, // seconds until the next ticket may appear
    burners: [null, null], // { ingredientId, cooked, state: 'cooking'|'done'|'burnt' }
    board: null, // { ingredientId, chopsDone, chopsTotal }
    plate: [], // ingredient ids, in the order added
    popups: [], // { x, y, text, color, life }
    toast: null, // { text, life }
    shake: 0, // screen shake left (seconds)
    servedFlash: 0, // green flash on the plate after a serve
    muted: false,
    seed: 1,
  };
}

export function resetForNewDay(state) {
  const fresh = createGameState();
  fresh.seed = state.seed;
  fresh.muted = state.muted;
  fresh.mode = 'playing';
  return fresh;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
