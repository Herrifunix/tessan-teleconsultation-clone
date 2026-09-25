import type { Pharmacy } from './data';
import { departmentNameOf, regionOf } from './geo';
import { buildPath, pharmacyPath, type Crumb } from './slug';

/** Fil d'Ariane géographique d'une pharmacie : région, département (omis s'il porte le nom de la ville), ville. */
export function crumbsFor(p: Pick<Pharmacy, 'codePostal' | 'ville'>): Crumb[] {
  const out: Crumb[] = [];
  const region = regionOf(p.codePostal);
  const dept = departmentNameOf(p.codePostal);
  if (region) out.push({ label: region, type: 'region' });
  if (dept && dept.toLowerCase() !== p.ville.toLowerCase()) out.push({ label: dept, type: 'departement' });
  if (p.ville) out.push({ label: p.ville, type: 'ville' });
  return out;
}
/** URL de fiche : /<région>/<département>/<ville>/<code_magasin>/<slug-du-nom> (format de l'original). */
export const pharmacyUrl = (p: Pharmacy) => pharmacyPath(buildPath(crumbsFor(p)), p.id, p.nom);
export const directionsUrl = (p: Pharmacy) => `https://www.google.com/maps/dir/?api=1&destination=${p.coordonnees.lat},${p.coordonnees.lng}`;
