# Design System Master File — TerraFauna 3D (`life-atlas`)

> **LOGIC:** When building or modifying a specific view or modal, check `design-system/terrafauna-3d-life-atlas/pages/[page-name].md` first.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

- **Project:** TerraFauna 3D — Interactive Living, Holocene-Extinct & Prehistoric Animal Atlas (`life-atlas`)
- **Generated / Curated:** 2026-11-08 (UI/UX Pro Max v2.5 + Google Stitch Design Skill)
- **Category:** Interactive 3D Scientific Natural History & Comparative Anatomy Encyclopedia (React 19 + Three.js WebGL + Tailwind v4)

---

## Global Design Direction

### Aesthetic Direction
- **Primary Style:** **Bioluminescent Natural History Museum (`dark`) + Archival Field Guide Parchment (`light`)**
- **Secondary Influence:** **Spatial Glassmorphism HUD + High-Precision Scientific Telemetry**
- **Domain Mood:** Authoritative, museum-grade, tactile, luminous, high-contrast scientific wonder across 540 million years of Kingdom *Animalia*.
- **Dual-Theme Architecture:**
  - **Dark Mode (`[data-theme="dark"]`, Default):** Deep abyssal slate canvas (`#030812` → `#071121`) with translucent frosted museum glass panels (`rgba(15, 23, 42, 0.80)`), bioluminescent emerald (`#10B981`) for living fauna, warm fossil amber (`#F59E0B`) for prehistoric fauna, archival crimson-violet (`#F43F5E`) for Holocene human-era extinctions, and cyan ocular accents (`#06B6D4`).
  - **Light Mode (`[data-theme="light"]`, Field Guide Daylight):** Warm archival specimen parchment (`#F6F3EC` → `#EDE7DA`) with crisp botanical vellum cards (`rgba(255, 253, 248, 0.90)`), deep slate ink (`#0F172A`, contrast `15.4:1`), botanical forest emerald (`#047857`, contrast `5.4:1` on parchment), deep ochre fossil amber (`#B45309`, contrast `5.0:1`), and marine sapphire (`#0369A1`, contrast `5.8:1`).

---

## Color Palette & CSS Custom Properties

| Semantic Token | Dark Mode (`Bioluminescent Museum`) | Light Mode (`Archival Field Guide`) | Usage & WCAG AA Guarantee |
| :--- | :--- | :--- | :--- |
| `--tf-bg-canvas` | `#030812` | `#F6F3EC` | Root viewport & 3D stage surround |
| `--tf-bg-surface` | `rgba(15, 23, 42, 0.82)` | `rgba(255, 253, 248, 0.92)` | Primary HUD cards, Inspector, Timeline, Modals |
| `--tf-bg-elevated` | `rgba(30, 41, 59, 0.78)` | `#EFE9DC` | Interactive pills, search inputs, secondary panels |
| `--tf-border-subtle` | `rgba(148, 163, 184, 0.18)` | `rgba(15, 23, 42, 0.14)` | Card hairlines, anatomical layer dividers |
| `--tf-border-strong` | `rgba(52, 211, 153, 0.45)` | `rgba(4, 120, 87, 0.45)` | Active card / selected taxon / focus accent |
| `--tf-text-primary` | `#F8FAFC` | `#0F172A` | Headings, species common names (`>= 15:1` contrast) |
| `--tf-text-secondary` | `#CBD5E1` | `#334155` | Body descriptions, anatomy notes (`>= 8.5:1` contrast) |
| `--tf-text-muted` | `#94A3B8` | `#475569` | Captions, taxonomic ranks, metadata (`>= 5.2:1` contrast) |
| `--tf-accent-living` | `#34D399` | `#047857` | Extant / Living fauna indicators & active states |
| `--tf-accent-fossil` | `#FBBF24` | `#B45309` | Prehistoric fossil fauna & Deep-Time MYA badges |
| `--tf-accent-holocene` | `#FB7185` | `#BE123C` | Holocene / Historical extinctions (1500 CE – Present) |
| `--tf-accent-ocular` | `#22D3EE` | `#0E7490` | Eye Macro View, photopic/scotopic optics & Kingdom Registry |
| `--tf-focus-ring` | `#38BDF8` | `#0284C7` | Universal `2px` `:focus-visible` keyboard outline |

---

## Typography & Scannability

- **Strict CSP Compliance (`firebase.json`):** `font-src 'self' data:` — **zero external Google Fonts CDN calls** (`fonts.googleapis.com` is intentionally blocked for privacy & zero-CLS instant boot).
- **Display & Species Headings (`--font-display`):** `'Outfit', 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif` — geometric clarity with tight tracking (`-0.02em`) for common names and section headers.
- **Scientific Binomials (`font-serif italic`):** `'Newsreader', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif` — authentic Linnaean binomial nomenclature (*Loxodonta africana*, *Raphus cucullatus*).
- **Body & Multilingual Copy (`--font-sans`):** `'Inter', 'Noto Sans', 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans Arabic', system-ui, sans-serif` — full 11-language glyph coverage including RTL Arabic (`dir="rtl"`).
- **Telemetry & Metrics (`tabular-nums`):** Apply `font-variant-numeric: tabular-nums` to all mass, length, speed, lifespan, MYA geological dates, species counts, and pagination counters so columns never jitter during live scrubbing.

---

## Iconography & Zero-Emoji Structural Rule

- **No Raw Unicode Emojis in Structural UI:** Never use raw emoji characters (`🍪`, `🦴`, `🐾`, `👁️`, `✨`, `🌍`) as button icons, tab icons, or status badges.
- **Vector Icons Only:** Use `lucide-react` (`16px`–`20px`, `strokeWidth={1.75}` or `2`) with `aria-hidden="true"` on decorative icons and explicit `aria-label` on icon-only buttons.

---

## Accessibility, Touch Targets & Motion Rules

1. **Keyboard Navigation & Focus Visibility:**
   - Every interactive `<button>`, `<select>`, `<input>`, `[role="tab"]`, and card trigger must exhibit a high-contrast `2px solid var(--tf-focus-ring)` outline with `2px` offset on `:focus-visible`.
   - Anatomy/Bio/Eye/Habitat/Quiz tabs implement full WAI-ARIA `role="tablist"` semantics with `ArrowLeft` / `ArrowRight` (automatically mirrored in `dir="rtl"`), `Home`, and `End` key support.
   - Modals (`QuizModal`, `GlobalTaxonomyBrowser`, `PrivacyNotice`) trap/restore focus cleanly and close on `Escape`.
2. **Touch Ergonomics:**
   - Primary controls, filter chips, theme toggle, audio narration controls, and mobile tabs enforce `min-height: 44px` (`@media (pointer: coarse)`) with `>= 8px` gap between adjacent targets.
3. **Reduced Motion (`prefers-reduced-motion: reduce`):**
   - CSS transitions/animations collapse to near-instant (`0.01ms`).
   - Non-essential idle 3D camera bobbing and procedural idle animations respect OS `prefers-reduced-motion: reduce` unless the user explicitly engages 3D orbit or animation controls.

---

## Pre-Delivery Checklist (`ui-ux-pro-max` + `stitch-design`)

- [x] Zero raw emojis used as structural UI icons (all replaced with crisp `lucide-react` SVGs)
- [x] Dark (`Bioluminescent Museum`) & Light (`Archival Field Guide`) themes with `>= 4.5:1` text contrast in both modes
- [x] Visible `:focus-visible` rings, `Escape` modal dismissal, and `ArrowLeft`/`ArrowRight` WAI-ARIA tablist navigation
- [x] `tabular-nums` applied to all numeric metrics, geological MYA spans, and registry species counts
- [x] Responsive verification at `375px` (mobile) and `1440px` (desktop) with zero horizontal overflow
- [x] Hyper-real 3D specimen rendering across curated living, Holocene-extinct, and prehistoric fossil animals + full Kingdom *Animalia* global registry pagination
