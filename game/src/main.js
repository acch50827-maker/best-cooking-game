// main.js — boot, game loop, and the day timer for Warung Rasa.

import { createGameState, resetForNewDay } from './state.js';
import { starsForScore } from './data.js';
import { mulberry32 } from './rng.js';
import { tickOrders } from './orders.js';
import { tickKitchen, toast } from './kitchen.js';
import { LAYOUT, renderGame } from './render.js';
import { handleClick, handleKey } from './input.js';
import { stateForShot } from './shots.js';
import { playBuzz, playSizzleStart, playSizzleStop } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number.parseInt(params.get('seed') || '1', 10) || 1;

let state;
let rng;
let frozen = false;

if (shotName) {
  // Screenshot mode: a fixed scene, clock frozen, no ticking.
  state = stateForShot(shotName, seed);
  rng = mulberry32(seed);
  frozen = true;
} else {
  state = createGameState();
  state.seed = seed;
  rng = mulberry32(seed);
  state.orders = [];
}

// Test hook: play-test scripts read the live state through this.
window.__warung = { get state() { return state; }, LAYOUT };

function startGame() {
  state = resetForNewDay(state);
  rng = mulberry32(state.seed + state.day);
  state.orders = [];
  state.spawnIn = 1.0;
}

function restartGame() {
  startGame();
}

function togglePause() {
  if (state.mode === 'playing') state.mode = 'paused';
  else if (state.mode === 'paused') state.mode = 'playing';
}

function endDay() {
  state.mode = 'dayover';
  state.stars = starsForScore(state.score, state.served);
  state.timeLeft = 0;
  playSizzleStop();
}

function tick(dt) {
  if (state.mode !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    endDay();
    return;
  }
  const anyCooking = state.burners.some((b) => b && b.state === 'cooking');
  if (anyCooking) playSizzleStart();
  else playSizzleStop();
  tickKitchen(state, dt);
  tickOrders(state, dt, rng, (order) => {
    playBuzz();
    state.shake = 0.3;
    toast(state, `Pesanan #${order.id} pergi — pelanggan kecewa!`);
    if (state.hearts <= 0) endDay();
  });
}

let lastNow = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  if (!frozen) tick(dt);
  renderGame(ctx, state, now / 1000);
  requestAnimationFrame(frame);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = LAYOUT.width / rect.width;
  const scaleY = LAYOUT.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

canvas.addEventListener('click', (event) => {
  const p = canvasPoint(event);
  handleClick(state, p.x, p.y, startGame, restartGame);
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  handleKey(state, event.key, startGame, restartGame, togglePause);
});

requestAnimationFrame(frame);
