import * as THREE from 'three';
import { AnatomyAnchor, BodyPlan, FinSpec, LimbSpec, TubeSpec } from './bodyPlans';
import { buildFin, buildSweep, buildTube, SpineSample, SweepResult, TubeBuild, v3 } from './sweep';

/**
 * Assembles every geometry needed to render a body plan across the four
 * anatomy layers. Pure three.js (no React, no DOM) so it can be unit tested.
 */

export interface PlacedFin {
  spec: FinSpec;
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  rays: Array<[THREE.Vector3, THREE.Vector3]>;
}

export interface PlacedTube {
  spec: TubeSpec;
  tube: TubeBuild;
  suckers: THREE.Matrix4[];
  fringe: TubeBuild[];
  spines: THREE.Matrix4[];
  endPoint: THREE.Vector3;
}

export interface BuiltLimb {
  spec: LimbSpec;
  segments: TubeBuild;
  toes: TubeBuild[];
  claws: THREE.Matrix4[];
  paw: { position: THREE.Vector3; radius: number } | null;
  bones: Array<{ a: THREE.Vector3; b: THREE.Vector3; r: number }>;
  joints: Array<{ position: THREE.Vector3; r: number }>;
}

export interface OrganItem {
  kind: 'heart' | 'lung' | 'brain' | 'stomach' | 'liver' | 'intestine' | 'gill' | 'airsac' | 'inkSac' | 'crop' | 'vessel' | 'trachea' | 'bladder' | 'baleen';
  position: THREE.Vector3;
  scale: THREE.Vector3;
  quaternion: THREE.Quaternion;
  shape: 'sphere' | 'capsule' | 'torus' | 'tube';
  tubeGeometry?: THREE.BufferGeometry;
  label: string;
}

export interface BuiltSkeleton {
  vertebrae: THREE.Matrix4[];
  neuralSpines: THREE.Matrix4[];
  ribs: THREE.Matrix4[];
  gastralia: THREE.Matrix4[];
  bones: Array<{ a: THREE.Vector3; b: THREE.Vector3; r: number }>;
  joints: Array<{ position: THREE.Vector3; r: number }>;
  plates: Array<{ position: THREE.Vector3; scale: THREE.Vector3; quaternion: THREE.Quaternion }>;
  skull: SweepResult | null;
  notochord: SweepResult | null;
  eyeSockets: Array<{ position: THREE.Vector3; r: number }>;
}

export interface BuiltModel {
  plan: BodyPlan;
  body: SweepResult;
  muscle: SweepResult;
  limbs: BuiltLimb[];
  tubes: PlacedTube[];
  fins: PlacedFin[];
  eyes: Array<{ position: THREE.Vector3; radius: number; forward: THREE.Vector3; pupil: NonNullable<BodyPlan['eyes'][number]['pupil']>; color?: string; ring?: string }>;
  teeth: THREE.Matrix4[];
  scutes: THREE.Matrix4[];
  gillSlits: THREE.Matrix4[];
  nostrils: THREE.Vector3[];
  mouthLines: TubeBuild[];
  nose: { position: THREE.Vector3; radius: number } | null;
  skeleton: BuiltSkeleton;
  organs: OrganItem[];
  anchors: Record<AnatomyAnchor, THREE.Vector3>;
  bounds: THREE.Box3;
  dispose: () => void;
}

const PLANE_QUATERNIONS = {
  side: new THREE.Quaternion(),
  top: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
  front: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2),
};

function finQuaternion(spec: FinSpec): THREE.Quaternion {
  const q = PLANE_QUATERNIONS[spec.plane ?? 'side'].clone();
  if (spec.rotation) {
    const extra = new THREE.Quaternion().setFromEuler(new THREE.Euler(spec.rotation[0], spec.rotation[1], spec.rotation[2], 'XYZ'));
    q.premultiply(extra);
  }
  return q;
}

function matrixBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, lengthScale = 1): THREE.Matrix4 {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length() * lengthScale;
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return new THREE.Matrix4().compose(mid, q, new THREE.Vector3(radius, len, radius));
}

function coneMatrix(base: THREE.Vector3, dir: THREE.Vector3, length: number, radius: number): THREE.Matrix4 {
  const d = dir.clone().normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const center = base.clone().addScaledVector(d, length / 2);
  return new THREE.Matrix4().compose(center, q, new THREE.Vector3(radius, length, radius));
}

/**
 * Fins/wings/ears sample the dorsal strip of the body texture (u ≈ 0.02–0.22) so their
 * colour matches the back of the animal while keeping the micro-detail (feathers, scales).
 */
function remapFinUVs(geometry: THREE.BufferGeometry): void {
  const pos = geometry.getAttribute('position');
  const bb = geometry.boundingBox ?? (geometry.computeBoundingBox(), geometry.boundingBox!);
  const w = Math.max(1e-6, bb.max.x - bb.min.x);
  const h = Math.max(1e-6, bb.max.y - bb.min.y);
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const fx = (pos.getX(i) - bb.min.x) / w;
    const fy = (pos.getY(i) - bb.min.y) / h;
    uv[i * 2] = 0.03 + 0.18 * fx;
    uv[i * 2 + 1] = 0.2 + 0.6 * fy;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function frameQuaternion(f: SpineSample): THREE.Quaternion {
  // local x → B, local y → N, local z → T
  const m = new THREE.Matrix4().makeBasis(f.B, f.N, f.T);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

/**
 * Finds the spine sample closest in X (or 3D distance) and clamps a point's radial
 * offset (dy, dz) relative to the cross-sectional ellipse (ry, rz) so anatomical
 * features (eyes, nostrils, teeth, mouth lines, trunk/tusk roots) never float in mid-air.
 */
function snapToBodyEnvelope(
  body: SweepResult,
  p: THREE.Vector3,
  maxRadialRatio = 0.95,
  minRadialRatio = 0.0,
  clampX = true
): THREE.Vector3 {
  const frames = body.frames;
  if (frames.length === 0) return p.clone();
  const maxX = frames[0].pos.x;
  const minX = frames[frames.length - 1].pos.x;
  const targetX = clampX ? Math.min(maxX - 0.015, Math.max(minX + 0.015, p.x)) : p.x;

  let best = frames[0];
  let bestDist = Infinity;
  for (let i = 0; i < frames.length; i++) {
    const d = Math.abs(frames[i].pos.x - targetX);
    if (d < bestDist) {
      bestDist = d;
      best = frames[i];
    }
  }

  const dy = p.y - best.pos.y;
  const dz = p.z - best.pos.z;
  const ry = Math.max(0.02, best.ry);
  const rz = Math.max(0.02, best.rz);
  const norm = Math.hypot(dy / ry, dz / rz);

  let scale = 1;
  if (norm > maxRadialRatio && norm > 1e-5) {
    scale = maxRadialRatio / norm;
  } else if (norm < minRadialRatio && norm > 1e-5) {
    scale = minRadialRatio / norm;
  }

  return new THREE.Vector3(
    clampX ? targetX : p.x,
    best.pos.y + dy * scale,
    best.pos.z + dz * scale
  );
}

export function buildModel(plan: BodyPlan): BuiltModel {
  const disposables: THREE.BufferGeometry[] = [];
  const track = <T extends { geometry: THREE.BufferGeometry }>(x: T): T => {
    disposables.push(x.geometry);
    return x;
  };

  const radial = plan.radial ?? 40;
  const tubular = plan.tubular ?? 120;
  const body = track(buildSweep(plan.spine, { radial, tubular, segmentation: plan.segmentation }));
  const muscle = track(buildSweep(plan.spine, { radial: Math.round(radial * 0.75), tubular: Math.round(tubular * 0.75), segmentation: plan.segmentation, radiusScale: 0.955 }));

  const bounds = new THREE.Box3().copy(body.geometry.boundingBox!);
  const expandWithGeometry = (geometry: THREE.BufferGeometry, matrix?: THREE.Matrix4, mirror = false) => {
    const bb = geometry.boundingBox ?? (geometry.computeBoundingBox(), geometry.boundingBox!);
    const b = bb.clone();
    if (matrix) b.applyMatrix4(matrix);
    bounds.union(b);
    if (mirror) {
      bounds.union(new THREE.Box3(new THREE.Vector3(b.min.x, b.min.y, -b.max.z), new THREE.Vector3(b.max.x, b.max.y, -b.min.z)));
    }
  };

  /* ---------------------------------- limbs --------------------------------- */
  const limbs: BuiltLimb[] = plan.limbs.map((spec) => {
    const pts = spec.points.map(v3);
    const rootR = spec.radii[0] ?? 0.08;
    const girdleRoot = snapToBodyEnvelope(
      body,
      new THREE.Vector3(pts[0].x, pts[0].y + rootR * 0.85, pts[0].z * 0.45),
      0.55,
      0.0,
      true
    );
    const tubePts = [girdleRoot, ...pts];
    const tubeRadii = [rootR * 1.24, ...spec.radii];
    const segments = track(buildTube(tubePts, tubeRadii, { radial: 22, tubularPerPoint: 10 }));
    const toes: TubeBuild[] = [];
    const claws: THREE.Matrix4[] = [];
    const end = pts[pts.length - 1];
    const prev = pts[pts.length - 2] ?? end.clone().add(new THREE.Vector3(0, 1, 0));
    let forward = new THREE.Vector3().subVectors(end, prev);
    forward.y = 0;
    if (forward.lengthSq() < 1e-4) forward = new THREE.Vector3(1, 0, 0);
    forward.normalize();
    if (spec.role !== 'arm') forward = new THREE.Vector3(1, 0, 0);
    const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
    if (spec.toes) {
      const { count, length, radius, spread, claws: hasClaws, sickle } = spec.toes;
      for (let i = 0; i < count; i++) {
        const a = count === 1 ? 0 : (i / (count - 1) - 0.5) * spread * 2;
        const dir = forward.clone().multiplyScalar(Math.cos(a)).addScaledVector(side, Math.sin(a)).normalize();
        const p0 = end.clone();
        const p1 = p0.clone().addScaledVector(dir, length * 0.6).add(new THREE.Vector3(0, 0.01, 0));
        const p2 = p0.clone().addScaledVector(dir, length);
        const toe = track(buildTube([p0, p1, p2], [radius, radius * 0.85, radius * 0.6], { radial: 10 }));
        toes.push(toe);
        if (hasClaws) {
          const clawLen = sickle && i === 0 ? length * 0.9 : length * 0.45;
          const clawDir = sickle && i === 0 ? dir.clone().add(new THREE.Vector3(0, 1.2, 0)).normalize() : dir.clone().add(new THREE.Vector3(0, -0.35, 0)).normalize();
          claws.push(coneMatrix(p2.clone(), clawDir, clawLen, radius * 0.75));
        }
      }
    }
    const paw = spec.paw ? { position: end.clone().add(new THREE.Vector3(spec.paw * 0.18, 0.01, 0)), radius: spec.paw } : null;
    const bones: BuiltLimb['bones'] = [];
    const joints: BuiltLimb['joints'] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      bones.push({ a: pts[i], b: pts[i + 1], r: spec.radii[Math.min(i, spec.radii.length - 1)] * 0.3 });
      joints.push({ position: pts[i], r: spec.radii[Math.min(i, spec.radii.length - 1)] * 0.42 });
    }
    joints.push({ position: end, r: spec.radii[spec.radii.length - 1] * 0.4 });
    for (const toe of toes) {
      bones.push({ a: toe.points[0], b: toe.points[toe.points.length - 1], r: toe.radii[0] * 0.35 });
    }
    const mirror = spec.mirror !== false;
    const tm = new THREE.Matrix4().makeTranslation(segments.pivot.x, segments.pivot.y, segments.pivot.z);
    expandWithGeometry(segments.geometry, tm, mirror);
    return { spec, segments, toes, claws, paw, bones, joints };
  });

  /* ---------------------------------- tubes --------------------------------- */
  const tubes: PlacedTube[] = plan.tubes.map((spec) => {
    const pts = spec.points.map(v3);
    if (
      pts.length >= 2 &&
      (spec.kind === 'trunk' ||
        spec.kind === 'tusk' ||
        spec.kind === 'beak' ||
        spec.kind === 'horn' ||
        spec.kind === 'tail')
    ) {
      pts[0] = snapToBodyEnvelope(body, pts[0], 0.68, 0.0, true);
    }
    const tube = track(buildTube(pts, spec.radii, { radial: spec.kind === 'whisker' ? 6 : 16 }));
    const suckers: THREE.Matrix4[] = [];
    const spines: THREE.Matrix4[] = [];
    const fringe: TubeBuild[] = [];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const radiusAt = (t: number) => {
      const idx = t * (spec.radii.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(spec.radii.length - 1, i0 + 1);
      return spec.radii[i0] + (spec.radii[i1] - spec.radii[i0]) * (idx - i0);
    };
    if (spec.suckers) {
      const n = 22;
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const p = curve.getPointAt(t);
        const r = radiusAt(t);
        const T = curve.getTangentAt(t);
        let down = new THREE.Vector3(0, -1, 0);
        down.sub(T.clone().multiplyScalar(down.dot(T))).normalize();
        const off = i % 2 === 0 ? 0.35 : -0.35;
        const sideV = new THREE.Vector3().crossVectors(T, down).normalize().multiplyScalar(r * off);
        const pos = p.clone().addScaledVector(down, r * 0.92).add(sideV);
        const sr = Math.max(0.012, r * 0.32);
        suckers.push(new THREE.Matrix4().compose(pos, new THREE.Quaternion(), new THREE.Vector3(sr, sr * 0.5, sr)));
      }
    }
    if (spec.spines) {
      for (let i = 0; i < spec.spines; i++) {
        const t = 0.15 + (0.8 * i) / Math.max(1, spec.spines - 1);
        const p = curve.getPointAt(t);
        const r = radiusAt(t);
        const T = curve.getTangentAt(t);
        let inward = new THREE.Vector3(0, -1, 0);
        inward.sub(T.clone().multiplyScalar(inward.dot(T))).normalize();
        spines.push(coneMatrix(p.clone().addScaledVector(inward, r * 0.8), inward, r * 1.6, r * 0.3));
      }
    }
    if (spec.fringe) {
      const n = 7;
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 1);
        const p = curve.getPointAt(t);
        const r = radiusAt(t);
        const T = curve.getTangentAt(t);
        const sideV = new THREE.Vector3().crossVectors(T, new THREE.Vector3(0, 1, 0)).normalize();
        for (const s of [1, -1]) {
          const q = p.clone().addScaledVector(sideV, s * r * 2.6).add(new THREE.Vector3(0, -r * 0.6, 0));
          fringe.push(track(buildTube([p.clone(), q], [r * 0.45, r * 0.12], { radial: 6, tubularPerPoint: 3 })));
        }
      }
    }
    const endPoint = pts[pts.length - 1].clone();
    const mirror = spec.mirror === true;
    const tm = new THREE.Matrix4().makeTranslation(tube.pivot.x, tube.pivot.y, tube.pivot.z);
    expandWithGeometry(tube.geometry, tm, mirror);
    return { spec, tube, suckers, fringe, spines, endPoint };
  });

  /* ---------------------------------- fins ---------------------------------- */
  const fins: PlacedFin[] = plan.fins.map((spec) => {
    const geometry = track({ geometry: buildFin(spec.outline, spec.thickness ?? 0.03, spec.smooth !== false) }).geometry;
    remapFinUVs(geometry);
    const position = v3(spec.position);
    const quaternion = finQuaternion(spec);
    const rays: PlacedFin['rays'] = [];
    const rayCount = spec.rays ?? 0;
    if (rayCount > 0) {
      const m = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
      const pts = spec.outline;
      // Rays fan from the outline point closest to the origin out to spread outline points.
      let rootIdx = 0;
      let best = Infinity;
      pts.forEach((p, i) => {
        const d = Math.hypot(p[0], p[1]);
        if (d < best) {
          best = d;
          rootIdx = i;
        }
      });
      const root = new THREE.Vector3(pts[rootIdx][0], pts[rootIdx][1], 0).applyMatrix4(m);
      for (let i = 0; i < rayCount; i++) {
        const idx = Math.round(((i + 0.5) / rayCount) * (pts.length - 1));
        if (idx === rootIdx) continue;
        const tip = new THREE.Vector3(pts[idx][0], pts[idx][1], 0).applyMatrix4(m);
        rays.push([root, tip.lerp(root, 0.1)]);
      }
    }
    const m = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
    expandWithGeometry(geometry, m, spec.mirror === true);
    return { spec, geometry, position, quaternion, rays };
  });

  /* ---------------------------------- eyes ---------------------------------- */
  const snoutPos = body.sample(0).pos;
  const eyes: BuiltModel['eyes'] = [];
  for (const e of plan.eyes) {
    const rawPos = v3(e.position);
    const position = snapToBodyEnvelope(body, rawPos, 0.99, 0.94, true);
    const forward = new THREE.Vector3().subVectors(snoutPos, position);
    forward.y *= 0.3;
    forward.normalize().add(new THREE.Vector3(0, 0, 0.9)).normalize();
    const entry = { position, radius: e.radius, forward, pupil: e.pupil ?? 'round', color: e.color, ring: e.ring };
    eyes.push(entry);
    if (e.mirror !== false) {
      eyes.push({ ...entry, position: new THREE.Vector3(position.x, position.y, -position.z), forward: new THREE.Vector3(forward.x, forward.y, -forward.z) });
    }
  }
  for (const t of tubes) {
    if (t.spec.eyeAtEnd) {
      const p = t.endPoint;
      const fwd = new THREE.Vector3(0.4, 0.3, 0.9).normalize();
      eyes.push({ position: p.clone(), radius: t.spec.eyeAtEnd, forward: fwd, pupil: 'compound', color: '#111827' });
      if (t.spec.mirror) eyes.push({ position: new THREE.Vector3(p.x, p.y, -p.z), radius: t.spec.eyeAtEnd, forward: new THREE.Vector3(fwd.x, fwd.y, -fwd.z), pupil: 'compound', color: '#111827' });
    }
  }

  /* ------------------------------- mouth / teeth ----------------------------- */
  const mouthLines: TubeBuild[] = [];
  const teeth: THREE.Matrix4[] = [];
  if (plan.mouth) {
    const pts = plan.mouth.points.map((pt) => snapToBodyEnvelope(body, v3(pt), 0.995, 0.96, true));
    const w = (plan.mouth.width ?? 0.012) * 0.52;
    mouthLines.push(track(buildTube(pts, pts.map(() => w), { radial: 8 })));
    if (plan.mouth.mirror !== false) {
      mouthLines.push(track(buildTube(pts.map((p) => new THREE.Vector3(p.x, p.y, -p.z)), pts.map(() => w), { radial: 8 })));
    }
    if (plan.mouth.teeth) {
      const { count, size, lower, from = 0.1, to = 0.9, tilt = 0 } = plan.mouth.teeth;
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
      const sides = plan.mouth.mirror !== false ? [1, -1] : [1];
      for (const s of sides) {
        for (let i = 0; i < count; i++) {
          const t = count === 1 ? from : from + ((to - from) * i) / (count - 1);
          const p = snapToBodyEnvelope(body, curve.getPointAt(t), 0.98, 0.92, true);
          p.z *= s;
          const down = new THREE.Vector3(Math.sin(tilt) * -1, -Math.cos(tilt), 0);
          teeth.push(coneMatrix(p.clone().add(new THREE.Vector3(0, size * 0.12, 0)), down, size, size * 0.22));
          if (lower) {
            const up = new THREE.Vector3(0, 1, 0);
            teeth.push(coneMatrix(p.clone().add(new THREE.Vector3(size * 0.08, -size * 0.12, 0)), up, size * 0.68, size * 0.18));
          }
        }
      }
    }
  }

  /* -------------------------------- scutes ----------------------------------- */
  const scutes: THREE.Matrix4[] = [];
  if (plan.scutes) {
    const { from, to, count, rows, size, rowSpread } = plan.scutes;
    for (let i = 0; i < count; i++) {
      const t = from + ((to - from) * i) / (count - 1);
      const f = body.sample(t);
      for (let r = 0; r < rows; r++) {
        const off = rows === 1 ? 0 : (r / (rows - 1) - 0.5) * 2 * rowSpread;
        const pos = f.pos.clone().addScaledVector(f.N, f.ry * 0.92).addScaledVector(f.B, f.rz * off);
        const s = size * (0.75 + 0.35 * Math.sin(t * Math.PI));
        scutes.push(coneMatrix(pos.clone().addScaledVector(f.N, -s * 0.35), f.N, s * 1.15, s * 0.85));
      }
    }
  }

  /* -------------------------------- gill slits -------------------------------- */
  const gillSlits: THREE.Matrix4[] = [];
  if (plan.gillSlits) {
    const g = plan.gillSlits;
    for (let i = 0; i < g.count; i++) {
      for (const s of [1, -1]) {
        const pos = new THREE.Vector3(g.x0 + g.dx * i, g.y, g.z * s);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.25 * s * 0 + 0.3));
        gillSlits.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(0.018, g.height, 0.04)));
      }
    }
  }

  const nostrils: THREE.Vector3[] = [];
  for (const n of plan.nostrils ?? []) {
    const snapped = snapToBodyEnvelope(body, v3(n), 0.94, 0.65, true);
    nostrils.push(snapped);
    nostrils.push(new THREE.Vector3(snapped.x, snapped.y, -snapped.z));
  }
  const nose = plan.nose
    ? { position: snapToBodyEnvelope(body, v3(plan.nose.position), 0.95, 0.5, true), radius: plan.nose.radius }
    : null;

  /* -------------------------------- skeleton --------------------------------- */
  const sk = plan.skeleton;
  const skeleton: BuiltSkeleton = { vertebrae: [], neuralSpines: [], ribs: [], gastralia: [], bones: [], joints: [], plates: [], skull: null, notochord: null, eyeSockets: [] };
  if (sk.type === 'endo' || sk.type === 'cartilage') {
    const spacing = sk.spacing ?? 0.07;
    const [vf, vt] = sk.vertebrae;
    if (vt > vf) {
      const span = (vt - vf) * body.length;
      const count = Math.max(2, Math.floor(span / spacing));
      const sailMap = sk.sailHeights ? sk.sailHeights : null;
      for (let i = 0; i < count; i++) {
        const t = vf + ((vt - vf) * i) / (count - 1);
        const f = body.sample(t);
        const r = Math.max(0.018, Math.min(f.ry, f.rz) * 0.2);
        const q = frameQuaternion(f);
        const axisQ = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
        skeleton.vertebrae.push(new THREE.Matrix4().compose(f.pos.clone(), axisQ, new THREE.Vector3(r, spacing * 0.7, r)));
        let spineH = f.ry * 0.55 * (sk.neuralSpine ?? 0.8);
        if (sailMap) {
          for (const [st, sh] of sailMap) if (Math.abs(st - t) < 0.03) spineH = Math.max(spineH, sh);
        }
        if (spineH > 0.02) {
          const center = f.pos.clone().addScaledVector(f.N, r + spineH / 2);
          skeleton.neuralSpines.push(new THREE.Matrix4().compose(center, q, new THREE.Vector3(r * 0.6, spineH, r * 0.45)));
        }
      }
    }
    if (sk.ribs) {
      const [rf, rt] = sk.ribs;
      const span = (rt - rf) * body.length;
      const count = Math.max(3, Math.floor(span / (spacing * 1.6)));
      for (let i = 0; i < count; i++) {
        const t = rf + ((rt - rf) * i) / (count - 1);
        const f = body.sample(t);
        const q = frameQuaternion(f);
        const pos = f.pos.clone().addScaledVector(f.N, f.ry * 0.05);
        skeleton.ribs.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(f.rz * 0.9, f.ry * 0.92, 1)));
      }
    }
    if (sk.gastralia) {
      const [gf, gt] = sk.gastralia;
      const count = 6;
      for (let i = 0; i < count; i++) {
        const t = gf + ((gt - gf) * i) / (count - 1);
        const f = body.sample(t);
        const q = frameQuaternion(f).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI));
        const pos = f.pos.clone().addScaledVector(f.N, -f.ry * 0.1);
        skeleton.gastralia.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(f.rz * 0.55, f.ry * 0.5, 1)));
      }
    }
    if (sk.skull[1] > sk.skull[0]) {
      skeleton.skull = track(buildSweep(plan.spine, { radial: 28, tubular: 40, segmentation: plan.segmentation, radiusScale: 0.84, tRange: sk.skull }));
    }
    if (sk.notochord) {
      skeleton.notochord = track(buildSweep(plan.spine, { radial: 12, tubular: 60, radiusScale: 0.12, tRange: [sk.skull[1], 0.98] }));
    }
    if (sk.pelvisT) {
      const f = body.sample(sk.pelvisT);
      skeleton.plates.push({ position: f.pos.clone().addScaledVector(f.N, -f.ry * 0.05), scale: new THREE.Vector3(f.rz * 1.05, f.ry * 0.7, f.rz * 0.55), quaternion: frameQuaternion(f) });
    }
    if (sk.scapulaT) {
      const f = body.sample(sk.scapulaT);
      for (const s of [1, -1]) {
        skeleton.plates.push({ position: f.pos.clone().addScaledVector(f.B, s * f.rz * 0.72).addScaledVector(f.N, f.ry * 0.25), scale: new THREE.Vector3(0.05, f.ry * 0.55, f.rz * 0.5), quaternion: frameQuaternion(f) });
      }
    }
    if (sk.keel) {
      const t = ((sk.ribs?.[0] ?? 0.4) + (sk.ribs?.[1] ?? 0.7)) / 2;
      const f = body.sample(t);
      skeleton.plates.push({ position: f.pos.clone().addScaledVector(f.N, -f.ry * 0.8), scale: new THREE.Vector3(0.03, f.ry * 0.5, f.rz * 1.2), quaternion: frameQuaternion(f) });
    }
    for (const limb of limbs) {
      skeleton.bones.push(...limb.bones);
      skeleton.joints.push(...limb.joints);
    }
    for (const legs of sk.internalLegs ?? []) {
      const pts = legs.map(v3);
      for (let i = 0; i < pts.length - 1; i++) skeleton.bones.push({ a: pts[i], b: pts[i + 1], r: 0.03 });
      for (const p of pts) skeleton.joints.push({ position: p, r: 0.04 });
    }
    for (const t of tubes) {
      if (t.spec.bone) {
        const pts = t.tube.points;
        for (let i = 0; i < pts.length - 1; i++) {
          skeleton.bones.push({ a: pts[i], b: pts[i + 1], r: Math.max(0.01, t.spec.radii[Math.min(i, t.spec.radii.length - 1)] * 0.4) });
        }
      }
    }
    for (const fin of fins) {
      for (const [a, b] of fin.rays) skeleton.bones.push({ a, b, r: 0.012 });
    }
    for (const e of eyes) {
      if (e.pupil !== 'compound') skeleton.eyeSockets.push({ position: e.position.clone(), r: e.radius * 1.15 });
    }
  } else if (sk.type === 'none') {
    // soft-bodied: nothing but a beak, rendered by the component
  }

  /* -------------------------------- organs ----------------------------------- */
  const organs: OrganItem[] = [];
  const placeOrgan = (kind: OrganItem['kind'], t: number, nOff: number, bOff: number, sx: number, sy: number, sz: number, label: string, shape: OrganItem['shape'] = 'sphere') => {
    const f = body.sample(t);
    const pos = f.pos.clone().addScaledVector(f.N, f.ry * nOff).addScaledVector(f.B, f.rz * bOff);
    organs.push({ kind, position: pos, scale: new THREE.Vector3(sx, sy, sz), quaternion: frameQuaternion(f), shape, label });
  };
  const o = plan.organs;
  const fh = body.sample(o.heart);
  const hr = Math.min(fh.ry, fh.rz);
  const isOctopus = o.extras?.includes('threeHearts');
  if (!isOctopus) {
    placeOrgan('heart', o.heart, -0.2, 0.12, hr * 0.42, hr * 0.5, hr * 0.42, 'Heart');
  } else {
    placeOrgan('heart', o.heart, 0, 0, hr * 0.3, hr * 0.34, hr * 0.3, 'Systemic Heart');
    placeOrgan('heart', o.heart - 0.06, 0.1, 0.45, hr * 0.17, hr * 0.2, hr * 0.17, 'Branchial Heart');
    placeOrgan('heart', o.heart - 0.06, 0.1, -0.45, hr * 0.17, hr * 0.2, hr * 0.17, 'Branchial Heart');
  }
  const fl = body.sample(o.lungs);
  const lr = Math.min(fl.ry, fl.rz);
  if (o.extras?.includes('gills')) {
    const fg = body.sample(o.lungs - 0.06);
    for (const s of [1, -1]) {
      for (let i = 0; i < 4; i++) {
        const f = body.sample(o.lungs - 0.1 + i * 0.03);
        const pos = f.pos.clone().addScaledVector(f.B, s * f.rz * 0.62).addScaledVector(f.N, -f.ry * 0.1);
        organs.push({ kind: 'gill', position: pos, scale: new THREE.Vector3(f.ry * 0.5, f.ry * 0.5, 1), quaternion: frameQuaternion(f), shape: 'torus', label: 'Gill Arch' });
      }
    }
    void fg;
  } else if (o.extras?.includes('tracheae')) {
    for (const s of [1, -1]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 8; i++) {
        const f = body.sample(0.15 + (0.8 * i) / 8);
        pts.push(f.pos.clone().addScaledVector(f.B, s * f.rz * 0.55));
      }
      const tube = track(buildTube(pts, pts.map(() => 0.012), { radial: 8 }));
      organs.push({ kind: 'trachea', position: tube.pivot.clone(), scale: new THREE.Vector3(1, 1, 1), quaternion: new THREE.Quaternion(), shape: 'tube', tubeGeometry: tube.geometry, label: 'Tracheal Air Tube' });
    }
  } else {
    for (const s of [1, -1]) {
      placeOrgan('lung', o.lungs, 0.1, s * 0.42, lr * 0.36, lr * 0.38, lr * 0.68, 'Lung', 'capsule');
    }
  }
  if (o.extras?.includes('airsacs')) {
    placeOrgan('airsac', o.lungs - 0.12, 0.05, 0, lr * 0.5, lr * 0.3, lr * 0.45, 'Cervical Air Sac', 'capsule');
    placeOrgan('airsac', o.gut + 0.08, 0.1, 0, lr * 0.6, lr * 0.45, lr * 0.5, 'Abdominal Air Sac', 'capsule');
  }
  const fb = body.sample(o.brain);
  const br = Math.min(fb.ry, fb.rz);
  if (isOctopus) {
    placeOrgan('brain', o.brain, 0.1, 0, br * 0.55, br * 0.55, 1, 'Donut-Shaped Brain', 'torus');
  } else {
    placeOrgan('brain', o.brain, 0.35, 0, br * 0.46, br * 0.42, br * 0.55, 'Brain', 'capsule');
  }
  const fgut = body.sample(o.gut);
  const gr = Math.min(fgut.ry, fgut.rz);
  placeOrgan(o.extras?.includes('crop') ? 'crop' : 'stomach', o.gut, -0.22, -0.15, gr * 0.55, gr * 0.45, gr * 0.42, o.extras?.includes('crop') ? 'Gizzard & Crop' : 'Stomach');
  if (o.liver !== undefined) {
    const big = o.extras?.includes('bigLiver');
    const fliv = body.sample(o.liver);
    const lvr = Math.min(fliv.ry, fliv.rz);
    placeOrgan('liver', o.liver, -0.3, 0.2, lvr * (big ? 0.5 : 0.42), lvr * (big ? 0.5 : 0.35), lvr * (big ? 0.95 : 0.5), big ? 'Oil-Filled Liver' : 'Liver', 'capsule');
  }
  {
    const pts: THREE.Vector3[] = [];
    const gutSpan = 0.18;
    for (let i = 0; i <= 10; i++) {
      const t = o.gut - gutSpan * 0.3 + (gutSpan * i) / 10;
      const f = body.sample(Math.min(0.98, t));
      const wob = Math.sin(i * 1.9) * f.rz * 0.35;
      pts.push(f.pos.clone().addScaledVector(f.N, -f.ry * 0.35 + Math.cos(i * 1.3) * f.ry * 0.15).addScaledVector(f.B, wob));
    }
    const tube = track(buildTube(pts, pts.map(() => Math.max(0.02, gr * 0.13)), { radial: 10 }));
    organs.push({ kind: 'intestine', position: tube.pivot.clone(), scale: new THREE.Vector3(1, 1, 1), quaternion: new THREE.Quaternion(), shape: 'tube', tubeGeometry: tube.geometry, label: 'Intestines' });
  }
  if (o.extras?.includes('swimBladder')) placeOrgan('bladder', o.lungs, 0.2, 0, lr * 0.3, lr * 0.3, lr * 0.9, 'Fat-Filled Vestigial Lung', 'capsule');
  if (o.extras?.includes('inkSac')) placeOrgan('inkSac', o.gut + 0.1, -0.2, 0, gr * 0.25, gr * 0.3, gr * 0.25, 'Ink Sac');
  if (o.extras?.includes('dorsalVessel')) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const f = body.sample(0.3 + (0.6 * i) / 8);
      pts.push(f.pos.clone().addScaledVector(f.N, f.ry * 0.55));
    }
    const tube = track(buildTube(pts, pts.map(() => 0.018), { radial: 8 }));
    organs.push({ kind: 'vessel', position: tube.pivot.clone(), scale: new THREE.Vector3(1, 1, 1), quaternion: new THREE.Quaternion(), shape: 'tube', tubeGeometry: tube.geometry, label: 'Tubular Heart (Dorsal Vessel)' });
  }
  if (o.extras?.includes('baleen')) placeOrgan('baleen', 0.1, -0.55, 0, lr * 0.9, lr * 0.25, lr * 0.9, 'Baleen Plates', 'capsule');

  /* -------------------------------- anchors ---------------------------------- */
  const at = (t: number, nOff = 0, bOff = 0) => {
    const f = body.sample(t);
    return f.pos.clone().addScaledVector(f.N, f.ry * nOff).addScaledVector(f.B, f.rz * bOff);
  };
  const firstLimb = (role: LimbSpec['role']) => limbs.find((l) => l.spec.role === role);
  const fore = firstLimb('fore') ?? firstLimb('arm');
  const hind = firstLimb('hind') ?? fore;
  const finOf = (kinds: FinSpec['kind'][]) => fins.find((f) => kinds.includes(f.spec.kind));
  const tubeOf = (kinds: TubeSpec['kind'][]) => tubes.find((t) => kinds.includes(t.spec.kind));
  const midpoint = (pts: THREE.Vector3[]) => pts[Math.floor(pts.length / 2)].clone();
  const skullMid = (sk.skull[0] + sk.skull[1]) / 2;
  const neckT = Math.min(0.98, sk.skull[1] + 0.05);
  const anchors: Record<AnatomyAnchor, THREE.Vector3> = {
    snout: at(0.015, 0.4, 0),
    jaw: at(Math.min(0.12, skullMid), -1.0, 0.2),
    eye: eyes[0] ? eyes[0].position.clone() : at(skullMid, 0.6, 0.8),
    brain: at(o.brain, 0.7, 0),
    ear: finOf(['ear'])?.position.clone() ?? at(sk.skull[1], 1.0, 0.6),
    neck: at(neckT, 0.6, 0.4),
    chest: at(o.heart, 0.2, 0.9),
    heart: at(o.heart, -0.1, 0.4),
    lungs: at(o.lungs, 0.3, 0.6),
    belly: at(o.gut, -0.9, 0.2),
    hips: at(sk.pelvisT ?? 0.72, 0.8, 0.5),
    tail: tubeOf(['tail'])?.tube.points[1]?.clone() ?? at(0.86, 0.5, 0.3),
    tailTip: tubeOf(['tail'])?.endPoint.clone() ?? at(0.98, 0.3, 0),
    dorsal: at(0.45, 1.0, 0),
    flank: at(0.5, 0.1, 1.0),
    forelimb: fore ? midpoint(fore.segments.points) : at(0.35, -0.6, 0.8),
    hindlimb: hind ? midpoint(hind.segments.points) : at(0.7, -0.6, 0.8),
    foot: hind ? hind.segments.points[hind.segments.points.length - 1].clone() : at(0.75, -1.0, 0.6),
    pectoralFin: finOf(['pectoral'])?.position.clone() ?? (fore ? midpoint(fore.segments.points) : at(0.35, -0.4, 1.0)),
    dorsalFin: finOf(['dorsal', 'sail', 'crest'])?.position.clone().add(new THREE.Vector3(0, 0.2, 0)) ?? at(0.45, 1.0, 0),
    caudalFin: finOf(['caudal', 'fluke', 'tailfan'])?.position.clone() ?? at(0.97, 0.5, 0),
    wing: finOf(['wing'])?.position.clone().add(new THREE.Vector3(0, 0, 0.6)) ?? at(0.4, 0.5, 1.0),
    sail: finOf(['sail'])?.position.clone().add(new THREE.Vector3(0, 0.9, 0)) ?? at(0.45, 1.3, 0),
    frill: finOf(['frill'])?.position.clone().add(new THREE.Vector3(-0.1, 0.5, 0)) ?? at(sk.skull[1], 1.2, 0),
    tusk: tubeOf(['tusk'])?.endPoint.clone() ?? at(0.1, -0.5, 0.6),
    horn: tubeOf(['horn'])?.endPoint.clone() ?? at(skullMid, 1.3, 0.3),
    trunk: tubeOf(['trunk'])?.tube.points[2]?.clone() ?? at(0.02, -0.5, 0),
    arms: tubeOf(['arm'])?.tube.points[2]?.clone() ?? (fore ? midpoint(fore.segments.points) : at(0.4, -0.5, 0.8)),
    claws: hind ? hind.segments.points[hind.segments.points.length - 1].clone().add(new THREE.Vector3(0.1, 0, 0)) : at(0.8, -1.0, 0.6),
    gills: plan.gillSlits ? new THREE.Vector3(plan.gillSlits.x0 - plan.gillSlits.dx, plan.gillSlits.y, plan.gillSlits.z) : tubeOf(['gill'])?.endPoint.clone() ?? at(0.22, 0.0, 1.0),
    antenna: tubeOf(['antenna'])?.tube.points[1]?.clone() ?? at(0.02, 0.8, 0.3),
    skull: at(skullMid, 0.9, 0.2),
    spine: at(0.5, 0.95, 0),
    pelvis: at(sk.pelvisT ?? 0.72, 0.6, 0),
    skin: at(0.4, 0.5, 0.95),
    throat: at(neckT, -0.9, 0.2),
  };
  for (const [k, p] of Object.entries(plan.anchors ?? {})) {
    anchors[k as AnatomyAnchor] = v3(p);
  }

  return {
    plan,
    body,
    muscle,
    limbs,
    tubes,
    fins,
    eyes,
    teeth,
    scutes,
    gillSlits,
    nostrils,
    mouthLines,
    nose,
    skeleton,
    organs,
    anchors,
    bounds,
    dispose: () => disposables.forEach((g) => g.dispose()),
  };
}
