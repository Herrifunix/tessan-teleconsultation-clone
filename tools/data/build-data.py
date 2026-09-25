#!/usr/bin/env python3
"""Écrit l'échantillon dans src/data/ :
 - locations.json : lignes brutes de la table Supabase `gmb_locations` (format identique à l'original)
 - pharmacy-extras.json : compléments servis par /api/pharmacies/<code> (description, images,
   nomEtablissement) et /api/can-reserve/<id_technique> (canBook), indexés par code_magasin.
Sources (non commitées, 11 Mo) : /tmp/claude-0/data/all.json, extras.json, sample-ids.json."""
import json
rows = {r['code_magasin']: r for r in json.load(open('/tmp/claude-0/data/all.json'))}
ids = json.load(open('/tmp/claude-0/data/sample-ids.json'))
extras = json.load(open('/tmp/claude-0/data/extras.json'))
sample = [rows[i['code_magasin']] for i in ids]
sample.sort(key=lambda r: r['nom_etablissement'] or '')  # même ordre que la requête Supabase (order=nom_etablissement.asc)
json.dump(sample, open('src/data/locations.json', 'w'), ensure_ascii=False, indent=1)
json.dump({k: extras[k] for k in [i['code_magasin'] for i in ids]}, open('src/data/pharmacy-extras.json', 'w'), ensure_ascii=False, indent=1)
json.dump(ids, open('src/data/sample-selection.json', 'w'), ensure_ascii=False, indent=1)
villes = sorted({r['ville'] for r in sample})
print(len(sample), 'lignes,', len(villes), 'villes')
