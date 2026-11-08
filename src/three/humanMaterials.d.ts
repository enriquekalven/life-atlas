import * as THREE from 'three';

export const SKIN_TONES: Record<
  string,
  { skin: number; lip: number; sss: [number, number, number] }
>;

export class TissueMaterialLibrary {
  shared: {
    uFlowTime: { value: number };
    uBeat: { value: number };
    uHeartPos: { value: THREE.Vector3 };
    uFlowIntensity: { value: number };
    uTendonFocus: { value: number };
    uFlushPts: { value: THREE.Vector4[] };
    uFlush: { value: number };
    uLipPos: { value: THREE.Vector4 };
    uLipColor: { value: THREE.Color };
    uDanceMix: { value: number };
    uDancePhase: { value: number };
    uHumanRootInv: { value: THREE.Matrix4 };
  };
  constructor();
  get(
    layer: string,
    tissue: string
  ): {
    layer: string;
    tissue: string;
    def: {
      color: number;
      roughness: number;
      fiber?: boolean;
      pickProxy?: boolean;
      [key: string]: unknown;
    };
    base: THREE.MeshPhysicalMaterial;
    variants: {
      base: THREE.MeshPhysicalMaterial;
      hover: THREE.MeshPhysicalMaterial;
      selected: THREE.MeshPhysicalMaterial;
      ghost: THREE.MeshPhysicalMaterial;
    };
  };
  applyDanceToMaterial(mat: THREE.Material): THREE.Material;
  setLayerOpacity(layer: string, opacity: number): void;
  setDetail(enabled: boolean): void;
  setSkinTone(preset: { skin: number; lip: number; sss: [number, number, number] }): void;
  allMaterials(): THREE.Material[];
}
