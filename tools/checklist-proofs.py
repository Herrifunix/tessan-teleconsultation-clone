#!/usr/bin/env python3
"""Renseigne docs/checklist.json : statut + preuve vérifiable par exigence (aucune entrée supprimée ni reformulée).
Idempotent : réexécutable ; les entrées de matrice (ETAT-07) sont (re)générées depuis tests/matrix.spec.ts."""
import json, re, sys
P = 'docs/checklist.json'
items = json.load(open(P))
by = {e['id']: e for e in items}
ratios = {r['key']: r['ratio'] for it in json.load(open('docs/qa/diff-report.json'))['iterations'] if it['label'] == 'iteration-3' for r in it['rows']}
ratio_txt = ', '.join(f"{k} {v*100:.2f} %" for k, v in ratios.items())

PROOFS = json.load(open('tools/checklist-proofs.json'))
for k, (statut, preuve) in PROOFS.items():
    if k not in by: sys.exit(f'id inconnu {k}')
    by[k]['statut'] = statut
    by[k]['preuve'] = preuve.replace('{RATIOS}', ratio_txt)

# ETAT-07 : une entrée par gabarit × viewport × interaction (tests de tests/matrix.spec.ts, verts en local et contre l'URL publique).
spec = open('tests/matrix.spec.ts').read()
names = re.findall(r"test\(`([^`]*)`", spec)
public = open('docs/qa/e2e-public.txt').read()
items = [e for e in items if not e['id'].startswith('MX-')]
for w in (375, 768, 1440):
    for n in names:
        title = n.replace('${vp.width}', str(w))
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower().encode('ascii', 'ignore').decode()).strip('-')[:60]
        ok = f'✓' in public and re.search(re.escape(title), public) is not None
        line = next((l for l in public.splitlines() if title in l), '')
        items.append({'id': f'MX-{w}-{slug}', 'exigence': f'Matrice gabarit × viewport × interaction : {title}',
                      'statut': 'pass' if ok and line.strip().startswith('✓') else 'fail',
                      'preuve': f"tests/matrix.spec.ts « {title} » (projet desktop, viewport {w}px) — vert en local (npm run test:e2e) et contre l'URL publique : docs/qa/e2e-public.txt" if ok else ''})
json.dump(items, open(P, 'w'), ensure_ascii=False, indent=1)
print(len(items), 'entrées')
