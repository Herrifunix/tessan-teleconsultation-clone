import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Breadcrumb, type BreadcrumbItem } from '../components/Breadcrumb';
import { NearbyAreas } from '../components/NearbyAreas';
import { ResultsSection } from '../components/ResultsSection';
import { SearchForm } from '../components/SearchForm';
import { ensureMinimum, loadPharmacies, nearest, sortByDistance, type Pharmacy } from '../lib/data';
import { DEPARTMENTS, REGIONS, departmentNameOf, haversineKm, regionOf, type LatLng } from '../lib/geo';
import { buildPath, matchLabel, parsePath, type Crumb } from '../lib/slug';
import { filterBySpecialty, specialtyByLabel, specialtyBySlug } from '../lib/specialties';
import type { SearchOutput } from '../lib/search';
import { useDocumentTitle, titleForPath, descriptionForPath } from '../lib/title';
import { scrollToTop } from '../lib/scroll';

type View = {
  mode: 'home' | 'results';
  results: Pharmacy[];
  query: string;
  specialty: string;
  coords: LatLng | null;
};
/** État transmis par une recherche (équivalent du sessionStorage « navigationFromSearch » de l'original). */
export type NavState = { fromSearch?: { results: Pharmacy[]; query: string; specialty: string; coords: LatLng | null } };

/** Résout une URL de localisation comme l'original (catch-all Next.js). */
function resolve(pathname: string, all: Pharmacy[]): View {
  if (pathname === '/') return { mode: 'home', results: all, query: '', specialty: '', coords: null };
  const { specialtySlug, segments } = parsePath(pathname);
  const sp = specialtySlug ? specialtyBySlug(specialtySlug) : null;
  if (sp && segments.length === 0) return { mode: 'results', results: filterBySpecialty(all, sp.label), query: '', specialty: sp.label, coords: null };
  let list = all;
  let label = '';
  const last = segments[segments.length - 1];
  if (last && /^\d{5}$/.test(last)) {
    label = last;
    list = all.filter((p) => p.codePostal === last);
  } else {
    const cities = all.map((p) => p.ville).filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      const s = segments[i];
      const city = matchLabel(s, cities);
      if (city) { label = city; list = all.filter((p) => p.ville.toLowerCase() === city.toLowerCase()); break; }
      const dept = matchLabel(s, DEPARTMENTS);
      if (dept) { label = dept; list = all.filter((p) => departmentNameOf(p.codePostal) === dept); break; }
      const reg = matchLabel(s, REGIONS);
      if (reg) { label = reg; list = all.filter((p) => regionOf(p.codePostal) === reg); break; }
    }
  }
  if (!label || !list.length) return { mode: 'home', results: all, query: '', specialty: '', coords: null };
  const coords = list[0].coordonnees;
  list = ensureMinimum(sortByDistance(list, coords), all, coords);
  if (sp) list = filterBySpecialty(list, sp.label);
  return { mode: 'results', results: list, query: label, specialty: sp?.label ?? '', coords };
}

/** Fil d'Ariane de la page de résultats (mêmes règles que l'original). */
function crumbsFromQuery(query: string, first: Pharmacy | undefined): Crumb[] {
  const q = query.split(',')[0].trim();
  const cp = first?.codePostal ?? '';
  const region = regionOf(cp);
  const dept = departmentNameOf(cp);
  const out: Crumb[] = [];
  if (/^\d{5}$/.test(q)) {
    if (region) out.push({ label: region, type: 'region' });
    const ville = first?.ville;
    if (ville && dept && dept.toLowerCase() !== ville.toLowerCase()) { out.push({ label: dept, type: 'departement' }); out.push({ label: ville, type: 'ville' }); }
    else if (ville) out.push({ label: ville, type: 'ville' });
    else if (dept) out.push({ label: dept, type: 'departement' });
    out.push({ label: q, type: 'postalCode' });
  } else if (REGIONS.includes(q)) out.push({ label: q, type: 'region' });
  else if (DEPARTMENTS.includes(q)) { if (region) out.push({ label: region, type: 'region' }); out.push({ label: q, type: 'departement' }); }
  else {
    if (region) out.push({ label: region, type: 'region' });
    if (dept && dept.toLowerCase() !== q.toLowerCase()) out.push({ label: dept, type: 'departement' });
    if (q) out.push({ label: q, type: 'ville' });
  }
  return out;
}

// Rechargement de la page : l'original relit l'URL, car il supprime ses clés sessionStorage après les avoir lues.
// Équivalent : les entrées d'historique dont l'état de recherche a déjà été lu sont notées en sessionStorage ;
// au chargement suivant (F5), leur état est ignoré et la vue est recalculée depuis l'URL.
const CONSUMED_KEY = 'tc-search-consumed';
const CONSUMED_AT_LOAD: ReadonlySet<string> = (() => {
  try { return new Set<string>(JSON.parse(sessionStorage.getItem(CONSUMED_KEY) || '[]')); } catch { return new Set<string>(); }
})();
function markConsumed(key: string) {
  try {
    const list: string[] = JSON.parse(sessionStorage.getItem(CONSUMED_KEY) || '[]');
    if (!list.includes(key)) sessionStorage.setItem(CONSUMED_KEY, JSON.stringify([...list, key].slice(-50)));
  } catch { /* stockage indisponible : comportement par défaut */ }
}
const searchState = (location: { key: string; state: unknown }) =>
  CONSUMED_AT_LOAD.has(location.key) ? undefined : (location.state as NavState | null)?.fromSearch;

export function LocationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [all, setAll] = useState<Pharmacy[] | null>(null);
  const [override, setOverride] = useState<{ key: string; view: View } | null>(null);
  const [error, setError] = useState(false);
  useDocumentTitle(titleForPath(location.pathname), descriptionForPath(location.pathname));

  useEffect(() => {
    loadPharmacies().then(setAll, () => setError(true));
  }, []);

  const view: View | null = useMemo(() => {
    if (!all) return null;
    if (override && override.key === location.key) return override.view;
    const st = searchState(location);
    if (st) { markConsumed(location.key); return { mode: 'results', results: st.results, query: st.query, specialty: st.specialty, coords: st.coords }; }
    return resolve(location.pathname, all);
  }, [all, location, override]);

  // Soumission du formulaire : même logique de navigation que l'original (fonction R).
  const onSearchSubmit = (out: SearchOutput) => {
    const sp = out.specialtyLabel ? specialtyByLabel(out.specialtyLabel) : null;
    const slug = sp?.slug ?? null;
    if (!out.query && !out.specialtyLabel) { navigate('/'); scrollToTop(false); return; }
    if (!out.query && sp) {
      navigate(`/${sp.slug}`, { state: { fromSearch: { results: out.results, query: '', specialty: sp.label, coords: null } } satisfies NavState });
      return;
    }
    if (out.results.length > 0 && out.query) {
      const crumbs = crumbsFromQuery(out.query, out.results[0]);
      if (out.postalCode && !/^\d{5}$/.test(out.query.split(',')[0].trim())) crumbs.push({ label: out.postalCode, type: 'postalCode' });
      const path = buildPath(crumbs, slug);
      navigate(path, { state: { fromSearch: { results: out.results, query: out.query, specialty: out.specialtyLabel ?? '', coords: out.coords } } satisfies NavState });
      return;
    }
    // Aucun résultat : l'original reste sur la page et affiche « 0 dispositif … ».
    setOverride({ key: location.key, view: { mode: 'results', results: out.results, query: out.query, specialty: out.specialtyLabel ?? '', coords: out.coords } });
  };

  // Clic sur un département / une région à proximité (fonction T de l'original).
  const onAreaClick = (name: string) => {
    if (!all) return;
    const isRegion = REGIONS.includes(name);
    const list = isRegion ? all.filter((p) => regionOf(p.codePostal) === name) : all.filter((p) => departmentNameOf(p.codePostal) === name);
    if (!list.length) { window.alert(`Aucune pharmacie trouvée pour ${name}`); return; }
    const c = list[0].coordonnees;
    const results = ensureMinimum(sortByDistance(list, c), all, c);
    onSearchSubmit({ results, query: name, coords: c, postalCode: null });
    scrollToTop();
  };

  // Accueil : clic sur un marqueur → dispositifs à moins de 10 km (comportement de l'original).
  const onHomeMarkerClick = (p: Pharmacy) => {
    if (!all) return;
    const near = nearest(all.filter((x) => haversineKm(p.coordonnees, x.coordonnees) <= 10), p.coordonnees);
    onSearchSubmit({ results: near, query: p.ville || 'Autour du point sélectionné', coords: p.coordonnees, postalCode: null });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-lg text-gray-600">Les données sont momentanément indisponibles. Veuillez réessayer.</p>
      </div>
    );
  }
  if (!view || !all) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent" />
          <p className="mt-4 text-lg text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const specialtyId = view.specialty ? specialtyByLabel(view.specialty)?.id ?? null : null;
  // Vue issue d'une recherche (navigation ou résultat vide sur place) : le formulaire relance au changement de spécialité.
  const searched = !!searchState(location) || (!!override && override.key === location.key);
  if (view.mode === 'home') {
    return (
      <>
        <section className="p-6 bg-slate-50">
          <div className="max-w-page mx-auto">
            <h1 className="text-center text-2xl md:text-3xl text-gray-800 mb-8 mt-3 md:mt-5">
              Les dispositifs de téléconsultation Tessan <span className="text-tessan-green-hover">autour de vous</span>
            </h1>
            <h5 className="text-center md:text-xl text-gray-800 mb-8 font-sans">
              Tessan, c'est une <strong> téléconsultation augmentée par des dispositifs médicaux connectés </strong>(stéthoscope, thermomètre, tensiomètre, dermatoscope...) pour un examen fiable, accompagné sur place par un professionnel de santé. Plus de <strong> 500 médecins généralistes et spécialistes</strong>{'  '}– dermatologues, pédiatres, ophtalmologues et d'autres disciplines – vous prennent en charge dans plus de <strong> 1 600 pharmacies et lieux de santé </strong> partout en France. Il y a forcément une cabine ou une borne Tessan près de chez vous !
            </h5>
            <div className="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
              <SearchForm onSearchSubmit={onSearchSubmit} initialCity="" initialSpecialtyId={null} />
            </div>
          </div>
        </section>
        <ResultsSection results={all} showList={false} onMarkerClick={onHomeMarkerClick} />
        <NearbyAreas isHomepage onAreaClick={onAreaClick} />
      </>
    );
  }

  const spObj = view.specialty ? specialtyByLabel(view.specialty) : null;
  const items: BreadcrumbItem[] = [{ label: 'Trouver un dispositif de téléconsultation', onClick: () => { navigate('/'); scrollToTop(); } }];
  if (spObj) items.push(view.query && view.results.length > 0 ? { label: spObj.label, onClick: () => navigate(`/${spObj.slug}`) } : { label: spObj.label });
  else items.push({ label: 'Spécialités médicales' });
  if (view.query && view.results.length > 0) {
    const crumbs = crumbsFromQuery(view.query, view.results[0]);
    crumbs.forEach((c, i) => {
      const lastOne = i === crumbs.length - 1;
      items.push(lastOne ? { label: c.label } : { label: c.label, onClick: () => { navigate(buildPath(crumbs.slice(0, i + 1), spObj?.slug)); scrollToTop(); } });
    });
  }
  return (
    <>
      <section className="p-6 bg-slate-50">
        <div className="max-w-page mx-auto">
          <Breadcrumb items={items} />
          <h1 className="text-center text-3xl text-gray-800 mb-5">
            Les dispositifs de téléconsultation Tessan <span className="text-tessan-green-hover">autour de vous</span>
          </h1>
          <p className="text-center text-gray-600 mb-10">
            Tessan, c'est une téléconsultation augmentée par des dispositifs médicaux connectés (stéthoscope, thermomètre, tensiomètre, dermatoscope...) pour un examen fiable, accompagné sur place par un professionnel de santé.
          </p>
          <div className="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <SearchForm key={location.key} onSearchSubmit={onSearchSubmit} initialCity={view.query} initialSpecialtyId={specialtyId} initialSubmitted={searched} />
          </div>
        </div>
      </section>
      <ResultsSection results={view.results} />
      <NearbyAreas from={view.coords} isHomepage={false} onAreaClick={onAreaClick} />
    </>
  );
}
