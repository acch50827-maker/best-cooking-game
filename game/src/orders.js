// orders.js — the order board: tickets arrive, wait, expire, and get served.

import { ORDER_SLOTS, ORDER_PATIENCE_SECONDS, availableRecipes, recipeById, scoreForServe } from './data.js';
import { pickRandom } from './rng.js';

// How often a new ticket may appear: faster as the day goes on.
export function spawnIntervalSeconds(elapsed) {
  if (elapsed < 40) return 8;
  if (elapsed < 90) return 6.5;
  return 5;
}

export function spawnOrder(state, rng) {
  if (state.orders.length >= ORDER_SLOTS) return null;
  const pool = availableRecipes(state.elapsed);
  const recipe = pickRandom(rng, pool);
  const patience = ORDER_PATIENCE_SECONDS - Math.min(8, Math.floor(state.elapsed / 30) * 2);
  const order = { id: state.nextOrderId++, recipeId: recipe.id, patience, maxPatience: patience };
  state.orders.push(order);
  return order;
}

export function tickOrders(state, dt, rng, onExpired) {
  // Spawn a fresh ticket when a slot is free and the interval has passed.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < ORDER_SLOTS) {
    spawnOrder(state, rng);
    state.spawnIn = spawnIntervalSeconds(state.elapsed);
  }
  // Patience drains; an expired ticket costs a heart.
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.hearts = Math.max(0, state.hearts - 1);
      state.combo = 0;
      state.comboTimer = 0;
      onExpired(order);
    }
  }
}

// Does the plate hold exactly the recipe's ingredients (order does not matter)?
export function plateMatchesRecipe(plate, recipe) {
  if (plate.length !== recipe.items.length) return false;
  const have = plate.slice().sort();
  const want = recipe.items.slice().sort();
  return have.every((id, i) => id === want[i]);
}

// The first ticket the plate can satisfy, if any.
export function findMatchingOrder(state) {
  for (const order of state.orders) {
    const recipe = recipeById(order.recipeId);
    if (recipe && plateMatchesRecipe(state.plate, recipe)) return order;
  }
  return null;
}

// Serve the matching ticket: score, coins, combo, and a fresh plate.
export function serveMatchingOrder(state, order) {
  const recipe = recipeById(order.recipeId);
  if (!recipe) return 0;
  state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
  state.comboTimer = 9;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const gained = scoreForServe(recipe, order.patience, order.maxPatience, state.combo);
  state.score += gained;
  state.coins += recipe.price;
  state.served += 1;
  state.servedNames.push(recipe.name);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = [];
  state.servedFlash = 0.6;
  state.spawnIn = Math.min(state.spawnIn, 2.5);
  return gained;
}
