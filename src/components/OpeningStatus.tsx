import { Clock } from 'lucide-react';
import type { Hours } from '../lib/hours';
import { openingStatus } from '../lib/hours';
import { useNow } from '../lib/useNow';

/** Ligne « Ouvert • Ferme à 19:30 » de la carte de pharmacie (texte découpé sur « · » comme l'original). */
export function OpeningStatus({ hours, className = 'font-medium mb-3 flex items-center gap-1.5 text-gray-700', iconClass = 'h-5 w-5', labelClass = 'text-base' }: { hours: Hours; className?: string; iconClass?: string; labelClass?: string }) {
  const now = useNow();
  const s = openingStatus(hours, now);
  const [head, tail] = s.displayText.split(' · ');
  const color = s.isOpen ? 'text-open-green' : 'text-red-600';
  return (
    <p data-testid="opening-status" className={className}>
      <Clock className={`${iconClass} ${color}`} aria-hidden="true" />
      <span className={`font-extrabold ${labelClass} ${color}`}>{head}</span>
      {tail && (
        <>
          {' '}
          <span className="text-xs" aria-hidden="true">•</span> {tail}
        </>
      )}
    </p>
  );
}
