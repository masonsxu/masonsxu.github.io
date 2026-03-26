# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Masons Xu, a backend technical lead and distributed systems architect. The site features:
- **React 19** + **TypeScript** with Vite as the build tool
- **Tailwind CSS v4** for styling (CSS-based theme configuration via `@theme`)
- **Three.js** for 3D dynamic background (Obsidian Neural Network multi-layer effect)
- **Remotion** (`@remotion/player`) for timeline-based SVG animations (constellation effects, video showcases)
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
│   │   ├── ThreeBackground.tsx # Three.js dynamic background (nebula, flow particles, network topology, wireframe geometry)
│   │   ├── Navbar.tsx      # Fixed glass-morphism nav with scroll highlight
│   │   ├── Hero.tsx        # Hero section with Remotion constellation
│   │   ├── Architecture.tsx # Core competency bento grid
│   │   ├── Skills.tsx      # Technical skills grid
│   │   ├── Projects.tsx    # Project showcases
│   │   ├── Experience.tsx  # Career timeline
│   │   ├── Education.tsx   # Education & awards
│   │   ├── Essence.tsx     # Philosophy + Zodiac card with Remotion
│   │   ├── ShowreelGallery.tsx  # Video gallery with fullscreen modal playback
│   │   ├── VideoModal.tsx       # Reusable video modal (fullscreen + normal modes, AnimatePresence)
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
│       ├── ArchitectureEvolution.tsx   # 25s architecture narrative (probe-driven request tracing)
│       ├── GitHubHeatmap.tsx           # 20s contribution heatmap (particle converge + milestone cards)
│       └── PortfolioTrailer.tsx        # 60s main composition (TransitionSeries wipe, embeds all above)
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

**Modifying ThreeBackground**: Edit `src/components/ThreeBackground.tsx`
- 5-layer "Obsidian Neural Network" design: nebula sprites → flow particles → network topology → dust → wireframe geometry
- Layer 1 星河层: 5 golden glow sprites with breathing opacity animation
- Layer 2 流场粒子: 4000 particles following sin/cos flow field
- Layer 3 动态网络: 100 orbital nodes + proximity-based connection lines with energy pulse
- Layer 4 大气尘埃: 2000 dim particles for depth
- Layer 5 线框几何体: Ghost octahedron/icosahedron/torus with slow rotation
- Interaction: mouse parallax camera movement, exponential fog, cinematic CSS vignette
- Accessibility: respects `prefers-reduced-motion`, scales to 10%
- Resources: unified `disposables` array for GPU cleanup

**Working with Remotion compositions**:
- All animations must use `useCurrentFrame()` + `useVideoConfig().fps`
- CSS animations are forbidden inside Remotion components
- Use `spring()` for natural motion, `interpolate()` for mapped values
- Use `Sequence` with `premountFor` for timeline sequencing
- Use `AbsoluteFill` for layout composition
- When rendering videos for background use, export as WebM VP9 for broad browser support
- For performance, keep background videos under 60s and optimize file size

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

**Modifying GitHubHeatmap**: Edit `src/remotion/GitHubHeatmap.tsx`
- 20s heatmap video (600 frames @ 30fps) with 4 phases via `Sequence`
- Phase 1 `CosmosPhase` (0-4s): Midnight Pearl background, faint gold grid lines fade in, contribution cells as distant star-dust with perspective zoom
- Phase 2 `ConvergePhase` (4-12s): **Particle convergence** — gold particles fly from random screen positions (pre-computed via `computeParticleOrigins`) along `Easing.bezier` S-curves, landing on corresponding grid cells; each hit triggers a `radialGradient` ripple pulse + white flash; real-time `0→356` rolling counter in bottom-right
- Phase 3 `MilestonePhase` (12-17s): Full heatmap displayed; achievement cards spring in (`damping:12, stiffness:180` for visible wobble) with SVG cubic bezier connection lines to target cells; pulsing gold glow on milestone cells; 3-metric stats panel (TOTAL / ACTIVE DAYS / HIGH INTENSITY)
- Phase 4 `FinalePhase` (17-20s): Zoom out to full-year panorama, radial glow, slogan "Architecture is a long-term commitment." fade in/out
- Data-driven via `HeatmapProps`: `contributions` (ContributionDay[]) + `achievements` (Achievement[])
- Real GitHub data: `RAW_COUNTS` array (371 integers from GitHub GraphQL API), `countToIntensity()` maps count → 0-4
- Heat color scale: `#161618` → `#2a2a2e` → `#5c5c64` → `#b8b8c0` → `#d4af37` (dark gray → pearl white → gold)
- Grid constants: `WEEKS=53`, `CELL=14`, `GAP=3`, `MONTH_LABELS`/`MONTH_WEEKS` for real calendar alignment (2025-03 start)
- Performance: `React.memo` on `ConvergePhase` + `AmbientParticles`, `useMemo` for particle origins pre-computation
- Deterministic pseudo-random via `hash()` (sin-based) ensures frame-to-frame consistency

**Remotion animation patterns** (established conventions across all video compositions):
- **Probe-driven narrative**: Compute a master object position `{x, y}` via multi-segment `interpolate`, then derive each component's highlight state from timeline thresholds (not from physical distance). See `NewArchitecture` probe pattern.
- **SVG flow effects**: Use `strokeDasharray` + animated `strokeDashoffset` (driven by `frame`) for flowing/marching borders and connection paths. Never use CSS animation.
- **Ghost → Activate pattern**: Render containers at low opacity first, then raise opacity when the narrative focus reaches them. Provides visual context before activation.
- **Restrained springs**: Use `{ damping: 200 }` for luxury/smooth feel (no bounce). Reserve `{ damping: 12 }` only for intentionally playful fission effects.
- **Multi-segment probe position**: Use `if/else` chains with per-segment `interpolate` (each with its own easing) rather than single multi-keyframe interpolate, to allow different easing per segment (e.g., `Easing.in(Easing.quad)` for acceleration on transit segments).
- **Highlight activation**: `interpolate(frame, [activateAt, activateAt + N], [0, 1], CL)` returns a 0→1 progress used to drive opacity, scale, and translateX for slide-in descriptions.
- **Particle convergence pattern**: Pre-compute random origins outside render loop (`useMemo`), use `Easing.bezier` for smooth S-curve flight paths, trigger ripple + flash on arrival. See `ConvergePhase` in GitHubHeatmap.
- **TransitionSeries for multi-composition trailers**: Use `@remotion/transitions` (`TransitionSeries`, `linearTiming`, `wipe`/`fade`) to chain sub-compositions with cross-dissolve or wipe cuts. Duration math: total = sum(scene frames) - sum(transition frames). Keep `FADE_DUR` ≤ 4 frames for shutter-style cuts.
- **Embedding sub-compositions**: Render existing composition components (e.g., `<TechCardVideo />`) directly inside `TransitionSeries.Sequence`. `useCurrentFrame()` returns local frame (0-based) within the Sequence. Sub-compositions only use `fps` from `useVideoConfig()`, never `durationInFrames`, so they render correctly when clipped shorter than their native duration.
- **Sequential cell activation**: For large grids (371+ cells), compute `activateAt = baseDelay + (index / total) * duration` per cell to create a wave-growth effect without individual `Sequence` wrappers.
- **Deterministic randomness**: Use `hash(n) = fract(sin(n * 127.1 + 311.7) * 43758.5453)` for stable pseudo-random values across frames. Never use `Math.random()` in Remotion.
- **React.memo for heavy phases**: Wrap phases with 300+ SVG elements in `React.memo` to prevent unnecessary re-renders from parent prop changes. Pre-compute static data with `useMemo`.

**Adding a new Remotion video**:
1. Create `src/remotion/NewVideo.tsx` with Remotion composition
2. Add entry to `VIDEOS` array in `src/components/ShowreelGallery.tsx`
3. Add watermark to main composition: `<div style={{ position: 'absolute', bottom: 24, right: 32, pointerEvents: 'none', opacity: 0.18 }}><span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#a1a1aa', fontWeight: 400, letterSpacing: 2 }}>Masons.Xu | 2026</span></div>`
4. No other changes needed — gallery and modal handle the rest

**Modifying PortfolioTrailer**: Edit `src/remotion/PortfolioTrailer.tsx`
- 60s main composition (1800 frames @ 30fps) using `TransitionSeries` from `@remotion/transitions`
- Embeds existing components: `TechCardVideo` (0-10s), `ArchitectureEvolution` (10-25s), `GitHubHeatmap` (25-45s as dimmed background with stats overlay), custom `FinalOutro` (45-60s)
- Transitions: `wipe({ direction: 'from-left' })` + `linearTiming({ durationInFrames: 4 })` = 0.13s shutter cuts
- Duration math: scene frames sum = 1812, minus 3×4 overlap = 1800 frames exact
- `SCENE = { intro: 304, evolution: 454, impact: 604, outro: 450 }` — adjust when changing `FADE_DUR`
- Global layers: `GlobalBackground` (60s grid+particles) → `TransitionSeries` → watermark → `CinematicOverlay` (vignette + film grain)
- ImpactPhase: left gradient overlay + stats cards (env-driven) over dimmed GitHubHeatmap background
- FinalOutro: converging gold dots → diamond → name → slogan → domain → fade to black

**Showreel architecture** (VideoModal + ShowreelGallery):
- `VideoModal.tsx`: Fullscreen overlay (100vw×100vh, `#0a0a0a` bg) with `AnimatePresence`, ESC/backdrop close, minimal close button
  - Two keyed branches: `key="modal-fullscreen"` (default, all videos) and `key="modal-normal"` (unused, reserved)
  - Keys are required for AnimatePresence to correctly track mount/unmount of different layout branches
- `ShowreelGallery.tsx`: Video registry pattern — all videos defined in `VIDEOS` array
- Player: `initiallyMuted` (all audio disabled), `numberOfSharedAudioTags={0}`, `loop`, `autoPlay`
- Click card → fullscreen modal opens with `@remotion/player` → ESC or click close button to dismiss

**Remotion brand watermark** (all compositions):
- Every Remotion composition includes a persistent watermark in the main export component
- Position: `absolute bottom-24 right-32`, opacity 0.18, `pointerEvents: 'none'`
- Text: `Masons.Xu | 2026`, 11px JetBrains Mono, color `#a1a1aa`, letterSpacing 2
- Layer order: above all Sequences/TransitionSeries content, below CinematicOverlay (if present)

**Environment variables for data-driven Remotion**:
- `VITE_OSS_STARS`, `VITE_OSS_PRS`, `VITE_OSS_MERGED`, `VITE_OSS_AGENTS_LINES`
- Read via `import.meta.env.VITE_*` at build time in `ShowreelGallery.tsx`
- Configured in Cloudflare Pages env vars, updated daily via scheduled rebuild

## Deployment Notes

- **Cloudflare Pages**: Builds from `main` branch, build command: `npm run build`, output dir: `dist`
- Custom domain: `masonsxu-github-io.pages.dev`
- `public/CNAME` and `public/404.html` are deployed as-is
- **GitHub Actions Maintenance**: Regularly check and update action versions to avoid deprecation warnings. Currently using:
  - actions/checkout@v6
  - actions/setup-node@v6
  - cloudflare/pages-action@v1.5.0 (deprecated, use Wrangler CLI instead)
  - peter-evans/create-pull-request@v6
- **Cloudflare API Token**: Required for deployment. Set these secrets in GitHub repository settings:
  - `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Pages write permission
  - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
  - Generate at: https://dash.cloudflare.com/profile/api-tokens

## Commit Message Style

Follow conventional commits format (lowercase, Chinese):
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code restructuring
- `style:` for styling changes
- `docs:` for documentation

Example: `feat: 添加新的核心项目展示区`

## WebGPU Development Common Pitfalls

**IMPORTANT**: This project uses WebGPU for the liquid metal background. When working with WebGPU shaders, watch out for these common issues that can cause "invisible rendering":

### 1. WGSL Struct Alignment Rules

**Problem**: Buffer size mismatch errors like "buffer bound with size 32 where the shader expects 48"

**Root Cause**: WGSL enforces 16-byte alignment for struct members. Each vec3f takes 12 bytes but gets padded to 16 bytes.

```wgsl
// ❌ WRONG: Assumes 32 bytes
struct LightParams {
  lightDir: vec3f,      // 12 bytes + 4 padding = 16
  lightColor: vec3f,    // 12 bytes + 4 padding = 32
  lightIntensity: f32,  // 4 bytes + 4 padding = 36
  time: f32,           // 4 bytes + 12 padding = 48
}
```

**Solution**: Always pad to 16-byte boundaries in TypeScript:

```typescript
// ✅ CORRECT: 48 bytes with proper padding
const params = new Float32Array([
  0.3, 0.5, 0.8, 0,      // lightDir + padding
  1.0, 0.9, 0.8, 0,      // lightColor + padding
  1.2, 0,                // lightIntensity + padding
  0, 0, 0, 0,            // time + padding to 16-byte boundary
])
```

**Key Rule**: When creating uniform buffers in TypeScript, calculate size as:
- `vec3f` → 16 bytes (12 + 4 padding)
- `vec2f` → 8 bytes (8, no padding needed)
- `f32` → 4 bytes
- Total must be multiple of 16

### 2. Duplicate @builtin(position) in Fragment Shader

**Problem**: "Built-in Position is present more than once" validation error

**Root Cause**: Passing `@builtin(position)` as both a struct member AND a function parameter.

```wgsl
// ❌ WRONG: position appears twice
struct VsOut {
  @builtin(position) pos: vec4f,  // ← Already here
  @location(0) velocity: vec2f,
}

@fragment
fn fs(
  input: VsOut,
  @builtin(position) fragCoord: vec4f  // ← DUPLICATE!
) -> @location(0) vec4f {
  let offset = fragCoord.xy - center;
}
```

**Solution**: Remove the parameter and use the struct member:

```wgsl
// ✅ CORRECT: Only in struct
@fragment
fn fs(input: VsOut) -> @location(0) vec4f {
  let offset = input.pos.xy - center;  // Use struct member
}
```

### 3. Texture Sampling Type Mismatch

**Problem**: "Non-filterable float textures can't be sampled with a filtering sampler"

**Root Cause**: Using `sampleType: 'float'` for filterable formats like `rgba8unorm`

**Solution**: Use the correct sample type:

```typescript
// ❌ WRONG
texture: { sampleType: 'float' }  // For unfilterable formats only

// ✅ CORRECT
texture: { sampleType: 'float' }  // rgba8unorm IS filterable
sampler: { type: 'filtering' }

// For depth textures:
texture: { sampleType: 'depth' }
```

**Note**: `rgba8unorm`, `bgra8unorm` ARE filterable and can use filtering samplers.

### 4. Coordinate System Confusion

**Problem**: Particles render but appear off-screen or distorted

**Root Cause**: Mixing clip space [-1,1] with pixel coordinates in fragment shader

```wgsl
// ❌ WRONG: Mixing coordinate systems
let center = input.screenPos * vec2f(640.0, 360.0);  // Pixel space
let offset = fragCoord.xy - center;  // Clip space - MISMATCH!
```

**Solution**: Stay in one coordinate system throughout:

```wgsl
// ✅ CORRECT: Use clip space everywhere
@vertex
fn vs(@builtin(vertex_index) vid: u32) -> VsOut {
  let p = particles[vid].pos;
  let clip = vec2f(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0);
  output.pos = vec4f(clip, 0.0, 1.0);
  output.screenPos = clip;  // Pass clip space, NOT pixel space
}

@fragment
fn fs(input: VsOut) -> @location(0) vec4f {
  // Everything in clip space [-1, 1]
  let distFromCenter = length(input.screenPos);
}
```

### 5. Render Pass Load/Clear Order

**Problem**: Earlier render passes get cleared by later ones

**Root Cause**: Using `loadOp: 'clear'` in multiple render passes

```typescript
// ❌ WRONG: Second pass clears first pass
// Pass 1: Render particles
loadOp: 'clear'  // Clears screen

// Pass 2: Render reflections
loadOp: 'clear'  // Clears particles! Should be 'load'
```

**Solution**: Only clear first pass, use 'load' for subsequent passes:

```typescript
// ✅ CORRECT: Proper ordering
// Pass 1: Render particles (clear first)
{
  loadOp: 'clear',
  storeOp: 'store',
}

// Pass 2: Render reflections on top
{
  loadOp: 'load',   // Load existing framebuffer
  storeOp: 'store',
}
```

### Debugging Checklist

When background doesn't render:

1. **Check browser console for WebGPU errors**
2. **Verify buffer sizes match WGSL struct alignment**
3. **Ensure no duplicate @builtin(position)**
4. **Confirm coordinate system consistency**
5. **Check render pass loadOp ordering**
6. **Verify particle count > 0 in logs**
7. **Test with larger/brighter particles first**
8. **Simplify fragment shader to basic colors**

### WebGPU File Locations

- `src/webgpu/WebGPUContext.ts` - Device management
- `src/webgpu/ComputeShaderSystem.ts` - Particle physics
- `src/webgpu/RenderShaderSystem.ts` - Rendering pipeline
- `src/webgpu/UIInteractionLayer.ts` - Mouse/touch input
- `src/webgpu/ReflectionCompositor.ts` - Reflection effects
- `src/webgpu/PerformanceMonitor.ts` - Adaptive quality
- `public/shaders/compute.wgsl` - Compute shader (WGSL)
- `src/components/WebGPUBackground.tsx` - React orchestrator
