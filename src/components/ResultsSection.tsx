import { useState } from 'react';
import type { Pharmacy } from '../lib/data';
import { MapView } from './map/MapView';
import { PharmacyCard } from './PharmacyCard';

/** Carte « N dispositifs … » : liste (35 %) + carte ; en vue d'accueil, carte seule (calc(100vh − 400px), min 600 px). */
export function ResultsSection({ results, showList = true, onMarkerClick }: { results: Pharmacy[]; showList?: boolean; onMarkerClick?: (p: Pharmacy) => void }) {
  // Le focus est remis à zéro quand la liste change (état associé à la liste courante).
  const [focus, setFocus] = useState<{ list: Pharmacy[]; p: Pharmacy } | null>(null);
  const focused = focus && focus.list === results ? focus.p : null;
  const setFocused = (p: Pharmacy) => setFocus({ list: results, p });
  const onPharmacyClick = (p: Pharmacy) => {
    setFocused(p);
    onMarkerClick?.(p);
  };
  const n = results.length;
  return (
    <div className="bg-slate-50 p-6 pb-12">
      <div className="max-w-page mx-auto">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
          {showList && (
            <h2 className="text-center text-2xl text-gray-800 mb-6 font-bold">
              {n} dispositif{n > 1 ? 's' : ''} de téléconsultation Tessan autour de vous
            </h2>
          )}
          {showList ? (
            <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-5">
              <div className="flex flex-col gap-6 overflow-y-auto max-h-222" tabIndex={-1}>
                {results.map((p) => (
                  <PharmacyCard key={p.id} pharmacy={p} onFocus={() => setFocused(p)} />
                ))}
              </div>
              <div className="rounded-r-md overflow-hidden shadow-md h-222 lg:sticky lg:top-24">
                <MapView pharmacies={results} focusedPharmacy={focused} onPharmacyClick={onPharmacyClick} />
              </div>
            </div>
          ) : (
            <div className="rounded-md overflow-hidden shadow-md h-[calc(100vh-(var(--spacing)*100))] min-h-150">
              <MapView pharmacies={results} focusedPharmacy={focused} onPharmacyClick={onPharmacyClick} isInitialView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
