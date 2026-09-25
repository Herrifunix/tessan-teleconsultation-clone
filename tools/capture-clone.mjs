#!/usr/bin/env node
// Capture le clone (build de production servi par `vite preview`) dans les mêmes conditions que la référence.
// Idempotent : réutilise un serveur déjà lancé sur le port 4173, sinon le démarre puis l'arrête.
import { spawn } from 'node:child_process';
import { capture } from './capture.mjs';

const BASE = process.env.CLONE_URL || 'http://localhost:4173';
const OUT = process.env.CLONE_OUT || 'docs/qa/clone';
const up = async () => { try { return (await fetch(BASE)).ok; } catch { return false; } };

let server = null;
if (!process.env.CLONE_URL && !(await up())) {
  server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 40 && !(await up()); i++) await new Promise((r) => setTimeout(r, 250));
}
try {
  const [tpls, ws] = process.argv.slice(2);
  await capture({ side: 'clone', baseUrl: BASE, outDir: OUT, templates: tpls ? tpls.split(',') : undefined, widths: ws ? ws.split(',') : undefined });
} finally {
  if (server) process.kill(-server.pid);
}
