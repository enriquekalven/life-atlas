import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Eye, Sparkles, Maximize2, Focus } from 'lucide-react';
import { AnatomyHotspot, AnatomyLayer, AnimalRecord } from '../types/atlas';
import { getBodyPlan, Posture } from '../three/bodyPlans';
import { EyeTargetInfo, ProceduralAnimal } from './ProceduralAnimal';
import { GLTFAnimalModel } from './GLTFAnimalModel';
import { HumanAnatomicalSpecimen, HumanScaleExplorer } from './HumanModels';
import { MODEL_MANIFEST, ModelAsset } from '../data/modelManifest';
import { getOcularBiology } from '../data/ocularBiology';
import { fitDirectionFor, studioFrame } from '../three/cameraFit';

export type CameraFocusMode = 'body' | 'head' | 'eye';

interface Animal3DViewerProps {
  animal: AnimalRecord;
  activeLayer: AnatomyLayer;
  selectedHotspot: AnatomyHotspot | null;
  onSelectHotspot: (hotspot: AnatomyHotspot) => void;
  showKidScale: boolean;
  isAnimating: boolean;
  showPins?: boolean;
  cameraFocus?: CameraFocusMode;
  onCameraFocusChange?: (focus: CameraFocusMode) => void;
  heroStage?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Camera auto-framing & Macro Eyeball Flight Controller                      */
/* -------------------------------------------------------------------------- */

interface Measurement {
  bounds: THREE.Box3;
  silhouette: Float32Array | null;
  primaryEye: EyeTargetInfo | null;
}

const FitCamera: React.FC<{
  measurement: Measurement | null;
  fitKey: string;
  posture: Posture;
  cameraFocus: CameraFocusMode;
  showKidScale?: boolean;
  animal?: AnimalRecord;
  modelLength?: number;
}> = ({ measurement, fitKey, posture, cameraFocus, showKidScale, animal, modelLength = 3.2 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const aspect = useThree((s) => s.viewport.aspect);
  const target = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);
  const fittedOnce = useRef(false);

  useEffect(() => {
    if (!measurement) return;
    const vfov = THREE.MathUtils.degToRad(camera.fov);

    let pos: THREE.Vector3;
    let look: THREE.Vector3;

    if (cameraFocus === 'eye' && measurement.primaryEye) {
      const { worldPosition, gazeDirection, radius } = measurement.primaryEye;
      const effectiveR = radius * 1.18;
      // Position camera along the outward gaze vector with a slight lateral-anterior offset for unobstructed Purkinje depth
      const viewDir = gazeDirection
        .clone()
        .add(new THREE.Vector3(0.06, 0.06, 0.14))
        .normalize();
      const dist = Math.max(effectiveR * 5.2, 0.068);
      pos = worldPosition.clone().addScaledVector(viewDir, dist);
      // Aim slightly below the eyeball center so the 3D eye sits in the upper 75% of the canvas above the bottom dock bar
      look = worldPosition.clone().add(new THREE.Vector3(0, -effectiveR * 0.38, 0));
    } else if (cameraFocus === 'head') {
      const b = measurement.bounds;
      const size = b.getSize(new THREE.Vector3());
      const headCenter = measurement.primaryEye
        ? measurement.primaryEye.worldPosition.clone().add(new THREE.Vector3(-0.08, -0.04, 0))
        : new THREE.Vector3(b.max.x - size.x * 0.22, (b.min.y + b.max.y) * 0.58, 0);
      const dir = new THREE.Vector3(0.65, 0.22, 0.72).normalize();
      const dist = Math.max(size.y * 0.95, 1.15);
      pos = headCenter.clone().addScaledVector(dir, dist);
      look = headCenter;
    } else {
      const dir = fitDirectionFor(posture);
      let fitBounds = measurement.bounds;
      let fitSilhouette = measurement.silhouette;

      if (showKidScale && animal && animal.id !== 'homo-sapiens') {
        const isAquatic = [
          'cetacean',
          'shark_ichthyosaur',
          'cephalopod',
          'marine_reptile',
          'manta_ray',
          'cnidarian_medusa',
          'trilobite_arthropod',
        ].includes(animal.archetype);
        const raw =
          (1.45 / Math.max(animal.metrics.lengthMeters, 0.01)) * (modelLength / 1.6);
        const ratio = Math.min(Math.max(raw, 0.16), 2.2);
        const baseY = isAquatic ? -0.45 : -1.0;
        const topY = baseY + 1.72 * ratio;
        const posX = isAquatic ? 0.25 : -0.78;
        const posZ = 0.62;

        fitBounds = measurement.bounds.clone();
        fitBounds.expandByPoint(new THREE.Vector3(posX - 0.18 * ratio, baseY, posZ));
        fitBounds.expandByPoint(new THREE.Vector3(posX + 0.18 * ratio, topY, posZ));

        if (measurement.silhouette) {
          const extra = new Float32Array(measurement.silhouette.length + 6);
          extra.set(measurement.silhouette, 0);
          const o = measurement.silhouette.length;
          extra[o] = posX;
          extra[o + 1] = baseY;
          extra[o + 2] = posZ;
          extra[o + 3] = posX;
          extra[o + 4] = topY;
          extra[o + 5] = posZ;
          fitSilhouette = extra;
        }
      }

      const { center, distance } = studioFrame(
        fitBounds,
        fitSilhouette,
        vfov,
        aspect,
        dir
      );
      pos = center.clone().addScaledVector(dir, distance);
      look = center;
    }

    if (!fittedOnce.current) {
      fittedOnce.current = true;
      target.current = null;
      camera.position.copy(pos);
      if (controls) {
        controls.target.copy(look);
        controls.update();
      } else {
        camera.lookAt(look);
      }
      return;
    }
    target.current = { pos, look };
  }, [measurement, fitKey, posture, cameraFocus, showKidScale, animal, modelLength, camera, aspect, controls]);

  useFrame((_, delta) => {
    const t = target.current;
    if (!t) return;
    const alpha = 1 - Math.exp(-6.5 * Math.min(delta, 0.25));
    camera.position.lerp(t.pos, alpha);
    if (controls) {
      controls.target.lerp(t.look, alpha);
      controls.update();
    } else {
      camera.lookAt(t.look);
    }
    if (
      camera.position.distanceTo(t.pos) < 0.003 &&
      (!controls || controls.target.distanceTo(t.look) < 0.003)
    ) {
      target.current = null;
    }
  });
  return null;
};

/* -------------------------------------------------------------------------- */
/*  Optional photoreal asset gate                                              */
/* -------------------------------------------------------------------------- */

function useAssetAvailable(asset: ModelAsset | undefined): boolean {
  const [available, setAvailable] = useState<boolean>(() => Boolean(asset));
  useEffect(() => {
    let cancelled = false;
    if (!asset) {
      setAvailable(false);
      return;
    }
    setAvailable(true);
    fetch(asset.url, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? '';
        const ok = res.ok && /model\/gltf|octet-stream/i.test(type);
        if (!cancelled) setAvailable(ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [asset]);
  return available;
}

/* -------------------------------------------------------------------------- */
/*  Species Vision Simulation CSS Filter Helper                                */
/* -------------------------------------------------------------------------- */

function getSpeciesVisionFilter(animal: AnimalRecord): {
  cssFilter: string;
  badgeText: string;
} {
  if (animal.id === 'peacock-mantis-shrimp') {
    return {
      cssFilter: 'saturate(2.35) contrast(1.22) hue-rotate(-14deg)',
      badgeText: '16-Photoreceptor UV & Circular Polarization Hyperspectral Vision',
    };
  }
  if (
    animal.id === 'siberian-tiger' ||
    animal.id === 'smilodon-fatalis' ||
    animal.id === 'polar-bear' ||
    animal.id === 'african-bush-elephant' ||
    animal.id === 'woolly-mammoth'
  ) {
    return {
      cssFilter: 'sepia(0.38) hue-rotate(38deg) saturate(0.82) contrast(1.12)',
      badgeText: 'Dichromatic (2-Cone Blue/Green) Vision + High-Gain Night Tapetum',
    };
  }
  if (
    animal.id === 'giant-pacific-octopus' ||
    animal.id === 'blue-whale' ||
    animal.id === 'livyatan-melvillei' ||
    animal.id === 'great-white-shark' ||
    animal.id === 'otodus-megalodon'
  ) {
    return {
      cssFilter: 'grayscale(0.68) sepia(0.28) hue-rotate(175deg) contrast(1.25)',
      badgeText: 'Monochromatic Marine High-Contrast & Chromatic Blur Acuity',
    };
  }
  if (
    animal.id === 'coelacanth' ||
    animal.id === 'shonisaurus-popularis'
  ) {
    return {
      cssFilter: 'sepia(0.55) hue-rotate(180deg) saturate(1.6) brightness(1.08)',
      badgeText: '480 nm Deep-Sea Bioluminescent Blue-Shifted Rod Vision',
    };
  }
  if (
    animal.id === 'peregrine-falcon' ||
    animal.id === 'emperor-penguin' ||
    animal.id === 'saltwater-crocodile' ||
    animal.id === 'komodo-dragon'
  ) {
    return {
      cssFilter: 'saturate(1.45) contrast(1.18)',
      badgeText: 'Tetrachromatic (4-Cone + UV Oil Droplet) High-Acuity Vision',
    };
  }
  return {
    cssFilter: 'saturate(1.15) contrast(1.06)',
    badgeText: 'Trichromatic Foveal Color Vision',
  };
}

/* -------------------------------------------------------------------------- */
/*  Viewer                                                                     */
/* -------------------------------------------------------------------------- */

export const Animal3DViewer: React.FC<Animal3DViewerProps> = ({
  animal,
  activeLayer,
  selectedHotspot,
  onSelectHotspot,
  showKidScale,
  isAnimating,
  showPins = true,
  cameraFocus: controlledFocus,
  onCameraFocusChange,
  heroStage = false,
}) => {
  const plan = useMemo(
    () => getBodyPlan(animal),
    [animal.id, animal.archetype, animal.visualPalette]
  );
  const ocularProfile = useMemo(() => getOcularBiology(animal), [animal]);
  const asset = MODEL_MANIFEST[animal.id];
  const assetAvailable = useAssetAvailable(asset);

  const [internalFocus, setInternalFocus] = useState<CameraFocusMode>(() => {
    if (typeof window === 'undefined') return 'body';
    const raw = new URLSearchParams(window.location.search).get('focus') ?? '';
    return raw === 'eye' || raw === 'head' ? raw : 'body';
  });
  const cameraFocus = controlledFocus ?? internalFocus;
  const setCameraFocus = useCallback(
    (next: CameraFocusMode) => {
      setInternalFocus(next);
      onCameraFocusChange?.(next);
    },
    [onCameraFocusChange]
  );

  const [simulateVision, setSimulateVision] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  // Reset vision simulation and measurement if user switches species
  useEffect(() => {
    setSimulateVision(false);
    setMeasurement(null);
  }, [animal.id]);

  const handleMeasured = useCallback(
    (
      b: THREE.Box3,
      _groundOffset?: number,
      silhouette?: Float32Array,
      primaryEye?: EyeTargetInfo
    ) => {
      setMeasurement((prev) => ({
        bounds: b.clone(),
        silhouette: silhouette ?? null,
        primaryEye: primaryEye ?? prev?.primaryEye ?? null,
      }));
    },
    []
  );

  const handleOverlayMeasured = useCallback(
    (
      _b: THREE.Box3,
      _groundOffset?: number,
      _silhouette?: Float32Array,
      primaryEye?: EyeTargetInfo
    ) => {
      if (!primaryEye) return;
      setMeasurement((prev) =>
        prev
          ? { ...prev, primaryEye }
          : { bounds: _b.clone(), silhouette: null, primaryEye }
      );
    },
    []
  );

  const handleEyeClick = useCallback(() => {
    setCameraFocus('eye');
  }, [setCameraFocus]);

  const modelLength = measurement
    ? measurement.bounds.getSize(new THREE.Vector3()).x
    : 3.2;

  const isMacroEyeMode = cameraFocus === 'eye';
  const isHumanSpecimen = animal.id === 'homo-sapiens';
  // When in Macro Eye mode, always render the high-res anatomical head + HyperRealEyeRig
  // so kids see the 512x512 iris stroma, pupil, sclera, scleral ossicles, and wet cornea on every species!
  const useGltfExterior =
    !isHumanSpecimen && asset && assetAvailable && !isMacroEyeMode;

  const visionSim = useMemo(() => getSpeciesVisionFilter(animal), [animal]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        heroStage
          ? 'min-h-[420px] rounded-3xl bg-[radial-gradient(ellipse_at_54%_46%,rgba(16,185,129,0.13)_0%,rgba(15,23,42,0.86)_56%,rgba(4,8,18,1)_100%)] border border-slate-800/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)]'
          : 'min-h-[420px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 shadow-2xl'
      }`}
    >
      <div
        className="w-full h-full transition-all duration-300"
        style={simulateVision ? { filter: visionSim.cssFilter } : undefined}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [1.6, 1.1, 4.2], fov: heroStage ? 38 : 40, near: 0.015, far: 60 }}
          gl={{ antialias: true, toneMappingExposure: 1.1 }}
        >
          <ambientLight intensity={0.42} />
          <directionalLight
            position={[4, 7, 5]}
            intensity={2.3}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
          />
          <directionalLight position={[-5, 3, -4]} intensity={0.65} color="#bfdbfe" />
          <directionalLight position={[0, 2, -6]} intensity={0.9} color="#fef3c7" />
          {/* Dedicated anterior catchlight for macro eyeball inspection */}
          <pointLight position={[2.2, 1.4, 2.5]} intensity={isMacroEyeMode ? 1.4 : 0.4} color="#ffffff" />

          <Environment resolution={256} frames={1}>
            <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 5, -6]} scale={[10, 3, 1]} />
            <Lightformer form="rect" intensity={2.2} color="#bae6fd" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
            <Lightformer form="rect" intensity={1.6} color="#fef3c7" position={[6, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
            <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[4, 4, 1]} />
          </Environment>

          {isHumanSpecimen ? (
            <Suspense
              key={`human-${animal.id}`}
              fallback={
                <ProceduralAnimal
                  animal={animal}
                  plan={plan}
                  activeLayer={activeLayer}
                  isAnimating={isAnimating}
                  hotspots={animal.anatomyHotspots}
                  selectedHotspot={selectedHotspot}
                  onSelectHotspot={onSelectHotspot}
                  showPins={false}
                  isMacroEyeMode={isMacroEyeMode}
                  onEyeClick={handleEyeClick}
                  onMeasured={handleMeasured}
                />
              }
            >
              <HumanAnatomicalSpecimen
                animal={animal}
                plan={plan}
                activeLayer={activeLayer}
                isAnimating={isAnimating}
                hotspots={animal.anatomyHotspots}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={onSelectHotspot}
                showPins={showPins}
                isMacroEyeMode={isMacroEyeMode}
                onEyeClick={handleEyeClick}
                onMeasured={handleMeasured}
              />
            </Suspense>
          ) : useGltfExterior ? (
            <Suspense
              key={`gltf-${animal.id}`}
              fallback={
                <ProceduralAnimal
                  animal={animal}
                  plan={plan}
                  activeLayer={activeLayer}
                  isAnimating={isAnimating}
                  hotspots={animal.anatomyHotspots}
                  selectedHotspot={selectedHotspot}
                  onSelectHotspot={onSelectHotspot}
                  showPins={false}
                  isMacroEyeMode={isMacroEyeMode}
                  onEyeClick={handleEyeClick}
                  onMeasured={handleMeasured}
                />
              }
            >
              <GLTFAnimalModel
                key={`model-${animal.id}`}
                asset={asset}
                isAnimating={isAnimating}
                ghosted={activeLayer !== 'exterior'}
                onMeasured={handleMeasured}
              />
              <ProceduralAnimal
                key={`overlay-${animal.id}`}
                animal={animal}
                plan={plan}
                activeLayer={activeLayer}
                isAnimating={isAnimating}
                hotspots={animal.anatomyHotspots}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={onSelectHotspot}
                showPins={showPins}
                skipExterior={true}
                isMacroEyeMode={isMacroEyeMode}
                onEyeClick={handleEyeClick}
                onMeasured={activeLayer === 'exterior' ? handleOverlayMeasured : handleMeasured}
              />
            </Suspense>
          ) : (
            <ProceduralAnimal
              key={`proc-${animal.id}`}
              animal={animal}
              plan={plan}
              activeLayer={activeLayer}
              isAnimating={isAnimating}
              hotspots={animal.anatomyHotspots}
              selectedHotspot={selectedHotspot}
              onSelectHotspot={onSelectHotspot}
              showPins={showPins}
              isMacroEyeMode={isMacroEyeMode}
              onEyeClick={handleEyeClick}
              onMeasured={handleMeasured}
            />
          )}

          {showKidScale && !isMacroEyeMode && (
            <Suspense fallback={null}>
              <HumanScaleExplorer animal={animal} modelLength={modelLength} />
            </Suspense>
          )}

          <ContactShadows
            position={[0, -1.0, 0]}
            opacity={0.6}
            scale={10}
            blur={2.4}
            far={5}
            resolution={512}
          />
          <FitCamera
            measurement={measurement}
            fitKey={animal.id}
            posture={plan.posture}
            cameraFocus={cameraFocus}
            showKidScale={showKidScale}
            animal={animal}
            modelLength={modelLength}
          />
          <OrbitControls
            makeDefault
            enablePan={true}
            minDistance={0.05}
            maxDistance={14}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>
      </div>

      {/* Top-Right Camera Focus & Macro Eyeball Bar */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl">
        <button
          type="button"
          onClick={() => setCameraFocus('body')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            cameraFocus === 'body'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-200 hover:bg-slate-800/80'
          }`}
          title="Frame Full Body"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Full Body</span>
        </button>
        <button
          type="button"
          onClick={() => setCameraFocus('head')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            cameraFocus === 'head'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-200 hover:bg-slate-800/80'
          }`}
          title="Zoom to Cranium & Jaws"
        >
          <Focus className="w-3.5 h-3.5" />
          <span>Head &amp; Jaws</span>
        </button>
        <button
          type="button"
          onClick={() => setCameraFocus('eye')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            cameraFocus === 'eye'
              ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300/60'
              : 'bg-amber-500/15 text-amber-200 border border-amber-400/40 hover:bg-amber-500/25'
          }`}
          title="Zoom right into the 3D Eyeball Anatomy (Iris Stroma, Pupil, Cornea & Sclera)"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Macro Eyeball Detail</span>
        </button>
      </div>

      {/* Sleek Bottom Horizontal Ocular Anatomy Dock Bar (keeps upper 78% of 3D eyeball canvas unobstructed) */}
      {isMacroEyeMode && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 rounded-xl bg-slate-950/92 backdrop-blur-md border border-amber-400/40 px-3 py-2 shadow-2xl text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider text-amber-300 shrink-0">
                <Eye className="w-3 h-3" />
                <span>360° Ocular Lab</span>
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {animal.commonName} — {ocularProfile.pupilShapeLabel}
              </h4>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSimulateVision((v) => !v)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  simulateVision
                    ? 'bg-sky-400 text-slate-950 border-sky-200 shadow-md'
                    : 'bg-sky-950/80 text-sky-200 border-sky-500/50 hover:bg-sky-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{simulateVision ? 'Normal View' : 'See Through Their Eyes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCameraFocus('body')}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold whitespace-nowrap cursor-pointer"
              >
                ← Full Body
              </button>
            </div>
          </div>

          <p className="text-[11px] text-amber-100/95 leading-snug mb-1.5 bg-amber-950/35 border border-amber-500/25 rounded-lg px-2 py-1">
            {ocularProfile.kidVisionSecret}
            {simulateVision ? ` · Active Filter: ${visionSim.badgeText}` : ''}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-slate-900/90 border border-slate-800 rounded px-2 py-1 truncate">
              <span className="text-slate-400">Size: </span>
              <span className="font-semibold text-emerald-300">
                {ocularProfile.eyeballDiameterMm}
                {ocularProfile.hasScleralOssicles ? ' · Scleral Ring' : ''}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded px-2 py-1 truncate">
              <span className="text-slate-400">FOV: </span>
              <span className="font-semibold text-sky-300">{ocularProfile.fieldOfView}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded px-2 py-1 truncate">
              <span className="text-slate-400">Retina: </span>
              <span className="font-medium text-slate-200">{ocularProfile.photoreceptors}</span>
            </div>
          </div>
        </div>
      )}

      {/* Museum 3D Asset Attribution Pill */}
      {(isHumanSpecimen || (asset && assetAvailable)) && !isMacroEyeMode && (
        <div className="absolute bottom-2 right-3 px-2.5 py-1 rounded-md bg-slate-950/85 border border-slate-800 text-[10px] text-slate-300">
          {isHumanSpecimen
            ? '3D Scan: Z-Anatomy / Open-Access Human Anatomical Atlas (326,565 verts · CC-BY-SA 4.0)'
            : `3D Model: ${asset.attribution} · ${asset.license}`}
        </div>
      )}
    </div>
  );
};
