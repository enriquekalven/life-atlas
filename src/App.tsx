import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Bone,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  Dices,
  Eye,
  Globe,
  HeartPulse,
  Layers,
  MapPin,
  Moon,
  Pause,
  Play,
  Radio,
  Ruler,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Thermometer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CURATED_ANIMALS } from './data/animals';
import {
  AnatomyHotspot,
  AnatomyLayer,
  AnimalRecord,
  GeologicalEraId,
} from './types/atlas';
import { Globe3D } from './components/Globe3D';
import { Animal3DViewer, CameraFocusMode } from './components/Animal3DViewer';
import { AnatomyInspector, LAYER_CONFIG } from './components/AnatomyInspector';
import { GeologicalTimeline } from './components/GeologicalTimeline';
import { GlobalTaxonomyBrowser } from './components/GlobalTaxonomyBrowser';
import { QuizModal } from './components/QuizModal';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import {
  searchLiveEncyclopedia,
  validateSearchQuery,
} from './services/encyclopediaApi';
import {
  applyDocumentLang,
  detectInitialLang,
  isSupportedLang,
  SUPPORTED_LANGUAGES,
  SupportedLang,
  UI_STRINGS,
} from './i18n';
import {
  ConsentState,
  loadGa4IfConsented,
  readConsentState,
  saveConsentState,
  trackAtlasEvent,
} from './services/analytics';
import {
  playAnimalVocalization,
  playLocalizedNarration,
  stopAllNarration,
} from './services/narrationAudio';
import {
  HERO_SHOWCASE_ANIMAL_IDS,
  pickRandomFromIds,
  selectInitialLandingAnimalId,
} from './data/randomLanding';
import { ENCYCLOPEDIA_UI_LABELS } from './data/encyclopediaUiLabels';
import { getLocalizedSpeciesNarration } from './data/localizedNarrations';
import { getOcularBiology } from './data/ocularBiology';

const VALID_LAYERS: AnatomyLayer[] = ['exterior', 'muscular', 'skeletal', 'organs'];
const VALID_MODES = ['encyclopedia', 'anatomy', 'map', 'vision', 'catalog'] as const;
export type EncyclopediaWorkspaceMode = (typeof VALID_MODES)[number];

/** Reads shareable UI state from the URL; every value is validated against an allow-list. */
function readUrlState() {
  if (typeof window === 'undefined') {
    return {
      animalId: null as string | null,
      layer: null as AnatomyLayer | null,
      mode: null as EncyclopediaWorkspaceMode | null,
      focus: 'body' as CameraFocusMode,
      kid: false,
      pins: false,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const rawAnimal = params.get('animal') ?? '';
  const animalId = CURATED_ANIMALS.some((a) => a.id === rawAnimal) ? rawAnimal : null;
  const rawLayer = params.get('layer') ?? '';
  const layer = (VALID_LAYERS as string[]).includes(rawLayer)
    ? (rawLayer as AnatomyLayer)
    : null;
  const rawMode = params.get('mode') ?? '';
  const mode = (VALID_MODES as readonly string[]).includes(rawMode)
    ? (rawMode as EncyclopediaWorkspaceMode)
    : null;
  const rawFocus = params.get('focus') ?? '';
  const focus: CameraFocusMode =
    rawFocus === 'eye' || rawFocus === 'head' ? rawFocus : 'body';
  return {
    animalId,
    layer,
    mode,
    focus,
    kid: params.get('kid') === '1',
    pins: params.get('pins') === '1',
  };
}

export function App() {
  const initialUrl = useMemo(readUrlState, []);
  const [lang, setLang] = useState<SupportedLang>(() => detectInitialLang());
  const t = UI_STRINGS[lang];
  const enc = ENCYCLOPEDIA_UI_LABELS[lang] ?? ENCYCLOPEDIA_UI_LABELS.en;

  const [consent, setConsent] = useState<ConsentState>(() => readConsentState());
  const [showConsentBanner, setShowConsentBanner] = useState<boolean>(
    () => readConsentState() === 'unset'
  );

  const [customAnimals, setCustomAnimals] = useState<AnimalRecord[]>([]);
  const allAnimals = useMemo(
    () => [...CURATED_ANIMALS, ...customAnimals],
    [customAnimals]
  );

  // Randomize initial landing specimen whenever ?animal= is not explicitly specified
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(() =>
    selectInitialLandingAnimalId(initialUrl.animalId)
  );

  const [activeMode, setActiveMode] = useState<EncyclopediaWorkspaceMode>(() => {
    if (initialUrl.mode) return initialUrl.mode;
    if (initialUrl.focus === 'eye') return 'vision';
    if (initialUrl.layer && initialUrl.layer !== 'exterior') return 'anatomy';
    return 'encyclopedia';
  });

  const [cameraFocus, setCameraFocus] = useState<CameraFocusMode>(initialUrl.focus);

  const [temporalFilter, setTemporalFilter] = useState<
    'all' | 'living' | 'extinct'
  >('all');
  const [selectedEra, setSelectedEra] = useState<GeologicalEraId>('all');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedClimate, setSelectedClimate] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');

  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchingApi, setIsSearchingApi] = useState<boolean>(false);
  const [apiSearchError, setApiSearchError] = useState<string | null>(null);

  const [activeLayer, setActiveLayer] = useState<AnatomyLayer>(
    initialUrl.layer ?? 'exterior'
  );
  const [selectedHotspot, setSelectedHotspot] = useState<AnatomyHotspot | null>(
    () => {
      const startAnimal =
        CURATED_ANIMALS.find((a) => a.id === selectedAnimalId) ??
        CURATED_ANIMALS[0];
      return startAnimal.anatomyHotspots[0] ?? null;
    }
  );
  const [showKidScale, setShowKidScale] = useState<boolean>(initialUrl.kid);
  const [showPins, setShowPins] = useState<boolean>(initialUrl.pins);
  const effectiveShowPins =
    showPins || activeMode === 'anatomy' || activeLayer !== 'exterior';
  const [showClimateBands, setShowClimateBands] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
    try {
      const saved = window.localStorage.getItem('tf-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore storage failure
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', theme === 'light' ? '#f8f6f0' : '#04070d');
      }
    }
    try {
      window.localStorage.setItem('tf-theme', theme);
    } catch {
      // ignore storage failure
    }
  }, [theme]);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPlayingHeroCall, setIsPlayingHeroCall] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  const heroStageRef = useRef<HTMLElement | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    applyDocumentLang(lang);
    stopAllNarration();
    setIsSpeaking(false);
  }, [lang]);

  useEffect(() => {
    loadGa4IfConsented();
  }, []);

  const selectedAnimal = useMemo(
    () =>
      allAnimals.find((a) => a.id === selectedAnimalId) || CURATED_ANIMALS[0],
    [allAnimals, selectedAnimalId]
  );

  const selectedIndex = useMemo(() => {
    const idx = allAnimals.findIndex((a) => a.id === selectedAnimal.id);
    return idx >= 0 ? idx : 0;
  }, [allAnimals, selectedAnimal.id]);

  const isPhotorealShowcase = useMemo(
    () => HERO_SHOWCASE_ANIMAL_IDS.includes(selectedAnimal.id),
    [selectedAnimal.id]
  );

  const ocularProfile = useMemo(
    () => getOcularBiology(selectedAnimal),
    [selectedAnimal]
  );

  // Sync default hotspot & stop active narration when switching animal
  useEffect(() => {
    const matchingLayerSpot =
      selectedAnimal.anatomyHotspots.find((h) => h.layer === activeLayer) ||
      selectedAnimal.anatomyHotspots[0] ||
      null;
    setSelectedHotspot(matchingLayerSpot);
    trackAtlasEvent('select_animal', {
      animal_id: selectedAnimal.id,
      era_id: selectedAnimal.eraId,
    });
    stopAllNarration();
    setIsSpeaking(false);
    setIsPlayingHeroCall(false);
  }, [selectedAnimal.id]);

  const filteredAnimals = useMemo(() => {
    return allAnimals.filter((animal) => {
      if (
        temporalFilter !== 'all' &&
        animal.temporalStatus !== temporalFilter
      ) {
        return false;
      }
      if (selectedEra !== 'all' && animal.eraId !== selectedEra) {
        return false;
      }
      if (
        selectedContinent !== 'All' &&
        !animal.continents.some((c) =>
          c.toLowerCase().includes(selectedContinent.toLowerCase())
        )
      ) {
        return false;
      }
      if (
        selectedClimate !== 'All' &&
        animal.climateZone !== selectedClimate
      ) {
        return false;
      }
      if (
        selectedClass !== 'All' &&
        animal.taxonomy.class !== selectedClass
      ) {
        return false;
      }
      if (searchInput.trim().length > 0) {
        const q = searchInput.trim().toLowerCase();
        const hay = `${animal.commonName} ${animal.scientificName} ${animal.regionDescription} ${animal.climateZone} ${animal.taxonomy.class}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [
    allAnimals,
    temporalFilter,
    selectedEra,
    selectedContinent,
    selectedClimate,
    selectedClass,
    searchInput,
  ]);

  const handleSelectAnimal = useCallback(
    (animal: AnimalRecord, scrollToStage = false) => {
      setSelectedAnimalId(animal.id);
      if (cameraFocus === 'eye' && activeMode !== 'vision') {
        setCameraFocus('body');
      }
      if (scrollToStage && heroStageRef.current) {
        heroStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [cameraFocus, activeMode]
  );

  const handleRandomAnimal = useCallback(() => {
    const poolIds =
      filteredAnimals.length > 1
        ? filteredAnimals.map((a) => a.id)
        : allAnimals.map((a) => a.id);
    const nextId = pickRandomFromIds(poolIds, selectedAnimal.id);
    setSelectedAnimalId(nextId);
    if (activeMode !== 'vision') {
      setCameraFocus('body');
    }
  }, [filteredAnimals, allAnimals, selectedAnimal.id, activeMode]);

  const handleStepAnimal = useCallback(
    (delta: -1 | 1) => {
      const list = filteredAnimals.length > 0 ? filteredAnimals : allAnimals;
      if (list.length === 0) return;
      const curIdx = list.findIndex((a) => a.id === selectedAnimal.id);
      const nextIdx =
        curIdx === -1
          ? 0
          : (curIdx + delta + list.length) % list.length;
      setSelectedAnimalId(list[nextIdx].id);
      if (activeMode !== 'vision') {
        setCameraFocus('body');
      }
    },
    [filteredAnimals, allAnimals, selectedAnimal.id, activeMode]
  );

  const handleSwitchMode = useCallback(
    (mode: EncyclopediaWorkspaceMode, scrollIntoView = false) => {
      setActiveMode(mode);
      if (mode === 'vision') {
        setCameraFocus('eye');
      } else {
        if (cameraFocus === 'eye') {
          setCameraFocus('body');
        }
        if (mode !== 'anatomy') {
          setActiveLayer('exterior');
        }
      }
      if (scrollIntoView && workspaceRef.current) {
        workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [cameraFocus]
  );

  const handleGlobalApiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiSearchError(null);

    // If user typed a matching local curated animal name, jump straight to it if exact/partial match
    const qLower = searchInput.trim().toLowerCase();
    const localMatch = allAnimals.find(
      (a) =>
        a.commonName.toLowerCase().includes(qLower) ||
        a.scientificName.toLowerCase().includes(qLower)
    );
    if (localMatch && qLower.length >= 2) {
      setSelectedAnimalId(localMatch.id);
    }

    const validated = validateSearchQuery(searchInput);
    if (!validated) {
      setApiSearchError(
        'Please enter 2–60 letters or numbers to search global biodiversity & fossil databases.'
      );
      return;
    }

    setIsSearchingApi(true);
    const { records: liveRecords, excludedDinosaurs } =
      await searchLiveEncyclopedia(validated);
    setIsSearchingApi(false);

    if (excludedDinosaurs) {
      setApiSearchError(
        `"${validated}" is a dinosaur! Dinosaurs have their own atlas: DinoVerse 3D (dino-portal-3d.web.app).`
      );
      return;
    }
    if (liveRecords.length === 0) {
      if (!localMatch) {
        setApiSearchError(
          `No extra external species found for "${validated}", showing matching curated species.`
        );
      }
      return;
    }

    setCustomAnimals((prev) => {
      const existingIds = new Set(prev.map((p) => p.scientificName));
      const newOnes = liveRecords.filter(
        (r) => !existingIds.has(r.scientificName)
      );
      return [...newOnes, ...prev];
    });
    setSelectedAnimalId(liveRecords[0].id);
  };

  const handleSpeakText = (
    text: string,
    options?: { preferStudioAudio?: boolean; animalId?: string }
  ) => {
    void playLocalizedNarration({
      text,
      lang,
      animalId: options?.animalId ?? selectedAnimal.id,
      preferStudioAudio: options?.preferStudioAudio ?? true,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeaking = () => {
    stopAllNarration();
    setIsSpeaking(false);
  };

  const handleHeroNarrateToggle = () => {
    if (isSpeaking) {
      handleStopSpeaking();
      return;
    }
    const text = getLocalizedSpeciesNarration(selectedAnimal, lang);
    handleSpeakText(text, { preferStudioAudio: true, animalId: selectedAnimal.id });
  };

  const handleHeroAnimalCall = () => {
    setIsPlayingHeroCall(true);
    playAnimalVocalization(selectedAnimal, () => {
      setIsPlayingHeroCall(false);
    });
  };

  const handleCompleteBadge = (animalId: string) => {
    setEarnedBadges((prev) =>
      prev.includes(animalId) ? prev : [...prev, animalId]
    );
  };

  const continentOptions = [
    'All',
    'North America',
    'South America',
    'Africa',
    'Europe',
    'Asia',
    'Australia',
    'Antarctica',
    'Pacific Ocean',
    'Atlantic Ocean',
    'Indian Ocean',
  ];

  const climateOptions = [
    'All',
    'Tropical Rainforest',
    'Savanna & Grassland',
    'Arid Desert',
    'Boreal & Taiga',
    'Polar & Tundra',
    'Pelagic Ocean',
    'Coral Reef & Shallow Seas',
    'Abyssal Deep Sea',
    'Freshwater River & Wetland',
    'Mountain & Alpine',
    'Prehistoric Greenhouse',
  ];

  const classOptions = [
    'All',
    'Mammalia',
    'Aves',
    'Reptilia',
    'Amphibia',
    'Chondrichthyes',
    'Actinopterygii',
    'Sarcopterygii',
    'Cephalopoda',
    'Arthropoda',
    'Trilobita',
    'Merostomata',
    'Scyphozoa',
    'Synapsida',
    'Placodermi',
  ];

  const modeTabs: Array<{
    id: EncyclopediaWorkspaceMode;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accentActive: string;
  }> = [
    {
      id: 'encyclopedia',
      title: enc.modeReadListen,
      subtitle: enc.modeReadListenSub,
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
      accentActive:
        'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20',
    },
    {
      id: 'anatomy',
      title: enc.modeAnatomy,
      subtitle: enc.modeAnatomySub,
      icon: <Bone className="w-4 h-4 shrink-0" />,
      accentActive:
        'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20',
    },
    {
      id: 'map',
      title: enc.modeWorldMap,
      subtitle: enc.modeWorldMapSub,
      icon: <Globe className="w-4 h-4 shrink-0" />,
      accentActive:
        'bg-sky-400 text-slate-950 border-sky-300 shadow-lg shadow-sky-400/20',
    },
    {
      id: 'vision',
      title: enc.modeVisionLab,
      subtitle: enc.modeVisionLabSub,
      icon: <Eye className="w-4 h-4 shrink-0" />,
      accentActive:
        'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20',
    },
    {
      id: 'catalog',
      title: `${enc.modeCatalog} (${allAnimals.length})`,
      subtitle: enc.modeCatalogSub,
      icon: <Compass className="w-4 h-4 shrink-0" />,
      accentActive:
        'bg-teal-400 text-slate-950 border-teal-300 shadow-lg shadow-teal-400/20',
    },
  ];

  return (
    <div className="tf-app-shell min-h-screen bg-[#04070d] text-slate-100 flex flex-col selection:bg-emerald-500/30">
      {/* Compact Museum Encyclopedia Top Masthead */}
      <header className="tf-masthead sticky top-0 z-50 bg-[#04070d]/92 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-5 py-2.5">
        <div className="max-w-[1640px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Globe className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
                  TerraFauna 3D
                </h1>
                <span className="hidden xl:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
                  {enc.encyclopediaEdition}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block leading-tight mt-0.5">
                {t.subtitleBadge} • 541M Years of Living &amp; Extinct Fauna
              </p>
            </div>
          </div>

          {/* Global Encyclopedia Search + Random Animal Button */}
          <div className="flex items-center gap-2 flex-1 max-w-xl justify-center">
            <form
              onSubmit={handleGlobalApiSearch}
              className="flex items-center gap-1.5 flex-1"
            >
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (e.target.value.trim().length > 0 && activeMode !== 'catalog') {
                      setActiveMode('catalog');
                    }
                  }}
                  placeholder={t.searchPlaceholder}
                  aria-label="Search animals or query live GBIF and Paleobiology databases"
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/90 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingApi}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition cursor-pointer shrink-0"
                title="Search 2.1 Million+ Species in GBIF & Paleobiology Database"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSearchingApi ? t.searchingBtn : t.liveDbBtn}</span>
              </button>
            </form>

            <button
              type="button"
              data-testid="random-animal-btn"
              onClick={handleRandomAnimal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition cursor-pointer shadow-md shadow-amber-500/15 shrink-0"
              title="Discover a random 3D species from the encyclopedia"
            >
              <Dices className="w-4 h-4" />
              <span>{enc.randomAnimalBtn}</span>
            </button>
          </div>

          {/* Right Controls: Badges, 11-Language Selector, Cookie Prefs */}
          <div className="flex items-center gap-2">
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/12 border border-amber-500/35 text-amber-300 text-xs font-bold"
              title={t.badgesLabel}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {earnedBadges.length}/{allAnimals.length}
              </span>
            </div>

            <select
              data-testid="language-select"
              value={lang}
              aria-label="Select interface language"
              onChange={(e) => {
                const val = e.target.value;
                if (isSupportedLang(val)) {
                  stopAllNarration();
                  setIsSpeaking(false);
                  setLang(val);
                  trackAtlasEvent('switch_language', { lang: val });
                }
              }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              title={
                theme === 'dark'
                  ? 'Switch to Natural History Field Guide (Light Theme)'
                  : 'Switch to Bioluminescent Abyssal Museum (Dark Theme)'
              }
              aria-label="Toggle light and dark theme"
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-sky-400" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowConsentBanner((prev) => !prev)}
              title={t.cookieButtonTitle}
              aria-label={t.cookieButtonTitle}
              className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                consent === 'granted'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {apiSearchError && (
          <div className="max-w-[1640px] mx-auto mt-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
            <span>{apiSearchError}</span>
            <button
              type="button"
              onClick={() => setApiSearchError(null)}
              className="text-amber-300 hover:text-white font-bold px-1.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Main Encyclopedia Stage & Interactive Mode Workspaces */}
      <main className="max-w-[1640px] w-full mx-auto px-3 sm:px-5 pt-3 pb-10 space-y-4 flex-1">
        {/* ===================================================================== */}
        {/* GRAND CENTERPIECE 3D ANIMAL SPECIMEN STAGE                            */}
        {/* ===================================================================== */}
        <section
          ref={heroStageRef}
          aria-label="Centerpiece 3D Animal Specimen Stage"
          className="flex flex-col gap-2.5"
        >
          {/* Mobile-only Specimen Plaque above 3D Canvas so phone viewports stay 100% unobstructed */}
          <div className="md:hidden p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                  {enc.specimenCounterPrefix} {selectedIndex + 1}/{allAnimals.length}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedAnimal.temporalStatus === 'extinct'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedAnimal.temporalStatus === 'extinct' ? (
                    <span className="inline-flex items-center gap-1">
                      <Bone className="w-3 h-3" aria-hidden="true" />
                      <span>{selectedAnimal.timeRangeMya}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" aria-hidden="true" />
                      <span>{selectedAnimal.conservationStatus}</span>
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleStepAnimal(-1)}
                  aria-label={enc.prevSpecimen}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepAnimal(1)}
                  aria-label={enc.nextSpecimen}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-200 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {selectedAnimal.commonName}{' '}
                <span className="text-xs font-normal italic text-slate-400">
                  ({selectedAnimal.scientificName})
                </span>
              </h2>
              <p className="text-xs text-amber-300 font-medium mt-0.5">
                {selectedAnimal.kidHeadline}
              </p>
            </div>
          </div>

          {/* Full-Width 3D Centerpiece Viewport */}
          <div className="relative w-full h-[430px] sm:h-[520px] md:h-[64vh] lg:h-[71vh] min-h-[420px] max-h-[780px]">
            <SceneErrorBoundary title="The 3D Animal Encyclopedia Stage">
              <Animal3DViewer
                animal={selectedAnimal}
                activeLayer={activeLayer}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={(spot) => {
                  setActiveLayer(spot.layer);
                  setSelectedHotspot(spot);
                }}
                showKidScale={showKidScale}
                isAnimating={isAnimating}
                showPins={effectiveShowPins}
                cameraFocus={cameraFocus}
                onCameraFocusChange={setCameraFocus}
                heroStage={true}
              />
            </SceneErrorBoundary>

            {/* Desktop Floating Top-Left Museum Specimen Plaque (Non-blocking outside buttons) */}
            <div className="hidden md:flex flex-col gap-2.5 absolute top-3.5 left-3.5 z-20 max-w-[390px] p-4 rounded-2xl bg-slate-950/78 backdrop-blur-xl border border-slate-800/90 shadow-2xl pointer-events-none">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-800/90 text-slate-300 border border-slate-700/70">
                  {enc.specimenCounterPrefix} {String(selectedIndex + 1).padStart(2, '0')} / {allAnimals.length}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    selectedAnimal.temporalStatus === 'extinct'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedAnimal.temporalStatus === 'extinct' ? (
                    <span className="inline-flex items-center gap-1">
                      <Bone className="w-3 h-3" aria-hidden="true" />
                      <span>{selectedAnimal.timeRangeMya}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" aria-hidden="true" />
                      <span>{selectedAnimal.conservationStatus}</span>
                    </span>
                  )}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-sky-300 border border-slate-800">
                  {selectedAnimal.taxonomy.class}
                </span>
                {isPhotorealShowcase && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/15 text-amber-200 border border-amber-400/35 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    <span>{enc.museumScanBadge}</span>
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl lg:text-[28px] font-extrabold tracking-tight text-white leading-tight">
                  {selectedAnimal.commonName}
                </h2>
                <div className="text-xs italic text-slate-400 font-medium">
                  {selectedAnimal.scientificName} • {selectedAnimal.climateZone}
                </div>
                <p className="text-xs text-amber-300/95 font-medium mt-1.5 leading-snug line-clamp-2">
                  {selectedAnimal.kidHeadline}
                </p>
              </div>

              {/* Direct Stage Audio & Quiz Actions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 pointer-events-auto">
                <button
                  type="button"
                  data-testid="hero-narrate-btn"
                  onClick={handleHeroNarrateToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow ${
                    isSpeaking
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{enc.stopReadAloudHero}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{enc.readAloudHero}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="hero-call-btn"
                  onClick={handleHeroAnimalCall}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-500/40 transition cursor-pointer"
                >
                  <Radio
                    className={`w-3.5 h-3.5 text-sky-400 ${
                      isPlayingHeroCall ? 'animate-pulse' : ''
                    }`}
                  />
                  <span>
                    {isPlayingHeroCall ? enc.playingCallHero : enc.animalCallHero}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuizOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 transition cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Quiz</span>
                </button>
              </div>
            </div>

            {/* Bottom-Left Stage Controls: Quick 4-Layer X-Ray Peel + Scale + Pins + Motion (hidden in Macro Eye mode to avoid overlap) */}
            {cameraFocus !== 'eye' && (
              <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-slate-950/82 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/90 shadow-xl">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Layer:</span>
                </span>
                {LAYER_CONFIG.map((layer) => {
                  const active = activeLayer === layer.id;
                  const shortLabel = layer.label.replace(/^\d+\.\s*/, '');
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => {
                        setActiveLayer(layer.id);
                        const matching = selectedAnimal.anatomyHotspots.find(
                          (h) => h.layer === layer.id
                        );
                        if (matching) setSelectedHotspot(matching);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                      }`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}

                <div className="h-4 w-px bg-slate-800 mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={() => setShowKidScale((prev) => !prev)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    showKidScale
                      ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title={showKidScale ? t.kidScaleOn : t.kidScaleOff}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {showKidScale ? 'Scale: ON' : 'Scale'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPins((prev) => !prev)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    effectiveShowPins
                      ? 'bg-amber-400/25 border-amber-400/60 text-amber-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Toggle 3D Anatomy Callout Pins"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {effectiveShowPins ? 'Pins: ON' : 'Pins'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnimating((prev) => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 transition cursor-pointer"
                  title={isAnimating ? t.pauseMotion : t.playMotion}
                >
                  {isAnimating ? (
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
              </div>
            )}

            {/* Bottom-Right Specimen Page-Turner Pill (Prev / Random / Next) */}
            {cameraFocus !== 'eye' && (
              <div className="hidden lg:flex items-center gap-1.5 absolute bottom-9 right-3 z-20 bg-slate-950/82 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-800/90 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleStepAnimal(-1)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{enc.prevSpecimen}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRandomAnimal}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/35 transition cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-300" />
                  <span>{enc.randomAnimalBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStepAnimal(1)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                >
                  <span>{enc.nextSpecimen}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Audio Action Row directly under 3D Canvas */}
          <div className="flex md:hidden flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleHeroNarrateToggle}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{enc.stopReadAloudHero}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{enc.readAloudHero}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleHeroAnimalCall}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950 text-sky-200 border border-sky-500/40 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-sky-400" />
              <span>{isPlayingHeroCall ? enc.playingCallHero : enc.animalCallHero}</span>
            </button>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* INTERACTIVE ENCYCLOPEDIA MODE SWITCHER BAR                            */}
        {/* ===================================================================== */}
        <nav
          aria-label="Encyclopedia Interactive Experiences"
          role="tablist"
          onKeyDown={(e) => {
            const ids = modeTabs.map((m) => m.id);
            const cur = ids.indexOf(activeMode);
            if (cur === -1) return;
            const isRtl =
              typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
            let nextIdx: number | null = null;
            if (e.key === 'ArrowRight') {
              nextIdx = isRtl
                ? (cur - 1 + ids.length) % ids.length
                : (cur + 1) % ids.length;
            } else if (e.key === 'ArrowLeft') {
              nextIdx = isRtl
                ? (cur + 1) % ids.length
                : (cur - 1 + ids.length) % ids.length;
            } else if (e.key === 'Home') {
              nextIdx = 0;
            } else if (e.key === 'End') {
              nextIdx = ids.length - 1;
            }
            if (nextIdx !== null) {
              e.preventDefault();
              handleSwitchMode(ids[nextIdx], false);
              const nextBtn = document.querySelector<HTMLButtonElement>(
                `[data-testid="mode-tab-${ids[nextIdx]}"]`
              );
              nextBtn?.focus();
            }
          }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl"
        >
          {modeTabs.map((tab) => {
            const active = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`mode-tab-${tab.id}`}
                onClick={() => handleSwitchMode(tab.id, false)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  active
                    ? tab.accentActive
                    : 'bg-slate-950/75 border-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-900'
                }`}
              >
                <div className="mt-0.5">{tab.icon}</div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-extrabold leading-tight truncate">
                    {tab.title}
                  </div>
                  <div
                    className={`text-[11px] leading-tight mt-0.5 truncate ${
                      active ? 'opacity-90 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* ===================================================================== */}
        {/* ACTIVE INTERACTIVE ENCYCLOPEDIA WORKSPACE                             */}
        {/* ===================================================================== */}
        <section
          ref={workspaceRef}
          aria-live="polite"
          className="pt-1"
        >
          {/* MODE 1: READ & LISTEN (ENCYCLOPEDIA MONOGRAPH + STUDIO AUDIO) */}
          {activeMode === 'encyclopedia' && (
            <AnatomyInspector
              animal={selectedAnimal}
              activeLayer={activeLayer}
              onSelectLayer={setActiveLayer}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
              isSpeaking={isSpeaking}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              onOpenQuiz={() => setIsQuizOpen(true)}
              lang={lang}
              mode="encyclopedia"
              omitBioAudioTestIds={false}
              onOpenWorldMap={() => handleSwitchMode('map', true)}
              onOpenAnatomy={() => handleSwitchMode('anatomy', true)}
            />
          )}

          {/* MODE 2: 3D X-RAY ANATOMY & ORGAN PINS */}
          {activeMode === 'anatomy' && (
            <AnatomyInspector
              animal={selectedAnimal}
              activeLayer={activeLayer}
              onSelectLayer={setActiveLayer}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={setSelectedHotspot}
              isSpeaking={isSpeaking}
              onSpeakText={handleSpeakText}
              onStopSpeaking={handleStopSpeaking}
              onOpenQuiz={() => setIsQuizOpen(true)}
              lang={lang}
              mode="anatomy"
              omitBioAudioTestIds={true}
            />
          )}

          {/* MODE 3: INTERACTIVE 3D WORLD HABITAT MAP & DEEP-TIME TIMELINE */}
          {activeMode === 'map' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 3D Earth Habitat Globe (7 Cols) */}
                <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {t.globeTitle} — {selectedAnimal.commonName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowClimateBands((prev) => !prev)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        showClimateBands
                          ? 'bg-sky-500/20 border-sky-400/50 text-sky-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {showClimateBands ? t.climateBandsOn : t.climateBandsOff}
                    </button>
                  </div>

                  <div className="h-[430px] rounded-xl overflow-hidden">
                    <SceneErrorBoundary title="The 3D Earth Globe">
                      <Globe3D
                        animals={filteredAnimals}
                        selectedAnimal={selectedAnimal}
                        onSelectAnimal={(a) => handleSelectAnimal(a, false)}
                        selectedEra={selectedEra}
                        showClimateBands={showClimateBands}
                      />
                    </SceneErrorBoundary>
                  </div>
                </div>

                {/* Habitat Coordinates, Climate & Range Monograph (5 Cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                        Biogeography, Habitat &amp; Fossil Range
                      </h3>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 space-y-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-400">Continents / Oceans: </span>
                        <strong className="text-white">
                          {selectedAnimal.continents.join(', ')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Region &amp; Type Localities: </span>
                        <span className="text-slate-200">
                          {selectedAnimal.regionDescription}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-slate-400">Climate Band: </span>
                        <span className="font-bold text-amber-300">
                          {selectedAnimal.climateZone} ({selectedAnimal.temperatureRangeC})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-400">Elevation / Ocean Depth: </span>
                        <span className="text-slate-200">
                          {selectedAnimal.habitatDepthOrAltitude}
                        </span>
                      </div>
                    </div>

                    {/* Pinpoint Coordinates List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Mapped Global Habitat &amp; Dig Coordinates ({selectedAnimal.coordinates.length})
                      </h4>
                      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                        {selectedAnimal.coordinates.map((coord, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              {coord.label}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">
                              {coord.lat.toFixed(1)}°, {coord.lng.toFixed(1)}°
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    Tip: Click any glowing marker pin on the 3D Earth Globe to load that species directly onto the centerpiece 3D stage above!
                  </p>
                </div>
              </div>

              {/* 541-Million-Year Geological Deep-Time Scrubber */}
              <GeologicalTimeline
                selectedEra={selectedEra}
                onSelectEra={(era) => setSelectedEra(era)}
              />
            </div>
          )}

          {/* MODE 4: VISION & 3D OCULAR BIOLOGY LAB */}
          {activeMode === 'vision' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-amber-500/35 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-extrabold text-white">
                      {selectedAnimal.commonName} — {ocularProfile.pupilShapeLabel}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCameraFocus('eye')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${
                        cameraFocus === 'eye'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Zoom to 3D Eyeball</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraFocus('body')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        cameraFocus === 'body'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      Full Body
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-100 leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">How {selectedAnimal.commonName} Sees the World: </strong>
                    {ocularProfile.kidVisionSecret}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-sky-400">Museum Comparative Ophthalmology Reference: </strong>
                  {ocularProfile.museumReference}
                </div>
              </div>

              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Eyeball Diameter</div>
                  <div className="text-sm font-extrabold text-emerald-300 mt-1">
                    {ocularProfile.eyeballDiameterMm}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Field of View</div>
                  <div className="text-sm font-extrabold text-sky-300 mt-1">
                    {ocularProfile.fieldOfView}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 sm:col-span-2">
                  <div className="text-[11px] text-slate-400">Retinal Photoreceptors</div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-100 mt-1">
                    {ocularProfile.photoreceptors}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 sm:col-span-2">
                  <div className="text-[11px] text-slate-400">Skeletal Scleral Ring</div>
                  <div className="text-xs font-semibold text-amber-200 mt-1">
                    {ocularProfile.hasScleralOssicles
                      ? 'Present — Bony scleral ossicles reinforce eyeball shape against water/air pressure'
                      : 'Absent — Soft fibrous collagenous sclera pressurized by intraocular fluid'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 5: FULL ENCYCLOPEDIA SPECIES INDEX & FILTERS */}
          {activeMode === 'catalog' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Living / Extinct Switcher */}
                  <div
                    role="group"
                    aria-label="Filter by living or extinct animals"
                    className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    {(
                      [
                        { id: 'all', label: t.tabAll },
                        { id: 'living', label: t.tabLiving },
                        { id: 'extinct', label: t.tabExtinct },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setTemporalFilter(tab.id);
                          if (tab.id === 'living' && selectedEra !== 'all') {
                            setSelectedEra('holocene');
                          } else if (
                            tab.id === 'extinct' &&
                            selectedEra === 'holocene'
                          ) {
                            setSelectedEra('all');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          temporalFilter === tab.id
                            ? 'bg-emerald-500 text-slate-950 shadow'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="font-semibold">{t.continentLabel}</span>
                    <select
                      value={selectedContinent}
                      onChange={(e) => setSelectedContinent(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {continentOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="font-semibold">{t.climateLabel}</span>
                    <select
                      value={selectedClimate}
                      onChange={(e) => setSelectedClimate(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {climateOptions.map((cl) => (
                        <option key={cl} value={cl}>
                          {cl}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="font-semibold">{t.classLabel}</span>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {classOptions.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </label>

                  {(temporalFilter !== 'all' ||
                    selectedEra !== 'all' ||
                    selectedContinent !== 'All' ||
                    selectedClimate !== 'All' ||
                    selectedClass !== 'All' ||
                    searchInput !== '') && (
                    <button
                      type="button"
                      onClick={() => {
                        setTemporalFilter('all');
                        setSelectedEra('all');
                        setSelectedContinent('All');
                        setSelectedClimate('All');
                        setSelectedClass('All');
                        setSearchInput('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-semibold cursor-pointer"
                    >
                      {t.resetFilters}
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  {t.showingCountPrefix}{' '}
                  <strong className="text-white">{filteredAnimals.length}</strong>{' '}
                  / {allAnimals.length}
                </div>
              </div>

              <GeologicalTimeline
                selectedEra={selectedEra}
                onSelectEra={(era) => setSelectedEra(era)}
              />

              {/* Visual Encyclopedia Species Grid */}
              {filteredAnimals.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
                  <p className="text-sm text-slate-200 font-bold">
                    No curated species match these exact filters.
                  </p>
                  <p className="text-xs text-slate-400">
                    Click &ldquo;{t.liveDbBtn}&rdquo; in the top search bar to query 2.1M+ living &amp; fossil species from GBIF and Paleobiology DB, or reset filters!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredAnimals.map((animal) => {
                    const isSelected = animal.id === selectedAnimal.id;
                    const isExtinct = animal.temporalStatus === 'extinct';
                    const hasBadge = earnedBadges.includes(animal.id);
                    const isScan = HERO_SHOWCASE_ANIMAL_IDS.includes(animal.id);

                    return (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => {
                          handleSelectAnimal(animal, true);
                          setActiveMode('encyclopedia');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-950/90 to-slate-900 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl'
                            : 'bg-slate-900/85 border-slate-800/90 hover:border-slate-600 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                isExtinct
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {isExtinct ? (
                                <>
                                  <Bone className="w-3 h-3" aria-hidden="true" />
                                  <span>Extinct</span>
                                </>
                              ) : (
                                <>
                                  <HeartPulse className="w-3 h-3" aria-hidden="true" />
                                  <span>Living</span>
                                </>
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              {isScan && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/15 text-amber-200 border border-amber-400/30 inline-flex items-center gap-0.5">
                                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                                  <span>3D Scan</span>
                                </span>
                              )}
                              {hasBadge && (
                                <span
                                  title="Quiz Badge Earned!"
                                  className="text-amber-400 text-xs font-bold flex items-center gap-0.5"
                                >
                                  <Award className="w-3.5 h-3.5" /> ★
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="font-extrabold text-base text-white mt-2">
                            {animal.commonName}
                          </div>
                          <div className="text-xs italic text-slate-400">
                            {animal.scientificName}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                            {animal.kidHeadline}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-300 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                          <span className="truncate max-w-[160px] text-slate-400">
                            {animal.climateZone}
                          </span>
                          <span className="font-bold text-emerald-300">
                            {animal.metrics.lengthMeters}m
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tier 2: Complete 36-Phylum Kingdom Animalia Tree, Holocene Extinctions & Live Paginated Global Registry */}
              <GlobalTaxonomyBrowser
                onLoadSpecimen={(specimen) => {
                  if (!CURATED_ANIMALS.some((a) => a.id === specimen.id)) {
                    setCustomAnimals((prev) =>
                      prev.some((p) => p.id === specimen.id)
                        ? prev
                        : [specimen, ...prev]
                    );
                  }
                  handleSelectAnimal(specimen, true);
                  setActiveMode('encyclopedia');
                }}
              />
            </div>
          )}
        </section>
      </main>

      {/* Opt-In Privacy-Hardened Analytics Consent Banner */}
      {showConsentBanner && (
        <aside
          aria-label={t.cookieTitle}
          className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{t.cookieTitle}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{t.cookieBody}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                saveConsentState('denied');
                setConsent('denied');
                setShowConsentBanner(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              {t.cookieDecline}
            </button>
            <button
              type="button"
              onClick={() => {
                saveConsentState('granted');
                setConsent('granted');
                setShowConsentBanner(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 cursor-pointer"
            >
              {t.cookieAccept}
            </button>
          </div>
        </aside>
      )}

      {/* Interactive Species & Anatomy Quiz Modal */}
      <QuizModal
        animal={selectedAnimal}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onCompleteBadge={handleCompleteBadge}
      />
    </div>
  );
}
export default App;
