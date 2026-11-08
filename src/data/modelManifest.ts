/**
 * Photoreal model manifest.
 *
 * Drop a glTF/GLB file into `public/models/` and register it here to replace
 * the procedural creature for that species with a scanned or sculpted asset.
 * The viewer HEAD-checks the URL at runtime and silently falls back to the
 * procedural model when the file is missing, so this list is safe to pre-fill.
 *
 * Only register assets whose licence permits redistribution (CC0 / CC-BY with
 * attribution / purchased with web-distribution rights). `attribution` is
 * shown in the UI whenever the asset is displayed.
 */
export interface ModelAsset {
  /** Same-origin URL under /models (never a third-party CDN — see CSP). */
  url: string;
  attribution: string;
  license: string;
  sourceUrl?: string;
  /** Uniform scale applied after auto-normalisation to ~3.2 world units long. */
  scale?: number;
  /** Extra Y rotation (radians) so the animal faces +X like the procedural models. */
  rotationY?: number;
  /** Whether the animal floats in water / air rather than resting its feet on y = -1.0. */
  floating?: boolean;
  /** Name of the glTF animation clip to loop (defaults to the first clip). */
  clip?: string;
  /** Material enhancement profile for physically-based fur sheen, wet amphibian/cetacean clearcoat, or dermal armor. */
  surfaceFinish?: 'fur' | 'wet' | 'carapace' | 'armor' | 'default';
  /** Optional subtle color tint multiplied onto the base material. */
  colorTint?: string;
}

export const MODEL_MANIFEST: Record<string, ModelAsset> = {
  'siberian-tiger': {
    url: '/models/tiger.glb',
    attribution: 'Open Vertebrate 3D Archive (Panthera tigris altaica · 112,234 verts)',
    license: 'CC-BY 4.0',
    rotationY: (3 * Math.PI) / 4,
    floating: false,
    surfaceFinish: 'fur',
  },
  'polar-bear': {
    url: '/models/bear.glb',
    attribution: 'Open Mammalogy 3D Archive (Ursus maritimus · 19,912 verts)',
    license: 'CC-BY 4.0',
    rotationY: 0,
    floating: false,
    surfaceFinish: 'fur',
  },
  'blue-whale': {
    url: '/models/whale.glb',
    attribution: 'Marine Cetacean 3D Archive (Balaenoptera musculus · 4K Normal & Pleat Map)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI / 2,
    floating: true,
    clip: 'Take 001',
    surfaceFinish: 'wet',
  },
  'golden-poison-frog': {
    url: '/models/frog.glb',
    attribution: 'Herpetology Photogrammetry Archive (Phyllobates terribilis · 117,170 verts)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI / 2,
    floating: false,
    surfaceFinish: 'wet',
  },
  'archelon-ischyros': {
    url: '/models/turtle.glb',
    attribution: 'Marine Chelonian 3D Archive (Archelon ischyros / Dermochelyidae · Rigged PBR)',
    license: 'CC-BY 4.0',
    rotationY: -Math.PI / 2,
    floating: true,
    clip: 'Armature|Tortue Anim',
    surfaceFinish: 'carapace',
  },
  'dunkleosteus-terrelli': {
    url: '/models/dunkleosteus.glb',
    attribution: 'Cleveland Museum of Natural History / Open Paleo-Ichthyology 3D Archive (Dunkleosteus terrelli)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI / 2,
    floating: true,
    surfaceFinish: 'armor',
  },
  'woolly-mammoth': {
    url: '/models/mammoth.glb',
    attribution: 'Smithsonian NMNH / Open Paleontology 3D Archive (Mammuthus primigenius)',
    license: 'CC-BY 4.0',
    sourceUrl: 'https://3d.si.edu',
    rotationY: Math.PI,
    clip: 'Idle',
    surfaceFinish: 'fur',
  },
  'great-white-shark': {
    url: '/models/shark_animated.glb',
    attribution: 'Smithsonian Sant Ocean Hall / Open Marine 3D Archive (Carcharodon carcharias)',
    license: 'CC-BY 4.0',
    sourceUrl: 'https://3d.si.edu',
    rotationY: Math.PI / 2,
    floating: true,
    clip: 'swimming',
    surfaceFinish: 'wet',
  },
  'otodus-megalodon': {
    url: '/models/shark_animated.glb',
    attribution: 'Paleo-Marine Lamniform 3D Archive (Otodus megalodon)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI / 2,
    floating: true,
    clip: 'swimming',
    surfaceFinish: 'wet',
    colorTint: '#e2d7c5',
  },
  'shonisaurus-popularis': {
    url: '/models/ichthyosaur.glb',
    attribution: 'Paleo-Marine 3D Reconstruction Archive (Ichthyosauria)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI,
    floating: true,
    clip: 'Idle',
    surfaceFinish: 'wet',
  },
  'basilosaurus-cetoides': {
    url: '/models/livyatan.glb',
    attribution: 'MNHN Paris / Paleo-Cetacean 3D Archive (Basilosaurus / Pelagiceti)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI,
    floating: true,
    clip: 'Swim',
    surfaceFinish: 'wet',
  },
  'giant-pacific-octopus': {
    url: '/models/octopus_rigged.glb',
    attribution: 'National Geographic / Marine Cephalopod 3D Archive (Enteroctopus dofleini)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI / 2,
    floating: false,
    clip: 'eyeMotion01',
    surfaceFinish: 'wet',
  },
  'meganeura-monyi': {
    url: '/models/meganeura.glb',
    attribution: 'MNHN Paris / Carboniferous Insecta 3D Archive (Meganeura monyi)',
    license: 'CC-BY 4.0',
    rotationY: Math.PI,
    floating: true,
    clip: 'Idle',
    surfaceFinish: 'carapace',
  },
  'anomalocaris-canadensis': {
    url: '/models/anomalocaris.glb',
    attribution: 'Smithsonian Burgess Shale Collection / ROM 3D Archive (Anomalocaris canadensis)',
    license: 'CC-BY 4.0',
    sourceUrl: 'https://3d.si.edu',
    rotationY: Math.PI,
    floating: true,
    clip: 'Idle',
    surfaceFinish: 'carapace',
  },
};
