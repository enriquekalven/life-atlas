import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { AnimalRecord, GeologicalEraId } from '../types/atlas';
import { SafeHtml3D } from './SafeHtml3D';

interface Globe3DProps {
  animals: AnimalRecord[];
  selectedAnimal: AnimalRecord;
  onSelectAnimal: (animal: AnimalRecord) => void;
  selectedEra: GeologicalEraId;
  showClimateBands: boolean;
}

function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function createProceduralEarthTextures(eraId: GeologicalEraId) {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d');

  if (ctx && bumpCtx) {
    // Ocean gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (eraId === 'cambrian' || eraId === 'devonian') {
      oceanGrad.addColorStop(0, '#083344');
      oceanGrad.addColorStop(0.5, '#0e7490');
      oceanGrad.addColorStop(1, '#083344');
    } else if (eraId === 'pleistocene') {
      oceanGrad.addColorStop(0, '#e2e8f0');
      oceanGrad.addColorStop(0.22, '#0c4a6e');
      oceanGrad.addColorStop(0.5, '#0369a1');
      oceanGrad.addColorStop(0.78, '#0c4a6e');
      oceanGrad.addColorStop(1, '#e2e8f0');
    } else {
      oceanGrad.addColorStop(0, '#0f172a');
      oceanGrad.addColorStop(0.15, '#0c4a6e');
      oceanGrad.addColorStop(0.5, '#0284c7');
      oceanGrad.addColorStop(0.85, '#0c4a6e');
      oceanGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#111111';
    bumpCtx.fillRect(0, 0, width, height);

    // Helper to draw stylized continent polygons from [lng, lat] pairs
    const drawContinent = (coords: Array<[number, number]>, fill: string, mountainColor: string) => {
      ctx.save();
      ctx.beginPath();
      bumpCtx.beginPath();
      coords.forEach(([lng, lat], idx) => {
        const x = ((lng + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        if (idx === 0) {
          ctx.moveTo(x, y);
          bumpCtx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
          bumpCtx.lineTo(x, y);
        }
      });
      ctx.closePath();
      bumpCtx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = mountainColor;
      ctx.stroke();

      bumpCtx.fillStyle = '#999999';
      bumpCtx.fill();
      bumpCtx.lineWidth = 6;
      bumpCtx.strokeStyle = '#ffffff';
      bumpCtx.stroke();
      ctx.restore();
    };

    const landColor =
      eraId === 'permian' || eraId === 'triassic'
        ? '#b45309'
        : eraId === 'cretaceous' || eraId === 'jurassic' || eraId === 'carboniferous'
          ? '#15803d'
          : '#166534';
    const highColor = eraId === 'pleistocene' ? '#f8fafc' : '#a16207';

    // North America
    drawContinent(
      [
        [-165, 68],
        [-130, 70],
        [-75, 62],
        [-60, 48],
        [-80, 25],
        [-85, 10],
        [-105, 18],
        [-125, 48],
      ],
      landColor,
      highColor
    );

    // Greenland
    drawContinent(
      [
        [-55, 60],
        [-20, 65],
        [-18, 82],
        [-60, 80],
      ],
      '#e2e8f0',
      '#ffffff'
    );

    // South America
    drawContinent(
      [
        [-80, 10],
        [-50, 2],
        [-35, -8],
        [-48, -28],
        [-68, -55],
        [-75, -45],
        [-70, -18],
        [-81, -4],
      ],
      '#15803d',
      highColor
    );

    // Africa
    drawContinent(
      [
        [-17, 15],
        [-6, 35],
        [12, 37],
        [33, 31],
        [51, 12],
        [40, -15],
        [20, -35],
        [12, -18],
        [8, 4],
        [-10, 6],
      ],
      eraId === 'cretaceous' ? '#15803d' : '#ca8a04',
      '#15803d'
    );

    // Europe & Asia
    drawContinent(
      [
        [-9, 38],
        [-5, 58],
        [15, 70],
        [65, 73],
        [140, 72],
        [170, 65],
        [142, 40],
        [120, 22],
        [102, 2],
        [88, 22],
        [77, 8],
        [68, 24],
        [48, 13],
        [35, 32],
        [26, 40],
      ],
      landColor,
      highColor
    );

    // Indonesia & Japan archipelagos
    drawContinent(
      [
        [95, 5],
        [120, -5],
        [140, -6],
        [135, 2],
      ],
      '#15803d',
      '#a3e635'
    );

    // Australia
    drawContinent(
      [
        [114, -22],
        [130, -12],
        [145, -15],
        [153, -28],
        [146, -39],
        [130, -33],
        [115, -34],
      ],
      '#d97706',
      '#15803d'
    );

    // Antarctica
    drawContinent(
      [
        [-180, -72],
        [-60, -65],
        [20, -70],
        [110, -67],
        [180, -73],
        [180, -89],
        [-180, -89],
      ],
      eraId === 'cretaceous' || eraId === 'jurassic' ? '#166534' : '#f1f5f9',
      '#ffffff'
    );

    // Polar ice cap glow on North Pole (if Pleistocene or Holocene)
    if (eraId === 'holocene' || eraId === 'pleistocene' || eraId === 'all') {
      const iceRows = eraId === 'pleistocene' ? 75 : 32;
      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.fillRect(0, 0, width, iceRows);
      ctx.fillRect(0, height - iceRows, width, iceRows);
    }
  }

  const colorTexture = new THREE.CanvasTexture(canvas);
  colorTexture.needsUpdate = true;
  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.needsUpdate = true;

  return { colorTexture, bumpTexture };
}

function RotatingGlobeGroup({
  animals,
  selectedAnimal,
  onSelectAnimal,
  selectedEra,
  showClimateBands,
}: Globe3DProps) {
  const globeRef = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { colorTexture, bumpTexture } = useMemo(
    () => createProceduralEarthTextures(selectedEra),
    [selectedEra]
  );

  useFrame((_, delta) => {
    if (globeRef.current && !hoveredId) {
      globeRef.current.rotation.y += delta * 0.06;
    }
  });

  const radius = 2.25;

  return (
    <group ref={globeRef}>
      {/* Main PBR Earth Sphere */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={colorTexture}
          bumpMap={bumpTexture}
          bumpScale={0.05}
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric Rim Halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.035, 48, 48]} />
        <meshBasicMaterial
          color={selectedEra === 'pleistocene' ? '#7dd3fc' : '#38bdf8'}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Optional Latitudinal Climate Zone Rings */}
      {showClimateBands && (
        <group>
          {/* Equator (0°) - Tropical */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 1.01, 0.012, 16, 100]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.65} />
          </mesh>
          {/* Tropics (+23.5° / -23.5°) */}
          {[23.5, -23.5].map((lat) => {
            const latRad = (lat * Math.PI) / 180;
            const r = radius * 1.01 * Math.cos(latRad);
            const y = radius * 1.01 * Math.sin(latRad);
            return (
              <mesh key={lat} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r, 0.008, 12, 90]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.5} />
              </mesh>
            );
          })}
          {/* Polar Circles (+66.5° / -66.5°) */}
          {[66.5, -66.5].map((lat) => {
            const latRad = (lat * Math.PI) / 180;
            const r = radius * 1.01 * Math.cos(latRad);
            const y = radius * 1.01 * Math.sin(latRad);
            return (
              <mesh key={lat} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r, 0.008, 12, 90]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Animal Habitat & Fossil Dig Site Pins */}
      {animals.map((animal) => {
        const isSelected = animal.id === selectedAnimal.id;
        const isExtinct = animal.temporalStatus === 'extinct';
        const pinColor = isSelected ? '#facc15' : isExtinct ? '#f97316' : '#10b981';

        return animal.coordinates.map((coord, idx) => {
          const pos = latLngToVector3(coord.lat, coord.lng, radius * 1.02);
          const pinKey = `${animal.id}-${idx}`;

          return (
            <group key={pinKey} position={pos}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnimal(animal);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredId(pinKey);
                }}
                onPointerOut={() => setHoveredId(null)}
              >
                <sphereGeometry args={[isSelected ? 0.085 : 0.055, 16, 16]} />
                <meshStandardMaterial
                  color={pinColor}
                  emissive={pinColor}
                  emissiveIntensity={isSelected ? 1.2 : 0.6}
                />
              </mesh>

              {((isSelected && idx === 0) || hoveredId === pinKey) && (
                <SafeHtml3D position={[0, 0.12, 0]} center occlude zIndexRange={[15, 0]}>
                  <button
                    type="button"
                    onClick={() => onSelectAnimal(animal)}
                    className={`px-2 py-1 rounded-md text-[11px] leading-tight font-semibold whitespace-nowrap shadow-lg border backdrop-blur-md transition-transform ${
                      isSelected
                        ? 'bg-amber-400/95 text-slate-950 border-amber-200'
                        : 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{isExtinct ? '🦴 ' : '🐾 '}</span>
                    <span>{animal.commonName}</span>
                    <span className="block text-[9px] opacity-80 font-normal max-w-[220px] truncate">
                      {coord.label}
                    </span>
                  </button>
                </SafeHtml3D>
              )}
            </group>
          );
        });
      })}
    </group>
  );
}

export const Globe3D: React.FC<Globe3DProps> = (props) => {
  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl">
      <Canvas camera={{ position: [0, 1.2, 5.6], fov: 42 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 4, 5]} intensity={1.8} />
        <directionalLight position={[-5, -3, -4]} intensity={0.4} color="#38bdf8" />
        <Stars radius={60} depth={40} count={1800} factor={3} fade />
        <RotatingGlobeGroup {...props} />
        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={8.5}
          rotateSpeed={0.65}
        />
      </Canvas>

      {/* Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs text-slate-300 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Living Habitat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
            Extinct Fossil Site
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block ring-2 ring-amber-400/50" />
            Selected Species
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Drag to spin Earth • Scroll to zoom • Click any pin
        </span>
      </div>
    </div>
  );
};
