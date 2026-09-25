// Logique de recherche (équivalent du formulaire de l'original, module 5915), indépendante de l'UI.
import { type Pharmacy, ensureMinimum, nearest } from './data';
import { DEPARTMENTS, REGIONS, departmentNameOf, regionOf, type LatLng } from './geo';
import { geocode, GeocodeTimeoutError, type GeocodeResult } from './geocode';
import { filterBySpecialty, specialtyById } from './specialties';

export const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'").replace(/[-_\s]+/g, ' ').trim();

/** Distance d'édition (Damerau restreinte) : l'inversion de deux lettres voisines (« Parsi ») compte pour une faute. */
function levenshtein(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export type Suggestion = { id: string; name: string; secondary: string; postcode: string; coords: LatLng | null; score: number };

/** Villes de l'échantillon correspondant à la saisie (préfixe, contenu, puis tolérance aux fautes). */
export function localSuggestions(all: Pharmacy[], input: string, limit = 5): Suggestion[] {
  const q = norm(input);
  if (!q) return [];
  const byCity = new Map<string, { name: string; postcode: string }>();
  for (const p of all) if (p.ville && !byCity.has(norm(p.ville))) byCity.set(norm(p.ville), { name: p.ville, postcode: p.codePostal });
  const out: Suggestion[] = [];
  for (const [n, c] of byCity) {
    let score = -1;
    if (n.startsWith(q)) score = 3;
    else if (n.split(' ').some((w) => w.startsWith(q))) score = 2;
    else if (q.length >= 4) {
      const d = levenshtein(q, n.slice(0, q.length));
      const dFull = levenshtein(q, n);
      if (Math.min(d, dFull) <= (q.length >= 7 ? 2 : 1)) score = 1;
    }
    if (/^\d{2,5}$/.test(q) && c.postcode.startsWith(q)) score = 3;
    if (score > 0) out.push({ id: `local-${n}`, name: c.name, secondary: 'France', postcode: c.postcode, coords: null, score });
  }
  return out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'fr')).slice(0, limit);
}

export const toSuggestion = (g: GeocodeResult): Suggestion => ({
  id: `api-${g.label}-${g.postcode}`,
  name: g.city,
  secondary: 'France',
  postcode: g.postcode,
  coords: g.coords,
  score: 0,
});

/** Correspondance ville (ilike de l'original, tolérante aux accents) : repli quand le géocodage échoue. */
export const cityMatch = (all: Pharmacy[], q: string) => {
  const t = q.trim();
  // Code postal saisi : même repli local que pour un nom de ville.
  if (/^\d{5}$/.test(t)) return all.filter((p) => p.codePostal === t);
  return all.filter((p) => norm(p.ville).includes(norm(t)));
};

export type SearchInput = { text: string; coords: LatLng | null; postalCode: string | null; specialtyId: string | null };
export type SearchOutput = { results: Pharmacy[]; query: string; specialtyLabel?: string; coords: LatLng | null; postalCode: string | null };

export const MSG_TIMEOUT = 'Le service de recherche d’adresses ne répond pas. Veuillez réessayer.';
export const MSG_UNAVAILABLE = 'Le service de recherche d’adresses est indisponible. Veuillez réessayer.';
export class SearchMessageError extends Error {}

/** Exécute la recherche comme l'original : région/département, point géocodé (20 plus proches), ville, ou tout. */
export async function runSearch(all: Pharmacy[], input: SearchInput, geocodeCache: Map<string, LatLng>): Promise<SearchOutput> {
  // Saisie réduite à des espaces = champ vide (l'original affiche alors tout et revient à l'accueil).
  const text = input.text.trim();
  let coords = text.trim() ? input.coords : null;
  const first = text.split(',')[0].trim();
  const isRegion = REGIONS.some((r) => r.toLowerCase() === first.toLowerCase());
  const isDept = DEPARTMENTS.some((d) => d.toLowerCase() === first.toLowerCase());
  let results: Pharmacy[];
  if (isRegion || isDept) {
    results = all.filter((p) => (isRegion ? regionOf(p.codePostal) : departmentNameOf(p.codePostal)).toLowerCase() === first.toLowerCase());
    const cached = geocodeCache.get(first);
    if (cached) coords = cached;
    else {
      try {
        const g = await geocode(`${first}, France`, { limit: 1 });
        if (g[0]) { coords = g[0].coords; geocodeCache.set(first, coords); }
      } catch { /* géocodage facultatif ici */ }
    }
  } else if (coords) {
    results = nearest(all, coords).slice(0, 20);
  } else if (text.trim()) {
    const q = text.includes(',') ? text.split(',')[0].trim() : text;
    try {
      // Commune d'abord (comme la prédiction Google « (cities) »), puis adresse quelconque : « St-Etienne » ne doit pas
      // tomber sur un lieu-dit homonyme.
      let g = await geocode(q, { limit: 1, type: 'municipality' });
      if (!g[0]) g = await geocode(q, { limit: 1 });
      if (g[0]) { coords = g[0].coords; results = nearest(all, coords).slice(0, 20); }
      else results = cityMatch(all, q);
    } catch (e) {
      results = cityMatch(all, q);
      if (!results.length) throw new SearchMessageError(e instanceof GeocodeTimeoutError ? MSG_TIMEOUT : MSG_UNAVAILABLE);
    }
  } else {
    coords = null;
    results = all;
  }
  if (input.postalCode) results = results.filter((p) => p.codePostal === input.postalCode);
  const sp = input.specialtyId ? specialtyById(input.specialtyId) : null;
  if (sp) results = filterBySpecialty(results, sp.label);
  if (coords) results = ensureMinimum(results, all, coords);
  return { results, query: text, specialtyLabel: sp?.label, coords, postalCode: input.postalCode };
}
