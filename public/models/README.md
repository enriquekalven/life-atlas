# Photoreal 3D Model Drop Folder

TerraFauna renders every species procedurally (continuous spine-swept body, species
body plan, PBR skin synthesis). To upgrade a species to a **scanned or sculpted
photoreal asset**, drop a `.glb` here and register it in
[`src/data/modelManifest.ts`](../../src/data/modelManifest.ts).

```
public/models/woolly-mammoth.glb         ← file (binary glTF, ideally < 25 MB, Draco/KTX2 ok)
src/data/modelManifest.ts                ← 'woolly-mammoth': { url: '/models/woolly-mammoth.glb', ... }
```

The viewer HEAD-checks the URL at runtime: if the file is missing or the server
returns HTML, it silently keeps the procedural creature, so partially-populated
manifests are safe.

## Requirements per asset

| Field | Why |
|---|---|
| Same-origin URL under `/models/` | Content-Security-Policy forbids third-party CDNs. |
| `license` + `attribution` | Shown in the viewer; keep CC0 / CC-BY / purchased-with-web-rights only. |
| Faces **+X**, Y-up | Matches the procedural models (use `rotationY` to correct). |
| Any size | Auto-normalised to ~3.2 world units and grounded on the shadow plane. |
| Optional idle animation clip | First clip loops; set `clip` to pick another. |

## Recommended sources (verify licence per file)

- **Smithsonian Open Access 3D** (`3d.si.edu`) — CC0 scans: *the Nation's T. rex*,
  woolly mammoth, megalodon jaw, many skulls & skeletons (excellent for the Skeletal layer).
- **Sketchfab** (filter *Downloadable* + *CC-BY / CC0*) — thousands of photoreal animals;
  requires per-asset attribution.
- **Digital Life 3D** (UMass) — photogrammetric living animals (check CC-BY-NC terms for
  classroom use).

> Keep the four X-ray layers in mind: when a photoreal exterior is present, the
> muscular / skeletal / organ layers are still drawn by the procedural engine
> inside the ghosted asset.
