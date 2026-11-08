# TerraFauna 3D (`life-atlas`) — Design System Specification (`DESIGN.md`)

## 1. Overview & Creative North Star
- **Creative North Star:** *"A Bioluminescent Natural History Museum by Night; an Archival Specimen Field Guide by Day."*
- **Product Domain:** Interactive 3D Comparative Anatomy, Ocular Optics & Complete Kingdom *Animalia* Biodiversity Encyclopedia (`541 MYA` Cambrian Explosion through `Present` & `Holocene` Extinctions).
- **Visual Signature:** Floating 3D hyper-real zoological specimens take 65%+ of viewport priority over an atmospheric museum pedestal, framed by low-glare spatial glass HUD overlays (`backdrop-filter: blur(18px)`) that flip cleanly into warm botanical vellum specimen plates in Light Mode.

---

## 2. Colors & Atmospheric Surface Hierarchy

### Dark Theme (`[data-theme="dark"]` — Abyssal Museum Gallery)
- **Stage Background (`--tf-bg-canvas`):** `#030812` with subtle radial museum spotlight (`#0B192E` at stage center)
- **Primary Glass Card (`--tf-bg-surface`):** `rgba(15, 23, 42, 0.82)`
- **Elevated Control Surface (`--tf-bg-elevated`):** `rgba(30, 41, 59, 0.78)`
- **Ink Hierarchy:** Primary `#F8FAFC` (`18.1:1`), Secondary `#CBD5E1` (`12.4:1`), Muted `#94A3B8` (`6.7:1`)
- **Domain Status Accents:**
  - **Living Fauna (`living`):** Bioluminescent Emerald `#34D399` (fill `#059669`)
  - **Prehistoric Fossil (`extinct`):** Deep-Time Amber `#FBBF24` (fill `#D97706`)
  - **Holocene / Recent Extinction (`holocene`):** Archival Rose-Crimson `#FB7185` (fill `#E11D48`)
  - **Ocular / Global Taxon Registry:** Specimen Cyan `#22D3EE` (fill `#0284C7`)

### Light Theme (`[data-theme="light"]` — Natural History Field Guide)
- **Stage Background (`--tf-bg-canvas`):** `#F6F3EC` (warm museum limestone / archival paper)
- **Primary Vellum Card (`--tf-bg-surface`):** `rgba(255, 253, 248, 0.92)`
- **Elevated Control Surface (`--tf-bg-elevated`):** `#EFE9DC`
- **Ink Hierarchy:** Primary `#0F172A` (`15.4:1`), Secondary `#334155` (`9.2:1`), Muted `#475569` (`5.9:1`)
- **Domain Status Accents:**
  - **Living Fauna:** Botanical Emerald `#047857` (`5.4:1`)
  - **Prehistoric Fossil:** Ochre Amber `#B45309` (`5.0:1`)
  - **Holocene / Recent Extinction:** Specimen Crimson `#BE123C` (`5.9:1`)
  - **Ocular / Global Taxon Registry:** Marine Sapphire `#0369A1` (`5.8:1`)

---

## 3. Typography & Numeric Discipline
- **Display Scale:** Geometric sans (`'Outfit', 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`), `font-weight: 800`, `-0.02em` letter-spacing.
- **Taxonomic Binomials:** Editorial serif italic (`'Newsreader', 'Iowan Old Style', Georgia, serif`) to honor classical zoological plates.
- **Multilingual Parity:** Native script fallbacks across all 11 supported languages (`en`, `es`, `zh`, `yue`, `ja`, `ko`, `pt`, `fr`, `it`, `de`, `ar` with `dir="rtl"`).
- **Tabular Telemetry:** `font-variant-numeric: tabular-nums` enforced on all mass/length/speed readouts, geological MYA timelines, quiz counters, and Kingdom *Animalia* species tallies (`2,160,000+` extant / `450,000+` fossil).

---

## 4. Elevation, Borders & Spatial Framing
- **Ghost Hairlines:** `1px solid var(--tf-border-subtle)` (`14–18%` opacity) separates HUD panels from the 3D WebGL canvas without heavy box borders.
- **Pedestal Grounding:** Every 3D animal sits or swims in an anatomically appropriate spatial frame with soft contact shadows, directional key/rim studio lighting, and optional 1.75 m human scale reference (`Homo sapiens` adult + child silhouettes).

---

## 5. Core Components & Interaction Patterns
1. **Top Command Bar:** Brand emblem + Global Search (`GBIF + PBDB + Curated`) + **Kingdom *Animalia* Global Registry Trigger** + Random Specimen + Quiz Mastery Counter + 11-Language Selector + **Dark/Light Theme Toggle** + Privacy Controls.
2. **3D Specimen Stage (`Animal3DViewer`):**
   - Top-left floating specimen plate (`Plate XX / YY`, IUCN / Extinction Era badge, Class badge, Common & Scientific name, Studio Narration, Bio-Acoustic Call, Quiz CTA).
   - Top-right camera presets (`Full Body`, `Head & Jaws`, `Macro Eyeball Detail`).
   - Bottom-left 4-Layer X-Ray Bar (`Exterior`, `Muscular`, `Skeletal`, `Organs`) + `Scale` + `Pins` + `Pause/Play Motion`.
   - Bottom-right specimen stepper (`Previous`, `Random`, `Next`) + verified CC/Procedural model attribution.
3. **5-Mode Explorer Deck (`role="tablist"`):**
   - `Read & Listen` (Encyclopedia Story & Fun Facts)
   - `4-Layer X-Ray` (`AnatomyInspector` synced to 3D pins)
   - `Eye Macro View` (Photoreceptor & Spectral Optics Profile)
   - `3D Habitat & Fossils` (`Globe3D` + `GeologicalTimeline` across all Phanerozoic periods)
   - `All Species & Kingdom Registry` (Curated 3D Plates + Complete 35-Phylum Kingdom *Animalia* Explorer with live paginated GBIF & Paleobiology Database species streams).

---

## 6. Strict Design Guardrails (Do's & Don'ts)
- **DO** use crisp `lucide-react` vector icons (`aria-hidden="true"`) for every button, tab, and status pill.
- **DON'T** render raw Unicode emojis (`🍪`, `🐾`, `👁️`, `🦴`, `✨`) inside structural buttons, badges, or tab labels.
- **DO** maintain strict CSP (`font-src 'self' data:`) and sanitize all live GBIF / PBDB / Wikipedia strings before rendering.
- **DON'T** introduce overlap with `DinoVerse 3D`'s non-avian Dinosauria roster in `CURATED_ANIMALS`; instead, provide seamless cross-portal linking inside the Reptilia / Archosauria Tree-of-Life node.
