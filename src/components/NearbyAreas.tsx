import { useEffect, useState } from 'react';
import { loadPharmacies } from '../lib/data';
import type { LatLng } from '../lib/geo';
import { nearbyAreas, PARIS, type Area } from '../lib/areas';

type Props = { from?: LatLng | null; isHomepage: boolean; onAreaClick: (name: string, kind: 'departement' | 'region') => void; excludeDeptCode?: string; wrap?: 'section' | 'fiche' };

function Grid({ title, intro, items, kind, onAreaClick }: { title: string; intro: string; items: Area[]; kind: 'departement' | 'region'; onAreaClick: Props['onAreaClick'] }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl text-gray-800 mb-6">{title}</h2>
      <p className="text-gray-600 mb-6">{intro}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((a) => (
          <button key={a.key} type="button" onClick={() => onAreaClick(a.name, kind)} className="bg-slate-50 hover:bg-tessan-green hover:text-white transition-colors rounded-lg p-4 text-center group cursor-pointer">
            <p className="font-semibold text-gray-800 group-hover:text-white mb-1">{a.name}</p>
            <p className="text-sm text-gray-500 group-hover:text-white">{a.count} {a.count > 1 ? 'dispositifs' : 'dispositif'}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/** « Les dispositifs … dans les départements / régions à proximité ». */
export function NearbyAreas({ from, isHomepage, onAreaClick, excludeDeptCode, wrap = 'section' }: Props) {
  const [data, setData] = useState<{ departments: Area[]; regions: Area[] } | null>(null);
  useEffect(() => {
    let alive = true;
    loadPharmacies().then((all) => {
      if (alive) setData(nearbyAreas(all, from && !isHomepage ? from : PARIS, excludeDeptCode));
    }, () => alive && setData({ departments: [], regions: [] }));
    return () => { alive = false; };
  }, [from, isHomepage, excludeDeptCode]);

  const depTitle = 'Les dispositifs de téléconsultation Tessan dans les départements à proximité';
  const regTitle = 'Les dispositifs de téléconsultation Tessan dans les régions à proximité';
  if (wrap === 'fiche') {
    if (!data) return null;
    return (
      <>
        {data.departments.length > 0 && (
          <div className="p-6">
            <Grid title={depTitle} intro={`Explorez les dispositifs disponibles dans les ${data.departments.length} départements les plus proches`} items={data.departments} kind="departement" onAreaClick={onAreaClick} />
          </div>
        )}
        {data.regions.length > 0 && (
          <div className="p-6">
            <Grid title={regTitle} intro={`Explorez les dispositifs disponibles dans les ${data.regions.length} régions les plus proches`} items={data.regions} kind="region" onAreaClick={onAreaClick} />
          </div>
        )}
      </>
    );
  }
  return (
    <div className="bg-slate-50 p-6 pb-12">
      {!data ? (
        <div className="max-w-page mx-auto">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent" />
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-page mx-auto">
          {data.departments.length > 0 && (
            <div className="mb-8">
              <Grid title={depTitle} intro={`Explorez les dispositifs disponibles dans les ${data.departments.length} départements les plus proches`} items={data.departments} kind="departement" onAreaClick={onAreaClick} />
            </div>
          )}
          {data.regions.length > 0 && (
            <div>
              <Grid title={regTitle} intro={`Explorez les dispositifs disponibles dans les ${data.regions.length} régions les plus proches`} items={data.regions} kind="region" onAreaClick={onAreaClick} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
