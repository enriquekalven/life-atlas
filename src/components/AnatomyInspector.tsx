import React, { useState } from 'react';
import {
  Activity,
  Award,
  Bone,
  BookOpen,
  Compass,
  Eye,
  Flame,
  Globe,
  Headphones,
  Heart,
  Layers,
  MapPin,
  Radio,
  Shield,
  Sparkles,
  Thermometer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnatomyHotspot, AnatomyLayer, AnimalRecord } from '../types/atlas';
import type { SupportedLang } from '../i18n';
import {
  buildLocalizedHotspotNarration,
  formatLocalizedWeight,
  getLocalizedSpeciesNarration,
  ORGAN_SYSTEM_LABELS,
} from '../data/localizedNarrations';
import { ENCYCLOPEDIA_UI_LABELS } from '../data/encyclopediaUiLabels';
import { playAnimalVocalization } from '../services/narrationAudio';

export type InspectorSectionMode = 'all' | 'encyclopedia' | 'anatomy';

interface AnatomyInspectorProps {
  animal: AnimalRecord;
  activeLayer: AnatomyLayer;
  onSelectLayer: (layer: AnatomyLayer) => void;
  selectedHotspot: AnatomyHotspot | null;
  onSelectHotspot: (hotspot: AnatomyHotspot) => void;
  isSpeaking: boolean;
  onSpeakText: (text: string, options?: { preferStudioAudio?: boolean; animalId?: string }) => void;
  onStopSpeaking: () => void;
  onOpenQuiz: () => void;
  lang?: SupportedLang;
  mode?: InspectorSectionMode;
  omitBioAudioTestIds?: boolean;
  onOpenWorldMap?: () => void;
  onOpenAnatomy?: () => void;
}

const INSPECTOR_BUTTON_LABELS: Record<
  SupportedLang,
  {
    listenOrgan: string;
    stopAudio: string;
    narrateBio: string;
    stopNarration: string;
    hearCall: string;
    playingCall: string;
    takeQuiz: string;
  }
> = {
  en: {
    listenOrgan: 'Listen to Organ Guide',
    stopAudio: 'Stop Audio',
    narrateBio: 'Narrate Species Bio',
    stopNarration: 'Stop Narration',
    hearCall: 'Hear Animal Call',
    playingCall: 'Playing Bio-Acoustic Call...',
    takeQuiz: 'Take Anatomy Quiz',
  },
  es: {
    listenOrgan: 'Escuchar Guía del Órgano',
    stopAudio: 'Detener Audio',
    narrateBio: 'Narrar Biografía',
    stopNarration: 'Detener Narración',
    hearCall: 'Sonido del Animal',
    playingCall: 'Reproduciendo Sonido...',
    takeQuiz: 'Cuestionario de Anatomía',
  },
  zh: {
    listenOrgan: '收听器官语音导览',
    stopAudio: '停止播放',
    narrateBio: '播报物种科学解说',
    stopNarration: '停止解说',
    hearCall: '聆听动物原声',
    playingCall: '正在播放生物声学鸣叫...',
    takeQuiz: '解剖互动问答',
  },
  yue: {
    listenOrgan: '收聽器官語音導覽',
    stopAudio: '停止播放',
    narrateBio: '播報物種科學解說',
    stopNarration: '停止解說',
    hearCall: '聆聽動物叫聲',
    playingCall: '正在播放動物叫聲...',
    takeQuiz: '解剖互動問答',
  },
  ja: {
    listenOrgan: '器官ガイドを聴く',
    stopAudio: '音声を停止',
    narrateBio: '種族ガイドを音声再生',
    stopNarration: 'ナレーション停止',
    hearCall: '鳴き声・生体音を聴く',
    playingCall: '生体音響を再生中...',
    takeQuiz: '解剖クイズに挑戦',
  },
  ko: {
    listenOrgan: '기관 가이드 듣기',
    stopAudio: '오디오 정지',
    narrateBio: '생물 도감 내레이션',
    stopNarration: '내레이션 정지',
    hearCall: '동물 울음소리 듣기',
    playingCall: '생체 음향 재생 중...',
    takeQuiz: '해부학 퀴즈 풀기',
  },
  pt: {
    listenOrgan: 'Ouvir Guia do Órgão',
    stopAudio: 'Parar Áudio',
    narrateBio: 'Narrar Biografia da Espécie',
    stopNarration: 'Parar Narração',
    hearCall: 'Ouvir Som do Animal',
    playingCall: 'Reproduzindo Som...',
    takeQuiz: 'Quiz de Anatomia',
  },
  fr: {
    listenOrgan: 'Écouter le Guide de l’Organe',
    stopAudio: 'Arrêter l’Audio',
    narrateBio: 'Narrer la Biographie',
    stopNarration: 'Arrêter la Narration',
    hearCall: 'Cri de l’Animal',
    playingCall: 'Lecture Bio-Acoustique...',
    takeQuiz: 'Quiz d’Anatomie',
  },
  it: {
    listenOrgan: 'Ascolta Guida dell’Organo',
    stopAudio: 'Ferma Audio',
    narrateBio: 'Narra Scheda Specie',
    stopNarration: 'Ferma Narrazione',
    hearCall: 'Verso dell’Animale',
    playingCall: 'Riproduzione Bio-Acustica...',
    takeQuiz: 'Quiz di Anatomia',
  },
  de: {
    listenOrgan: 'Organ-Guide anhören',
    stopAudio: 'Audio stoppen',
    narrateBio: 'Artenporträt vorlesen',
    stopNarration: 'Sprachausgabe stoppen',
    hearCall: 'Tierlaut anhören',
    playingCall: 'Bio-Akustik läuft...',
    takeQuiz: 'Anatomie-Quiz starten',
  },
  ar: {
    listenOrgan: 'استمع لدليل العضو',
    stopAudio: 'إيقاف الصوت',
    narrateBio: 'سرد السيرة العلمية',
    stopNarration: 'إيقاف السرد',
    hearCall: 'سماع صوت الحيوان',
    playingCall: 'جاري تشغيل الصوت الحيوي...',
    takeQuiz: 'اختبار التشريح',
  },
};

export const LAYER_CONFIG: Array<{
  id: AnatomyLayer;
  label: string;
  subtitle: string;
  badgeColor: string;
}> = [
  {
    id: 'exterior',
    label: '1. Exterior',
    subtitle: 'Skin, Fur, Feathers & Scales',
    badgeColor: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200',
  },
  {
    id: 'muscular',
    label: '2. Muscular',
    subtitle: 'Muscle Bundles & Tendons',
    badgeColor: 'border-rose-500/50 bg-rose-500/15 text-rose-200',
  },
  {
    id: 'skeletal',
    label: '3. Skeletal',
    subtitle: 'Skull, Spine, Ribs & Fossils',
    badgeColor: 'border-amber-500/50 bg-amber-500/15 text-amber-200',
  },
  {
    id: 'organs',
    label: '4. Organs',
    subtitle: 'Beating Heart, Lungs & Brain',
    badgeColor: 'border-sky-500/50 bg-sky-500/15 text-sky-200',
  },
];

export const AnatomyInspector: React.FC<AnatomyInspectorProps> = ({
  animal,
  activeLayer,
  onSelectLayer,
  selectedHotspot,
  onSelectHotspot,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
  onOpenQuiz,
  lang = 'en',
  mode = 'all',
  omitBioAudioTestIds = false,
  onOpenWorldMap,
  onOpenAnatomy,
}) => {
  const [isPlayingCall, setIsPlayingCall] = useState(false);
  const currentHotspot = selectedHotspot || animal.anatomyHotspots[0];
  const labels = INSPECTOR_BUTTON_LABELS[lang] ?? INSPECTOR_BUTTON_LABELS.en;
  const encLabels = ENCYCLOPEDIA_UI_LABELS[lang] ?? ENCYCLOPEDIA_UI_LABELS.en;
  const localizedNarrationScript = getLocalizedSpeciesNarration(animal, lang);
  const showAnatomy = mode === 'all' || mode === 'anatomy';
  const showEncyclopedia = mode === 'all' || mode === 'encyclopedia';

  const handleNarrateOverview = () => {
    if (isSpeaking) {
      onStopSpeaking();
      return;
    }
    onSpeakText(localizedNarrationScript, { preferStudioAudio: true, animalId: animal.id });
  };

  const handleNarrateHotspot = (hotspot: AnatomyHotspot) => {
    if (isSpeaking) {
      onStopSpeaking();
      return;
    }
    const text = buildLocalizedHotspotNarration(animal, hotspot, lang);
    onSpeakText(text, { preferStudioAudio: false, animalId: animal.id });
  };

  const handlePlayVocalization = () => {
    setIsPlayingCall(true);
    playAnimalVocalization(animal, () => {
      setIsPlayingCall(false);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {showAnatomy && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 4-Layer X-Ray Peel Controls */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    3D X-Ray Layer Peel
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Synced with 3D Stage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LAYER_CONFIG.map((layer) => {
                  const active = activeLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => {
                        onSelectLayer(layer.id);
                        const matching = animal.anatomyHotspots.find(
                          (h) => h.layer === layer.id
                        );
                        if (matching) onSelectHotspot(matching);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? `${layer.badgeColor} ring-2 ring-emerald-400/50 shadow-md`
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{layer.label}</div>
                      <div className="text-[11px] opacity-80 leading-tight mt-0.5">
                        {layer.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* All Clickable Anatomy Pins for This Animal */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                3D Anatomical Callout Pins ({animal.anatomyHotspots.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {animal.anatomyHotspots.map((spot, idx) => {
                  const isSelected = currentHotspot && spot.id === currentHotspot.id;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => {
                        onSelectLayer(spot.layer);
                        onSelectHotspot(spot);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {idx + 1}. {spot.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Anatomical Hotspot Deep-Dive */}
          {currentHotspot && (
            <div className="lg:col-span-7 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-xl flex flex-col justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {ORGAN_SYSTEM_LABELS[currentHotspot.system]?.[lang] ??
                          `${currentHotspot.system} System`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                        Layer: {currentHotspot.layer}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                      <Bone className="w-4 h-4 text-amber-400 shrink-0" />
                      {currentHotspot.name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    data-testid="listen-organ-guide-btn"
                    onClick={() => handleNarrateHotspot(currentHotspot)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow"
                    aria-label="Read anatomical organ description aloud"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        {labels.stopAudio}
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        {labels.listenOrgan}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed mt-2">
                  {currentHotspot.kidSummary}
                </p>

                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-100 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Kid Comparison: </span>
                    {currentHotspot.funComparison}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-sky-400">
                  Young Scientist Biology Note:{' '}
                </span>
                {currentHotspot.scientificDetail}
              </div>
            </div>
          )}
        </div>
      )}

      {showEncyclopedia && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT 7 COLS: Studio Read-Along Audio Player + Encyclopedia Monograph */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Read-Along 11-Language Studio Audio Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/45 via-slate-900 to-slate-900 border border-emerald-500/35 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                    {encLabels.audioScriptTitle}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-200 border border-emerald-500/30">
                    {encLabels.audioScriptBadge}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid={omitBioAudioTestIds ? undefined : 'narrate-species-bio-btn'}
                    onClick={handleNarrateOverview}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSpeaking
                        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        {labels.stopNarration}
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        {labels.narrateBio}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid={omitBioAudioTestIds ? undefined : 'hear-animal-call-btn'}
                    onClick={handlePlayVocalization}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-950/90 hover:bg-sky-900 text-sky-200 border border-sky-500/40 transition cursor-pointer"
                  >
                    <Radio
                      className={`w-3.5 h-3.5 text-sky-400 ${
                        isPlayingCall ? 'animate-pulse' : ''
                      }`}
                    />
                    {isPlayingCall ? labels.playingCall : labels.hearCall}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenQuiz}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    {labels.takeQuiz}
                  </button>
                </div>
              </div>

              <blockquote
                className={`p-4 rounded-xl border text-sm sm:text-base leading-relaxed transition-colors ${
                  isSpeaking
                    ? 'bg-emerald-950/40 border-emerald-400/50 text-emerald-50 shadow-inner'
                    : 'bg-slate-950/75 border-slate-800 text-slate-100'
                }`}
              >
                {localizedNarrationScript}
              </blockquote>
            </div>

            {/* Encyclopedia Field Guide & Evolutionary Story */}
            <article className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Encyclopedia Monograph &amp; Evolutionary Lineage
                </h3>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {animal.overview}
              </p>

              <div className="text-xs sm:text-sm text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800 leading-relaxed">
                <strong className="text-emerald-400">Evolutionary Story: </strong>
                {animal.evolutionaryStory}
              </div>

              {/* Biological Superpowers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Biological Superpowers
                </h4>
                <ul className="space-y-2">
                  {animal.superpowers.map((power, i) => (
                    <li
                      key={i}
                      className="text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 bg-slate-950/55 px-3.5 py-2 rounded-xl border border-slate-800/80"
                    >
                      <span className="text-emerald-400 font-bold mt-0.5">★</span>
                      <span>{power}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>

          {/* RIGHT 5 COLS: Vital Physiology, Scientific Taxonomy & Quick Interactive Jumps */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Physiological Vital Signs & Taxonomy Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Physiology &amp; Scientific Taxonomy
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Dimensions</div>
                  <div className="font-bold text-sm text-white mt-0.5">
                    {animal.metrics.lengthMeters}m L × {animal.metrics.heightMeters}m H
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Body Mass</div>
                  <div className="font-bold text-sm text-white mt-0.5">
                    {formatLocalizedWeight(animal.metrics.weightKg, lang)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Heart Rate
                  </div>
                  <div className="font-bold text-sm text-rose-300 mt-0.5">
                    {animal.metrics.heartRateBpm}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Top Speed / Diet</div>
                  <div className="font-bold text-sm text-emerald-300 mt-0.5">
                    {animal.metrics.topSpeedKmh} km/h • {animal.diet}
                  </div>
                </div>
              </div>
              {animal.metrics.biteForceN && (
                <div className="text-xs px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>Bite Force:</strong> {animal.metrics.biteForceN}
                  </span>
                </div>
              )}
              <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/80 leading-relaxed">
                <strong className="text-slate-400">Taxonomic Lineage:</strong>{' '}
                {animal.taxonomy.phylum} → {animal.taxonomy.class} →{' '}
                {animal.taxonomy.order} → {animal.taxonomy.family} →{' '}
                <em className="text-emerald-300">{animal.scientificName}</em>
              </div>
            </div>

            {/* Biome, Region & Climate Card + Jump to 3D World Map */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Geography, Biome &amp; Climate
              </h4>
              <div className="text-xs sm:text-sm space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-400">Continents / Oceans: </span>
                  <span className="font-semibold text-white">
                    {animal.continents.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Region &amp; Fossil Sites: </span>
                  <span>{animal.regionDescription}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-400">Climate: </span>
                  <span className="font-semibold text-amber-300">
                    {animal.climateZone} ({animal.temperatureRangeC})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Elevation / Depth: </span>
                  <span>{animal.habitatDepthOrAltitude}</span>
                </div>
              </div>

              {(onOpenWorldMap || onOpenAnatomy) && (
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {onOpenWorldMap && (
                    <button
                      type="button"
                      onClick={onOpenWorldMap}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-200 text-xs font-bold transition cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>{encLabels.openWorldMapCta}</span>
                    </button>
                  )}
                  {onOpenAnatomy && (
                    <button
                      type="button"
                      onClick={onOpenAnatomy}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-bold transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>{encLabels.openAnatomyCta}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
