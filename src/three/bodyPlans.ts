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
    ? [P(1.30, 0.56, 0.23, 0.20), P(1.20, 0.68, 0.35, 0.29), P(1.06, 0.84, 0.45, 0.36), P(0.86, 0.70, 0.38, 0.34),
       P(0.55, 0.74, 0.69, 0.53), P(0.10, 0.61, 0.67, 0.55), P(-0.42, 0.50, 0.58, 0.48), P(-0.78, 0.48, 0.42, 0.35),
       P(-0.98, 0.50, 0.22, 0.18), P(-1.06, 0.50, 0.08, 0.08)]
    : [P(1.30, 0.56, 0.23, 0.20), P(1.20, 0.68, 0.34, 0.29), P(1.05, 0.76, 0.42, 0.35), P(0.86, 0.66, 0.36, 0.33),
       P(0.56, 0.64, 0.62, 0.51), P(0.12, 0.59, 0.68, 0.56), P(-0.40, 0.59, 0.63, 0.51), P(-0.78, 0.58, 0.46, 0.38),
       P(-0.98, 0.60, 0.25, 0.21), P(-1.06, 0.60, 0.08, 0.08)];
  const tusks: [number, number, number][] = mammoth
    ? [[1.14, 0.46, 0.13], [1.44, 0.20, 0.19], [1.76, 0.04, 0.21], [1.98, 0.18, 0.15], [2.02, 0.38, 0.08]]
    : [[1.14, 0.46, 0.13], [1.40, 0.30, 0.17], [1.68, 0.16, 0.16], [1.86, 0.22, 0.11]];
  const earOutline: [number, number][] = mammoth
    ? [[0, 0.05], [-0.05, 0.1], [-0.2, 0.08], [-0.25, -0.05], [-0.18, -0.18], [-0.04, -0.14]]
    : [[0.05, 0.12], [-0.06, 0.30], [-0.36, 0.34], [-0.60, 0.16], [-0.64, -0.20], [-0.48, -0.52], [-0.24, -0.64], [-0.05, -0.44], [0.03, -0.16]];
  return {
    posture: 'quadruped',
    spine,
    limbs: [
      {
        role: 'fore',
        points: [[0.52, 0.42, 0.24], [0.54, -0.02, 0.30], [0.49, -0.50, 0.31], [0.51, -0.94, 0.31]],
        radii: [0.28, 0.215, 0.19, 0.215],
        paw: 0.20,
        toes: { count: 4, length: 0.075, radius: 0.038, spread: 0.24, claws: true },
      },
      {
        role: 'hind',
        points: [[-0.44, 0.44, 0.22], [-0.40, -0.04, 0.28], [-0.44, -0.52, 0.29], [-0.41, -0.94, 0.29]],
        radii: [0.29, 0.225, 0.185, 0.205],
        paw: 0.19,
        toes: { count: 4, length: 0.07, radius: 0.036, spread: 0.22, claws: true },
      },
    ],
    fins: [
      { kind: 'ear', outline: earOutline, position: [0.94, 0.72, 0.28], thickness: mammoth ? 0.028 : 0.042, rotation: [0, mammoth ? 0.22 : 0.36, -0.06], mirror: true, color: 'primary', textured: true },
    ],
    tubes: [
      {
        kind: 'trunk',
        points: [[1.16, 0.56, 0], [1.34, 0.46, 0], [1.48, 0.22, 0], [1.54, -0.08, 0], [1.49, -0.42, 0], [1.41, -0.74, 0], [1.46, -0.90, 0]],
        radii: [0.225, 0.18, 0.145, 0.12, 0.096, 0.076, 0.056],
        material: 'skin',
        textured: true,
      },
      { kind: 'tusk', points: tusks, radii: mammoth ? [0.068, 0.056, 0.046, 0.03, 0.014] : [0.058, 0.048, 0.034, 0.014], mirror: true, material: 'ivory', bone: true },
      { kind: 'tail', points: [[-1.02, 0.56, 0], [-1.16, 0.28, 0], [-1.22, -0.05, 0], [-1.20, -0.30, 0]], radii: [0.055, 0.04, 0.03, 0.032], material: 'skin', animate: 'sway', bone: true, textured: true },
    ],
    eyes: [{ position: [1.15, 0.67, 0.24], radius: 0.034, mirror: true, pupil: 'round' }],
    fur: mammoth ? { length: 0.075, shells: 2 } : null,
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.3, 0.64], skull: [0, 0.22], neuralSpine: 1.3, pelvisT: 0.76, scapulaT: 0.33 },
    organs: { heart: 0.4, lungs: 0.38, brain: 0.1, gut: 0.62, liver: 0.5 },
    texture: { pattern: 'solid', wrinkles: mammoth ? 0.35 : 0.95, mottle: 0.16, normalStrength: mammoth ? 0.85 : 1.25, furGrain: mammoth ? 1.1 : 0 },
    animation: 'breathe',
    breath: { center: 0.42, width: 0.25, amplitude: 0.02 },
    groundRest: true,
  };
}

function catPlan(saber: boolean): BodyPlan {
  const spine = saber
    ? [P(1.44, 0.42, 0.07, 0.08), P(1.31, 0.46, 0.17, 0.17), P(1.10, 0.56, 0.28, 0.26), P(0.88, 0.52, 0.28, 0.25), P(0.58, 0.52, 0.40, 0.33),
       P(0.22, 0.47, 0.39, 0.31), P(-0.16, 0.41, 0.34, 0.27), P(-0.50, 0.40, 0.31, 0.24), P(-0.76, 0.39, 0.19, 0.15), P(-0.86, 0.38, 0.05, 0.05)]
    : [P(1.42, 0.44, 0.05, 0.06), P(1.32, 0.46, 0.14, 0.14), P(1.14, 0.54, 0.24, 0.22), P(0.92, 0.48, 0.2, 0.19), P(0.62, 0.44, 0.31, 0.25),
       P(0.3, 0.4, 0.33, 0.26), P(-0.1, 0.38, 0.3, 0.23), P(-0.5, 0.42, 0.29, 0.21), P(-0.78, 0.44, 0.19, 0.15), P(-0.88, 0.44, 0.05, 0.05)];
  const foreR = saber ? [0.185, 0.145, 0.11, 0.098] : [0.14, 0.11, 0.085, 0.08];
  const tubes: TubeSpec[] = [
    saber
      ? { kind: 'tail', points: [[-0.84, 0.38, 0], [-1.00, 0.29, 0.02], [-1.10, 0.17, 0.03]], radii: [0.065, 0.05, 0.032], material: 'skin', animate: 'sway', bone: true, textured: true }
      : { kind: 'tail', points: [[-0.86, 0.42, 0], [-1.2, 0.34, 0.02], [-1.5, 0.05, 0.06], [-1.62, -0.3, 0.1]], radii: [0.065, 0.06, 0.05, 0.04], material: 'skin', animate: 'sway', bone: true, textured: true },
    { kind: 'whisker', points: [[1.36, 0.40, 0.10], [1.45, 0.38, 0.24], [1.50, 0.34, 0.33]], radii: [0.0035, 0.0022, 0.001], mirror: true, material: 'ivory' },
    { kind: 'whisker', points: [[1.36, 0.42, 0.10], [1.44, 0.42, 0.25], [1.49, 0.40, 0.34]], radii: [0.0035, 0.0022, 0.001], mirror: true, material: 'ivory' },
  ];
  if (saber) {
    // Paired curved maxillary saber canines (28-cm laterally compressed daggers at z = ±0.085!)
    tubes.push({
      kind: 'tusk',
      points: [[1.35, 0.39, 0.085], [1.38, 0.25, 0.088], [1.35, 0.11, 0.082]],
      radii: [0.028, 0.021, 0.005],
      mirror: true,
      material: 'ivory',
      bone: true,
    });
  }
  return {
    posture: 'quadruped',
    spine,
    limbs: [
      { role: 'fore', points: [[0.56, 0.24, 0.19], [0.50, -0.22, 0.20], [0.54, -0.68, 0.20], [0.64, -0.94, 0.20]], radii: foreR, paw: saber ? 0.14 : 0.11, toes: { count: 4, length: 0.095, radius: 0.032, spread: 0.28, claws: true } },
      { role: 'hind', points: [[-0.50, 0.22, 0.17], [-0.34, -0.20, 0.18], [-0.58, -0.58, 0.18], [-0.46, -0.94, 0.18]], radii: [0.175, 0.125, 0.09, 0.085], paw: 0.12, toes: { count: 4, length: 0.09, radius: 0.03, spread: 0.28, claws: true } },
    ],
    fins: [
      { kind: 'ear', outline: [[0.03, 0], [0.05, 0.09], [0, 0.14], [-0.06, 0.1], [-0.07, 0]], position: [1.06, 0.72, 0.15], thickness: 0.02, rotation: [0, 0.35, 0], mirror: true, color: 'primary', textured: true },
    ],
    tubes,
    eyes: [{ position: [1.26, 0.56, 0.15], radius: 0.038, mirror: true, pupil: 'round' }],
    nose: { position: [1.44, 0.44, 0], radius: 0.034 },
    mouth: {
      points: [[1.42, 0.36, 0.02], [1.34, 0.35, 0.09], [1.22, 0.36, 0.14]],
      mirror: true,
      teeth: saber ? undefined : { count: 2, size: 0.048, from: 0.18, to: 0.45 },
    },
    fur: saber ? { length: 0.05, shells: 2 } : { length: 0.038, shells: 2 },
    skeleton: { type: 'endo', vertebrae: [0.2, 1], ribs: [0.3, 0.6], skull: [0, 0.2], neuralSpine: 0.95, pelvisT: 0.75, scapulaT: 0.32 },
    organs: { heart: 0.36, lungs: 0.34, brain: 0.1, gut: 0.58, liver: 0.46 },
    texture: saber
      ? { pattern: 'spots', spotDensity: 15, spotSize: 0.20, spotFill: 0.46, spotColor: 'accent', ventralBlend: 0.72, furGrain: 1.15, normalStrength: 0.65 }
      : { pattern: 'stripes', stripeCount: 20, ventralBlend: 0.75, furGrain: 1.1, normalStrength: 0.55 },
    animation: 'breathe',
    breath: { center: 0.38, width: 0.22, amplitude: 0.022 },
    groundRest: true,
    anchors: saber ? { tusk: [1.36, 0.20, 0.09] } : undefined,
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
    tubes.push({ kind: 'tongue', points: [[1.46, -0.50, 0], [1.62, -0.52, 0]], radii: [0.016, 0.010], material: 'tongue', color: '#eab308', textured: false });
    tubes.push({ kind: 'tongue', points: [[1.62, -0.52, 0], [1.72, -0.54, 0.038]], radii: [0.009, 0.0025], material: 'tongue', color: '#eab308', mirror: true });
  }
  return {
    posture: 'sprawling',
    spine,
    limbs: [
      {
        role: 'fore',
        points: [[0.42, -0.52, 0.32], [0.54, -0.64, 0.58], [0.48, -0.85, 0.56], [0.60, -0.95, 0.57]],
        radii: [0.125 * lk, 0.098 * lk, 0.076 * lk, 0.062 * lk],
        toes: { count: 5, length: 0.14, radius: 0.022, spread: 0.30, claws: true },
      },
      {
        role: 'hind',
        points: [[-0.58, -0.52, 0.28], [-0.44, -0.64, 0.56], [-0.58, -0.85, 0.55], [-0.46, -0.95, 0.56]],
        radii: [0.145 * lk, 0.112 * lk, 0.084 * lk, 0.066 * lk],
        toes: { count: 5, length: 0.16, radius: 0.024, spread: 0.30, claws: true },
      },
    ],
    fins,
    tubes,
    scutes: variant === 'sarcosuchus'
      ? { from: 0.24, to: 0.84, count: 18, rows: 4, size: 0.052, rowSpread: 0.16 }
      : variant === 'croc'
        ? { from: 0.26, to: 0.82, count: 17, rows: 4, size: 0.048, rowSpread: 0.15 }
        : undefined,
    eyes: [isCrocLike
      ? { position: [1.00, -0.34, 0.15], radius: 0.036, mirror: true, pupil: 'slit' }
      : { position: [1.08, -0.32, 0.15], radius: 0.034, mirror: true, pupil: 'round', color: '#1c1917' }],
    nostrils: variant === 'sarcosuchus' ? [[1.80, -0.44, 0.045]] : variant === 'croc' ? [[1.66, -0.51, 0.035]] : [[1.44, -0.44, 0.035]],
    mouth: variant === 'sarcosuchus'
      ? { points: [[1.80, -0.55, 0.05], [1.52, -0.58, 0.10], [1.22, -0.58, 0.16], [0.95, -0.58, 0.25]], mirror: true, width: 0.014, teeth: { count: 14, size: 0.042, lower: true, from: 0.04, to: 0.90 } }
      : variant === 'croc'
        ? { points: [[1.66, -0.58, 0.04], [1.45, -0.60, 0.13], [1.20, -0.59, 0.21], [0.95, -0.59, 0.28]], mirror: true, width: 0.013, teeth: { count: 12, size: 0.038, lower: true, from: 0.05, to: 0.88 } }
        : { points: [[1.45, -0.51, 0.03], [1.28, -0.52, 0.12], [1.00, -0.51, 0.18]], mirror: true, width: 0.01, teeth: { count: 8, size: 0.022, lower: false, from: 0.08, to: 0.88 } },
    skeleton: { type: 'endo', vertebrae: [0.22, 1], ribs: [0.32, 0.62], skull: [0, 0.28], neuralSpine: 0.72, spacing: 0.06, pelvisT: 0.7, scapulaT: 0.35 },
    organs: { heart: 0.36, lungs: 0.34, brain: 0.14, gut: 0.6, liver: 0.48 },
    texture: isCrocLike
      ? { pattern: 'plates', scaleSize: 1.35, armorDorsal: true, ventralBlend: 0.65, normalStrength: 1.25, mottle: 0.22 }
      : { pattern: 'plates', scaleSize: 2.2, ventralBlend: 0.45, normalStrength: 1.05, mottle: 0.28 },
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
  const gill = (pts: [number, number, number][]): TubeSpec => ({ kind: 'gill', points: pts, radii: [0.032, 0.026, 0.016], material: 'gill', fringe: true, mirror: true, animate: 'sway' });
  return {
    posture: 'sprawling',
    spine: [P(1.32, -0.5, 0.05, 0.1), P(1.1, -0.46, 0.13, 0.28), P(0.8, -0.43, 0.16, 0.26), P(0.4, -0.4, 0.19, 0.23), P(-0.1, -0.4, 0.19, 0.21), P(-0.55, -0.4, 0.15, 0.13), P(-1.05, -0.4, 0.09, 0.06), P(-1.45, -0.42, 0.04, 0.03), P(-1.55, -0.43, 0.01, 0.01)],
    segmentation: { from: 0.28, to: 0.72, frequency: 12, depth: 0.035 },
    limbs: [
      { role: 'fore', points: [[0.68, -0.54, 0.22], [0.78, -0.78, 0.38], [0.90, -0.96, 0.44]], radii: [0.055, 0.042, 0.032], toes: { count: 4, length: 0.11, radius: 0.014, spread: 0.45 } },
      { role: 'hind', points: [[-0.50, -0.54, 0.18], [-0.40, -0.78, 0.34], [-0.30, -0.96, 0.40]], radii: [0.062, 0.046, 0.035], toes: { count: 5, length: 0.12, radius: 0.014, spread: 0.40 } },
    ],
    fins: [
      { kind: 'crest', position: [0, 0, 0], thickness: 0.016, color: 'membrane', opacity: 0.78, outline: [[0.55, -0.22], [0.15, -0.14], [-0.35, -0.10], [-0.85, -0.10], [-1.30, -0.22], [-1.58, -0.43], [-1.35, -0.64], [-0.95, -0.68], [-0.55, -0.60], [-0.25, -0.44], [0.25, -0.34]] },
    ],
    tubes: [
      gill([[0.95, -0.32, 0.25], [1.05, -0.14, 0.42], [1.14, -0.01, 0.54]]),
      gill([[0.90, -0.34, 0.26], [0.92, -0.15, 0.46], [0.92, -0.01, 0.58]]),
      gill([[0.84, -0.36, 0.26], [0.78, -0.19, 0.46], [0.72, -0.06, 0.58]]),
    ],
    eyes: [{ position: [1.12, -0.4, 0.21], radius: 0.036, mirror: true, pupil: 'round', color: '#ca8a04' }],
    mouth: { points: [[1.3, -0.56, 0], [1.12, -0.56, 0.24], [0.98, -0.54, 0.3]], mirror: true, width: 0.01 },
    wet: true,
    skeleton: { type: 'endo', vertebrae: [0.2, 1], ribs: [0.32, 0.6], skull: [0, 0.25], neuralSpine: 0.4, spacing: 0.05 },
    organs: { heart: 0.38, lungs: 0.36, brain: 0.12, gut: 0.58, extras: ['gills'] },
    texture: { pattern: 'solid', mottle: 0.15, normalStrength: 0.3, ventralBlend: 0.35 },
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
    texture: { pattern: 'spots', spotDensity: 26, spotSize: 0.085, spotFill: 0.42, spotColor: 'white', scaleSize: 1.35, normalStrength: 1.25, ventralBlend: 0.28, mottle: 0.24 },
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
      // Paired 15-cm serrated maxillary gorgonopsid saber canines
      { kind: 'tusk', points: [[1.36, 0.28, 0.09], [1.38, 0.13, 0.092], [1.35, 0.02, 0.086]], radii: [0.028, 0.02, 0.005], mirror: true, material: 'ivory', bone: true },
    ],
    eyes: [{ position: [1.14, 0.48, 0.16], radius: 0.038, mirror: true, pupil: 'slit', color: '#f59e0b' }],
    nostrils: [[1.45, 0.4, 0.05]],
    mouth: {
      points: [[1.46, 0.24, 0.02], [1.28, 0.22, 0.11], [1.02, 0.23, 0.18]],
      mirror: true,
      teeth: { count: 5, size: 0.032, lower: true, from: 0.25, to: 0.82 },
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
    spine: [P(0.62, 0.31, 0.035, 0.035), P(0.49, 0.34, 0.135, 0.125), P(0.30, 0.31, 0.145, 0.135), P(0.05, 0.24, 0.24, 0.205), P(-0.30, 0.20, 0.21, 0.18), P(-0.60, 0.21, 0.13, 0.10), P(-0.80, 0.22, 0.04, 0.04)],
    limbs: [
      { role: 'hind', points: [[-0.18, 0.10, 0.09], [-0.08, -0.05, 0.10], [0.02, -0.16, 0.10]], radii: [0.045, 0.028, 0.020], toes: { count: 4, length: 0.085, radius: 0.011, spread: 0.36, claws: true, sickle: true } },
    ],
    fins: [
      { kind: 'wing', plane: 'top', position: [0.08, 0.32, 0.18], outline: [[0.22, 0], [0.24, 0.32], [0.20, 0.75], [0.08, 1.18], [-0.12, 1.54], [-0.32, 1.68], [-0.42, 1.56], [-0.46, 1.20], [-0.50, 0.80], [-0.54, 0.40], [-0.48, 0.10], [-0.28, -0.02]], thickness: 0.016, color: 'primary', mirror: true, animate: 'flap', amplitude: 0.22, textured: true, rays: 5 },
      { kind: 'tailfan', plane: 'top', position: [-0.76, 0.22, 0], outline: [[0.05, 0.18], [-0.32, 0.27], [-0.62, 0.22], [-0.66, 0], [-0.62, -0.22], [-0.32, -0.27], [0.05, -0.18]], thickness: 0.012, color: 'primary', textured: true },
    ],
    tubes: [
      // Bright yellow raptor cere at beak base + hooked slate-black tomial tip
      { kind: 'beak', points: [[0.58, 0.33, 0], [0.65, 0.32, 0]], radii: [0.052, 0.042], material: 'keratin', color: '#facc15' },
      { kind: 'beak', points: [[0.64, 0.32, 0], [0.72, 0.29, 0], [0.74, 0.21, 0]], radii: [0.040, 0.026, 0.007], material: 'keratin', color: '#0f172a' },
      { kind: 'leg', points: [[-0.08, -0.05, 0.10], [0.02, -0.16, 0.10]], radii: [0.024, 0.019], material: 'keratin', color: '#eab308', mirror: true, bone: true },
    ],
    eyes: [{ position: [0.51, 0.37, 0.10], radius: 0.042, mirror: true, pupil: 'round', color: '#111827', ring: '#facc15' }],
    skeleton: { type: 'endo', vertebrae: [0.15, 1], ribs: [0.4, 0.7], skull: [0, 0.2], neuralSpine: 0.5, spacing: 0.05, keel: true, pelvisT: 0.78 },
    organs: { heart: 0.45, lungs: 0.42, brain: 0.1, gut: 0.62, extras: ['airsacs', 'crop'] },
    texture: { pattern: 'feathers', barring: true, tailBands: true, darkHead: 0.18, ventralBlend: 0.92, normalStrength: 0.45 },
    animation: 'flap',
    groundRest: false,
    anchors: { wing: [-0.1, 0.35, 1.0] },
  };
}

function penguinPlan(): BodyPlan {
  return {
    posture: 'upright',
    spine: [P(0.28, 1.16, 0.02, 0.02), P(0.12, 1.13, 0.08, 0.07), P(0.0, 1.08, 0.17, 0.16), P(0.0, 0.88, 0.19, 0.18), P(0.06, 0.48, 0.38, 0.34), P(0.07, -0.02, 0.42, 0.36), P(0.0, -0.52, 0.35, 0.30), P(-0.08, -0.84, 0.23, 0.20), P(-0.20, -0.96, 0.08, 0.08)],
    limbs: [
      { role: 'hind', points: [[0.04, -0.76, 0.14], [0.08, -0.92, 0.15], [0.22, -0.97, 0.16]], radii: [0.075, 0.055, 0.044], paw: 0.065, toes: { count: 3, length: 0.12, radius: 0.020, spread: 0.26, claws: true } },
    ],
    fins: [
      { kind: 'wing', position: [0.02, 0.55, 0.36], outline: [[0.05, 0.05], [0.10, -0.10], [0.05, -0.40], [-0.05, -0.72], [-0.15, -0.80], [-0.22, -0.60], [-0.20, -0.30], [-0.12, -0.05]], thickness: 0.04, color: 'primary', mirror: true, rotation: [0, -0.12, 0], animate: 'paddle', amplitude: 0.08, rays: 3 },
      { kind: 'tailfan', position: [-0.20, -0.92, 0], outline: [[0.05, 0.05], [-0.10, 0.02], [-0.28, -0.10], [-0.26, -0.16], [-0.05, -0.08]], thickness: 0.022, color: 'primary' },
    ],
    tubes: [
      { kind: 'beak', points: [[0.14, 1.12, 0], [0.30, 1.10, 0], [0.40, 1.05, 0]], radii: [0.042, 0.026, 0.008], material: 'keratin', color: '#1e293b' },
      { kind: 'beak', points: [[0.16, 1.09, 0.018], [0.24, 1.08, 0.015], [0.32, 1.07, 0.012]], radii: [0.016, 0.011, 0.006], material: 'keratin', color: '#fb923c', mirror: true },
    ],
    eyes: [{ position: [0.10, 1.11, 0.13], radius: 0.032, mirror: true, pupil: 'round', color: '#9a3412' }],
    skeleton: { type: 'endo', vertebrae: [0.1, 1], ribs: [0.35, 0.7], skull: [0, 0.15], neuralSpine: 0.5, spacing: 0.06, keel: true, pelvisT: 0.8,
      internalLegs: [[[0.05, -0.3, 0.15], [0.2, -0.55, 0.16], [0.15, -0.96, 0.15]]] },
    organs: { heart: 0.42, lungs: 0.4, brain: 0.06, gut: 0.6, extras: ['airsacs', 'crop'] },
    texture: { pattern: 'countershade', dorsalU: 0.5, sharpness: 0.92, darkHead: 0.22, earPatch: true, normalStrength: 0.32 },
    animation: 'breathe',
    breath: { center: 0.5, width: 0.25, amplitude: 0.015 },
    groundRest: true,
    anchors: { foot: [0.26, -0.97, 0.16], wing: [0.0, 0.1, 0.42] },
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
/*  Expanded Curated Species & Phyla Archetype Blueprints (#28–42)            */
/* -------------------------------------------------------------------------- */

function narwhalPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.38, 0.02, 0.14, 0.15), P(1.12, 0.04, 0.28, 0.27), P(0.68, 0.05, 0.36, 0.35), P(0.10, 0.03, 0.35, 0.34), P(-0.48, 0.01, 0.25, 0.24), P(-0.96, 0.0, 0.14, 0.12), P(-1.32, 0.0, 0.06, 0.06)],
    limbs: [],
    fins: [
      { kind: 'pectoral', position: [0.56, -0.18, 0.30], outline: [[0.06, 0], [0.02, -0.26], [-0.14, -0.34], [-0.22, -0.18], [-0.12, 0]], thickness: 0.032, color: 'primary', mirror: true, rotation: [0.3, 0, -0.4], animate: 'paddle', amplitude: 0.08 },
      { kind: 'fluke', position: [-1.30, 0.0, 0], plane: 'top', outline: [[0.08, 0], [-0.08, 0.36], [-0.22, 0.38], [-0.16, 0.04], [-0.22, -0.38], [-0.08, -0.36]], thickness: 0.028, color: 'primary', animate: 'flap', amplitude: 0.12 },
    ],
    tubes: [
      { kind: 'tusk', points: [[1.36, 0.02, 0.03], [1.72, 0.03, 0.02], [2.08, 0.04, 0.01]], radii: [0.034, 0.022, 0.006], material: 'ivory', mirror: false, bone: true },
    ],
    eyes: [{ position: [1.14, 0.02, 0.25], radius: 0.026, mirror: true, pupil: 'round', color: '#1e293b' }],
    skeleton: { type: 'endo', vertebrae: [0.16, 0.96], ribs: [0.24, 0.58], skull: [0, 0.18], neuralSpine: 0.28, scapulaT: 0.28 },
    organs: { heart: 0.34, lungs: 0.38, brain: 0.08, gut: 0.58, liver: 0.48 },
    texture: { pattern: 'spots', mottle: 0.42, spotDensity: 26, spotSize: 0.06, ventralBlend: 0.85, normalStrength: 0.28 },
    wet: true,
    animation: 'swim-vertical',
    groundRest: false,
  };
}

function platypusPlan(): BodyPlan {
  return {
    posture: 'sprawling',
    spine: [P(1.08, 0.08, 0.08, 0.12), P(0.84, 0.12, 0.15, 0.17), P(0.52, 0.14, 0.21, 0.25), P(0.05, 0.15, 0.23, 0.28), P(-0.46, 0.13, 0.20, 0.24), P(-0.82, 0.09, 0.11, 0.18), P(-1.22, 0.06, 0.05, 0.20)],
    limbs: [
      { role: 'fore', points: [[0.46, 0.04, 0.22], [0.50, -0.10, 0.36], [0.54, -0.22, 0.40]], radii: [0.068, 0.052, 0.045], paw: 0.075, toes: { count: 5, length: 0.065, radius: 0.012, spread: 0.38, claws: true } },
      { role: 'hind', points: [[-0.44, 0.04, 0.20], [-0.50, -0.10, 0.32], [-0.54, -0.22, 0.35]], radii: [0.065, 0.048, 0.042], paw: 0.068, toes: { count: 5, length: 0.06, radius: 0.011, spread: 0.34, claws: true } },
    ],
    fins: [
      { kind: 'tailfan', position: [-0.82, 0.08, 0], plane: 'top', outline: [[0.06, 0], [-0.14, 0.20], [-0.46, 0.22], [-0.56, 0], [-0.46, -0.22], [-0.14, -0.20]], thickness: 0.048, color: 'dark' },
    ],
    tubes: [
      { kind: 'beak', points: [[0.98, 0.08, 0], [1.24, 0.06, 0], [1.38, 0.05, 0]], radii: [0.11, 0.12, 0.085], material: 'keratin', color: '#334155' },
    ],
    eyes: [{ position: [0.90, 0.16, 0.14], radius: 0.022, mirror: true, pupil: 'round', color: '#451a03' }],
    fur: { length: 0.032, shells: 2 },
    skeleton: { type: 'endo', vertebrae: [0.16, 0.94], ribs: [0.28, 0.66], skull: [0, 0.20], pelvisT: 0.72, scapulaT: 0.30 },
    organs: { heart: 0.36, lungs: 0.38, brain: 0.10, gut: 0.58, liver: 0.48 },
    texture: { pattern: 'countershade', furGrain: 0.65, ventralBlend: 0.78, normalStrength: 0.36 },
    wet: true,
    animation: 'breathe',
    groundRest: true,
  };
}

function mantaRayPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(0.95, 0.0, 0.10, 0.42), P(0.62, 0.02, 0.16, 0.62), P(0.18, 0.03, 0.18, 0.68), P(-0.28, 0.02, 0.14, 0.46), P(-0.68, 0.0, 0.08, 0.20), P(-1.18, -0.02, 0.03, 0.04)],
    limbs: [],
    fins: [
      { kind: 'pectoral', position: [0.18, 0.01, 0.36], plane: 'top', outline: [[0.52, 0], [0.12, 0.96], [-0.26, 1.12], [-0.54, 0.48], [-0.46, 0]], thickness: 0.048, color: 'primary', mirror: true, animate: 'flap', amplitude: 0.16 },
      { kind: 'flap', position: [0.92, -0.01, 0.26], outline: [[0, 0.05], [0.28, 0.04], [0.32, -0.04], [0.04, -0.06]], thickness: 0.026, color: 'secondary', mirror: true },
    ],
    tubes: [
      { kind: 'tail', points: [[-0.68, 0.0, 0], [-1.12, -0.02, 0], [-1.52, -0.04, 0]], radii: [0.038, 0.020, 0.008], material: 'skin', animate: 'sway' },
    ],
    eyes: [{ position: [0.84, 0.03, 0.40], radius: 0.028, mirror: true, pupil: 'round', color: '#0f172a' }],
    gillSlits: { x0: 0.48, dx: -0.09, count: 5, y: -0.10, z: 0.26, height: 0.10 },
    skeleton: { type: 'cartilage', vertebrae: [0.14, 0.92], ribs: [0.22, 0.68], skull: [0, 0.20] },
    organs: { heart: 0.32, lungs: 0.30, brain: 0.10, gut: 0.54, liver: 0.44, extras: ['gills', 'bigLiver'] },
    texture: { pattern: 'countershade', sharpness: 0.88, ventralBlend: 0.95, spotDensity: 8, normalStrength: 0.24 },
    wet: true,
    animation: 'flap',
    groundRest: false,
  };
}

function cnidarianMedusaPlan(): BodyPlan {
  return {
    posture: 'invertebrate',
    spine: [P(0.18, 0.82, 0.08, 0.08), P(0.11, 0.72, 0.42, 0.42), P(0.04, 0.56, 0.68, 0.68), P(-0.04, 0.38, 0.74, 0.74), P(-0.11, 0.26, 0.56, 0.56), P(-0.18, 0.18, 0.24, 0.24)],
    limbs: [],
    fins: [
      { kind: 'frill', position: [0.0, 0.24, 0.14], outline: [[0.08, 0], [0.14, -0.42], [0.02, -0.78], [-0.10, -0.62], [-0.08, -0.12]], thickness: 0.024, color: 'accent', opacity: 0.82, mirror: true, animate: 'undulate', amplitude: 0.12 },
    ],
    tubes: [
      { kind: 'arm', points: [[0.14, 0.24, 0.26], [0.18, -0.28, 0.32], [0.10, -0.86, 0.24]], radii: [0.022, 0.012, 0.005], material: 'membrane', color: '#fb923c', mirror: true, animate: 'sway' },
      { kind: 'arm', points: [[-0.16, 0.24, 0.26], [-0.22, -0.32, 0.30], [-0.14, -0.92, 0.22]], radii: [0.020, 0.011, 0.005], material: 'membrane', color: '#fda4af', mirror: true, animate: 'sway' },
      { kind: 'arm', points: [[0.0, 0.24, 0.38], [0.04, -0.36, 0.42], [-0.02, -0.95, 0.34]], radii: [0.018, 0.010, 0.004], material: 'membrane', color: '#fde047', mirror: true, animate: 'sway' },
    ],
    eyes: [{ position: [0.0, 0.32, 0.68], radius: 0.018, mirror: true, pupil: 'none', color: '#fef08a' }],
    skeleton: { type: 'none', vertebrae: [0, 0], skull: [0.05, 0.25] },
    organs: { heart: 0.38, lungs: 0.44, brain: 0.20, gut: 0.56, liver: 0.48 },
    texture: { pattern: 'spots', mottle: 0.35, ventralBlend: 0.6, normalStrength: 0.22 },
    wet: true,
    animation: 'float',
    groundRest: false,
  };
}

function dodoPlan(): BodyPlan {
  return {
    posture: 'biped',
    spine: [P(0.62, 0.66, 0.13, 0.12), P(0.46, 0.58, 0.14, 0.13), P(0.32, 0.40, 0.16, 0.16), P(0.10, 0.16, 0.36, 0.34), P(-0.22, 0.08, 0.38, 0.36), P(-0.52, 0.14, 0.24, 0.22), P(-0.68, 0.24, 0.10, 0.10)],
    limbs: [
      { role: 'hind', points: [[-0.08, -0.10, 0.15], [-0.04, -0.48, 0.15], [0.04, -0.82, 0.15]], radii: [0.085, 0.052, 0.038], paw: 0.055, toes: { count: 4, length: 0.11, radius: 0.018, spread: 0.32, claws: true } },
    ],
    fins: [
      { kind: 'wing', position: [0.08, 0.22, 0.32], outline: [[0.06, 0.04], [0.04, -0.18], [-0.14, -0.26], [-0.24, -0.14], [-0.16, 0.04]], thickness: 0.036, color: 'primary', mirror: true },
      { kind: 'tailfan', position: [-0.66, 0.26, 0], outline: [[0.02, 0.04], [-0.08, 0.24], [-0.24, 0.22], [-0.22, 0.04], [-0.06, -0.04]], thickness: 0.055, color: 'ivory' },
    ],
    tubes: [
      { kind: 'beak', points: [[0.66, 0.64, 0], [0.92, 0.62, 0], [1.06, 0.53, 0]], radii: [0.085, 0.095, 0.032], material: 'keratin', color: '#cbd5e1' },
    ],
    eyes: [{ position: [0.60, 0.69, 0.10], radius: 0.028, mirror: true, pupil: 'round', color: '#fef08a' }],
    skeleton: { type: 'endo', vertebrae: [0.14, 0.94], ribs: [0.36, 0.72], skull: [0, 0.18], keel: true, pelvisT: 0.74 },
    organs: { heart: 0.42, lungs: 0.40, brain: 0.08, gut: 0.62, liver: 0.52, extras: ['crop', 'airsacs'] },
    texture: { pattern: 'feathers', ventralBlend: 0.75, darkHead: 0.14, normalStrength: 0.42 },
    animation: 'breathe',
    groundRest: true,
  };
}

function thylacinePlan(): BodyPlan {
  return {
    posture: 'quadruped',
    spine: [P(1.22, 0.38, 0.10, 0.09), P(1.00, 0.44, 0.16, 0.14), P(0.76, 0.40, 0.16, 0.14), P(0.46, 0.34, 0.27, 0.22), P(0.02, 0.32, 0.25, 0.20), P(-0.44, 0.33, 0.24, 0.19), P(-0.78, 0.28, 0.12, 0.10), P(-1.26, 0.16, 0.04, 0.04)],
    limbs: [
      { role: 'fore', points: [[0.46, 0.22, 0.15], [0.48, -0.14, 0.16], [0.50, -0.52, 0.16]], radii: [0.088, 0.058, 0.044], paw: 0.058, toes: { count: 5, length: 0.055, radius: 0.013, spread: 0.24, claws: true } },
      { role: 'hind', points: [[-0.44, 0.22, 0.15], [-0.52, -0.12, 0.16], [-0.44, -0.52, 0.16]], radii: [0.102, 0.064, 0.046], paw: 0.060, toes: { count: 4, length: 0.058, radius: 0.014, spread: 0.22, claws: true } },
    ],
    fins: [
      { kind: 'ear', position: [0.94, 0.56, 0.10], outline: [[0, 0], [0.04, 0.12], [-0.04, 0.14], [-0.07, 0.02]], thickness: 0.018, color: 'primary', mirror: true },
    ],
    tubes: [],
    eyes: [{ position: [1.04, 0.46, 0.11], radius: 0.026, mirror: true, pupil: 'round', color: '#451a03' }],
    mouth: { points: [[1.24, 0.34, 0.04], [1.08, 0.33, 0.08], [0.92, 0.35, 0.10]], teeth: { count: 7, size: 0.026 } },
    fur: { length: 0.026, shells: 2 },
    skeleton: { type: 'endo', vertebrae: [0.16, 0.94], ribs: [0.30, 0.64], skull: [0, 0.18], pelvisT: 0.72, scapulaT: 0.32 },
    organs: { heart: 0.38, lungs: 0.36, brain: 0.08, gut: 0.58, liver: 0.48 },
    texture: { pattern: 'stripes', stripeCount: 16, furGrain: 0.55, ventralBlend: 0.68, normalStrength: 0.34 },
    animation: 'breathe',
    groundRest: true,
  };
}

function stellersSeaCowPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.36, -0.06, 0.16, 0.17), P(1.14, 0.02, 0.24, 0.25), P(0.76, 0.06, 0.44, 0.45), P(0.16, 0.08, 0.54, 0.55), P(-0.46, 0.04, 0.42, 0.42), P(-0.98, 0.0, 0.22, 0.20), P(-1.38, 0.0, 0.08, 0.08)],
    limbs: [
      { role: 'fore', points: [[0.72, -0.22, 0.34], [0.68, -0.44, 0.38], [0.76, -0.52, 0.34]], radii: [0.11, 0.085, 0.065], paw: 0.07 },
    ],
    fins: [
      { kind: 'fluke', position: [-1.34, 0.0, 0], plane: 'top', outline: [[0.10, 0], [-0.10, 0.42], [-0.28, 0.44], [-0.18, 0.05], [-0.28, -0.44], [-0.10, -0.42]], thickness: 0.036, color: 'primary', animate: 'flap', amplitude: 0.10 },
    ],
    tubes: [],
    eyes: [{ position: [1.18, 0.06, 0.21], radius: 0.022, mirror: true, pupil: 'round', color: '#1e293b' }],
    skeleton: { type: 'endo', vertebrae: [0.16, 0.95], ribs: [0.24, 0.68], skull: [0, 0.16], scapulaT: 0.26 },
    organs: { heart: 0.32, lungs: 0.42, brain: 0.07, gut: 0.62, liver: 0.50 },
    texture: { pattern: 'solid', wrinkles: 0.85, mottle: 0.25, normalStrength: 0.55 },
    wet: true,
    animation: 'swim-vertical',
    groundRest: false,
  };
}

function trilobitePlan(): BodyPlan {
  return {
    posture: 'invertebrate',
    spine: [P(0.98, 0.04, 0.10, 0.44), P(0.68, 0.08, 0.16, 0.56), P(0.24, 0.09, 0.15, 0.50), P(-0.24, 0.08, 0.13, 0.42), P(-0.68, 0.06, 0.10, 0.30), P(-1.04, 0.03, 0.06, 0.16)],
    segmentation: { frequency: 16, depth: 0.14, from: 0.18, to: 0.92 },
    limbs: [],
    fins: [],
    tubes: [
      { kind: 'spike', points: [[0.66, 0.02, 0.52], [0.28, 0.01, 0.64], [-0.18, 0.0, 0.58]], radii: [0.042, 0.024, 0.006], material: 'chitin', mirror: true },
      { kind: 'antenna', points: [[0.96, 0.02, 0.14], [1.26, 0.04, 0.28], [1.46, 0.06, 0.42]], radii: [0.018, 0.011, 0.004], material: 'chitin', mirror: true, animate: 'sway' },
      { kind: 'spike', points: [[-1.02, 0.03, 0], [-1.19, 0.025, 0], [-1.36, 0.02, 0]], radii: [0.032, 0.018, 0.005], material: 'chitin', mirror: false },
    ],
    eyes: [{ position: [0.76, 0.15, 0.30], radius: 0.046, mirror: true, pupil: 'compound', color: '#fde68a' }],
    skeleton: { type: 'exo', vertebrae: [0.16, 0.92], skull: [0, 0.24] },
    organs: { heart: 0.42, lungs: 0.48, brain: 0.12, gut: 0.58, liver: 0.36, extras: ['dorsalVessel', 'gills'] },
    texture: { pattern: 'plates', segmentBands: 16, armorEnd: 0.95, normalStrength: 0.48 },
    wet: true,
    animation: 'crawl',
    groundRest: true,
  };
}

function camerocerasPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(0.84, 0.0, 0.24, 0.24), P(0.56, 0.02, 0.28, 0.28), P(0.12, 0.02, 0.25, 0.25), P(-0.42, 0.02, 0.19, 0.19), P(-0.98, 0.02, 0.12, 0.12), P(-1.52, 0.02, 0.04, 0.04)],
    segmentation: { frequency: 14, depth: 0.04, from: 0.18, to: 0.98 },
    limbs: [],
    fins: [],
    tubes: [
      { kind: 'arm', points: [[0.82, 0.06, 0.12], [1.18, 0.10, 0.18], [1.50, 0.04, 0.12]], radii: [0.042, 0.026, 0.008], material: 'skin', suckers: true, mirror: true, animate: 'sway' },
      { kind: 'arm', points: [[0.82, -0.06, 0.14], [1.20, -0.10, 0.20], [1.52, -0.04, 0.14]], radii: [0.040, 0.024, 0.008], material: 'skin', suckers: true, mirror: true, animate: 'sway' },
      { kind: 'arm', points: [[0.84, 0.0, 0.18], [1.22, 0.0, 0.26], [1.56, 0.02, 0.18]], radii: [0.038, 0.022, 0.007], material: 'skin', suckers: true, mirror: true, animate: 'sway' },
      { kind: 'siphon', points: [[0.64, -0.20, 0], [0.76, -0.22, 0], [0.88, -0.24, 0]], radii: [0.048, 0.040, 0.032], material: 'skin', mirror: false },
    ],
    eyes: [{ position: [0.74, 0.05, 0.23], radius: 0.048, mirror: true, pupil: 'hslit', color: '#fef08a' }],
    skeleton: { type: 'exo', vertebrae: [0.20, 0.98], skull: [0, 0.20] },
    organs: { heart: 0.30, lungs: 0.28, brain: 0.12, gut: 0.52, liver: 0.44, extras: ['threeHearts', 'gills', 'inkSac'] },
    texture: { pattern: 'plates', segmentBands: 14, armorEnd: 0.82, normalStrength: 0.40 },
    wet: true,
    animation: 'hover',
    groundRest: false,
  };
}

function eurypterusPlan(): BodyPlan {
  return {
    posture: 'invertebrate',
    spine: [P(1.04, 0.04, 0.10, 0.30), P(0.76, 0.06, 0.13, 0.34), P(0.34, 0.06, 0.12, 0.32), P(-0.14, 0.05, 0.10, 0.26), P(-0.58, 0.04, 0.08, 0.16), P(-0.98, 0.03, 0.05, 0.09)],
    segmentation: { frequency: 12, depth: 0.10, from: 0.20, to: 0.94 },
    limbs: [],
    fins: [
      { kind: 'pectoral', position: [0.62, -0.02, 0.28], plane: 'top', outline: [[0.06, 0], [-0.04, 0.46], [-0.24, 0.52], [-0.30, 0.26], [-0.14, 0]], thickness: 0.026, color: 'accent', mirror: true, animate: 'paddle', amplitude: 0.14 },
    ],
    tubes: [
      { kind: 'leg', points: [[0.86, -0.02, 0.22], [1.04, -0.08, 0.38], [1.14, -0.14, 0.32]], radii: [0.026, 0.018, 0.008], material: 'chitin', spines: 4, mirror: true },
      { kind: 'leg', points: [[0.76, -0.02, 0.25], [0.88, -0.10, 0.44], [0.94, -0.16, 0.40]], radii: [0.026, 0.018, 0.008], material: 'chitin', spines: 4, mirror: true },
      { kind: 'spike', points: [[-0.96, 0.03, 0], [-1.21, 0.025, 0], [-1.46, 0.02, 0]], radii: [0.038, 0.020, 0.005], material: 'chitin', mirror: false },
    ],
    eyes: [{ position: [0.90, 0.11, 0.18], radius: 0.038, mirror: true, pupil: 'compound', color: '#1e293b' }],
    skeleton: { type: 'exo', vertebrae: [0.16, 0.94], skull: [0, 0.22] },
    organs: { heart: 0.40, lungs: 0.46, brain: 0.12, gut: 0.58, liver: 0.36, extras: ['dorsalVessel', 'gills'] },
    texture: { pattern: 'plates', segmentBands: 12, armorEnd: 0.96, normalStrength: 0.44 },
    wet: true,
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function tiktaalikPlan(): BodyPlan {
  return {
    posture: 'sprawling',
    spine: [P(1.26, 0.06, 0.07, 0.18), P(0.96, 0.10, 0.11, 0.26), P(0.62, 0.12, 0.16, 0.26), P(0.12, 0.12, 0.19, 0.25), P(-0.42, 0.10, 0.16, 0.20), P(-0.92, 0.07, 0.11, 0.11), P(-1.38, 0.05, 0.04, 0.03)],
    limbs: [
      { role: 'fore', points: [[0.56, 0.0, 0.22], [0.62, -0.16, 0.34], [0.70, -0.24, 0.38]], radii: [0.078, 0.062, 0.052], paw: 0.075 },
      { role: 'hind', points: [[-0.42, 0.0, 0.18], [-0.48, -0.15, 0.28], [-0.54, -0.23, 0.32]], radii: [0.068, 0.052, 0.044], paw: 0.065 },
    ],
    fins: [
      { kind: 'caudal', position: [-0.94, 0.07, 0], outline: [[0.08, 0.06], [-0.28, 0.18], [-0.54, 0.0], [-0.28, -0.16], [0.08, -0.06]], thickness: 0.024, color: 'secondary', rays: 8, animate: 'undulate', amplitude: 0.10 },
    ],
    tubes: [],
    eyes: [{ position: [0.98, 0.19, 0.11], radius: 0.030, mirror: true, pupil: 'round', color: '#ca8a04' }],
    skeleton: { type: 'endo', vertebrae: [0.18, 0.94], ribs: [0.26, 0.68], skull: [0, 0.22], pelvisT: 0.68, scapulaT: 0.28 },
    organs: { heart: 0.34, lungs: 0.38, brain: 0.10, gut: 0.58, liver: 0.48, extras: ['gills'] },
    texture: { pattern: 'scales', scaleSize: 0.042, mottle: 0.28, ventralBlend: 0.72, normalStrength: 0.42 },
    wet: true,
    animation: 'swim-lateral',
    groundRest: true,
  };
}

function helicoprionPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.40, 0.04, 0.09, 0.09), P(1.06, 0.04, 0.22, 0.20), P(0.56, 0.05, 0.32, 0.28), P(-0.04, 0.04, 0.30, 0.26), P(-0.62, 0.02, 0.19, 0.16), P(-1.12, 0.0, 0.09, 0.08), P(-1.42, 0.0, 0.04, 0.04)],
    limbs: [],
    fins: [
      { kind: 'dorsal', position: [0.16, 0.31, 0], outline: [[0.18, -0.04], [-0.04, 0.40], [-0.24, 0.36], [-0.28, -0.04]], thickness: 0.028, color: 'primary' },
      { kind: 'pectoral', position: [0.54, -0.18, 0.24], outline: [[0.10, 0], [-0.06, -0.44], [-0.28, -0.42], [-0.22, 0]], thickness: 0.028, color: 'primary', mirror: true, rotation: [0.35, 0, -0.45] },
      { kind: 'caudal', position: [-1.32, 0.0, 0], outline: [[0.08, 0], [-0.26, 0.46], [-0.36, 0.38], [-0.14, 0], [-0.34, -0.42], [-0.22, -0.44]], thickness: 0.026, color: 'primary', animate: 'undulate', amplitude: 0.14 },
    ],
    tubes: [],
    rings: [
      { position: [1.18, -0.11, 0], radius: 0.12, tube: 0.028, color: '#f8fafc', rotation: [0, 0, 0] },
      { position: [1.18, -0.11, 0], radius: 0.072, tube: 0.022, color: '#e2e8f0', rotation: [0, 0, 0] },
    ],
    eyes: [{ position: [1.12, 0.08, 0.17], radius: 0.032, mirror: true, pupil: 'round', color: '#0ea5e9' }],
    gillSlits: { x0: 0.84, dx: -0.05, count: 4, y: -0.02, z: 0.22, height: 0.12 },
    skeleton: { type: 'cartilage', vertebrae: [0.16, 0.94], skull: [0, 0.20] },
    organs: { heart: 0.32, lungs: 0.30, brain: 0.09, gut: 0.56, liver: 0.46, extras: ['gills', 'bigLiver'] },
    texture: { pattern: 'countershade', sharpness: 0.78, ventralBlend: 0.88, normalStrength: 0.26 },
    wet: true,
    animation: 'swim-lateral',
    groundRest: false,
  };
}

function titanoboaPlan(): BodyPlan {
  return {
    posture: 'sprawling',
    spine: [P(1.36, 0.14, 0.09, 0.12), P(1.10, 0.16, 0.13, 0.17), P(0.76, 0.12, 0.15, 0.16), P(0.28, 0.10, 0.20, 0.22), P(-0.26, 0.10, 0.21, 0.23), P(-0.78, 0.09, 0.17, 0.19), P(-1.22, 0.07, 0.11, 0.12), P(-1.52, 0.05, 0.04, 0.04)],
    limbs: [],
    fins: [],
    tubes: [
      { kind: 'tail', points: [[-0.36, 0.08, 0.22], [-0.04, 0.08, 0.48], [0.42, 0.08, 0.42], [0.58, 0.07, 0.18]], radii: [0.15, 0.14, 0.12, 0.09], material: 'skin', mirror: false, textured: true },
      { kind: 'tongue', points: [[1.36, 0.11, 0], [1.43, 0.105, 0.015], [1.50, 0.10, 0.03]], radii: [0.010, 0.007, 0.004], material: 'tongue', mirror: true },
    ],
    eyes: [{ position: [1.22, 0.19, 0.12], radius: 0.024, mirror: true, pupil: 'slit', color: '#eab308' }],
    skeleton: { type: 'endo', vertebrae: [0.14, 0.96], ribs: [0.18, 0.88], skull: [0, 0.16], spacing: 0.045 },
    organs: { heart: 0.30, lungs: 0.42, brain: 0.07, gut: 0.62, liver: 0.50 },
    texture: { pattern: 'spots', scaleSize: 0.038, spotDensity: 18, spotSize: 0.09, ventralBlend: 0.72, normalStrength: 0.46 },
    animation: 'swim-lateral',
    groundRest: true,
  };
}

function livyatanPlan(): BodyPlan {
  return {
    posture: 'aquatic',
    spine: [P(1.42, 0.08, 0.34, 0.28), P(1.04, 0.10, 0.44, 0.36), P(0.52, 0.06, 0.46, 0.40), P(-0.08, 0.03, 0.38, 0.34), P(-0.66, 0.01, 0.24, 0.21), P(-1.12, 0.0, 0.12, 0.10), P(-1.44, 0.0, 0.05, 0.05)],
    limbs: [],
    fins: [
      { kind: 'dorsal', position: [-0.28, 0.36, 0], outline: [[0.18, -0.04], [-0.06, 0.18], [-0.26, 0.14], [-0.30, -0.04]], thickness: 0.04, color: 'primary' },
      { kind: 'pectoral', position: [0.46, -0.22, 0.34], outline: [[0.08, 0], [-0.04, -0.34], [-0.22, -0.36], [-0.24, -0.10], [-0.12, 0]], thickness: 0.036, color: 'primary', mirror: true, rotation: [0.3, 0, -0.4], animate: 'paddle', amplitude: 0.08 },
      { kind: 'fluke', position: [-1.40, 0.0, 0], plane: 'top', outline: [[0.10, 0], [-0.10, 0.44], [-0.28, 0.46], [-0.18, 0.04], [-0.28, -0.46], [-0.10, -0.44]], thickness: 0.032, color: 'primary', animate: 'flap', amplitude: 0.12 },
    ],
    tubes: [],
    mouth: { points: [[1.40, -0.14, 0.10], [1.14, -0.16, 0.18], [0.86, -0.14, 0.22]], teeth: { count: 9, size: 0.052, lower: true } },
    eyes: [{ position: [0.92, -0.02, 0.34], radius: 0.028, mirror: true, pupil: 'round', color: '#1e293b' }],
    skeleton: { type: 'endo', vertebrae: [0.22, 0.96], ribs: [0.28, 0.62], skull: [0, 0.24], neuralSpine: 0.32, scapulaT: 0.28 },
    organs: { heart: 0.36, lungs: 0.40, brain: 0.10, gut: 0.60, liver: 0.50 },
    texture: { pattern: 'countershade', wrinkles: 0.45, mottle: 0.22, ventralBlend: 0.72, normalStrength: 0.36 },
    wet: true,
    animation: 'swim-vertical',
    groundRest: false,
  };
}

function megatheriumPlan(): BodyPlan {
  return {
    posture: 'quadruped',
    spine: [P(1.18, 0.56, 0.16, 0.15), P(0.96, 0.62, 0.24, 0.22), P(0.72, 0.58, 0.28, 0.26), P(0.36, 0.54, 0.46, 0.42), P(-0.14, 0.48, 0.54, 0.50), P(-0.58, 0.36, 0.44, 0.40), P(-0.96, 0.16, 0.24, 0.22), P(-1.32, -0.12, 0.12, 0.12)],
    limbs: [
      { role: 'fore', points: [[0.42, 0.38, 0.30], [0.48, -0.06, 0.34], [0.52, -0.56, 0.32]], radii: [0.18, 0.14, 0.12], paw: 0.14, toes: { count: 3, length: 0.18, radius: 0.028, spread: 0.26, claws: true, sickle: true } },
      { role: 'hind', points: [[-0.48, 0.28, 0.32], [-0.52, -0.16, 0.34], [-0.46, -0.56, 0.32]], radii: [0.24, 0.18, 0.15], paw: 0.18, toes: { count: 3, length: 0.12, radius: 0.026, spread: 0.22, claws: true } },
    ],
    fins: [],
    tubes: [],
    eyes: [{ position: [1.02, 0.64, 0.18], radius: 0.028, mirror: true, pupil: 'round', color: '#451a03' }],
    fur: { length: 0.058, shells: 2 },
    skeleton: { type: 'endo', vertebrae: [0.16, 0.95], ribs: [0.28, 0.68], skull: [0, 0.18], pelvisT: 0.72, scapulaT: 0.30 },
    organs: { heart: 0.36, lungs: 0.38, brain: 0.08, gut: 0.58, liver: 0.48 },
    texture: { pattern: 'solid', furGrain: 0.80, mottle: 0.22, normalStrength: 0.44 },
    animation: 'breathe',
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
  'livyatan-melvillei': () => livyatanPlan(),
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
  'narwhal': () => narwhalPlan(),
  'platypus': () => platypusPlan(),
  'giant-oceanic-manta-ray': () => mantaRayPlan(),
  'lions-mane-jellyfish': () => cnidarianMedusaPlan(),
  'dodo': () => dodoPlan(),
  'thylacine': () => thylacinePlan(),
  'stellers-sea-cow': () => stellersSeaCowPlan(),
  'paradoxides-davidis': () => trilobitePlan(),
  'cameroceras-trentonense': () => camerocerasPlan(),
  'eurypterus-remipes': () => eurypterusPlan(),
  'tiktaalik-roseae': () => tiktaalikPlan(),
  'helicoprion-bessonovi': () => helicoprionPlan(),
  'titanoboa-cerrejonensis': () => titanoboaPlan(),
  'megatherium-americanum': () => megatheriumPlan(),
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
  manta_ray: () => mantaRayPlan(),
  serpentine_reptile: () => titanoboaPlan(),
  trilobite_arthropod: () => trilobitePlan(),
  cnidarian_medusa: () => cnidarianMedusaPlan(),
};

export function getBodyPlan(animal: Pick<AnimalRecord, 'id' | 'archetype' | 'visualPalette'>): BodyPlan {
  const factory = SPECIES_PLANS[animal.id] ?? ARCHETYPE_PLANS[animal.archetype] ?? ARCHETYPE_PLANS.feline_predator;
  const plan = factory();
  if (!plan.texture.pattern) plan.texture.pattern = animal.visualPalette.patternType;
  return plan;
}

export const SPECIES_WITH_PLANS = Object.keys(SPECIES_PLANS);
export const ARCHETYPES_WITH_PLANS = Object.keys(ARCHETYPE_PLANS) as BodyArchetype[];
