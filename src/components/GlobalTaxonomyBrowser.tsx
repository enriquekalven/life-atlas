import React, { useCallback, useEffect, useState } from 'react';
import {
  Bone,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  HeartPulse,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  ANIMAL_KINGDOM_PHYLA,
  AnimalPhylumEntry,
  compendiumSpeciesToAnimalRecord,
  GLOBAL_ANIMAL_BIODIVERSITY_STATS,
  HOLOCENE_EXTINCT_SPECIES,
  RegistryCompendiumSpecies,
} from '../data/animalKingdomTree';
import { CURATED_ANIMALS } from '../data/animals';
import {
  browseGlobalAnimalRegistry,
  GlobalRegistryPage,
  GlobalRegistryTemporalFilter,
} from '../services/encyclopediaApi';
import { AnimalRecord } from '../types/atlas';

interface GlobalTaxonomyBrowserProps {
  onLoadSpecimen: (animal: AnimalRecord) => void;
}

type BrowserTab = 'phyla' | 'holocene' | 'live_registry';

export const GlobalTaxonomyBrowser: React.FC<GlobalTaxonomyBrowserProps> = ({
  onLoadSpecimen,
}) => {
  const [subTab, setSubTab] = useState<BrowserTab>('phyla');
  const [phylumSearch, setPhylumSearch] = useState('');
  const [selectedPhylumId, setSelectedPhylumId] = useState<string>('chordata');

  // Live Paginated Global Registry state
  const [registryTaxon, setRegistryTaxon] = useState<string>('Animalia');
  const [registryTemporal, setRegistryTemporal] =
    useState<GlobalRegistryTemporalFilter>('all');
  const [registryQuery, setRegistryQuery] = useState<string>('');
  const [registryOffset, setRegistryOffset] = useState<number>(0);
  const [registryPage, setRegistryPage] = useState<GlobalRegistryPage | null>(
    null
  );
  const [isLoadingRegistry, setIsLoadingRegistry] = useState<boolean>(false);

  const selectedPhylum: AnimalPhylumEntry =
    ANIMAL_KINGDOM_PHYLA.find((p) => p.id === selectedPhylumId) ??
    ANIMAL_KINGDOM_PHYLA[0];

  const filteredPhyla = ANIMAL_KINGDOM_PHYLA.filter((p) => {
    if (!phylumSearch.trim()) return true;
    const q = phylumSearch.trim().toLowerCase();
    return (
      p.scientificName.toLowerCase().includes(q) ||
      p.commonName.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.majorClades.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.commonName.toLowerCase().includes(q)
      )
    );
  });

  const fetchRegistryPage = useCallback(
    async (
      taxon: string,
      temporal: GlobalRegistryTemporalFilter,
      query: string,
      offset: number
    ) => {
      setIsLoadingRegistry(true);
      const page = await browseGlobalAnimalRegistry({
        taxonName: taxon,
        temporalFilter: temporal,
        query: query.trim() || undefined,
        offset,
        limit: 12,
      });
      setRegistryPage(page);
      setIsLoadingRegistry(false);
    },
    []
  );

  useEffect(() => {
    if (subTab === 'live_registry') {
      void fetchRegistryPage(
        registryTaxon,
        registryTemporal,
        registryQuery,
        registryOffset
      );
    }
  }, [
    subTab,
    registryTaxon,
    registryTemporal,
    registryOffset,
    fetchRegistryPage,
  ]);

  const handleLoadCompendiumEntry = (entry: RegistryCompendiumSpecies) => {
    if (entry.curatedAnimalId) {
      const curated = CURATED_ANIMALS.find(
        (a) => a.id === entry.curatedAnimalId
      );
      if (curated) {
        onLoadSpecimen(curated);
        return;
      }
    }
    onLoadSpecimen(compendiumSpeciesToAnimalRecord(entry));
  };

  return (
    <section
      aria-label="Comprehensive Global Animalia Biodiversity & Paleobiology Registry"
      className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl"
    >
      {/* Scientific Summary Header + 4 KPI Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
            <Database className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Complete Kingdom Animalia Biodiversity &amp; Fossil Compendium</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            Every Extant Phylum, Holocene Extinction &amp; Deep-Time Fossil Lineage
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Pairs our <strong>{CURATED_ANIMALS.length} bespoke hyper-real 3D museum specimens</strong>{' '}
            with all <strong>{GLOBAL_ANIMAL_BIODIVERSITY_STATS.totalAnimalPhyla} Animalia phyla</strong>{' '}
            (32 living + 4 extinct†), documented Holocene extinctions since 1500 CE, and live paginated
            queries across the <strong>GBIF Backbone (~2.16M+ accepted living species)</strong> &amp;{' '}
            <strong>Paleobiology Database (~455K+ fossil taxa)</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-800">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Living Registered
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-300 tabular-nums mt-0.5">
              {GLOBAL_ANIMAL_BIODIVERSITY_STATS.acceptedLivingSpecies.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">CoL / GBIF Species</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-800">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Prehistoric Fossils
            </div>
            <div className="text-sm sm:text-base font-extrabold text-amber-300 tabular-nums mt-0.5">
              {GLOBAL_ANIMAL_BIODIVERSITY_STATS.describedFossilSpecies.toLocaleString()}+
            </div>
            <div className="text-[10px] text-slate-400">PBDB Metazoa Taxa</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-800">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Holocene Extinct
            </div>
            <div className="text-sm sm:text-base font-extrabold text-rose-300 tabular-nums mt-0.5">
              {GLOBAL_ANIMAL_BIODIVERSITY_STATS.holoceneExtinctionsSince1500.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">IUCN EX (Since 1500)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/85 border border-slate-800">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Animalia Phyla
            </div>
            <div className="text-sm sm:text-base font-extrabold text-sky-300 tabular-nums mt-0.5">
              {GLOBAL_ANIMAL_BIODIVERSITY_STATS.totalAnimalPhyla} Total
            </div>
            <div className="text-[10px] text-slate-400">32 Living · 4 Extinct†</div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Global Animal Registry Views"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'phyla'}
          onClick={() => setSubTab('phyla')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
            subTab === 'phyla'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
              : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" aria-hidden="true" />
          <span>All 36 Animalia Phyla Tree</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'holocene'}
          onClick={() => setSubTab('holocene')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
            subTab === 'holocene'
              ? 'bg-rose-500 text-white border-rose-400 shadow'
              : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          <Bone className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            Holocene &amp; Historical Extinctions ({HOLOCENE_EXTINCT_SPECIES.length})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'live_registry'}
          onClick={() => setSubTab('live_registry')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
            subTab === 'live_registry'
              ? 'bg-sky-400 text-slate-950 border-sky-300 shadow'
              : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600'
          }`}
        >
          <Database className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Live Paginated Global Registry (2.6M+ Taxa)</span>
        </button>
      </div>

      {/* TAB 1: ALL 36 ANIMALIA PHYLA EXPLORER */}
      {subTab === 'phyla' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 space-y-2.5">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={phylumSearch}
                onChange={(e) => setPhylumSearch(e.target.value)}
                placeholder="Filter 36 phyla or classes (e.g. Arthropoda, Trilobita, Tardigrada)..."
                aria-label="Filter Animalia phyla"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-400"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto space-y-1.5 pr-1">
              {filteredPhyla.map((phylum) => {
                const active = phylum.id === selectedPhylum.id;
                return (
                  <button
                    key={phylum.id}
                    type="button"
                    onClick={() => setSelectedPhylumId(phylum.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-emerald-950/75 border-emerald-400 text-white'
                        : 'bg-slate-950/70 border-slate-800/90 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold truncate">
                        {phylum.scientificName}{' '}
                        <span className="font-normal text-slate-400">
                          — {phylum.commonName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {phylum.temporalSpan}
                      </div>
                    </div>
                    <div className="text-right shrink-0 tabular-nums">
                      {phylum.status === 'extinct' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                          Extinct† · {phylum.describedFossilSpecies.toLocaleString()} fossils
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-300">
                          {phylum.acceptedLivingSpecies.toLocaleString()} living
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Phylum Monograph & Landmark Species */}
          <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base sm:text-lg font-extrabold text-white">
                    Phylum {selectedPhylum.scientificName} — {selectedPhylum.commonName}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedPhylum.status === 'extinct'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {selectedPhylum.status === 'extinct'
                      ? 'Extinct Fossil Phylum†'
                      : 'Extant Phylum'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedPhylum.temporalSpan} • {selectedPhylum.symmetryAndPlan}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRegistryTaxon(
                    selectedPhylum.gbifScientificPhylum ||
                      selectedPhylum.pbdbTaxonName
                  );
                  setRegistryTemporal(
                    selectedPhylum.status === 'extinct'
                      ? 'prehistoric_fossil'
                      : 'all'
                  );
                  setRegistryOffset(0);
                  setSubTab('live_registry');
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Browse All Registered Species</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {selectedPhylum.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Accepted Living Species
                </span>
                <strong className="text-emerald-300 tabular-nums text-sm">
                  {selectedPhylum.acceptedLivingSpecies.toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Described Fossil Species
                </span>
                <strong className="text-amber-300 tabular-nums text-sm">
                  {selectedPhylum.describedFossilSpecies.toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase">
                  Major Classes / Clades
                </span>
                <strong className="text-sky-300 tabular-nums text-sm">
                  {selectedPhylum.majorClades.length} Lineages
                </strong>
              </div>
            </div>

            {/* Major Classes */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Constituent Classes &amp; Subphyla
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPhylum.majorClades.map((clade) =>
                  clade.crossPortalUrl ? (
                    <a
                      key={clade.name}
                      href={clade.crossPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-amber-500/25"
                    >
                      <span>
                        {clade.name} ({clade.commonName})
                      </span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      key={clade.name}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] tabular-nums"
                    >
                      <strong>{clade.name}</strong> ({clade.commonName}:{' '}
                      {clade.livingSpecies > 0
                        ? `${clade.livingSpecies.toLocaleString()} living`
                        : `${clade.fossilSpecies.toLocaleString()} fossils†`}
                      )
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Landmark 3D-Loadable Representatives */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Representative Living &amp; Fossil Species (Click to Inspect on 3D Stage)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPhylum.landmarkSpecies.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => handleLoadCompendiumEntry(sp)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-400/60 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-white">
                        {sp.commonName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 inline-flex items-center gap-0.5 shrink-0">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        <span>3D Stage</span>
                      </span>
                    </div>
                    <div className="text-[11px] italic text-slate-400">
                      {sp.scientificName} • {sp.timeSpanLabel}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {sp.summary}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOLOCENE & HISTORICAL EXTINCTIONS */}
      {subTab === 'holocene' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            Documented species lost during the Late Holocene &amp; Modern Historical Era
            (1500 CE – Present). Click any species to reconstruct and inspect its 3D
            anatomical bauplan on the centerpiece stage.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HOLOCENE_EXTINCT_SPECIES.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => handleLoadCompendiumEntry(sp)}
                className="p-3.5 rounded-2xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-rose-400/60 text-left transition cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {sp.timeSpanLabel}
                    </span>
                    {sp.curatedAnimalId && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/15 text-amber-200 border border-amber-400/35">
                        Bespoke 3D
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-extrabold text-white pt-1">
                    {sp.commonName}
                  </div>
                  <div className="text-[11px] italic text-slate-400">
                    {sp.scientificName} • {sp.taxonomicClass}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 mt-1">
                    {sp.summary}
                  </p>
                </div>
                <div className="text-[11px] text-emerald-300 font-bold pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-normal truncate max-w-[150px]">
                    {sp.region}
                  </span>
                  <span>Inspect 3D →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PAGINATED GLOBAL REGISTRY (GBIF + PBDB) */}
      {subTab === 'live_registry' && (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setRegistryOffset(0);
              void fetchRegistryPage(
                registryTaxon,
                registryTemporal,
                registryQuery,
                0
              );
            }}
            className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-950/85 border border-slate-800"
          >
            <label className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="font-semibold">Phylum / Clade:</span>
              <select
                value={registryTaxon}
                onChange={(e) => {
                  setRegistryTaxon(e.target.value);
                  setRegistryOffset(0);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Animalia">All Kingdom Animalia (2.6M+)</option>
                {ANIMAL_KINGDOM_PHYLA.map((p) => (
                  <option
                    key={p.id}
                    value={p.gbifScientificPhylum || p.pbdbTaxonName}
                  >
                    {p.scientificName} ({p.commonName})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="font-semibold">Status:</span>
              <select
                value={registryTemporal}
                onChange={(e) => {
                  setRegistryTemporal(
                    e.target.value as GlobalRegistryTemporalFilter
                  );
                  setRegistryOffset(0);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="all">All (Living + Fossil)</option>
                <option value="living">Living Only (GBIF Accepted)</option>
                <option value="holocene_extinct">
                  IUCN Extinct (EX — Recent/Holocene)
                </option>
                <option value="prehistoric_fossil">
                  Prehistoric Fossils Only (PBDB)
                </option>
              </select>
            </label>

            <input
              type="search"
              value={registryQuery}
              onChange={(e) => setRegistryQuery(e.target.value)}
              placeholder="Optional genus/species filter..."
              aria-label="Filter global animal registry"
              className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={isLoadingRegistry}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-extrabold cursor-pointer"
            >
              {isLoadingRegistry ? 'Querying...' : 'Search Registry'}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 tabular-nums">
            <div>
              {registryPage ? (
                <>
                  Showing records{' '}
                  <strong className="text-white">
                    {registryPage.records.length === 0
                      ? 0
                      : registryOffset + 1}
                    –{registryOffset + registryPage.records.length}
                  </strong>{' '}
                  of ~
                  <strong className="text-emerald-300">
                    {registryPage.totalEstimatedCount.toLocaleString()}
                  </strong>{' '}
                  ({registryPage.sourcesUsed.join(' + ').toUpperCase() || 'LIVE'})
                </>
              ) : (
                'Connecting to GBIF Backbone & Paleobiology Database...'
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isLoadingRegistry || registryOffset === 0}
                onClick={() =>
                  setRegistryOffset((prev) => Math.max(0, prev - 12))
                }
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={isLoadingRegistry || !registryPage?.hasMore}
                onClick={() => setRegistryOffset((prev) => prev + 12)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold cursor-pointer inline-flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isLoadingRegistry ? (
            <div className="py-10 text-center text-xs text-slate-300">
              Loading live taxonomic records from GBIF &amp; Paleobiology Database...
            </div>
          ) : registryPage && registryPage.records.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {registryPage.records.map((rec) => {
                const isExt = rec.temporalStatus === 'extinct';
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => onLoadSpecimen(rec)}
                    className="p-3 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-sky-400/60 text-left transition cursor-pointer flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isExt
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {isExt ? (
                            <Bone className="w-3 h-3" aria-hidden="true" />
                          ) : (
                            <HeartPulse className="w-3 h-3" aria-hidden="true" />
                          )}
                          <span>{isExt ? 'Extinct / Fossil' : 'Living'}</span>
                        </span>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {rec.externalSource}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-white mt-1.5 truncate">
                        {rec.commonName}
                      </div>
                      <div className="text-[11px] italic text-slate-400 truncate">
                        {rec.scientificName} • {rec.taxonomy.phylum} ›{' '}
                        {rec.taxonomy.class}
                      </div>
                    </div>
                    <div className="text-[11px] text-sky-300 font-bold pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400 font-normal truncate max-w-[175px]">
                        {rec.timeRangeMya}
                      </span>
                      <span>Load 3D →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
              No external records returned (offline or narrow filter). Explore all 36
              phyla and Holocene extinctions in the tabs above!
            </div>
          )}
        </div>
      )}
    </section>
  );
};
