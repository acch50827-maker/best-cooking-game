// audio.js — all sound is synthesized with WebAudio; no audio files, no network.

let audioCtx = null;
let sizzleNodes = null;

function ensureContext() {
  if (audioCtx) return audioCtx;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  } catch (e) {
    audioCtx = null;
  }
  return audioCtx;
}

export function resumeAudio() {
  const ctx = ensureContext();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function tone(freq, duration, type, volume, when = 0) {
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + when;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume || 0.12, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch (e) {
    /* headless browsers may refuse audio; the game plays fine silent */
  }
}

export function playClick() {
  tone(660, 0.06, 'triangle', 0.08);
}

export function playPlop() {
  tone(320, 0.09, 'sine', 0.12);
  tone(180, 0.12, 'sine', 0.1, 0.05);
}

export function playChop() {
  tone(190, 0.05, 'square', 0.07);
  tone(120, 0.07, 'square', 0.06, 0.04);
}

export function playDing() {
  tone(880, 0.14, 'sine', 0.14);
  tone(1318, 0.22, 'sine', 0.12, 0.1);
}

export function playBuzz() {
  tone(140, 0.22, 'sawtooth', 0.09);
  tone(110, 0.22, 'sawtooth', 0.08, 0.08);
}

export function playSizzleStart() {
  const ctx = ensureContext();
  if (!ctx || sizzleNodes) return;
  try {
    const len = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    sizzleNodes = { src, gain };
  } catch (e) {
    sizzleNodes = null;
  }
}

export function playSizzleStop() {
  if (!sizzleNodes) return;
  try {
    sizzleNodes.gain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
    sizzleNodes.src.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    /* ignore */
  }
  sizzleNodes = null;
}
