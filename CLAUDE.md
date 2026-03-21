# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Masons Xu, a backend technical lead and distributed systems architect. The site features:
- **React 19** + **TypeScript** with Vite as the build tool
- **Tailwind CSS v4** for styling (CSS-based theme configuration via `@theme`)
- **Remotion** (`@remotion/player`) for timeline-based SVG animations (constellation effects)
- **framer-motion** for scroll-triggered reveal animations
- **lucide-react** for consistent icon system (no inline SVG)
- Mobile-responsive design with Tailwind's responsive utilities
- Custom "Midnight Pearl" dark theme (black-gold aesthetic)
- Deployed on **Cloudflare Pages** via `masonsxu-github-io.pages.dev`

## Architecture & File Structure

```
├── index.html              # Vite entry point (meta tags, SEO, JSON-LD)
├── vite.config.ts          # Vite config (React, Tailwind v4, chunk splitting)
├── tsconfig.json           # TypeScript project references
├── public/                 # Static assets (copied to dist/ as-is)
│   ├── favicon.svg
│   ├── og-image.png / .svg
│   ├── resume.pdf / .html
│   ├── robots.txt / sitemap.xml
│   ├── CNAME
│   └── 404.html            # Standalone 404 page
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Root component (spotlight effect, layout)
│   ├── index.css           # Tailwind v4 @theme + global CSS
│   ├── components/
│   │   ├── Navbar.tsx      # Fixed glass-morphism nav with scroll highlight
│   │   ├── Hero.tsx        # Hero section with Remotion constellation
│   │   ├── Architecture.tsx # Core competency bento grid
│   │   ├── Skills.tsx      # Technical skills grid
│   │   ├── Projects.tsx    # Project showcases
│   │   ├── Experience.tsx  # Career timeline
│   │   ├── Education.tsx   # Education & awards
│   │   ├── Essence.tsx     # Philosophy + Zodiac card with Remotion
│   │   ├── ShowreelGallery.tsx  # Video gallery with modal playback
│   │   ├── VideoModal.tsx       # Reusable video modal (framer-motion AnimatePresence)
│   │   ├── TechCardShowcase.tsx # (Legacy) Inline showreel player
│   │   ├── OpenSourceDashboardShowcase.tsx # (Legacy) Inline dashboard player
│   │   ├── OpenSource.tsx  # Open source contributions & PRs
│   │   ├── Footer.tsx
│   │   ├── SectionHeader.tsx  # Reusable section header
│   │   └── ScrollReveal.tsx   # framer-motion scroll animations
│   └── remotion/
│       ├── ConstellationAnimation.tsx  # Remotion composition (spring + interpolate)
│       ├── TechCardVideo.tsx           # 15s tech card (4 phases: entrance, stack, highlights, outro)
│       ├── OpenSourceDashboard.tsx     # 20s data-driven dashboard (terminal, metrics, topology, outro)
│       └── ArchitectureEvolution.tsx   # 25s architecture narrative (probe-driven request tracing)
```

## Key Design Decisions

**Color Scheme** (defined in `src/index.css` via `@theme`, black-gold "Midnight Pearl" theme):
- bg: `#0C0C0E` (Obsidian) / body: `#0B0E14`
- surface: `#121214` / surface-light: `#1E1E21`
- border: `#D4AF37` (Gold, used with `/20` opacity modifier)
- primary: `#D4AF37` (Gold)
- accent: `#F2D288` (Light Gold)
- text: `#FCFCFC` (Pearl)
- muted: `#A1A1AA` (Zinc Muted)

**Fonts** (loaded from `fonts.loli.net` - China-friendly mirror, defined in `index.html`):
- Sans: Noto Sans SC (Chinese support)
- Serif: Playfair Display
- Mono: JetBrains Mono

**Animation Stack**:
- **Remotion**: Timeline-based SVG animations (`spring()`, `interpolate()`, `Easing`) + video compositions
- **framer-motion**: Scroll-triggered reveal & stagger animations (`useInView`, `motion.div`)
- **CSS**: Spotlight card effect (mouse-tracking), shimmer, gradient shift

**Tailwind v4 Notes**:
- Theme configured via `@theme {}` in CSS (no `tailwind.config.js`)
- Border color is opaque `#D4AF37`; always use opacity modifier: `border-border/20`
- Dynamic class names (e.g., `text-${var}`) are NOT supported; use static classes only

**Code Conventions**:
- Icons: Always use `lucide-react`, never inline SVG
- Colors: Always use semantic classes (`bg-surface`, `text-primary`, `text-muted`), never hardcode hex values
- Cards: Use `rounded-lg` + `spotlight-card` class for hover glow effect
- Borders: Use `border-border/20` for subtle gold borders
- Hover: Use `hover:border-primary/50` for consistent hover states

## Common Development Tasks

**Local development**: `npm run dev` — starts Vite dev server with HMR

**Production build**: `npm run build` — runs TypeScript check + Vite build → `dist/`

**Preview build**: `npm run preview` — serves the built `dist/` locally

**Adding a new section**:
1. Create `src/components/NewSection.tsx`
2. Import and add to `src/App.tsx` within `<main>`
3. Add nav link in `src/components/Navbar.tsx` (both desktop and mobile)

**Modifying theme colors**: Edit `@theme {}` block in `src/index.css`

**Modifying Remotion animation**: Edit `src/remotion/ConstellationAnimation.tsx`
- All animations must use `useCurrentFrame()` + `useVideoConfig().fps`
- CSS animations are forbidden inside Remotion components
- Use `spring()` for natural motion, `interpolate()` for mapped values
- Use `Sequence` with `premountFor` for timeline sequencing
- Use `AbsoluteFill` for layout composition

**Modifying TechCardVideo**: Edit `src/remotion/TechCardVideo.tsx`
- Configurable constants at file top: `NAME_CN`, `NAME_EN`, `ROLE`, `SUBTITLE`, `TECH_STACKS`, `HIGHLIGHTS`
- 4 phases: `NameEntrance` (0-4s), `TechStackShowcase` (4-9s), `CoreHighlights` (9-12s), `Outro` (12-15s)
- 1920x1080 @ 30fps, 15s duration (450 frames)

**Modifying OpenSourceDashboard**: Edit `src/remotion/OpenSourceDashboard.tsx`
- Props-driven via `ProjectData` interface (stars, prs, merged, agentsMdLines)
- 4 phases: `TerminalTyping` (0-5s), `DataGrowth` (5-12s), `TopologyAnimation` (12-18s), `Outro` (18-20s)
- Topology reflects real architecture: Client → Hertz Gateway → Identity Service (Kitex) → Storage layer
- 1920x1080 @ 30fps, 20s duration (600 frames)

**Modifying ArchitectureEvolution**: Edit `src/remotion/ArchitectureEvolution.tsx`
- 25s narrative video (750 frames @ 30fps) with 4 phases via `Sequence`
- Phase 1 `PythonEra` (0-5s): Monolith block with shake + red warning blink
- Phase 2 `Transformation` (5-10s): Go/CloudWeGo core + fission into `SERVICES` array (spring `damping:12` for bounce)
- Phase 3 `NewArchitecture` (10-20s): **Probe-driven request tracing** — a single gold light probe travels through the system, activating components on contact
  - 0-1s: Ghost containers appear at opacity 0.2, SVG `strokeDashoffset` flowing borders
  - 1-3s: Probe enters Gateway, middleware pills highlight sequentially via timeline math
  - 3-4.5s: Thrift RPC transit via cubic bezier with `Easing.in(Easing.quad)` acceleration
  - 4.5-7s: Probe descends RPC DDD layers, description text slides in on activation
  - 7-10s: Probe fades, metric cards spring in with value flip animation
- Phase 4 `Essence` (20-25s): Slogan + domain fade in/out
- Key architecture data constants at file top: `DDD_LAYERS`, `GATEWAY_LAYERS`, `MIDDLEWARE_CHAIN`, `SUB_CONVERTERS`
- `CL` shorthand for `{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }` used throughout

**Remotion animation patterns** (established conventions across all video compositions):
- **Probe-driven narrative**: Compute a master object position `{x, y}` via multi-segment `interpolate`, then derive each component's highlight state from timeline thresholds (not from physical distance). See `NewArchitecture` probe pattern.
- **SVG flow effects**: Use `strokeDasharray` + animated `strokeDashoffset` (driven by `frame`) for flowing/marching borders and connection paths. Never use CSS animation.
- **Ghost → Activate pattern**: Render containers at low opacity first, then raise opacity when the narrative focus reaches them. Provides visual context before activation.
- **Restrained springs**: Use `{ damping: 200 }` for luxury/smooth feel (no bounce). Reserve `{ damping: 12 }` only for intentionally playful fission effects.
- **Multi-segment probe position**: Use `if/else` chains with per-segment `interpolate` (each with its own easing) rather than single multi-keyframe interpolate, to allow different easing per segment (e.g., `Easing.in(Easing.quad)` for acceleration on transit segments).
- **Highlight activation**: `interpolate(frame, [activateAt, activateAt + N], [0, 1], CL)` returns a 0→1 progress used to drive opacity, scale, and translateX for slide-in descriptions.

**Adding a new Remotion video**:
1. Create `src/remotion/NewVideo.tsx` with Remotion composition
2. Add entry to `VIDEOS` array in `src/components/ShowreelGallery.tsx`
3. No other changes needed — gallery and modal handle the rest

**Showreel architecture** (VideoModal + ShowreelGallery):
- `VideoModal.tsx`: Reusable overlay with `AnimatePresence` spring animation, ESC/backdrop close
- `ShowreelGallery.tsx`: Video registry pattern — all videos defined in `VIDEOS` array
- Click card → modal opens with `@remotion/player` → click outside to close

**Environment variables for data-driven Remotion**:
- `VITE_OSS_STARS`, `VITE_OSS_PRS`, `VITE_OSS_MERGED`, `VITE_OSS_AGENTS_LINES`
- Read via `import.meta.env.VITE_*` at build time in `ShowreelGallery.tsx`
- Configured in Cloudflare Pages env vars, updated daily via scheduled rebuild

## Deployment Notes

- **Cloudflare Pages**: Builds from `main` branch, build command: `npm run build`, output dir: `dist`
- Custom domain: `masonsxu-github-io.pages.dev`
- `public/CNAME` and `public/404.html` are deployed as-is

## Commit Message Style

Follow conventional commits format (lowercase, Chinese):
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code restructuring
- `style:` for styling changes
- `docs:` for documentation

Example: `feat: 添加新的核心项目展示区`
