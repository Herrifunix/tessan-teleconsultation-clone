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
    let tries = 0;
    let raf = 0;
    const focusTitle = () => {
      const h1 = document.querySelector<HTMLElement>('main h1, h1');
      if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
      else if (tries++ < 30) raf = requestAnimationFrame(focusTitle);
    };
    raf = requestAnimationFrame(focusTitle);
    return () => cancelAnimationFrame(raf);
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
