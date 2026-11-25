// data.js — every ingredient, recipe and dish name in Warung Rasa.
// All art, names and recipes are original to this game.

export const DAY_LENGTH_SECONDS = 150;
export const MAX_HEARTS = 3;
export const PLATE_SLOTS = 5;
export const ORDER_SLOTS = 3;
export const ORDER_PATIENCE_SECONDS = 38;
export const COMBO_WINDOW_SECONDS = 9;

// One ingredient on the counter. prep tells the kitchen what to do with it:
//   'ready' — goes straight onto the plate when clicked.
//   'fry'   — must spend cookTime on a stove burner first; left too long it burns.
//   'chop'  — must be chopped on the board `chops` times first.
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', prep: 'ready', blurb: 'Siap saji', tint: '#f7f1da', dark: '#d9cf9f' },
  { id: 'ayam', name: 'Ayam', key: '2', prep: 'fry', cookTime: 4.0, burnAfter: 6.0, blurb: 'Goreng 4 dtk', tint: '#c98a4b', dark: '#8a5a28' },
  { id: 'telur', name: 'Telur', key: '3', prep: 'fry', cookTime: 2.5, burnAfter: 5.0, blurb: 'Goreng 2,5 dtk', tint: '#f6c453', dark: '#c98f1b' },
  { id: 'sayur', name: 'Sayur', key: '4', prep: 'chop', chops: 3, blurb: 'Potong 3x', tint: '#5da24a', dark: '#2f6b2a' },
  { id: 'sambal', name: 'Sambal', key: '5', prep: 'ready', blurb: 'Siap saji', tint: '#d8402e', dark: '#8f1f12' },
  { id: 'kerupuk', name: 'Kerupuk', key: '6', prep: 'ready', blurb: 'Siap saji', tint: '#f2c98a', dark: '#c08a3e' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id) ?? null;
}

// A recipe is the exact multiset of ingredients one order ticket asks for.
export const RECIPES = [
  { id: 'nasi-ayam', name: 'Nasi Ayam Geprek', items: ['nasi', 'ayam', 'sambal'], price: 120, points: 100 },
  { id: 'nasi-telur', name: 'Nasi Telur Balado', items: ['nasi', 'telur', 'kerupuk'], price: 100, points: 90 },
  { id: 'ayam-sayur', name: 'Ayam Sayur Lodeh', items: ['ayam', 'sayur', 'sambal'], price: 130, points: 110 },
  { id: 'telur-sayur', name: 'Telur Sayur Tumis', items: ['telur', 'sayur', 'nasi'], price: 110, points: 100 },
  { id: 'sayur-sambal', name: 'Sayur Sambal Terasi', items: ['sayur', 'sambal', 'kerupuk'], price: 90, points: 80 },
  // The house special: five ingredients, the biggest payout, unlocked late in the day.
  { id: 'komplit', name: 'Nasi Komplit Spesial', items: ['nasi', 'ayam', 'telur', 'sambal', 'kerupuk'], price: 220, points: 200, lateOnly: true },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}

// Which recipes may appear at a given moment of the day (seconds elapsed).
export function availableRecipes(elapsedSeconds) {
  if (elapsedSeconds < 45) return RECIPES.filter((r) => !r.lateOnly);
  return RECIPES;
}

// Points for serving a dish: base points plus a patience bonus, times the combo.
export function scoreForServe(recipe, patienceLeft, patienceMax, combo) {
  const patienceBonus = Math.round(60 * (patienceLeft / patienceMax));
  return (recipe.points + patienceBonus) * Math.max(1, combo);
}

// Stars for the end-of-day results screen.
export function starsForScore(score, served) {
  if (score >= 1400 && served >= 9) return 3;
  if (score >= 800 && served >= 6) return 2;
  if (score >= 350 && served >= 3) return 1;
  return 0;
}
