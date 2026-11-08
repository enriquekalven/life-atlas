import * as THREE from 'three';

/**
 * Sample world-space surface points from every (non-instanced) mesh under `root`.
 * Used to frame the camera on the real silhouette instead of a bounding box.
 *
 * @param root        subtree to sample; world matrices are refreshed first
 * @param perMesh     max samples taken from each mesh (evenly strided)
 * @param maxTotal    hard cap on the total number of points
 */
export function sampleWorldPoints(root: THREE.Object3D, perMesh = 400, maxTotal = 20000): Float32Array {
  root.updateMatrixWorld(true);
  const chunks: Float32Array[] = [];
  let total = 0;
  const v = new THREE.Vector3();
  root.traverse((obj) => {
    if (total >= maxTotal) return;
    if (!(obj as THREE.Mesh).isMesh || (obj as THREE.InstancedMesh).isInstancedMesh) return;
    const mesh = obj as THREE.Mesh;
    const skinned = (mesh as THREE.SkinnedMesh).isSkinnedMesh ? (mesh as THREE.SkinnedMesh) : null;
    if (skinned?.skeleton) {
      skinned.bindMatrixInverse.copy(skinned.matrixWorld).invert();
      skinned.skeleton.update();
    }
    const pos = mesh.geometry?.getAttribute('position');
    if (!pos || pos.count === 0) return;
    const stride = Math.max(1, Math.floor(pos.count / perMesh));
    const count = Math.min(Math.ceil(pos.count / stride), maxTotal - total);
    const out = new Float32Array(count * 3);
    let k = 0;
    for (let i = 0; i < pos.count && k < count; i += stride) {
      v.fromBufferAttribute(pos, i);
      if (skinned) {
        skinned.applyBoneTransform(i, v);
      }
      v.applyMatrix4(mesh.matrixWorld);
      out[k * 3] = v.x;
      out[k * 3 + 1] = v.y;
      out[k * 3 + 2] = v.z;
      k++;
    }
    chunks.push(out.subarray(0, k * 3));
    total += k;
  });
  const result = new Float32Array(total * 3);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

/**
 * Computes an accurate world-space bounding box that respects SkinnedMesh bone transforms.
 */
export function computeSkinnedBox3(root: THREE.Object3D): THREE.Box3 {
  const pts = sampleWorldPoints(root, 800, 32000);
  if (pts.length < 3) {
    return new THREE.Box3().setFromObject(root);
  }
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pts.length; i += 3) {
    v.set(pts[i], pts[i + 1], pts[i + 2]);
    box.expandByPoint(v);
  }
  return box;
}

