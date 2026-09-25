#!/usr/bin/env python3
"""Génère les instances statiques « TC Serif » (dérivées de Fraunces, SIL OFL 1.1) qui remplacent
Recoleta (police commerciale © Latinotype, non redistribuable). Réglages issus de la recherche
systématique documentée dans docs/DECISIONS.md (opsz 9, SOFT 100, WONK 0 ; graisse Fraunces choisie
pour égaler la densité d'encre de Recoleta à chaque graisse).
Prérequis : pip install fonttools==4.60.1 brotli==1.1.0 ; npm ci (fournit @fontsource-variable/fraunces).
Usage : python3 tools/fonts/build-serif.py"""
import io
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'node_modules/@fontsource-variable/fraunces/files/fraunces-{subset}-full-normal.woff2'
# graisse CSS demandée (Recoleta) -> graisse Fraunces équivalente
WEIGHTS = {400: 375, 500: 475, 600: 575, 700: 675}
for subset in ('latin', 'latin-ext'):
    for css_w, fr_w in WEIGHTS.items():
        f = TTFont(SRC.format(subset=subset))
        inst = instancer.instantiateVariableFont(f, {'wght': fr_w, 'opsz': 9, 'SOFT': 100, 'WONK': 0})
        name = inst['name']
        for rec in list(name.names):
            if rec.nameID in (1, 4, 16):
                name.setName('TC Serif', rec.nameID, rec.platformID, rec.platEncID, rec.langID)
            if rec.nameID in (3, 6):
                name.setName(f'TCSerif-{css_w}', rec.nameID, rec.platformID, rec.platEncID, rec.langID)
            if rec.nameID in (2, 17):
                name.setName('Regular', rec.nameID, rec.platformID, rec.platEncID, rec.langID)
        inst['OS/2'].usWeightClass = css_w
        inst.flavor = 'woff2'
        out = f'public/fonts/tc-serif-{css_w}-{subset}.woff2'
        inst.save(out)
        print(out)
