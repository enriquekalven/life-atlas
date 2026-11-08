import { describe, expect, it } from 'vitest';
import { CURATED_ANIMALS } from './data/animals';
import { GEOLOGICAL_ERAS } from './data/geologicalEras';
import { getOcularBiology, OCULAR_BIOLOGY_BY_SPECIES } from './data/ocularBiology';
import { isSupportedLang, SUPPORTED_LANGUAGES, UI_STRINGS } from './i18n';
import { sanitizePlainText, validateSearchQuery } from './services/encyclopediaApi';
import { SPECIES_WITH_PLANS } from './three/bodyPlans';

describe('TerraFauna 3D Atlas — Dataset, Anatomy, i18n & Security Verification', () => {
  it('contains both living and extinct animals covering all 11 geological eras', () => {
    const living = CURATED_ANIMALS.filter((a) => a.temporalStatus === 'living');
    const extinct = CURATED_ANIMALS.filter((a) => a.temporalStatus === 'extinct');

    expect(living.length).toBe(15);
    expect(extinct.length).toBe(12);
    expect(CURATED_ANIMALS.length).toBe(27);

    const specificEras = GEOLOGICAL_ERAS.filter((e) => e.id !== 'all');
    expect(specificEras.length).toBe(11);
    for (const era of specificEras) {
      const count = CURATED_ANIMALS.filter((a) => a.eraId === era.id).length;
      expect(count, `Era ${era.id} must have at least 1 species`).toBeGreaterThanOrEqual(1);
    }
  });

  it('leaves dinosaurs and DinoVerse-exclusive species to DinoVerse 3D with zero overlap', () => {
    const DINOSAUR_CLADES = /dinosauria|saurischia|ornithischia|theropoda|sauropoda|ceratopsia/i;
    const dinosaurs = CURATED_ANIMALS.filter(
      (a) => a.taxonomy.class !== 'Aves' && DINOSAUR_CLADES.test(`${a.taxonomy.class} ${a.taxonomy.order}`)
    );
    expect(dinosaurs.map((a) => a.id)).toEqual([]);

    const DINOVERSE_IDS = [
      'quetzalcoatlus-northropi',
      'mosasaurus-hoffmannii',
      'dimetrodon-grandis',
      'archaeopteryx-lithographica',
    ];
    for (const id of DINOVERSE_IDS) {
      expect(CURATED_ANIMALS.some((a) => a.id === id)).toBe(false);
    }
  });

  it('verifies every curated animal has a bespoke 3D body plan, 4-layer anatomy hotspots, and museum ocular biology profile', () => {
    for (const animal of CURATED_ANIMALS) {
      expect(SPECIES_WITH_PLANS).toContain(animal.id);
      expect(OCULAR_BIOLOGY_BY_SPECIES[animal.id]).toBeDefined();
      const ocular = getOcularBiology(animal);
      expect(ocular.eyeballDiameterMm.length).toBeGreaterThan(0);
      expect(ocular.kidVisionSecret.length).toBeGreaterThan(20);
      expect(ocular.museumReference.length).toBeGreaterThan(10);
      const layers = new Set(animal.anatomyHotspots.map((h) => h.layer));
      expect(layers.has('exterior')).toBe(true);
      expect(layers.has('muscular')).toBe(true);
      expect(layers.has('skeletal')).toBe(true);
      expect(layers.has('organs')).toBe(true);
      expect(animal.coordinates.length).toBeGreaterThanOrEqual(1);
      expect(animal.quiz.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('supports all 11 languages (including RTL Arabic) and validates language codes against an allow-list', () => {
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual([
      'en', 'es', 'zh', 'yue', 'ja', 'ko', 'pt', 'fr', 'it', 'de', 'ar',
    ]);
    const ar = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
    expect(ar?.dir).toBe('rtl');

    const enKeys = Object.keys(UI_STRINGS.en).sort();
    for (const { code } of SUPPORTED_LANGUAGES) {
      expect(Object.keys(UI_STRINGS[code]).sort()).toEqual(enKeys);
      expect(isSupportedLang(code)).toBe(true);
    }
    expect(isSupportedLang('<script>')).toBe(false);
    expect(isSupportedLang('xx')).toBe(false);
  });

  it('enforces strict input validation and output sanitization against XSS/injection payloads', () => {
    expect(validateSearchQuery('Tyrannosaurus rex')).toBe('Tyrannosaurus rex');
    expect(validateSearchQuery('<script>alert(1)</script>')).toBeNull();
    expect(validateSearchQuery("'; DROP TABLE animals;--")).toBeNull();
    expect(validateSearchQuery('a')).toBeNull();

    const sanitized = sanitizePlainText('<img src=x onerror="alert(1)"> Panthera');
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).not.toContain('"');
    expect(sanitized).toContain('Panthera');
  });
});

import {
  HERO_SHOWCASE_ANIMAL_IDS,
  pickRandomFromIds,
  pickRandomLandingAnimalId,
  selectInitialLandingAnimalId,
} from './data/randomLanding';
import { ENCYCLOPEDIA_UI_LABELS } from './data/encyclopediaUiLabels';

describe('Interactive 3D Animal Encyclopedia — Randomized Landing & Mode Localization', () => {
  it('populates a verified photorealistic 3D showcase pool and randomizes without repeating excluded species', () => {
    expect(HERO_SHOWCASE_ANIMAL_IDS.length).toBeGreaterThanOrEqual(15);
    for (const id of HERO_SHOWCASE_ANIMAL_IDS) {
      expect(CURATED_ANIMALS.some((a) => a.id === id)).toBe(true);
    }

    // Deterministic RNG sweep across [0, 0.99] hits multiple distinct species
    const seen = new Set<string>();
    for (let i = 0; i < HERO_SHOWCASE_ANIMAL_IDS.length; i++) {
      const frac = (i + 0.25) / HERO_SHOWCASE_ANIMAL_IDS.length;
      const chosen = pickRandomLandingAnimalId({ rng: () => frac });
      expect(HERO_SHOWCASE_ANIMAL_IDS).toContain(chosen);
      seen.add(chosen);
    }
    expect(seen.size).toBe(HERO_SHOWCASE_ANIMAL_IDS.length);

    // Never repeats excludeId
    const excluded = HERO_SHOWCASE_ANIMAL_IDS[0];
    for (let i = 0; i < 25; i++) {
      const chosen = pickRandomLandingAnimalId({
        excludeId: excluded,
        rng: () => (i % 10) / 10,
      });
      expect(chosen).not.toBe(excluded);
    }

    // Random next button never stays on currentId when pool > 1
    expect(pickRandomFromIds(['great-white-shark', 'siberian-tiger'], 'great-white-shark', () => 0)).toBe('siberian-tiger');
  });

  it('honors valid ?animal= deep links while randomizing when absent or invalid', () => {
    expect(selectInitialLandingAnimalId('siberian-tiger')).toBe('siberian-tiger');
    expect(selectInitialLandingAnimalId('great-white-shark')).toBe('great-white-shark');
    const fallbackRandom = selectInitialLandingAnimalId('<script>bad</script>');
    expect(HERO_SHOWCASE_ANIMAL_IDS).toContain(fallbackRandom);
  });

  it('provides complete Encyclopedia HUD and Mode Switcher translations across all 11 languages', () => {
    const enKeys = Object.keys(ENCYCLOPEDIA_UI_LABELS.en).sort();
    for (const { code } of SUPPORTED_LANGUAGES) {
      expect(Object.keys(ENCYCLOPEDIA_UI_LABELS[code]).sort()).toEqual(enKeys);
      for (const k of enKeys) {
        const val = ENCYCLOPEDIA_UI_LABELS[code][k as keyof typeof ENCYCLOPEDIA_UI_LABELS.en];
        expect(val.trim().length, `${code}.${k}`).toBeGreaterThan(0);
      }
    }
  });
});

