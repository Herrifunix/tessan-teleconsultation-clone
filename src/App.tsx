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
  return (
    <>
      <Header />
      <div>{isPharmacy ? <PharmacyPage /> : <main><LocationPage /></main>}</div>
      <Footer />
      <CookieConsent />
    </>
  );
}
