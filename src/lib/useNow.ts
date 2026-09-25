import { useEffect, useState } from 'react';

/** Instant courant, rafraîchi chaque minute (le statut « Ouvert/Fermé » reste juste si la page reste ouverte). */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
