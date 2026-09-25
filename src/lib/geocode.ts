// Géocodage via l'API Adresse (https://api-adresse.data.gouv.fr, gratuite et sans clé).
import type { LatLng } from './geo';

// Source principale : API Adresse (BAN). Repli : son successeur officiel sur la Géoplateforme IGN (même format
// GeoJSON, mêmes paramètres), utilisé seulement si l'API Adresse échoue au niveau réseau/HTTP.
export const ADRESSE_APIS = ['https://api-adresse.data.gouv.fr', 'https://data.geopf.fr/geocodage'];
export const GEOCODE_TIMEOUT_MS = 5000;
export class GeocodeTimeoutError extends Error {}
export class GeocodeUnavailableError extends Error {}

export type GeocodeResult = { label: string; city: string; postcode: string; coords: LatLng; type: string };

async function getJson(url: string, timeoutMs: number, signal?: AbortSignal) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new GeocodeTimeoutError('timeout')), timeoutMs);
  const onAbort = () => ctrl.abort(signal?.reason);
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new GeocodeUnavailableError(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (ctrl.signal.reason instanceof GeocodeTimeoutError) throw ctrl.signal.reason;
    if (e instanceof GeocodeUnavailableError) throw e;
    if ((e as Error)?.name === 'AbortError' && signal?.aborted) throw e;
    throw new GeocodeUnavailableError(String(e));
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

type Feature = { geometry: { coordinates: [number, number] }; properties: { label: string; city?: string; name?: string; postcode?: string; type: string } };
const toResult = (f: Feature): GeocodeResult => ({
  label: f.properties.label,
  city: f.properties.city || f.properties.name || f.properties.label,
  postcode: f.properties.postcode || '',
  coords: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
  type: f.properties.type,
});

/** Interroge l'API principale puis le repli, dans un budget de temps global (délai dépassé → GeocodeTimeoutError). */
async function query(path: string, timeoutMs: number, signal?: AbortSignal) {
  const deadline = Date.now() + timeoutMs;
  let last: unknown = null;
  for (const base of ADRESSE_APIS) {
    const left = deadline - Date.now();
    if (left <= 0) throw new GeocodeTimeoutError('timeout');
    try {
      return await getJson(`${base}${path}`, left, signal);
    } catch (e) {
      if (e instanceof GeocodeTimeoutError || signal?.aborted) throw e;
      last = e;
    }
  }
  throw last instanceof Error ? last : new GeocodeUnavailableError('indisponible');
}

/** Géocode une saisie libre (ville, code postal ou adresse), en France. */
export async function geocode(q0: string, opts: { limit?: number; signal?: AbortSignal; timeoutMs?: number; type?: 'municipality' } = {}): Promise<GeocodeResult[]> {
  const q = q0.trim();
  if (q.length < 3) return [];
  const type = opts.type ? `&type=${encodeURIComponent(opts.type)}` : '';
  const json = await query(`/search/?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(String(opts.limit ?? 5))}${type}`, opts.timeoutMs ?? GEOCODE_TIMEOUT_MS, opts.signal);
  return ((json?.features ?? []) as Feature[]).map(toResult);
}

/** Géocodage inverse : commune la plus proche d'une position. */
export async function reverseGeocode(pos: LatLng, timeoutMs = GEOCODE_TIMEOUT_MS): Promise<GeocodeResult | null> {
  const json = await query(`/reverse/?lon=${encodeURIComponent(String(pos.lng))}&lat=${encodeURIComponent(String(pos.lat))}&limit=1`, timeoutMs);
  const f = (json?.features ?? [])[0] as Feature | undefined;
  return f ? toResult(f) : null;
}
