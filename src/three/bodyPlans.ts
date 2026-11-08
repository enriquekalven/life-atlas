import { AnimalRecord, BodyArchetype, VisualPalette } from '../types/atlas';
import { Segmentation, Station } from './sweep';

/* -------------------------------------------------------------------------- */
/*  Body-plan schema                                                           */
/* -------------------------------------------------------------------------- */

export type AnatomyAnchor =
  | 'snout' | 'jaw' | 'eye' | 'brain' | 'ear' | 'neck' | 'chest' | 'heart' | 'lungs'
  | 'belly' | 'hips' | 'tail' | 'tailTip' | 'dorsal' | 'flank' | 'forelimb' | 'hindlimb'
  | 'foot' | 'pectoralFin' | 'dorsalFin' | 'caudalFin' | 'wing' | 'sail' | 'frill'
  | 'tusk' | 'horn' | 'trunk' | 'arms' | 'claws' | 'gills' | 'antenna' | 'skull'
  | 'spine' | 'pelvis' | 'skin' | 'throat';

export type PlaneKind = 'side' | 'top' | 'front';
export type Posture = 'quadruped' | 'biped' | 'sprawling' | 'aquatic' | 'flying' | 'upright' | 'invertebrate';
export type MaterialKind = 'skin' | 'ivory' | 'keratin' | 'chitin' | 'dark' | 'membrane' | 'tongue' | 'gill';

export interface LimbSpec {
  role: 'fore' | 'hind' | 'arm';
  /** attach → joints → end. Right side (z > 0); mirrored unless mirror=false. */
  points: [number, number, number][];
  radii: number[];
  toes?: { count: number; length: number; radius: number; spread: number; claws?: boolean; sickle?: boolean };
  paw?: number;
  mirror?: boolean;
}

export interface FinSpec {
  kind: 'dorsal' | 'pectoral' | 'pelvic' | 'anal' | 'caudal' | 'fluke' | 'sail' | 'frill'
    | 'wing' | 'tailfan' | 'ear' | 'flap' | 'crest' | 'membrane';
  outline: [number, number][];
  position: [number, number, number];
  plane?: PlaneKind;
  rotation?: [number, number, number];
  thickness?: number;
  mirror?: boolean;
  smooth?: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'membrane' | 'ivory' | 'dark';
  opacity?: number;
  rays?: number;
  bone?: boolean;
  animate?: 'flap' | 'undulate' | 'paddle' | 'none';
  phase?: number;
  amplitude?: number;
  textured?: boolean;
}

export interface TubeSpec {
  kind: 'tusk' | 'horn' | 'trunk' | 'antenna' | 'arm' | 'gill' | 'tail' | 'tongue' | 'beak'
    | 'leg' | 'stalk' | 'whisker' | 'spike' | 'siphon' | 'wingbone' | 'crest';
  points: [number, number, number][];
  radii: number[];
  mirror?: boolean;
  material?: MaterialKind;
  color?: string;
  suckers?: boolean;
  fringe?: boolean;
  eyeAtEnd?: number;
  knob?: number;
  spines?: number;
  animate?: 'sway' | 'none';
  bone?: boolean;
  boneOnly?: boolean;
  textured?: boolean;
}

export interface EyeSpec {
  position: [number, number, number];
  radius: number;
  mirror?: boolean;
  pupil?: 'round' | 'slit' | 'hslit' | 'compound' | 'none';
  color?: string;
  ring?: string;
}

export interface MouthSpec {
  points: [number, number, number][];
  width?: number;
  mirror?: boolean;
  teeth?: { count: number; size: number; lower?: boolean; from?: number; to?: number; tilt?: number };
}

export interface ScuteSpec { from: number; to: number; count: number; rows: number; size: number; rowSpread: number }
export interface GillSlitsSpec { x0: number; dx: number; count: number; y: number; z: number; height: number }
export interface RingSpec { position: [number, number, number]; radius: number; tube: number; color: string; rotation?: [number, number, number] }

export interface SkeletonSpec {
  type: 'endo' | 'cartilage' | 'exo' | 'none';
  vertebrae: [number, number];
  ribs?: [number, number];
  skull: [number, number];
  neuralSpine?: number;
  sailHeights?: [number, number, number][]; // [t, height] pairs (as [t, h, 0])
  gastralia?: [number, number];
  pelvisT?: number;
  scapulaT?: number;
  notochord?: boolean;
  spacing?: number;
  keel?: boolean;
  urostyle?: boolean;
  internalLegs?: [number, number, number][][];
}

export type OrganExtra = 'gills' | 'airsacs' | 'threeHearts' | 'tracheae' | 'swimBladder' | 'bigLiver' | 'inkSac' | 'crop' | 'dorsalVessel' | 'baleen';

export interface OrganSpec {
  heart: number;
  lungs: number;
  brain: number;
  gut: number;
  liver?: number;
  extras?: OrganExtra[];
}

export interface TextureParams {
  pattern?: VisualPalette['patternType'];
  dorsalU?: number;
  stripeCount?: number;
  spotDensity?: number;
  spotSize?: number;
  spotFill?: number;
  spotColor?: 'secondary' | 'accent' | 'white';
  scaleSize?: number;
  armorEnd?: number;
  armorDorsal?: boolean;
  grooves?: boolean;
  wrinkles?: number;
  barring?: boolean;
  mottle?: number;
  ventralBlend?: number;
  sharpness?: number;
  seed?: number;
  normalStrength?: number;
  darkHead?: number;
  earPatch?: boolean;
  segmentBands?: number;
  furGrain?: number;
  tailBands?: boolean;
}

export interface BreathSpec { center: number; width: number; amplitude: number }

export interface BodyPlan {
  posture: Posture;
  spine: Station[];
  radial?: number;
  tubular?: number;
  segmentation?: Segmentation;
  limbs: LimbSpec[];
  fins: FinSpec[];
  tubes: TubeSpec[];
  eyes: EyeSpec[];
  mouth?: MouthSpec;
  nose?: { position: [number, number, number]; radius: number };
  nostrils?: [number, number, number][];
  scutes?: ScuteSpec;
  gillSlits?: GillSlitsSpec;
  rings?: RingSpec[];
  fur?: { length: number; shells?: number } | null;
  wet?: boolean;
  iridescence?: number;
  skeleton: SkeletonSpec;
  organs: OrganSpec;
  texture: TextureParams;
  animation: 'breathe' | 'swim-lateral' | 'swim-vertical' | 'hover' | 'flap' | 'crawl' | 'float';
  breath?: BreathSpec;
  tailSway?: number;
  groundRest: boolean;
  anchors?: Partial<Record<AnatomyAnchor, [number, number, number]>>;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const P = (x: number, y: number, ry: number, rz: number): Station => ({ x, y, ry, rz });

/* -------------------------------------------------------------------------- */
/*  Species blueprints                                                         */
/* -------------------------------------------------------------------------- */

function elephantPlan(mammoth: boolean): BodyPlan {
  const spine = mammoth
    ? [P(1.28, 0.56, 0.22, 0.19), P(1.20, 0.68, 0.34, 0.28), P(1.06, 0.82, 0.44, 0.35), P(0.86, 0.70, 0.37, 0.33),
       P(0.55, 0.72, 0.68, 0.52), P(0.10, 0.60, 0.66, 0.54), P(-0.42, 0.50, 0.58, 0.48), P(-0.78, 0.48, 0.42, 0.35),
       P(-0.98, 0.50, 0.22, 0.18), P(-1.06, 0.50, 0.08, 0.08)]
    : [P(1.28, 0.56, 0.22, 0.19), P(1.20, 0.66, 0.33, 0.28), P(1.05, 0.74, 0.41, 0.34), P(0.86, 0.66, 0.35, 0.32),
       P(0.56, 0.62, 0.60, 0.50), P(0.12, 0.58, 0.67, 0.55), P(-0.40, 0.58, 0.62, 0.50), P(-0.78, 0.58, 0.46, 0.38),
       P(-0.98, 0.60, 0.25, 0.21), P(-1.06, 0.60, 0.08, 0.08)];
  const tusks: [number, number, number][] = mammoth
    ? [[1.14, 0.46, 0.12], [1.44, 0.20, 0.18], [1.76, 0.04, 0.20], [1.98, 0.18, 0.15], [2.02, 0.38, 0.08]]
    : [[1.14, 0.46, 0.12], [1.38, 0.32, 0.15], [1.62, 0.16, 0.14], [1.76, 0.06, 0.11]];
  const earOutline: [number, number][] = mammoth
    ? [[0, 0.05], [-0.05, 0.1], [-0.2, 0.08], [-0.25, -0.05], [-0.18, -0.18], [-0.04, -0.14]]
    : [[0.04, 0.10], [-0.06, 0.28], [-0.34, 0.32], [-0.56, 0.14], [-0.60, -0.18], [-0.46, -0.48], [-0.24, -0.60], [-0.06, -0.44], [0.02, -0.16]];
  return {
    posture: 'quadruped',
    spine,
    limbs: [
      {
        role: 'fore',
        points: [[0.52, 0.42, 0.24], [0.52, -0.05, 0.30], [0.50, -0.52, 0.31], [0.50, -0.95, 0.31]],
        radii: [0.27, 0.21, 0.175, 0.19],
        toes: { count: 4, length: 0.055, radius: 0.032, spread: 0.22 },
      },
      {
        role: 'hind',
        points: [[-0.44, 0.44, 0.22], [-0.43, -0.05, 0.28], [-0.41, -0.52, 0.29], [-0.40, -0.95, 0.29]],
        radii: [0.28, 0.22, 0.175, 0.19],
        toes: { count: 4, length: 0.055, radius: 0.032, spread: 0.22 },
      },
    ],
    fins: [
      { kind: 'ear', outline: earOutline, position: [0.94, 0.72, 0.28], thickness: 0.024, rotation: [0, mammoth ? 0.22 : 0.34, -0.05], mirror: true, color: 'primary', textured: true },
    ],
    tubes: [
      {
        kind: 'trunk',
        points: [[1.16, 0.56, 0], [1.34, 0.46, 0], [1.48, 0.22, 0], [1.54, -0.10, 0], [1.48, -0.46, 0], [1.40, -0.78, 0], [1.36, -0.95, 0]],
        radii: [0.22, 0.175, 0.14, 0.115, 0.092, 0.072, 0.052],
        material: 'skin',
        textured: true,
      },
      { kind: 'tusk', points: tusks, radii: mammoth ? [0.065, 0.055, 0.045, 0.03, 0.014] : [0.055, 0.045, 0.032, 0.014], mirror: true, material: 'ivory' },
      { kind: 'tail', points: [[-1.02, 0.56, 0], [-1.16, 0.28, 0], [-1.22, -0.05, 0], [-1.20, -0.30, 0]], radii: [0.055, 0.04, 0.03, 0.025], material: 'skin', animate: 'sway', bone: true, textured: true },
    ],
    eyes: [{ position: [1.14, 0.68, 0.24], radius: 0.036, mirror: true, pupil: 'round' }],
    fur: mammoth ? { length: 0.07, shells: 2 } : null,
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.3, 0.64], skull: [0, 0.22], neuralSpine: 1.3, pelvisT: 0.76, scapulaT: 0.33 },
    organs: { heart: 0.4, lungs: 0.38, brain: 0.1, gut: 0.62, liver: 0.5 },
    texture: { pattern: 'solid', wrinkles: mammoth ? 0.3 : 0.65, mottle: 0.1, normalStrength: mammoth ? 0.8 : 0.95, furGrain: mammoth ? 1 : 0 },
    animation: 'breathe',
    breath: { center: 0.42, width: 0.25, amplitude: 0.02 },
    groundRest: true,
  };
}

function catPlan(saber: boolean): BodyPlan {
  const spine = saber
    ? [P(1.42, 0.42, 0.06, 0.07), P(1.3, 0.45, 0.16, 0.16), P(1.1, 0.55, 0.27, 0.25), P(0.9, 0.5, 0.26, 0.24), P(0.6, 0.5, 0.38, 0.31),
       P(0.25, 0.46, 0.38, 0.3), P(-0.15, 0.4, 0.33, 0.26), P(-0.5, 0.4, 0.3, 0.23), P(-0.76, 0.4, 0.19, 0.15), P(-0.86, 0.4, 0.05, 0.05)]
    : [P(1.42, 0.44, 0.05, 0.06), P(1.32, 0.46, 0.14, 0.14), P(1.14, 0.54, 0.24, 0.22), P(0.92, 0.48, 0.2, 0.19), P(0.62, 0.44, 0.31, 0.25),
       P(0.3, 0.4, 0.33, 0.26), P(-0.1, 0.38, 0.3, 0.23), P(-0.5, 0.42, 0.29, 0.21), P(-0.78, 0.44, 0.19, 0.15), P(-0.88, 0.44, 0.05, 0.05)];
  const foreR = saber ? [0.17, 0.13, 0.1, 0.09] : [0.14, 0.11, 0.085, 0.08];
  return {
    posture: 'quadruped',
    spine,
    limbs: [
      { role: 'fore', points: [[0.58, 0.2, 0.18], [0.52, -0.25, 0.19], [0.55, -0.7, 0.19], [0.66, -0.95, 0.19]], radii: foreR, paw: saber ? 0.13 : 0.11, toes: { count: 4, length: 0.09, radius: 0.03, spread: 0.3, claws: false } },
      { role: 'hind', points: [[-0.5, 0.2, 0.17], [-0.33, -0.2, 0.18], [-0.6, -0.56, 0.18], [-0.46, -0.95, 0.18]], radii: [0.17, 0.12, 0.085, 0.08], paw: 0.11, toes: { count: 4, length: 0.09, radius: 0.03, spread: 0.3 } },
    ],
    fins: [
      { kind: 'ear', outline: [[0.03, 0], [0.05, 0.09], [0, 0.14], [-0.06, 0.1], [-0.07, 0]], position: [1.06, 0.72, 0.15], thickness: 0.018, rotation: [0, 0.35, 0], mirror: true, color: 'primary', textured: true },
    ],
    tubes: [
      saber
        ? { kind: 'tail', points: [[-0.84, 0.38, 0], [-1.0, 0.3, 0.02], [-1.08, 0.18, 0.03]], radii: [0.06, 0.045, 0.03], material: 'skin', animate: 'sway', bone: true, textured: true }
        : { kind: 'tail', points: [[-0.86, 0.42, 0], [-1.2, 0.34, 0.02], [-1.5, 0.05, 0.06], [-1.62, -0.3, 0.1]], radii: [0.065, 0.06, 0.05, 0.04], material: 'skin', animate: 'sway', bone: true, textured: true },
      { kind: 'whisker', points: [[1.36, 0.4, 0.1], [1.52, 0.37, 0.38]], radii: [0.005, 0.002], mirror: true, material: 'ivory' },
      { kind: 'whisker', points: [[1.36, 0.42, 0.1], [1.5, 0.43, 0.4]], radii: [0.005, 0.002], mirror: true, material: 'ivory' },
      { kind: 'whisker', points: [[1.36, 0.38, 0.1], [1.48, 0.31, 0.38]], radii: [0.005, 0.002], mirror: true, material: 'ivory' },
    ],
    eyes: [{ position: [1.26, 0.56, 0.16], radius: 0.04, mirror: true, pupil: 'round' }],
    nose: { position: [1.43, 0.44, 0], radius: 0.032 },
    mouth: {
      points: [[1.41, 0.37, 0], [1.34, 0.35, 0.09], [1.24, 0.36, 0.14]],
      mirror: true,
      teeth: saber ? { count: 1, size: 0.22, from: 0.38, to: 0.38, tilt: 0.04 } : { count: 1, size: 0.06, from: 0.3, to: 0.3 },
    },
    fur: null,
    skeleton: { type: 'endo', vertebrae: [0.2, 1], ribs: [0.3, 0.6], skull: [0, 0.2], neuralSpine: 0.9, pelvisT: 0.75, scapulaT: 0.32 },
    organs: { heart: 0.36, lungs: 0.34, brain: 0.1, gut: 0.58, liver: 0.46 },
    texture: saber
      ? { pattern: 'spots', spotDensity: 14, spotSize: 0.22, spotFill: 0.5, spotColor: 'accent', ventralBlend: 0.7, furGrain: 1, normalStrength: 0.5 }
      : { pattern: 'stripes', stripeCount: 20, ventralBlend: 0.75, furGrain: 1, normalStrength: 0.5 },
    animation: 'breathe',
    breath: { center: 0.38, width: 0.22, amplitude: 0.022 },
    groundRest: true,
  };
}

function bearPlan(): BodyPlan {
  return {
    posture: 'quadruped',
    spine: [P(1.48, 0.34, 0.05, 0.06), P(1.36, 0.36, 0.14, 0.14), P(1.16, 0.46, 0.25, 0.23), P(0.88, 0.46, 0.27, 0.26), P(0.5, 0.52, 0.44, 0.38),
      P(0.05, 0.5, 0.47, 0.4), P(-0.5, 0.54, 0.43, 0.36), P(-0.8, 0.52, 0.27, 0.24), P(-0.92, 0.5, 0.06, 0.06)],
    limbs: [
      { role: 'fore', points: [[0.45, 0.18, 0.26], [0.42, -0.38, 0.27], [0.46, -0.74, 0.28], [0.64, -0.95, 0.28]], radii: [0.18, 0.14, 0.12, 0.11], paw: 0.15, toes: { count: 5, length: 0.1, radius: 0.03, spread: 0.3, claws: true } },
      { role: 'hind', points: [[-0.5, 0.18, 0.24], [-0.33, -0.28, 0.26], [-0.56, -0.68, 0.27], [-0.38, -0.95, 0.27]], radii: [0.19, 0.14, 0.11, 0.11], paw: 0.15, toes: { count: 5, length: 0.1, radius: 0.03, spread: 0.3, claws: true } },
    ],
    fins: [{ kind: 'ear', outline: [[0.03, 0], [0.05, 0.09], [0, 0.14], [-0.06, 0.1], [-0.07, 0]], position: [1.02, 0.7, 0.18], thickness: 0.02, rotation: [0, 0.3, 0], mirror: true, color: 'primary' }],
    tubes: [{ kind: 'tail', points: [[-0.9, 0.45, 0], [-1.0, 0.36, 0]], radii: [0.05, 0.03], material: 'skin', textured: true }],
    eyes: [{ position: [1.33, 0.46, 0.12], radius: 0.032, mirror: true, pupil: 'round', color: '#1c1917' }],
    nose: { position: [1.52, 0.35, 0], radius: 0.05 },
    mouth: { points: [[1.5, 0.28, 0], [1.42, 0.26, 0.1]], mirror: true },
    fur: { length: 0.055, shells: 2 },
    skeleton: { type: 'endo', vertebrae: [0.2, 1], ribs: [0.3, 0.62], skull: [0, 0.2], neuralSpine: 1.1, pelvisT: 0.75, scapulaT: 0.3 },
    organs: { heart: 0.38, lungs: 0.36, brain: 0.1, gut: 0.6, liver: 0.48 },
    texture: { pattern: 'solid', mottle: 0.12, furGrain: 1.2, normalStrength: 0.6, ventralBlend: 0.2 },
    animation: 'breathe',
    breath: { center: 0.4, width: 0.25, amplitude: 0.02 },
    groundRest: true,
  };
}

function whalePlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.66, -0.02, 0.05, 0.12), P(1.5, -0.01, 0.13, 0.3), P(1.2, 0.02, 0.24, 0.4), P(0.85, 0.05, 0.35, 0.44), P(0.35, 0.06, 0.4, 0.42),
      P(-0.2, 0.06, 0.37, 0.36), P(-0.7, 0.07, 0.26, 0.24), P(-1.15, 0.09, 0.13, 0.1), P(-1.45, 0.11, 0.06, 0.05), P(-1.56, 0.11, 0.02, 0.02)],
    limbs: [],
    fins: [
      { kind: 'fluke', plane: 'top', position: [-1.5, 0.11, 0], outline: [[0.1, 0], [-0.05, 0.3], [-0.25, 0.55], [-0.4, 0.5], [-0.3, 0.25], [-0.33, 0.05], [-0.3, -0.25], [-0.4, -0.5], [-0.25, -0.55], [-0.05, -0.3]], thickness: 0.04, animate: 'flap', amplitude: 0.18, rays: 0 },
      { kind: 'pectoral', plane: 'top', position: [0.7, -0.22, 0.4], outline: [[0.08, 0], [0.02, 0.1], [-0.25, 0.35], [-0.62, 0.62], [-0.7, 0.58], [-0.5, 0.25], [-0.2, -0.04]], thickness: 0.05, rotation: [0.4, 0, 0], mirror: true, rays: 5 },
      { kind: 'dorsal', position: [-0.85, 0.3, 0], outline: [[0.08, 0], [0.0, 0.1], [-0.12, 0.14], [-0.18, 0.0]], thickness: 0.03 },
    ],
    tubes: [],
    eyes: [{ position: [1.05, -0.06, 0.39], radius: 0.044, mirror: true, pupil: 'hslit', color: '#1e3a5f' }],
    mouth: { points: [[1.64, -0.08, 0], [1.3, -0.18, 0.3], [0.8, -0.22, 0.44]], mirror: true, width: 0.012 },
    nostrils: [[0.85, 0.4, 0.04]],
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.18, 1], ribs: [0.3, 0.55], skull: [0, 0.28], neuralSpine: 0.8, pelvisT: 0.7, spacing: 0.06 },
    organs: { heart: 0.34, lungs: 0.32, brain: 0.2, gut: 0.56, liver: 0.46, extras: ['baleen'] },
    texture: { pattern: 'countershade', sharpness: 0.1, grooves: true, mottle: 0.5, normalStrength: 0.5 },
    animation: 'swim-vertical',
    groundRest: false,
  };
}

function sharkPlan(mega: boolean): BodyPlan {
  const k = mega ? 1.14 : 1;
  return {
    posture: 'aquatic',
    spine: [P(1.62, 0.04, 0.03 * k, 0.03 * k), P(1.48, 0.03, 0.12 * k, 0.15 * k), P(1.22, 0.0, 0.25 * k, 0.27 * k), P(0.88, 0.0, 0.33 * k, 0.33 * k),
      P(0.38, 0.0, 0.36 * k, 0.34 * k), P(-0.12, 0.0, 0.3 * k, 0.27 * k), P(-0.62, 0.02, 0.19 * k, 0.15 * k), P(-1.08, 0.05, 0.09, 0.06), P(-1.32, 0.06, 0.04, 0.03), P(-1.4, 0.06, 0.015, 0.015)],
    limbs: [],
    fins: [
      { kind: 'caudal', position: [-1.3, 0.06, 0], outline: [[0.05, 0], [-0.15, 0.22], [-0.42, 0.52], [-0.58, 0.66], [-0.5, 0.3], [-0.3, 0.05], [-0.42, -0.26], [-0.5, -0.42], [-0.2, -0.2], [0.0, -0.06]], smooth: false, thickness: 0.035, animate: 'undulate', rays: 9 },
      { kind: 'dorsal', position: [0.02, 0.33 * k, 0], outline: [[0.3, 0], [0.15, 0.22], [-0.1, 0.5], [-0.35, 0.72], [-0.4, 0.68], [-0.3, 0.35], [-0.4, 0.0]], smooth: false, thickness: 0.04, rays: 6 },
      { kind: 'dorsal', position: [-0.85, 0.17, 0], outline: [[0.08, 0], [0, 0.08], [-0.1, 0.14], [-0.14, 0]], smooth: false, thickness: 0.025 },
      { kind: 'pectoral', plane: 'top', position: [0.55, -0.22 * k, 0.3 * k], outline: [[0.1, 0], [0.05, 0.12], [-0.25, 0.4], [-0.6, 0.62], [-0.68, 0.6], [-0.45, 0.2], [-0.2, -0.05]], smooth: false, thickness: 0.04, rotation: [0.55, 0, 0], mirror: true, rays: 6 },
      { kind: 'pelvic', plane: 'top', position: [-0.45, -0.22, 0.14], outline: [[0.06, 0], [0, 0.08], [-0.18, 0.2], [-0.24, 0.18], [-0.12, 0.0]], smooth: false, thickness: 0.025, rotation: [0.55, 0, 0], mirror: true },
      { kind: 'anal', position: [-0.8, -0.14, 0], outline: [[0.06, 0], [-0.06, -0.12], [-0.12, -0.1], [-0.1, 0]], smooth: false, thickness: 0.02 },
    ],
    tubes: [],
    gillSlits: { x0: 0.8, dx: -0.065, count: 5, y: 0.0, z: 0.33 * k, height: 0.26 * k },
    eyes: [{ position: [1.25, 0.1, 0.25 * k], radius: 0.048, mirror: true, pupil: 'round', color: '#1e3a8a' }],
    mouth: { points: [[1.38, -0.14 * k, 0], [1.28, -0.17 * k, 0.12 * k], [1.1, -0.16 * k, 0.24 * k]], mirror: true, width: 0.014, teeth: { count: mega ? 6 : 7, size: mega ? 0.075 : 0.05, lower: true, from: 0.05, to: 0.95 } },
    nostrils: [[1.5, -0.05, 0.07]],
    wet: true,
    skeleton: { type: 'cartilage', vertebrae: [0.18, 1], skull: [0, 0.22], spacing: 0.055 },
    organs: { heart: 0.3, lungs: 0.3, brain: 0.14, gut: 0.52, liver: 0.44, extras: ['gills', 'bigLiver'] },
    texture: { pattern: 'countershade', sharpness: 0.75, mottle: 0.15, normalStrength: 0.35 },
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function archelonPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [
      P(1.42, -0.05, 0.04, 0.05), P(1.25, -0.02, 0.16, 0.18), P(0.98, -0.06, 0.14, 0.16),
      P(0.68, 0.05, 0.34, 0.56), P(0.15, 0.12, 0.42, 0.72), P(-0.42, 0.06, 0.36, 0.62),
      P(-0.88, -0.06, 0.2, 0.34), P(-1.18, -0.14, 0.08, 0.1), P(-1.38, -0.18, 0.03, 0.03),
    ],
    limbs: [],
    fins: [
      { kind: 'pectoral', plane: 'top', position: [0.62, -0.18, 0.52], outline: [[0.18, 0], [0.1, 0.3], [-0.15, 0.78], [-0.45, 1.05], [-0.62, 0.96], [-0.5, 0.48], [-0.22, -0.05]], thickness: 0.05, rotation: [0.25, 0, 0], mirror: true, animate: 'flap', amplitude: 0.25, rays: 5 },
      { kind: 'pelvic', plane: 'top', position: [-0.72, -0.18, 0.4], outline: [[0.1, 0], [0.04, 0.18], [-0.18, 0.45], [-0.36, 0.52], [-0.44, 0.42], [-0.28, 0.12], [-0.1, -0.03]], thickness: 0.04, rotation: [0.3, 0, 0], mirror: true, animate: 'paddle', amplitude: 0.18, rays: 5 },
    ],
    tubes: [
      { kind: 'beak', points: [[1.4, -0.02, 0], [1.5, -0.08, 0], [1.46, -0.18, 0]], radii: [0.08, 0.055, 0.015], material: 'keratin', color: '#0f172a' },
    ],
    scutes: { from: 0.22, to: 0.78, count: 9, rows: 3, size: 0.055, rowSpread: 0.28 },
    eyes: [{ position: [1.26, 0.06, 0.15], radius: 0.038, mirror: true, pupil: 'round', color: '#0f172a' }],
    nostrils: [[1.42, 0.03, 0.04]],
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.18, 0.95], ribs: [0.25, 0.76], skull: [0, 0.2], neuralSpine: 0.5, spacing: 0.06, pelvisT: 0.74, scapulaT: 0.28 },
    organs: { heart: 0.34, lungs: 0.38, brain: 0.1, gut: 0.58, liver: 0.46 },
    texture: { pattern: 'plates', armorDorsal: true, scaleSize: 1.3, ventralBlend: 0.55, normalStrength: 1.1, mottle: 0.25 },
    animation: 'swim-vertical',
    groundRest: false,
  };
}

function ichthyosaurPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [
      P(1.74, 0.02, 0.02, 0.025), P(1.42, 0.02, 0.07, 0.08), P(1.12, 0.04, 0.2, 0.2),
      P(0.75, 0.06, 0.36, 0.34), P(0.25, 0.08, 0.46, 0.42), P(-0.3, 0.05, 0.38, 0.34),
      P(-0.82, 0.02, 0.22, 0.18), P(-1.25, 0.0, 0.1, 0.08), P(-1.52, -0.06, 0.04, 0.03), P(-1.62, -0.1, 0.015, 0.015),
    ],
    limbs: [],
    fins: [
      { kind: 'caudal', position: [-1.42, -0.02, 0], outline: [[0.08, 0], [-0.12, 0.28], [-0.36, 0.58], [-0.46, 0.52], [-0.3, 0.12], [-0.28, -0.04], [-0.42, -0.45], [-0.32, -0.52], [-0.1, -0.22], [0.04, -0.04]], smooth: false, thickness: 0.035, animate: 'undulate', rays: 8 },
      { kind: 'dorsal', position: [0.12, 0.48, 0], outline: [[0.22, 0], [0.08, 0.22], [-0.15, 0.42], [-0.28, 0.36], [-0.22, 0.12], [-0.26, 0]], smooth: false, thickness: 0.035, rays: 5 },
      { kind: 'pectoral', plane: 'top', position: [0.58, -0.26, 0.32], outline: [[0.12, 0], [0.06, 0.18], [-0.22, 0.58], [-0.52, 0.78], [-0.62, 0.72], [-0.4, 0.28], [-0.15, -0.04]], thickness: 0.04, rotation: [0.48, 0, 0], mirror: true, rays: 5 },
      { kind: 'pelvic', plane: 'top', position: [-0.48, -0.24, 0.24], outline: [[0.1, 0], [0.04, 0.14], [-0.18, 0.46], [-0.42, 0.62], [-0.5, 0.56], [-0.32, 0.2], [-0.12, -0.03]], thickness: 0.035, rotation: [0.48, 0, 0], mirror: true, rays: 5 },
    ],
    tubes: [],
    eyes: [{ position: [1.14, 0.12, 0.18], radius: 0.065, mirror: true, pupil: 'round', color: '#0f172a', ring: '#cbd5e1' }],
    mouth: { points: [[1.72, -0.01, 0], [1.38, -0.03, 0.08], [1.02, -0.04, 0.18]], mirror: true, width: 0.01, teeth: { count: 10, size: 0.028, lower: true, from: 0.05, to: 0.75 } },
    nostrils: [[1.26, 0.12, 0.05]],
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.3, 0.66], skull: [0, 0.28], neuralSpine: 0.75, spacing: 0.05, pelvisT: 0.68 },
    organs: { heart: 0.34, lungs: 0.36, brain: 0.2, gut: 0.56, liver: 0.46 },
    texture: { pattern: 'countershade', sharpness: 0.65, mottle: 0.2, normalStrength: 0.4 },
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function crocPlan(variant: 'croc' | 'komodo' | 'sarcosuchus'): BodyPlan {
  let spine: Station[];
  if (variant === 'croc') {
    spine = [
      P(1.72, -0.56, 0.055, 0.085), P(1.45, -0.55, 0.095, 0.16), P(1.20, -0.52, 0.14, 0.25),
      P(0.95, -0.48, 0.21, 0.33), P(0.70, -0.48, 0.21, 0.31), P(0.40, -0.46, 0.28, 0.41),
      P(-0.10, -0.45, 0.30, 0.43), P(-0.60, -0.47, 0.26, 0.35), P(-0.95, -0.52, 0.21, 0.23),
      P(-1.35, -0.58, 0.14, 0.13), P(-1.70, -0.64, 0.075, 0.055), P(-1.86, -0.66, 0.025, 0.025),
    ];
  } else if (variant === 'komodo') {
    spine = [
      P(1.50, -0.48, 0.06, 0.08), P(1.32, -0.47, 0.11, 0.15), P(1.12, -0.44, 0.16, 0.21),
      P(0.90, -0.42, 0.18, 0.23), P(0.70, -0.42, 0.18, 0.21), P(0.40, -0.38, 0.27, 0.33),
      P(-0.10, -0.36, 0.29, 0.35), P(-0.60, -0.38, 0.24, 0.28), P(-0.95, -0.44, 0.18, 0.18),
      P(-1.35, -0.50, 0.11, 0.10), P(-1.70, -0.56, 0.055, 0.045), P(-1.86, -0.58, 0.02, 0.02),
    ];
  } else {
    // sarcosuchus: elongated pholidosaur snout with bulbous ghara bulla at tip
    spine = [
      P(1.84, -0.52, 0.095, 0.125), P(1.62, -0.55, 0.07, 0.11), P(1.32, -0.53, 0.10, 0.16),
      P(1.00, -0.48, 0.19, 0.29), P(0.72, -0.47, 0.22, 0.33), P(0.38, -0.45, 0.30, 0.43),
      P(-0.10, -0.44, 0.32, 0.45), P(-0.60, -0.46, 0.27, 0.37), P(-0.98, -0.51, 0.21, 0.24),
      P(-1.38, -0.57, 0.14, 0.13), P(-1.72, -0.63, 0.075, 0.055), P(-1.88, -0.65, 0.025, 0.025),
    ];
  }
  const lk = variant === 'komodo' ? 1.2 : 1.08;
  const isCrocLike = variant === 'croc' || variant === 'sarcosuchus';
  const fins: FinSpec[] = [];
  const tubes: TubeSpec[] = [];
  if (isCrocLike) {
    fins.push({
      kind: 'crest',
      position: [0, -0.28, 0],
      smooth: false,
      thickness: 0.024,
      color: 'primary',
      outline: [
        [-0.95, -0.04], [-1.05, 0.10], [-1.15, -0.07], [-1.25, 0.06], [-1.35, -0.12],
        [-1.45, 0.0], [-1.55, -0.17], [-1.65, -0.08], [-1.75, -0.23], [-1.82, -0.28],
        [-1.35, -0.20], [-0.95, -0.10],
      ],
    });
  }
  if (variant === 'komodo') {
    tubes.push({ kind: 'tongue', points: [[1.48, -0.52, 0], [1.72, -0.54, 0], [1.9, -0.57, 0]], radii: [0.032, 0.026, 0.012], material: 'tongue', color: '#eab308', textured: false });
    tubes.push({ kind: 'tongue', points: [[1.9, -0.57, 0], [2.04, -0.59, 0.05]], radii: [0.012, 0.004], material: 'tongue', color: '#eab308', mirror: true });
  }
  return {
    posture: 'sprawling',
    spine,
    limbs: [
      {
        role: 'fore',
        points: [[0.42, -0.54, 0.34], [0.51, -0.71, 0.52], [0.52, -0.86, 0.55], [0.56, -0.93, 0.57], [0.64, -0.96, 0.58]],
        radii: [0.115 * lk, 0.092 * lk, 0.075 * lk, 0.064 * lk, 0.055 * lk],
        toes: { count: 4, length: 0.14, radius: 0.024, spread: 0.28, claws: true },
      },
      {
        role: 'hind',
        points: [[-0.58, -0.54, 0.30], [-0.50, -0.71, 0.50], [-0.56, -0.86, 0.54], [-0.53, -0.93, 0.56], [-0.46, -0.96, 0.57]],
        radii: [0.135 * lk, 0.105 * lk, 0.082 * lk, 0.070 * lk, 0.062 * lk],
        toes: { count: 4, length: 0.16, radius: 0.025, spread: 0.28, claws: true },
      },
    ],
    fins,
    tubes,
    scutes: variant === 'sarcosuchus'
      ? { from: 0.26, to: 0.8, count: 16, rows: 3, size: 0.048, rowSpread: 0.14 }
      : variant === 'croc'
        ? { from: 0.3, to: 0.76, count: 15, rows: 2, size: 0.044, rowSpread: 0.12 }
        : undefined,
    eyes: [isCrocLike
      ? { position: [1.00, -0.34, 0.15], radius: 0.036, mirror: true, pupil: 'slit' }
      : { position: [1.08, -0.32, 0.15], radius: 0.034, mirror: true, pupil: 'round', color: '#1c1917' }],
    nostrils: variant === 'sarcosuchus' ? [[1.78, -0.45, 0.04]] : variant === 'croc' ? [[1.66, -0.51, 0.035]] : [[1.44, -0.44, 0.035]],
    mouth: variant === 'sarcosuchus'
      ? { points: [[1.78, -0.56, 0.04], [1.52, -0.58, 0.10], [1.22, -0.58, 0.16], [0.95, -0.58, 0.25]], mirror: true, width: 0.014, teeth: { count: 12, size: 0.034, lower: true, from: 0.05, to: 0.88 } }
      : variant === 'croc'
        ? { points: [[1.66, -0.58, 0.04], [1.45, -0.60, 0.13], [1.20, -0.59, 0.21], [0.95, -0.59, 0.28]], mirror: true, width: 0.013, teeth: { count: 10, size: 0.032, lower: true, from: 0.05, to: 0.88 } }
        : { points: [[1.45, -0.51, 0.03], [1.28, -0.52, 0.12], [1.00, -0.51, 0.18]], mirror: true, width: 0.01, teeth: { count: 8, size: 0.02, lower: false, from: 0.08, to: 0.88 } },
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.32, 0.62], skull: [0, 0.28], neuralSpine: 0.72, spacing: 0.06, pelvisT: 0.7, scapulaT: 0.35 },
    organs: { heart: 0.36, lungs: 0.34, brain: 0.14, gut: 0.6, liver: 0.48 },
    texture: isCrocLike
      ? { pattern: 'scales', scaleSize: 1.15, armorDorsal: true, ventralBlend: 0.65, normalStrength: 1.15, mottle: 0.16 }
      : { pattern: 'scales', scaleSize: 1.8, ventralBlend: 0.45, normalStrength: 0.85, mottle: 0.22 },
    animation: 'breathe',
    breath: { center: 0.42, width: 0.25, amplitude: 0.02 },
    tailSway: 0.05,
    groundRest: true,
  };
}

function frogPlan(): BodyPlan {
  return {
    posture: 'sprawling',
    spine: [P(0.98, -0.38, 0.05, 0.12), P(0.78, -0.3, 0.25, 0.4), P(0.45, -0.12, 0.44, 0.54), P(0.0, -0.02, 0.5, 0.6), P(-0.45, -0.1, 0.44, 0.5), P(-0.8, -0.3, 0.26, 0.3), P(-0.98, -0.46, 0.05, 0.08)],
    limbs: [
      { role: 'fore', points: [[0.55, -0.42, 0.42], [0.78, -0.74, 0.5], [0.9, -0.97, 0.55]], radii: [0.07, 0.055, 0.045], toes: { count: 4, length: 0.17, radius: 0.02, spread: 0.4 } },
      { role: 'hind', points: [[-0.55, -0.32, 0.42], [-0.05, -0.5, 0.72], [-0.85, -0.86, 0.7], [-0.3, -0.97, 0.78]], radii: [0.14, 0.1, 0.07, 0.05], toes: { count: 5, length: 0.26, radius: 0.022, spread: 0.35 } },
    ],
    fins: [],
    tubes: [],
    eyes: [{ position: [0.6, 0.12, 0.3], radius: 0.14, mirror: true, pupil: 'round', color: '#f59e0b' }],
    mouth: { points: [[0.98, -0.5, 0], [0.8, -0.52, 0.3], [0.55, -0.5, 0.46]], mirror: true, width: 0.015 },
    nostrils: [[0.95, -0.3, 0.06]],
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.25, 0.8], skull: [0, 0.3], neuralSpine: 0.4, urostyle: true, pelvisT: 0.78 },
    organs: { heart: 0.4, lungs: 0.38, brain: 0.12, gut: 0.6 },
    texture: { pattern: 'solid', mottle: 0.12, normalStrength: 0.35, spotDensity: 30, spotSize: 0.2 },
    animation: 'breathe',
    breath: { center: 0.28, width: 0.2, amplitude: 0.035 },
    groundRest: true,
  };
}

function axolotlPlan(): BodyPlan {
  const gill = (pts: [number, number, number][]): TubeSpec => ({ kind: 'gill', points: pts, radii: [0.035, 0.03, 0.02], material: 'gill', fringe: true, mirror: true, animate: 'sway' });
  return {
    posture: 'sprawling',
    spine: [P(1.32, -0.5, 0.05, 0.1), P(1.1, -0.46, 0.13, 0.28), P(0.8, -0.43, 0.16, 0.26), P(0.4, -0.4, 0.19, 0.23), P(-0.1, -0.4, 0.19, 0.21), P(-0.55, -0.4, 0.15, 0.13), P(-1.05, -0.4, 0.09, 0.06), P(-1.45, -0.42, 0.04, 0.03), P(-1.55, -0.43, 0.01, 0.01)],
    limbs: [
      { role: 'fore', points: [[0.72, -0.56, 0.25], [0.8, -0.8, 0.38], [0.92, -0.97, 0.44]], radii: [0.05, 0.04, 0.032], toes: { count: 4, length: 0.1, radius: 0.014, spread: 0.45 } },
      { role: 'hind', points: [[-0.5, -0.56, 0.2], [-0.42, -0.8, 0.34], [-0.3, -0.97, 0.4]], radii: [0.06, 0.045, 0.035], toes: { count: 5, length: 0.11, radius: 0.014, spread: 0.4 } },
    ],
    fins: [
      { kind: 'crest', position: [0, 0, 0], thickness: 0.02, color: 'membrane', opacity: 0.8, outline: [[-0.3, -0.2], [-0.7, -0.08], [-1.1, -0.1], [-1.4, -0.25], [-1.55, -0.43], [-1.4, -0.62], [-1.1, -0.7], [-0.7, -0.72], [-0.3, -0.6], [-0.4, -0.42]] },
    ],
    tubes: [
      gill([[0.95, -0.32, 0.26], [1.05, -0.15, 0.42], [1.12, -0.02, 0.52]]),
      gill([[0.9, -0.34, 0.27], [0.92, -0.16, 0.46], [0.9, -0.02, 0.58]]),
      gill([[0.84, -0.36, 0.27], [0.78, -0.2, 0.46], [0.7, -0.08, 0.58]]),
    ],
    eyes: [{ position: [1.12, -0.4, 0.21], radius: 0.036, mirror: true, pupil: 'round', color: '#ca8a04' }],
    mouth: { points: [[1.3, -0.56, 0], [1.12, -0.56, 0.24], [0.98, -0.54, 0.3]], mirror: true, width: 0.01 },
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.2, 1], ribs: [0.32, 0.6], skull: [0, 0.25], neuralSpine: 0.4, spacing: 0.05 },
    organs: { heart: 0.38, lungs: 0.36, brain: 0.12, gut: 0.58, extras: ['gills'] },
    texture: { pattern: 'solid', mottle: 0.15, normalStrength: 0.25, ventralBlend: 0.3 },
    animation: 'breathe',
    breath: { center: 0.4, width: 0.25, amplitude: 0.02 },
    tailSway: 0.08,
    groundRest: true,
  };
}

function octopusPlan(): BodyPlan {
  const base: [number, number, number] = [0.3, 0.05, 0];
  const arms: TubeSpec[] = [];
  const angles = [-150, -108, -64, -22, 22, 64, 108, 150];
  angles.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const curl = 0.75 + 0.35 * ((i * 7) % 5) / 4;
    const pts: [number, number, number][] = [
      base,
      [base[0] + dx * 0.45, -0.3, dz * 0.45],
      [base[0] + dx * 0.9, -0.72, dz * 0.9],
      [base[0] + dx * 1.3, -0.95, dz * 1.3],
      [base[0] + dx * 1.55, -0.88 + 0.1 * curl, dz * 1.55],
      [base[0] + dx * 1.62, -0.62 * curl, dz * 1.62],
      [base[0] + dx * 1.5, -0.45 * curl, dz * 1.5],
    ];
    arms.push({ kind: 'arm', points: pts, radii: [0.12, 0.105, 0.085, 0.065, 0.045, 0.03, 0.015], material: 'skin', suckers: true, animate: 'sway', textured: true });
  });
  return {
    posture: 'invertebrate',
    spine: [P(-1.0, 0.95, 0.04, 0.04), P(-0.8, 0.9, 0.3, 0.3), P(-0.45, 0.76, 0.46, 0.44), P(-0.05, 0.55, 0.42, 0.42), P(0.28, 0.32, 0.3, 0.34), P(0.45, 0.14, 0.1, 0.14)],
    limbs: [],
    fins: [],
    tubes: [...arms, { kind: 'siphon', points: [[0.1, 0.3, 0.4], [0.25, 0.12, 0.52]], radii: [0.06, 0.045], material: 'skin', textured: true }],
    eyes: [{ position: [0.15, 0.66, 0.36], radius: 0.11, mirror: true, pupil: 'hslit' }],
    wet: true,
    skeleton: { type: 'none', vertebrae: [0, 0], skull: [0.6, 0.85] },
    organs: { heart: 0.45, lungs: 0.4, brain: 0.78, gut: 0.3, extras: ['threeHearts', 'gills', 'inkSac'] },
    texture: { pattern: 'spots', spotDensity: 12, spotSize: 0.3, spotFill: 0.7, spotColor: 'secondary', mottle: 0.6, normalStrength: 1.4, ventralBlend: 0.4 },
    animation: 'float',
    breath: { center: 0.3, width: 0.3, amplitude: 0.035 },
    groundRest: true,
    anchors: { arms: [1.3, -0.8, 0.6], jaw: [0.5, 0.08, 0] },
  };
}

function mantisShrimpPlan(): BodyPlan {
  const pleopods: FinSpec[] = [];
  for (let i = 0; i < 5; i++) {
    pleopods.push({ kind: 'flap', plane: 'top', position: [-0.15 - i * 0.2, -0.76, 0.16], outline: [[0.05, 0], [0, 0.1], [-0.1, 0.16], [-0.18, 0.1], [-0.14, 0]], thickness: 0.012, color: 'membrane', opacity: 0.8, mirror: true, animate: 'paddle', phase: i * 0.7, rotation: [0.6, 0, 0] });
  }
  const legs: TubeSpec[] = [];
  for (let i = 0; i < 3; i++) {
    const x = 0.55 - i * 0.18;
    legs.push({ kind: 'leg', points: [[x, -0.72, 0.16], [x + 0.05, -0.9, 0.3], [x, -0.98, 0.4]], radii: [0.025, 0.02, 0.012], material: 'chitin', mirror: true });
  }
  return {
    posture: 'invertebrate',
    spine: [P(1.25, -0.6, 0.12, 0.17), P(0.95, -0.6, 0.16, 0.2), P(0.55, -0.58, 0.17, 0.22), P(0.05, -0.58, 0.18, 0.26), P(-0.45, -0.58, 0.17, 0.25), P(-0.95, -0.6, 0.14, 0.2), P(-1.25, -0.62, 0.09, 0.15), P(-1.38, -0.62, 0.03, 0.05)],
    segmentation: { from: 0.28, to: 0.9, frequency: 12, depth: 0.14 },
    limbs: [],
    fins: [
      { kind: 'tailfan', plane: 'top', position: [-1.35, -0.62, 0], outline: [[0.1, 0], [0.0, 0.22], [-0.25, 0.4], [-0.5, 0.38], [-0.55, 0.15], [-0.6, 0], [-0.55, -0.15], [-0.5, -0.38], [-0.25, -0.4], [0.0, -0.22]], thickness: 0.025, color: 'accent' },
      { kind: 'flap', plane: 'top', position: [1.22, -0.5, 0.18], outline: [[0.05, 0], [0.22, 0.05], [0.3, 0.12], [0.2, 0.18], [0.02, 0.1]], thickness: 0.012, color: 'membrane', opacity: 0.85, mirror: true },
      ...pleopods,
    ],
    tubes: [
      { kind: 'stalk', points: [[1.15, -0.5, 0.1], [1.25, -0.36, 0.17], [1.32, -0.28, 0.2]], radii: [0.035, 0.035, 0.04], material: 'chitin', eyeAtEnd: 0.075, mirror: true },
      { kind: 'antenna', points: [[1.3, -0.55, 0.06], [1.9, -0.45, 0.25], [2.3, -0.5, 0.4]], radii: [0.015, 0.01, 0.005], material: 'chitin', mirror: true, animate: 'sway' },
      { kind: 'antenna', points: [[1.3, -0.6, 0.04], [1.7, -0.62, 0.12]], radii: [0.012, 0.005], material: 'chitin', mirror: true, animate: 'sway' },
      { kind: 'arm', points: [[1.0, -0.72, 0.16], [1.3, -0.86, 0.24]], radii: [0.06, 0.07], material: 'chitin', color: '#ef4444', knob: 0.085, mirror: true },
      { kind: 'arm', points: [[1.3, -0.86, 0.24], [1.0, -0.92, 0.28], [0.85, -0.95, 0.3]], radii: [0.055, 0.04, 0.02], material: 'chitin', color: '#f97316', mirror: true },
      ...legs,
    ],
    eyes: [],
    wet: true,
    iridescence: 0.7,
    skeleton: { type: 'exo', vertebrae: [0, 0], skull: [0, 0.2] },
    organs: { heart: 0.5, lungs: 0.6, brain: 0.08, gut: 0.5, extras: ['dorsalVessel', 'gills'] },
    texture: { pattern: 'iridescent', segmentBands: 12, normalStrength: 0.6, mottle: 0.2 },
    animation: 'crawl',
    groundRest: true,
    anchors: { claws: [1.3, -0.86, 0.26], eye: [1.32, -0.28, 0.22] },
  };
}

function dragonflyPlan(): BodyPlan {
  const legs: TubeSpec[] = [
    { kind: 'leg', points: [[0.7, 0.2, 0.08], [0.9, 0.0, 0.2], [1.0, -0.2, 0.28]], radii: [0.02, 0.015, 0.008], material: 'chitin', mirror: true },
    { kind: 'leg', points: [[0.6, 0.18, 0.1], [0.72, -0.05, 0.25], [0.78, -0.25, 0.33]], radii: [0.02, 0.015, 0.008], material: 'chitin', mirror: true },
    { kind: 'leg', points: [[0.5, 0.18, 0.1], [0.55, -0.05, 0.26], [0.55, -0.25, 0.35]], radii: [0.02, 0.015, 0.008], material: 'chitin', mirror: true },
  ];
  return {
    posture: 'flying',
    spine: [P(0.98, 0.3, 0.12, 0.14), P(0.78, 0.32, 0.17, 0.17), P(0.5, 0.32, 0.17, 0.15), P(0.25, 0.3, 0.1, 0.08), P(0.0, 0.28, 0.07, 0.06), P(-0.5, 0.27, 0.06, 0.055), P(-1.0, 0.26, 0.055, 0.05), P(-1.4, 0.25, 0.045, 0.04), P(-1.55, 0.25, 0.015, 0.015)],
    segmentation: { from: 0.42, to: 0.98, frequency: 10, depth: 0.18 },
    limbs: [],
    fins: [
      { kind: 'wing', plane: 'top', position: [0.45, 0.42, 0.1], outline: [[0.12, 0], [0.1, 0.3], [0.08, 0.8], [0.04, 1.3], [-0.05, 1.58], [-0.15, 1.6], [-0.25, 1.45], [-0.3, 1.0], [-0.3, 0.5], [-0.22, 0.15], [-0.1, 0]], thickness: 0.008, color: 'membrane', opacity: 0.42, mirror: true, animate: 'flap', phase: 0, amplitude: 0.12, rays: 7 },
      { kind: 'wing', plane: 'top', position: [0.18, 0.42, 0.1], outline: [[0.14, 0], [0.12, 0.4], [0.08, 0.9], [0.02, 1.35], [-0.08, 1.52], [-0.2, 1.5], [-0.32, 1.25], [-0.38, 0.8], [-0.35, 0.35], [-0.25, 0.1], [-0.12, 0]], thickness: 0.008, color: 'membrane', opacity: 0.42, mirror: true, animate: 'flap', phase: Math.PI / 2, amplitude: 0.12, rays: 7 },
    ],
    tubes: legs,
    eyes: [{ position: [0.95, 0.38, 0.11], radius: 0.12, mirror: true, pupil: 'compound', color: '#7f1d1d' }],
    iridescence: 0.8,
    skeleton: { type: 'exo', vertebrae: [0, 0], skull: [0, 0.12] },
    organs: { heart: 0.55, lungs: 0.5, brain: 0.06, gut: 0.6, extras: ['tracheae', 'dorsalVessel'] },
    texture: { pattern: 'iridescent', segmentBands: 10, normalStrength: 0.5 },
    animation: 'hover',
    groundRest: false,
    anchors: { wing: [0.2, 0.45, 1.2] },
  };
}

function anomalocarisPlan(): BodyPlan {
  const flaps: FinSpec[] = [];
  for (let i = 0; i < 11; i++) {
    const x = 0.62 - i * 0.16;
    const s = 0.5 * (1 - 0.55 * Math.pow(i / 10, 2));
    const rz = 0.3 * (1 - Math.pow((i - 4) / 7, 2) * 0.5);
    flaps.push({ kind: 'flap', plane: 'top', position: [x, -0.34, rz * 0.9], outline: [[0.12 * s, 0], [0.05 * s, 0.5 * s], [-0.2 * s, 0.95 * s], [-0.45 * s, 1.0 * s], [-0.55 * s, 0.7 * s], [-0.4 * s, 0.2 * s], [-0.2 * s, 0]], thickness: 0.02, color: 'primary', mirror: true, animate: 'flap', phase: -i * 0.55, amplitude: 0.28, rotation: [0.3, 0, 0] });
  }
  const tailFans: FinSpec[] = [];
  for (let i = 0; i < 3; i++) {
    tailFans.push({ kind: 'tailfan', position: [-1.15 - i * 0.07, -0.26, 0.04 + i * 0.02], outline: [[0.05, 0], [-0.15, 0.22], [-0.35, 0.32], [-0.3, 0.1], [-0.15, 0]], thickness: 0.012, color: 'primary', mirror: true, rotation: [0, 0.55 + i * 0.35, 0] });
  }
  return {
    posture: 'aquatic',
    spine: [P(1.05, -0.3, 0.1, 0.17), P(0.8, -0.3, 0.17, 0.27), P(0.4, -0.3, 0.2, 0.32), P(-0.05, -0.3, 0.2, 0.34), P(-0.5, -0.3, 0.17, 0.28), P(-0.95, -0.3, 0.12, 0.18), P(-1.25, -0.3, 0.05, 0.08), P(-1.35, -0.3, 0.015, 0.02)],
    segmentation: { from: 0.2, to: 0.92, frequency: 13, depth: 0.1 },
    limbs: [],
    fins: [...flaps, ...tailFans],
    tubes: [
      { kind: 'arm', points: [[1.08, -0.38, 0.12], [1.4, -0.5, 0.2], [1.68, -0.72, 0.22], [1.78, -0.95, 0.18]], radii: [0.075, 0.065, 0.05, 0.025], material: 'skin', spines: 6, mirror: true, textured: true },
      { kind: 'stalk', points: [[0.95, -0.15, 0.2], [1.02, 0.02, 0.28]], radii: [0.035, 0.04], material: 'chitin', eyeAtEnd: 0.09, mirror: true },
      { kind: 'spike', points: [[-1.3, -0.3, 0.03], [-1.75, -0.28, 0.06]], radii: [0.015, 0.003], material: 'chitin', mirror: true },
    ],
    rings: [{ position: [0.78, -0.52, 0], radius: 0.12, tube: 0.035, color: '#4c0519', rotation: [Math.PI / 2, 0, 0] }],
    eyes: [],
    wet: true,
    skeleton: { type: 'exo', vertebrae: [0, 0], skull: [0, 0.18] },
    organs: { heart: 0.5, lungs: 0.5, brain: 0.1, gut: 0.5, extras: ['dorsalVessel'] },
    texture: { pattern: 'plates', scaleSize: 1.1, normalStrength: 0.8, ventralBlend: 0.4, mottle: 0.25 },
    animation: 'swim-lateral',
    groundRest: false,
    anchors: { claws: [1.6, -0.7, 0.24], eye: [1.02, 0.08, 0.3], jaw: [0.78, -0.55, 0] },
  };
}

function coelacanthPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.36, 0.0, 0.04, 0.04), P(1.18, 0.0, 0.18, 0.18), P(0.88, 0.02, 0.31, 0.25), P(0.42, 0.03, 0.38, 0.27), P(-0.08, 0.02, 0.35, 0.24), P(-0.58, 0.0, 0.26, 0.16), P(-0.98, 0.0, 0.17, 0.1), P(-1.2, 0.0, 0.14, 0.08), P(-1.3, 0.0, 0.03, 0.03)],
    limbs: [],
    fins: [
      { kind: 'caudal', position: [-1.22, 0, 0], outline: [[0.05, 0.12], [-0.15, 0.3], [-0.4, 0.42], [-0.5, 0.3], [-0.38, 0.1], [-0.45, 0.04], [-0.55, 0.0], [-0.45, -0.04], [-0.38, -0.1], [-0.5, -0.3], [-0.4, -0.42], [-0.15, -0.3], [0.05, -0.12]], thickness: 0.03, rays: 12, animate: 'undulate' },
      { kind: 'dorsal', position: [0.3, 0.38, 0], outline: [[0.15, 0], [0.1, 0.25], [-0.05, 0.4], [-0.2, 0.3], [-0.25, 0.0]], thickness: 0.025, rays: 8 },
      { kind: 'dorsal', position: [-0.6, 0.42, 0], outline: [[0.08, 0], [0.02, 0.2], [-0.15, 0.3], [-0.25, 0.15], [-0.15, 0]], thickness: 0.025, rays: 6 },
      { kind: 'anal', position: [-0.6, -0.4, 0], outline: [[0.08, 0], [0.02, -0.18], [-0.15, -0.28], [-0.25, -0.14], [-0.15, 0]], thickness: 0.025, rays: 6 },
      { kind: 'pectoral', plane: 'top', position: [0.5, -0.3, 0.42], outline: [[0.08, 0], [0.02, 0.12], [-0.2, 0.3], [-0.35, 0.3], [-0.3, 0.1], [-0.15, -0.03]], thickness: 0.03, rotation: [0.45, 0, 0], mirror: true, rays: 7, animate: 'paddle', amplitude: 0.35 },
      { kind: 'pelvic', plane: 'top', position: [-0.35, -0.42, 0.28], outline: [[0.06, 0], [0.02, 0.1], [-0.15, 0.24], [-0.27, 0.24], [-0.22, 0.08], [-0.1, -0.02]], thickness: 0.025, rotation: [0.45, 0, 0], mirror: true, rays: 6, animate: 'paddle', phase: Math.PI, amplitude: 0.35 },
    ],
    tubes: [
      { kind: 'leg', points: [[0.62, -0.12, 0.26], [0.5, -0.3, 0.42]], radii: [0.08, 0.06], material: 'skin', mirror: true, bone: true, textured: true },
      { kind: 'leg', points: [[-0.25, -0.26, 0.16], [-0.35, -0.42, 0.28]], radii: [0.06, 0.045], material: 'skin', mirror: true, bone: true, textured: true },
      { kind: 'leg', points: [[-0.5, 0.26, 0], [-0.6, 0.42, 0]], radii: [0.07, 0.05], material: 'skin', bone: true, textured: true },
      { kind: 'leg', points: [[-0.5, -0.26, 0], [-0.6, -0.4, 0]], radii: [0.07, 0.05], material: 'skin', bone: true, textured: true },
    ],
    eyes: [{ position: [1.12, 0.09, 0.17], radius: 0.055, mirror: true, pupil: 'round', color: '#fde047' }],
    mouth: { points: [[1.35, -0.04, 0], [1.2, -0.07, 0.12], [1.05, -0.06, 0.18]], mirror: true, width: 0.012 },
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.2, 1], ribs: [0.3, 0.55], skull: [0, 0.22], notochord: true, neuralSpine: 0.5, spacing: 0.05 },
    organs: { heart: 0.32, lungs: 0.45, brain: 0.12, gut: 0.55, liver: 0.42, extras: ['gills', 'swimBladder'] },
    texture: { pattern: 'spots', spotDensity: 16, spotSize: 0.16, spotFill: 0.35, spotColor: 'white', scaleSize: 0.8, normalStrength: 1.1, ventralBlend: 0.25, mottle: 0.3 },
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function dunkleosteusPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.42, 0.0, 0.07, 0.12), P(1.2, 0.04, 0.28, 0.3), P(0.9, 0.08, 0.4, 0.37), P(0.55, 0.07, 0.39, 0.33), P(0.05, 0.04, 0.31, 0.26), P(-0.45, 0.01, 0.21, 0.17), P(-0.9, 0.0, 0.11, 0.08), P(-1.2, 0.0, 0.05, 0.04), P(-1.3, 0.0, 0.015, 0.015)],
    limbs: [],
    fins: [
      { kind: 'caudal', position: [-1.22, 0, 0], outline: [[0.05, 0], [-0.15, 0.2], [-0.38, 0.45], [-0.52, 0.55], [-0.45, 0.25], [-0.28, 0.04], [-0.35, -0.2], [-0.42, -0.32], [-0.15, -0.15], [0, -0.04]], smooth: false, thickness: 0.03, animate: 'undulate', rays: 8 },
      { kind: 'dorsal', position: [-0.2, 0.3, 0], outline: [[0.3, 0], [0.1, 0.15], [-0.2, 0.2], [-0.45, 0.1], [-0.5, 0]], thickness: 0.025, rays: 6 },
      { kind: 'pectoral', plane: 'top', position: [0.5, -0.2, 0.33], outline: [[0.08, 0], [0.02, 0.1], [-0.25, 0.35], [-0.5, 0.45], [-0.55, 0.38], [-0.35, 0.12], [-0.15, -0.04]], thickness: 0.035, rotation: [0.5, 0, 0], mirror: true, rays: 6 },
      { kind: 'pelvic', plane: 'top', position: [-0.5, -0.18, 0.15], outline: [[0.05, 0], [0, 0.07], [-0.15, 0.18], [-0.22, 0.16], [-0.1, 0]], thickness: 0.02, rotation: [0.5, 0, 0], mirror: true },
    ],
    tubes: [],
    eyes: [{ position: [1.15, 0.14, 0.26], radius: 0.05, mirror: true, pupil: 'round', color: '#38bdf8', ring: '#cbd5e1' }],
    mouth: { points: [[1.42, -0.08, 0], [1.3, -0.12, 0.14], [1.1, -0.12, 0.26]], mirror: true, width: 0.016, teeth: { count: 2, size: 0.16, lower: true, from: 0.08, to: 0.3 } },
    wet: true,
    skeleton: { type: 'cartilage', vertebrae: [0.4, 1], skull: [0, 0.42], spacing: 0.055 },
    organs: { heart: 0.42, lungs: 0.42, brain: 0.18, gut: 0.58, liver: 0.5, extras: ['gills', 'bigLiver'] },
    texture: { pattern: 'plates', armorEnd: 0.42, scaleSize: 0.8, normalStrength: 1.2, ventralBlend: 0.5, mottle: 0.2 },
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function gorgonopsidPlan(): BodyPlan {
  return {
    posture: 'quadruped',
    spine: [
      P(1.48, 0.34, 0.07, 0.08), P(1.28, 0.36, 0.22, 0.16), P(1.04, 0.42, 0.28, 0.22),
      P(0.82, 0.38, 0.24, 0.22), P(0.52, 0.4, 0.38, 0.31), P(0.12, 0.36, 0.38, 0.3),
      P(-0.32, 0.32, 0.31, 0.24), P(-0.68, 0.28, 0.22, 0.18), P(-1.05, 0.22, 0.1, 0.08), P(-1.35, 0.14, 0.03, 0.03),
    ],
    limbs: [
      { role: 'fore', points: [[0.52, 0.14, 0.22], [0.58, -0.35, 0.26], [0.54, -0.74, 0.25], [0.64, -0.95, 0.25]], radii: [0.16, 0.12, 0.095, 0.085], paw: 0.12, toes: { count: 5, length: 0.1, radius: 0.028, spread: 0.32, claws: true } },
      { role: 'hind', points: [[-0.52, 0.14, 0.2], [-0.42, -0.32, 0.23], [-0.58, -0.7, 0.23], [-0.46, -0.95, 0.23]], radii: [0.17, 0.13, 0.095, 0.085], paw: 0.12, toes: { count: 5, length: 0.11, radius: 0.028, spread: 0.32, claws: true } },
    ],
    fins: [],
    tubes: [
      { kind: 'tail', points: [[-1.02, 0.22, 0], [-1.28, 0.12, 0.02], [-1.52, -0.02, 0.03]], radii: [0.09, 0.06, 0.025], material: 'skin', animate: 'sway', bone: true, textured: true },
    ],
    eyes: [{ position: [1.14, 0.48, 0.16], radius: 0.038, mirror: true, pupil: 'slit', color: '#f59e0b' }],
    nostrils: [[1.45, 0.4, 0.05]],
    mouth: {
      points: [[1.46, 0.24, 0], [1.28, 0.22, 0.11], [1.02, 0.23, 0.18]],
      mirror: true,
      teeth: { count: 1, size: 0.26, from: 0.22, to: 0.22, tilt: 0.18 },
    },
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.3, 0.62], skull: [0, 0.26], neuralSpine: 0.85, pelvisT: 0.72, scapulaT: 0.32 },
    organs: { heart: 0.36, lungs: 0.34, brain: 0.12, gut: 0.58, liver: 0.46 },
    texture: { pattern: 'solid', mottle: 0.32, wrinkles: 0.45, furGrain: 0.48, ventralBlend: 0.62, normalStrength: 0.65 },
    animation: 'breathe',
    breath: { center: 0.4, width: 0.24, amplitude: 0.022 },
    groundRest: true,
  };
}

function leedsichthysPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [
      P(1.58, 0.0, 0.12, 0.18), P(1.32, 0.02, 0.28, 0.32), P(0.95, 0.04, 0.38, 0.36),
      P(0.42, 0.05, 0.42, 0.36), P(-0.15, 0.04, 0.35, 0.28), P(-0.68, 0.02, 0.24, 0.18),
      P(-1.12, 0.02, 0.12, 0.08), P(-1.38, 0.02, 0.06, 0.04), P(-1.48, 0.02, 0.02, 0.02),
    ],
    limbs: [],
    fins: [
      { kind: 'caudal', position: [-1.36, 0.02, 0], outline: [[0.06, 0], [-0.14, 0.32], [-0.42, 0.68], [-0.54, 0.62], [-0.34, 0.14], [-0.28, 0], [-0.34, -0.14], [-0.54, -0.62], [-0.42, -0.68], [-0.14, -0.32]], smooth: false, thickness: 0.035, animate: 'undulate', rays: 12 },
      { kind: 'dorsal', position: [-0.22, 0.29, 0], outline: [[0.2, -0.04], [0.06, 0.24], [-0.18, 0.42], [-0.32, 0.34], [-0.24, 0.1], [-0.28, -0.04]], smooth: false, thickness: 0.03, rays: 8 },
      { kind: 'pectoral', plane: 'top', position: [0.62, -0.22, 0.28], outline: [[0.14, -0.04], [0.08, 0.22], [-0.24, 0.68], [-0.58, 0.92], [-0.68, 0.85], [-0.45, 0.32], [-0.18, -0.05]], smooth: false, thickness: 0.038, rotation: [0.45, 0, 0], mirror: true, rays: 9 },
      { kind: 'pelvic', plane: 'top', position: [-0.38, -0.22, 0.14], outline: [[0.08, -0.03], [0.02, 0.1], [-0.16, 0.28], [-0.26, 0.25], [-0.14, -0.03]], smooth: false, thickness: 0.025, rotation: [0.5, 0, 0], mirror: true, rays: 6 },
      { kind: 'anal', position: [-0.78, -0.11, 0], outline: [[0.1, 0.04], [-0.08, -0.22], [-0.22, -0.2], [-0.16, 0.04]], smooth: false, thickness: 0.025, rays: 6 },
    ],
    tubes: [],
    gillSlits: { x0: 0.92, dx: -0.06, count: 4, y: 0.0, z: 0.34, height: 0.32 },
    eyes: [{ position: [1.28, 0.1, 0.26], radius: 0.042, mirror: true, pupil: 'round', color: '#0f172a', ring: '#94a3b8' }],
    mouth: { points: [[1.56, -0.08, 0], [1.34, -0.16, 0.24], [1.05, -0.18, 0.34]], mirror: true, width: 0.016 },
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.3, 0.62], skull: [0, 0.25], neuralSpine: 0.65, spacing: 0.055 },
    organs: { heart: 0.3, lungs: 0.36, brain: 0.14, gut: 0.56, liver: 0.44, extras: ['gills', 'swimBladder'] },
    texture: { pattern: 'countershade', sharpness: 0.6, scaleSize: 0.9, mottle: 0.22, normalStrength: 0.55 },
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function basilosaurusPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [
      P(1.74, 0.02, 0.03, 0.04), P(1.5, 0.03, 0.11, 0.13), P(1.22, 0.05, 0.2, 0.22),
      P(0.88, 0.06, 0.26, 0.27), P(0.42, 0.06, 0.29, 0.28), P(-0.08, 0.05, 0.26, 0.24),
      P(-0.58, 0.04, 0.2, 0.18), P(-1.05, 0.03, 0.13, 0.11), P(-1.42, 0.02, 0.07, 0.06), P(-1.62, 0.02, 0.02, 0.02),
    ],
    limbs: [
      // Tiny external 60-cm functional hind limbs near the pelvis
      { role: 'hind', points: [[-0.68, -0.12, 0.16], [-0.78, -0.26, 0.22], [-0.88, -0.32, 0.24]], radii: [0.042, 0.03, 0.022], toes: { count: 3, length: 0.05, radius: 0.01, spread: 0.25 } },
    ],
    fins: [
      { kind: 'fluke', plane: 'top', position: [-1.54, 0.02, 0], outline: [[0.1, 0], [-0.05, 0.28], [-0.24, 0.5], [-0.38, 0.46], [-0.28, 0.2], [-0.3, 0.04], [-0.28, -0.2], [-0.38, -0.46], [-0.24, -0.5], [-0.05, -0.28]], thickness: 0.035, animate: 'flap', amplitude: 0.2, rays: 0 },
      { kind: 'pectoral', plane: 'top', position: [0.76, -0.16, 0.26], outline: [[0.1, 0], [0.04, 0.12], [-0.18, 0.36], [-0.42, 0.48], [-0.5, 0.42], [-0.32, 0.16], [-0.14, -0.04]], thickness: 0.04, rotation: [0.42, 0, 0], mirror: true, rays: 5 },
    ],
    tubes: [],
    eyes: [{ position: [1.28, 0.1, 0.19], radius: 0.034, mirror: true, pupil: 'round', color: '#0f172a' }],
    mouth: { points: [[1.72, -0.02, 0], [1.45, -0.05, 0.11], [1.14, -0.04, 0.2]], mirror: true, width: 0.012, teeth: { count: 9, size: 0.042, lower: true, from: 0.05, to: 0.88 } },
    nostrils: [[1.48, 0.12, 0.03]],
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.18, 1], ribs: [0.28, 0.58], skull: [0, 0.22], neuralSpine: 0.72, pelvisT: 0.72, spacing: 0.055 },
    organs: { heart: 0.32, lungs: 0.34, brain: 0.14, gut: 0.54, liver: 0.44 },
    texture: { pattern: 'countershade', sharpness: 0.55, mottle: 0.25, normalStrength: 0.45 },
    animation: 'swim-vertical',
    groundRest: false,
  };
}

function birdPlan(): BodyPlan {
  return {
    posture: 'flying',
    spine: [P(0.6, 0.3, 0.03, 0.03), P(0.48, 0.32, 0.13, 0.12), P(0.3, 0.3, 0.14, 0.13), P(0.05, 0.24, 0.23, 0.2), P(-0.3, 0.2, 0.21, 0.18), P(-0.6, 0.21, 0.13, 0.1), P(-0.78, 0.22, 0.04, 0.04)],
    limbs: [],
    fins: [
      { kind: 'wing', plane: 'top', position: [0.08, 0.32, 0.18], outline: [[0.2, 0], [0.22, 0.3], [0.2, 0.7], [0.1, 1.1], [-0.1, 1.5], [-0.3, 1.65], [-0.4, 1.55], [-0.45, 1.2], [-0.5, 0.8], [-0.55, 0.4], [-0.5, 0.1], [-0.3, -0.02]], thickness: 0.014, color: 'primary', mirror: true, animate: 'flap', amplitude: 0.22, textured: true, rays: 4 },
      { kind: 'tailfan', plane: 'top', position: [-0.75, 0.22, 0], outline: [[0.05, 0.2], [-0.3, 0.28], [-0.6, 0.22], [-0.65, 0], [-0.6, -0.22], [-0.3, -0.28], [0.05, -0.2]], thickness: 0.012, color: 'primary', textured: true },
    ],
    tubes: [
      { kind: 'beak', points: [[0.6, 0.32, 0], [0.7, 0.3, 0], [0.73, 0.22, 0]], radii: [0.05, 0.04, 0.01], material: 'keratin', color: '#1f2937' },
      { kind: 'leg', points: [[-0.2, 0.05, 0.08], [-0.05, -0.08, 0.1], [0.05, -0.12, 0.1]], radii: [0.03, 0.025, 0.02], material: 'keratin', color: '#eab308', mirror: true, bone: true },
    ],
    eyes: [{ position: [0.5, 0.37, 0.1], radius: 0.045, mirror: true, pupil: 'round', color: '#111827', ring: '#facc15' }],
    skeleton: { type: 'endo', vertebrae: [0.15, 1], ribs: [0.4, 0.7], skull: [0, 0.2], neuralSpine: 0.5, spacing: 0.05, keel: true, pelvisT: 0.78 },
    organs: { heart: 0.45, lungs: 0.42, brain: 0.1, gut: 0.62, extras: ['airsacs', 'crop'] },
    texture: { pattern: 'feathers', barring: true, darkHead: 0.17, ventralBlend: 0.9, normalStrength: 0.5 },
    animation: 'flap',
    groundRest: false,
    anchors: { wing: [-0.1, 0.35, 1.0] },
  };
}

function penguinPlan(): BodyPlan {
  return {
    posture: 'upright',
    spine: [P(0.34, 1.16, 0.015, 0.015), P(0.14, 1.13, 0.07, 0.06), P(0.0, 1.1, 0.17, 0.16), P(0.0, 0.9, 0.17, 0.16), P(0.07, 0.5, 0.38, 0.34), P(0.08, 0.0, 0.42, 0.36), P(0.0, -0.5, 0.35, 0.3), P(-0.1, -0.85, 0.22, 0.19), P(-0.22, -1.0, 0.06, 0.06)],
    limbs: [],
    fins: [
      { kind: 'wing', position: [0.02, 0.55, 0.36], outline: [[0.05, 0.05], [0.1, -0.1], [0.05, -0.4], [-0.05, -0.72], [-0.15, -0.8], [-0.22, -0.6], [-0.2, -0.3], [-0.12, -0.05]], thickness: 0.04, color: 'primary', mirror: true, rotation: [0, -0.12, 0], animate: 'paddle', amplitude: 0.08, rays: 3 },
      { kind: 'tailfan', position: [-0.2, -0.95, 0], outline: [[0.05, 0.05], [-0.1, 0.02], [-0.3, -0.12], [-0.28, -0.2], [-0.05, -0.1]], thickness: 0.02, color: 'primary' },
    ],
    tubes: [
      { kind: 'leg', points: [[0.15, -0.95, 0.14], [0.36, -0.98, 0.16]], radii: [0.05, 0.04], material: 'keratin', color: '#1f2937', mirror: true },
      { kind: 'beak', points: [[0.3, 1.16, 0.02], [0.38, 1.14, 0.015]], radii: [0.018, 0.005], material: 'keratin', color: '#f97316' },
    ],
    eyes: [{ position: [0.1, 1.12, 0.14], radius: 0.036, mirror: true, pupil: 'round', color: '#9a3412' }],
    skeleton: { type: 'endo', vertebrae: [0.1, 1], ribs: [0.35, 0.7], skull: [0, 0.15], neuralSpine: 0.5, spacing: 0.06, keel: true, pelvisT: 0.8,
      internalLegs: [[[0.05, -0.3, 0.15], [0.2, -0.55, 0.16], [0.15, -0.98, 0.15]]] },
    organs: { heart: 0.42, lungs: 0.4, brain: 0.06, gut: 0.6, extras: ['airsacs', 'crop'] },
    texture: { pattern: 'countershade', sharpness: 1, darkHead: 0.22, earPatch: true, normalStrength: 0.3 },
    animation: 'breathe',
    breath: { center: 0.5, width: 0.25, amplitude: 0.015 },
    groundRest: true,
    anchors: { foot: [0.3, -0.97, 0.15], wing: [0.0, 0.1, 0.42] },
  };
}

function humanPlan(): BodyPlan {
  return {
    posture: 'upright',
    spine: [
      P(0.02, 0.84, 0.11, 0.1),
      P(0.04, 0.72, 0.11, 0.1),
      P(0.0, 0.58, 0.065, 0.065),
      P(0.0, 0.42, 0.18, 0.22),
      P(0.0, 0.18, 0.15, 0.18),
      P(0.0, -0.04, 0.16, 0.19),
    ],
    limbs: [
      { role: 'fore', points: [[0.0, 0.42, 0.22], [0.02, 0.16, 0.25], [0.04, -0.08, 0.26]], radii: [0.055, 0.045, 0.038], toes: { count: 5, length: 0.05, radius: 0.01, spread: 0.35 } },
      { role: 'hind', points: [[0.0, -0.06, 0.11], [0.01, -0.48, 0.11], [0.0, -0.92, 0.11]], radii: [0.085, 0.065, 0.05], toes: { count: 5, length: 0.06, radius: 0.012, spread: 0.22 } },
    ],
    fins: [],
    tubes: [],
    eyes: [{ position: [0.105, 0.73, 0.038], radius: 0.028, mirror: true, pupil: 'round', color: '#4b83b8' }],
    skeleton: { type: 'endo', vertebrae: [0.16, 0.95], ribs: [0.36, 0.68], skull: [0, 0.18], neuralSpine: 0.25, pelvisT: 0.9, scapulaT: 0.38 },
    organs: { heart: 0.44, lungs: 0.42, brain: 0.08, gut: 0.68, liver: 0.56 },
    texture: { pattern: 'solid', mottle: 0.08, normalStrength: 0.25 },
    animation: 'breathe',
    breath: { center: 0.44, width: 0.22, amplitude: 0.012 },
    groundRest: true,
  };
}

/* -------------------------------------------------------------------------- */
/*  Resolution                                                                 */
/* -------------------------------------------------------------------------- */

const SPECIES_PLANS: Record<string, () => BodyPlan> = {
  'african-bush-elephant': () => elephantPlan(false),
  'woolly-mammoth': () => elephantPlan(true),
  'siberian-tiger': () => catPlan(false),
  'smilodon-fatalis': () => catPlan(true),
  'polar-bear': () => bearPlan(),
  'blue-whale': () => whalePlan(),
  'livyatan-melvillei': () => whalePlan(),
  'great-white-shark': () => sharkPlan(false),
  'otodus-megalodon': () => sharkPlan(true),
  'archelon-ischyros': () => archelonPlan(),
  'shonisaurus-popularis': () => ichthyosaurPlan(),
  'saltwater-crocodile': () => crocPlan('croc'),
  'komodo-dragon': () => crocPlan('komodo'),
  'sarcosuchus-imperator': () => crocPlan('sarcosuchus'),
  'inostrancevia-alexandri': () => gorgonopsidPlan(),
  'leedsichthys-problematicus': () => leedsichthysPlan(),
  'basilosaurus-cetoides': () => basilosaurusPlan(),
  'golden-poison-frog': () => frogPlan(),
  'axolotl': () => axolotlPlan(),
  'giant-pacific-octopus': () => octopusPlan(),
  'peacock-mantis-shrimp': () => mantisShrimpPlan(),
  'meganeura-monyi': () => dragonflyPlan(),
  'anomalocaris-canadensis': () => anomalocarisPlan(),
  'coelacanth': () => coelacanthPlan(),
  'dunkleosteus-terrelli': () => dunkleosteusPlan(),
  'peregrine-falcon': () => birdPlan(),
  'emperor-penguin': () => penguinPlan(),
  'homo-sapiens': () => humanPlan(),
};

const ARCHETYPE_PLANS: Record<BodyArchetype, () => BodyPlan> = {
  feline_predator: () => catPlan(false),
  proboscidean: () => elephantPlan(false),
  cetacean: () => whalePlan(),
  avian_raptor: () => birdPlan(),
  penguin: () => penguinPlan(),
  shark_ichthyosaur: () => sharkPlan(false),
  marine_reptile: () => archelonPlan(),
  crocodilian: () => crocPlan('croc'),
  amphibian: () => frogPlan(),
  cephalopod: () => octopusPlan(),
  arthropod: () => mantisShrimpPlan(),
  ursid: () => bearPlan(),
};

export function getBodyPlan(animal: Pick<AnimalRecord, 'id' | 'archetype' | 'visualPalette'>): BodyPlan {
  const factory = SPECIES_PLANS[animal.id] ?? ARCHETYPE_PLANS[animal.archetype] ?? ARCHETYPE_PLANS.feline_predator;
  const plan = factory();
  if (!plan.texture.pattern) plan.texture.pattern = animal.visualPalette.patternType;
  return plan;
}

export const SPECIES_WITH_PLANS = Object.keys(SPECIES_PLANS);
export const ARCHETYPES_WITH_PLANS = Object.keys(ARCHETYPE_PLANS) as BodyArchetype[];
