import type { Pharmacy } from './data';
import { departmentCode, departmentNameOf, haversineKm, regionOf, type LatLng } from './geo';

export type Area = { key: string; name: string; count: number; avgDistance: number };
export const PARIS: LatLng = { lat: 48.8566, lng: 2.3522 };

function group(list: Pharmacy[], from: LatLng, keyOf: (p: Pharmacy) => string, nameOf: (k: string, p: Pharmacy) => string, exclude?: string): Area[] {
  const m = new Map<string, { name: string; d: number[] }>();
  for (const p of list) {
    const k = keyOf(p);
    if (!k || k === exclude) continue;
    const g = m.get(k) ?? { name: nameOf(k, p), d: [] };
    g.d.push(haversineKm(from, p.coordonnees));
    m.set(k, g);
  }
  return [...m.entries()]
    .map(([key, g]) => ({ key, name: g.name, count: g.d.length, avgDistance: g.d.reduce((a, b) => a + b, 0) / g.d.length }))
    .sort((a, b) => a.avgDistance - b.avgDistance)
    .slice(0, 10);
}

/** 10 départements et 10 régions les plus proches (distance moyenne de leurs dispositifs), comme l'original. */
export function nearbyAreas(list: Pharmacy[], from: LatLng, excludeDeptCode?: string) {
  return {
    departments: group(list, from, (p) => departmentCode(p.codePostal), (k) => departmentNameOf(k.length === 2 ? `${k}000` : k), excludeDeptCode),
    regions: group(list, from, (p) => regionOf(p.codePostal), (k) => k),
  };
}
