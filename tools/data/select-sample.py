#!/usr/bin/env python3
"""Sélection reproductible de l'échantillon de points de vente (≤ 60) depuis le jeu complet
extrait du trafic réseau de l'original (/tmp/claude-0/data/all.json, non commité : 11 Mo).
Écrit /tmp/claude-0/data/sample-ids.json (liste ordonnée de code_magasin + raison)."""
import json, math, unicodedata
rows = json.load(open('/tmp/claude-0/data/all.json'))
rows = [r for r in rows if r['statut'] == 'Open' and r['pays'] == 'FR' and r['latitude'] is not None and r['longitude'] is not None]
def norm(s): return unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()
def hav(a, b, c, d):
    R = 6371; p = math.pi / 180
    x = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 2 * R * math.atan2(math.sqrt(x), math.sqrt(1 - x))
def near(lat, lng, n, exclude=()):
    return sorted([r for r in rows if r['code_magasin'] not in exclude], key=lambda r: hav(lat, lng, r['latitude'], r['longitude']))[:n]
picked = {}
def add(r, why):
    if r['code_magasin'] not in picked: picked[r['code_magasin']] = why
def city(name): return [r for r in rows if norm(r['ville']) == norm(name)]

# Nice : les 5 de la ville + les 6 plus proches de la fiche 557 (reproduit « à proximité »)
for r in city('Nice'): add(r, 'Nice')
s557 = next(r for r in rows if r['code_magasin'] == '557')
for r in near(s557['latitude'], s557['longitude'], 7): add(r, 'Nice-voisins-fiche-557')
# Paris : 7 plus proches du centre (48.8566, 2.3522)
for r in near(48.8566, 2.3522, 7): add(r, 'Paris')
for r in city('Lyon')[:5]: add(r, 'Lyon')
for r in sorted(city('Marseille'), key=lambda r: r['code_postal'])[:5]: add(r, 'Marseille')
# Choisy-le-Roi (aucun dispositif) : 4 plus proches du centre-ville (48.7633, 2.4094)
for r in near(48.7633, 2.4094, 4): add(r, 'Choisy-le-Roi-voisins')
# Franconville (1 seul) + ses 5 plus proches (règle « ≤ 3 résultats → +5 »)
f = city('Franconville')[0]; add(f, 'Franconville')
for r in near(f['latitude'], f['longitude'], 6): add(r, 'Franconville-voisins')
for r in city('Saint-Étienne')[:2]: add(r, 'Saint-Etienne (accents, nom long)')
long = next(r for r in rows if r['code_magasin'] == '330'); add(long, 'nom très long')
# Couverture départements / régions (≥ 10 de chaque pour garder des grilles de 10 cartes)
DEPTS = {'92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis', '78': 'Yvelines', '91': 'Essonne', '77': 'Seine-et-Marne',
         '60': 'Oise', '28': 'Eure-et-Loir', '27': 'Eure', '83': 'Var', '84': 'Vaucluse', '2B': 'Haute-Corse',
         # Départements listés « à proximité » de Nice par l'original (docs/reference/results-1440.png) : même grille, même retour à la ligne.
         '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes', '26': 'Drôme', '30': 'Gard', '38': 'Isère'}
for d, name in DEPTS.items():
    cand = [r for r in rows if (r['code_postal'] or '').startswith('20' if d == '2B' else d)]
    if d == '2B': cand = [r for r in cand if int(r['code_postal']) >= 20200]
    if not any(p for p in picked if next(x for x in rows if x['code_magasin'] == p)['code_postal'].startswith(d)):
        add(sorted(cand, key=lambda r: r['code_magasin'])[0], f'dept {name}')
for pref, reg in [('35', 'Bretagne'), ('44', 'Pays de la Loire'), ('67', 'Grand Est'), ('33', 'Nouvelle-Aquitaine'),
                  ('31', 'Occitanie'), ('21', 'Bourgogne-Franche-Comté')]:
    cand = sorted([r for r in rows if (r['code_postal'] or '').startswith(pref)], key=lambda r: r['code_magasin'])
    add(cand[0], f'région {reg}')
out = [{'code_magasin': k, 'raison': v} for k, v in picked.items()]
json.dump(out, open('/tmp/claude-0/data/sample-ids.json', 'w'), ensure_ascii=False, indent=1)
by = {}
for o in out: by.setdefault(o['raison'].split(' ')[0], 0); by[o['raison'].split(' ')[0]] += 1
print(len(out), by)
for o in out:
    r = next(x for x in rows if x['code_magasin'] == o['code_magasin'])
    print(o['code_magasin'], '|', r['nom_poi'], '|', r['code_postal'], r['ville'], '|', o['raison'])
