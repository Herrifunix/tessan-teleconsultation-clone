#!/usr/bin/env node
// Vérifie docs/checklist.json : échoue si une entrée est "fail", si une preuve est vide,
// ou si un fichier cité comme preuve n'existe pas. Affiche les totaux pass/fail.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'docs/checklist.json');
const entries = JSON.parse(readFileSync(file, 'utf8'));

// Un chemin cité = un token qui commence par un dossier du projet ou un fichier racine connu.
const PATH_RE =
  /(?:^|[\s(`'"«,;])((?:docs|tools|tests|src|public|\.github)\/[\w\-./@%+]+|(?:README\.md|package\.json|package-lock\.json|\.nvmrc|index\.html|vite\.config\.ts|playwright\.config\.ts|vercel\.json|eslint\.config\.js|tsconfig\.json))/g;

const problems = [];
let pass = 0;
let fail = 0;
const ids = new Set();

for (const e of entries) {
  if (!e.id || !e.exigence || !('statut' in e) || !('preuve' in e)) {
    problems.push(`${e.id ?? '?'} : entrée mal formée`);
    fail++;
    continue;
  }
  if (ids.has(e.id)) problems.push(`${e.id} : identifiant dupliqué`);
  ids.add(e.id);

  const errs = [];
  if (e.statut !== 'pass') errs.push(`statut "${e.statut}"`);
  const preuve = String(e.preuve ?? '').trim();
  if (!preuve) errs.push('preuve vide');
  for (const m of preuve.matchAll(PATH_RE)) {
    const p = m[1].replace(/[.,;:)]+$/, '').split('#')[0];
    if (!existsSync(resolve(root, p))) errs.push(`fichier cité introuvable : ${p}`);
  }
  if (errs.length) {
    fail++;
    problems.push(`${e.id} — ${errs.join(' ; ')}`);
  } else {
    pass++;
  }
}

for (const p of problems) console.log(`✗ ${p}`);
console.log(`\nChecklist : ${pass} pass / ${fail} fail (total ${entries.length})`);
process.exit(fail > 0 || problems.length > 0 ? 1 : 0);
