import * as THREE from 'three';
import { VisualPalette } from '../types/atlas';
import { TextureParams } from './bodyPlans';
import { cellular, clamp01, fbm, noise2, ridged, smoothstep } from './noise';

/**
 * Procedural PBR map synthesis. Textures live in body UV space:
 *   u = around the body (0 = dorsal midline by default), v = snout → tail.
 * Everything is periodic in u so the dorsal seam is invisible.
 */

export interface AnimalMaps {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  furAlpha: THREE.CanvasTexture | null;
  dispose: () => void;
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  const k = clamp01(t);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

function scale(a: RGB, k: number): RGB {
  return [clamp01(a[0] * k), clamp01(a[1] * k), clamp01(a[2] * k)];
}

function makeTexture(canvas: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function heightToNormalCanvas(height: Float32Array, size: number, strength: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const k = strength * 4.2;
  for (let y = 0; y < size; y++) {
    const yu = Math.max(0, y - 1);
    const yd = Math.min(size - 1, y + 1);
    for (let x = 0; x < size; x++) {
      const xl = (x - 1 + size) % size;
      const xr = (x + 1) % size;
      const dx = (height[y * size + xr] - height[y * size + xl]) * k;
      const dy = (height[yd * size + x] - height[yu * size + x]) * k;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function createAnimalMaps(palette: VisualPalette, params: TextureParams, size = 512): AnimalMaps {
  const pattern = params.pattern ?? palette.patternType;
  const seed = params.seed ?? 11;
  const primary = hexToRgb(palette.primaryColor);
  const secondary = hexToRgb(palette.secondaryColor);
  const accent = hexToRgb(palette.accentColor);
  const white: RGB = [0.97, 0.97, 0.95];
  const dorsalU = params.dorsalU ?? 0;
  const mottle = params.mottle ?? 0.2;
  const ventralBlend = params.ventralBlend ?? 0.5;
  const furGrain = params.furGrain ?? 0;

  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const actx = albedoCanvas.getContext('2d')!;
  const aimg = actx.createImageData(size, size);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d')!;
  const rimg = rctx.createImageData(size, size);

  const height = new Float32Array(size * size);
  const baseRough = palette.skinRoughness;

  const spotCol: RGB = params.spotColor === 'white' ? white : params.spotColor === 'accent' ? accent : secondary;
  const spotDensity = params.spotDensity ?? 10;
  const spotSize = params.spotSize ?? 0.32;
  const spotFill = params.spotFill ?? 0.6;
  const stripeCount = params.stripeCount ?? 18;
  const scaleSize = params.scaleSize ?? 1;
  const sharp = params.sharpness ?? 0.5;

  for (let py = 0; py < size; py++) {
    const v = (py + 0.5) / size;
    for (let px = 0; px < size; px++) {
      const u = (px + 0.5) / size;
      // distance from dorsal midline (0) to ventral midline (1)
      let du = Math.abs(u - dorsalU);
      du = Math.min(du, 1 - du) * 2;
      const wobble = (fbm(u * 6, v * 6, seed + 1, 3, 6) - 0.5) * 0.35;
      const softness = 0.3 * (1 - sharp) + 0.02;
      const vent = smoothstep(0.55 - softness, 0.55 + softness, du + wobble);

      let col: RGB = primary;
      let h = 0;
      let rough = baseRough;

      const mot = (fbm(u * 9 + wobble, v * 9 - wobble, seed + 2, 4, 0) - 0.5) * mottle;
      const grain = (noise2(u * 200, v * 200, seed + 3, 200) - 0.5) * 0.04;
      h += (fbm(u * 18 + wobble * 2.2, v * 18 - wobble * 2.2, seed + 4, 3, 0) - 0.5) * 0.06;

      switch (pattern) {
        case 'stripes': {
          const warp = (fbm(u * 5, v * 5, seed + 6, 3, 5) - 0.5) * 1.1;
          const ph = v * stripeCount + warp + 0.3 * Math.sin(u * Math.PI * 4);
          const f = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2);
          const w = 0.5 + 0.14 * noise2(u * 3, v * 24, seed + 7, 3);
          let stripe = smoothstep(w - 0.06, w + 0.06, f);
          stripe *= 1 - vent * 0.85;
          stripe *= smoothstep(0.05, 0.13, v);
          const brk = smoothstep(0.3, 0.55, fbm(u * 10, v * 16, seed + 8, 3, 10));
          stripe *= 0.72 + 0.28 * brk;
          col = mix(mix(primary, secondary, vent * ventralBlend), accent, stripe * 0.95);
          break;
        }
        case 'spots': {
          const c = cellular(u * spotDensity, v * spotDensity * 1.4, seed + 9, spotDensity, 0.9);
          const exists = c.id > 1 - spotFill ? 1 : 0;
          const r = spotSize * (0.65 + 0.7 * c.id);
          const edge = (fbm(u * 40, v * 40, seed + 10, 2, 40) - 0.5) * 0.14;
          const spot = exists * smoothstep(r + 0.07, r - 0.04, c.f1 + edge);
          const base = mix(primary, secondary, vent * ventralBlend);
          col = mix(base, spotCol, spot * 0.88);
          h += spot * 0.16;
          if (scaleSize > 0 && params.scaleSize) {
            const su = u * Math.round(48 * scaleSize);
            const sv = v * Math.round(56 * scaleSize);
            const diag = 0.5 + 0.5 * Math.sin((su + sv) * Math.PI * 2) * Math.sin((su - sv) * Math.PI * 2);
            const scaleArch = smoothstep(0.18, 0.72, diag);
            h += scaleArch * 0.018;
            col = scale(col, 0.975 + 0.025 * scaleArch);
          }
          break;
        }
        case 'countershade': {
          col = mix(primary, secondary, vent * Math.max(ventralBlend, 0.9));
          if (params.grooves && v < 0.55) {
            const g = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 70);
            const inGroove = smoothstep(0.7, 0.9, g) * smoothstep(0.35, 0.75, du) * smoothstep(0.55, 0.45, v);
            h -= inGroove * 0.6;
            col = scale(col, 1 - inGroove * 0.12);
          }
          if (params.scaleSize) {
            const su = u * Math.round(52 * scaleSize);
            const sv = v * Math.round(62 * scaleSize);
            const diag = 0.5 + 0.5 * Math.sin((su + sv) * Math.PI * 2) * Math.sin((su - sv) * Math.PI * 2);
            const scaleArch = smoothstep(0.18, 0.72, diag);
            h += scaleArch * 0.015;
            col = scale(col, 0.98 + 0.02 * scaleArch);
          }
          // Organic dorsal mottling (whale / shark / pelagic fish dappled markings)
          const spk = smoothstep(0.58, 0.74, fbm(u * 22 + wobble * 2.5, v * 22 - wobble * 2.5, seed + 13, 3, 0)) * (1 - vent) * mottle;
          col = mix(col, secondary, spk * 0.42);
          break;
        }
        case 'scales': {
          const su = u * Math.round(46 * scaleSize);
          const sv = v * Math.round(54 * scaleSize);
          const diag = 0.5 + 0.5 * Math.sin((su + sv) * Math.PI * 2) * Math.sin((su - sv) * Math.PI * 2);
          const border = smoothstep(0.16, 0.72, diag);
          let base = mix(primary, secondary, vent * ventralBlend);
          base = scale(base, 0.96 + 0.04 * border);
          h += border * 0.028;
          if (params.armorDorsal && du < 0.42 && v > 0.22 && v < 0.86) {
            const gx = u * 26;
            const gy = v * 34;
            const fx = gx - Math.floor(gx);
            const fy = gy - Math.floor(gy);
            const rect = smoothstep(0.08, 0.24, fx) * smoothstep(0.92, 0.76, fx) * smoothstep(0.08, 0.24, fy) * smoothstep(0.92, 0.76, fy);
            h += rect * 0.22 * (1 - du / 0.42);
            base = scale(base, 1 - rect * 0.04);
          }
          col = base;
          break;
        }
        case 'plates': {
          const armorEnd = params.armorEnd ?? 1;
          const cs = Math.round(9 * scaleSize);
          const sc = cellular(u * cs, v * cs * 1.3, seed + 15, cs, 0.8);
          const border = smoothstep(0.03, 0.2, sc.f2 - sc.f1);
          const inArmor = smoothstep(armorEnd + 0.04, armorEnd - 0.04, v);
          const tint = 1 + (sc.id - 0.5) * 0.14;
          let base = mix(primary, secondary, vent * ventralBlend);
          base = mix(base, scale(base, tint * (0.76 + 0.24 * border)), inArmor);
          h += border * 0.75 * inArmor;
          col = base;
          break;
        }
        case 'feathers': {
          const rows = 54;
          const cols = 28;
          const row = v * rows;
          const r = Math.floor(row);
          const fy = row - r;
          const colv = u * cols + (r % 2) * 0.5;
          const fx = colv - Math.floor(colv) - 0.5;
          const tipDist = Math.hypot(fx * 2.05, (fy - 0.32) * 1.45);
          const edge = smoothstep(0.84, 1.0, tipDist);
          const barb = 0.5 + 0.5 * Math.sin(Math.atan2(fx * 2, 1.15 - fy) * 42);
          let base = mix(primary, secondary, vent * ventralBlend);
          base = scale(base, (1 - 0.09 * edge) * (0.97 + 0.045 * barb));
          if (params.barring) {
            const bars = smoothstep(0.68, 0.82, 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 52 + wobble * 5)) * vent;
            base = mix(base, accent, bars * 0.58);
          }
          if (params.tailBands && v > 0.68) {
            const bands = smoothstep(0.68, 0.8, 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 18));
            base = mix(base, accent, bands * 0.8);
          }
          h += (1 - edge) * 0.12 + barb * 0.05;
          col = base;
          break;
        }
        case 'iridescent': {
          const bands = params.segmentBands ?? 0;
          const hue = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 2 + u * Math.PI * 2);
          let base = mix(primary, accent, hue * 0.45);
          if (bands > 0) {
            const b = smoothstep(0.82, 0.96, 0.5 + 0.5 * Math.cos(v * Math.PI * 2 * bands));
            base = mix(base, secondary, b * 0.75);
            h -= b * 0.5;
          }
          base = mix(base, secondary, vent * ventralBlend * 0.6);
          col = base;
          rough = baseRough * 0.8;
          break;
        }
        case 'solid':
        default: {
          col = mix(primary, secondary, vent * ventralBlend);
          const wr = params.wrinkles ?? 0;
          if (wr > 0) {
            // Cross-hatched pachyderm/sirenian water-retaining epidermal crackle channels
            const w1 = ridged(u * 46, v * 58, seed + 16, 3, 46);
            const w2 = ridged((u + v * 0.6) * 76, (v - u * 0.6) * 76, seed + 17, 2, 76);
            const ringCrease = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 64 + wobble * 8);
            const crease = (1 - w1) * 0.5 + (1 - w2) * 0.35 + ringCrease * 0.15;
            h += (1 - crease) * wr * 0.32;
            col = scale(col, 1 - crease * 0.085 * wr);
          }
          if (params.spotDensity && params.spotSize) {
            const c = cellular(u * spotDensity, v * spotDensity * 1.4, seed + 18, spotDensity, 0.9);
            const spot = smoothstep(spotSize, spotSize - 0.08, c.f1);
            h += spot * 0.25;
          }
          break;
        }
      }

      if (furGrain > 0) {
        const hair = noise2(u * 260, v * 34, seed + 19, 260);
        h += (hair - 0.5) * 0.14 * furGrain;
        col = scale(col, 1 + (hair - 0.5) * 0.055 * furGrain);
      }

      if (params.darkHead && v < params.darkHead) {
        const k = smoothstep(params.darkHead, params.darkHead - 0.05, v);
        const throat = params.earPatch ? 0 : smoothstep(0.75, 0.95, du) * 0.9;
        col = mix(col, params.earPatch ? [0.05, 0.05, 0.07] : accent, k * (1 - throat));
      }
      if (params.earPatch) {
        const d = Math.hypot((v - 0.13) * 2.4, (du - 0.52) * 1.1);
        const patch = smoothstep(0.1, 0.06, d);
        col = mix(col, [0.98, 0.72, 0.15], patch);
        const chest = smoothstep(0.42, 0.25, v) * smoothstep(0.2, 0.3, v) * vent;
        col = mix(col, [0.99, 0.86, 0.45], chest * 0.6);
      }

      // Anatomical dorsal-to-ventral ambient occlusion & lateral terminator contrast
      const lateralHighlight = Math.exp(-Math.pow((du - 0.42) / 0.24, 2)) * 0.06;
      const ventralAO = smoothstep(0.68, 0.98, du) * 0.14;
      col = scale(col, 1 + mot + grain + lateralHighlight - ventralAO);
      rough = clamp01(rough + (fbm(u * 30, v * 30, seed + 20, 3, 30) - 0.5) * 0.25);

      const i = (py * size + px) * 4;
      aimg.data[i] = Math.round(col[0] * 255);
      aimg.data[i + 1] = Math.round(col[1] * 255);
      aimg.data[i + 2] = Math.round(col[2] * 255);
      aimg.data[i + 3] = 255;
      const rv = Math.round(rough * 255);
      rimg.data[i] = rv;
      rimg.data[i + 1] = rv;
      rimg.data[i + 2] = rv;
      rimg.data[i + 3] = 255;
      height[py * size + px] = h;
    }
  }

  actx.putImageData(aimg, 0, 0);
  rctx.putImageData(rimg, 0, 0);
  const normalCanvas = heightToNormalCanvas(height, size, (params.normalStrength ?? 1) * 0.85);

  let furAlpha: THREE.CanvasTexture | null = null;
  if (furGrain > 0 || pattern === 'feathers') {
    const fsize = 256;
    const fc = document.createElement('canvas');
    fc.width = fsize;
    fc.height = fsize;
    const fctx = fc.getContext('2d')!;
    const fimg = fctx.createImageData(fsize, fsize);
    for (let y = 0; y < fsize; y++) {
      for (let x = 0; x < fsize; x++) {
        const u = x / fsize;
        const v = y / fsize;
        const n = noise2(u * 180, v * 36, seed + 21, 180) * 0.6 + noise2(u * 90, v * 90, seed + 22, 90) * 0.4;
        const a = smoothstep(0.44, 0.6, n);
        const i = (y * fsize + x) * 4;
        const val = Math.round(a * 255);
        fimg.data[i] = val;
        fimg.data[i + 1] = val;
        fimg.data[i + 2] = val;
        fimg.data[i + 3] = 255;
      }
    }
    fctx.putImageData(fimg, 0, 0);
    furAlpha = makeTexture(fc, false);
    furAlpha.wrapT = THREE.RepeatWrapping;
  }

  const map = makeTexture(albedoCanvas, true);
  const normalMap = makeTexture(normalCanvas, false);
  const roughnessMap = makeTexture(roughCanvas, false);

  return {
    map,
    normalMap,
    roughnessMap,
    furAlpha,
    dispose: () => {
      map.dispose();
      normalMap.dispose();
      roughnessMap.dispose();
      furAlpha?.dispose();
    },
  };
}

let muscleCache: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } | null = null;

/** Shared striated-muscle albedo + normal map. */
export function getMuscleMaps(): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  if (muscleCache) return muscleCache;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const height = new Float32Array(size * size);
  const dark: RGB = [0.42, 0.06, 0.09];
  const bright: RGB = [0.78, 0.13, 0.2];
  const fascia: RGB = [0.92, 0.78, 0.74];
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const warp = (fbm(u * 6, v * 6, 77, 3, 6) - 0.5) * 5;
      const fib = 0.5 + 0.5 * Math.sin(v * Math.PI * 2 * 70 + warp);
      const bundle = smoothstep(0.3, 0.7, fbm(u * 5, v * 18, 78, 3, 5));
      let col = mix(dark, bright, fib * 0.5 + bundle * 0.3);
      const sheen = smoothstep(0.78, 0.9, ridged(u * 8, v * 20, 79, 3, 8));
      col = mix(col, fascia, sheen * 0.45);
      const i = (y * size + x) * 4;
      img.data[i] = Math.round(col[0] * 255);
      img.data[i + 1] = Math.round(col[1] * 255);
      img.data[i + 2] = Math.round(col[2] * 255);
      img.data[i + 3] = 255;
      height[y * size + x] = fib * 0.5 + bundle * 0.4 + sheen * 0.3;
    }
  }
  ctx.putImageData(img, 0, 0);
  const map = makeTexture(canvas, true);
  map.wrapT = THREE.RepeatWrapping;
  const normalMap = makeTexture(heightToNormalCanvas(height, size, 0.8), false);
  normalMap.wrapT = THREE.RepeatWrapping;
  muscleCache = { map, normalMap };
  return muscleCache;
}

let compoundEyeCache: THREE.CanvasTexture | null = null;

/** Hexagonal facet normal map for compound eyes. */
export function getCompoundEyeNormal(): THREE.CanvasTexture {
  if (compoundEyeCache) return compoundEyeCache;
  const size = 128;
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = cellular((x / size) * 14, (y / size) * 14, 5, 14, 0.15);
      height[y * size + x] = 1 - smoothstep(0, 0.5, c.f1);
    }
  }
  compoundEyeCache = makeTexture(heightToNormalCanvas(height, size, 1.4), false);
  compoundEyeCache.wrapT = THREE.RepeatWrapping;
  return compoundEyeCache;
}
