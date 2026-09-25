import { ChevronDown, LoaderCircle, LocateFixed, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { loadPharmacies, type Pharmacy } from '../lib/data';
import { DEPARTMENTS, REGIONS, type LatLng } from '../lib/geo';
import { geocode, reverseGeocode } from '../lib/geocode';
import { localSuggestions, norm, runSearch, SearchMessageError, toSuggestion, type SearchOutput, type Suggestion } from '../lib/search';
import { SPECIALTIES, specialtyById } from '../lib/specialties';

type Props = {
  onSearchSubmit: (out: SearchOutput) => void;
  initialCity?: string;
  initialSpecialtyId?: string | null;
  /** Une recherche a déjà eu lieu (l'original garde la même instance de formulaire d'une page à l'autre). */
  initialSubmitted?: boolean;
};

const MSG_GENERIC = 'Une erreur est survenue lors de la recherche. Veuillez réessayer.';

/** Formulaire de recherche (spécialité, ville / code postal, géolocalisation) — reproduction du formulaire de l'original. */
const isAreaName = (text: string) => {
  const first = norm(text.split(',')[0]);
  return [...REGIONS, ...DEPARTMENTS].some((a) => norm(a) === first);
};
/** Suggestion locale (préfixe ou faute de frappe tolérée) ou nom commençant par la saisie. */
const matchesInput = (s: Suggestion, text: string) => s.id.startsWith('local-') || norm(s.name).startsWith(norm(text.split(',')[0]));

export function SearchForm({ onSearchSubmit, initialCity = '', initialSpecialtyId = null, initialSubmitted = false }: Props) {
  const uid = useId();
  const [city, setCity] = useState(initialCity);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(-1);
  const [specialtyId, setSpecialtyId] = useState<string | null>(initialSpecialtyId);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [postalCode, setPostalCode] = useState<string | null>(null);
  const [submittedOnce, setSubmittedOnce] = useState(initialSubmitted);
  const [remote, setRemote] = useState<{ q: string; list: Suggestion[] } | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [all, setAll] = useState<Pharmacy[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const coordsRef = useRef<LatLng | null>(null);
  const cacheRef = useRef(new Map<string, LatLng>());

  useEffect(() => {
    loadPharmacies().then(setAll, () => setAll([]));
  }, []);

  // Fermeture du menu des spécialités au clic extérieur (comme l'original).
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Suggestions : villes de l'échantillon (instantané) + communes de l'API Adresse (différé).
  const local = useMemo(() => (city.trim() ? localSuggestions(all, city.trim()) : []), [all, city]);
  useEffect(() => {
    const q = city.trim();
    if (!listOpen || q.length < 3) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      geocode(q, { limit: 5, type: 'municipality', signal: ctrl.signal, timeoutMs: 4000 })
        .then((res) => setRemote({ q, list: res.map(toSuggestion) }))
        .catch(() => { /* l'autocomplétion locale reste disponible */ });
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [city, listOpen]);
  const suggestions = useMemo(() => {
    const seen = new Set(local.map((s) => norm(s.name)));
    const extra = remote && remote.q === city.trim() ? remote.list.filter((s) => !seen.has(norm(s.name)) && seen.add(norm(s.name))) : [];
    return [...local, ...extra].slice(0, 5);
  }, [local, remote, city]);

  const submit = async (override?: { coords?: LatLng | null; postalCode?: string | null; text?: string; specialtyId?: string | null }) => {
    setSearching(true);
    setSubmittedOnce(true);
    setListOpen(false);
    try {
      const data = all.length ? all : await loadPharmacies();
      const out = await runSearch(data, {
        text: override?.text ?? city,
        coords: override && 'coords' in override ? override.coords ?? null : coordsRef.current ?? coords,
        postalCode: override && 'postalCode' in override ? override.postalCode ?? null : postalCode ?? (/^\d{5}$/.test(city.trim()) ? city.trim() : null),
        specialtyId: override && 'specialtyId' in override ? override.specialtyId ?? null : specialtyId,
      }, cacheRef.current);
      onSearchSubmit(out);
    } catch (e) {
      window.alert(e instanceof SearchMessageError ? e.message : MSG_GENERIC);
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const choose = async (s: Suggestion) => {
    setCity(s.name);
    setListOpen(false);
    setActive(-1);
    // Comme Google Places sur l'original : une commune n'a pas de composant « code postal » ;
    // seul un code postal saisi tel quel restreint la recherche à ce code.
    const pc = /^\d{5}$/.test(city.trim()) ? s.postcode || null : null;
    setPostalCode(pc);
    let c = s.coords;
    if (!c) {
      try {
        const g = await geocode(`${s.name} ${s.postcode}`.trim(), { limit: 1, type: 'municipality' });
        c = g[0]?.coords ?? null;
      } catch { c = null; }
    }
    coordsRef.current = c;
    setCoords(c);
    // Comme l'original (place_changed) : la sélection lance la recherche. Sans coordonnées → correspondance de ville.
    await submit({ text: s.name, coords: c, postalCode: pc });
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const open = listOpen && suggestions.length > 0;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!listOpen) setListOpen(true);
      setActive((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1));
    } else if (e.key === 'Enter') {
      if (open && active >= 0) { e.preventDefault(); void choose(suggestions[active]); }
      // Comme l'original (1ʳᵉ prédiction Google) : Entrée sans sélection prend la 1ʳᵉ suggestion, sinon le texte brut.
      // Une position déjà connue (géolocalisation, sélection) est conservée.
      // Seulement si la suggestion correspond vraiment à la saisie, et jamais pour un nom de région/département
      // (l'original les traite comme une zone entière, § 4.5).
      else if (!coordsRef.current && city.trim() && suggestions.length && !isAreaName(city) && matchesInput(suggestions[0], city)) { e.preventDefault(); void choose(suggestions[0]); }
    } else if (e.key === 'Escape') {
      if (listOpen) { e.preventDefault(); setListOpen(false); setActive(-1); }
    }
  };

  const clear = async () => {
    setCity('');
    setCoords(null);
    coordsRef.current = null;
    setPostalCode(null);
    setSearching(true);
    try {
      const data = await loadPharmacies();
      onSearchSubmit({ results: data, query: '', coords: null, postalCode: null });
    } finally {
      setSearching(false);
    }
  };

  const locate = () => {
    if (!('geolocation' in navigator) || !navigator.geolocation) {
      window.alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        coordsRef.current = c;
        try {
          const r = await reverseGeocode(c);
          if (r) {
            if (r.postcode) setPostalCode(r.postcode);
            setCity(r.city || r.postcode || r.label);
          } else window.alert('Impossible de déterminer votre adresse');
        } catch {
          window.alert("Le service de géolocalisation n'est pas disponible");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        let msg = 'Erreur de géolocalisation';
        if (err.code === err.PERMISSION_DENIED) msg = "Vous avez refusé l'accès à votre position";
        else if (err.code === err.POSITION_UNAVAILABLE) msg = "Votre position n'est pas disponible";
        else if (err.code === err.TIMEOUT) msg = 'La demande de géolocalisation a expiré';
        window.alert(msg);
      },
      { timeout: 10000 },
    );
  };

  const selected = specialtyId ? specialtyById(specialtyId) : null;
  const menuItems = useMemo(() => [...SPECIALTIES.map((s) => ({ id: s.id, label: s.label })), ...(selected ? [{ id: '', label: 'Effacer le filtre' }] : [])], [selected]);
  const pickSpecialty = (id: string) => {
    const next = id === specialtyId || id === '' ? null : id;
    setSpecialtyId(next);
    setMenuOpen(false);
    setMenuActive(-1);
    triggerRef.current?.focus();
    // Changement de spécialité après une première recherche : relance automatique (comportement de l'original).
    if (next !== specialtyId && submittedOnce && (city.trim() || coords)) void submit({ specialtyId: next });
  };
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setMenuActive((i) => (i + 1) % menuItems.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setMenuActive((i) => (i <= 0 ? menuItems.length - 1 : i - 1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (menuActive >= 0) pickSpecialty(menuItems[menuActive].id); }
    else if (e.key === 'Escape') { e.preventDefault(); setMenuOpen(false); triggerRef.current?.focus(); }
    else if (e.key === 'Tab') setMenuOpen(false);
  };
  const focusMenuRef = useRef(false);
  useEffect(() => { if (menuOpen && focusMenuRef.current) listboxMenuRef.current?.focus(); }, [menuOpen]);

  const listId = `${uid}-suggestions`;
  const menuId = `${uid}-specialites`;
  const showList = listOpen && city.trim().length > 0 && suggestions.length > 0;
  const q = norm(city);

  return (
    <form ref={formRef} onSubmit={onSubmit} role="search" className="flex flex-col lg:flex-row gap-4 md:gap-[1.2rem] items-stretch">
      <div className="w-full md:min-w-70 md:w-auto relative" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={(e) => {
            // Ouverture au clavier (detail = 0) : le focus passe dans la liste ; à la souris il reste sur le bouton (anneau bleu de l'original).
            focusMenuRef.current = e.detail === 0;
            setMenuOpen((o) => !o);
          }}
          onKeyDown={(e) => {
            if (menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); listboxMenuRef.current?.focus(); onMenuKey(e as unknown as KeyboardEvent<HTMLDivElement>); }
          }}
          className={`w-full h-11 flex items-center font-semibold justify-between space-x-2 border rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer ${selected ? 'border-tessan-green bg-tessan-green text-white' : 'border-tessan-green-hover text-tessan-green-hover hover:bg-tessan-green-hover hover:text-white'}`}
        >
          <span className="truncate">{selected ? selected.label : 'Spécialités médicales'}</span>
          <ChevronDown size={20} aria-hidden="true" className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>
        {menuOpen && (
          <div
            ref={listboxMenuRef}
            id={menuId}
            role="listbox"
            tabIndex={-1}
            aria-label="Spécialités médicales"
            aria-activedescendant={menuActive >= 0 ? `${menuId}-${menuActive}` : undefined}
            onKeyDown={onMenuKey}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden focus:outline-none"
          >
            {menuItems.map((it, i) =>
              it.id ? (
                <div
                  key={it.id}
                  id={`${menuId}-${i}`}
                  role="option"
                  aria-selected={specialtyId === it.id}
                  onClick={() => pickSpecialty(it.id)}
                  onMouseEnter={() => setMenuActive(i)}
                  className={`w-full text-left px-4 py-3 hover:bg-tessan-green/10 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer ${specialtyId === it.id || menuActive === i ? 'bg-tessan-green/10' : ''}`}
                >
                  <div className="font-semibold text-gray-800 flex items-center justify-between">
                    <span>{it.label}</span>
                    {specialtyId === it.id && <span className="text-tessan-green" aria-hidden="true">✓</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1" />
                </div>
              ) : (
                <div
                  key="clear"
                  id={`${menuId}-${i}`}
                  role="option"
                  aria-selected={false}
                  onClick={() => pickSpecialty('')}
                  className={`w-full text-left px-4 py-2 text-sm text-tessan-green-hover hover:bg-gray-50 border-t border-gray-200 cursor-pointer ${menuActive === i ? 'bg-gray-50' : ''}`}
                >
                  Effacer le filtre
                </div>
              ),
            )}
          </div>
        )}
      </div>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="Ville / Code postal"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          value={city}
          placeholder="Ville / Code postal"
          onChange={(e) => {
            setCity(e.target.value);
            setListOpen(true);
            setActive(-1);
            coordsRef.current = null;
            setCoords(null);
            setPostalCode(null); // une nouvelle saisie annule le code postal d'une géolocalisation ou d'une sélection
          }}
          onFocus={() => city && setListOpen(true)}
          onBlur={() => setTimeout(() => setListOpen(false), 150)}
          onKeyDown={onInputKey}
          className="flex bg-transparent py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full h-11 border border-gray-300 rounded-lg px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {showList && (
          <ul id={listId} role="listbox" aria-label="Suggestions" className="pac-list absolute left-0 top-full w-full mt-1 bg-white border border-pac-border rounded-lg shadow-lg z-[9999] overflow-hidden max-sm:max-w-[calc(100vw-2rem)]">
            {suggestions.map((s, i) => {
              const n = norm(s.name);
              const m = n.startsWith(q) ? s.name.slice(0, q.length) : '';
              return (
                <li
                  key={s.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void choose(s)}
                  onMouseEnter={() => setActive(i)}
                  className={`px-4 py-3 max-sm:px-3.5 max-sm:py-2.5 cursor-pointer border-t border-pac-item-border first:border-t-0 leading-normal text-sm transition-colors truncate ${i === active ? 'bg-pac-item-hover' : 'hover:bg-pac-item-hover'}`}
                >
                  <span className="text-pac-query font-medium text-sm pr-0.75">
                    {m && <span className="font-semibold text-pac-matched">{m}</span>}
                    {s.name.slice(m.length)}
                  </span>{' '}
                  <span className="text-pac-secondary text-[0.8125rem]">{s.secondary}</span>
                </li>
              );
            })}
          </ul>
        )}
        {city && (
          <button
            type="button"
            onClick={() => void clear()}
            className="absolute top-1/2 right-12 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Effacer la recherche"
            aria-label="Effacer la recherche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => { if (!locating) locate(); }}
          // aria-disabled plutôt que disabled : le bouton garde le focus clavier pendant la recherche de position.
          aria-disabled={locating}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-tessan-green-hover transition-colors aria-disabled:opacity-50 aria-disabled:cursor-not-allowed cursor-pointer"
          title="Me géolocaliser"
          aria-label="Me géolocaliser"
        >
          {locating ? <LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> : <LocateFixed size={20} aria-hidden="true" />}
        </button>
      </div>
      <button
        type="submit"
        disabled={searching}
        className="w-full md:min-w-72 md:w-auto h-11 flex items-center justify-center gap-2 bg-tessan-green hover:bg-tessan-green-hover text-white font-semibold rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {searching ? (
          <>
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
            <span>Recherche...</span>
          </>
        ) : (
          <>
            <Search size={20} aria-hidden="true" />
            <span>Recherche</span>
          </>
        )}
      </button>
    </form>
  );
}
