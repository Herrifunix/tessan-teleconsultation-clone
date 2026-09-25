export type Specialty = { id: string; slug: string; label: string; specialisations: string[] };

// Spécialités proposées par le menu « Spécialités médicales » (mêmes libellés, slugs et catégories que l'original).
export const SPECIALTIES: Specialty[] = [
  { id: 'medecine-generaliste', slug: 'medecins-generalistes', label: 'Généraliste', specialisations: ['Médecin généraliste'] },
  { id: 'dermatologie', slug: 'dermatologues', label: 'Dermatologue', specialisations: ['Dermatologue', 'Dermatologiste', 'Dermatologue pédiatrique', 'Allergologue'] },
  { id: 'pediatrie', slug: 'pediatres', label: 'Pédiatre', specialisations: ['Pédiatre', 'Pediatrician'] },
  { id: 'ophtalmologie', slug: 'ophtalmologistes', label: 'Ophtalmologue', specialisations: ['Ophtalmologiste', 'Ophtalmologiste pédiatrique', 'Orthoptiste'] },
  { id: 'geriatrie', slug: 'geriatres', label: 'Gériatre', specialisations: ['Gériatre', 'Gériatre pédiatrique'] },
  { id: 'pneumologie', slug: 'pneumologues', label: 'Pneumologue', specialisations: ['Pneumologue', 'Pneumologue pédiatrique', 'pneumologist', 'Pneumologie'] },
];

export const specialtyBySlug = (slug: string) => SPECIALTIES.find((s) => s.slug === slug) ?? null;
export const specialtyByLabel = (label: string) => SPECIALTIES.find((s) => s.label === label) ?? null;
export const specialtyById = (id: string) => SPECIALTIES.find((s) => s.id === id) ?? null;
export const isSpecialtySlug = (slug: string) => SPECIALTIES.some((s) => s.slug === slug);

/** Filtre les pharmacies proposant une spécialité (par libellé ou slug). */
export function filterBySpecialty<T extends { services: string[] }>(list: T[], labelOrSlug: string): T[] {
  const sp = specialtyByLabel(labelOrSlug) ?? specialtyBySlug(labelOrSlug);
  if (!sp) return list;
  return list.filter((p) => p.services.length > 0 && p.services.some((s) => sp.specialisations.includes(s)));
}
