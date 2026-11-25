// main.ts — hands the Warung Rasa game in: copies game/ and screenshots/ from
// this repository into the output directory and writes dossier.json there with
// buildDossier from vendor/makefun-game.ts. Node 22 standard library only.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function resolvePaths(): { repoRoot: string; outputDir: string } {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  return { repoRoot: REPO_ROOT, outputDir: resolve(outputDir) };
}

function logStep(step: string, detail = ''): void {
  console.log(`[warung-rasa] ${step}${detail ? ` — ${detail}` : ''}`);
}

function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function copyGameFiles(repoRoot: string, outputDir: string): void {
  mkdirSync(outputDir, { recursive: true });
  for (const name of ['game', 'screenshots']) {
    const source = join(repoRoot, name);
    if (!existsSync(source)) throw new Error(`main.ts: missing ${name}/ in the repository`);
    const target = join(outputDir, name);
    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
    logStep(`copied ${name}/`, `${countFiles(target)} files -> ${target}`);
  }
  const indexHtml = join(outputDir, 'game', 'index.html');
  if (!existsSync(indexHtml)) throw new Error('main.ts: game/index.html missing after copy');
}

function writeDossier(outputDir: string): void {
  const bytes = buildDossier(outputDir, DOSSIER_CAPS);
  const dossierPath = join(outputDir, 'dossier.json');
  writeFileSync(dossierPath, bytes);
  logStep('wrote dossier.json', `${bytes.length} bytes`);
}

function main(): void {
  const { repoRoot, outputDir } = resolvePaths();
  logStep('handing in Warung Rasa', `output ${outputDir}`);
  copyGameFiles(repoRoot, outputDir);
  writeDossier(outputDir);
  logStep('done');
}

main();
