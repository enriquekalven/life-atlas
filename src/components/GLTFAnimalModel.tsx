import React, { useEffect, useMemo, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { ModelAsset } from '../data/modelManifest';
import { computeSkinnedBox3, sampleWorldPoints } from '../three/sampling';

interface GLTFAnimalModelProps {
  asset: ModelAsset;
  isAnimating: boolean;
  ghosted: boolean;
  onMeasured?: (bounds: THREE.Box3, groundOffset: number, silhouette?: Float32Array) => void;
}

const SMOOTHED_GEOMETRIES = new WeakSet<THREE.BufferGeometry>();
let cachedBearFeatheredMap: THREE.CanvasTexture | null = null;
let cachedArmorNormalMap: THREE.CanvasTexture | null = null;

/**
 * Feathers the two unblended dark rectangular UV cutout boxes on `bear.glb`
 * (nose cutout around x:[168..264], y:[832..918] and eye cutout around x:[270..324], y:[812..868])
 * so Polar Bear's snout and orbital fur transition smoothly into warm Arctic ivory
 * while preserving the dark central rhinarium pad and eyelid margin.
 */
function getFeatheredPolarBearMap(sourceTex: THREE.Texture): THREE.Texture {
  if (cachedBearFeatheredMap) return cachedBearFeatheredMap;
  if (typeof document === 'undefined') return sourceTex;
  const img = sourceTex.image as (CanvasImageSource & { width?: number; height?: number }) | undefined;
  const w = img?.width ?? 0;
  const h = img?.height ?? 0;
  if (!img || w < 256 || h < 256) return sourceTex;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceTex;

  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const sx = w / 1024;
  const sy = h / 1024;

  const blendPatch = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    cx: number,
    cy: number,
    keepRx: number,
    keepRy: number
  ) => {
    const px0 = Math.max(0, Math.floor(x0 * sx));
    const py0 = Math.max(0, Math.floor(y0 * sy));
    const px1 = Math.min(w - 1, Math.ceil(x1 * sx));
    const py1 = Math.min(h - 1, Math.ceil(y1 * sy));
    const pcx = cx * sx;
    const pcy = cy * sy;
    const prx = keepRx * sx;
    const pry = keepRy * sy;

    for (let y = py0; y <= py1; y++) {
      for (let x = px0; x <= px1; x++) {
        const idx = (y * w + x) * 4;
        const r = px[idx];
        const g = px[idx + 1];
        const b = px[idx + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        if (lum > 185) continue;
        const ellDist = Math.hypot((x - pcx) / prx, (y - pcy) / pry);
        // Keep central nose/eye core dark (ellDist < 0.52), smoothly feather outward to warm ivory (#ded8cb)
        const t = Math.max(0, Math.min(1, (ellDist - 0.48) / 0.55));
        const smooth = t * t * (3 - 2 * t);
        px[idx] = Math.round(r + (222 - r) * smooth);
        px[idx + 1] = Math.round(g + (216 - g) * smooth);
        px[idx + 2] = Math.round(b + (203 - b) * smooth);
      }
    }
  };

  // Patch 1: Rectangular dark snout/nose cutout box
  blendPatch(166, 830, 266, 920, 216, 875, 24, 21);
  // Patch 2: Rectangular dark eye-surround cutout box
  blendPatch(268, 810, 326, 870, 296, 840, 11, 10);

  ctx.putImageData(data, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = sourceTex.flipY;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = sourceTex.wrapS;
  tex.wrapT = sourceTex.wrapT;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cachedBearFeatheredMap = tex;
  return tex;
}

/**
 * Synthesizes a procedural pitted dermal-bone & fine placoderm tubercle normal map
 * for untextured paleo-osteology models such as `dunkleosteus.glb`.
 */
function getOrCreateDermalArmorNormalMap(): THREE.CanvasTexture | null {
  if (cachedArmorNormalMap) return cachedArmorNormalMap;
  if (typeof document === 'undefined') return null;
  const size = 256;
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      const pits =
        Math.sin(u * 13 + Math.cos(v * 7)) * 0.35 +
        Math.cos(v * 17 - Math.sin(u * 11)) * 0.35 +
        Math.sin((u + v) * 29) * 0.18 +
        Math.cos((u - v) * 43) * 0.12;
      height[y * size + x] = pits;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    const yu = (y - 1 + size) % size;
    const yd = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xl = (x - 1 + size) % size;
      const xr = (x + 1) % size;
      const dx = (height[y * size + xr] - height[y * size + xl]) * 1.8;
      const dy = (height[yd * size + x] - height[yu * size + x]) * 1.8;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      img.data[i + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      img.data[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.needsUpdate = true;
  cachedArmorNormalMap = tex;
  return tex;
}

/**
 * Prevents root-motion animation tracks (such as Bone_00.position in turtle.glb)
 * from translating the animal out of the camera viewport while preserving in-place limb/fin motion.
 */
function sanitizeInPlaceClips(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  return clips.map((clip) => {
    const cloned = clip.clone();
    cloned.tracks.forEach((track) => {
      if (!track.name.endsWith('.position')) return;
      const vals = track.values;
      if (vals.length < 6) return;
      const x0 = vals[0];
      const y0 = vals[1];
      const z0 = vals[2];
      let maxDrift = 0;
      for (let i = 3; i < vals.length; i += 3) {
        const d = Math.hypot(vals[i] - x0, vals[i + 1] - y0, vals[i + 2] - z0);
        if (d > maxDrift) maxDrift = d;
      }
      // If a bone translates more than 0.6 units in local space, lock it to its initial pose
      if (maxDrift > 0.6) {
        for (let i = 3; i < vals.length; i += 3) {
          vals[i] = x0;
          vals[i + 1] = y0;
          vals[i + 2] = z0;
        }
      }
    });
    return cloned;
  });
}

/**
 * Welds vertex normals across duplicate/split UV seam vertices that share the
 * same 3D position so photogrammetry and museum scans (e.g., tiger.glb, bear.glb,
 * dunkleosteus.glb) render with silky-smooth organic shading rather than faceted triangles.
 */
function ensureSmoothWeldedNormals(geometry: THREE.BufferGeometry): void {
  if (SMOOTHED_GEOMETRIES.has(geometry)) return;
  const posAttr = geometry.attributes.position as THREE.BufferAttribute | undefined;
  if (!posAttr || posAttr.count < 3) return;

  // Skip quantized (KHR_mesh_quantization Int16Array/Uint16Array), interleaved, or ultra-dense (>50k)
  // meshes such as frog.glb (660k quantized verts) and ichthyosaur.glb, which already ship smooth normals
  // and would otherwise corrupt quantized normals or stall main-thread Suspense mount.
  if (
    (posAttr as unknown as THREE.InterleavedBufferAttribute).isInterleavedBufferAttribute ||
    !(posAttr.array instanceof Float32Array) ||
    posAttr.count > 50_000
  ) {
    SMOOTHED_GEOMETRIES.add(geometry);
    return;
  }

  // Always recompute face-weighted vertex normals first, then average by spatial position key
  geometry.computeVertexNormals();
  const normAttr = geometry.attributes.normal as THREE.BufferAttribute | undefined;
  if (!normAttr) return;

  const count = posAttr.count;
  // Quantize to ~1/2000th of bounding extent so shared vertices across UV seams merge cleanly
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  const extent = bb
    ? Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z, 1e-4)
    : 1;
  const invStep = 2500 / extent;

  const accum = new Map<string, [number, number, number]>();
  const keys = new Array<string>(count);

  for (let i = 0; i < count; i++) {
    const qx = Math.round(posAttr.getX(i) * invStep);
    const qy = Math.round(posAttr.getY(i) * invStep);
    const qz = Math.round(posAttr.getZ(i) * invStep);
    const key = `${qx},${qy},${qz}`;
    keys[i] = key;
    const nx = normAttr.getX(i);
    const ny = normAttr.getY(i);
    const nz = normAttr.getZ(i);
    const existing = accum.get(key);
    if (existing) {
      existing[0] += nx;
      existing[1] += ny;
      existing[2] += nz;
    } else {
      accum.set(key, [nx, ny, nz]);
    }
  }

  for (let i = 0; i < count; i++) {
    const sum = accum.get(keys[i])!;
    const len = Math.hypot(sum[0], sum[1], sum[2]) || 1;
    normAttr.setXYZ(i, sum[0] / len, sum[1] / len, sum[2] / len);
  }
  normAttr.needsUpdate = true;
  SMOOTHED_GEOMETRIES.add(geometry);
}

/**
 * Loads a photoreal glTF from the same-origin /models folder, normalises it to
 * the atlas' world scale (≈3.2 units long, feet on the ground plane) and loops
 * its idle animation (or applies subtle physiological breathing/swimming motion
 * if static). Used only when the manifest asset is confirmed present.
 */
export const GLTFAnimalModel: React.FC<GLTFAnimalModelProps> = ({
  asset,
  isAnimating,
  ghosted,
  onMeasured,
}) => {
  const gltf = useGLTF(asset.url, false, false);
  const scene = useMemo(() => SkeletonUtils.clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const inPlaceClips = useMemo(() => sanitizeInPlaceClips(gltf.animations), [gltf.animations]);
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(inPlaceClips, group);

  const { scale, offset, bounds } = useMemo(() => {
    scene.rotation.set(0, asset.rotationY ?? 0, 0);
    scene.position.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    if (inPlaceClips.length > 0) {
      const poseMixer = new THREE.AnimationMixer(scene);
      const poseAction = poseMixer.clipAction(inPlaceClips[0]);
      poseAction.play();
      poseMixer.update(0);
      poseMixer.stopAllAction();
    }
    scene.updateMatrixWorld(true);
    const box = computeSkinnedBox3(scene);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    const s = (3.2 / longest) * (asset.scale ?? 1);
    const center = box.getCenter(new THREE.Vector3());
    const groundY = asset.floating ? 0.15 - center.y * s : -box.min.y * s - 1.0;
    const off = new THREE.Vector3(-center.x * s, groundY, -center.z * s);
    const b = new THREE.Box3(
      box.min.clone().multiplyScalar(s).add(off),
      box.max.clone().multiplyScalar(s).add(off)
    );
    return { scale: s, offset: off, bounds: b };
  }, [scene, inPlaceClips, asset.scale, asset.rotationY, asset.floating]);

  useEffect(() => {
    const silhouette = group.current ? sampleWorldPoints(group.current) : undefined;
    onMeasured?.(bounds, offset.y, silhouette);
  }, [bounds, offset, onMeasured]);

  useEffect(() => {
    const finish = asset.surfaceFinish ?? 'default';
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.geometry) {
          ensureSmoothWeldedNormals(mesh.geometry);
        }
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const std = m as THREE.MeshStandardMaterial;
          if (!std) return;
          if ('envMapIntensity' in std) {
            std.envMapIntensity = finish === 'wet' ? 1.55 : finish === 'armor' ? 1.35 : 1.18;
          }
          if (asset.colorTint) {
            std.color.set(asset.colorTint);
          } else if (std.map) {
            std.color.set('#ffffff');
          }
          if (asset.url.endsWith('/bear.glb') && std.map) {
            std.map = getFeatheredPolarBearMap(std.map);
          }
          if (finish === 'fur') {
            std.roughness = Math.min(std.roughness ?? 0.8, 0.72);
            std.metalness = 0.02;
          } else if (finish === 'wet') {
            std.roughness = Math.min(std.roughness ?? 0.5, 0.28);
            std.metalness = Math.min(std.metalness ?? 0.05, 0.06);
          } else if (finish === 'carapace') {
            std.roughness = Math.min(std.roughness ?? 0.55, 0.36);
            std.metalness = 0.06;
          } else if (finish === 'armor') {
            const matName = (std.name || '').toLowerCase();
            const armorNormal = getOrCreateDermalArmorNormalMap();
            if (matName.includes('gnathal')) {
              std.color.set('#e9dfcb');
              std.roughness = 0.22;
              std.metalness = 0.14;
            } else if (matName.includes('eye')) {
              std.roughness = 0.08;
              std.metalness = 0.18;
            } else if (matName.includes('armor')) {
              if (armorNormal && !std.normalMap) {
                std.normalMap = armorNormal;
                std.normalScale = new THREE.Vector2(0.55, 0.55);
              }
              std.roughness = 0.44;
              std.metalness = 0.16;
            } else {
              if (armorNormal && !std.normalMap) {
                std.normalMap = armorNormal;
                std.normalScale = new THREE.Vector2(0.28, 0.28);
              }
              std.roughness = 0.38;
              std.metalness = 0.08;
            }
          }
          if (std.map) {
            std.map.anisotropy = 8;
            std.map.needsUpdate = true;
          }
          if (std.normalMap) {
            std.normalScale = new THREE.Vector2(1.25, 1.25);
          }
          m.transparent = ghosted || m.transparent;
          m.opacity = ghosted ? 0.12 : 1;
          m.depthWrite = !ghosted;
          m.needsUpdate = true;
        });
      }
    });
  }, [scene, ghosted, asset.surfaceFinish, asset.colorTint]);

  useEffect(() => {
    const clipName = asset.clip && names.includes(asset.clip) ? asset.clip : names[0];
    const action = clipName ? actions[clipName] : null;
    if (!action) return;
    if (isAnimating) action.reset().fadeIn(0.3).play();
    else action.fadeOut(0.3);
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names, asset.clip, isAnimating]);

  // Subtle physiological breathing / buoyant swimming motion for static high-res scans
  useFrame(({ clock }) => {
    if (!group.current || names.length > 0) return;
    if (!isAnimating) {
      group.current.position.copy(offset);
      group.current.scale.setScalar(scale);
      scene.rotation.set(0, asset.rotationY ?? 0, 0);
      return;
    }
    const t = clock.getElapsedTime();
    if (asset.floating) {
      const bob = Math.sin(t * 1.6) * 0.025;
      const yaw = Math.sin(t * 1.2) * 0.032;
      group.current.position.set(offset.x, offset.y + bob, offset.z);
      scene.rotation.set(0, (asset.rotationY ?? 0) + yaw, Math.sin(t * 0.9) * 0.015);
    } else {
      const breath = 1 + Math.sin(t * 2.1) * 0.008;
      group.current.scale.set(scale, scale * breath, scale * breath);
      scene.rotation.set(0, (asset.rotationY ?? 0) + Math.sin(t * 0.7) * 0.012, 0);
    }
  });

  return (
    <group ref={group} position={offset} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};
