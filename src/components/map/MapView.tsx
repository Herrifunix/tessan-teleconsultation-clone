import { MapPin } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { Pharmacy } from '../../lib/data';

// Leaflet n'est téléchargé que lorsque la carte devient visible (comme l'original avec Google Maps).
const LeafletMap = lazy(() => import('./LeafletMap'));

export type MapViewProps = {
  pharmacies: Pharmacy[];
  focusedPharmacy?: Pharmacy | null;
  onPharmacyClick?: (p: Pharmacy) => void;
  showInfoWindow?: boolean;
  isInitialView?: boolean;
};

function Placeholder({ loading }: { loading: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className="bg-slate-100 flex flex-col items-center justify-center">
      <div className="text-center p-8">
        <div className="relative">
          <MapPin size={48} className="text-tessan-green mx-auto mb-4 animate-bounce" aria-hidden="true" />
        </div>
        {loading ? (
          <>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-tessan-green border-r-transparent mb-4" />
            <p className="text-gray-600 font-medium">Chargement de la carte...</p>
          </>
        ) : (
          <p className="text-gray-500">Faites défiler pour afficher la carte</p>
        )}
      </div>
    </div>
  );
}

export function MapView(props: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {visible ? (
        <Suspense fallback={<Placeholder loading />}>
          <LeafletMap {...props} />
        </Suspense>
      ) : (
        <Placeholder loading={false} />
      )}
    </div>
  );
}
