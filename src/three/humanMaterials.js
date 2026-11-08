/**
 * Tissue material library for the anatomy viewer.
 *
 * Every BodyParts3D mesh is assigned a physically based MeshPhysicalMaterial tuned to the optical
 * character of the real tissue (wet clear-coat on viscera and vessels, soft sheen on muscle and skin,
 * matte porous bone, glossy enamel), plus procedural micro-relief from shaderChunks.js.
 *
 * Materials are created per (layer, tissue) so each anatomical layer can be faded independently,
 * and highlight variants share the same compiled shader program.
 */

import * as THREE from 'three';
import {
  BUMP_TYPES,
  VERTEX_HEADER,
  DANCE_NORMAL_VERTEX,
  DANCE_VERTEX,
  VERTEX_BODY,
  FRAGMENT_HEADER,
  COLOR_BODY,
  ROUGHNESS_BODY,
  NORMAL_BODY,
  EMISSIVE_BODY,
  PHYSICAL_BODY,
  ALPHA_BODY
} from './humanShaderChunks.js';

// fade: pixel-footprint range (metres) over which micro-relief fades out.
const FINE = [0.00022, 0.0009];
const MEDIUM = [0.0006, 0.0024];

// Subsurface-scattering approximation: per-channel wrapped diffuse for direct lights, patched into
// three's physical lighting chunk. Falls back to stock lighting if the chunk ever changes shape.
const DIFFUSE_LINE = 'reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );';
const SSS_LIGHTS_CHUNK = THREE.ShaderChunk.lights_physical_pars_fragment.includes(DIFFUSE_LINE)
  ? THREE.ShaderChunk.lights_physical_pars_fragment.replace(
      DIFFUSE_LINE,
      `#ifdef TISSUE_SSS
	vec3 sssNL = saturate( ( vec3( dot( geometryNormal, directLight.direction ) ) + uSSSWrap ) / ( 1.0 + uSSSWrap ) );
	reflectedLight.directDiffuse += sssNL * directLight.color * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
	#else
	${DIFFUSE_LINE}
	#endif`
    )
  : null;

// sss: per-channel diffuse wrap (r, g, b). Approximates subsurface scattering: light bleeds past
// the terminator, red furthest, which is what separates living tissue from painted plastic.
export const TISSUES = {
  skin: { color: 0xc68b6b, roughness: 0.5, sheen: 0.4, sheenColor: 0xffc9ad, sheenRoughness: 0.55, clearcoat: 0.06, clearcoatRoughness: 0.6, bump: 'pores', bumpStrength: 0.5, fade: FINE, colorVar: 0.05, sss: [0.5, 0.22, 0.14] },
  lip: { color: 0xb26950, roughness: 0.36, sheen: 0.3, sheenColor: 0xffc0b0, sheenRoughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.35, bump: 'pores', bumpStrength: 0.25, fade: FINE, colorVar: 0.05, sss: [0.55, 0.25, 0.18], decal: true, pickProxy: true },
  hair: { color: 0x2b1d15, roughness: 0.55, sheen: 0.8, sheenColor: 0x7a573d, sheenRoughness: 0.35, bump: 'fiber', fiber: true, bumpStrength: 1.4, fade: FINE, colorVar: 0.08 },
  muscle: { color: 0x611410, roughness: 0.55, clearcoat: 0.22, clearcoatRoughness: 0.26, sheen: 0.3, sheenColor: 0xffc4b8, sheenRoughness: 0.4, bump: 'fiber', fiber: true, bumpStrength: 1.0, fade: FINE, colorVar: 0.06, sss: [0.2, 0.07, 0.05] },
  tendon: { color: 0xd9cdb6, roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.28, sheen: 0.7, sheenColor: 0xffffff, sheenRoughness: 0.3, bump: 'fiber', fiber: true, bumpStrength: 0.7, fade: FINE, colorVar: 0.04, sss: [0.2, 0.18, 0.15] },
  ligament: { color: 0xdcd0b8, roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.32, sheen: 0.55, sheenColor: 0xffffff, bump: 'fiber', fiber: true, bumpStrength: 0.6, fade: FINE, colorVar: 0.04, sss: [0.2, 0.18, 0.15] },
  bone: { color: 0xd2c09c, roughness: 0.66, clearcoat: 0.05, clearcoatRoughness: 0.7, sheen: 0.18, sheenColor: 0xfff4de, sheenRoughness: 0.8, bump: 'bone', bumpStrength: 0.9, fade: FINE, colorVar: 0.06 },
  tooth: { color: 0xf1ecdf, roughness: 0.2, clearcoat: 0.75, clearcoatRoughness: 0.12, colorVar: 0.02, sss: [0.25, 0.23, 0.2] },
  cartilage: { color: 0xd3d9d4, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.22, sheen: 0.45, sheenColor: 0xe6f6ff, bump: 'organ', bumpStrength: 0.25, fade: MEDIUM, colorVar: 0.03, sss: [0.3, 0.3, 0.3] },
  artery: { color: 0xa8121a, roughness: 0.3, clearcoat: 0.75, clearcoatRoughness: 0.18, flow: 1, flowColor: 0xff4a32, colorVar: 0.03, sss: [0.3, 0.06, 0.05] },
  arteryDeoxy: { color: 0x3a3f98, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2, flow: 1, flowColor: 0x7684ff, colorVar: 0.03 },
  vein: { color: 0x23408c, roughness: 0.34, clearcoat: 0.68, clearcoatRoughness: 0.22, flow: -1, flowColor: 0x5d8dff, colorVar: 0.03 },
  veinOxy: { color: 0xa8121a, roughness: 0.3, clearcoat: 0.72, clearcoatRoughness: 0.2, flow: -1, flowColor: 0xff4a32, colorVar: 0.03, sss: [0.3, 0.06, 0.05] },
  nerve: { color: 0xe6c35a, roughness: 0.48, sheen: 0.65, sheenColor: 0xfff1bf, sheenRoughness: 0.4, bump: 'fiber', fiber: true, bumpStrength: 0.5, fade: FINE, colorVar: 0.04, sss: [0.3, 0.25, 0.12] },
  cord: { color: 0xeee2cc, roughness: 0.45, sheen: 0.5, sheenColor: 0xffffff, clearcoat: 0.3, colorVar: 0.03, sss: [0.3, 0.26, 0.2] },
  brain: { color: 0xd6a59c, roughness: 0.48, clearcoat: 0.38, clearcoatRoughness: 0.4, sheen: 0.45, sheenColor: 0xffdcd4, sheenRoughness: 0.5, bump: 'organ', bumpStrength: 0.35, fade: MEDIUM, colorVar: 0.06, sss: [0.35, 0.18, 0.14] },
  dura: { color: 0xd9d2c8, roughness: 0.42, clearcoat: 0.45, opacity: 0.55, colorVar: 0.03 },
  csf: { color: 0x7fb4e4, roughness: 0.18, clearcoat: 0.85, clearcoatRoughness: 0.08, opacity: 0.6, colorVar: 0.02 },
  heart: { color: 0x8a1c19, roughness: 0.36, clearcoat: 0.6, clearcoatRoughness: 0.26, sheen: 0.4, sheenColor: 0xff9b8b, bump: 'fiber', fiber: true, bumpStrength: 0.55, fade: FINE, colorVar: 0.07, sss: [0.22, 0.08, 0.06] },
  lung: { color: 0xc98a84, roughness: 0.6, clearcoat: 0.28, clearcoatRoughness: 0.45, sheen: 0.75, sheenColor: 0xffd7ce, sheenRoughness: 0.5, bump: 'spongy', bumpStrength: 0.7, fade: FINE, colorVar: 0.09, sss: [0.4, 0.22, 0.18] },
  airway: { color: 0xddd0c3, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3, bump: 'organ', bumpStrength: 0.3, fade: MEDIUM, colorVar: 0.03, sss: [0.3, 0.26, 0.22] },
  liver: { color: 0x681a14, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.16, bump: 'organ', bumpStrength: 0.35, fade: MEDIUM, colorVar: 0.06, sss: [0.18, 0.06, 0.05] },
  gallbladder: { color: 0x4d7a2e, roughness: 0.28, clearcoat: 0.85, clearcoatRoughness: 0.12, colorVar: 0.04, sss: [0.2, 0.25, 0.12] },
  stomach: { color: 0xc8826f, roughness: 0.4, clearcoat: 0.62, clearcoatRoughness: 0.24, bump: 'organ', bumpStrength: 0.4, fade: MEDIUM, colorVar: 0.06, sss: [0.32, 0.16, 0.12] },
  intestine: { color: 0xd79a85, roughness: 0.38, clearcoat: 0.66, clearcoatRoughness: 0.22, bump: 'organ', bumpStrength: 0.35, fade: MEDIUM, colorVar: 0.06, sss: [0.32, 0.16, 0.12] },
  colon: { color: 0xc48770, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.25, bump: 'organ', bumpStrength: 0.4, fade: MEDIUM, colorVar: 0.06, sss: [0.32, 0.16, 0.12] },
  pancreas: { color: 0xdfb187, roughness: 0.5, clearcoat: 0.42, bump: 'lobular', bumpStrength: 0.8, fade: MEDIUM, colorVar: 0.06, sss: [0.3, 0.2, 0.12] },
  kidney: { color: 0x782217, roughness: 0.3, clearcoat: 0.72, clearcoatRoughness: 0.2, bump: 'organ', bumpStrength: 0.25, fade: MEDIUM, colorVar: 0.05, sss: [0.18, 0.06, 0.05] },
  bladder: { color: 0xd7ad8c, roughness: 0.42, clearcoat: 0.52, colorVar: 0.04, sss: [0.3, 0.2, 0.14] },
  spleen: { color: 0x581526, roughness: 0.34, clearcoat: 0.62, colorVar: 0.05, sss: [0.18, 0.06, 0.06] },
  eye: { color: 0xf1ebe4, roughness: 0.16, clearcoat: 1.0, clearcoatRoughness: 0.03, colorVar: 0.01, sss: [0.25, 0.2, 0.18] },
  iris: { color: 0x5b3a22, roughness: 0.4, clearcoat: 1.0, clearcoatRoughness: 0.02, bump: 'fiber', fiber: false, bumpStrength: 0.4, colorVar: 0.08 },
  // Seen through the pupil, the lens and the eye's interior read as black.
  pupil: { color: 0x050404, roughness: 0.06, clearcoat: 1.0, clearcoatRoughness: 0.02, colorVar: 0 },
  // Black diffuse so the cornea adds only its wet reflection, not a milky veil.
  cornea: { color: 0x000000, roughness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.0, opacity: 0.18, colorVar: 0 },
  gland: { color: 0xd39868, roughness: 0.45, clearcoat: 0.4, bump: 'lobular', bumpStrength: 0.6, fade: MEDIUM, colorVar: 0.05, sss: [0.3, 0.18, 0.12] },
  tongue: { color: 0xc45f5a, roughness: 0.55, clearcoat: 0.42, bump: 'organ', bumpStrength: 0.5, fade: FINE, colorVar: 0.05, sss: [0.3, 0.12, 0.1] },
  mesentery: { color: 0xe6c47f, roughness: 0.38, clearcoat: 0.55, opacity: 0.88, bump: 'lobular', bumpStrength: 0.4, fade: MEDIUM, colorVar: 0.06, sss: [0.35, 0.3, 0.2] },
  reproductive: { color: 0xc45e5e, roughness: 0.38, clearcoat: 0.58, clearcoatRoughness: 0.22, sheen: 0.45, sheenColor: 0xffb8b8, bump: 'organ', bumpStrength: 0.35, fade: MEDIUM, colorVar: 0.05, sss: [0.42, 0.16, 0.14] },
  organ: { color: 0xbf796b, roughness: 0.45, clearcoat: 0.45, colorVar: 0.05, sss: [0.3, 0.14, 0.1] }
};

// Lip colour follows the chosen skin tone (vermilion = skin with more blood showing).
export function lipColorFor(skinHex) {
  const c = new THREE.Color(skinHex);
  return new THREE.Color(c.r * 0.78, c.g * 0.48, c.b * 0.50);
}

export const SKIN_TONES = {
  light: 0xe8b99c,
  medium: 0xc68b6b,
  tan: 0xa8714f,
  brown: 0x7d4c32,
  deep: 0x4e2e1f
};

export class TissueMaterialLibrary {
  constructor() {
    // Uniforms shared by every tissue material (updated once per frame).
    const tendonCol = new THREE.Color(TISSUES.tendon.color);
    this.shared = {
      uFlowTime: { value: 0 },
      uBeat: { value: 0 },
      uHeartPos: { value: new THREE.Vector3(0, 1.3, 0.05) },
      uFlowIntensity: { value: 1.0 },
      uDanceMix: { value: 0 },
      uDancePhase: { value: 0 },
      // Facial flush landmarks (xyz + radius); set from the skin mesh once it loads.
      uFlushPts: { value: Array.from({ length: 5 }, () => new THREE.Vector4(0, 0, 0, 0)) },
      uFlush: { value: 0 },
      // Lip center (xyz + active flag w) & vermilion tint rendered smoothly onto the skin surface.
      uLipPos: { value: new THREE.Vector4(0, 1.535, 0.088, 0) },
      uLipColor: { value: lipColorFor(TISSUES.skin.color) },
      uTendonLook: { value: new THREE.Vector4(tendonCol.r, tendonCol.g, tendonCol.b, TISSUES.tendon.roughness) },
      uTendonCoat: {
        value: new THREE.Vector4(
          TISSUES.tendon.clearcoat,
          TISSUES.tendon.clearcoatRoughness,
          TISSUES.tendon.sheen,
          TISSUES.tendon.sheenRoughness
        )
      },
      uTendonFocus: { value: 0 },
      uHumanRootInv: { value: new THREE.Matrix4() }
    };
    this.materials = new Map(); // key -> { base, variants: {hover, selected, ghost}, def, layer }
    this.byLayer = new Map();
    this.layerOpacity = new Map();
    this.bumpScale = 1;
    this.skinTone = TISSUES.skin.color;
  }

  get(layer, tissue) {
    const key = `${layer}:${tissue}`;
    if (!this.materials.has(key)) {
      const def = TISSUES[tissue] || TISSUES.organ;
      const entry = {
        def,
        layer,
        tissue,
        base: this._create(def, 0),
        variants: {
          hover: this._create(def, 1),
          selected: this._create(def, 2),
          ghost: this._create(def, 3)
        }
      };
      this.materials.set(key, entry);
      if (!this.byLayer.has(layer)) this.byLayer.set(layer, []);
      this.byLayer.get(layer).push(entry);
      this._applyOpacity(entry, this.layerOpacity.get(layer) ?? 1);
    }
    return this.materials.get(key);
  }

  _create(def, variant) {
    const isLip = def === TISSUES.lip;
    const mat = new THREE.MeshPhysicalMaterial({
      color: isLip ? lipColorFor(this.skinTone) : def.color,
      roughness: def.roughness ?? 0.5,
      metalness: 0,
      clearcoat: def.clearcoat ?? 0,
      clearcoatRoughness: def.clearcoatRoughness ?? 0.3,
      sheen: def.sheen ?? 0,
      sheenColor: new THREE.Color(def.sheenColor ?? 0xffffff),
      sheenRoughness: def.sheenRoughness ?? 0.5,
      side: isLip ? THREE.FrontSide : THREE.DoubleSide,
      envMapIntensity: 1.0
    });
    if (def.decal) {
      // Coincides with the skin surface: pull it slightly towards the camera so it always wins.
      mat.polygonOffset = true;
      mat.polygonOffsetFactor = -1;
      mat.polygonOffsetUnits = -4;
    }
    const bumpType = BUMP_TYPES[def.bump || 'none'] || 0;
    mat.defines = { TISSUE_BUMP_TYPE: bumpType };
    if (def.fiber) mat.defines.TISSUE_FIBER = '';
    if (def.flow) mat.defines.TISSUE_FLOW = '';
    if (def.sss && SSS_LIGHTS_CHUNK) mat.defines.TISSUE_SSS = '';
    if (def === TISSUES.skin) mat.defines.TISSUE_SKIN = '';
    if (def === TISSUES.muscle) mat.defines.TISSUE_TENDON_BLEND = '';
    if (def === TISSUES.tendon || def === TISSUES.ligament) mat.defines.TISSUE_TENDON_PART = '';

    const uniforms = {
      uBumpStrength: { value: (def.bumpStrength ?? 0) * this.bumpScale },
      uBumpFade: { value: new THREE.Vector2(...(def.fade || MEDIUM)) },
      uColorVar: { value: def.colorVar ?? 0.04 },
      uXray: { value: variant === 3 ? 1 : 0 },
      uXrayCenter: { value: 0.25 },
      uFlowColor: { value: new THREE.Color(def.flowColor ?? 0x000000) },
      uFlowDir: { def: def.flow ?? 0, value: def.flow ?? 0 },
      uHighlightColor: { value: new THREE.Color(variant === 2 ? 0x2bb5ff : 0xfff1c9) },
      uHighlight: { value: variant === 2 ? 0.42 : variant === 1 ? 0.16 : 0 },
      uSSSWrap: { value: new THREE.Vector3(...(def.sss || [0, 0, 0])) }
    };
    mat.userData.uniforms = uniforms;
    // The skin mesh already has a smooth, closed lip surface; FJ2814 (lip) is kept as an invisible
    // raycast proxy in its base state and only renders visibly when hovered or selected.
    mat.userData.baseOpacity = def.pickProxy && (variant === 0 || variant === 3) ? 0 : variant === 3 ? 0.13 : (def.opacity ?? 1);
    mat.userData.pickProxyBase = !!(def.pickProxy && (variant === 0 || variant === 3));
    mat.userData.isGhost = variant === 3;

    const shared = this.shared;
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${VERTEX_HEADER}`)
        .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${DANCE_NORMAL_VERTEX}`)
        .replace('#include <project_vertex>', `#include <project_vertex>\n${VERTEX_BODY}`);
      let fs = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${FRAGMENT_HEADER}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n${COLOR_BODY}`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${ROUGHNESS_BODY}`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${NORMAL_BODY}`)
        .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>\n${PHYSICAL_BODY}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${EMISSIVE_BODY}`)
        .replace('#include <opaque_fragment>', `${ALPHA_BODY}\n#include <opaque_fragment>`);
      // Same source for every tissue (the wrap is #ifdef TISSUE_SSS), so one cache key still holds.
      if (SSS_LIGHTS_CHUNK) fs = fs.replace('#include <lights_physical_pars_fragment>', SSS_LIGHTS_CHUNK);
      shader.fragmentShader = fs;
    };
    mat.customProgramCacheKey = () => 'anatomy-tissue-v4';
    return mat;
  }

  applyDanceToMaterial(mat) {
    const shared = this.shared;
    mat.defines = { ...(mat.defines || {}), TISSUE_GARMENT: '' };
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, shared);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${VERTEX_HEADER}`)
        .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${DANCE_NORMAL_VERTEX}`)
        .replace('#include <project_vertex>', `#include <project_vertex>\n${DANCE_VERTEX}`);
    };
    mat.customProgramCacheKey = () => 'anatomy-garment-dance-v2';
    return mat;
  }

  setTendonFocus(val) {
    this.shared.uTendonFocus.value = val;
  }

  setLayerOpacity(layer, opacity) {
    this.layerOpacity.set(layer, opacity);
    for (const entry of this.byLayer.get(layer) || []) this._applyOpacity(entry, opacity);
  }

  _applyOpacity(entry, layerOpacity) {
    const isSkin = entry.layer === 'skin';
    for (const mat of [entry.base, entry.variants.hover, entry.variants.selected, entry.variants.ghost]) {
      const o = mat.userData.baseOpacity * layerOpacity;
      const transparent = o < 0.995;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.opacity = o;
      // Ghosted layers or invisible pick-proxy base materials don't write depth.
      mat.depthWrite = !mat.userData.pickProxyBase && !mat.userData.isGhost && (!transparent || (o > 0.8 && !isSkin));
      mat.colorWrite = !mat.userData.pickProxyBase;
      mat.userData.uniforms.uXray.value = mat.userData.isGhost || (transparent && layerOpacity < 0.98) ? 1 : 0;
      mat.userData.uniforms.uXrayCenter.value = isSkin ? 0.18 : mat.userData.isGhost ? 0.22 : 0.35;
      // Skin is drawn single-sided when ghosted to avoid back-face double layering.
      const side = (isSkin && transparent) || entry.tissue === 'lip' ? THREE.FrontSide : THREE.DoubleSide;
      if (mat.side !== side) {
        mat.side = side;
        mat.needsUpdate = true;
      }
    }
  }

  setSkinTone(hex) {
    this.skinTone = hex;
    const lip = lipColorFor(hex);
    this.shared.uLipColor.value.copy(lip);
    for (const entry of this.materials.values()) {
      if (entry.tissue !== 'skin' && entry.tissue !== 'lip') continue;
      for (const mat of [entry.base, entry.variants.hover, entry.variants.selected, entry.variants.ghost]) {
        if (entry.tissue === 'lip') mat.color.copy(lip);
        else mat.color.setHex(hex);
      }
    }
  }

  setDetail(enabled) {
    this.bumpScale = enabled ? 1 : 0;
    for (const entry of this.materials.values()) {
      for (const mat of [entry.base, entry.variants.hover, entry.variants.selected, entry.variants.ghost]) {
        mat.userData.uniforms.uBumpStrength.value = (entry.def.bumpStrength ?? 0) * this.bumpScale;
      }
    }
  }

  allMaterials() {
    const list = [];
    for (const entry of this.materials.values()) {
      list.push(entry.base, entry.variants.hover, entry.variants.selected, entry.variants.ghost);
    }
    return list;
  }
}
