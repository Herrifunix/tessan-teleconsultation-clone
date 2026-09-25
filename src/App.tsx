import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { CookieConsent } from './components/CookieConsent';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LocationPage } from './pages/LocationPage';
import { PharmacyPage } from './pages/PharmacyPage';
import { pharmacyIdFromPath } from './lib/slug';

/** Route unique « attrape-tout » comme l'original (app/[...location]) : fiche si l'URL se termine par /<id>/<slug>. */
export function App() {
  const { pathname } = useLocation();
  const isPharmacy = pharmacyIdFromPath(pathname) !== null;
  const { key } = useLocation();
  const first = useRef(true);
  // Navigation côté client : le focus passe au titre de la nouvelle page (sinon il reste sur <body>).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    // Le titre n'existe qu'une fois les données chargées : on l'attend (observateur du DOM, 5 s au plus).
    const focusTitle = () => {
      const h1 = document.querySelector<HTMLElement>('h1:not([data-loading])'); // pas le titre provisoire « Chargement... »
      if (!h1) return false;
      h1.tabIndex = -1;
      h1.focus({ preventScroll: true });
      return true;
    };
    if (focusTitle()) return;
    const obs = new MutationObserver(() => { if (focusTitle()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    const stop = setTimeout(() => obs.disconnect(), 5000);
    return () => { obs.disconnect(); clearTimeout(stop); };
  }, [key]);
  return (
    <>
      {/* Premier dans le DOM comme `.cky-consent-container` de l'original : la bannière est atteinte en premier au clavier. */}
      <CookieConsent />
      <Header />
      <div>{isPharmacy ? <PharmacyPage /> : <main><LocationPage /></main>}</div>
      <Footer />
    </>
  );
}
