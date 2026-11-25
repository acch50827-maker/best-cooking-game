// kitchen.js — the work stations: stove burners, chopping board, plate, trash.
// Every click in the kitchen goes through here; it only mutates the state.

import { PLATE_SLOTS, ingredientById } from './data.js';

export function toast(state, text) {
  state.toast = { text, life: 1.6 };
}

export function addPopup(state, x, y, text, color) {
  state.popups.push({ x, y, text, color: color || '#ffffff', life: 1.1 });
}

// Tick the stove: cooking progresses, done food waits, forgotten food burns.
export function tickKitchen(state, dt) {
  for (let i = 0; i < state.burners.length; i++) {
    const b = state.burners[i];
    if (!b) continue;
    const ing = ingredientById(b.ingredientId);
    if (!ing || ing.prep !== 'fry') continue;
    if (b.state === 'cooking') {
      b.cooked += dt;
      if (b.cooked >= ing.cookTime) {
        b.state = 'done';
        b.cooked = ing.cookTime;
        b.waiting = 0;
      }
    } else if (b.state === 'done') {
      b.waiting = (b.waiting || 0) + dt;
      if (b.waiting >= ing.burnAfter) {
        b.state = 'burnt';
        toast(state, `${ing.name} gosong! Angkat sebelum gosong.`);
      }
    }
  }
  for (const p of state.popups) p.life -= dt;
  state.popups = state.popups.filter((p) => p.life > 0);
  if (state.toast) {
    state.toast.life -= dt;
    if (state.toast.life <= 0) state.toast = null;
  }
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
  }
  if (state.servedFlash > 0) state.servedFlash -= dt;
  if (state.shake > 0) state.shake -= dt;
}

// Click a counter bin: ready food lands on the plate, the rest go to a station.
export function takeIngredient(state, ingredientId) {
  const ing = ingredientById(ingredientId);
  if (!ing || state.mode !== 'playing') return 'ignored';
  if (ing.prep === 'ready') {
    if (state.plate.length >= PLATE_SLOTS) {
      toast(state, 'Piring penuh! Sajikan atau buang dulu.');
      return 'full';
    }
    state.plate.push(ing.id);
    return 'plated';
  }
  if (ing.prep === 'fry') {
    const free = state.burners.findIndex((b) => b === null);
    if (free === -1) {
      toast(state, 'Kompor penuh! Tunggu yang matang.');
      return 'busy';
    }
    state.burners[free] = { ingredientId: ing.id, cooked: 0, waiting: 0, state: 'cooking' };
    return 'stove';
  }
  // chop
  if (state.board) {
    toast(state, 'Talenan sedang dipakai!');
    return 'busy';
  }
  state.board = { ingredientId: ing.id, chopsDone: 0, chopsTotal: ing.chops };
  return 'board';
}

// Click a burner: take done food to the plate, discard burnt food, ignore raw food.
export function clickBurner(state, index) {
  const b = state.burners[index];
  if (!b || state.mode !== 'playing') return 'ignored';
  const ing = ingredientById(b.ingredientId);
  if (b.state === 'burnt') {
    state.burners[index] = null;
    toast(state, `${ing.name} gosong dibuang.`);
    return 'discarded';
  }
  if (b.state !== 'done') {
    toast(state, `${ing.name} belum matang…`);
    return 'raw';
  }
  if (state.plate.length >= PLATE_SLOTS) {
    toast(state, 'Piring penuh! Sajikan atau buang dulu.');
    return 'full';
  }
  state.plate.push(b.ingredientId);
  state.burners[index] = null;
  return 'plated';
}

// Click the chopping board: one chop; a finished pile goes to the plate on the next click.
export function clickBoard(state) {
  const board = state.board;
  if (!board || state.mode !== 'playing') return 'ignored';
  board.chopsDone += 1;
  if (board.chopsDone < board.chopsTotal) return 'chopped';
  if (state.plate.length >= PLATE_SLOTS) {
    board.chopsDone = board.chopsTotal;
    toast(state, 'Piring penuh! Sajikan atau buang dulu.');
    return 'full';
  }
  state.plate.push(board.ingredientId);
  state.board = null;
  return 'plated';
}

// Click a plate slot: lift that ingredient back off the plate.
export function clickPlateSlot(state, index) {
  if (state.mode !== 'playing') return 'ignored';
  if (index < 0 || index >= state.plate.length) return 'ignored';
  state.plate.splice(index, 1);
  return 'removed';
}

// Empty the whole plate into the trash.
export function clearPlate(state) {
  if (state.mode !== 'playing' || state.plate.length === 0) return 'ignored';
  state.plate = [];
  toast(state, 'Piring dibersihkan.');
  return 'cleared';
}
