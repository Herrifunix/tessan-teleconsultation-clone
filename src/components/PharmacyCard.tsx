import { CalendarDays, Info } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import type { Pharmacy } from '../lib/data';
import { pharmacyUrl, directionsUrl } from '../lib/routes';
import { BookingModal } from './BookingModal';
import { OpeningStatus } from './OpeningStatus';

/** Carte de pharmacie (liste, popup de carte, « à proximité ») — reproduction du composant de l'original. */
export function PharmacyCard({ pharmacy: p, onFocus, as: Tag = 'article' }: { pharmacy: Pharmacy; onFocus?: () => void; as?: 'article' | 'div' }) {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const onKey = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && onFocus) { e.preventDefault(); onFocus(); }
  };
  return (
    <>
      <Tag
        className="bg-white p-5 border border-gray-200 rounded-lg hover:shadow-xl transition cursor-pointer"
        onClick={onFocus}
        onKeyDown={onKey}
        tabIndex={onFocus ? 0 : undefined}
        aria-label={Tag === 'article' ? p.nom : undefined}
      >
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-800 text-xl flex-1 break-words">
                <span className="cursor-pointer font-bold">{p.nom}</span>
                {p.distance && (
                  <a href={directionsUrl(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                    <span className="text-base font-normal underline cursor-pointer ml-2">({p.distance})</span>
                  </a>
                )}
              </h3>
            </div>
            <p className="text-gray-500 font-medium text-base">{p.adresse}</p>
            <p className="text-gray-500 font-medium text-base mb-3">
              {p.codePostal} {p.ville}{' '}
            </p>
            <OpeningStatus hours={p.horaires} />
            <div className="flex flex-col gap-2 w-full">
              {p.canBook && (
                <button
                  type="button"
                  data-cta="reserver_creneau"
                  onClick={(e) => { e.stopPropagation(); setBooking(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg h-11 px-3 transition-colors text-base cursor-pointer"
                >
                  <CalendarDays size={18} aria-hidden="true" />
                  <span>Réserver un créneau</span>
                </button>
              )}
              <button
                type="button"
                data-cta="voir_plus_pharmacie"
                onClick={(e) => { e.stopPropagation(); navigate(pharmacyUrl(p)); }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 shadow-xs hover:text-accent-foreground py-2 border-none bg-yellow-cta text-tessan-green w-full h-10 px-3 cursor-pointer text-base hover:opacity-70"
              >
                <Info className="w-4 h-4" aria-hidden="true" /> <span className="truncate">Voir plus</span>
              </button>
            </div>
          </div>
        </div>
      </Tag>
      {booking && <BookingModal pharmacy={p} onClose={() => setBooking(false)} />}
    </>
  );
}
