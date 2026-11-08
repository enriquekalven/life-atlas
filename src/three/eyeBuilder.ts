import * as THREE from 'three';
import { OcularBiologyProfile } from '../data/ocularBiology';

export interface EyeTextureSet {
  irisMap: THREE.Texture;
  irisBumpMap: THREE.Texture;
  scleraMap: THREE.Texture;
  dispose: () => void;
}

const eyeTextureCache = new Map<string, EyeTextureSet>();

function hexToRgb(hex: string): [number, number, number] {
  const c = new THREE.Color(hex || '#d97706');
  return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)];
}

function makeFallbackDataTexture(hex: string): THREE.DataTexture {
  const [r, g, b] = hexToRgb(hex);
  const data = new Uint8Array(16 * 16 * 4);
  for (let i = 0; i < 16 * 16; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, 16, 16);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a high-definition 512x512 polar iris/pupil/limbus texture + 512x512 stromal bump map
 * and a 512x256 vascularized sclera texture for a species' OcularBiologyProfile.
 */
export function getOrCreateEyeTextures(
  speciesId: string,
  profile: OcularBiologyProfile
): EyeTextureSet {
  const cacheKey = `${speciesId}:${profile.pupilType}:${profile.irisPrimaryHex}:${profile.irisSecondaryHex}:${profile.scleraHex}`;
  const cached = eyeTextureCache.get(cacheKey);
  if (cached) return cached;

  if (typeof document === 'undefined') {
    const fb = makeFallbackDataTexture(profile.irisPrimaryHex);
    const set = { irisMap: fb, irisBumpMap: fb, scleraMap: fb, dispose: () => fb.dispose() };
    eyeTextureCache.set(cacheKey, set);
    return set;
  }

  const irisCanvas = document.createElement('canvas');
  irisCanvas.width = 512;
  irisCanvas.height = 512;
  const ctx = irisCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bctx = bumpCanvas.getContext('2d');

  const scleraCanvas = document.createElement('canvas');
  scleraCanvas.width = 512;
  scleraCanvas.height = 256;
  const sctx = scleraCanvas.getContext('2d');

  if (!ctx || !bctx || !sctx) {
    const fb = makeFallbackDataTexture(profile.irisPrimaryHex);
    const set = { irisMap: fb, irisBumpMap: fb, scleraMap: fb, dispose: () => fb.dispose() };
    eyeTextureCache.set(cacheKey, set);
    return set;
  }

  const cx = 256;
  const cy = 256;
  const maxR = 240;

  // ============================================================================
  // 1. VASCULARIZED SCLERA TEXTURE (512 x 256)
  // ============================================================================
  sctx.fillStyle = profile.scleraHex || '#f1ece4';
  sctx.fillRect(0, 0, 512, 256);

  // Subtle episcleral shading gradient toward posterior pole & insertion of rectus muscles
  const sGrad = sctx.createLinearGradient(0, 0, 512, 256);
  sGrad.addColorStop(0, 'rgba(185, 140, 125, 0.16)');
  sGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
  sGrad.addColorStop(1, 'rgba(120, 95, 85, 0.22)');
  sctx.fillStyle = sGrad;
  sctx.fillRect(0, 0, 512, 256);

  // Branching episcleral blood vessels (anterior ciliary arteries & conjunctival plexus)
  for (let i = 0; i < 48; i++) {
    let vx = (i / 48) * 512;
    let vy = (i % 2 === 0 ? 0.15 : 0.85) * 256 + Math.sin(i * 1.7) * 28;
    sctx.beginPath();
    sctx.moveTo(vx, vy);
    sctx.strokeStyle = i % 3 === 0 ? 'rgba(185, 28, 28, 0.26)' : 'rgba(220, 38, 38, 0.16)';
    sctx.lineWidth = i % 4 === 0 ? 1.35 : 0.75;
    for (let step = 0; step < 8; step++) {
      vx += Math.cos(i * 2.3 + step * 0.9) * 14;
      vy += (vy < 128 ? 1 : -1) * (8 + Math.sin(step * 1.4 + i) * 5);
      sctx.lineTo(vx, vy);
    }
    sctx.stroke();
  }

  // ============================================================================
  // 2. POLAR IRIS, LIMBUS, SCLERAL OSSICLES & PUPIL TEXTURE (512 x 512)
  // ============================================================================
  ctx.fillStyle = profile.scleraHex || '#f1ece4';
  ctx.fillRect(0, 0, 512, 512);

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);

  if (profile.pupilType === 'compound' || profile.pupilType === 'trinocular-compound') {
    // --------------------------------------------------------------------------
    // ARTHROPOD / MANTIS SHRIMP / ANOMALOCARIS / MEGANEURA COMPOUND EYE
    // --------------------------------------------------------------------------
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxR);
    bgGrad.addColorStop(0, profile.irisSecondaryHex);
    bgGrad.addColorStop(0.58, profile.irisPrimaryHex);
    bgGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Draw hexagonal ommatidia honeycomb lattice across the entire hemisphere
    const hexR = profile.pupilType === 'trinocular-compound' ? 6.5 : 5.5;
    const dx = hexR * 1.732;
    const dy = hexR * 1.5;

    for (let row = -48; row <= 48; row++) {
      for (let col = -48; col <= 48; col++) {
        const hx = cx + col * dx + (row % 2 === 0 ? 0 : dx * 0.5);
        const hy = cy + row * dy;
        const dist = Math.hypot(hx - cx, hy - cy);
        if (dist > maxR + 12) continue;

        // Mantis shrimp 6-row equatorial Midband (specialized UV + circular polarization rows!)
        const inMidband = profile.pupilType === 'trinocular-compound' && Math.abs(hy - cy) < hexR * 4.4;

        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3 + Math.PI / 6;
          const px = hx + Math.cos(ang) * (hexR - 0.65);
          const py = hy + Math.sin(ang) * (hexR - 0.65);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (inMidband) {
          const bandRow = Math.floor((hy - (cy - hexR * 4.4)) / (hexR * 1.45));
          const midColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#a855f7', '#fb7185', '#34d399'];
          ctx.fillStyle = midColors[Math.abs(bandRow) % midColors.length];
        } else {
          const shade = 0.72 + 0.28 * Math.cos((dist / maxR) * Math.PI * 0.85);
          const [r, g, b] = hexToRgb(dist < maxR * 0.55 ? profile.irisSecondaryHex : profile.irisPrimaryHex);
          ctx.fillStyle = `rgb(${Math.round(r * shade)}, ${Math.round(g * shade)}, ${Math.round(b * shade)})`;
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(8, 12, 20, 0.72)';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Bump map dome for each ommatidial corneal facet
        bctx.beginPath();
        bctx.arc(hx, hy, hexR * 0.75, 0, Math.PI * 2);
        bctx.fillStyle = inMidband ? '#dcdcdc' : '#b8b8b8';
        bctx.fill();
      }
    }

    // Characteristic dark Pseudopupils (1 central for insects/Anomalocaris, 3 simultaneous for Mantis Shrimp!)
    const pseudoSpots =
      profile.pupilType === 'trinocular-compound'
        ? [
            { x: cx, y: cy - 74, rx: 28, ry: 18 },
            { x: cx, y: cy, rx: 34, ry: 14 },
            { x: cx, y: cy + 74, rx: 28, ry: 18 },
          ]
        : [{ x: cx, y: cy, rx: 52, ry: 52 }];

    for (const sp of pseudoSpots) {
      const pGrad = ctx.createRadialGradient(sp.x, sp.y, 2, sp.x, sp.y, Math.max(sp.rx, sp.ry));
      pGrad.addColorStop(0, 'rgba(4, 6, 12, 0.95)');
      pGrad.addColorStop(0.55, 'rgba(8, 15, 28, 0.78)');
      pGrad.addColorStop(1, 'rgba(8, 15, 28, 0.0)');
      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.scale(1, sp.ry / sp.rx);
      ctx.beginPath();
      ctx.arc(0, 0, sp.rx, 0, Math.PI * 2);
      ctx.fillStyle = pGrad;
      ctx.fill();
      ctx.restore();
    }
  } else {
    // --------------------------------------------------------------------------
    // VERTEBRATE & CEPHALOPOD CAMERA-TYPE EYE
    // --------------------------------------------------------------------------
    const irisOuterR = 196;
    const collaretteR = 98;

    // Outer pericorneal vascular plexus & scleral capillaries radiating outside the limbus
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2 + (i % 3) * 0.04;
      const r0 = irisOuterR + 2;
      const r1 = maxR + 14;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      const midA = a + Math.sin(i * 2.1) * 0.06;
      ctx.quadraticCurveTo(
        cx + Math.cos(midA) * ((r0 + r1) * 0.5),
        cy + Math.sin(midA) * ((r0 + r1) * 0.5),
        cx + Math.cos(a + 0.03) * r1,
        cy + Math.sin(a + 0.03) * r1
      );
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(185, 28, 28, 0.24)' : 'rgba(153, 27, 27, 0.14)';
      ctx.lineWidth = i % 4 === 0 ? 1.4 : 0.8;
      ctx.stroke();
    }

    // Optional Bony Scleral Ossicle Ring (15 overlapping trapezoidal plates in reptiles, birds, ichthyosaurs, placoderms)
    if (profile.hasScleralOssicles) {
      const ossicleCount = 15;
      for (let i = 0; i < ossicleCount; i++) {
        const a0 = (i / ossicleCount) * Math.PI * 2;
        const a1 = ((i + 0.94) / ossicleCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, irisOuterR + 26, a0, a1);
        ctx.arc(cx, cy, irisOuterR - 4, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? 'rgba(214, 206, 186, 0.52)' : 'rgba(192, 182, 160, 0.48)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(72, 60, 44, 0.55)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    // Base radial iris pigmentation (Limbal dark ring -> Primary ciliary stroma -> Secondary collarette -> Pupillary ruff)
    const irisGrad = ctx.createRadialGradient(cx, cy, 24, cx, cy, irisOuterR + 8);
    irisGrad.addColorStop(0, '#1c1008');
    irisGrad.addColorStop(0.24, profile.irisSecondaryHex);
    irisGrad.addColorStop(0.48, profile.irisSecondaryHex);
    irisGrad.addColorStop(0.82, profile.irisPrimaryHex);
    irisGrad.addColorStop(0.95, '#0f141c'); // Dark limbal ring
    irisGrad.addColorStop(1, profile.scleraHex);

    ctx.beginPath();
    ctx.arc(cx, cy, irisOuterR + 6, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // 320 Radial Iris Stroma Trabeculae & Crypts of Fuchs
    const [pR, pG, pB] = hexToRgb(profile.irisPrimaryHex);
    const [sR, sG, sB] = hexToRgb(profile.irisSecondaryHex);

    for (let i = 0; i < 320; i++) {
      const angle = (i / 320) * Math.PI * 2;
      const wave = Math.sin(i * 3.7) * 0.035;
      const innerR = 32 + (i % 5) * 4;
      const outerR = irisOuterR - 4 - (i % 7) * 2;
      const midR = (innerR + outerR) * 0.5;

      const x0 = cx + Math.cos(angle) * innerR;
      const y0 = cy + Math.sin(angle) * innerR;
      const xm = cx + Math.cos(angle + wave) * midR;
      const ym = cy + Math.sin(angle + wave) * midR;
      const x1 = cx + Math.cos(angle) * outerR;
      const y1 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(xm, ym, x1, y1);

      if (i % 5 === 0) {
        // Deep stromal crypt shadow
        ctx.strokeStyle = `rgba(${Math.max(0, pR - 75)}, ${Math.max(0, pG - 75)}, ${Math.max(0, pB - 75)}, 0.55)`;
        ctx.lineWidth = 2.2;
      } else if (i % 2 === 0) {
        // Bright collagen trabecula fiber
        ctx.strokeStyle = `rgba(${Math.min(255, sR + 28)}, ${Math.min(255, sG + 24)}, ${Math.min(255, sB + 18)}, 0.46)`;
        ctx.lineWidth = 1.25;
      } else {
        ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, 0.42)`;
        ctx.lineWidth = 1.0;
      }
      ctx.stroke();

      // Bump map radial fiber relief
      bctx.beginPath();
      bctx.moveTo(x0, y0);
      bctx.quadraticCurveTo(xm, ym, x1, y1);
      bctx.strokeStyle = i % 5 === 0 ? '#454545' : i % 2 === 0 ? '#c8c8c8' : '#8c8c8c';
      bctx.lineWidth = i % 5 === 0 ? 2.0 : 1.2;
      bctx.stroke();
    }

    // Irregular Autonomic Collarette Ring (zigzag boundary between sphincter & dilator pupillae)
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const r = collaretteR + Math.sin(i * 6) * 7 + Math.cos(i * 11) * 4;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${Math.min(255, sR + 45)}, ${Math.min(255, sG + 35)}, ${Math.min(255, sB + 20)}, 0.62)`;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Concentric contraction furrows in ciliary zone
    for (const furrowR of [132, 162]) {
      ctx.beginPath();
      ctx.arc(cx, cy, furrowR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(15, 20, 28, 0.24)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Dark Limbal Transition Ring
    const limbalGrad = ctx.createRadialGradient(cx, cy, irisOuterR - 18, cx, cy, irisOuterR + 6);
    limbalGrad.addColorStop(0, 'rgba(10, 14, 22, 0)');
    limbalGrad.addColorStop(0.7, 'rgba(10, 14, 22, 0.78)');
    limbalGrad.addColorStop(1, 'rgba(10, 14, 22, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, irisOuterR + 6, 0, Math.PI * 2);
    ctx.fillStyle = limbalGrad;
    ctx.fill();

    // --------------------------------------------------------------------------
    // SPECIES-ACCURATE PUPIL APERTURE & TAPETUM LUCIDUM FUNDUS GLOW
    // --------------------------------------------------------------------------
    ctx.save();
    ctx.beginPath();
    if (profile.pupilType === 'slit') {
      // Vertical biconvex ambush slit (Crocodilians, Snakes, Gorgonopsid)
      ctx.moveTo(cx, cy - 118);
      ctx.quadraticCurveTo(cx + 32, cy, cx, cy + 118);
      ctx.quadraticCurveTo(cx - 32, cy, cx, cy - 118);
    } else if (profile.pupilType === 'hslit') {
      // Horizontal rectangular/oval ungulate & cetacean pupil
      ctx.roundRect(cx - 105, cy - 34, 210, 68, 30);
    } else if (profile.pupilType === 'w-cephalopod') {
      // Iconic Giant Pacific Octopus W-shaped / U-ribbon horizontal slit pupil
      ctx.moveTo(cx - 118, cy - 26);
      ctx.bezierCurveTo(cx - 72, cy + 36, cx - 32, cy + 32, cx, cy - 10);
      ctx.bezierCurveTo(cx + 32, cy + 32, cx + 72, cy + 36, cx + 118, cy - 26);
      ctx.bezierCurveTo(cx + 95, cy + 52, cx + 38, cy + 54, cx, cy + 18);
      ctx.bezierCurveTo(cx - 38, cy + 54, cx - 95, cy + 52, cx - 118, cy - 26);
    } else {
      // Circular pupil (Human, Tiger, Smilodon, Elephant, Mammoth, Shark, Falcon, Ichthyosaur)
      ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    }
    ctx.closePath();

    // Pigmented Pupillary Ruff (velvety mahogany border around pupil)
    ctx.strokeStyle = 'rgba(42, 18, 8, 0.92)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Deep retinal fundus / Tapetum lucidum glow inside pupil
    const pFill = ctx.createRadialGradient(cx - 10, cy - 10, 4, cx, cy, 95);
    if (profile.tapetumColor) {
      const [tR, tG, tB] = hexToRgb(profile.tapetumColor);
      pFill.addColorStop(0, `rgba(${tR}, ${tG}, ${tB}, 0.28)`);
      pFill.addColorStop(0.38, 'rgba(8, 12, 22, 0.96)');
      pFill.addColorStop(1, '#020409');
    } else {
      pFill.addColorStop(0, '#090d16');
      pFill.addColorStop(1, '#020306');
    }
    ctx.fillStyle = pFill;
    ctx.fill();
    ctx.restore();
  }

  // Dual Purkinje Corneal Specular Catchlights baked softly for guaranteed wet glint at any angle
  const glint1 = ctx.createRadialGradient(cx - 54, cy - 58, 1, cx - 54, cy - 58, 26);
  glint1.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
  glint1.addColorStop(0.45, 'rgba(255, 255, 255, 0.22)');
  glint1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glint1;
  ctx.beginPath();
  ctx.arc(cx - 54, cy - 58, 26, 0, Math.PI * 2);
  ctx.fill();

  const glint2 = ctx.createRadialGradient(cx + 46, cy + 48, 1, cx + 46, cy + 48, 12);
  glint2.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
  glint2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glint2;
  ctx.beginPath();
  ctx.arc(cx + 46, cy + 48, 12, 0, Math.PI * 2);
  ctx.fill();

  const irisMap = new THREE.CanvasTexture(irisCanvas);
  irisMap.colorSpace = THREE.SRGBColorSpace;
  irisMap.anisotropy = 8;
  irisMap.needsUpdate = true;

  const irisBumpMap = new THREE.CanvasTexture(bumpCanvas);
  irisBumpMap.needsUpdate = true;

  const scleraMap = new THREE.CanvasTexture(scleraCanvas);
  scleraMap.colorSpace = THREE.SRGBColorSpace;
  scleraMap.wrapS = scleraMap.wrapT = THREE.RepeatWrapping;
  scleraMap.needsUpdate = true;

  const set: EyeTextureSet = {
    irisMap,
    irisBumpMap,
    scleraMap,
    dispose: () => {
      irisMap.dispose();
      irisBumpMap.dispose();
      scleraMap.dispose();
    },
  };
  eyeTextureCache.set(cacheKey, set);
  return set;
}

/**
 * Builds a spherical anterior iris cap facing +Z with distortion-free planar polar UVs
 * so the 512x512 iris canvas maps directly onto the front of the eyeball.
 */
export function createPolarIrisCapGeometry(
  radius = 1.0,
  halfAngleRad = Math.PI * 0.36,
  radialSegs = 48,
  ringSegs = 28
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius, radialSegs, ringSegs, 0, Math.PI * 2, 0, halfAngleRad);
  // Rotate from +Y pole to +Z optical axis
  geo.rotateX(Math.PI / 2);

  const pos = geo.getAttribute('position');
  const uv = geo.getAttribute('uv');
  const maxSin = Math.sin(halfAngleRad) * radius;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const u = 0.5 + (x / (maxSin * 2.02));
    const v = 0.5 + (y / (maxSin * 2.02));
    uv.setXY(i, THREE.MathUtils.clamp(u, 0.01, 0.99), THREE.MathUtils.clamp(v, 0.01, 0.99));
  }
  uv.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * Computes the natural outward + forward optical gaze direction for an animal's eye
 * based on its taxonomic archetype and eye lateral position (z > 0 = left, z < 0 = right).
 */
export function computeSpeciesEyeGazeDirection(archetype: string, animalId: string, eyeZ: number): THREE.Vector3 {
  const side = eyeZ >= 0 ? 1 : -1;
  if (animalId === 'homo-sapiens') {
    // Human eyes face almost straight forward (+X) with slight binocular convergence readiness
    return new THREE.Vector3(0.98, 0.02, side * 0.18).normalize();
  }
  if (archetype === 'feline_predator' || archetype === 'ursid') {
    // Forward-facing stereoscopic predator eyes (+X dominant, ~32 deg lateral)
    return new THREE.Vector3(0.84, 0.04, side * 0.54).normalize();
  }
  if (archetype === 'crocodilian' || archetype === 'amphibian') {
    // Dorsolateral periscopic eyes (+X forward, +Y upward, ±Z lateral)
    return new THREE.Vector3(0.56, 0.28, side * 0.78).normalize();
  }
  if (archetype === 'avian_raptor') {
    // Binocular-capable raptor eyes
    return new THREE.Vector3(0.74, 0.05, side * 0.67).normalize();
  }
  // Panoramic / lateral marine, proboscidean, cephalopod & arthropod eyes
  return new THREE.Vector3(0.46, 0.06, side * 0.88).normalize();
}
