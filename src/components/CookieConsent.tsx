import { useEffect, useId, useRef, useState } from 'react';
import audit from '../data/cookie-audit.json';

// Reproduction de la bannière CookieYes de l'original. Aucun traceur n'est chargé par le clone : le choix est
// seulement mémorisé localement (clé « tc-cookie-consent »).
const KEY = 'tc-cookie-consent';
type Categories = Record<string, boolean>;
type Consent = { action: 'accept' | 'reject' | 'custom'; categories: Categories };
const OPTIONAL = audit.categories.filter((c) => c.slug !== 'necessary').map((c) => c.slug);

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}
function writeConsent(c: Consent) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* stockage indisponible : le choix vaut pour la session */
  }
}

const btn = 'cky-btn flex-auto max-w-full text-sm leading-6 font-medium text-center p-2 border-2 border-solid rounded-cookie-btn cursor-pointer hover:brightness-90';

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(() => readConsent());
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState<Categories>(() => Object.fromEntries(OPTIONAL.map((s) => [s, readConsent()?.categories?.[s] ?? false])));
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const decide = (action: Consent['action'], categories: Categories) => {
    const c = { action, categories };
    writeConsent(c);
    setConsent(c);
    setDraft(categories);
    setPrefsOpen(false);
  };
  const all = (v: boolean) => Object.fromEntries(OPTIONAL.map((s) => [s, v]));

  useEffect(() => {
    if (!prefsOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPrefsOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [prefsOpen]);

  const bannerVisible = !consent && !prefsOpen;
  return (
    <>
      {bannerVisible && (
        <div role="region" aria-label="Nous respectons votre vie privée." className="fixed z-[9999999] bottom-10 left-10 w-110 rounded-cookie max-[576px]:bottom-0 max-[576px]:left-0 max-[440px]:w-full">
          <div className="bg-cookie-bg border border-cookie-bg text-cookie-text rounded-cookie shadow-cookie px-6.5 py-5 max-[440px]:px-0">
            <p role="heading" aria-level={2} className="text-lg leading-6 font-bold mb-3 max-[440px]:px-6 max-[352px]:text-base">Nous respectons votre vie privée.</p>
            <div className="text-sm leading-6 max-[440px]:px-6 max-[440px]:max-h-[40vh] max-[440px]:overflow-y-auto max-[352px]:text-xs">
              <p>Nous utilisons les cookies pour la mesure de notre audience et pour la bonne utilisation du service.{' '}</p>
              <p>{' '}En cliquant sur « Accepter », vous consentez à notre utilisation des cookie.</p>
              <p>
                Pour en savoir plus sur les traceurs utilisés et les traitements réalisés, vous pouvez consulter notre{' '}{' '}
                <a className="underline whitespace-nowrap bg-cookie-bg border border-cookie-bg focus-visible:outline-2 focus-visible:outline-cookie-link" href="https://tessan.io/cookies/" aria-label="Politique relative aux cookies">Politique relative aux cookies</a>
              </p>
            </div>
            <div role="group" className="flex flex-wrap items-center gap-2 mt-4 max-[440px]:flex-col max-[440px]:items-stretch max-[440px]:gap-2.5 max-[440px]:px-6 max-[352px]:text-xs">
              <button type="button" onClick={() => setPrefsOpen(true)} className={`${btn} bg-cookie-customize-bg border-cookie-customize-bg text-cookie-text max-[440px]:order-2`}>Personnaliser</button>
              <button type="button" onClick={() => decide('reject', all(false))} className={`${btn} bg-cookie-bg border-cookie-bg text-cookie-text max-[440px]:order-3`}>Refuser</button>
              <button type="button" onClick={() => decide('accept', all(true))} className={`${btn} bg-cookie-text border-cookie-text text-cookie-bg max-[440px]:order-1`}>Accepter</button>
            </div>
          </div>
        </div>
      )}

      {consent && !prefsOpen && (
        <div className="fixed z-[999999] bottom-3.75 left-3.75 max-[480px]:bottom-2 max-[480px]:left-2 group">
          <button type="button" aria-label="Choix de consentement" onClick={() => setPrefsOpen(true)} className="size-11.25 max-[480px]:size-9 rounded-full bg-cookie-text flex items-center justify-center cursor-pointer">
            <img src="/icons/cky-revisit.svg" alt="" className="size-7.5 max-[480px]:size-5.5" />
          </button>
          <span className="pointer-events-none absolute left-[calc(100%+7px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-cookie-tooltip text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Choix de consentement</span>
        </div>
      )}

      {prefsOpen && (
        <>
          <div className="fixed inset-0 bg-black opacity-40 z-[99999998]" onClick={() => setPrefsOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed z-[99999999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-211.25 max-w-[calc(100%-16px)] max-[576px]:max-w-full max-h-[79vh] max-[576px]:max-h-screen flex flex-col overflow-hidden rounded-cookie bg-cookie-bg border border-cookie-bg text-cookie-text">
            <div className="flex items-center justify-between px-6 py-5.5 max-[352px]:py-4">
              <span id={titleId} role="heading" aria-level={2} className="text-lg leading-6 font-bold max-[352px]:text-base">Personnaliser les préférences en matière de consentement</span>
              <button ref={closeRef} type="button" aria-label="Fermer" onClick={() => setPrefsOpen(false)} className="size-6 flex items-center justify-center cursor-pointer">
                <img src="/icons/cky-close.svg" alt="" className="size-2.5" />
              </button>
            </div>
            <div className="px-6 flex-1 overflow-auto text-sm leading-6 max-[352px]:text-xs">
              <div className="py-3">
                <p>Nous utilisons des cookies pour vous aider à naviguer efficacement et à exécuter certaines fonctionnalités. Vous trouverez des informations détaillées sur tous les cookies sous chaque catégorie de consentement ci-dessous.</p>
                <p>
                  Les cookies qui sont catégorisés comme « nécessaires » sont stockés sur votre navigateur car ils sont essentiels pour permettre les fonctionnalités de base du site.
                  {showMore ? ' ' : '... '}
                  {!showMore && (
                    <button type="button" onClick={() => setShowMore(true)} className="text-cookie-link underline whitespace-nowrap cursor-pointer">Afficher plus</button>
                  )}
                </p>
                {showMore && (
                  <>
                    <p>Nous utilisons également des cookies tiers qui nous aident à analyser la façon dont vous utilisez ce site web, à enregistrer vos préférences et à vous fournir le contenu et les publicités qui vous sont pertinents. Ces cookies ne seront stockés dans votre navigateur qu'avec votre consentement préalable.</p>
                    <p>
                      Vous pouvez choisir d'activer ou de désactiver tout ou partie de ces cookies, mais la désactivation de certains d'entre eux peut affecter votre expérience de navigation.{' '}
                      <button type="button" onClick={() => setShowMore(false)} className="text-cookie-link underline whitespace-nowrap cursor-pointer">Afficher moins</button>
                    </p>
                  </>
                )}
              </div>
              <div className="pt-1 pb-3">
                <p>
                  Pour plus d’informations sur la manière dont les cookies tiers de Tessan fonctionnent et traitent vos données, consultez la :{' '}
                  <a className="underline" href="https://www.tessan.io/politique-de-confidentialite">Politique de confidentialité de Tessan</a>
                </p>
              </div>
              <div className="mb-2.5">
                {audit.categories.map((c) => {
                  const open = expanded === c.slug;
                  const always = c.slug === 'necessary';
                  return (
                    <div key={c.slug}>
                      <div className="flex mt-2.5">
                        <div className="relative mr-5.5 max-[425px]:mr-3.75 pt-2" aria-hidden="true">
                          <i className={`block size-1.5 border-r-[1.4px] border-b-[1.4px] border-cookie-text/20 transition-transform ${open ? 'rotate-45' : '-rotate-45'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <button type="button" aria-expanded={open} onClick={() => setExpanded(open ? null : c.slug)} className="text-base leading-6 font-bold cursor-pointer text-left max-[352px]:text-sm">{c.title}</button>
                            {always ? (
                              <span className="text-sm leading-6 font-semibold text-cookie-always">Toujours actif</span>
                            ) : (
                              <input
                                type="checkbox"
                                role="switch"
                                aria-label={`Activer ${c.title}`}
                                checked={!!draft[c.slug]}
                                onChange={(e) => setDraft((d) => ({ ...d, [c.slug]: e.target.checked }))}
                                className="cky-switch relative appearance-none w-11 h-6 max-[425px]:w-9.5 max-[425px]:h-5.25 rounded-full cursor-pointer transition-colors bg-cookie-bg checked:bg-cookie-text shadow-[inset_0_0_0_1px_var(--color-gray-300)] checked:shadow-none before:content-[''] before:absolute before:left-0.5 before:bottom-0.5 before:size-5 max-[425px]:before:size-4.25 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-5 max-[425px]:checked:before:translate-x-4.25"
                              />
                            )}
                          </div>
                          <div className="mt-2.5 mb-4">
                            <p>{c.description}</p>
                          </div>
                        </div>
                      </div>
                      {open && (
                        <div className="px-5.5 max-[425px]:px-3.75 mb-4">
                          <div className="bg-cookie-table-bg rounded-cookie">
                            {c.cookies.length === 0 && <p className="text-xs leading-6 px-2.5 py-3.75">{audit.labels.cky_audit_table_empty_text}</p>}
                            {c.cookies.map((k) => (
                              <ul key={k.id} className="text-xs leading-6 px-2.5 py-3.75 border-b border-cookie-bg last:border-b-0">
                                <li className="flex pb-0.75"><div className="w-25 shrink-0 font-semibold">{audit.labels.cky_audit_table_header_id}</div><div className="break-all">{k.id}</div></li>
                                <li className="flex py-0.75"><div className="w-25 shrink-0 font-semibold">{audit.labels.cky_audit_table_header_duration}</div><div>{k.duration}</div></li>
                                <li className="flex py-0.75"><div className="w-25 shrink-0 font-semibold">{audit.labels.cky_audit_table_header_description}</div><div>{k.description}</div></li>
                              </ul>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative flex flex-wrap gap-2 justify-center px-6 py-5.5 max-[576px]:flex-col max-[576px]:gap-2.5">
              <div aria-hidden="true" className="absolute left-0 right-0 bottom-[calc(100%-1px)] h-10 bg-gradient-to-b from-white/0 to-cookie-bg pointer-events-none" />
              <button type="button" onClick={() => decide('reject', all(false))} className={`${btn} bg-cookie-bg border-cookie-bg text-cookie-text max-[576px]:w-full max-[576px]:order-3`}>Refuser</button>
              <button type="button" onClick={() => decide('custom', draft)} className={`${btn} bg-cookie-save-bg border-cookie-save-bg text-cookie-text max-[576px]:w-full max-[576px]:order-2`}>Enregistrer mes préférences</button>
              <button type="button" onClick={() => decide('accept', all(true))} className={`${btn} bg-cookie-text border-cookie-text text-cookie-bg max-[576px]:w-full max-[576px]:order-1`}>Accepter</button>
            </div>
            <div className="flex justify-end items-center gap-1 text-xs leading-5 px-6 py-2 bg-cookie-powered-bg text-cookie-powered-text rounded-b-cookie">
              Powered by <img src="/icons/cky-powered.svg" alt="CookieYes" width={78} height={13} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
