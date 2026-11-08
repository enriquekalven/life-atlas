/**
 * Deterministic CPU noise used to synthesise skin/fur/scale/feather textures.
 * All functions are optionally periodic along X (integer period `px`) so that
 * a texture wrapped around a body has no visible seam along the dorsal midline.
 */

const UINT_MAX = 4294967295;

export function hash2(ix: number, iy: number, seed: number): number {
  let h =
    Math.imul(ix | 0, 374761393) ^
    Math.imul(iy | 0, 668265263) ^
    Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / UINT_MAX;
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function wrap(i: number, period: number): number {
  return period > 0 ? ((i % period) + period) % period : i;
}

/** Smooth value noise in [0,1]. */
export function noise2(x: number, y: number, seed: number, px = 0): number {
  const ix0 = Math.floor(x);
  const iy0 = Math.floor(y);
  const fx = x - ix0;
  const fy = y - iy0;
  const sx = fade(fx);
  const sy = fade(fy);
  const x0 = wrap(ix0, px);
  const x1 = wrap(ix0 + 1, px);
  const a = hash2(x0, iy0, seed);
  const b = hash2(x1, iy0, seed);
  const c = hash2(x0, iy0 + 1, seed);
  const d = hash2(x1, iy0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

/** Fractal Brownian motion in [0,1]. */
export function fbm(x: number, y: number, seed: number, octaves = 4, px = 0): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise2(x * freq, y * freq, seed + o * 31, px * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

/** Ridged multifractal in [0,1] — great for skin creases and wrinkles. */
export function ridged(x: number, y: number, seed: number, octaves = 4, px = 0): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    const n = noise2(x * freq, y * freq, seed + o * 47, px * freq);
    sum += amp * (1 - Math.abs(2 * n - 1));
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

export interface CellResult {
  /** Distance to the nearest feature point. */
  f1: number;
  /** Distance to the second nearest feature point. */
  f2: number;
  /** Stable pseudo-random id of the nearest cell in [0,1]. */
  id: number;
}

/** Worley / cellular noise for scales, plates, spots and compound eyes. */
export function cellular(
  x: number,
  y: number,
  seed: number,
  px = 0,
  jitter = 0.85
): CellResult {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let f1 = 9;
  let f2 = 9;
  let id = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const wx = wrap(cx, px);
      const jx = (hash2(wx, cy, seed) - 0.5) * jitter;
      const jy = (hash2(wx, cy, seed + 7) - 0.5) * jitter;
      const fxp = cx + 0.5 + jx;
      const fyp = cy + 0.5 + jy;
      const d = Math.hypot(fxp - x, fyp - y);
      if (d < f1) {
        f2 = f1;
        f1 = d;
        id = hash2(wx, cy, seed + 13);
      } else if (d < f2) {
        f2 = d;
      }
    }
  }
  return { f1, f2, id };
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
