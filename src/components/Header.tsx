import { User } from 'lucide-react';

const NAV = [
  { href: 'https://www.tessan.io/la-teleconsultation-augmentee', label: 'Téléconsultation' },
  { href: 'https://www.tessan.io/medecins', label: 'Vous êtes médecin ?' },
  { href: 'https://www.tessan.io/', label: 'Vous êtes un professionnel ?' },
];

/** En-tête : logo, navigation (masquée sous 1024 px, sans menu burger — comme l'original), « Compte patient ». */
export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 top-0 z-50">
      <nav aria-label="Navigation principale" className="max-w-page mx-auto flex justify-between items-center h-20 px-6">
        <div className="flex items-center">
          <a className="font-bold cursor-pointer" href="https://www.tessan.io/">
            <img alt="Logo Tessan" width={91} height={50} decoding="async" src="/logo.svg" />
          </a>
        </div>
        <div className="hidden lg:flex items-center gap-12">
          {NAV.map((l) => (
            <a key={l.label} className="text-base text-gray-700 hover:text-tessan-green font-medium transition-colors cursor-pointer" href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center">
          <a className="flex items-center gap-2 bg-footer-bg text-white text-base px-6 py-3 rounded font-semibold hover:bg-dark-green-hover transition-colors cursor-pointer" href="https://patient.prod.tessan.cloud/auth/login">
            <User size={18} aria-hidden="true" />
            Compte patient
          </a>
        </div>
      </nav>
    </header>
  );
}
