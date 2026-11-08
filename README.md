# TerraFauna 3D — Interactive Living & Extinct Animal, Anatomy & Paleontology Atlas

Live at **https://life-atlas-3d.web.app** (Firebase Hosting `project-maui`, site `life-atlas-3d`).

An educational 3D web portal for kids and young scientists (ages 8–14) to explore living
animals across every continent and ocean alongside extinct prehistoric animals across
541 million years of Earth's history (all 11 geological eras from Cambrian to Holocene).

Non-avian dinosaurs, pterosaurs, mosasaurs, pelycosaurs, and *Archaeopteryx* have their own
dedicated portal, [DinoVerse 3D](https://dino-portal-3d.web.app), so there is **zero species overlap**
between the two atlases.

## Quick Start

```bash
git clone https://github.com/enriquekalven/life-atlas.git
cd life-atlas
npm install
npm run dev          # http://127.0.0.1:5173 (falls back to 5174 if busy)
npm test             # unit tests (dataset, 0 DinoVerse overlap, 11 eras, 11 languages, security, 3D engine)
npm run build        # production bundle in dist/
firebase deploy --only hosting:life-atlas-3d --project project-maui
```

Deep links: `?animal=siberian-tiger&layer=skeletal&kid=0&pins=0&lang=es` (all values allow-listed).

## Key Features

- **11 Languages (`src/i18n.ts`)** — English (`en`), Español (`es`), 中文 (`zh`), 粵語 (`yue`),
  日本語 (`ja`), 한국어 (`ko`), Português (`pt`), Français (`fr`), Italiano (`it`), Deutsch (`de`),
  and العربية (`ar`, with full RTL layout). Supports `?lang=` URL handoff from
  [Atlas of Wonder](https://atlas-of-wonder.web.app).
- **Interactive 3D Earth & Paleo-Globe** (`src/components/Globe3D.tsx`) — spin the Earth, toggle
  climate rings (Equator, Tropics, Polar Circles), click habitat & fossil-site pins; continents
  re-colour per geological era.
- **26 Curated Species Across All 11 Geological Eras** (`src/data/animals.ts`, `src/three/`) — 14
  living species and 12 extinct prehistoric non-dinosaur species (*Anomalocaris*, *Dunkleosteus*,
  *Meganeura*, *Helicoprion*, *Inostrancevia*, *Shonisaurus*, *Leedsichthys*, *Archelon*,
  *Sarcosuchus*, *Basilosaurus*, *Megalodon*, *Woolly Mammoth*, *Smilodon*, *Dodo*), generated from
  anatomical *body plans*:
  - `sweep.ts` sweeps elliptical cross-sections along a spine curve with twist-free
    parallel-transport frames → one continuous organic body (head → neck → torso → tail).
  - `bodyPlans.ts` holds species blueprints (26 curated + archetype fallbacks): limbs with
    toes/claws/paws, fins & flukes, flippers, wings & membranes, tusks, trunks, stalk eyes,
    whorled tooth-saws, tentacles with suckers, scutes, gill slits, teeth.
  - `textures.ts` synthesises PBR maps per skin type (stripes, rosettes, scales, armour plates,
    feathers, countershading, iridescent chitin, wrinkles) → albedo + height-derived normal map
    + roughness + fur-shell alpha; periodic around the body so there is no dorsal seam.
  - `modelBuilder.ts` derives the **muscular**, **skeletal** (vertebrae, neural spines, ribs,
    skull, limb bones, fin rays, keel, notochord) and **organ** layers from the same spine, so
    X-ray layers line up with the skin.
  - `ProceduralAnimal.tsx` renders the four layers with breathing, swimming undulation,
    flapping, pulsing heart and anatomically anchored callout pins.
- **Photoreal asset pipeline** (`public/models/`, `src/data/modelManifest.ts`) — drop a
  licence-tracked `.glb` to override any species; falls back automatically when absent.
- **Kid Size Comparison** — 1.45 m explorer silhouette scaled from the measured model length.
- **Deep-Time Geological Scrubber** — Cambrian → Holocene with oxygen, temperature and
  continental layout telemetry.
- **Live Global Biodiversity & Paleobiology Search** (`src/services/encyclopediaApi.ts`) —
  GBIF (living species) and Paleobiology Database (fossil taxa), validated and sanitised,
  mapped onto the archetype body plans. Searching for a dinosaur returns nothing and points to
  DinoVerse 3D: a PBDB lineage check excludes Dinosauria/Pterosauria/Mosasauridae.
- **Voice narration & Explorer Badge quizzes** — Web Speech API read-aloud plus per-species
  anatomy questions.
- **Privacy-Hardened Opt-In Telemetry** (`src/services/analytics.ts`) — Google Analytics 4
  (`G-8G4WWQX7N4`) is strictly opt-in via the 11-language cookie banner (`🍪`), with IP
  anonymization and ad signals disabled.

## Visual regression (headless)

`scratch/shoot.sh` (in the conversation artifacts) renders any species/layer to PNG with
headless Chrome + SwiftShader so model changes can be reviewed without a GPU
(`BUDGET=`, `PINS=`, `KID=` env toggles).

Two gotchas learned the hard way:

- Headless `--screenshot` presents roughly **one** `requestAnimationFrame` before capturing,
  regardless of `--virtual-time-budget`. Anything that depends on the frame loop (camera
  fly-to, breathing, fin flaps) is frozen in the capture. The studio camera therefore
  **snaps** on its first fit after mount (`src/three/cameraFit.ts` + `FitCamera`) and only
  animates on later species switches — correct for users and for screenshots.
- Run captures **sequentially**. Several SwiftShader instances in parallel starve each other
  (3 parallel runs stalled for 6+ minutes; the same shots take ~13 s each one at a time).
