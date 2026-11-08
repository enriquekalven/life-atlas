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
            if (matName.includes('gnathal')) {
              std.roughness = 0.25;
              std.metalness = 0.12;
            } else if (matName.includes('eye')) {
              std.roughness = 0.12;
              std.metalness = 0.15;
            } else {
              std.roughness = 0.46;
              std.metalness = 0.14;
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
