// Génération des créneaux « Passage prioritaire » (même planning, mêmes règles et libellés que l'original),
// calculée en heure de Paris.
import { DAYS, type Day, parseRanges, parisParts } from './hours';

export type ServiceId = 'generaliste' | 'dermato';
export const SERVICES: { id: ServiceId; label: string; emoji: string }[] = [
  { id: 'generaliste', label: 'Médecine générale', emoji: '🩺' },
  { id: 'dermato', label: 'Avis dermatologique', emoji: '🔬' },
];
// Liste blanche « Avis dermatologique » de l'original (407 identifiants) restreinte aux pharmacies de l'échantillon.
export const DERMATO_ALLOWED = new Set(['BOR_PHA_1005_92400_1', 'BOR_PHA_1816_75001_1', 'BOR_PHA_2075_75011_1', 'BOR_PHA_2169_95130_1', 'BOR_PHA_2171_20200_1', 'BOR_PHA_779_95130_1', 'BOR_PHA_952_31470_1']);
const SCHEDULE: Record<ServiceId, Record<Day, string>> = {
  generaliste: { lundi: '', mardi: '09:30-12:00, 16:00-18:00', mercredi: '09:30-12:00', jeudi: '09:30-12:00, 16:00-18:00', vendredi: '09:30-12:00', samedi: '', dimanche: '' },
  dermato: { lundi: '', mardi: '09:30-12:00, 16:00-18:00', mercredi: '09:30-12:00', jeudi: '09:30-12:00, 16:00-18:00', vendredi: '', samedi: '', dimanche: '' },
};
const HOLIDAYS = new Set(['2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14', '2026-05-25', '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25']);
const DAY_NAME: Record<Day, string> = { lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi', jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche' };
const MONTHS = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const pad = (n: number) => String(n).padStart(2, '0');
const hLabel = (min: number) => `${Math.floor(min / 60)}h${pad(min % 60)}`;

export type Slot = { label: string; start: number; end: number; dateKey: string; dayName: string; dateShort: string };
export type SlotDay = { dayLabel: string; slots: Slot[]; slotCount: number };

/** Jours civils à Paris à partir d'aujourd'hui (date « calendaire » indépendante du fuseau du visiteur). */
function parisCalendar(offsetDays: number, now: Date) {
  const p = parisParts(now);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), weekday: d.getUTCDay() };
}

export function isWithinSchedule(service: ServiceId, now: Date = new Date()): boolean {
  const c = parisCalendar(0, now);
  if (HOLIDAYS.has(`${c.y}-${pad(c.m)}-${pad(c.d)}`)) return false;
  const minutes = parisParts(now).minutes;
  return parseRanges(SCHEDULE[service][DAYS[c.weekday]]).some((r) => minutes >= r.start && minutes < r.end);
}

/** Jusqu'à 3 jours ouvrés dans les 14 prochains jours ; créneaux de 2 h ; aujourd'hui : départ ≥ maintenant + 60 min. */
export function upcomingSlots(service: ServiceId, now: Date = new Date(), maxDays = 3): SlotDay[] {
  const out: SlotDay[] = [];
  const nowMin = parisParts(now).minutes;
  for (let i = 0; i < 14 && out.length < maxDays; i++) {
    const c = parisCalendar(i, now);
    const key = `${c.y}-${pad(c.m)}-${pad(c.d)}`;
    if (HOLIDAYS.has(key)) continue;
    const day = DAYS[c.weekday];
    const ranges = parseRanges(SCHEDULE[service][day]);
    if (!ranges.length) continue;
    const slots: Slot[] = [];
    for (const r of ranges) {
      for (let t = r.start; t + 120 <= r.end; t += 120) {
        if (i === 0 && t < nowMin + 60) continue;
        slots.push({ label: `${hLabel(t)} - ${hLabel(t + 120)}`, start: t, end: t + 120, dateKey: key, dayName: DAY_NAME[day], dateShort: `${pad(c.d)}/${pad(c.m)}` });
      }
    }
    if (!slots.length) continue;
    const dayLabel = i === 0 ? "Aujourd'hui" : i === 1 ? 'Demain' : `${DAY_NAME[day]} ${c.d} ${MONTHS[c.m - 1]}`;
    out.push({ dayLabel, slots, slotCount: slots.length });
  }
  return out;
}

export const slotRange = (s: Slot) => `${hLabel(s.start)} à ${hLabel(s.end)}`;
export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
