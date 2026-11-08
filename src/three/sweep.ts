import * as THREE from 'three';

/**
 * Spine-sweep geometry engine.
 *
 * A body is described as a list of cross-section "stations" along a spine
 * curve (elliptical radius ry = vertical, rz = lateral). The curve is swept
 * with twist-free parallel-transport frames, producing one continuous,
 * organic mesh (head → neck → torso → tail) instead of stacked primitives.
 */

export interface Station {
  x: number;
  y: number;
  z?: number;
  /** Vertical (normal-axis) half thickness. */
  ry: number;
  /** Lateral (binormal-axis) half thickness. */
  rz: number;
}

export interface Segmentation {
  from: number;
  to: number;
  frequency: number;
  depth: number;
}

export interface SweepOptions {
  radial?: number;
  tubular?: number;
  segmentation?: Segmentation;
  radiusScale?: number;
  /** Constant added to every radius (fur shells, muscle insets). */
  radiusOffset?: number;
  /** Sweep only this sub-range of the spine (e.g. the skull region). */
  tRange?: [number, number];
  minRadius?: number;
  /** Multiplier for the along-body UV (keeps texture density consistent on short tubes). */
  vScale?: number;
}

export interface SpineSample {
  pos: THREE.Vector3;
  T: THREE.Vector3;
  N: THREE.Vector3;
  B: THREE.Vector3;
  ry: number;
  rz: number;
  t: number;
}

export interface SweepResult {
  geometry: THREE.BufferGeometry;
  /** Sample the spine frame at arc fraction t ∈ [0,1]. */
  sample: (t: number) => SpineSample;
  frames: SpineSample[];
  length: number;
  radial: number;
  tubular: number;
  /** Per-vertex base positions / spine axis points / arc fraction (for animation). */
  basePositions: Float32Array;
  axisPositions: Float32Array;
  tValues: Float32Array;
}

/** Fritsch–Carlson monotone cubic interpolation (no radius overshoot). */
export function monotoneCubic(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;
  if (n === 1) return () => ys[0];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = xs[i + 1] - xs[i];
    d.push(h > 1e-9 ? (ys[i + 1] - ys[i]) / h : 0);
  }
  const m: number[] = [d[0]];
  for (let i = 1; i < n - 1; i++) {
    m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  }
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      m[i] = tau * a * d[i];
      m[i + 1] = tau * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1];
  };
}

export function buildSweep(stations: Station[], opts: SweepOptions = {}): SweepResult {
  const radial = opts.radial ?? 36;
  const tubular = opts.tubular ?? 96;
  const radiusScale = opts.radiusScale ?? 1;
  const minRadius = opts.minRadius ?? 0.004;
  const [t0, t1] = opts.tRange ?? [0, 1];

  const pts = stations.map((s) => new THREE.Vector3(s.x, s.y, s.z ?? 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);

  // Arc fraction of each station (chord-length approximation).
  const fr: number[] = [0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += pts[i].distanceTo(pts[i - 1]);
    fr.push(acc);
  }
  const total = acc || 1;
  for (let i = 0; i < fr.length; i++) fr[i] /= total;
  const ryF = monotoneCubic(fr, stations.map((s) => s.ry));
  const rzF = monotoneCubic(fr, stations.map((s) => s.rz));

  const segMod = (t: number): number => {
    const s = opts.segmentation;
    if (!s || t < s.from || t > s.to) return 1;
    const ph = ((t - s.from) / (s.to - s.from)) * s.frequency * Math.PI * 2;
    const g = 0.5 - 0.5 * Math.cos(ph);
    return 1 - s.depth * g * g * g;
  };

  // Parallel-transport frames.
  const M = tubular;
  const frames: SpineSample[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  let prevN: THREE.Vector3 | null = null;
  for (let i = 0; i <= M; i++) {
    const t = t0 + (t1 - t0) * (i / M);
    const tc = Math.min(Math.max(t, 0), 1);
    const pos = curve.getPointAt(tc);
    const T = curve.getTangentAt(tc).normalize();
    let N: THREE.Vector3;
    if (!prevN) {
      const refUp = Math.abs(up.dot(T)) > 0.85 ? new THREE.Vector3(1, 0, 0) : up;
      N = refUp.clone().sub(T.clone().multiplyScalar(refUp.dot(T)));
      if (N.lengthSq() < 1e-6) {
        N = new THREE.Vector3(0, 0, 1).sub(T.clone().multiplyScalar(T.z));
      }
      N.normalize();
    } else {
      N = prevN.clone().sub(T.clone().multiplyScalar(prevN.dot(T)));
      if (N.lengthSq() < 1e-8) N = prevN.clone();
      N.normalize();
    }
    prevN = N;
    const B = new THREE.Vector3().crossVectors(T, N).normalize();
    const mod = segMod(t);
    const off = opts.radiusOffset ?? 0;
    let ry = Math.max(minRadius, ryF(tc) * radiusScale * mod + off);
    let rz = Math.max(minRadius, rzF(tc) * radiusScale * mod + off);
    // Smooth ellipsoidal dome taper on first/last rings so snouts and tail tips never look flat-cut
    if (M >= 12) {
      if (t0 === 0 && i < 3) {
        const dome = i === 0 ? 0.56 : i === 1 ? 0.82 : 0.94;
        ry = Math.max(minRadius, ry * dome);
        rz = Math.max(minRadius, rz * dome);
      } else if (t1 === 1 && i > M - 3) {
        const rem = M - i;
        const dome = rem === 0 ? 0.54 : rem === 1 ? 0.80 : 0.93;
        ry = Math.max(minRadius, ry * dome);
        rz = Math.max(minRadius, rz * dome);
      }
    }
    frames.push({
      pos,
      T,
      N,
      B,
      ry,
      rz,
      t,
    });
  }

  const ringCount = M + 1;
  const ringVerts = radial + 1;
  const vertCount = ringCount * ringVerts + 2;
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const axis = new Float32Array(vertCount * 3);
  const tValues = new Float32Array(vertCount);

  let vi = 0;
  const sculptBody = radial >= 20;
  for (let i = 0; i < ringCount; i++) {
    const f = frames[i];
    const isHeadZone = sculptBody ? Math.max(0, 1 - Math.abs(f.t - 0.11) / 0.11) : 0;
    const isNeckZone = sculptBody ? Math.max(0, 1 - Math.abs(f.t - 0.22) / 0.08) : 0;
    const isThoraxZone = sculptBody ? Math.max(0, 1 - Math.abs(f.t - 0.44) / 0.26) : 0;
    const isGirdleZone = sculptBody
      ? Math.max(
          0,
          Math.exp(-Math.pow((f.t - 0.30) / 0.075, 2)) +
            Math.exp(-Math.pow((f.t - 0.62) / 0.075, 2))
        )
      : 0;
    for (let j = 0; j < ringVerts; j++) {
      const th = (j / radial) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      let ryMod = 1;
      let rzMod = 1;
      if (sculptBody) {
        // Ventral jaw / sternum / belly flattening with subtle sternal keel
        if (c < -0.3) {
          ryMod *= 1.0 - 0.065 * Math.pow((-c - 0.3) / 0.7, 1.25);
        }
        // Dorsal vertebral spinous process ridge + paraspinal muscle gutters
        if (c > 0.72) {
          const ridge = Math.exp(-Math.pow(s / 0.16, 2)) * 0.038;
          const gutter = Math.exp(-Math.pow((Math.abs(s) - 0.28) / 0.14, 2)) * -0.018;
          ryMod += (ridge + gutter) * (0.4 + 0.6 * isThoraxZone);
        }
        // Cranial brow ridge + zygomatic cheek arch in head zone
        if (isHeadZone > 0.01) {
          const brow = c > 0.22 && Math.abs(s) > 0.35 ? Math.sin((c - 0.22) * 2.2) * Math.abs(s) : 0;
          const cheek = Math.abs(s) > 0.55 && Math.abs(c) < 0.45 ? (Math.abs(s) - 0.55) * 1.65 : 0;
          ryMod += isHeadZone * brow * 0.06;
          rzMod += isHeadZone * (brow * 0.055 + cheek * 0.06);
        }
        // Cervical sternocleidomastoid / nuchal ligament taper
        if (isNeckZone > 0.01) {
          rzMod *= 1.0 - isNeckZone * 0.035 * (1.0 - Math.abs(c));
        }
        // Thoracic epaxial muscle ridges & lateral ribcage barrel fullness
        if (isThoraxZone > 0.01) {
          const epaxial = c > 0.58 ? Math.sin(Math.abs(s) * Math.PI * 1.4) * 0.042 : 0;
          const ribBarrel = Math.exp(-Math.pow((c - 0.05) / 0.55, 2)) * 0.048;
          ryMod += isThoraxZone * epaxial;
          rzMod += isThoraxZone * ribBarrel;
        }
        // Shoulder (scapular/deltoid) & hip (gluteal/biceps femoris) muscular definition
        if (isGirdleZone > 0.01 && Math.abs(s) > 0.42 && c > -0.48 && c < 0.68) {
          rzMod += isGirdleZone * 0.068 * Math.abs(s);
          ryMod += isGirdleZone * 0.032 * Math.max(0, c);
        }
      }
      const effRy = f.ry * ryMod;
      const effRz = f.rz * rzMod;
      positions[vi * 3] = f.pos.x + f.N.x * effRy * c + f.B.x * effRz * s;
      positions[vi * 3 + 1] = f.pos.y + f.N.y * effRy * c + f.B.y * effRz * s;
      positions[vi * 3 + 2] = f.pos.z + f.N.z * effRy * c + f.B.z * effRz * s;
      uvs[vi * 2] = j / radial;
      uvs[vi * 2 + 1] = f.t * (opts.vScale ?? 1);
      axis[vi * 3] = f.pos.x;
      axis[vi * 3 + 1] = f.pos.y;
      axis[vi * 3 + 2] = f.pos.z;
      tValues[vi] = f.t;
      vi++;
    }
  }
  const frontPole = vi;
  {
    const f = frames[0];
    const domeOut = Math.min(f.ry, f.rz) * 0.38;
    const pX = f.pos.x - f.T.x * domeOut;
    const pY = f.pos.y - f.T.y * domeOut;
    const pZ = f.pos.z - f.T.z * domeOut;
    positions.set([pX, pY, pZ], vi * 3);
    uvs.set([0.5, f.t], vi * 2);
    axis.set([f.pos.x, f.pos.y, f.pos.z], vi * 3);
    tValues[vi] = f.t;
    vi++;
  }
  const backPole = vi;
  {
    const f = frames[M];
    const domeOut = Math.min(f.ry, f.rz) * 0.38;
    const pX = f.pos.x + f.T.x * domeOut;
    const pY = f.pos.y + f.T.y * domeOut;
    const pZ = f.pos.z + f.T.z * domeOut;
    positions.set([pX, pY, pZ], vi * 3);
    uvs.set([0.5, f.t], vi * 2);
    axis.set([f.pos.x, f.pos.y, f.pos.z], vi * 3);
    tValues[vi] = f.t;
    vi++;
  }

  const idx: number[] = [];
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * ringVerts + j;
      const b = a + ringVerts;
      const c = b + 1;
      const d = a + 1;
      idx.push(a, d, b, b, d, c);
    }
  }
  for (let j = 0; j < radial; j++) {
    idx.push(frontPole, j + 1, j);
    const a = M * ringVerts + j;
    idx.push(backPole, a, a + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(idx);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const sample = (t: number): SpineSample => {
    const u = (Math.min(Math.max(t, t0), t1) - t0) / (t1 - t0 || 1);
    const i = Math.round(u * M);
    return frames[Math.min(M, Math.max(0, i))];
  };

  return {
    geometry,
    sample,
    frames,
    length: total,
    radial,
    tubular,
    basePositions: positions.slice(),
    axisPositions: axis,
    tValues,
  };
}

export interface TubeBuild {
  geometry: THREE.BufferGeometry;
  /** World-space pivot (first point). Geometry is built relative to it. */
  pivot: THREE.Vector3;
  points: THREE.Vector3[];
  radii: number[];
  sample: (t: number) => SpineSample;
}

/** Tapered tube along a 3D polyline; geometry origin = first point (so it can pivot). */
export function buildTube(
  points: THREE.Vector3[],
  radii: number[],
  opts: { radial?: number; tubularPerPoint?: number } = {}
): TubeBuild {
  const stations: Station[] = points.map((p, i) => ({
    x: p.x,
    y: p.y,
    z: p.z,
    ry: radii[Math.min(i, radii.length - 1)],
    rz: radii[Math.min(i, radii.length - 1)],
  }));
  let chord = 0;
  for (let i = 1; i < points.length; i++) chord += points[i].distanceTo(points[i - 1]);
  const res = buildSweep(stations, {
    radial: opts.radial ?? 14,
    tubular: Math.max(8, points.length * (opts.tubularPerPoint ?? 8)),
    vScale: Math.min(1, Math.max(0.06, chord / 3.2)),
  });
  const pivot = points[0].clone();
  res.geometry.translate(-pivot.x, -pivot.y, -pivot.z);
  res.geometry.computeBoundingBox();
  return { geometry: res.geometry, pivot, points, radii, sample: res.sample };
}

/** Lens-shaped fin / wing / ear / frill plate from a 2D outline. */
export function buildFin(
  outline: [number, number][],
  thickness: number,
  smooth = true
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(outline[0][0], outline[0][1]);
  if (smooth) {
    const pts = outline.slice(1).map((p) => new THREE.Vector2(p[0], p[1]));
    pts.push(new THREE.Vector2(outline[0][0], outline[0][1]));
    shape.splineThru(pts);
  } else {
    for (let i = 1; i < outline.length; i++) shape.lineTo(outline[i][0], outline[i][1]);
    shape.closePath();
  }
  const depth = Math.max(0.002, thickness * 0.4);
  const bevel = Math.max(0.001, thickness * 0.3);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 14,
    steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}

export function v3(p: [number, number, number] | number[]): THREE.Vector3 {
  return new THREE.Vector3(p[0], p[1], p[2] ?? 0);
}

export function mirrorZ(p: THREE.Vector3): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, -p.z);
}
