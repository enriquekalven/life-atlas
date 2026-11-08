import { CURATED_ANIMALS } from './animals';
import { MODEL_MANIFEST } from './modelManifest';

const LANDING_STORAGE_KEY = 'tf-last-landing-animal';
let cachedPageLoadLandingId: string | null = null;

/**
 * Curated photorealistic 3D showcase specimens (museum photogrammetry scans,
 * rigged PBR sculptures in MODEL_MANIFEST, plus the 4-layer Z-Anatomy Human Atlas).
 * New visitors land on a randomized centerpiece from this pool so their very first
 * impression is always a high-detail 3D specimen.
 */
export const HERO_SHOWCASE_ANIMAL_IDS: readonly string[] = Object.freeze(
  [...Object.keys(MODEL_MANIFEST), 'homo-sapiens'].filter((id) =>
    CURATED_ANIMALS.some((animal) => animal.id === id)
  )
);

function secureRandomFraction(): number {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
  return Math.random();
}

export function isValidCuratedAnimalId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    CURATED_ANIMALS.some((animal) => animal.id === value)
  );
}

export interface RandomLandingOptions {
  excludeId?: string | null;
  showcaseOnly?: boolean;
  rng?: () => number;
}

/**
 * Picks a randomized animal ID for initial landing or discovery.
 * Guarantees not to repeat `excludeId` whenever more than 1 candidate exists.
 */
export function pickRandomLandingAnimalId(options: RandomLandingOptions = {}): string {
  const { excludeId = null, showcaseOnly = true, rng = secureRandomFraction } = options;
  const basePool =
    showcaseOnly && HERO_SHOWCASE_ANIMAL_IDS.length > 0
      ? [...HERO_SHOWCASE_ANIMAL_IDS]
      : CURATED_ANIMALS.map((a) => a.id);

  const filtered =
    excludeId && basePool.length > 1
      ? basePool.filter((id) => id !== excludeId)
      : basePool;

  const idx = Math.min(
    filtered.length - 1,
    Math.max(0, Math.floor(rng() * filtered.length))
  );
  return filtered[idx] ?? CURATED_ANIMALS[0].id;
}

export function resetLandingCacheForTests(): void {
  cachedPageLoadLandingId = null;
}

/**
 * Selects and records a fresh randomized landing specimen for a new page load or new tab,
 * avoiding the animal shown on the immediately preceding visit.
 * Idempotent within a single document lifecycle so React StrictMode double-invocations
 * never clobber the stored last-seen specimen.
 */
export function selectInitialLandingAnimalId(explicitUrlAnimalId: string | null): string {
  if (explicitUrlAnimalId && isValidCuratedAnimalId(explicitUrlAnimalId)) {
    return explicitUrlAnimalId;
  }

  if (cachedPageLoadLandingId) {
    return cachedPageLoadLandingId;
  }

  let previousId: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LANDING_STORAGE_KEY);
      if (isValidCuratedAnimalId(raw)) {
        previousId = raw;
      }
    } catch {
      // Ignore storage access errors in strict privacy modes
    }
  }

  const chosen = pickRandomLandingAnimalId({
    excludeId: previousId,
    showcaseOnly: true,
  });

  cachedPageLoadLandingId = chosen;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LANDING_STORAGE_KEY, chosen);
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }

  return chosen;
}

/**
 * Picks a random next species from any list of animal IDs (excluding currentId).
 */
export function pickRandomFromIds(
  candidateIds: readonly string[],
  currentId: string,
  rng: () => number = secureRandomFraction
): string {
  const pool =
    candidateIds.length > 0
      ? candidateIds
      : CURATED_ANIMALS.map((animal) => animal.id);
  const candidates =
    pool.length > 1 ? pool.filter((id) => id !== currentId) : pool;
  const idx = Math.min(
    candidates.length - 1,
    Math.max(0, Math.floor(rng() * candidates.length))
  );
  return candidates[idx] ?? currentId;
}
