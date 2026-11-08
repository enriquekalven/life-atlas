/**
 * GLSL chunks injected into three.js MeshPhysicalMaterial (via onBeforeCompile) to give the
 * untextured BodyParts3D meshes realistic, resolution-independent tissue micro-detail.
 *
 * All procedural detail is evaluated in world space (metres), so it never stretches and needs no UVs.
 * The shader source is identical for every tissue; variation comes only from #defines
 * (TISSUE_BUMP_TYPE, TISSUE_FIBER, TISSUE_FLOW, TISSUE_TENDON_BLEND, TISSUE_TENDON_PART), which
 * three.js includes in its program cache key.
 *
 * Simplex noise: Ashima Arts / Stefan Gustavson (MIT License), https://github.com/ashima/webgl-noise
 */

export const BUMP_TYPES = {
  none: 0,
  fiber: 1, // striated muscle, tendon, ligament, nerve fascicles
  bone: 2, // porous cortical bone
  pores: 3, // skin
  organ: 4, // smooth visceral surface with fine mottling
  spongy: 5, // lung parenchyma
  lobular: 6 // glands, pancreas
};

export const VERTEX_HEADER = /* glsl */ `
varying vec3 vWPos;
varying float vSeed;
uniform float uDanceMix;
uniform float uDancePhase;
uniform mat4 uHumanRootInv;
#ifdef TISSUE_FIBER
attribute vec3 fiberDir;
varying vec3 vFiber;
#endif
#ifdef TISSUE_TENDON_BLEND
// Build-time tendon mask (tools/tendon-mask.mjs), normalized UNSIGNED_BYTE: 0 = belly, 1 = tendon.
attribute float _tendon;
varying float vTendon;
#endif

vec3 tx_rotX(vec3 v, float a) {
  float c = cos(a), s = sin(a);
  return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);
}
vec3 tx_rotY(vec3 v, float a) {
  float c = cos(a), s = sin(a);
  return vec3(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
}
vec3 tx_rotZ(vec3 v, float a) {
  float c = cos(a), s = sin(a);
  return vec3(v.x * c - v.y * s, v.x * s + v.y * c, v.z);
}

vec3 tx_danceTransform(vec3 restW, inout vec3 nrm) {
  if (uDanceMix <= 0.0001) return restW;
  float t = uDancePhase;
  float groove = sin(t * 0.5);
  float beatBounce = 0.5 - 0.5 * cos(t);
  float pulse2 = sin(t);
  float phrase = 0.5 + 0.5 * sin(t * 0.125);

  vec3 p = restW;
  vec3 dN = nrm;

  // 1. Arms & forearms articulated around anatomical elbow and upper-arm pivots
  float side = restW.x >= 0.0 ? 1.0 : -1.0;
  #ifdef TISSUE_GARMENT
  float armW = 0.0;
  #else
  float gapLo = mix(0.1735, 0.1520, smoothstep(0.92, 1.04, restW.y));
  float gapHi = mix(0.2100, 0.1590, smoothstep(0.90, 1.10, restW.y));
  float armW = smoothstep(gapLo, gapHi, abs(restW.x))
    * smoothstep(0.62, 0.66, restW.y)
    * smoothstep(1.25, 1.15, restW.y);
  #endif
  float forearmW = armW * smoothstep(1.11, 1.01, restW.y);

  if (forearmW > 0.0001) {
    vec3 elbowPivot = vec3(side * 0.210, 1.06, -0.015);
    float armBeat = sin(t * 0.5 + side * 1.5707963);
    float elbowPitch = -forearmW * (0.68 + 0.42 * (0.5 + 0.5 * armBeat) + 0.14 * pulse2);
    float elbowYaw = forearmW * side * (0.22 + 0.15 * groove * side);
    vec3 relE = p - elbowPivot;
    relE = tx_rotY(tx_rotX(relE, elbowPitch), elbowYaw);
    p = elbowPivot + relE;
    dN = tx_rotY(tx_rotX(dN, elbowPitch), elbowYaw);
  }

  if (armW > 0.0001) {
    vec3 shoulderPivot = vec3(side * 0.184, 1.195, -0.015);
    float shAbduct = armW * side * (0.34 + 0.32 * (0.5 + 0.5 * sin(t * 0.5 + side * 1.2)) + 0.18 * phrase);
    float shFlex = armW * (-0.28 - 0.36 * sin(t * 0.5 + side * 1.5707963) + 0.12 * cos(t));
    vec3 relS = p - shoulderPivot;
    relS = tx_rotX(tx_rotZ(relS, shAbduct), shFlex);
    p = shoulderPivot + relS;
    dN = tx_rotX(tx_rotZ(dN, shAbduct), shFlex);
  }

  // 2. Head & neck bob, tilt, and counter-yaw
  float headW = smoothstep(1.43, 1.52, restW.y) * (1.0 - armW);
  if (headW > 0.0001) {
    vec3 neckPivot = vec3(0.0, 1.46, -0.01);
    float headPitch = headW * (0.12 * sin(t - 0.25));
    float headRoll = headW * (0.13 * sin(t * 0.5 + 0.6));
    float headYaw = headW * (-0.12 * groove);
    vec3 relH = p - neckPivot;
    relH = tx_rotZ(tx_rotY(tx_rotX(relH, headPitch), headYaw), headRoll);
    p = neckPivot + relH;
    dN = tx_rotZ(tx_rotY(tx_rotX(dN, headPitch), headYaw), headRoll);
  }

  // 3. Spine contrapposto tilt, axial twist, and chest pop
  float spineW = smoothstep(0.86, 1.26, restW.y);
  if (spineW > 0.0001) {
    vec3 lumbarPivot = vec3(0.0, 0.90, -0.01);
    float spineRoll = spineW * (-0.12 * groove);
    float spineYaw = spineW * (0.26 * sin(t * 0.5 + 0.4));
    float spinePitch = spineW * (0.07 * sin(t + 0.2));
    vec3 relT = p - lumbarPivot;
    relT = tx_rotZ(tx_rotY(tx_rotX(relT, spinePitch), spineYaw), spineRoll);
    p = lumbarPivot + relT;
    dN = tx_rotZ(tx_rotY(tx_rotX(dN, spinePitch), spineYaw), spineRoll);
  }

  // 4. Pelvis lateral sway, vertical knee bounce, and alternating foot tap
  float hipW = smoothstep(0.05, 0.86, restW.y);
  float hipSwayX = 0.056 * groove * hipW;
  float hipSwayZ = 0.022 * pulse2 * hipW * (1.0 - 0.65 * spineW);
  float bounceY = -0.040 * beatBounce * hipW;

  float legSide = clamp(restW.x / 0.035, -1.0, 1.0);
  float activeLeg = max(0.0, groove * legSide);
  float kneeBell = sin(clamp((restW.y - 0.04) / 0.84, 0.0, 1.0) * 3.14159265);
  float legMask = 1.0 - smoothstep(0.84, 0.90, restW.y);
  float kneeZ = kneeBell * legMask * (0.048 * beatBounce + 0.045 * activeLeg);

  float footMask = smoothstep(0.36, 0.04, restW.y);
  float footLiftY = footMask * 0.030 * activeLeg * activeLeg * (0.5 + 0.5 * pulse2);
  float footStepZ = footMask * 0.028 * activeLeg * (0.5 + 0.5 * pulse2);

  p.x += hipSwayX;
  p.y += bounceY + footLiftY;
  p.z += hipSwayZ + kneeZ + footStepZ;

  float mixAmt = smoothstep(0.0, 1.0, clamp(uDanceMix, 0.0, 1.0));
  nrm = normalize(mix(nrm, dN, mixAmt));
  return mix(restW, p, mixAmt);
}
`;

export const DANCE_NORMAL_VERTEX = /* glsl */ `
if (uDanceMix > 0.0001) {
  vec3 txRestNPos = (uHumanRootInv * modelMatrix * vec4(position, 1.0)).xyz;
  tx_danceTransform(txRestNPos, objectNormal);
}
`;

export const DANCE_VERTEX = /* glsl */ `
vec4 txWorldPos = uHumanRootInv * modelMatrix * vec4(transformed, 1.0);
vec3 txRestWPos = txWorldPos.xyz;
if (uDanceMix > 0.0001) {
  vec3 txDummyN = vec3(0.0, 1.0, 0.0);
  txWorldPos.xyz = tx_danceTransform(txRestWPos, txDummyN);
  mvPosition = viewMatrix * modelMatrix * inverse(uHumanRootInv * modelMatrix) * txWorldPos;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const VERTEX_BODY = /* glsl */ `
${DANCE_VERTEX}
vWPos = txRestWPos;
vSeed = fract(sin(dot((uHumanRootInv * modelMatrix)[3].xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
#ifdef TISSUE_FIBER
vec3 txRawFiber = mat3(uHumanRootInv * modelMatrix) * fiberDir;
vFiber = dot(txRawFiber, txRawFiber) > 1e-8 ? normalize(txRawFiber) : vec3(0.0, 1.0, 0.0);
#endif
#ifdef TISSUE_TENDON_BLEND
vTendon = clamp(_tendon, 0.0, 1.0);
#endif
`;

export const FRAGMENT_HEADER = /* glsl */ `
varying vec3 vWPos;
varying float vSeed;
#ifdef TISSUE_FIBER
varying vec3 vFiber;
#endif
#ifdef TISSUE_TENDON_BLEND
varying float vTendon;
#endif

uniform float uFlowTime;
uniform float uBeat;
uniform vec3 uHeartPos;
uniform float uFlowIntensity;
uniform float uBumpStrength;
uniform vec2 uBumpFade;
uniform float uColorVar;
uniform float uXray;
uniform float uXrayCenter;
uniform vec3 uFlowColor;
uniform float uFlowDir;
uniform vec3 uHighlightColor;
uniform float uHighlight;
uniform vec3 uSSSWrap;
uniform vec4 uFlushPts[5];
uniform float uFlush;
uniform vec4 uLipPos;
uniform vec3 uLipColor;
uniform vec4 uTendonLook; // rgb: tendon colour (linear), a: tendon roughness
uniform vec4 uTendonCoat; // x: clearcoat, y: clearcoat roughness, z: sheen, w: sheen roughness
uniform float uTendonFocus; // 0..1, "Tendons" highlight: emphasise tendons, dim bellies

vec3 tx_mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 tx_mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 tx_permute(vec4 x) { return tx_mod289(((x * 34.0) + 1.0) * x); }
vec4 tx_taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float tx_snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = tx_mod289(i);
  vec4 p = tx_permute(tx_permute(tx_permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = tx_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Muscle fascicles: fine across the fibre axis, long streaks along it. Three octaves
// (fascicle bundles ~2.5 mm, fascicles ~0.7 mm, fibres ~0.3 mm), each faded by pixel footprint.
float tx_fiber(vec3 p, vec3 dir, float foot) {
  vec3 d = dot(dir, dir) > 1e-8 ? normalize(dir) : vec3(0.0, 1.0, 0.0);
  vec3 up = abs(d.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 b1 = normalize(cross(d, up));
  vec3 b2 = cross(d, b1);
  vec3 q = vec3(dot(p, b1), dot(p, b2), dot(p, d));
  float f0 = 1.0 - smoothstep(0.0012, 0.0045, foot);
  float f1 = 1.0 - smoothstep(0.00035, 0.0014, foot);
  float f2 = 1.0 - smoothstep(0.00015, 0.0006, foot);
  float n0 = tx_snoise(vec3(q.x * 380.0, q.y * 380.0, q.z * 16.0));
  float n1 = tx_snoise(vec3(q.x * 1500.0, q.y * 1500.0, q.z * 55.0));
  float n2 = tx_snoise(vec3(q.x * 3600.0, q.y * 3600.0, q.z * 150.0));
  return n0 * 0.55 * f0 + n1 * 0.32 * f1 + n2 * 0.18 * f2;
}

float tx_noiseOctaves(vec3 p, float baseFreq, float foot) {
  float featA = 1.0 / baseFreq;
  float featB = 0.3 / baseFreq;
  float fa = 1.0 - smoothstep(featA * 0.35, featA * 1.4, foot);
  float fb = 1.0 - smoothstep(featB * 0.35, featB * 1.4, foot);
  return tx_snoise(p * baseFreq) * 0.65 * fa + tx_snoise(p * baseFreq * 3.3) * 0.35 * fb;
}

float tx_height(vec3 p, float foot) {
#if TISSUE_BUMP_TYPE == 1
  #ifdef TISSUE_FIBER
  return tx_fiber(p, vFiber, foot);
  #else
  return tx_noiseOctaves(p, 900.0, foot);
  #endif
#elif TISSUE_BUMP_TYPE == 2
  return tx_noiseOctaves(p, 300.0, foot) * 0.7 + tx_noiseOctaves(p, 1800.0, foot) * 0.3;
#elif TISSUE_BUMP_TYPE == 3
  return tx_noiseOctaves(p, 700.0, foot) * 0.45 + tx_noiseOctaves(p, 2600.0, foot) * 0.55;
#elif TISSUE_BUMP_TYPE == 4
  return tx_noiseOctaves(p, 420.0, foot);
#elif TISSUE_BUMP_TYPE == 5
  return (1.0 - abs(tx_snoise(p * 950.0)) * 1.6) * (1.0 - smoothstep(0.0003, 0.0012, foot)) + tx_noiseOctaves(p, 300.0, foot) * 0.4;
#elif TISSUE_BUMP_TYPE == 6
  return (0.4 - abs(tx_snoise(p * 330.0)) * 1.4) * (1.0 - smoothstep(0.0009, 0.0035, foot));
#else
  return 0.0;
#endif
}

// Derivative-based bump mapping (Mikkelsen 2010), evaluated in view space.
vec3 tx_perturb(vec3 surfPos, vec3 surfNorm, float h, float faceDir) {
  vec3 sigX = dFdx(surfPos);
  vec3 sigY = dFdy(surfPos);
  vec3 r1 = cross(sigY, surfNorm);
  vec3 r2 = cross(surfNorm, sigX);
  float det = dot(sigX, r1) * faceDir;
  vec3 grad = sign(det) * (dFdx(h) * r1 + dFdy(h) * r2);
  return normalize(abs(det) * surfNorm - grad);
}

#if TISSUE_BUMP_TYPE == 5
// Cellular noise: distance between the two nearest feature points (0 on cell borders).
vec3 tx_hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123);
}
float tx_cellEdge(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int z = -1; z <= 1; z++) {
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec3 g = vec3(float(x), float(y), float(z));
        vec3 r = g + tx_hash3(i + g) - f;
        float d = dot(r, r);
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
      }
    }
  }
  return sqrt(f2) - sqrt(f1);
}
#endif
`;

// Injected after <color_fragment>: organic colour mottling + darker fibre grooves.
export const COLOR_BODY = /* glsl */ `
float txFoot = length(fwidth(vWPos));
float txH0 = 0.0;
float txLipMask = 0.0;
#if TISSUE_BUMP_TYPE > 0
txH0 = tx_height(vWPos, txFoot);
#endif
diffuseColor.rgb *= 1.0 + uColorVar * (tx_snoise(vWPos * 42.0) + (vSeed - 0.5) * 1.6);
#if TISSUE_BUMP_TYPE == 1
diffuseColor.rgb *= 0.82 + 0.26 * smoothstep(-0.6, 0.6, txH0);
#elif TISSUE_BUMP_TYPE == 2
diffuseColor.rgb *= 0.95 + 0.07 * smoothstep(-0.8, 0.8, txH0);
#elif TISSUE_BUMP_TYPE == 5
{
  // Adult pleural surface: secondary lobules (~1.7 cm) outlined by pigmented interlobular septa,
  // patchy anthracotic speckling. Anti-aliased via fwidth and faded with pixel footprint.
  float txEdge = tx_cellEdge(vWPos * 58.0);
  float txW = fwidth(txEdge);
  float txLine = 0.025 + 0.035 * smoothstep(-0.5, 0.8, tx_snoise(vWPos * 90.0));
  float txSepta = 1.0 - smoothstep(txLine - txW, txLine + txW, txEdge);
  txSepta *= 1.0 - smoothstep(0.12, 0.35, txW);
  float txPatch = smoothstep(-0.35, 0.75, tx_snoise(vWPos * 34.0 + 7.0));
  float txBlot = smoothstep(-0.2, 0.8, tx_snoise(vWPos * 16.0));
  float txSpeck = smoothstep(0.55, 0.85, tx_snoise(vWPos * 480.0)) * (1.0 - smoothstep(0.0005, 0.0018, txFoot));
  float txPig = clamp(txSepta * txPatch * (0.25 + 0.45 * txBlot) + txSpeck * (0.2 + 0.35 * txBlot), 0.0, 0.7);
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.32, 0.28, 0.32), txPig);
}
#endif
#ifdef TISSUE_SKIN
{
  // Vascular flush where skin is thin and well perfused (nose tip, cheeks, ears).
  float txFl = 0.0;
  for (int i = 0; i < 5; i++) {
    vec3 txD = vWPos - uFlushPts[i].xyz;
    txFl += exp(-dot(txD, txD) / max(uFlushPts[i].w * uFlushPts[i].w, 1e-8));
  }
  diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.8, 0.78), clamp(txFl, 0.0, 1.0) * uFlush);

  // Smooth vermilion lip coloration directly on the sculpted skin lip contour (with Cupid's bow).
  if (uLipPos.w > 0.5 && vWPos.z > uLipPos.z - 0.012) {
    float isFem = step(1.5, uLipPos.w);
    float lx = (vWPos.x - uLipPos.x) / mix(0.0235, 0.0222, isFem);
    float bowAmp = mix(0.0016, 0.0020, isFem);
    float bow = bowAmp * cos(clamp(lx * 3.14159, -3.14159, 3.14159)) - 0.0012 * exp(-lx * lx * 18.0);
    float ly = (vWPos.y - (uLipPos.y + bow)) / mix(0.0086, 0.0096, isFem);
    float lr = sqrt(lx * lx + ly * ly * (1.0 + 0.35 * lx * lx));
    txLipMask = 1.0 - smoothstep(0.65, 1.02, lr);
    float seam = exp(-pow((vWPos.y - (uLipPos.y - 0.0005)) / 0.0011, 2.0)) * (1.0 - smoothstep(0.75, 1.0, abs(lx)));
    vec3 baseLip = mix(uLipColor, mix(uLipColor, vec3(0.74, 0.33, 0.35), 0.28), isFem);
    vec3 lipCol = baseLip * (1.0 - 0.22 * seam);
    diffuseColor.rgb = mix(diffuseColor.rgb, lipCol, txLipMask * mix(0.88, 0.93, isFem));
  }
}
#endif
// Tendon regions of muscle meshes (build-time _tendon mask) take the tendon look: pearly colour,
// gentler mottling and finer fibre grooves. Tendon-material parts count as fully tendon.
float txTendon = 0.0;
#ifdef TISSUE_TENDON_BLEND
txTendon = smoothstep(0.15, 0.85, vTendon);
if (txTendon > 0.0) {
  vec3 txTCol = uTendonLook.rgb * (1.0 + 0.04 * (tx_snoise(vWPos * 42.0) + (vSeed - 0.5) * 1.6));
  #if TISSUE_BUMP_TYPE == 1
  txTCol *= 0.9 + 0.13 * smoothstep(-0.6, 0.6, txH0);
  #endif
  diffuseColor.rgb = mix(diffuseColor.rgb, txTCol, txTendon);
}
#endif
#ifdef TISSUE_TENDON_PART
txTendon = 1.0;
#endif
#if defined(TISSUE_TENDON_BLEND) || defined(TISSUE_TENDON_PART)
if (uTendonFocus > 0.0) {
  // "Tendons" highlight: bellies recede (darker, desaturated) and tendons brighten.
  float txLum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 txBelly = mix(diffuseColor.rgb, vec3(txLum), 0.65) * 0.3;
  vec3 txTend = min(diffuseColor.rgb * 1.15 + 0.03, vec3(1.0));
  diffuseColor.rgb = mix(diffuseColor.rgb, mix(txBelly, txTend, txTendon), uTendonFocus);
}
#endif
`;

// Injected after <roughnessmap_fragment>: grooves are slightly rougher than ridges; lips are slightly glossier.
export const ROUGHNESS_BODY = /* glsl */ `
#ifdef TISSUE_TENDON_BLEND
roughnessFactor = mix(roughnessFactor, uTendonLook.a, txTendon);
#endif
roughnessFactor = clamp(roughnessFactor - txH0 * 0.06 - txLipMask * (uLipPos.w > 1.5 ? 0.21 : 0.14), 0.04, 1.0);
`;

// Injected after <normal_fragment_maps>: procedural micro-relief, faded out when a pixel
// covers more than the feature size (prevents shimmering when zoomed out).
export const NORMAL_BODY = /* glsl */ `
#if TISSUE_BUMP_TYPE > 0
{
  float txH = txH0 * uBumpStrength * 0.00016;
  #ifdef TISSUE_TENDON_BLEND
  txH *= mix(1.0, 0.7, txTendon); // tendon relief is finer than muscle (TISSUES.tendon.bumpStrength)
  #endif
  normal = tx_perturb(-vViewPosition, normal, txH, faceDirection);
}
#endif
`;

// Injected after <emissivemap_fragment>: travelling blood-flow pulses (outward in arteries,
// inward in veins), modulated by the heartbeat, plus selection highlight.
export const EMISSIVE_BODY = /* glsl */ `
#ifdef TISSUE_FLOW
{
  float fd = length(vWPos - uHeartPos);
  float ph = fd * 9.0 - uFlowTime * uFlowDir;
  float band = pow(0.5 + 0.5 * sin(ph * 6.2831853), 12.0);
  totalEmissiveRadiance += uFlowColor * band * uFlowIntensity * (0.5 + 0.9 * uBeat);
}
#endif
#if defined(TISSUE_TENDON_BLEND) || defined(TISSUE_TENDON_PART)
totalEmissiveRadiance += vec3(0.3, 0.27, 0.22) * (txTendon * uTendonFocus * 0.45);
#endif
totalEmissiveRadiance += uHighlightColor * uHighlight;
`;

// Injected after <lights_physical_fragment>: tendon regions get the tendon clear-coat and sheen.
export const PHYSICAL_BODY = /* glsl */ `
#ifdef TISSUE_TENDON_BLEND
#ifdef USE_CLEARCOAT
material.clearcoat = mix(material.clearcoat, uTendonCoat.x, txTendon);
material.clearcoatRoughness = clamp(mix(material.clearcoatRoughness, uTendonCoat.y + geometryRoughness, txTendon), 0.0525, 1.0);
#endif
#ifdef USE_SHEEN
material.sheenColor = mix(material.sheenColor, vec3(uTendonCoat.z), txTendon);
material.sheenRoughness = clamp(mix(material.sheenRoughness, uTendonCoat.w, txTendon), 0.0001, 1.0);
#endif
#endif
`;

// Injected before <opaque_fragment>: fresnel "x-ray" transparency for ghosted layers.
export const ALPHA_BODY = /* glsl */ `
if (uXray > 0.0) {
  float txNV = abs(dot(normalize(vViewPosition), normal));
  float txF = pow(1.0 - clamp(txNV, 0.0, 1.0), 2.4);
  diffuseColor.a *= mix(1.0, mix(uXrayCenter, 1.0, txF), uXray);
}
`;
