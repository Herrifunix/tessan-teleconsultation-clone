import { CalendarDays, ChevronLeft, ChevronRight, Clock, LoaderCircle, Navigation, Phone, Search } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BookingModal } from '../components/BookingModal';
import { Breadcrumb, type BreadcrumbItem } from '../components/Breadcrumb';
import { MapView } from '../components/map/MapView';
import { NearbyAreas } from '../components/NearbyAreas';
import { PharmacyCard } from '../components/PharmacyCard';
import { SearchForm } from '../components/SearchForm';
import { loadPharmacies, nearest, type Pharmacy } from '../lib/data';
import { parseDescription, type Inline } from '../lib/description';
import { departmentCode, DEPARTMENTS, REGIONS, departmentNameOf, regionOf } from '../lib/geo';
import { DAY_LABEL, openingStatus, parisDay, WEEK_FROM_MONDAY } from '../lib/hours';
import { crumbsFor, directionsUrl, pharmacyUrl } from '../lib/routes';
import { buildPath, pharmacyIdFromPath, type Crumb } from '../lib/slug';
import { specialtyByLabel } from '../lib/specialties';
import type { SearchOutput } from '../lib/search';
import { useDocumentTitle } from '../lib/title';
import { useNow } from '../lib/useNow';
import type { NavState } from './LocationPage';

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) => {
        let node: React.ReactNode = p.text;
        if (p.italic) node = <i>{node}</i>;
        if (p.bold) node = <b>{node}</b>;
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}

/** Description + carrousel photo (images préchargées, les images en erreur sont écartées). */
function Description({ description, images }: { description: string; images: string[] }) {
  const [ok, setOk] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    let alive = true;
    if (!images.length) return;
    Promise.all(images.map((src) => new Promise<string | null>((res) => { const img = new Image(); img.onload = () => res(src); img.onerror = () => res(null); img.src = src; })))
      .then((r) => { if (alive) { setOk(r.filter((x): x is string => !!x)); setIdx(0); } });
    return () => { alive = false; };
  }, [images]);
  const nodes = useMemo(() => parseDescription(description), [description]);
  if (!description) return null;
  const many = ok.length > 1;
  return (
    <div className="overflow-hidden">
      {ok.length > 0 && (
        <div className="float-right ml-6 mb-4 relative w-1/2">
          <img src={ok[idx]} alt="Photo du dispositif Tessan" className="rounded-lg shadow-md w-full h-auto max-h-150 object-contain" />
          {many && (
            <>
              <button type="button" onClick={() => setIdx((i) => (i === 0 ? ok.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all" aria-label="Image précédente">
                <ChevronLeft size={24} className="text-gray-800" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setIdx((i) => (i === ok.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all" aria-label="Image suivante">
                <ChevronRight size={24} className="text-gray-800" aria-hidden="true" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm" aria-live="polite">
                {idx + 1} / {ok.length}
              </div>
            </>
          )}
        </div>
      )}
      <div className="text-gray-700 leading-relaxed space-y-3 max-w-none">
        {nodes.map((n, i) =>
          n.kind === 'br' ? <br key={i} /> : n.kind === 'text' ? <Inlines key={i} parts={n.parts} /> : (
            <ul key={i} className="list-disc list-inside my-2 space-y-1">
              {n.items.map((it, j) => <li key={j}><Inlines parts={it} /></li>)}
            </ul>
          ),
        )}
      </div>
    </div>
  );
}

function MainCard({ p }: { p: Pharmacy }) {
  const now = useNow();
  const [booking, setBooking] = useState(false);
  const s = openingStatus(p.horaires, now);
  const [head, tail] = s.displayText.split(' · ');
  const color = s.isOpen ? 'text-open-green' : 'text-red-600';
  return (
    <>
      <section aria-labelledby="fiche-nom" className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6 mb-6">
          <div>
            <h2 id="fiche-nom" className="text-xl md:text-3xl text-gray-800 mb-2 font-bold font-serif">
              <span className="cursor-pointer">{p.nom}</span>{' '}
            </h2>
            <div>
              <address className="text-sm md:text-base flex flex-col not-italic lg:text-lg font-medium text-gray-600 mb-2">
                <span>{p.adresse}</span>
                <span>{p.codePostal} {p.ville}</span>
              </address>
              <p className="flex items-center gap-2 text-sm md:text-base font-medium text-gray-700">
                <Clock size={20} className={color} aria-hidden="true" />
                <span className={`font-extrabold text-base md:text-lg ${color}`}>{head}</span>
                {tail && (<> <span className="text-xs" aria-hidden="true">•</span> {tail}</>)}
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:flex-wrap gap-3">
            {p.canBook && (
              <button type="button" data-cta="reserver_creneau" onClick={() => setBooking(true)} className="flex items-center justify-center gap-2.5 bg-yellow-cta hover:bg-yellow-cta-hover text-tessan-green font-bold rounded-lg py-3.5 px-6 transition-colors text-base md:text-lg cursor-pointer shadow-sm">
                <CalendarDays size={22} className="md:w-6 md:h-6" aria-hidden="true" />
                <span>Réserver un créneau</span>
              </button>
            )}
            {p.telephone && (
              <a href={`tel:${p.telephone}`} data-cta="call_pharmacy" className="flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-medium rounded-lg py-2 px-4 transition-colors text-xs md:text-base cursor-pointer">
                <Phone size={18} className="md:w-5 md:h-5" aria-hidden="true" />
                <span className="truncate">{p.telephone}</span>
              </a>
            )}
            <a href={directionsUrl(p)} target="_blank" rel="noopener noreferrer" data-cta="itineraire_pharmacie" className="flex items-center justify-center gap-2 bg-white border-2 border-tessan-green text-tessan-green hover:bg-cream-hover font-medium rounded-lg py-2 px-4 transition-colors text-xs md:text-base cursor-pointer">
              <Navigation size={18} className="md:w-5 md:h-5" aria-hidden="true" />
              <span>Itinéraire</span>
            </a>
          </div>
        </div>
        {p.description && (
          <div className="pt-6 border-t border-gray-200">
            <Description key={p.id} description={p.description} images={p.images} />
          </div>
        )}
      </section>
      {booking && <BookingModal pharmacy={p} onClose={() => setBooking(false)} />}
    </>
  );
}

function Hours({ p }: { p: Pharmacy }) {
  const now = useNow();
  const today = parisDay(now);
  const start = WEEK_FROM_MONDAY.indexOf(today);
  const order = [...WEEK_FROM_MONDAY.slice(start), ...WEEK_FROM_MONDAY.slice(0, start)];
  const st = openingStatus(p.horaires, now);
  return (
    <table className="w-full">
      <tbody className="block space-y-2">
        {order.map((d) => {
          const isToday = d === today;
          return (
            <tr key={d} className="flex justify-between items-center py-2 border-b border-gray-200">
              <th scope="row" className={`${isToday ? 'font-bold' : 'font-medium'} text-gray-700 capitalize text-left`}>{DAY_LABEL[d]}</th>
              <td className={`${isToday ? 'font-bold' : ''} text-gray-600`}>
                {isToday && (
                  <>
                    <span className={`font-extrabold ${st.isOpen ? 'text-open-green' : 'text-red-600'}`}>{st.isOpen ? 'Ouvert' : 'Fermé'}</span>{' '}
                    <span className="text-xs text-gray-600 font-normal" aria-hidden="true">•</span>{' '}
                  </>
                )}
                {p.horaires[d] || 'Fermé'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const FAQ = (nom: string): { q: string; a: React.ReactNode }[] => [
  { q: 'Quels sont les horaires de téléconsultation ?', a: <>La téléconsultation est disponible pendant les horaires d'ouverture de la <strong>{nom}</strong>. Un médecin généraliste peut vous recevoir sans rendez-vous, généralement en moins de 15 minutes.</> },
  { q: 'La consultation est-elle remboursée ?', a: <>Oui. Les médecins sont <strong>conventionnés secteur 1</strong>. La consultation (25 €) est remboursée par l'Assurance Maladie et peut être prise en charge jusqu'à 100 % avec votre mutuelle selon votre situation.</> },
  { q: 'Dois-je prendre rendez-vous ?', a: <>Ce n'est pas obligatoire. Vous pouvez consulter un médecin <strong>sans rendez-vous directement à la {nom}</strong>.<br /><br />Vous pouvez aussi <strong>réserver un créneau en ligne avant de venir</strong> pour bénéficier d'un passage prioritaire.</> },
  { q: 'Puis-je obtenir une ordonnance ou un arrêt de travail ?', a: <>Oui, si le médecin estime que cela est nécessaire. L'ordonnance est transmise à la fin de la consultation. L'arrêt de travail délivré en téléconsultation ne peut pas dépasser <strong>3 jours</strong>.</> },
  { q: 'Que dois-je apporter pour la consultation ?', a: <>Pensez à apporter votre <strong>carte Vitale</strong> afin de faciliter la prise en charge et le remboursement.</> },
  { q: 'Une téléconsultation est-elle possible pour mon enfant de moins de deux ans ?', a: <>La téléconsultation n'est <strong>pas adaptée aux enfants de moins de deux ans</strong>. Un examen en présentiel est généralement nécessaire pour une prise en charge adaptée.</> },
  { q: "Puis-je faire une téléconsultation pour une déclaration d'accident de travail ?", a: <>La déclaration d'accident de travail nécessite souvent une <strong>évaluation approfondie</strong>, incluant des examens physiques non réalisables à distance. Une consultation en présentiel est recommandée.</> },
  { q: 'Puis-je obtenir un certificat médical pour faire du sport en téléconsultation ?', a: <>La délivrance d'un certificat médical peut nécessiter des <strong>examens physiques spécifiques</strong> pour évaluer l'aptitude au sport. Une consultation en présentiel est donc recommandée.</> },
];

function Faq({ nom }: { nom: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section>
      <div className="px-6 pb-6">
        <h2 className="font-serif text-faq-title text-tessan-green text-center mb-8 mt-2 font-medium">Foire Aux Questions</h2>
        <div className="flex flex-col gap-3">
          {FAQ(nom).map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="bg-white rounded-faq overflow-hidden shadow-faq">
                <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? null : i)} className="w-full flex justify-between items-center py-5 px-6 cursor-pointer text-left gap-3">
                  <span className="font-sans text-lg leading-6 text-tessan-green font-semibold flex-1">{f.q}</span>
                  <span className={`shrink-0 flex items-center transition-transform duration-250 ${isOpen ? 'rotate-180' : 'rotate-0'}`} aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </button>
                {isOpen && (
                  <div id={`faq-${i}`} className="px-6 pb-5 border-t border-faq-border">
                    <p className="font-sans text-base leading-7 text-tessan-green pt-3">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PharmacyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = pharmacyIdFromPath(location.pathname);
  const [all, setAll] = useState<Pharmacy[] | null>(null);
  useEffect(() => { loadPharmacies().then(setAll, () => setAll([])); }, []);
  const p = all?.find((x) => x.id === id) ?? null;
  useDocumentTitle(
    p ? `${p.nom} - Téléconsultation à ${p.ville}` : all ? 'Pharmacie non trouvée - Tessan' : 'Tessan',
    p ? `Consultez un médecin en téléconsultation à ${p.nom}, ${p.adresse}, ${p.codePostal} ${p.ville}.` : undefined,
  );
  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  const others = useMemo(() => (p && all ? nearest(all.filter((x) => x.id !== p.id), p.coordonnees) : []), [p, all]);
  if (!all) {
    return (
      <div className="max-w-page mx-auto px-4 py-20 text-center">
        <LoaderCircle className="animate-spin mx-auto mb-4" size={48} aria-hidden="true" />
        <h1 className="text-2xl text-gray-800">Chargement...</h1>
      </div>
    );
  }
  if (!p) {
    return (
      <div className="max-w-page mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl text-gray-800">Pharmacie non trouvée</h1>
      </div>
    );
  }

  const crumbs = crumbsFor(p);
  const items: BreadcrumbItem[] = [
    { label: 'Trouver un dispositif de téléconsultation', onClick: () => navigate('/') },
    { label: 'Spécialités médicales' },
    ...crumbs.map((c, i) => ({ label: c.label, onClick: () => { navigate(buildPath(crumbs.slice(0, i + 1))); window.scrollTo({ top: 0, behavior: 'smooth' }); } })),
    { label: p.nom },
  ];

  const onSearchSubmit = (out: SearchOutput) => {
    if (!out.query && !out.specialtyLabel) { navigate('/'); return; }
    if (out.results.length > 0 && out.query) {
      const first = out.results[0];
      const q = out.query.split(',')[0].trim();
      const region = regionOf(first.codePostal);
      const dept = departmentNameOf(first.codePostal);
      const c: Crumb[] = [];
      if (REGIONS.includes(q)) c.push({ label: q, type: 'region' });
      else if (DEPARTMENTS.includes(q)) { if (region) c.push({ label: region, type: 'region' }); c.push({ label: q, type: 'departement' }); }
      else {
        if (region) c.push({ label: region, type: 'region' });
        if (dept && dept.toLowerCase() !== q.toLowerCase()) c.push({ label: dept, type: 'departement' });
        if (q) c.push({ label: q, type: 'ville' });
      }
      if (out.postalCode) c.push({ label: out.postalCode, type: 'postalCode' });
      const sp = out.specialtyLabel ? specialtyByLabel(out.specialtyLabel) : null;
      navigate(buildPath(c, sp?.slug), { state: { fromSearch: { results: out.results, query: out.query, specialty: out.specialtyLabel ?? '', coords: out.coords } } satisfies NavState });
    } else navigate('/');
  };

  const onAreaClick = (name: string, kind: 'departement' | 'region') => {
    if (kind === 'region') { navigate(buildPath([{ label: name, type: 'region' }])); return; }
    const sample = all.find((x) => departmentNameOf(x.codePostal) === name);
    const c: Crumb[] = [];
    if (sample) { const r = regionOf(sample.codePostal); if (r) c.push({ label: r, type: 'region' }); }
    c.push({ label: name, type: 'departement' });
    navigate(buildPath(c));
  };

  const showFaq = p.nomEtablissement === 'Cabine Téléconsultation Médecin Tessan';
  const nearby = others.slice(0, 6);
  return (
    <div>
      <main className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-page mx-auto">
          <section className="p-6 bg-slate-50">
            <div className="max-w-page mx-auto">
              <Breadcrumb items={items} />
              <h1 className="text-fiche-h1 text-center text-gray-800 mb-8">
                Votre dispositif de téléconsultation Tessan à <span className="text-tessan-green-hover">{p.ville}</span>
              </h1>
              <div className="mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-6 flex items-center gap-3">
                  <Search className="text-gray-500" size={20} aria-hidden="true" />
                  <h2 className="text-lg text-gray-700 font-sans">Effectuer une nouvelle recherche</h2>
                </div>
                <SearchForm key={p.id} onSearchSubmit={onSearchSubmit} />
              </div>
            </div>
          </section>
          <div className="p-6">
            <MainCard p={p} />
          </div>
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <div>
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 font-serif">Horaires d'ouverture</h3>
                    <Hours p={p} />
                  </div>
                </div>
                <div data-testid="pharmacy-map" className="rounded-lg overflow-hidden shadow-md h-125 lg:sticky lg:top-24">
                  <MapView pharmacies={[p]} focusedPharmacy={p} showInfoWindow={false} />
                </div>
              </div>
            </div>
          </div>
          {showFaq && <Faq nom={p.nom} />}
          {nearby.length > 0 && (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl text-gray-800 mb-6">Les dispositifs de téléconsultation Tessan à proximité</h2>
                <p className="text-gray-600 mb-6">Découvrez les {nearby.length} dispositifs les plus proches</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nearby.map((n) => (
                    <PharmacyCard key={n.id} pharmacy={n} onFocus={() => navigate(pharmacyUrl(n))} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <NearbyAreas wrap="fiche" from={p.coordonnees} isHomepage={false} excludeDeptCode={departmentCode(p.codePostal)} onAreaClick={onAreaClick} />
        </div>
      </main>
    </div>
  );
}
