// Horaires et statut d'ouverture. Même algorithme et mêmes textes que l'original,
// mais l'heure est TOUJOURS lue dans le fuseau Europe/Paris (l'original utilise l'heure locale du navigateur).

export const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'] as const;
export type Day = (typeof DAYS)[number];
export type Hours = Record<Day, string>;
export const DAY_LABEL: Record<Day, string> = {
  lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi', jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche',
};
export const WEEK_FROM_MONDAY: Day[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

type Range = { start: number; end: number };
const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export function parseRanges(value: string | null | undefined): Range[] {
  if (!value || value.trim().toLowerCase() === 'fermé') return [];
  const out: Range[] = [];
  for (const part of value.split(',').map((s) => s.trim())) {
    const [a, b] = part.split('-').map((s) => s.trim());
    if (!a || !b) continue;
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    if ([ah, am, bh, bm].some((n) => Number.isNaN(n))) continue;
    out.push({ start: ah * 60 + am, end: bh * 60 + bm });
  }
  return out;
}

const PARIS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23',
});
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Composantes de date/heure à Paris pour un instant donné. */
export function parisParts(date: Date = new Date()) {
  const p = Object.fromEntries(PARIS.formatToParts(date).map((x) => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, weekday: WD[p.weekday], minutes: +p.hour * 60 + +p.minute };
}
export const parisDay = (date: Date = new Date()): Day => DAYS[parisParts(date).weekday];

export type Status = { isOpen: boolean; displayText: string; closingTime?: string; reopeningTime?: string };

export function openingStatus(hours: Partial<Hours>, now: Date = new Date()): Status {
  const { weekday, minutes } = parisParts(now);
  const today = parseRanges(hours[DAYS[weekday]]);
  for (const r of today) {
    if (minutes >= r.start && minutes < r.end) {
      const next = today.find((x) => x.start > r.end);
      const closing = hhmm(r.end);
      return {
        isOpen: true,
        closingTime: closing,
        reopeningTime: next ? hhmm(next.start) : undefined,
        displayText: next ? `Ouvert · Ferme à ${closing} (Réouvre à ${hhmm(next.start)})` : `Ouvert · Ferme à ${closing}`,
      };
    }
  }
  const beforeFirst = today.length > 0 && minutes < today[0].start;
  let when: string | undefined;
  const laterToday = today.find((r) => r.start > minutes);
  if (laterToday) when = hhmm(laterToday.start);
  else {
    for (let i = 1; i <= 7; i++) {
      const day = DAYS[(weekday + i) % 7];
      const ranges = parseRanges(hours[day]);
      if (ranges.length) {
        when = i === 1 ? `demain à ${hhmm(ranges[0].start)}` : `${day} à ${hhmm(ranges[0].start)}`;
        break;
      }
    }
  }
  if (!when) return { isOpen: false, displayText: 'Fermé' };
  const otherDay = when.includes('demain') || WEEK_FROM_MONDAY.some((d) => when!.includes(d));
  const verb = beforeFirst || otherDay ? 'Ouvre' : 'Réouvre';
  return { isOpen: false, reopeningTime: when, displayText: `Fermé · ${verb} ${when}` };
}
