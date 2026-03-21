# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Mason Xu, a backend technical lead and distributed systems architect. The site features:
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
│   │   ├── OpenSource.tsx  # Open source contributions & PRs
│   │   ├── Footer.tsx
│   │   ├── SectionHeader.tsx  # Reusable section header
│   │   └── ScrollReveal.tsx   # framer-motion scroll animations
│   └── remotion/
│       └── ConstellationAnimation.tsx  # Remotion composition (spring + interpolate)
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
- **Remotion**: Timeline-based constellation SVG animation (`spring()`, `interpolate()`, `Easing`)
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
