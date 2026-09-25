import locationsUrl from '../data/locations.json?url';
import extrasUrl from '../data/pharmacy-extras.json?url';
import { haversineKm, type LatLng } from './geo';
import type { Hours } from './hours';

/** Ligne brute de la table Supabase `gmb_locations` (format de l'original). */
export type LocationRow = {
  code_magasin: string; statut: string; nom_etablissement: string | null; nom_poi: string | null;
  categorie_principale: string | null; categorie_secondaire_1: string | null; categorie_secondaire_2: string | null;
  categorie_secondaire_3: string | null; categorie_secondaire_4: string | null; categorie_secondaire_5: string | null;
  categorie_secondaire_6: string | null; adresse: string | null; code_postal: string | null; ville: string | null;
  pays: string | null; latitude: number | null; longitude: number | null; telephone: string | null;
  url_site_web: string | null; contact_email: string | null; description_longue: string | null; id_technique: string | null;
  horaires_tc_lundi: string | null; horaires_tc_mardi: string | null; horaires_tc_mercredi: string | null;
  horaires_tc_jeudi: string | null; horaires_tc_vendredi: string | null; horaires_tc_samedi: string | null;
  horaires_tc_dimanche: string | null;
};
export type Extras = { images: string[] | null; description: string | null; nomEtablissement: string | null; canBook: boolean };

/** Pharmacie normalisée (même forme que l'objet utilisé par l'original). */
export type Pharmacy = {
  id: number; nom: string; adresse: string; ville: string; codePostal: string; telephone: string;
  coordonnees: LatLng; horaires: Hours; services: string[]; codeMagasin: string; idTechnique: string;
  description: string; images: string[]; nomEtablissement: string; canBook: boolean; pays: string;
  distance: string | null; distanceNum?: number;
};

const FERME = 'Fermé';
export function normalize(r: LocationRow, x?: Extras): Pharmacy {
  const services = [r.categorie_principale, r.categorie_secondaire_1, r.categorie_secondaire_2, r.categorie_secondaire_3,
    r.categorie_secondaire_4, r.categorie_secondaire_5, r.categorie_secondaire_6].filter((s): s is string => !!s);
  if (!services.length) services.push('Téléconsultation Tessan');
  return {
    id: parseInt(r.code_magasin, 10) || 0,
    nom: r.nom_poi || r.nom_etablissement || 'Sans nom',
    adresse: r.adresse || '', ville: r.ville || '', codePostal: r.code_postal || '', telephone: r.telephone || '',
    coordonnees: { lat: r.latitude || 0, lng: r.longitude || 0 },
    horaires: {
      lundi: r.horaires_tc_lundi || FERME, mardi: r.horaires_tc_mardi || FERME, mercredi: r.horaires_tc_mercredi || FERME,
      jeudi: r.horaires_tc_jeudi || FERME, vendredi: r.horaires_tc_vendredi || FERME, samedi: r.horaires_tc_samedi || FERME,
      dimanche: r.horaires_tc_dimanche || FERME,
    },
    services, codeMagasin: r.code_magasin, idTechnique: r.id_technique || '',
    description: x?.description ?? r.description_longue ?? '', images: x?.images ?? [],
    nomEtablissement: x?.nomEtablissement ?? r.nom_etablissement ?? '', canBook: x?.canBook ?? false,
    pays: r.pays || '', distance: null,
  };
}

let cache: Promise<Pharmacy[]> | null = null;
/** Charge l'échantillon (équivalent de la requête Supabase paginée de l'original). */
/** Requête JSON avec 2 nouvelles tentatives (0,5 s puis 1 s) sur erreur réseau ou 5xx transitoire. */
async function fetchJson<T>(url: string, attempts = 3): Promise<T> {
  for (let i = 0; ; i++) {
    let r: Response | null = null;
    try {
      r = await fetch(url);
    } catch (e) {
      if (i >= attempts - 1) throw e; // erreur réseau : nouvelle tentative
    }
    if (r?.ok) return (await r.json()) as T;
    if (r && (r.status < 500 || i >= attempts - 1)) throw new Error(`HTTP ${r.status}`);
    await new Promise((res) => setTimeout(res, 500 * (i + 1)));
  }
}

export function loadPharmacies(): Promise<Pharmacy[]> {
  cache ??= Promise.all([fetchJson<LocationRow[]>(locationsUrl), fetchJson<Record<string, Extras>>(extrasUrl)])
    .then(([rows, extras]) => {
      return rows
        .filter((r) => r.statut === 'Open' || r.statut == null)
        .map((r) => normalize(r, extras[r.code_magasin]));
    })
    .catch((e) => {
      cache = null;
      throw e;
    });
  return cache;
}

/** Distance formatée « x.x km » et tri croissant (fonction FD de l'original). */
export function sortByDistance(list: Pharmacy[], from: LatLng): Pharmacy[] {
  return list
    .map((p) => {
      const d = haversineKm(from, p.coordonnees);
      return { ...p, distance: `${d.toFixed(1)} km`, distanceNum: d };
    })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

/** Toutes les pharmacies triées par distance (fonction _Q), éventuellement limitées à un rayon. */
export function nearest(all: Pharmacy[], from: LatLng, radiusKm = Infinity): Pharmacy[] {
  return sortByDistance(all, from).filter((p) => (p.distanceNum ?? 0) <= radiusKm);
}

/** Règle du minimum de résultats (X$) : au plus 3 résultats → ajoute les 5 plus proches manquants. */
export function ensureMinimum(results: Pharmacy[], all: Pharmacy[], from: LatLng): Pharmacy[] {
  if (results.length > 3) return results;
  const ids = new Set(results.map((p) => p.id));
  return [...results, ...nearest(all, from).filter((p) => !ids.has(p.id)).slice(0, 5)];
}
