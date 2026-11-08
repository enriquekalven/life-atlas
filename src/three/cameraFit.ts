import * as THREE from 'three';
import type { Posture } from './bodyPlans';

/** Default 3/4 studio view direction (from the model centre towards the camera). */
export const FIT_DIR = new THREE.Vector3(0.42, 0.28, 1).normalize();
/**
 * Flyers spread their wings across ±z; seen along the default direction that span collapses into
 * depth and the animal looks tiny. A front-above 3/4 view lays the wingspan across the screen.
 */
export const FLIGHT_FIT_DIR = new THREE.Vector3(1, 0.8, 0.55).normalize();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
/** Nearest sample keeps at least this fraction of the look distance between itself and the camera. */
const MIN_NEAR_FRACTION = 0.35;

export function fitDirectionFor(posture: Posture): THREE.Vector3 {
  return posture === 'flying' ? FLIGHT_FIT_DIR : FIT_DIR;
}

export interface FitFrame {
  /** Point the camera looks at. */
  center: THREE.Vector3;
  /** Distance from `center` to the camera along the view direction. */
  distance: number;
}

function cameraBasis(dir: THREE.Vector3): { right: THREE.Vector3; up: THREE.Vector3 } {
  const right = new THREE.Vector3().crossVectors(WORLD_UP, dir).normalize();
  const up = new THREE.Vector3().crossVectors(dir, right).normalize();
  return { right, up };
}

function boxCorners(bounds: THREE.Box3): Float32Array {
  const out = new Float32Array(24);
  for (let i = 0; i < 8; i++) {
    out[i * 3] = i & 1 ? bounds.max.x : bounds.min.x;
    out[i * 3 + 1] = i & 2 ? bounds.max.y : bounds.min.y;
    out[i * 3 + 2] = i & 4 ? bounds.max.z : bounds.min.z;
  }
  return out;
}

/**
 * Exact perspective fit for a point cloud: a point with camera-plane offsets (px, py) and depth d
 * (towards the camera) is inside the frustum iff distance ≥ d + |px| / tanH and ≥ d + |py| / tanV.
 * The fit is therefore simply the maximum of those terms over all points — no iteration needed.
 * The look-at point is re-centred on the projected silhouette so the subject sits mid-frame,
 * which also lets the camera come closer than a bounding-box fit would allow.
 *
 * @param points  flat xyz world-space samples (≥ 1 point)
 * @param vfov    vertical field of view in radians
 * @param aspect  viewport width / height
 */
export function fitPoints(points: ArrayLike<number>, vfov: number, aspect: number, dir: THREE.Vector3 = FIT_DIR, passes = 6): FitFrame {
  const n = Math.floor(points.length / 3);
  if (n === 0) return { center: new THREE.Vector3(), distance: 1 };
  const tanV = Math.tan(vfov / 2);
  const tanH = tanV * aspect;
  const { right, up } = cameraBasis(dir);

  // Start from the bounding-box centre of the cloud.
  const box = new THREE.Box3();
  const p = new THREE.Vector3();
  for (let i = 0; i < n; i++) box.expandByPoint(p.set(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]));
  const center = box.getCenter(new THREE.Vector3());

  let distance = 0;
  // Fit → re-centre on the projected silhouette → fit again …; each pass is one linear sweep.
  for (let pass = 0; pass < passes; pass++) {
    distance = 0;
    let maxDepth = -Infinity;
    for (let i = 0; i < n; i++) {
      p.set(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]).sub(center);
      const depth = p.dot(dir);
      const px = Math.abs(p.dot(right));
      const py = Math.abs(p.dot(up));
      distance = Math.max(distance, depth + px / tanH, depth + py / tanV);
      maxDepth = Math.max(maxDepth, depth);
    }
    // Perspective sanity: the nearest sample must stay at least MIN_NEAR_FRACTION of the look
    // distance in front of the camera (range = distance − depth ≥ f·distance). Without this the pure
    // frustum criterion lets the camera converge onto the nearest point of an end-on subject.
    if (maxDepth > 0) distance = Math.max(distance, maxDepth / (1 - MIN_NEAR_FRACTION));
    if (pass === passes - 1) break;
    // Find the points that project furthest left/right and bottom/top at this distance, remembering
    // their lateral offset and depth range. Shifting the look-at point perpendicular to `dir` leaves
    // depths unchanged, so the shift `s` that makes the two extremes project symmetrically is exact:
    //   (pxMax - s) / rangeMax = -(pxMin - s) / rangeMin  ⇒  s = (pxMax·rangeMin + pxMin·rangeMax) / (rangeMin + rangeMax)
    // A naive midpoint shift (assuming every point sits at the look-at depth) overshoots and
    // oscillates when the subject is nearly end-on to the camera.
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    let pxAtMin = 0, pxAtMax = 0, rxAtMin = 1, rxAtMax = 1;
    let pyAtMin = 0, pyAtMax = 0, ryAtMin = 1, ryAtMax = 1;
    for (let i = 0; i < n; i++) {
      p.set(points[i * 3], points[i * 3 + 1], points[i * 3 + 2]).sub(center);
      const range = Math.max(1e-6, distance - p.dot(dir));
      const px = p.dot(right);
      const py = p.dot(up);
      const nx = px / (range * tanH);
      const ny = py / (range * tanV);
      if (nx < xMin) { xMin = nx; pxAtMin = px; rxAtMin = range; }
      if (nx > xMax) { xMax = nx; pxAtMax = px; rxAtMax = range; }
      if (ny < yMin) { yMin = ny; pyAtMin = py; ryAtMin = range; }
      if (ny > yMax) { yMax = ny; pyAtMax = py; ryAtMax = range; }
    }
    const sx = (pxAtMax * rxAtMin + pxAtMin * rxAtMax) / (rxAtMin + rxAtMax);
    const sy = (pyAtMax * ryAtMin + pyAtMin * ryAtMax) / (ryAtMin + ryAtMax);
    center.addScaledVector(right, sx);
    center.addScaledVector(up, sy);
  }
  return { center, distance };
}

/**
 * Bounding-box variant (used when only bounds are known, e.g. for glTF assets): identical to
 * fitting the 8 box corners.
 */
export function fitDistance(bounds: THREE.Box3, center: THREE.Vector3, vfov: number, aspect: number, dir: THREE.Vector3 = FIT_DIR): number {
  const tanV = Math.tan(vfov / 2);
  const tanH = tanV * aspect;
  const { right, up } = cameraBasis(dir);
  const corners = boxCorners(bounds);
  const p = new THREE.Vector3();
  let dist = 0;
  let maxDepth = -Infinity;
  for (let i = 0; i < 8; i++) {
    p.set(corners[i * 3], corners[i * 3 + 1], corners[i * 3 + 2]).sub(center);
    const depth = p.dot(dir);
    dist = Math.max(dist, depth + Math.abs(p.dot(right)) / tanH, depth + Math.abs(p.dot(up)) / tanV);
    maxDepth = Math.max(maxDepth, depth);
  }
  if (maxDepth > 0) dist = Math.max(dist, maxDepth / (1 - MIN_NEAR_FRACTION));
  return dist;
}

/** Breathing room applied by the studio: tight 8 % centerpiece margin, clamped to orbit range. */
export function withStudioMargin(distance: number): number {
  return THREE.MathUtils.clamp(distance * 1.08 + 0.1, 1.22, 14);
}

/** Studio framing from either a sampled silhouette (preferred) or plain bounds. */
export function studioFrame(
  bounds: THREE.Box3,
  points: ArrayLike<number> | null,
  vfov: number,
  aspect: number,
  dir: THREE.Vector3 = FIT_DIR,
): FitFrame {
  if (points && points.length >= 3) {
    const f = fitPoints(points, vfov, aspect, dir);
    return { center: f.center, distance: withStudioMargin(f.distance) };
  }
  const center = bounds.getCenter(new THREE.Vector3());
  return { center, distance: withStudioMargin(fitDistance(bounds, center, vfov, aspect, dir)) };
}

/** Kept for callers that only need a distance from bounds. */
export function studioFitDistance(bounds: THREE.Box3, center: THREE.Vector3, vfov: number, aspect: number, dir: THREE.Vector3 = FIT_DIR): number {
  return withStudioMargin(fitDistance(bounds, center, vfov, aspect, dir));
}
