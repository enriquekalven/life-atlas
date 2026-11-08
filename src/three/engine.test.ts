import { describe, expect, it } from 'vitest';
import { CURATED_ANIMALS } from '../data/animals';
import { ARCHETYPES_WITH_PLANS, getBodyPlan } from './bodyPlans';
import { buildModel } from './modelBuilder';
import { buildSweep, buildTube, buildFin, monotoneCubic } from './sweep';
import { resolveAnchor } from './anchors';
import { FIT_DIR, FLIGHT_FIT_DIR, fitDistance, fitPoints, studioFitDistance } from './cameraFit';
import { sampleWorldPoints } from './sampling';
import * as THREE from 'three';

function hasNaN(geometry: THREE.BufferGeometry): boolean {
  const arr = geometry.getAttribute('position').array as ArrayLike<number>;
  for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) return true;
  return false;
}

describe('Spine-sweep geometry engine', () => {
  it('monotone cubic interpolation never overshoots station radii', () => {
    const f = monotoneCubic([0, 0.3, 0.6, 1], [0.1, 0.5, 0.5, 0.05]);
    for (let x = 0; x <= 1; x += 0.01) {
      expect(f(x)).toBeGreaterThanOrEqual(0.05 - 1e-9);
      expect(f(x)).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  it('builds a closed, finite swept body with UVs and per-vertex arc fractions', () => {
    const res = buildSweep([
      { x: 1, y: 0, ry: 0.05, rz: 0.05 },
      { x: 0, y: 0, ry: 0.4, rz: 0.3 },
      { x: -1, y: 0, ry: 0.05, rz: 0.05 },
    ], { radial: 12, tubular: 20 });
    expect(hasNaN(res.geometry)).toBe(false);
    expect(res.geometry.getAttribute('uv')).toBeDefined();
    expect(res.tValues[0]).toBeCloseTo(0, 5);
    expect(res.geometry.index!.count).toBeGreaterThan(0);
    const widest = res.sample(0.5);
    expect(widest.ry).toBeGreaterThan(0.3);
  });

  it('builds tubes pivoted at their first point and lens-shaped fins', () => {
    const tube = buildTube([new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 1, 1), new THREE.Vector3(3, 0, 1)], [0.1, 0.08, 0.02]);
    expect(tube.pivot.x).toBe(1);
    expect(hasNaN(tube.geometry)).toBe(false);
    const fin = buildFin([[0, 0], [0.5, 0.6], [1, 0.2], [0.6, -0.2]], 0.03);
    expect(hasNaN(fin)).toBe(false);
    expect(fin.boundingBox!.max.x).toBeGreaterThan(0.9);
  });
});

describe('Body plans & model assembly', () => {
  it('every curated species builds a finite multi-layer model with anchors', () => {
    for (const animal of CURATED_ANIMALS) {
      const plan = getBodyPlan(animal);
      const model = buildModel(plan);
      expect(hasNaN(model.body.geometry), `${animal.id} body`).toBe(false);
      expect(hasNaN(model.muscle.geometry), `${animal.id} muscle`).toBe(false);
      expect(model.bounds.isEmpty(), `${animal.id} bounds`).toBe(false);
      expect(model.organs.length, `${animal.id} organs`).toBeGreaterThanOrEqual(3);
      for (const [name, p] of Object.entries(model.anchors)) {
        expect(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z), `${animal.id} anchor ${name}`).toBe(true);
      }
      if (plan.skeleton.type === 'endo') {
        expect(model.skeleton.vertebrae.length, `${animal.id} vertebrae`).toBeGreaterThan(4);
      }
      model.dispose();
    }
  });

  it('every archetype has a fallback plan for live GBIF/PBDB species', () => {
    for (const archetype of ARCHETYPES_WITH_PLANS) {
      const plan = getBodyPlan({ id: `synthetic-${archetype}`, archetype, visualPalette: CURATED_ANIMALS[0].visualPalette });
      expect(plan.spine.length).toBeGreaterThan(4);
    }
  });

  it('resolves every curated hotspot to an anchor that exists on its model', () => {
    for (const animal of CURATED_ANIMALS) {
      const model = buildModel(getBodyPlan(animal));
      for (const h of animal.anatomyHotspots) {
        const anchor = resolveAnchor(h);
        expect(model.anchors[anchor], `${animal.id}/${h.id} → ${anchor}`).toBeDefined();
      }
      model.dispose();
    }
  });
});

describe('Studio camera auto-fit', () => {
  const project = (bounds: THREE.Box3, aspect: number, fovDeg = 42) => {
    const center = bounds.getCenter(new THREE.Vector3());
    const vfov = THREE.MathUtils.degToRad(fovDeg);
    const dist = fitDistance(bounds, center, vfov, aspect);
    const camera = new THREE.PerspectiveCamera(fovDeg, aspect, 0.05, 100);
    camera.position.copy(center).addScaledVector(FIT_DIR, dist);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const ndc: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      ndc.push(new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).project(camera));
    }
    return { dist, ndc };
  };

  const shapes: Record<string, THREE.Box3> = {
    long: new THREE.Box3(new THREE.Vector3(-1.6, -1, -0.3), new THREE.Vector3(1.6, 0.2, 0.3)),
    tall: new THREE.Box3(new THREE.Vector3(-1.2, -1, -0.4), new THREE.Vector3(1.4, 2.6, 0.4)),
    winged: new THREE.Box3(new THREE.Vector3(-0.5, -0.2, -1.8), new THREE.Vector3(0.6, 0.3, 1.8)),
    tiny: new THREE.Box3(new THREE.Vector3(-0.2, -0.1, -0.1), new THREE.Vector3(0.2, 0.1, 0.1)),
  };

  it('keeps every bounding-box corner inside the frustum and leaves no slack on the tight axis', () => {
    for (const aspect of [0.8, 1.7, 2.4]) {
      for (const [name, box] of Object.entries(shapes)) {
        const { ndc } = project(box, aspect);
        let maxExtent = 0;
        for (const p of ndc) {
          expect(Math.abs(p.x), `${name}@${aspect} x`).toBeLessThanOrEqual(1 + 1e-3);
          expect(Math.abs(p.y), `${name}@${aspect} y`).toBeLessThanOrEqual(1 + 1e-3);
          maxExtent = Math.max(maxExtent, Math.abs(p.x), Math.abs(p.y));
        }
        // Tight fit: some corner must sit on (or extremely near) a frame edge.
        expect(maxExtent, `${name}@${aspect} tight`).toBeGreaterThan(0.98);
      }
    }
  });

  it('frames every curated species within the orbit-control distance range', () => {
    const vfov = THREE.MathUtils.degToRad(42);
    for (const animal of CURATED_ANIMALS) {
      const model = buildModel(getBodyPlan(animal));
      const center = model.bounds.getCenter(new THREE.Vector3());
      const dist = studioFitDistance(model.bounds, center, vfov, 1.7);
      expect(dist, animal.id).toBeGreaterThanOrEqual(1.2);
      expect(dist, animal.id).toBeLessThan(12);
      model.dispose();
    }
  });

  it('point-cloud fit keeps every sample in frame, centred, tight when oblique, and sane when end-on', () => {
    // A thin diagonal rod: its bounding box is mostly empty space, so a box fit is far too loose.
    const pts: number[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      pts.push(-1.5 + 3 * t, -0.8 + 1.6 * t, -0.4 + 0.8 * t);
    }
    const cloud = new Float32Array(pts);
    const fovDeg = 42;
    const aspect = 1.7;
    const vfov = THREE.MathUtils.degToRad(fovDeg);
    for (const dir of [FIT_DIR, FLIGHT_FIT_DIR]) {
      const frame = fitPoints(cloud, vfov, aspect, dir);
      const camera = new THREE.PerspectiveCamera(fovDeg, aspect, 0.05, 100);
      camera.position.copy(frame.center).addScaledVector(dir, frame.distance);
      camera.lookAt(frame.center);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      let nearest = Infinity;
      for (let i = 0; i < cloud.length; i += 3) {
        const w = new THREE.Vector3(cloud[i], cloud[i + 1], cloud[i + 2]);
        nearest = Math.min(nearest, w.distanceTo(camera.position));
        const p = w.project(camera);
        xMin = Math.min(xMin, p.x); xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y); yMax = Math.max(yMax, p.y);
      }
      expect(Math.max(-xMin, xMax, -yMin, yMax)).toBeLessThanOrEqual(1 + 1e-3); // all inside
      // Re-centred: the silhouette midpoint sits close to the frame centre on both axes.
      expect(Math.abs((xMin + xMax) / 2)).toBeLessThan(0.08);
      expect(Math.abs((yMin + yMax) / 2)).toBeLessThan(0.08);
      // Perspective sanity: the camera never sits right on top of the nearest sample.
      expect(nearest).toBeGreaterThan(0.3 * frame.distance);
      if (dir === FIT_DIR) {
        // Oblique view: tight on one edge and strictly closer than framing the (mostly empty) box.
        expect(Math.max(-xMin, xMax, -yMin, yMax)).toBeGreaterThan(0.98);
        const box = new THREE.Box3().setFromArray(cloud);
        const boxDist = fitDistance(box, box.getCenter(new THREE.Vector3()), vfov, aspect, dir);
        expect(frame.distance).toBeLessThan(boxDist * 0.9);
      }
    }
  });

  it('samples world-space points from transformed and mirrored meshes', () => {
    const root = new THREE.Group();
    root.position.set(0, 2, 0);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    mesh.position.set(0, 0, 3); // one box at z=+3
    const mirror = new THREE.Group();
    mirror.scale.set(1, 1, -1); // and its mirror at z=-3
    mirror.add(mesh.clone());
    root.add(mesh, mirror);
    const pts = sampleWorldPoints(root, 50);
    expect(pts.length).toBeGreaterThan(0);
    const box = new THREE.Box3().setFromArray(pts);
    expect(box.min.z).toBeCloseTo(-3.5, 5);
    expect(box.max.z).toBeCloseTo(3.5, 5);
    expect(box.min.y).toBeCloseTo(1.5, 5); // root offset applied
    expect(box.max.y).toBeCloseTo(2.5, 5);
  });
});
