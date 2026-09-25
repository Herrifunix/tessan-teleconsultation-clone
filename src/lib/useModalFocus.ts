import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Comportement de boîte de dialogue modale : focus initial (une seule fois), Échap, focus piégé dans la boîte,
 *  défilement de la page bloqué et focus rendu à l'élément déclencheur à la fermeture. */
export function useModalFocus(container: RefObject<HTMLElement | null>, onClose: () => void, initial?: RefObject<HTMLElement | null>, fallback?: () => HTMLElement | null) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    // Si le déclencheur a disparu dans le même rendu (bouton remplacé par la boîte), activeElement vaut <body>.
    const trigger = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (initial?.current ?? container.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !container.current) return;
      const items = [...container.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      const inside = container.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Déclencheur retiré du DOM (ex. bannière cookies remplacée par le bouton de rappel) : élément de repli.
      // Le repli n'est rendu qu'au commit suivant : on attend une image.
      if (trigger?.isConnected) trigger.focus();
      else if (fallback) requestAnimationFrame(() => fallback()?.focus());
    };
    // Monté une seule fois : les re-rendus du parent (horloge minute) ne doivent pas voler le focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Variante sans rendu, pour une boîte affichée conditionnellement dans un composant plus large. */
export function ModalFocus({ container, onClose, initial, fallback }: { container: RefObject<HTMLElement | null>; onClose: () => void; initial?: RefObject<HTMLElement | null>; fallback?: () => HTMLElement | null }) {
  useModalFocus(container, onClose, initial, fallback);
  return null;
}
