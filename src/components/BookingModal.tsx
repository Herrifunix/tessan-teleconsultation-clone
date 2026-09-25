import { CalendarDays, ChevronDown, ChevronLeft, ChevronUp, CircleCheck, Clock, Mail, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Pharmacy } from '../lib/data';
import { DERMATO_ALLOWED, isValidEmail, isWithinSchedule, SERVICES, slotRange, upcomingSlots, type ServiceId, type Slot } from '../lib/booking';
import { useNow } from '../lib/useNow';
import { useModalFocus } from '../lib/useModalFocus';

type Step = 'service' | 'slot' | 'email' | 'confirmation';
const back = 'flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 cursor-pointer';

/** Modale « Réserver un créneau — Passage prioritaire » (4 étapes, comme l'original). Aucune donnée n'est envoyée. */
export function BookingModal({ pharmacy: p, onClose }: { pharmacy: Pharmacy; onClose: () => void }) {
  const titleId = useId();
  const now = useNow();
  const [step, setStep] = useState<Step>('service');
  const [service, setService] = useState<ServiceId | null>(null);
  const [openDay, setOpenDay] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [immediate, setImmediate] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const clientId = p.idTechnique || p.codeMagasin;
  const services = useMemo(() => SERVICES.filter((s) => s.id !== 'dermato' || DERMATO_ALLOWED.has(clientId)), [clientId]);
  const days = useMemo(() => (service ? upcomingSlots(service, now) : []), [service, now]);
  const canNow = !!service && isWithinSchedule(service, now);

  const boxRef = useRef<HTMLDivElement>(null);
  useModalFocus(boxRef, onClose, closeRef);
  // Changement d'étape : l'élément focalisé disparaît ; le focus passe au champ de l'étape, sinon à son titre.
  const stepRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    const root = stepRef.current;
    if (!root || root.contains(document.activeElement)) return;
    const target = root.querySelector<HTMLElement>('input') ?? root.querySelector<HTMLElement>('h4');
    if (target) { if (target.tagName === 'H4') target.tabIndex = -1; target.focus(); }
  }, [step]);

  const confirm = () => {
    if (!email || !service) return;
    // Le clone n'a pas de serveur : une adresse invalide reproduit l'erreur renvoyée par l'API de l'original.
    if (!isValidEmail(email)) { setError('Une erreur est survenue.'); return; }
    setError(null);
    setStep('confirmation');
  };

  const serviceLabel = SERVICES.find((s) => s.id === service)?.label ?? '';
  const modal = (
    <div
      className="fixed inset-0 z-100 bg-black/50 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={boxRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg my-auto p-5 md:p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-800 font-bold text-base md:text-lg truncate">{p.nom}</h3>
            <p className="text-gray-500 text-xs md:text-sm truncate">{p.adresse}, {p.codePostal} {p.ville}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0" aria-label="Fermer">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="border-t border-gray-200 mb-4" />
        <div ref={stepRef}>
          {step !== 'confirmation' && (
            <h4 id={titleId} className="text-lg md:text-xl font-bold text-gray-800 mb-3 font-serif">
              Réserver un créneau <span className="text-tessan-green">— Passage prioritaire</span>
            </h4>
          )}
          {step === 'service' && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Réservez un créneau pour être pris en charge en priorité, dès votre installation dans la cabine de téléconsultation Tessan.</p>
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">Comment ça marche ?</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Choisissez un créneau qui vous convient</li>
                  <li>Présentez-vous à la pharmacie sur ce créneau</li>
                  <li>Installez-vous dans la cabine de téléconsultation puis bénéficiez d'un passage prioritaire</li>
                </ol>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-2">Choisissez votre spécialité</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setService(s.id); setStep('slot'); setError(null); }}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-tessan-green hover:bg-emerald-50 transition-colors text-left cursor-pointer min-w-0"
                  >
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">{s.emoji}</span>
                    <span className="font-medium text-gray-800 text-sm break-words">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 'slot' && (
            <div>
              <button type="button" className={back} onClick={() => { setStep('service'); setService(null); setError(null); }}>
                <ChevronLeft size={16} aria-hidden="true" /> Retour
              </button>
              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-cream-hover text-gray-700 mb-3">{serviceLabel}</span>
              {canNow && (
                <button type="button" onClick={() => { setImmediate(true); setSlot(null); setStep('email'); }} className="w-full flex items-center gap-3 p-4 mb-3 rounded-lg border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-colors text-left cursor-pointer">
                  <Clock size={20} className="text-emerald-600" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-emerald-700 text-sm">Maintenant</span>
                    <span className="block text-xs text-emerald-600">Créneau disponible</span>
                  </div>
                </button>
              )}
              {days.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-1">Ou choisissez un créneau</p>
                  {days.map((d, i) => (
                    <div key={d.dayLabel} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button type="button" aria-expanded={openDay === i} onClick={() => setOpenDay(openDay === i ? -1 : i)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-gray-400" aria-hidden="true" />
                          <span className="font-medium text-gray-800 text-sm">{d.dayLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">{d.slotCount} créneaux</span>
                          {openDay === i ? <ChevronUp size={16} className="text-gray-400" aria-hidden="true" /> : <ChevronDown size={16} className="text-gray-400" aria-hidden="true" />}
                        </div>
                      </button>
                      {openDay === i && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 px-3 pb-3 gap-2">
                          {d.slots.map((s) => (
                            <button key={s.label} type="button" onClick={() => { setImmediate(false); setSlot(s); setStep('email'); }} className="text-sm py-2 px-1 rounded-md border border-gray-200 hover:border-tessan-green hover:bg-emerald-50 text-gray-700 transition-colors cursor-pointer">
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-3">Aucun créneau disponible pour le moment.</p>
              )}
            </div>
          )}
          {step === 'email' && (
            <div>
              <button type="button" className={back} onClick={() => { setStep('slot'); setSlot(null); setImmediate(false); setError(null); }}>
                <ChevronLeft size={16} aria-hidden="true" /> Retour
              </button>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-1">Votre créneau de passage :</p>
                <p className="text-sm text-gray-700">{serviceLabel}</p>
                <p className="text-sm text-gray-700">
                  {immediate || !slot ? 'Maintenant' : (<><strong className="font-bold">{slot.dayName}</strong> {slot.dateShort} de {slotRange(slot)}</>)}
                </p>
              </div>
              <div className="max-w-md space-y-3">
                <label htmlFor={`${titleId}-email`} className="block text-sm font-medium text-gray-700">Votre e-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input id={`${titleId}-email`} type="email" placeholder="exemple@email.fr" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-tessan-green focus:border-transparent text-sm" />
                </div>
                {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
                <button type="button" data-cta="finaliser_creneau" disabled={!email} onClick={confirm} className="w-full py-3 rounded-lg bg-tessan-green text-white font-medium hover:bg-tessan-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm">
                  Confirmer mon créneau prioritaire
                </button>
                <p className="text-xs text-gray-400 text-center">Vous recevrez un email récapitulatif dans quelques instants</p>
              </div>
            </div>
          )}
          {step === 'confirmation' && (
            <div className="text-center py-4">
              <CircleCheck size={48} className="mx-auto text-emerald-500" aria-hidden="true" />
              <h4 id={titleId} className="text-xl font-bold text-gray-800 mb-2 font-serif">Réserver un créneau — démonstration</h4>
              <p className="text-sm text-gray-600 mb-4">
                Aucune réservation n’a été transmise : ce site est une reproduction réalisée dans le cadre d’un test technique et n’envoie aucun e-mail à <strong>{email}</strong>.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm text-gray-600 mb-4 max-w-md mx-auto">
                <p className="font-semibold">Pour réserver réellement :</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Rendez-vous sur <a className="underline" href="https://teleconsultation.tessan.io/" target="_blank" rel="noopener noreferrer">teleconsultation.tessan.io</a>
                  </li>
                  <li>Recherchez « {p.nom} »</li>
                  <li>Choisissez à nouveau votre créneau</li>
                </ol>
              </div>
              <button type="button" onClick={onClose} className="text-sm text-tessan-green hover:underline cursor-pointer">Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}
