// input.js — mouse clicks and keyboard shortcuts, mapped onto kitchen actions.

import { LAYOUT } from './render.js';
import { INGREDIENTS, ingredientById } from './data.js';
import { clickBoard, clickBurner, clickPlateSlot, clearPlate, takeIngredient } from './kitchen.js';
import { findMatchingOrder, serveMatchingOrder } from './orders.js';
import { addPopup, toast } from './kitchen.js';
import { playBuzz, playChop, playClick, playDing, playPlop, resumeAudio } from './audio.js';

function inside(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

function insideCircle(x, y, c) {
  const dx = x - c.x;
  const dy = y - c.y;
  return dx * dx + dy * dy <= c.r * c.r;
}

// Try to serve whatever the plate matches; returns true when a dish went out.
export function tryServe(state) {
  const order = findMatchingOrder(state);
  if (!order) {
    playBuzz();
    state.shake = 0.25;
    toast(state, 'Piring ini belum cocok dengan pesanan mana pun.');
    return false;
  }
  const gained = serveMatchingOrder(state, order);
  playDing();
  addPopup(state, LAYOUT.plate.x, LAYOUT.plate.y - 140, `+${gained}`, '#7cc46a');
  return true;
}

// One click at canvas coordinates (already scaled to the 1280x800 space).
export function handleClick(state, x, y, startGame, restartGame) {
  resumeAudio();
  if (state.mode === 'title') {
    if (inside(x, y, LAYOUT.startBtn)) {
      playClick();
      startGame();
    }
    return;
  }
  if (state.mode === 'dayover') {
    if (inside(x, y, LAYOUT.againBtn)) {
      playClick();
      restartGame();
    }
    return;
  }
  if (state.mode === 'paused') return;
  if (state.mode !== 'playing') return;

  // Order tickets first: serving straight from a ticket feels direct.
  for (let i = 0; i < state.orders.length; i++) {
    const box = LAYOUT.tickets[i];
    if (box && inside(x, y, box)) {
      tryServe(state);
      return;
    }
  }
  // Stove burners.
  for (let i = 0; i < LAYOUT.burners.length; i++) {
    if (insideCircle(x, y, LAYOUT.burners[i])) {
      const result = clickBurner(state, i);
      if (result === 'plated') playPlop();
      else if (result === 'discarded') playBuzz();
      else if (result === 'raw') playClick();
      return;
    }
  }
  // Chopping board.
  if (inside(x, y, LAYOUT.chopBoard)) {
    const result = clickBoard(state);
    if (result === 'chopped') playChop();
    else if (result === 'plated') playPlop();
    else if (result === 'full') playBuzz();
    return;
  }
  // Serve + trash buttons.
  if (inside(x, y, LAYOUT.serveBtn)) {
    tryServe(state);
    return;
  }
  if (inside(x, y, LAYOUT.trashBtn)) {
    if (clearPlate(state) === 'cleared') playClick();
    return;
  }
  // Plate slots: lift an ingredient back off.
  for (let i = 0; i < state.plate.length; i++) {
    const slot = LAYOUT.plateSlots[i % LAYOUT.plateSlots.length];
    if (insideCircle(x, y, { x: slot.x, y: slot.y, r: 32 })) {
      if (clickPlateSlot(state, i) === 'removed') playClick();
      return;
    }
  }
  // Counter bins.
  for (const bin of LAYOUT.bins) {
    if (inside(x, y, { x: bin.x, y: bin.y + 18, w: bin.w, h: bin.h - 18 })) {
      const result = takeIngredient(state, bin.id);
      if (result === 'plated') playPlop();
      else if (result === 'stove' || result === 'board') playClick();
      else if (result === 'busy' || result === 'full') playBuzz();
      return;
    }
  }
}

// Keyboard shortcuts. Returns true when the key did something.
export function handleKey(state, key, startGame, restartGame, togglePause) {
  const k = key.toLowerCase();
  if (state.mode === 'title' && (k === 'enter' || k === ' ')) {
    resumeAudio();
    playClick();
    startGame();
    return true;
  }
  if (state.mode === 'dayover' && (k === 'r' || k === 'enter')) {
    resumeAudio();
    playClick();
    restartGame();
    return true;
  }
  if (k === 'p' && (state.mode === 'playing' || state.mode === 'paused')) {
    togglePause();
    return true;
  }
  if (k === 'm') {
    state.muted = !state.muted;
    toast(state, state.muted ? 'Suara dimatikan.' : 'Suara dinyalakan.');
    return true;
  }
  if (state.mode !== 'playing') return false;
  const byKey = INGREDIENTS.find((g) => g.key === k);
  if (byKey) {
    resumeAudio();
    const result = takeIngredient(state, byKey.id);
    if (result === 'plated') playPlop();
    else if (result === 'stove' || result === 'board') playClick();
    else if (result === 'busy' || result === 'full') playBuzz();
    return true;
  }
  if (k === 's') {
    tryServe(state);
    return true;
  }
  if (k === 't') {
    if (clearPlate(state) === 'cleared') playClick();
    return true;
  }
  if (k === 'f') {
    // Take the first cooked burner with one key.
    for (let i = 0; i < state.burners.length; i++) {
      if (state.burners[i] && state.burners[i].state === 'done') {
        if (clickBurner(state, i) === 'plated') playPlop();
        return true;
      }
    }
    return true;
  }
  if (k === 'c') {
    const result = clickBoard(state);
    if (result === 'chopped') playChop();
    else if (result === 'plated') playPlop();
    return true;
  }
  return false;
}

export function ingredientLabel(id) {
  const ing = ingredientById(id);
  return ing ? ing.name : id;
}
