import { useEffect, useState } from 'react';

/** Instant courant, rafraîchi au début de chaque minute (le statut « Ouvert/Fermé » bascule à l'heure pile,
 *  et reste juste si la page reste ouverte). */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(new Date());
      t = setTimeout(tick, intervalMs - (Date.now() % intervalMs) + 50);
    };
    t = setTimeout(tick, intervalMs - (Date.now() % intervalMs) + 50);
    return () => clearTimeout(t);
  }, [intervalMs]);
  return now;
}
