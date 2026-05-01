# Design System — Masons Xu Personal Brand Site

> **Core Aesthetic:** Framer's cinematic void black + Midnight Pearl accent system.
> **Role:** A senior backend engineer's portfolio — code structure, architecture diagrams, and metrics as visual hero.

---

## 1. Visual Language & Atmosphere

The site is a pure black (`#000000`) technical portfolio. The primary visual artifacts are architecture topology maps, data pipeline flows, and performance metrics. The feeling is calm, profoundly structured, and precise — like reading a well-composed system design doc in a dark IDE.

- **Primary canvas:** Void Black `#000000` — absolute dark, no warm tint.
- **Hero visual:** Large typography for the name, supported by key metrics glowing in Pearl Gold.
- **Secondary visual:** Architecture diagrams (SVG) rendered with clean lines, blue nodes, and gold highlights for critical paths.
- **Interactive elements:** Pill-shaped buttons only. Frosted glass surfaces on cards.
- **Accents:** Two colors only — Framer Blue for standard links/interactions, Pearl Gold for personal branding and key metrics.

---

## 2. Color Palette

### Base
- Background: `#000000`
- Text Primary: `#ffffff`
- Text Secondary: `#a6a6a6`
- Text Tertiary: `rgba(255,255,255,0.55)`

### Accents
- **Framer Blue:** `#0099ff` — links, focus rings, standard interactive borders.
- **Pearl Gold:** `#d4a853` — personal monogram, key metrics (99.9%, 50%, 10+, 87%), section dividers, primary CTA outline.

### Surfaces & Depth
- Frosted Card: `rgba(255,255,255,0.08)` background, `rgba(0,153,255,0.15)` ring border.
- Elevated Card: same + `rgba(255,255,255,0.1) 0px 0.5px 0px 0.5px` top highlight + `rgba(0,0,0,0.25) 0px 10px 30px` shadow.
- Metric Highlight Card: `rgba(212,168,83,0.2)` ring border.

### Glows
- Blue Glow: `rgba(0,153,255,0.12)` — subtle behind diagrams.
- Gold Glow: `rgba(212,168,83,0.12)` — behind hero metrics.

---

## 3. Typography

| Element | Font | Size / Weight / Line / LS |
|---------|------|---------------------------|
| Hero Name | GT Walsheim Medium | 110px / 500 / 0.85 / -5.5px |
| Section Title | GT Walsheim Medium | 72px / 500 / 0.9 / -3.6px |
| Project Name | GT Walsheim Medium | 42px / 500 / 0.95 / -2px |
| Metric Number | Inter | 56px / 700 / 1.0 / -1.5px (Gold) |
| Card Title | Inter | 22px / 700 / 1.2 / -0.5px |
| Body Large | Inter | 18px / 400 / 1.5 / normal |
| Body | Inter | 15px / 400 / 1.5 / normal |
| Code / Tags | JetBrains Mono | 12px / 400 / 1.4 / normal |
| Micro | Inter | 11px / 500 / 1.2 / 0.5px uppercase |

- GT Walsheim is used at weight 500 only.
- Inter uses OpenType features: `cv01`, `cv05`, `cv09`, `cv11`, `ss03`, `ss07`.
- Gold color appears only on metric numbers and the personal monogram.

---

## 4. Component Library

### Buttons
- **Solid White Pill:** `#fff` bg, `#000` text, `100px` radius, `14px 28px` padding. Primary CTA.
- **Frosted Pill:** `rgba(255,255,255,0.08)` bg, white text, `40px` radius, `10px 20px`. Secondary actions.
- **Gold Outline Pill:** `1px solid #d4a853`, transparent bg, gold text, `40px` radius. High-emphasis contact.
- Hover: `transform: scale(1.02)` transition 0.2s.

### Cards (Project / Capability)
- `.card`: black bg, blue ring `0px 0px 0px 1px rgba(0,153,255,0.15)`, radius `12px`, padding `32px`.
- `.card--elevated`: adds top white edge and deep shadow.
- `.card--metric`: gold ring instead of blue for highlighted stats.

### Navigation
- Fixed top, black bg with `backdrop-filter: blur(12px)`, height `64px`.
- Links: Inter 15px white, active state gold underline.
- CTA: Gold outline pill `Contact` at right.
- Mobile: hamburger icon, same dark panel.

### Architecture Diagrams (SVG)
- Nodes: rounded rectangle with frosted fill, blue border, white label text (Inter 11px).
- Arrows: `#0099ff` at 60% opacity.
- Gold nodes for critical services or data paths.
- Responsive scaling within `.diagram` container.

### Tags / Tech Stack
- Pill shape, `rgba(255,255,255,0.05)` bg, `1px solid rgba(0,153,255,0.2)`, `20px` radius, JetBrains Mono 11px text.

---

## 5. Layout & Spacing

- Max width: `1200px`, centered.
- Base unit: 8px. Section padding: `120px 0` desktop, `80px` tablet, `60px` mobile.
- Hero: full viewport height, centered text block + metrics grid below.
- Projects: alternating two-column (text 45% / diagram 55%) stacked on mobile.
- Metrics: 4-column grid desktop, 2-column mobile.
- Border Radius Scale: Code blocks `8px`, Cards `12px`, Buttons `40px–100px`.

---

## 6. Page Structure & Content Map

1. **Hero** — name, subtitle, 4 gold metrics, CTA `View Architecture`
2. **About** — narrative text + quote, frosted card
3. **Projects** — 4 project sections, each as elevated card with diagram
4. **Architecture Capabilities** — 3-column grid + metric highlights
5. **Career Timeline** — vertical frosted nodes, gold accent on current role
6. **Essence** — short philosophy text, no cards
7. **Showreel** — 6 Remotion video cards in 3-column grid (desktop)
8. **Open Source & Education** — 2-column
9. **Contact** — centered, gold outline CTA
10. **Footer** — minimal silver text

---

## 7. Interaction & Motion

- Section transitions: subtle fade-up on scroll (Intersection Observer).
- Buttons: scale hover.
- Navigation: background blur increases on scroll.
- Metric numbers: count-up animation on enter viewport.

---

## 8. Do's and Don'ts

**Do:**
- Pure black `#000000` background always.
- Pill-shaped buttons everywhere.
- Gold only on metrics, dividers, and personal monogram.
- Architecture diagrams as primary visual assets.

**Don't:**
- Use warm dark grays.
- Use gold on more than 10% of elements.
- Use serif fonts.
- Add decorative illustrations — diagrams and code are the decoration.

---

## 9. Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 809px | Single column, hero name 48px, stacked diagrams, hamburger nav |
| 809–1199px | Two-column projects, reduced header sizes |
| > 1199px | Full desktop layout |

---

## 10. Implementation Notes for Agent

- Use semantic HTML, CSS custom properties for all colors.
- All icons/text in diagrams should be actual SVG text elements for accessibility.
- Remotion videos: embedded as muted, looping background videos in their cards (or linked).
- Count-up animation: use `requestAnimationFrame` with easing.
- Performance: lazy load diagrams and videos. Serve fonts locally.