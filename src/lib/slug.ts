import { isSpecialtySlug } from './specialties';

/** Minuscules, sans accents, séparateurs normalisés en tirets (identique à l'original). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Retrouve le libellé dont le slug correspond au segment d'URL. */
export function matchLabel(segment: string, labels: string[]): string | null {
  const s = slugify(segment);
  return labels.find((l) => slugify(l) === s) ?? null;
}

export type Crumb = { label: string; type: 'region' | 'departement' | 'ville' | 'postalCode' };

/** Construit le chemin /[specialite]/region/departement/ville à partir des éléments du fil d'Ariane. */
export function buildPath(crumbs: Crumb[], specialtySlug?: string | null): string {
  const parts = crumbs.map((c) => slugify(c.label));
  if (specialtySlug) return parts.length ? `/${specialtySlug}/${parts.join('/')}` : `/${specialtySlug}`;
  return parts.length ? `/${parts.join('/')}` : '/';
}

export function parsePath(pathname: string): { specialtySlug: string | null; segments: string[] } {
  const segs = pathname === '/' ? [] : pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s));
  if (segs.length && isSpecialtySlug(segs[0])) return { specialtySlug: segs[0], segments: segs.slice(1) };
  return { specialtySlug: null, segments: segs };
}

/** Identifiant de fiche : avant-dernier segment numérique (…/557/slug) ou /pharmacie/557. */
export function pharmacyIdFromPath(pathname: string): number | null {
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length < 2) return null;
  const last = segs[segs.length - 1];
  const prev = segs[segs.length - 2];
  if (/^\d+$/.test(prev)) return Number(prev);
  if (prev === 'pharmacie' && /^\d+$/.test(last)) return Number(last);
  return null;
}

export const pharmacyPath = (base: string, id: number, name: string) => `${base}/${id}/${slugify(name)}`;
