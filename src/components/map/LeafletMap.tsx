import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-500.css';
import '@fontsource/roboto/latin-700.css';
import './map.css';
import L from 'leaflet';
import { LocateFixed, Maximize2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Supercluster from 'supercluster';
import type { Pharmacy } from '../../lib/data';
import { PharmacyCard } from '../PharmacyCard';
import type { MapViewProps } from './MapView';

// Mêmes constantes que la carte Google de l'original (module 9382).
const FRANCE_CENTER: L.LatLngTuple = [46.603354, 1.888334];
const INITIAL_ZOOM = 6;
const CLUSTER = { radius: 65, maxZoom: 11 };
const GREEN = '#0F352D';
const clusterSvg = (count: number) =>
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="${GREEN}" stroke="white" stroke-width="3" opacity="0.9"/><text x="25" y="25" text-anchor="middle" dy="0.35em" fill="white" font-family="Montserrat, sans-serif" font-size="16" font-weight="600">${count}</text></svg>`,
  );

// Fond de carte sans clé d'API : Esri World Topographic (rendu le plus proche de Google, cf. DECISIONS.md),
// avec bascule tuile par tuile vers OpenStreetMap en cas d'erreur.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  'Tuiles &copy; <a href="https://www.esri.com/">Esri</a> — Esri, HERE, Garmin, USGS, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const markerIcon = L.icon({ iconUrl: '/marker.svg', iconSize: [32, 48], iconAnchor: [16, 48] });
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const inFrance = (p: Pharmacy) => p.coordonnees.lat >= 41 && p.coordonnees.lat <= 51 && p.coordonnees.lng >= -5 && p.coordonnees.lng <= 10;

export default function LeafletMap({ pharmacies, focusedPharmacy, onPharmacyClick, showInfoWindow = true, isInitialView = false }: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const popupRef = useRef<L.Popup | null>(null);
  const [popupHost] = useState(() => document.createElement('div'));
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [camera, setCamera] = useState(false);
  const clickRef = useRef(onPharmacyClick);
  useEffect(() => { clickRef.current = onPharmacyClick; }, [onPharmacyClick]);
  // Ajustements d'état pendant le rendu (motif recommandé par React) : nouvelle liste → popup fermée ; nouveau focus → popup ouverte.
  const [prevList, setPrevList] = useState(pharmacies);
  const [prevFocus, setPrevFocus] = useState<Pharmacy | null | undefined>(undefined);
  if (prevList !== pharmacies) { setPrevList(pharmacies); setSelected(null); }
  if (prevFocus !== focusedPharmacy) { setPrevFocus(focusedPharmacy); if (focusedPharmacy) setSelected(focusedPharmacy); }
  const animate = !reducedMotion();

  const index = useMemo(() => {
    const sc = new Supercluster<{ i: number }>({ ...CLUSTER });
    sc.load(pharmacies.map((p, i) => ({ type: 'Feature', properties: { i }, geometry: { type: 'Point', coordinates: [p.coordonnees.lng, p.coordonnees.lat] } })));
    return sc;
  }, [pharmacies]);

  // Création de la carte (une fois).
  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, {
      center: FRANCE_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: false,
      zoomAnimation: animate,
      fadeAnimation: false, // le fondu Leaflet dépend de Date : inutile ici et bloquant sous horloge figée
      markerZoomAnimation: animate,
      inertia: animate,
      worldCopyJump: true,
    });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
    const tiles = L.tileLayer(ESRI, { maxZoom: 19, attribution: ATTRIBUTION, crossOrigin: true });
    tiles.on('tileerror', (e: L.TileErrorEvent) => {
      const img = e.tile as HTMLImageElement;
      const { x, y, z } = e.coords;
      if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = OSM.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y)); }
    });
    tiles.addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    popupRef.current = L.popup({ className: 'tc-popup', closeButton: false, autoPan: false, autoClose: false, closeOnClick: false, offset: [0, -40], minWidth: 380, maxWidth: 380 }).setContent(popupHost);
    map.on('zoomend', () => setZoom(map.getZoom()));
    mapRef.current = map;
    (window as unknown as { __tcMap?: L.Map }).__tcMap = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [animate, popupHost]);

  // Rendu des clusters / marqueurs (SuperCluster, mêmes paramètres que l'original).
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    const render = () => {
      layer.clearLayers();
      const b = map.getBounds().pad(0.5);
      const z = Math.round(map.getZoom());
      for (const f of index.getClusters([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], z)) {
        const [lng, lat] = f.geometry.coordinates;
        const props = f.properties as { cluster?: boolean; point_count?: number; i?: number; cluster_id?: number };
        if (props.cluster) {
          const count = props.point_count ?? 0;
          const m = L.marker([lat, lng], {
            icon: L.divIcon({ className: 'tc-cluster', html: '', iconSize: [50, 50], iconAnchor: [25, 25] }),
            zIndexOffset: 1000 + count,
            keyboard: true,
          });
          m.on('add', () => {
            const node = m.getElement();
            if (node) { node.style.backgroundImage = `url("${clusterSvg(count)}")`; node.setAttribute('aria-label', `Groupe de ${count} dispositifs`); }
          });
          m.on('click', () => map.setView([lat, lng], (map.getZoom() || 6) + 3, { animate }));
          layer.addLayer(m);
        } else {
          const p = pharmacies[props.i ?? 0];
          const m = L.marker([lat, lng], { icon: markerIcon, title: p.nom, alt: p.nom, keyboard: true });
          m.on('click', () => { setSelected(p); clickRef.current?.(p); });
          layer.addLayer(m);
        }
      }
    };
    render();
    map.on('moveend zoomend', render);
    return () => { map.off('moveend zoomend', render); };
  }, [index, pharmacies, animate]);

  // Cadrage : focus (zoom 16) sinon ajustement aux résultats situés en France (zoom ≤ 15).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (focusedPharmacy) {
      map.setView([focusedPharmacy.coordonnees.lat, focusedPharmacy.coordonnees.lng], 16, { animate });
      return;
    }
    if (!pharmacies.length || isInitialView) return;
    const pts = pharmacies.filter(inFrance);
    const bounds = L.latLngBounds((pts.length ? pts : pharmacies).map((p) => [p.coordonnees.lat, p.coordonnees.lng] as L.LatLngTuple));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: false });
  }, [pharmacies, focusedPharmacy, isInitialView, animate]);

  // Popup (portail React dans une popup Leaflet sans habillage).
  useEffect(() => {
    const map = mapRef.current;
    const popup = popupRef.current;
    if (!map || !popup) return;
    if (selected && showInfoWindow) popup.setLatLng([selected.coordonnees.lat, selected.coordonnees.lng]).openOn(map);
    else map.closePopup(popup);
  }, [selected, showInfoWindow]);

  const reset = () => {
    const map = mapRef.current;
    if (!map) return;
    map.panTo(FRANCE_CENTER, { animate });
    setTimeout(() => map.setZoom(INITIAL_ZOOM, { animate }), 300);
    setSelected(null);
  };
  const locate = () => {
    const map = mapRef.current;
    if (!navigator.geolocation || !map) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate });
    });
  };
  const fullscreen = () => {
    const node = regionRef.current;
    if (!node) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void node.requestFullscreen?.();
  };
  const btn = 'bg-white hover:bg-cream-hover text-tessan-green rounded-lg shadow-lg p-3 transition-colors duration-200 flex items-center gap-2 font-medium cursor-pointer';

  return (
    <div ref={regionRef} role="region" aria-label="Carte" data-zoom={zoom} data-animated={String(animate)} style={{ position: 'relative', width: '100%', height: '100%' }} className="tc-map">
      <div ref={el} style={{ width: '100%', height: '100%' }} className="isolate" />
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <button type="button" onClick={reset} className={btn} title="Réinitialiser la vue" aria-label="Réinitialiser la vue">
          <Maximize2 size={20} aria-hidden="true" />
          <span className="hidden sm:inline">Réinitialiser</span>
        </button>
        <button type="button" onClick={locate} className={btn} title="Me géolocaliser" aria-label="Me géolocaliser">
          <LocateFixed size={20} aria-hidden="true" />
          <span className="hidden sm:inline font-bold">Me géolocaliser</span>
        </button>
      </div>
      <button type="button" onClick={fullscreen} className="tc-map-ctrl absolute top-2.5 right-2.5 z-10" title="Passer en plein écran" aria-label="Passer en plein écran">
        <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><path fill="#666" d="M0 0v6h2V2h4V0H0zm16 0h-4v2h4v4h2V0h-2zm0 16h-4v2h6v-6h-2v4zM2 12H0v6h6v-2H2v-4z" /></svg>
      </button>
      <div className="absolute right-2.5 bottom-6 z-10 flex flex-col items-center gap-1">
        {camera && (
          <>
            <button type="button" className="tc-map-ctrl" aria-label="Zoom avant" onClick={() => mapRef.current?.zoomIn()}>+</button>
            <button type="button" className="tc-map-ctrl" aria-label="Zoom arrière" onClick={() => mapRef.current?.zoomOut()}>−</button>
          </>
        )}
        <button type="button" className="tc-map-ctrl rounded-full" aria-expanded={camera} onClick={() => setCamera((c) => !c)} title="Commandes de la caméra de la carte" aria-label="Commandes de la caméra de la carte">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="#666" d="M12 2 9 5h6l-3-3zm0 20 3-3H9l3 3zM2 12l3 3V9l-3 3zm20 0-3-3v6l3-3z" /></svg>
        </button>
      </div>
      {selected &&
        showInfoWindow &&
        createPortal(
          <div className="relative w-95" role="dialog" aria-label={selected.nom}>
            <button type="button" onClick={() => setSelected(null)} className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition" aria-label="Fermer la fiche">
              <X size={16} className="text-gray-600" aria-hidden="true" />
            </button>
            <div className="shadow-2xl rounded-popup overflow-hidden bg-white">
              <PharmacyCard pharmacy={selected} as="div" />
            </div>
            <div className="tc-popup-arrow absolute left-1/2 -translate-x-1/2 bg-white" />
          </div>,
          popupHost,
        )}
    </div>
  );
}
