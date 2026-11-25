// serve.ts — a tiny static server for the game, Node standard library only.
// Run `node serve.ts`, then open http://localhost:8080 in a desktop browser.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 8080;
const GAME_DIR = resolve(join(fileURLToPath(new URL('.', import.meta.url)), 'game'));

const MIME_BY_EXT: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function mimeFor(path: string): string {
  return MIME_BY_EXT[extname(path).toLowerCase()] ?? 'application/octet-stream';
}

function safeJoin(root: string, requestPath: string): string | null {
  const decoded = decodeURIComponent(requestPath);
  const joined = resolve(join(root, normalize(decoded)));
  if (joined !== root && !joined.startsWith(root + '/')) return null;
  return joined;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    let path = url.pathname;
    if (path === '/') path = '/index.html';
    const file = safeJoin(GAME_DIR, path);
    if (file === null) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Forbidden\n');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mimeFor(file) });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
  }
});

server.listen(PORT, () => {
  console.log(`Warung Rasa melayani di http://localhost:${PORT}`);
});
