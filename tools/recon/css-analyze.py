#!/usr/bin/env python3
"""Analyse des feuilles de style originales -> docs/research/css-analysis.json
Extrait : variables du thème Tailwind, variables personnalisées (:root), @font-face, @media,
règles :hover/:focus/transition, et styles de base (body, h1..h6)."""
import re, json, glob
out = {}
src = 'docs/research/css/323d88a92ac6be07.css'
s = open(src).read()
out['source'] = src
out['tailwind_version'] = re.search(r'tailwindcss v([\d.]+)', s).group(1)
theme = re.search(r'@layer theme\{:host,:root\{(.*?)\}\}', s, re.S).group(1)
out['theme_vars'] = dict(re.findall(r'(--[\w-]+):([^;]+)', theme))
# :root hors @layer theme (variables shadcn / tessan)
roots = {}
for m in re.finditer(r'(?<![\w-]):root\{([^{}]*)\}', s):
    roots.update(dict(re.findall(r'(--[\w-]+):([^;]+)', m.group(1))))
out['root_vars'] = roots
out['font_faces'] = [dict(re.findall(r'([\w-]+):([^;]+)', f)) for f in re.findall(r'@font-face\{([^}]*)\}', s)]
out['media'] = sorted(set(re.findall(r'@media ?([^{]+)\{', s)))
base = re.search(r'@layer base\{(.*?)\}@layer components', s, re.S)
out['base_layer'] = base.group(1)[:6000] if base else None
states = []
for m in re.finditer(r'([^{}]*(?:hover|focus|active|disabled|group-hover|placeholder)[^{}]*)\{([^{}]*)\}', s):
    sel = m.group(1).strip()
    if sel.startswith('@'): continue
    states.append({'selector': sel[-160:], 'decl': m.group(2)[:300]})
out['state_rules'] = states
out['transitions'] = sorted(set(re.findall(r'\.(transition[\w-]*)\{([^}]*)\}', s)))
out['keyframes'] = re.findall(r'@keyframes [\w-]+\{.*?\}\}', s)
json.dump(out, open('docs/research/css-analysis.json', 'w'), ensure_ascii=False, indent=1)
print('theme vars', len(out['theme_vars']), '| root vars', len(roots), '| font-faces', len(out['font_faces']), '| state rules', len(states))
print('media', out['media'])
print(json.dumps(roots, indent=0, ensure_ascii=False)[:3000])
