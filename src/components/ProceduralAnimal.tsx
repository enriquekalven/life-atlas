import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SafeHtml3D } from './SafeHtml3D';
import { AnatomyHotspot, AnatomyLayer, AnimalRecord } from '../types/atlas';
import { BodyPlan, FinSpec, TubeSpec } from '../three/bodyPlans';
import { buildModel, BuiltModel, OrganItem } from '../three/modelBuilder';
import { buildSweep, SweepResult } from '../three/sweep';
import { createAnimalMaps, getCompoundEyeNormal, getMuscleMaps } from '../three/textures';
import { resolveAnchor } from '../three/anchors';
import { sampleWorldPoints } from '../three/sampling';
import { getOcularBiology, OcularBiologyProfile } from '../data/ocularBiology';
import {
  computeSpeciesEyeGazeDirection,
  createPolarIrisCapGeometry,
  getOrCreateEyeTextures,
} from '../three/eyeBuilder';

/* -------------------------------------------------------------------------- */
/*  Layer styling                                                              */
/* -------------------------------------------------------------------------- */

const LAYER_STYLE: Record<AnatomyLayer, { skin: number; fur: boolean; muscle: number; bone: number; organ: number }> = {
  exterior: { skin: 1, fur: true, muscle: 0, bone: 0, organ: 0 },
  muscular: { skin: 0.1, fur: false, muscle: 1, bone: 0.2, organ: 0 },
  skeletal: { skin: 0.07, fur: false, muscle: 0.07, bone: 1, organ: 0.18 },
  organs: { skin: 0.07, fur: false, muscle: 0, bone: 0.26, organ: 1 },
};

const ORGAN_COLORS: Record<OrganItem['kind'], { color: string; emissive?: string; opacity?: number; clearcoat?: number }> = {
  heart: { color: '#dc2626', emissive: '#7f1d1d', clearcoat: 0.9 },
  lung: { color: '#f9a8d4', emissive: '#be185d', clearcoat: 0.4 },
  brain: { color: '#fbcfe8', emissive: '#c026d3', clearcoat: 0.3 },
  stomach: { color: '#fdba74', emissive: '#9a3412', clearcoat: 0.5 },
  crop: { color: '#fcd34d', emissive: '#92400e', clearcoat: 0.5 },
  liver: { color: '#7f1d1d', emissive: '#450a0a', clearcoat: 0.6 },
  intestine: { color: '#fda4af', emissive: '#9f1239', clearcoat: 0.5 },
  gill: { color: '#ef4444', emissive: '#991b1b', clearcoat: 0.3 },
  airsac: { color: '#bae6fd', emissive: '#0284c7', opacity: 0.45 },
  inkSac: { color: '#111827', clearcoat: 0.8 },
  vessel: { color: '#e11d48', emissive: '#881337' },
  trachea: { color: '#e5e7eb', emissive: '#64748b' },
  bladder: { color: '#fde68a', emissive: '#a16207', opacity: 0.75 },
  baleen: { color: '#1f2937', emissive: '#111127' },
};

function hexLighten(hex: string, k: number): THREE.Color {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  c.setHSL(hsl.h, Math.max(0, hsl.s * 0.9), Math.min(1, hsl.l * k));
  return c;
}

/* -------------------------------------------------------------------------- */
/*  Instancing helper                                                          */
/* -------------------------------------------------------------------------- */

const Instanced: React.FC<{ geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[]; castShadow?: boolean; renderOrder?: number }> = ({ geometry, material, matrices, castShadow, renderOrder }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.count = matrices.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);
  if (matrices.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, matrices.length]} castShadow={castShadow} renderOrder={renderOrder} frustumCulled={false} />;
};

/* -------------------------------------------------------------------------- */
/*  Shared unit geometries                                                     */
/* -------------------------------------------------------------------------- */

const UNIT = {
  sphere: new THREE.SphereGeometry(1, 32, 24),
  sphereLow: new THREE.SphereGeometry(1, 14, 12),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 10, 1),
  cone: new THREE.ConeGeometry(1, 1, 12, 1),
  box: new THREE.BoxGeometry(1, 1, 1),
  rib: (() => {
    const arc = 1.45 * Math.PI;
    const g = new THREE.TorusGeometry(1, 0.035, 6, 22, arc);
    g.rotateZ(Math.PI / 2 - arc / 2);
    return g;
  })(),
  torus: new THREE.TorusGeometry(1, 0.14, 10, 28),
  ring: new THREE.TorusGeometry(1, 0.22, 10, 28),
  eyeSocketRim: new THREE.TorusGeometry(0.97, 0.15, 14, 36),
  corneaDome: (() => {
    const g = new THREE.SphereGeometry(1.038, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.38);
    g.rotateX(Math.PI / 2);
    return g;
  })(),
  eyelidCap: (() => {
    const g = new THREE.SphereGeometry(1.055, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    return g;
  })(),
  irisCapStandard: createPolarIrisCapGeometry(1.005, Math.PI * 0.36, 48, 28),
  irisCapCompound: createPolarIrisCapGeometry(1.008, Math.PI * 0.48, 48, 32),
};

/* -------------------------------------------------------------------------- */
/*  Hyper-Realistic Comparative Anatomy 3D Eyeball Rig                         */
/* -------------------------------------------------------------------------- */

export interface HyperRealEyeRigProps {
  speciesId: string;
  ocularProfile: OcularBiologyProfile;
  position: THREE.Vector3;
  gazeDirection: THREE.Vector3;
  radius: number;
  skinColorHex: string;
  activeLayer: AnatomyLayer;
  isMacroEyeMode?: boolean;
  isAnimating?: boolean;
  onClickEye?: () => void;
}

export const HyperRealEyeRig: React.FC<HyperRealEyeRigProps> = ({
  speciesId,
  ocularProfile,
  position,
  gazeDirection,
  radius,
  skinColorHex,
  activeLayer,
  isMacroEyeMode = false,
  isAnimating = true,
  onClickEye,
}) => {
  const upperLidRef = useRef<THREE.Mesh>(null);
  const lowerLidRef = useRef<THREE.Mesh>(null);
  const irisMeshRef = useRef<THREE.Mesh>(null);

  const eyeTextures = useMemo(
    () => getOrCreateEyeTextures(speciesId, ocularProfile),
    [speciesId, ocularProfile]
  );

  const isCompound =
    ocularProfile.pupilType === 'compound' ||
    ocularProfile.pupilType === 'trinocular-compound' ||
    ocularProfile.eyeType === 'compound-hex' ||
    ocularProfile.eyeType === 'compound-trinocular';

  // Compute upright orthonormal basis so +Z is gazeDirection and +Y is dorsal (world up)
  const orientationQuat = useMemo(() => {
    const forward = gazeDirection.clone().normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, forward);
    if (right.lengthSq() < 1e-4) {
      right.set(1, 0, 0);
    } else {
      right.normalize();
    }
    const up = new THREE.Vector3().crossVectors(forward, right).normalize();
    const m = new THREE.Matrix4().makeBasis(right, up, forward);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, [gazeDirection]);

  const eyeMaterials = useMemo(() => {
    const scleraMat = new THREE.MeshPhysicalMaterial({
      map: eyeTextures.scleraMap,
      roughness: 0.16,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const irisMat = new THREE.MeshPhysicalMaterial({
      map: eyeTextures.irisMap,
      bumpMap: eyeTextures.irisBumpMap,
      bumpScale: isCompound ? 0.035 : 0.024,
      roughness: isCompound ? 0.18 : 0.28,
      metalness: isCompound ? 0.15 : 0.06,
      clearcoat: isCompound ? 1.0 : 0.65,
      clearcoatRoughness: 0.08,
      iridescence: isCompound ? 0.88 : 0.15,
      iridescenceIOR: 1.65,
      emissive: new THREE.Color(ocularProfile.tapetumColor ?? '#000000'),
      emissiveIntensity: ocularProfile.tapetumColor ? 0.14 : 0,
    });

    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.26,
      roughness: 0.015,
      metalness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      ior: 1.376,
      reflectivity: 0.98,
      depthWrite: false,
    });

    const lidColor = hexLighten(skinColorHex, 0.72);
    const eyelidMat = new THREE.MeshPhysicalMaterial({
      color: lidColor,
      roughness: 0.55,
      clearcoat: 0.25,
      side: THREE.DoubleSide,
    });

    const ossicleMat = new THREE.MeshStandardMaterial({
      color: '#e7dec8',
      roughness: 0.42,
      metalness: 0.05,
    });

    return { scleraMat, irisMat, corneaMat, eyelidMat, ossicleMat };
  }, [eyeTextures, isCompound, ocularProfile.tapetumColor, skinColorHex]);

  useEffect(() => {
    return () => {
      Object.values(eyeMaterials).forEach((m) => m.dispose());
    };
  }, [eyeMaterials]);

  // 15 overlapping scleral ossicle bone plates around the corneoscleral junction
  const ossicleMatrices = useMemo(() => {
    if (!ocularProfile.hasScleralOssicles) return [];
    const count = 15;
    const mats: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const r = 0.74;
      const pos = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.64);
      const rot = new THREE.Euler(0, 0, a + 0.12);
      const q = new THREE.Quaternion().setFromEuler(rot);
      const sc = new THREE.Vector3(0.18, 0.12, 0.045);
      mats.push(new THREE.Matrix4().compose(pos, q, sc));
    }
    return mats;
  }, [ocularProfile.hasScleralOssicles]);

  useFrame((state) => {
    if (!isAnimating) return;
    const t = state.clock.getElapsedTime();

    // Subtle hippus (physiological pupil/iris micro-breathing) in macro mode
    if (irisMeshRef.current && !isCompound) {
      const hippus = 1 + Math.sin(t * 2.1) * 0.015;
      irisMeshRef.current.scale.set(hippus, hippus, 1);
    }

    // Periodic natural blink every ~5.2 seconds (suppressed or gentle during macro inspection)
    if (upperLidRef.current && lowerLidRef.current && !isCompound) {
      const cycle = t % 5.2;
      const blinkWave =
        cycle < 0.18
          ? Math.sin((cycle / 0.18) * Math.PI)
          : 0;
      const blinkAmount = isMacroEyeMode ? blinkWave * 0.25 : blinkWave;
      const openAngle =
        speciesId === 'homo-sapiens' && !isMacroEyeMode ? 0.15 : 0.26;
      // Upper lid rotates down toward +Z; lower lid rotates up toward +Z
      upperLidRef.current.rotation.x = -openAngle + blinkAmount * 0.68;
      lowerLidRef.current.rotation.x = Math.PI + openAngle - blinkAmount * 0.42;
    }
  });

  // Preserve true species-scaled eyeball radius (never clamp upward so human eyes stay 24 mm)
  const effectiveRadius = isMacroEyeMode ? radius * 1.18 : radius;
  const showOssicles =
    ocularProfile.hasScleralOssicles &&
    (activeLayer === 'skeletal' || isMacroEyeMode);
  const hasExternalEyelids = !isCompound;
  const initialLidAngle =
    speciesId === 'homo-sapiens' && !isMacroEyeMode ? 0.15 : 0.26;

  return (
    <group
      position={position}
      quaternion={orientationQuat}
      scale={effectiveRadius}
      onClick={(ev) => {
        if (onClickEye) {
          ev.stopPropagation();
          onClickEye();
        }
      }}
    >
      {/* Orbital socket rim */}
      {hasExternalEyelids && speciesId !== 'homo-sapiens' && (
        <mesh
          geometry={UNIT.eyeSocketRim}
          material={eyeMaterials.eyelidMat}
          position={[0, 0, 0.04]}
        />
      )}

      {/* Vascularized Sclera Globe */}
      <mesh
        geometry={UNIT.sphere}
        material={eyeMaterials.scleraMat}
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.985}
      />

      {/* High-Resolution Polar Anterior Iris + Pupil + Collarette + Limbal Ring Cap */}
      <mesh
        ref={irisMeshRef}
        geometry={isCompound ? UNIT.irisCapCompound : UNIT.irisCapStandard}
        material={eyeMaterials.irisMat}
      />

      {/* Refractive Wet Cornea Dome */}
      {!isCompound && (
        <mesh
          geometry={UNIT.corneaDome}
          material={eyeMaterials.corneaMat}
          renderOrder={35}
        />
      )}

      {/* Scleral Ossicle Bone Plates (Reptiles, Birds, Ichthyosaurs, Placoderms, Sarcopterygians) */}
      {showOssicles && ossicleMatrices.length > 0 && (
        <Instanced
          geometry={UNIT.box}
          material={eyeMaterials.ossicleMat}
          matrices={ossicleMatrices}
          renderOrder={34}
        />
      )}

      {/* Animated Upper/Lower Eyelids (Vertebrates & Cephalopods) */}
      {hasExternalEyelids && activeLayer === 'exterior' && (
        <>
          <mesh
            ref={upperLidRef}
            geometry={UNIT.eyelidCap}
            material={eyeMaterials.eyelidMat}
            rotation={[-initialLidAngle, 0, 0]}
          />
          <mesh
            ref={lowerLidRef}
            geometry={UNIT.eyelidCap}
            material={eyeMaterials.eyelidMat}
            rotation={[Math.PI + initialLidAngle, 0, 0]}
          />
        </>
      )}
    </group>
  );
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export interface EyeTargetInfo {
  worldPosition: THREE.Vector3;
  gazeDirection: THREE.Vector3;
  radius: number;
}

export interface ProceduralAnimalProps {
  animal: AnimalRecord;
  plan: BodyPlan;
  activeLayer: AnatomyLayer;
  isAnimating: boolean;
  hotspots: AnatomyHotspot[];
  selectedHotspot: AnatomyHotspot | null;
  onSelectHotspot: (h: AnatomyHotspot) => void;
  showPins?: boolean;
  skipExterior?: boolean;
  skipMuscleAndBone?: boolean;
  skipOrgans?: boolean;
  isMacroEyeMode?: boolean;
  onEyeClick?: () => void;
  onMeasured?: (bounds: THREE.Box3, groundOffset: number, silhouette?: Float32Array, primaryEye?: EyeTargetInfo) => void;
}

interface AnimatedFin {
  group: THREE.Group;
  spec: FinSpec;
  basePosition: THREE.Vector3;
  baseQuaternion: THREE.Quaternion;
}

const TMP_Q = new THREE.Quaternion();
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const AXIS_Z = new THREE.Vector3(0, 0, 1);

/** Rotate a fin about a parent-space axis on top of its plane orientation (never overwrite it). */
function setHinge(f: AnimatedFin, axis: THREE.Vector3, angle: number) {
  f.group.quaternion.copy(f.baseQuaternion).premultiply(TMP_Q.setFromAxisAngle(axis, angle));
}

interface AnimatedTube {
  group: THREE.Group;
  spec: TubeSpec;
  index: number;
}

export const ProceduralAnimal: React.FC<ProceduralAnimalProps> = ({
  animal,
  plan,
  activeLayer,
  isAnimating,
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  showPins = true,
  skipExterior = false,
  skipMuscleAndBone = false,
  skipOrgans = false,
  isMacroEyeMode = false,
  onEyeClick,
  onMeasured,
}) => {
  const palette = animal.visualPalette;
  const isExtinct = animal.temporalStatus === 'extinct';
  const ocularProfile = useMemo(() => getOcularBiology(animal), [animal]);

  /* ----------------------------- geometry build ---------------------------- */
  const model: BuiltModel = useMemo(() => buildModel(plan), [plan]);
  useEffect(() => () => model.dispose(), [model]);

  const furShells: SweepResult[] = useMemo(() => {
    if (!plan.fur) return [];
    const shells = plan.fur.shells ?? 2;
    const out: SweepResult[] = [];
    for (let i = 0; i < shells; i++) {
      out.push(
        buildSweep(plan.spine, {
          radial: 32,
          tubular: 80,
          segmentation: plan.segmentation,
          radiusOffset: (plan.fur.length * 0.42 * (i + 1)) / shells,
        })
      );
    }
    return out;
  }, [plan]);
  useEffect(() => () => furShells.forEach((s) => s.geometry.dispose()), [furShells]);

  const groundOffset = useMemo(() => {
    const b = model.bounds;
    if (plan.groundRest) return -1.0 - b.min.y;
    return 0.15 - (b.min.y + b.max.y) / 2;
  }, [model, plan.groundRest]);

  const primaryEyeTarget = useMemo<EyeTargetInfo>(() => {
    // Choose the left (+Z) eye for primary camera inspection
    const chosen =
      model.eyes.find((e) => e.position.z >= 0) ??
      model.eyes[0] ?? {
        position: new THREE.Vector3(1.1, 0.3, 0.15),
        radius: 0.045,
      };
    const worldPos = chosen.position.clone().add(new THREE.Vector3(0, groundOffset, 0));
    const gazeDir = computeSpeciesEyeGazeDirection(
      animal.archetype,
      animal.id,
      chosen.position.z
    );
    return {
      worldPosition: worldPos,
      gazeDirection: gazeDir,
      radius: Math.max(chosen.radius, 0.038),
    };
  }, [model.eyes, groundOffset, animal.archetype, animal.id]);

  useEffect(() => {
    if (!onMeasured) return;
    const b = model.bounds.clone().translate(new THREE.Vector3(0, groundOffset, 0));
    const points = rootRef.current ? sampleWorldPoints(rootRef.current) : undefined;
    onMeasured(b, groundOffset, points, primaryEyeTarget);
  }, [model, groundOffset, onMeasured, primaryEyeTarget]);

  /* ------------------------------- textures -------------------------------- */
  const maps = useMemo(() => createAnimalMaps(palette, plan.texture), [palette, plan.texture]);
  useEffect(() => () => maps.dispose(), [maps]);

  /* ------------------------------- materials ------------------------------- */
  const mats = useMemo(() => {
    const ns = 0.92;
    const skin = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      normalMap: maps.normalMap,
      normalScale: new THREE.Vector2(ns, ns),
      roughnessMap: maps.roughnessMap,
      roughness: 1,
      metalness: 0,
      clearcoat: plan.wet ? 0.78 : 0.12,
      clearcoatRoughness: plan.wet ? 0.14 : 0.42,
      sheen: plan.fur ? 0.85 : 0.18,
      sheenRoughness: plan.fur ? 0.38 : 0.65,
      sheenColor: hexLighten(palette.primaryColor, 1.25),
      iridescence: plan.iridescence ?? 0,
      iridescenceIOR: 1.6,
      iridescenceThicknessRange: [120, 480],
      envMapIntensity: 0.95,
    });
    const finSkin = new THREE.MeshPhysicalMaterial({
      color: palette.primaryColor,
      normalMap: maps.normalMap,
      normalScale: new THREE.Vector2(0.35, 0.35),
      roughness: palette.skinRoughness,
      clearcoat: plan.wet ? 0.65 : 0.08,
      clearcoatRoughness: 0.28,
      side: THREE.DoubleSide,
    });
    const finTextured = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      normalMap: maps.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: palette.skinRoughness,
      clearcoat: 0.08,
      side: THREE.DoubleSide,
    });
    const makePlain = (color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) =>
      new THREE.MeshPhysicalMaterial({ color, roughness: palette.skinRoughness, side: THREE.DoubleSide, normalMap: maps.normalMap, normalScale: new THREE.Vector2(0.3, 0.3), ...extra });
    const membraneColor = hexLighten(palette.accentColor, 0.85);
    const furTint = new THREE.Color(palette.primaryColor).lerp(new THREE.Color(palette.secondaryColor), 0.22);
    const fur = maps.furAlpha
      ? new THREE.MeshPhysicalMaterial({
          color: furTint,
          map: maps.map,
          alphaMap: maps.furAlpha,
          transparent: true,
          opacity: 0.28,
          depthWrite: false,
          roughness: 0.88,
          sheen: 0.85,
          sheenRoughness: 0.35,
          sheenColor: hexLighten(palette.secondaryColor, 1.15),
        })
      : null;
    const muscleMaps = getMuscleMaps();
    return {
      skin,
      finSkin,
      finTextured,
      finSecondary: makePlain(palette.secondaryColor),
      finAccent: makePlain(palette.accentColor),
      finDark: makePlain('#1c1917'),
      finIvory: makePlain('#f1e9d6', { roughness: 0.35, clearcoat: 0.4 }),
      membrane: new THREE.MeshPhysicalMaterial({ color: membraneColor, transparent: true, opacity: 0.92, side: THREE.DoubleSide, roughness: 0.5, clearcoat: 0.2 }),
      fur,
      ivory: new THREE.MeshPhysicalMaterial({ color: '#f1e9d6', roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.25 }),
      keratin: new THREE.MeshPhysicalMaterial({ color: '#1f2937', roughness: 0.38, clearcoat: 0.4 }),
      chitin: new THREE.MeshPhysicalMaterial({ color: palette.accentColor, roughness: 0.22, clearcoat: 0.92, clearcoatRoughness: 0.12, iridescence: 0.55, iridescenceIOR: 1.55 }),
      dark: new THREE.MeshPhysicalMaterial({ color: '#0a0a0a', roughness: 0.55 }),
      tongue: new THREE.MeshPhysicalMaterial({ color: '#f472b6', roughness: 0.38, clearcoat: 0.65 }),
      gill: new THREE.MeshPhysicalMaterial({ color: '#fb7185', emissive: '#be123c', emissiveIntensity: 0.25, roughness: 0.48, clearcoat: 0.35 }),
      nose: new THREE.MeshPhysicalMaterial({ color: '#141414', roughness: 0.22, clearcoat: 0.95 }),
      compound: new THREE.MeshPhysicalMaterial({ color: '#1f1b2e', normalMap: getCompoundEyeNormal(), normalScale: new THREE.Vector2(1, 1), roughness: 0.2, clearcoat: 1, iridescence: 0.9, iridescenceIOR: 1.8 }),
      bone: new THREE.MeshStandardMaterial({ color: isExtinct ? '#d9ceb8' : '#efe8d8', roughness: 0.52 }),
      cartilage: new THREE.MeshPhysicalMaterial({ color: '#bfdbfe', transparent: true, opacity: 0.85, roughness: 0.4, clearcoat: 0.5 }),
      exo: new THREE.MeshPhysicalMaterial({ color: palette.accentColor, transparent: true, opacity: 0.8, roughness: 0.3, clearcoat: 0.8, side: THREE.DoubleSide }),
      socket: new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 }),
      muscle: new THREE.MeshPhysicalMaterial({ map: muscleMaps.map, normalMap: muscleMaps.normalMap, normalScale: new THREE.Vector2(0.85, 0.85), roughness: 0.4, clearcoat: 0.58, clearcoatRoughness: 0.28 }),
      organs: Object.fromEntries(
        Object.entries(ORGAN_COLORS).map(([k, v]) => [
          k,
          new THREE.MeshPhysicalMaterial({ color: v.color, emissive: v.emissive ?? '#000000', emissiveIntensity: v.emissive ? 0.28 : 0, roughness: 0.32, clearcoat: v.clearcoat ?? 0.6, clearcoatRoughness: 0.25, transparent: v.opacity !== undefined, opacity: v.opacity ?? 1 }),
        ])
      ) as Record<OrganItem['kind'], THREE.MeshPhysicalMaterial>,
    };
  }, [maps, palette, plan.wet, plan.fur, plan.iridescence, isExtinct]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => {
        if (m instanceof THREE.Material) m.dispose();
        else if (m && typeof m === 'object') Object.values(m).forEach((mm) => (mm as THREE.Material).dispose());
      });
    },
    [mats]
  );

  /* ------------------------------ layer opacity ---------------------------- */
  const furGroupRef = useRef<THREE.Group>(null);
  const muscleGroupRef = useRef<THREE.Group>(null);
  const boneGroupRef = useRef<THREE.Group>(null);
  const organGroupRef = useRef<THREE.Group>(null);

  const ringMaterials = useMemo(
    () =>
      (plan.rings ?? []).map(
        (r) => new THREE.MeshPhysicalMaterial({ color: r.color, roughness: 0.42, clearcoat: 0.45 })
      ),
    [plan.rings]
  );
  useEffect(
    () => () => {
      ringMaterials.forEach((rm) => rm.dispose());
    },
    [ringMaterials]
  );

  useLayoutEffect(() => {
    const st = LAYER_STYLE[activeLayer];
    const apply = (m: THREE.Material, opacity: number, base = 1) => {
      const o = opacity * base;
      m.transparent = o < 0.999 || base < 0.999;
      m.opacity = o;
      m.depthWrite = o >= 0.95;
      m.needsUpdate = false;
    };
    const skinLike: Array<[THREE.Material, number]> = [
      [mats.skin, 1], [mats.finSkin, 1], [mats.finTextured, 1], [mats.finSecondary, 1], [mats.finAccent, 1], [mats.finDark, 1], [mats.finIvory, 1],
      [mats.membrane, 0.92], [mats.keratin, 1], [mats.chitin, 1], [mats.dark, 1], [mats.tongue, 1], [mats.gill, 1], [mats.nose, 1],
      [mats.compound, 1],
      ...ringMaterials.map((rm): [THREE.Material, number] => [rm, 1]),
    ];
    skinLike.forEach(([m, base]) => apply(m, st.skin, base));
    apply(mats.ivory, Math.max(st.skin, st.bone));
    apply(mats.muscle, st.muscle);
    apply(mats.bone, st.bone);
    apply(mats.cartilage, st.bone, 0.85);
    apply(mats.exo, st.bone, 0.8);
    apply(mats.socket, st.bone);
    Object.entries(mats.organs).forEach(([k, m]) => apply(m, st.organ, ORGAN_COLORS[k as OrganItem['kind']].opacity ?? 1));
    if (furGroupRef.current) furGroupRef.current.visible = st.fur;
    if (muscleGroupRef.current) muscleGroupRef.current.visible = st.muscle > 0;
    if (boneGroupRef.current) boneGroupRef.current.visible = st.bone > 0;
    if (organGroupRef.current) organGroupRef.current.visible = st.organ > 0;
  }, [activeLayer, mats, ringMaterials]);

  const ghosted = activeLayer !== 'exterior';

  /* -------------------------------- animation ------------------------------ */
  const rootRef = useRef<THREE.Group>(null);
  const bodyMeshRef = useRef<THREE.Mesh>(null);
  const animatedFins = useRef<AnimatedFin[]>([]);
  const animatedTubes = useRef<AnimatedTube[]>([]);
  const heartRefs = useRef<THREE.Mesh[]>([]);
  const lungRefs = useRef<THREE.Mesh[]>([]);
  animatedFins.current = [];
  animatedTubes.current = [];
  heartRefs.current = [];
  lungRefs.current = [];

  const tailWave = useRef({ offset: 0, slope: 0, vertical: false });

  useFrame((state) => {
    if (!isAnimating) return;
    const t = state.clock.getElapsedTime();
    const geom = model.body.geometry;
    const attr = geom.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const base = model.body.basePositions;
    const axis = model.body.axisPositions;
    const tv = model.body.tValues;
    const n = tv.length;
    const anim = plan.animation;
    const breath = plan.breath ?? { center: 0.45, width: 0.22, amplitude: 0.02 };
    const breathe = anim === 'breathe' || anim === 'float' || anim === 'crawl';
    const lateral = anim === 'swim-lateral' || (breathe && (plan.tailSway ?? 0) > 0);
    const vertical = anim === 'swim-vertical';
    const swimAmp = anim === 'swim-lateral' ? 0.085 : (plan.tailSway ?? 0);
    const breathS = Math.sin(t * 1.6);
    const wave = (tt: number) => (anim === 'swim-lateral' ? Math.sin(tt * 5.5 - t * 3.2) * (0.12 + 0.88 * tt * tt) : Math.sin(t * 1.4 - tt * 3) * Math.pow(Math.max(0, (tt - 0.6) / 0.4), 2));
    const vwave = (tt: number) => Math.sin(tt * 4.5 - t * 2.4) * (0.1 + 0.9 * tt * tt) * 0.06;

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      let x = base[i3];
      let y = base[i3 + 1];
      let z = base[i3 + 2];
      const tt = tv[i];
      if (breathe) {
        const d = (tt - breath.center) / breath.width;
        const bell = Math.exp(-d * d * 2);
        const s = 1 + breath.amplitude * breathS * bell;
        x = axis[i3] + (x - axis[i3]) * s;
        y = axis[i3 + 1] + (y - axis[i3 + 1]) * s;
        z = axis[i3 + 2] + (z - axis[i3 + 2]) * s;
      }
      if (lateral) z += swimAmp * wave(tt);
      if (vertical) y += vwave(tt);
      arr[i3] = x;
      arr[i3 + 1] = y;
      arr[i3 + 2] = z;
    }
    attr.needsUpdate = true;
    if (anim === 'swim-lateral' || vertical) geom.computeVertexNormals();

    tailWave.current.offset = lateral ? swimAmp * wave(1) : vertical ? vwave(1) : 0;
    tailWave.current.slope = lateral ? swimAmp * (wave(1) - wave(0.94)) / 0.06 : vertical ? (vwave(1) - vwave(0.94)) / 0.06 : 0;
    tailWave.current.vertical = vertical;

    const flapOmega = anim === 'hover' ? 24 : anim === 'flap' ? 2.4 : 3.0;
    for (const f of animatedFins.current) {
      const spec = f.spec;
      const amp = spec.amplitude ?? 0.2;
      const ph = spec.phase ?? 0;
      if (spec.animate === 'flap') {
        setHinge(f, AXIS_X, Math.sin(t * flapOmega + ph) * amp);
      } else if (spec.animate === 'paddle') {
        setHinge(f, (spec.plane ?? 'side') === 'top' ? AXIS_X : AXIS_Z, Math.sin(t * 2.2 + ph) * amp);
      } else if (spec.animate === 'undulate') {
        const k = spec.amplitude ?? 1;
        if (tailWave.current.vertical) {
          f.group.position.y = f.basePosition.y + tailWave.current.offset * k;
          setHinge(f, AXIS_Z, -tailWave.current.slope * 0.35 * k);
        } else {
          f.group.position.z = f.basePosition.z + tailWave.current.offset * k;
          setHinge(f, AXIS_Y, -tailWave.current.slope * 0.35 * k);
        }
      }
    }
    for (const tb of animatedTubes.current) {
      const k = tb.spec.kind;
      if (k === 'tail') {
        tb.group.rotation.y = Math.sin(t * 1.3) * 0.12 + tailWave.current.offset * 0.5;
      } else if (k === 'gill') {
        tb.group.rotation.z = Math.sin(t * 2.1 + tb.index) * 0.1;
        tb.group.rotation.y = Math.sin(t * 1.7 + tb.index * 1.3) * 0.08;
      } else if (k === 'arm') {
        tb.group.rotation.y = Math.sin(t * 0.9 + tb.index * 0.8) * 0.05;
        tb.group.rotation.x = Math.sin(t * 1.1 + tb.index * 1.1) * 0.03;
      } else if (k === 'antenna') {
        tb.group.rotation.y = Math.sin(t * 2.0 + tb.index) * 0.12;
      }
    }
    if (rootRef.current) {
      // Keep the animal steady when kids are inspecting the eyeball at macro scale
      const bob = isMacroEyeMode
        ? 0
        : anim === 'hover'
          ? 0.03 * Math.sin(t * 2.2)
          : anim === 'flap'
            ? 0.05 * Math.sin(t * 2.4 - 1)
            : anim === 'float'
              ? 0.03 * Math.sin(t * 1.1)
              : anim === 'swim-lateral' || anim === 'swim-vertical'
                ? 0.025 * Math.sin(t * 0.9)
                : 0;
      rootRef.current.position.y = groundOffset + bob;
    }
    const pulse = 1 + Math.pow(Math.max(0, Math.sin(t * 2.6)), 8) * 0.16;
    for (const h of heartRefs.current) {
      const base = h.userData.baseScale as THREE.Vector3;
      if (base) h.scale.copy(base).multiplyScalar(pulse);
    }
    const breathL = 1 + 0.07 * Math.sin(t * 1.6);
    for (const l of lungRefs.current) {
      const base = l.userData.baseScale as THREE.Vector3;
      if (base) l.scale.copy(base).multiplyScalar(breathL);
    }
  });

  /* --------------------------------- pins ---------------------------------- */
  const pins = useMemo(() => {
    const used = new Map<string, number>();
    return hotspots.map((h) => {
      const anchor = resolveAnchor(h);
      const pos = model.anchors[anchor].clone();
      const seen = used.get(anchor) ?? 0;
      used.set(anchor, seen + 1);
      if (seen > 0) pos.add(new THREE.Vector3(0, 0.12 * seen, 0.08 * seen));
      return { hotspot: h, position: pos };
    });
  }, [hotspots, model]);

  /* -------------------------------- helpers -------------------------------- */
  const coloredMats = useRef(new Map<string, THREE.MeshPhysicalMaterial>());
  useEffect(() => {
    const store = coloredMats.current;
    return () => {
      store.forEach((m) => m.dispose());
      store.clear();
    };
  }, []);
  const finMaterial = (spec: FinSpec): THREE.Material => {
    switch (spec.color) {
      case 'secondary': return mats.finSecondary;
      case 'accent': return mats.finAccent;
      case 'dark': return mats.finDark;
      case 'ivory': return mats.finIvory;
      case 'membrane': return mats.membrane;
      default: return spec.textured ? mats.finTextured : mats.finSkin;
    }
  };
  const tubeMaterial = (spec: TubeSpec): THREE.Material => {
    if (spec.color) {
      if (!coloredMats.current.has(spec.color)) {
        coloredMats.current.set(spec.color, new THREE.MeshPhysicalMaterial({ color: spec.color, roughness: 0.35, clearcoat: 0.6 }));
      }
      return coloredMats.current.get(spec.color)!;
    }
    switch (spec.material) {
      case 'ivory': return mats.ivory;
      case 'keratin': return mats.keratin;
      case 'chitin': return mats.chitin;
      case 'dark': return mats.dark;
      case 'membrane': return mats.membrane;
      case 'tongue': return mats.tongue;
      case 'gill': return mats.gill;
      default: return spec.textured === false ? mats.finSkin : mats.skin;
    }
  };

  const boneMat = plan.skeleton.type === 'cartilage' ? mats.cartilage : mats.bone;
  const skinOrder = ghosted ? 20 : 0;

  const renderTube = (pt: (typeof model.tubes)[number], index: number, sign: 1 | -1) => {
    const { spec, tube } = pt;
    const material = tubeMaterial(spec);
    const animated = spec.animate === 'sway';
    return (
      <group key={`${index}-${sign}`} scale={[1, 1, sign]}>
        <group
          position={tube.pivot}
          ref={(g) => {
            if (g && animated) animatedTubes.current.push({ group: g, spec, index });
          }}
        >
          <mesh geometry={tube.geometry} material={material} castShadow renderOrder={skinOrder} />
          {pt.suckers.length > 0 && <Instanced geometry={UNIT.sphereLow} material={mats.finSecondary} matrices={pt.suckers.map((m) => m.clone().premultiply(new THREE.Matrix4().makeTranslation(-tube.pivot.x, -tube.pivot.y, -tube.pivot.z)))} renderOrder={skinOrder} />}
          {pt.spines.length > 0 && <Instanced geometry={UNIT.cone} material={mats.keratin} matrices={pt.spines.map((m) => m.clone().premultiply(new THREE.Matrix4().makeTranslation(-tube.pivot.x, -tube.pivot.y, -tube.pivot.z)))} renderOrder={skinOrder} />}
          {pt.fringe.map((fr, i) => (
            <mesh key={i} geometry={fr.geometry} material={mats.gill} position={fr.pivot.clone().sub(tube.pivot)} renderOrder={skinOrder} />
          ))}
          {spec.knob && <mesh geometry={UNIT.sphere} material={material} position={pt.endPoint.clone().sub(tube.pivot)} scale={spec.knob} renderOrder={skinOrder} />}
        </group>
      </group>
    );
  };

  const renderFin = (pf: (typeof model.fins)[number], index: number, sign: 1 | -1) => {
    const { spec } = pf;
    const animated = spec.animate && spec.animate !== 'none';
    return (
      <group key={`${index}-${sign}`} scale={[1, 1, sign]}>
        <group
          position={pf.position}
          quaternion={pf.quaternion}
          ref={(g) => {
            if (g && animated) animatedFins.current.push({ group: g, spec, basePosition: pf.position.clone(), baseQuaternion: pf.quaternion.clone() });
          }}
        >
          <mesh geometry={pf.geometry} material={finMaterial(spec)} castShadow renderOrder={skinOrder} />
        </group>
      </group>
    );
  };

  const mirrored = <T,>(items: T[], isMirror: (x: T) => boolean, render: (x: T, i: number, s: 1 | -1) => React.ReactNode) =>
    items.flatMap((item, i) => (isMirror(item) ? [render(item, i, 1), render(item, i, -1)] : [render(item, i, 1)]));

  /* --------------------------------- render -------------------------------- */
  return (
    <group ref={rootRef} position={[0, groundOffset, 0]}>
      {/* ============================ EXTERIOR ============================ */}
      {!skipExterior && (
        <group>
          <mesh ref={bodyMeshRef} geometry={model.body.geometry} material={mats.skin} castShadow receiveShadow renderOrder={skinOrder} />

          {mirrored(model.limbs, (l) => l.spec.mirror !== false, (limb, i, sign) => (
            <group key={`limb-${i}-${sign}`} scale={[1, 1, sign]}>
              <group position={limb.segments.pivot}>
                <mesh geometry={limb.segments.geometry} material={mats.skin} castShadow renderOrder={skinOrder} />
              </group>
              {limb.toes.map((toe, ti) => (
                <mesh key={ti} geometry={toe.geometry} material={mats.skin} position={toe.pivot} castShadow renderOrder={skinOrder} />
              ))}
              {limb.claws.length > 0 && <Instanced geometry={UNIT.cone} material={mats.keratin} matrices={limb.claws} renderOrder={skinOrder} />}
              {limb.paw && <mesh geometry={UNIT.sphere} material={mats.skin} position={limb.paw.position} scale={[limb.paw.radius * 1.1, limb.paw.radius * 0.45, limb.paw.radius]} castShadow renderOrder={skinOrder} />}
            </group>
          ))}

          {mirrored(model.tubes, (tb) => tb.spec.mirror === true, renderTube)}
          {mirrored(model.fins, (f) => f.spec.mirror === true, renderFin)}

          {/* Hyper-Realistic Multi-Layer 3D Eyeball Rig */}
          {model.eyes.map((e, i) => {
            const gazeDir = computeSpeciesEyeGazeDirection(
              animal.archetype,
              animal.id,
              e.position.z
            );
            return (
              <HyperRealEyeRig
                key={`eye-${i}`}
                speciesId={animal.id}
                ocularProfile={ocularProfile}
                position={e.position}
                gazeDirection={gazeDir}
                radius={e.radius}
                skinColorHex={palette.primaryColor}
                activeLayer={activeLayer}
                isMacroEyeMode={isMacroEyeMode}
                isAnimating={isAnimating}
                onClickEye={onEyeClick}
              />
            );
          })}

          {model.mouthLines.map((m, i) => (
            <mesh key={`mouth-${i}`} geometry={m.geometry} material={mats.dark} position={m.pivot} renderOrder={skinOrder} />
          ))}
          {model.nose && <mesh geometry={UNIT.sphere} material={mats.nose} position={model.nose.position} scale={[model.nose.radius * 0.9, model.nose.radius * 0.7, model.nose.radius]} renderOrder={skinOrder} />}
          {model.nostrils.map((p, i) => (
            <mesh key={`nostril-${i}`} geometry={UNIT.sphereLow} material={mats.dark} position={p} scale={0.018} renderOrder={skinOrder} />
          ))}
          <Instanced geometry={UNIT.cone} material={mats.ivory} matrices={model.teeth} renderOrder={skinOrder} />
          <Instanced geometry={UNIT.cone} material={mats.finSkin} matrices={model.scutes} renderOrder={skinOrder} />
          <Instanced geometry={UNIT.box} material={mats.dark} matrices={model.gillSlits} renderOrder={skinOrder} />
          {plan.rings?.map((r, i) => (
            <mesh key={`ring-${i}`} geometry={UNIT.ring} material={ringMaterials[i] ?? mats.keratin} position={r.position} rotation={r.rotation ?? [0, 0, 0]} scale={[r.radius, r.radius, r.tube * 4]} renderOrder={skinOrder} />
          ))}

          {/* fur shells */}
          <group ref={furGroupRef} visible={LAYER_STYLE[activeLayer].fur}>
            {mats.fur && furShells.map((shell, i) => (
              <mesh key={`fur-${i}`} geometry={shell.geometry} material={mats.fur!} renderOrder={1 + i} />
            ))}
          </group>
        </group>
      )}

      {/* ============================ MUSCULAR ============================ */}
      {!skipMuscleAndBone && (
        <group ref={muscleGroupRef} visible={LAYER_STYLE[activeLayer].muscle > 0}>
          <mesh geometry={model.muscle.geometry} material={mats.muscle} />
          {mirrored(model.limbs, (l) => l.spec.mirror !== false, (limb, i, sign) => (
            <group key={`mlimb-${i}-${sign}`} scale={[1, 1, sign]}>
              <group position={limb.segments.pivot} scale={[0.86, 1, 0.86]}>
                <mesh geometry={limb.segments.geometry} material={mats.muscle} />
              </group>
            </group>
          ))}
          {mirrored(model.tubes.filter((t) => t.spec.kind === 'tail' || t.spec.kind === 'trunk' || t.spec.kind === 'arm'), (tb) => tb.spec.mirror === true, (pt, i, sign) => (
            <group key={`mtube-${i}-${sign}`} scale={[1, 1, sign]}>
              <group position={pt.tube.pivot} scale={[0.9, 0.9, 0.9]}>
                <mesh geometry={pt.tube.geometry} material={mats.muscle} />
              </group>
            </group>
          ))}
        </group>
      )}

      {/* ============================ SKELETAL ============================ */}
      {!skipMuscleAndBone && (
        <group ref={boneGroupRef} visible={LAYER_STYLE[activeLayer].bone > 0}>
          {(plan.skeleton.type === 'endo' || plan.skeleton.type === 'cartilage') && (
            <>
              <Instanced geometry={UNIT.cylinder} material={boneMat} matrices={model.skeleton.vertebrae} />
              <Instanced geometry={UNIT.box} material={boneMat} matrices={model.skeleton.neuralSpines} />
              <Instanced geometry={UNIT.rib} material={boneMat} matrices={model.skeleton.ribs} />
              <Instanced geometry={UNIT.rib} material={boneMat} matrices={model.skeleton.gastralia} />
              <Instanced geometry={UNIT.cylinder} material={boneMat} matrices={model.skeleton.bones.map((b) => {
                const dir = new THREE.Vector3().subVectors(b.b, b.a);
                const len = dir.length();
                const mid = new THREE.Vector3().addVectors(b.a, b.b).multiplyScalar(0.5);
                const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
                return new THREE.Matrix4().compose(mid, q, new THREE.Vector3(b.r, len, b.r));
              })} />
              <Instanced geometry={UNIT.sphereLow} material={boneMat} matrices={model.skeleton.joints.map((j) => new THREE.Matrix4().compose(j.position, new THREE.Quaternion(), new THREE.Vector3(j.r, j.r, j.r)))} />
              {model.skeleton.plates.map((p, i) => (
                <mesh key={`plate-${i}`} geometry={UNIT.sphere} material={boneMat} position={p.position} quaternion={p.quaternion} scale={p.scale} />
              ))}
              {model.skeleton.skull && <mesh geometry={model.skeleton.skull.geometry} material={boneMat} />}
              {model.skeleton.notochord && <mesh geometry={model.skeleton.notochord.geometry} material={mats.cartilage} />}
              {model.skeleton.eyeSockets.map((s, i) => (
                <mesh key={`socket-${i}`} geometry={UNIT.sphereLow} material={mats.socket} position={s.position} scale={s.r} />
              ))}
              <Instanced geometry={UNIT.cone} material={mats.ivory} matrices={model.teeth} />
              {mirrored(model.tubes.filter((t) => t.spec.bone && (t.spec.material === 'ivory' || t.spec.material === 'keratin')), (tb) => tb.spec.mirror === true, (pt, i, sign) => (
                <group key={`btube-${i}-${sign}`} scale={[1, 1, sign]}>
                  <mesh geometry={pt.tube.geometry} material={boneMat} position={pt.tube.pivot} />
                </group>
              ))}
              {mirrored(model.fins.filter((f) => f.spec.bone), (f) => f.spec.mirror === true, (pf, i, sign) => (
                <group key={`bfin-${i}-${sign}`} scale={[1, 1, sign]}>
                  <mesh geometry={pf.geometry} material={boneMat} position={pf.position} quaternion={pf.quaternion} scale={[0.97, 0.97, 0.6]} />
                </group>
              ))}
            </>
          )}
          {plan.skeleton.type === 'exo' && (
            <>
              <mesh geometry={model.body.geometry} material={mats.exo} />
              {mirrored(model.tubes.filter((t) => t.spec.material === 'chitin'), (tb) => tb.spec.mirror === true, (pt, i, sign) => (
                <group key={`etube-${i}-${sign}`} scale={[1, 1, sign]}>
                  <mesh geometry={pt.tube.geometry} material={mats.exo} position={pt.tube.pivot} />
                </group>
              ))}
            </>
          )}
          {plan.skeleton.type === 'none' && (
            <>
              <mesh geometry={UNIT.cone} material={mats.dark} position={model.anchors.jaw.clone().add(new THREE.Vector3(0.04, 0.04, 0))} rotation={[0, 0, -Math.PI / 2]} scale={[0.05, 0.1, 0.05]} />
              <mesh geometry={UNIT.cone} material={mats.dark} position={model.anchors.jaw.clone().add(new THREE.Vector3(0.04, -0.04, 0))} rotation={[0, 0, -Math.PI / 2]} scale={[0.045, 0.08, 0.045]} />
              <mesh geometry={UNIT.sphere} material={mats.cartilage} position={model.anchors.brain} scale={[0.16, 0.12, 0.18]} />
            </>
          )}
        </group>
      )}

      {/* ============================= ORGANS ============================= */}
      {!skipOrgans && (
        <group ref={organGroupRef} visible={LAYER_STYLE[activeLayer].organ > 0}>
          {model.organs.map((org, i) => {
            const material = mats.organs[org.kind];
            if (org.shape === 'tube' && org.tubeGeometry) {
              return <mesh key={`org-${i}`} geometry={org.tubeGeometry} material={material} position={org.position} />;
            }
            const geometry = org.shape === 'torus' ? UNIT.torus : UNIT.sphere;
            return (
              <mesh
                key={`org-${i}`}
                ref={(m) => {
                  if (!m) return;
                  m.userData.baseScale = org.scale.clone();
                  if (org.kind === 'heart') heartRefs.current.push(m);
                  if (org.kind === 'lung') lungRefs.current.push(m);
                }}
                geometry={geometry}
                material={material}
                position={org.position}
                quaternion={org.quaternion}
                scale={org.scale}
              />
            );
          })}
        </group>
      )}

      {/* ============================== PINS ============================== */}
      {showPins && !isMacroEyeMode && pins.map(({ hotspot, position }, index) => {
        const isCurrentLayer = hotspot.layer === activeLayer;
        const isSelected = selectedHotspot?.id === hotspot.id;
        return (
          <group key={hotspot.id} position={position}>
            <mesh onClick={(e) => { e.stopPropagation(); onSelectHotspot(hotspot); }}>
              <sphereGeometry args={[isSelected ? 0.045 : 0.03, 14, 14]} />
              <meshStandardMaterial color={isSelected ? '#facc15' : isCurrentLayer ? '#10b981' : '#64748b'} emissive={isSelected ? '#facc15' : isCurrentLayer ? '#10b981' : '#334155'} emissiveIntensity={isSelected ? 1.4 : isCurrentLayer ? 0.9 : 0.3} />
            </mesh>
            <SafeHtml3D position={[0, 0.07, 0]} center zIndexRange={[12, 0]} style={{ pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={() => onSelectHotspot(hotspot)}
                className={`px-1.5 py-0.5 rounded-full text-[10px] leading-tight font-semibold whitespace-nowrap border shadow-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-200 scale-110 ring-2 ring-amber-400/50'
                    : isCurrentLayer
                      ? 'bg-emerald-950/85 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900'
                      : 'bg-slate-900/70 text-slate-300 border-slate-700/60 opacity-70 hover:opacity-100'
                }`}
              >
                {index + 1}
                <span className="hidden sm:inline">. {hotspot.name.length > 26 ? `${hotspot.name.slice(0, 24)}…` : hotspot.name}</span>
              </button>
            </SafeHtml3D>
          </group>
        );
      })}
    </group>
  );
};
