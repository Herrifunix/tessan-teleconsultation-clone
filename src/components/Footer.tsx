import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from './SocialIcons';

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/Tessan.io/', label: 'Facebook', Icon: FacebookIcon },
  { href: 'https://www.instagram.com/tessan.io/', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://www.linkedin.com/company/tessan/', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://www.youtube.com/@tessan2706', label: 'YouTube', Icon: YouTubeIcon },
];

type Col = { title: string; minW?: boolean; links: { label: string; href: string; pt?: boolean }[] };
const T = 'https://www.tessan.io';
const COLS: Col[] = [
  { title: 'PARTENAIRES', links: [
    { label: 'Pharmaciens', href: `${T}/pharmaciens` }, { label: 'Opticiens', href: `${T}/opticiens-teleconsultation` },
    { label: 'Infirmiers', href: `${T}/infirmiers` }, { label: 'Collectivités', href: `${T}/collectivites` },
    { label: 'Dirigeants', href: `${T}/dirigeants` }, { label: 'EHPAD', href: `${T}/ehpad` },
  ] },
  { title: 'SOLUTIONS', links: [
    { label: 'Nos solutions', href: `${T}/nos-solutions` }, { label: 'La cabine Premium', href: `${T}/nos-solutions/cabine-premium` },
    { label: 'La cabine Slim', href: `${T}/nos-solutions/cabine-teleconsultation-slim` }, { label: 'La borne', href: `${T}/nos-solutions/borne-teleconsultation` },
    { label: 'La console', href: `${T}/nos-solutions/console-teleconsultation` }, { label: 'La mallette', href: `${T}/nos-solutions/mallette-teleconsultation` },
    { label: 'La table de téléophtalmologie', href: `${T}/nos-solutions/table-teleophtalmologie` }, { label: 'Tessan IA', href: `${T}/tessan-ia` },
    { label: '- Téléconsultation', href: `${T}/tessan-ia/teleconsultation`, pt: true }, { label: 'La téléexpertise dermatologique', href: `${T}/nos-solutions/teleexpertise-dermatologique` },
  ] },
  { title: 'MEDECINS', minW: true, links: [
    { label: 'Médecins généralistes', href: `${T}/medecins` }, { label: 'Dermatologues', href: `${T}/dermatologues` },
    { label: 'Ophtalmologues', href: `${T}/ophtalmologues-teleconsultation` }, { label: 'Pédiatres', href: `${T}/pediatre` },
  ] },
  { title: 'PATIENTS', links: [
    { label: 'La téléconsultation augmentée', href: `${T}/la-teleconsultation-augmentee` }, { label: 'Tarifs et remboursements', href: `${T}/tarifs-et-remboursements` },
    { label: 'Médecine générale', href: `${T}/medecine-generale` }, { label: 'Dermatologie', href: `${T}/dermatologie` },
    { label: 'Ophtalmologie', href: `${T}/ophtalmologue-teleconsultation` }, { label: 'Pneumologie', href: `${T}/pneumologie` },
    { label: 'Gériatrie', href: `${T}/geriatrie` },
  ] },
  { title: 'RESSOURCES', links: [
    { label: 'Blog', href: `${T}/blog` }, { label: 'FAQ', href: 'https://aide.tessan.io/fr/' },
    { label: 'Qui sommes-nous ?', href: `${T}/qui-sommes-nous` }, { label: 'Carrières', href: 'https://www.welcometothejungle.com/fr/companies/tessan' },
  ] },
];
const LEGAL = [
  { label: 'Politique de confidentialité', href: `${T}/politique-de-confidentialite` }, { label: 'CGU', href: `${T}/cgu` },
  { label: 'Mentions légales', href: `${T}/mentions-legales` }, { label: 'Cookies', href: `${T}/cookies` },
  { label: 'CGV Téléexpertise dermatologique', href: `${T}/cgv-teleexpertise-dermatologie` },
];

export function Footer() {
  return (
    <footer className="bg-footer-bg text-white">
      <div className="max-w-footer mx-auto px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-28">
          <div className="lg:w-37.5 flex-shrink-0">
            <div className="mb-10">
              <img alt="Logo Tessan" width={120} height={50} decoding="async" className="brightness-0 invert" src="/logo.svg" />
            </div>
            <div className="mb-6">
              <h3 className="mb-2 text-sm text-white font-semibold font-sans">Adresse</h3>
              <p className="text-base leading-relaxed font-semibold">TESSAN<br />10 Rue Pergolèse<br />75016 Paris</p>
            </div>
            <div className="mb-8">
              <a className="inline-flex items-center gap-3 bg-footer-contact text-footer-contact-text px-5 py-3 rounded font-semibold hover:bg-footer-contact-hover transition-colors cursor-pointer" href="http://tessan.io/nous-contacter">
                Nous contacter<span className="text-xl" aria-hidden="true">→</span>
              </a>
            </div>
            <div className="flex gap-4 mb-0 lg:mb-8">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:opacity-80 transition-opacity cursor-pointer">
                  <Icon />
                </a>
              ))}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
            {COLS.map((c) => (
              <div key={c.title} className={c.minW ? 'min-w-45' : undefined}>
                <h3 className="mb-3.5 text-sm text-footer-heading font-sans">{c.title}</h3>
                <ul className="space-y-3 text-base font-semibold">
                  {c.links.map((l) => (
                    <li key={l.label} className={l.pt ? 'pt-2' : undefined}>
                      <a className="hover:underline cursor-pointer" href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/20 mt-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2025 Tessan. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {LEGAL.map((l) => (
              <a key={l.label} className="underline hover:opacity-80 cursor-pointer" href={l.href}>{l.label}</a>
            ))}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-footer-heading">Reproduction réalisée dans le cadre d'un test technique — non affiliée à Tessan</p>
      </div>
    </footer>
  );
}
