// render.js — every pixel of the kitchen, drawn on one canvas.
// Layout is shared with input.js through the exported LAYOUT table.

import { INGREDIENTS, PLATE_SLOTS, ingredientById, recipeById } from './data.js';
import { formatClock } from './state.js';

export const LAYOUT = {
  width: 1280,
  height: 800,
  topBar: { x: 0, y: 0, w: 1280, h: 72 },
  board: { x: 20, y: 88, w: 280, h: 472 },
  tickets: [
    { x: 32, y: 140, w: 256, h: 128 },
    { x: 32, y: 284, w: 256, h: 128 },
    { x: 32, y: 428, w: 256, h: 128 },
  ],
  stove: { x: 330, y: 88, w: 330, h: 150 },
  burners: [
    { x: 425, y: 176, r: 44 },
    { x: 565, y: 176, r: 44 },
  ],
  chopBoard: { x: 690, y: 88, w: 270, h: 150 },
  plate: { x: 520, y: 440, r: 105 },
  plateSlots: [
    { x: 452, y: 425 }, { x: 520, y: 397 }, { x: 588, y: 425 },
    { x: 486, y: 477 }, { x: 556, y: 477 },
  ],
  serveBtn: { x: 700, y: 330, w: 240, h: 64 },
  trashBtn: { x: 700, y: 410, w: 240, h: 52 },
  stats: { x: 990, y: 88, w: 270, h: 472 },
  bins: INGREDIENTS.map((g, i) => ({ id: g.id, x: 20 + i * 208, y: 600, w: 196, h: 152 })),
  startBtn: { x: 440, y: 520, w: 400, h: 72 },
  againBtn: { x: 440, y: 560, w: 400, h: 64 },
  hintBar: { x: 0, y: 776, w: 1280, h: 24 },
};

const FONT = '"Trebuchet MS", Verdana, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e8452c' : '#5a3a32';
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- food art

export function drawIngredient(ctx, id, x, y, r, burnt = false) {
  ctx.save();
  ctx.translate(x, y);
  if (burnt) {
    ctx.fillStyle = '#2b2320';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#55483f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.3);
    ctx.lineTo(r * 0.3, r * 0.35);
    ctx.moveTo(r * 0.4, -r * 0.35);
    ctx.lineTo(-r * 0.25, r * 0.4);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (id === 'nasi') {
    ctx.fillStyle = '#efe7c8';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.15, r, r * 0.62, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fffdf2';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.05, r * 0.78, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9cf9f';
    for (const [gx, gy] of [[-0.45, -0.2], [0.1, -0.35], [0.45, -0.1], [-0.05, 0.05], [0.3, 0.2]]) {
      ctx.beginPath();
      ctx.ellipse(gx * r, gy * r, r * 0.09, r * 0.05, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'ayam') {
    ctx.strokeStyle = '#f3e2c2';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.1, r * 0.05);
    ctx.lineTo(r * 0.62, -r * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#f3e2c2';
    ctx.beginPath();
    ctx.arc(r * 0.68, -r * 0.66, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.52, -r * 0.72, r * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b06a2e';
    ctx.beginPath();
    ctx.arc(-r * 0.12, r * 0.08, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d99a55';
    ctx.beginPath();
    ctx.arc(-r * 0.28, -r * 0.1, r * 0.34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a28';
    ctx.beginPath();
    ctx.arc(r * 0.12, r * 0.3, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.72, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6c453';
    ctx.beginPath();
    ctx.arc(r * 0.08, -r * 0.02, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f9d976';
    ctx.beginPath();
    ctx.arc(-r * 0.02, -r * 0.12, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.strokeStyle = '#2f6b2a';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.7);
    ctx.lineTo(0, -r * 0.1);
    ctx.stroke();
    for (const [ang, lx, ly] of [[-0.7, -0.42, -0.35], [0, 0, -0.55], [0.7, 0.42, -0.35]]) {
      ctx.save();
      ctx.translate(lx * r, ly * r);
      ctx.rotate(ang);
      ctx.fillStyle = '#5da24a';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.3, r * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7cc46a';
      ctx.beginPath();
      ctx.ellipse(-r * 0.05, -r * 0.05, r * 0.16, r * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (id === 'sambal') {
    ctx.fillStyle = '#f4f1e6';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.95, r * 0.6, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d8402e';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.05, r * 0.82, r * 0.5, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a82a1c';
    for (const [sx, sy] of [[-0.4, -0.15], [0.05, -0.3], [0.42, -0.12]]) {
      ctx.beginPath();
      ctx.arc(sx * r, sy * r, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2f6b2a';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.7, r * 0.75, -r * 0.45);
    ctx.stroke();
  } else if (id === 'kerupuk') {
    ctx.fillStyle = '#f2c98a';
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 8) {
      const rr = r * (0.92 + 0.14 * Math.sin(a * 4));
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a95c';
    for (const [dx, dy] of [[-0.4, -0.3], [0.35, -0.4], [0, 0.1], [-0.35, 0.4], [0.42, 0.35]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- pieces

function drawTopBar(ctx, state) {
  const b = LAYOUT.topBar;
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(0, b.h - 6, b.w, 6);
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 30px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG RASA', 20, 26);
  ctx.fillStyle = '#f4e3c2';
  ctx.font = `italic 15px ${FONT}`;
  ctx.fillText('Dapur Kilat — masak cepat, sajikan hangat', 20, 52);

  // Day timer, centre.
  const cx = 640;
  ctx.fillStyle = '#241610';
  roundRect(ctx, cx - 190, 12, 380, 48, 10);
  ctx.fill();
  const frac = Math.max(0, state.timeLeft / 150);
  if (frac > 0.005) {
    ctx.fillStyle = frac > 0.5 ? '#5da24a' : frac > 0.25 ? '#f6c453' : '#e8452c';
    roundRect(ctx, cx - 178, 20, 356 * frac, 16, 6);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 20px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(`HARI ${state.day}  •  ${formatClock(state.timeLeft)}`, cx, 50);

  // Score, coins, hearts, right.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 22px ${FONT}`;
  ctx.fillText(`Skor ${state.score}`, 1010, 24);
  ctx.fillStyle = '#f4e3c2';
  ctx.font = `700 18px ${FONT}`;
  ctx.fillText(`Koin ${state.coins}`, 1010, 50);
  for (let i = 0; i < 3; i++) drawHeart(ctx, 1060 + i * 34, 34, 26, i < state.hearts);
}

function drawTicket(ctx, order, box, t) {
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.3;
  ctx.save();
  if (urgent && Math.floor(t * 2) % 2 === 0) {
    ctx.shadowColor = '#e8452c';
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = '#fff8e1';
  roundRect(ctx, box.x, box.y, box.w, box.h, 10);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = urgent ? '#e8452c' : '#d9c48a';
  ctx.lineWidth = urgent ? 3 : 2;
  roundRect(ctx, box.x, box.y, box.w, box.h, 10);
  ctx.stroke();
  ctx.fillStyle = '#3a2418';
  ctx.font = `900 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`#${order.id}  ${recipe.name}`, box.x + 12, box.y + 22);
  // Ingredient icons the dish needs.
  recipe.items.forEach((id, i) => {
    drawIngredient(ctx, id, box.x + 34 + i * 46, box.y + 62, 20);
  });
  ctx.fillStyle = '#8a6d3b';
  ctx.font = `700 14px ${FONT}`;
  ctx.fillText(`${recipe.items.length} bahan  •  Koin ${recipe.price}`, box.x + 12, box.y + 100);
  // Patience bar.
  ctx.fillStyle = '#e8dcc0';
  roundRect(ctx, box.x + 12, box.y + box.h - 16, box.w - 24, 8, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#5da24a' : frac > 0.25 ? '#f6c453' : '#e8452c';
  roundRect(ctx, box.x + 12, box.y + box.h - 16, (box.w - 24) * frac, 8, 4);
  ctx.fill();
}

function drawBoard(ctx, state, t) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#2f1d12';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 20px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAPAN PESANAN', b.x + 16, b.y + 26);
  ctx.fillStyle = '#c9a86a';
  ctx.font = `700 13px ${FONT}`;
  ctx.fillText('Klik tiket atau SAJIKAN', b.x + 16, b.y + 48);
  state.orders.forEach((order, i) => {
    if (i < LAYOUT.tickets.length) drawTicket(ctx, order, LAYOUT.tickets[i], t);
  });
  if (state.orders.length === 0) {
    ctx.fillStyle = '#c9a86a';
    ctx.font = `italic 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Belum ada pesanan…', b.x + b.w / 2, b.y + 200);
  }
}

function drawStove(ctx, state, t) {
  const s = LAYOUT.stove;
  ctx.fillStyle = '#4a4a52';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.fillStyle = '#d8d8de';
  ctx.font = `900 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('KOMPOR', s.x + 16, s.y + 22);
  LAYOUT.burners.forEach((burner, i) => {
    const b = state.burners[i];
    ctx.fillStyle = '#2b2b31';
    ctx.beginPath();
    ctx.arc(burner.x, burner.y, burner.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6a6a72';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(burner.x, burner.y, burner.r - 6, 0, Math.PI * 2);
    ctx.stroke();
    if (b) {
      const ing = ingredientById(b.ingredientId);
      drawIngredient(ctx, b.ingredientId, burner.x, burner.y, 34, b.state === 'burnt');
      if (b.state === 'cooking') {
        const frac = Math.min(1, b.cooked / ing.cookTime);
        ctx.strokeStyle = '#f6c453';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(burner.x, burner.y, burner.r - 2, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
        // Sizzle bubbles.
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let k = 0; k < 3; k++) {
          const a = t * 2 + k * 2.1;
          ctx.beginPath();
          ctx.arc(burner.x + Math.cos(a) * 18, burner.y - 14 - ((t * 30 + k * 17) % 20), 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (b.state === 'done') {
        const pulse = 0.6 + 0.4 * Math.sin(t * 6);
        ctx.strokeStyle = `rgba(93,162,74,${pulse})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(burner.x, burner.y, burner.r - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#7cc46a';
        ctx.font = `900 12px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('MATANG!', burner.x, burner.y + burner.r + 11);
      } else {
        ctx.fillStyle = '#e8452c';
        ctx.font = `900 12px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('GOSONG!', burner.x, burner.y + burner.r + 11);
      }
    }
  });
}

function drawChopBoard(ctx, state) {
  const c = LAYOUT.chopBoard;
  ctx.fillStyle = '#8a5a28';
  roundRect(ctx, c.x, c.y, c.w, c.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TALENAN', c.x + 16, c.y + 22);
  ctx.fillStyle = '#e8c890';
  ctx.font = `700 12px ${FONT}`;
  ctx.fillText('Klik untuk memotong', c.x + 16, c.y + 42);
  ctx.fillStyle = '#c99a5b';
  roundRect(ctx, c.x + 30, c.y + 70, c.w - 60, 68, 8);
  ctx.fill();
  const board = state.board;
  if (board) {
    const done = board.chopsDone >= board.chopsTotal;
    drawIngredient(ctx, board.ingredientId, c.x + c.w / 2, c.y + 104, done ? 24 : 30);
    if (!done) {
      ctx.strokeStyle = '#3a2418';
      ctx.lineWidth = 2;
      for (let k = 0; k < board.chopsDone; k++) {
        ctx.beginPath();
        ctx.moveTo(c.x + c.w / 2 - 24 + k * 16, c.y + 88);
        ctx.lineTo(c.x + c.w / 2 - 17 + k * 16, c.y + 120);
        ctx.stroke();
      }
      ctx.fillStyle = '#3a2418';
      ctx.font = `900 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(`Potong ${board.chopsDone}/${board.chopsTotal}`, c.x + c.w / 2, c.y + 60);
    } else {
      ctx.fillStyle = '#2f6b2a';
      ctx.font = `900 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('Siap! Klik untuk ke piring', c.x + c.w / 2, c.y + 60);
    }
  } else {
    ctx.fillStyle = '#a87c46';
    ctx.font = `italic 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Kosong — klik Sayur di bawah', c.x + c.w / 2, c.y + 104);
  }
}

function drawPlateZone(ctx, state, t) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#2f1d12';
  roundRect(ctx, 330, 254, 630, 326, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 18px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('PIRING RAKITAN', 350, 282);
  ctx.fillStyle = '#c9a86a';
  ctx.font = `700 13px ${FONT}`;
  ctx.fillText('Klik bahan di piring untuk mengambilnya kembali', 350, 306);

  // The plate itself.
  ctx.save();
  if (state.servedFlash > 0) {
    ctx.shadowColor = '#7cc46a';
    ctx.shadowBlur = 30 * state.servedFlash;
  }
  ctx.fillStyle = '#f8f4ea';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#d9c48a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#e8dcc0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r - 22, 0, Math.PI * 2);
  ctx.stroke();
  state.plate.forEach((id, i) => {
    const slot = LAYOUT.plateSlots[i % LAYOUT.plateSlots.length];
    drawIngredient(ctx, id, slot.x, slot.y, 30);
  });
  if (state.plate.length === 0) {
    ctx.fillStyle = '#b9a888';
    ctx.font = `italic 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Piring kosong', p.x, p.y);
  }

  // Serve + trash buttons.
  const serve = LAYOUT.serveBtn;
  const canServe = state.orders.some((o) => {
    const r = recipeById(o.recipeId);
    return r && state.plate.length === r.items.length &&
      state.plate.slice().sort().join() === r.items.slice().sort().join();
  });
  ctx.fillStyle = canServe ? '#5da24a' : '#6b5a48';
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fill();
  if (canServe && Math.floor(t * 2) % 2 === 0) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 3;
    roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 24px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('SAJIKAN  (S)', serve.x + serve.w / 2, serve.y + serve.h / 2 + 1);
  const trash = LAYOUT.trashBtn;
  ctx.fillStyle = '#7a3b2e';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd9c9';
  ctx.font = `900 18px ${FONT}`;
  ctx.fillText('Buang Isi Piring  (T)', trash.x + trash.w / 2, trash.y + trash.h / 2 + 1);
  ctx.fillStyle = '#c9a86a';
  ctx.font = `700 13px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(canServe ? 'Piring ini cocok dengan pesanan!' : 'Rakit sesuai resep di tiket.', serve.x, serve.y + serve.h + 78);
}

function drawStats(ctx, state) {
  const s = LAYOUT.stats;
  ctx.fillStyle = '#2f1d12';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 20px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('DAPUR HARI INI', s.x + 16, s.y + 28);
  const rows = [
    ['Hidangan disajikan', String(state.served)],
    ['Kombo terbaik', state.bestCombo > 1 ? `x${state.bestCombo}` : '—'],
    ['Kombo sekarang', state.combo > 1 ? `x${state.combo}` : '—'],
    ['Pesanan menunggu', String(state.orders.length)],
  ];
  ctx.font = `700 16px ${FONT}`;
  rows.forEach(([label, value], i) => {
    const y = s.y + 64 + i * 32;
    ctx.fillStyle = '#c9a86a';
    ctx.fillText(label, s.x + 16, y);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(value, s.x + s.w - 16, y);
    ctx.textAlign = 'left';
  });
  // Combo meter.
  ctx.fillStyle = '#c9a86a';
  ctx.font = `700 14px ${FONT}`;
  ctx.fillText('METER KOMBO', s.x + 16, s.y + 272);
  ctx.fillStyle = '#241610';
  roundRect(ctx, s.x + 16, s.y + 284, s.w - 32, 18, 8);
  ctx.fill();
  const frac = Math.max(0, state.comboTimer / 9);
  ctx.fillStyle = '#f6c453';
  if (frac > 0) roundRect(ctx, s.x + 16, s.y + 284, (s.w - 32) * frac, 18, 8);
  ctx.fill();
  ctx.fillStyle = '#f4e3c2';
  ctx.font = `700 14px ${FONT}`;
  ctx.fillText('Sajikan beruntun sebelum', s.x + 16, s.y + 324);
  ctx.fillText('meter habis — skor berlipat.', s.x + 16, s.y + 344);
  // Mini how-to.
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 16px ${FONT}`;
  ctx.fillText('CARA MAIN', s.x + 16, s.y + 372);
  ctx.fillStyle = '#f4e3c2';
  ctx.font = `400 14px ${FONT}`;
  const tips = [
    '1  Klik bahan di counter bawah.',
    '2  Ayam & telur digoreng di kompor,',
    '     sayur dipotong di talenan.',
    '3  Rakit di piring sesuai resep tiket.',
    '4  Sajikan sebelum pelanggan pergi!',
  ];
  tips.forEach((line, i) => ctx.fillText(line, s.x + 16, s.y + 388 + i * 18));
}

function drawCounter(ctx, state) {
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(0, 584, 1280, 184);
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(0, 584, 1280, 8);
  ctx.fillStyle = '#ffd166';
  ctx.font = `900 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('COUNTER BAHAN — klik atau tekan 1–6', 20, 606);
  LAYOUT.bins.forEach((bin) => {
    const ing = ingredientById(bin.id);
    ctx.fillStyle = '#f4e3c2';
    roundRect(ctx, bin.x, bin.y + 18, bin.w, bin.h - 18, 10);
    ctx.fill();
    ctx.strokeStyle = '#d9c48a';
    ctx.lineWidth = 2;
    roundRect(ctx, bin.x, bin.y + 18, bin.w, bin.h - 18, 10);
    ctx.stroke();
    drawIngredient(ctx, ing.id, bin.x + bin.w / 2, bin.y + 74, 34);
    ctx.fillStyle = '#3a2418';
    ctx.font = `900 17px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(ing.name, bin.x + bin.w / 2, bin.y + 122);
    ctx.fillStyle = '#8a6d3b';
    ctx.font = `700 13px ${FONT}`;
    ctx.fillText(ing.blurb, bin.x + bin.w / 2, bin.y + 142);
    // Key badge.
    ctx.fillStyle = '#3a2418';
    ctx.beginPath();
    ctx.arc(bin.x + 18, bin.y + 34, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.font = `900 14px ${FONT}`;
    ctx.fillText(ing.key, bin.x + 18, bin.y + 35);
  });
}

function drawPopups(ctx, state) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of state.popups) {
    ctx.globalAlpha = Math.min(1, p.life * 1.4);
    ctx.font = `900 26px ${FONT}`;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y - (1.1 - p.life) * 40);
  }
  ctx.globalAlpha = 1;
}

function drawToast(ctx, state) {
  if (!state.toast) return;
  ctx.globalAlpha = Math.min(1, state.toast.life);
  ctx.font = `700 16px ${FONT}`;
  const w = ctx.measureText(state.toast.text).width + 32;
  ctx.fillStyle = 'rgba(36,22,16,0.92)';
  roundRect(ctx, 640 - w / 2, 716, w, 34, 17);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.toast.text, 640, 734);
  ctx.globalAlpha = 1;
}

function drawTitleOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(20,10,6,0.62)';
  ctx.fillRect(0, 72, 1280, 704);
  ctx.fillStyle = '#fff8e1';
  roundRect(ctx, 340, 120, 600, 480, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 4;
  roundRect(ctx, 340, 120, 600, 480, 18);
  ctx.stroke();
  ctx.fillStyle = '#3a2418';
  ctx.font = `900 52px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG RASA', 640, 190);
  ctx.fillStyle = '#b06a2e';
  ctx.font = `italic 900 26px ${FONT}`;
  ctx.fillText('— Dapur Kilat —', 640, 230);
  ctx.fillStyle = '#5a3a22';
  ctx.font = `400 18px ${FONT}`;
  const lines = [
    'Warung kecilmu ramai! Pesanan masuk di papan,',
    'bahan menunggu di counter. Goreng ayamnya,',
    'potong sayurnya, rakit di piring, sajikan hangat.',
    'Satu pesanan telat, satu hati hilang.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 282 + i * 28));
  ctx.fillStyle = '#8a6d3b';
  ctx.font = `700 15px ${FONT}`;
  ctx.fillText('Mouse: klik bahan & stasiun   •   Keyboard: 1–6 bahan', 640, 414);
  ctx.fillText('S sajikan  •  T buang piring  •  P jeda  •  M suara', 640, 438);
  const b = LAYOUT.startBtn;
  ctx.fillStyle = '#5da24a';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 26px ${FONT}`;
  ctx.fillText('MULAI MASAK  (Enter)', b.x + b.w / 2, b.y + b.h / 2 + 1);
}

function drawPausedOverlay(ctx) {
  ctx.fillStyle = 'rgba(20,10,6,0.6)';
  ctx.fillRect(0, 72, 1280, 704);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 44px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JEDA', 640, 380);
  ctx.font = `400 20px ${FONT}`;
  ctx.fillText('Tekan P untuk lanjut masak', 640, 430);
}

function drawDayOverOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(20,10,6,0.66)';
  ctx.fillRect(0, 72, 1280, 704);
  ctx.fillStyle = '#fff8e1';
  roundRect(ctx, 340, 110, 600, 540, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 4;
  roundRect(ctx, 340, 110, 600, 540, 18);
  ctx.stroke();
  ctx.fillStyle = '#3a2418';
  ctx.font = `900 44px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HARI SELESAI!', 640, 168);
  // Stars.
  const stars = state.stars ?? 0;
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(560 + i * 80, 232);
    ctx.fillStyle = i < stars ? '#f6c453' : '#d9c48a';
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + (k * Math.PI) / 5;
      const rr = k % 2 === 0 ? 34 : 15;
      const px = Math.cos(ang) * rr;
      const py = Math.sin(ang) * rr;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#5a3a22';
  ctx.font = `700 22px ${FONT}`;
  const rows = [
    ['Skor akhir', String(state.score)],
    ['Koin didapat', String(state.coins)],
    ['Hidangan disajikan', String(state.served)],
    ['Kombo terbaik', state.bestCombo > 1 ? `x${state.bestCombo}` : '—'],
  ];
  rows.forEach(([label, value], i) => {
    const y = 300 + i * 40;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8a6d3b';
    ctx.fillText(label, 430, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#3a2418';
    ctx.fillText(value, 850, y);
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8a6d3b';
  ctx.font = `italic 17px ${FONT}`;
  ctx.fillText(state.served >= 6 ? 'Warungmu ramai — pelanggan pulang senang!' : 'Besok lebih cepat lagi, koki!', 640, 480);
  const b = LAYOUT.againBtn;
  ctx.fillStyle = '#5da24a';
  roundRect(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 24px ${FONT}`;
  ctx.fillText('MAIN LAGI  (R)', b.x + b.w / 2, b.y + b.h / 2 + 1);
}

// ---------------------------------------------------------------- main entry

export function renderGame(ctx, state, t) {
  ctx.save();
  if (state.shake > 0) {
    const s = state.shake * 8;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  // Wall + floor.
  ctx.fillStyle = '#e8c890';
  ctx.fillRect(0, 72, 1280, 512);
  ctx.fillStyle = '#c99a5b';
  ctx.fillRect(0, 560, 1280, 24);
  ctx.fillStyle = '#a87c46';
  for (let x = 0; x < 1280; x += 64) ctx.fillRect(x, 584, 2, 192);
  drawTopBar(ctx, state);
  drawBoard(ctx, state, t);
  drawStove(ctx, state, t);
  drawChopBoard(ctx, state);
  drawPlateZone(ctx, state, t);
  drawStats(ctx, state);
  drawCounter(ctx, state);
  drawPopups(ctx, state);
  drawToast(ctx, state);
  // Hint bar.
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(0, 776, 1280, 24);
  ctx.fillStyle = '#f4e3c2';
  ctx.font = `700 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('1–6 bahan  •  S sajikan  •  T buang piring  •  P jeda  •  M suara', 640, 788);
  if (state.mode === 'title') drawTitleOverlay(ctx, state);
  if (state.mode === 'paused') drawPausedOverlay(ctx);
  if (state.mode === 'dayover') drawDayOverOverlay(ctx, state);
  ctx.restore();
}
