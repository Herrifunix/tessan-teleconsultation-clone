import { useEffect } from 'react';
import { DEPARTMENTS, REGIONS } from './geo';
import { matchLabel, parsePath } from './slug';
import { specialtyBySlug } from './specialties';

const HOME_TITLE = 'Trouvez le dispositif de téléconsultation Tessan';
const cap = (slug: string) => slug.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join('-');
const nameOf = (seg: string) => matchLabel(seg, DEPARTMENTS) ?? matchLabel(seg, REGIONS);

/** Titre de page calculé depuis l'URL, comme les métadonnées serveur de l'original
 *  (ex. « Téléconsultation à Nice (france-FR) - Tessan », « Dermatologue - Téléconsultation Dermatologue à Nice (Alpes-Maritimes) - Tessan »). */
export function titleForPath(pathname: string): string {
  if (pathname === '/') return HOME_TITLE;
  const { specialtySlug, segments } = parsePath(pathname);
  const sp = specialtySlug ? specialtyBySlug(specialtySlug) : null;
  const segs = segments[segments.length - 1] === 'results' ? segments.slice(0, -1) : segments;
  let place = '';
  if (segs.length) {
    const last = segs[segs.length - 1];
    const lastName = segs.length === 1 ? nameOf(last) : null;
    place = lastName ?? cap(last);
    if (segs.length > 1) {
      const ctx = segs[segs.length - 2];
      place += ` (${nameOf(ctx) ?? ctx})`;
    }
  }
  if (sp) return place ? `${sp.label} - Téléconsultation ${sp.label} à ${place} - Tessan` : `${sp.label} - Téléconsultation ${sp.label} - Tessan`;
  return place ? `Téléconsultation à ${place} - Tessan` : HOME_TITLE;
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
