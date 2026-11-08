import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { CURATED_ANIMALS } from '../data/animals';
import { SUPPORTED_LANGUAGES, SupportedLang } from '../i18n';
import {
  buildLocalizedHotspotNarration,
  formatLocalizedWeight,
  getLocalizedAnimalName,
  getLocalizedSpeciesNarration,
  SPECIES_LOCALIZED_NARRATIONS,
} from '../data/localizedNarrations';
import {
  BCP_47_BY_LANG,
  normalizeVoiceBcp47,
  pickBestBrowserVoice,
  sanitizeTextForSpeech,
  splitSpeechChunks,
} from '../services/narrationAudio';

describe('11-Language Narration & Studio Audio Verification', () => {
  const allLangs: SupportedLang[] = SUPPORTED_LANGUAGES.map((l) => l.code);

  it('maps all 11 supported languages to valid BCP-47 voice tags', () => {
    expect(allLangs).toHaveLength(11);
    for (const lang of allLangs) {
      expect(BCP_47_BY_LANG[lang]).toBeTruthy();
      expect(BCP_47_BY_LANG[lang]).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
    }
  });

  it('provides 100% native localized species names and narrations across all 11 languages with zero Latin leakage in non-Latin scripts', () => {
    expect(CURATED_ANIMALS).toHaveLength(42);
    for (const animal of CURATED_ANIMALS) {
      const entry = SPECIES_LOCALIZED_NARRATIONS[animal.id];
      expect(entry, `Missing localized narration entry for ${animal.id}`).toBeDefined();

      for (const lang of allLangs) {
        const name = getLocalizedAnimalName(animal, lang);
        const bio = getLocalizedSpeciesNarration(animal, lang);
        expect(name.length, `Empty localized name for ${animal.id} (${lang})`).toBeGreaterThan(1);
        expect(bio.length, `Short localized narration for ${animal.id} (${lang})`).toBeGreaterThan(25);

        const hotspot = animal.anatomyHotspots[0];
        const hotspotNarration = buildLocalizedHotspotNarration(animal, hotspot, lang);
        expect(hotspotNarration).toContain(name);

        if (lang === 'zh' || lang === 'yue' || lang === 'ja' || lang === 'ko' || lang === 'ar') {
          expect(bio).not.toMatch(/[A-Za-z]{2,}/);
          expect(hotspotNarration).not.toMatch(/[A-Za-z]{2,}/);
        }
      }
    }
  });

  it('formats weights in each language native units (吨, 噸, طن, トン, 톤, toneladas, tonnellate, tonnes, Tonnen)', () => {
    expect(formatLocalizedWeight(6000, 'en')).toBe('6 metric tons');
    expect(formatLocalizedWeight(6000, 'es')).toBe('6 toneladas');
    expect(formatLocalizedWeight(6000, 'zh')).toBe('6吨');
    expect(formatLocalizedWeight(6000, 'yue')).toBe('6噸');
    expect(formatLocalizedWeight(6000, 'ja')).toBe('6トン');
    expect(formatLocalizedWeight(6000, 'ko')).toBe('6톤');
    expect(formatLocalizedWeight(6000, 'pt')).toBe('6 toneladas');
    expect(formatLocalizedWeight(6000, 'fr')).toBe('6 tonnes');
    expect(formatLocalizedWeight(6000, 'it')).toBe('6 tonnellate');
    expect(formatLocalizedWeight(6000, 'de')).toBe('6 Tonnen');
    expect(formatLocalizedWeight(6000, 'ar')).toBe('6 طن');
  });

  it('filters out macOS Eloquence novelty voices and prioritizes natural voices per language', () => {
    const mockVoices = [
      { name: 'Eddy (English (US))', lang: 'en-US', localService: true },
      { name: 'Flo (English (US))', lang: 'en-US', localService: true },
      { name: 'Grandpa (Spanish (Spain))', lang: 'es-ES', localService: true },
      { name: 'Samantha', lang: 'en-US', localService: true },
      { name: 'Mónica', lang: 'es-ES', localService: true },
      { name: 'Tingting', lang: 'zh-CN', localService: true },
      { name: 'Sinji', lang: 'zh-HK', localService: true },
      { name: 'Majed', lang: 'ar_001', localService: true },
    ] as unknown as SpeechSynthesisVoice[];

    vi.stubGlobal('window', {
      speechSynthesis: {
        getVoices: () => mockVoices,
      },
    });

    expect(pickBestBrowserVoice('en')?.name).toBe('Samantha');
    expect(pickBestBrowserVoice('es')?.name).toBe('Mónica');
    expect(pickBestBrowserVoice('zh')?.name).toBe('Tingting');
    expect(pickBestBrowserVoice('yue')?.name).toBe('Sinji');
    const arVoice = pickBestBrowserVoice('ar');
    expect(arVoice?.name).toBe('Majed');
    expect(normalizeVoiceBcp47(arVoice?.lang, 'ar-SA')).toBe('ar-001');

    vi.unstubAllGlobals();
  });

  it('splits long narration texts into sentence chunks <= 140 characters and strips parentheticals', () => {
    const longText =
      'African Bush Elephant (Loxodonta africana) is the largest living land animal on Earth. ' +
      'Its prehensile trunk contains over forty thousand muscles and acts as a fifth limb, snorkel, and precision grasping tool across the savanna.';
    const chunks = splitSpeechChunks(longText, 140);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(140);
      expect(chunk).not.toContain('Loxodonta');
    }
    expect(sanitizeTextForSpeech('30m × 5m (98ft) • ≈180t — Pelagic')).toBe(
      '30m 5m , 180t , Pelagic'
    );
  });

  it('verifies all 297 pre-synthesized Chirp3-HD studio MP3 files exist on disk and are non-empty', () => {
    const publicAudioRoot = path.resolve(process.cwd(), 'public', 'audio');
    const studioAnimals = CURATED_ANIMALS.slice(0, 27);
    let verifiedCount = 0;

    for (const animal of studioAnimals) {
      for (const lang of allLangs) {
        const mp3Path = path.join(publicAudioRoot, lang, `${animal.id}.mp3`);
        expect(fs.existsSync(mp3Path), `Missing studio MP3: ${mp3Path}`).toBe(true);
        const stat = fs.statSync(mp3Path);
        expect(stat.size, `MP3 too small: ${mp3Path}`).toBeGreaterThan(5000);
        verifiedCount++;
      }
    }

    expect(verifiedCount).toBe(297);
  });
});
