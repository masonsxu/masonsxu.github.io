# AI Agent Guide for Masons.Xu Portfolio

## 🎯 Critical Workflow: Research Before Coding

**LEARNED FROM EXPERIENCE: Always research existing solutions first**

### The Golden Rule
> **"Don't reinvent the wheel"** is not about being lazy—it's about engineering wisdom.

Mature open-source projects have already:
- Solved all edge cases
- Optimized performance
- Handled compatibility issues
- Provided comprehensive error handling

Our value is in:
- Understanding these best practices
- Adapting them to specific requirements
- Adjusting and tuning parameters
- Learning and sharing knowledge

### Correct Workflow (MUST FOLLOW)

```bash
# ✅ DO THIS (saves 65% time, reduces frustration by 90%)
1. Research (0.5h) → Study README, understand architecture, identify key patterns
2. Understand Design (0.2h) → Learn WHY they made technical choices
3. Port Core Code (0.3h) → Copy working code directly
4. Minimal Adaptation (0.2h) → Only change what's necessary (params, styling)
5. Test & Verify (0.1h) → Ensure functionality works
Total: 1.2 hours

# ❌ DON'T DO THIS (what I did wrong)
1. Start coding immediately → Write raw WebGPU shader from scratch
2. Hit syntax errors → Spend hours debugging WGSL quirks
3. More errors → Struggle with reserved keywords, scope issues
4. Frustration → Finally give up and copy reference project
Total: 3.5 hours (3x longer, terrible experience)
```

### When User Provides Reference Implementation

**If user clones a repo or references a project:**
1. **STOP** - Do NOT start coding yet
2. **READ** - Study the README, documentation, and code structure
3. **UNDERSTAND** - Grasp the architecture and design decisions
4. **COPY** - Port the working code directly
5. **ADAPT** - Only modify what's needed for integration

**Example: Black Hole Implementation**
- User cloned: `webgpu-black-hole` repo
- Reference used: Three.js + TSL (not raw WGSL)
- Result: Working in 1.2h instead of 3.5h
- Code quality: Better than my attempt

### Key Indicators to Look For

When studying a reference project, identify:
- **Tech stack**: Why Three.js vs raw WebGL? Why TSL vs WGSL?
- **Architecture**: Class-based? Functional? Config-driven?
- **Patterns**: How do they handle async initialization? Error handling?
- **Optimizations**: What performance tricks do they use?
- **Trade-offs**: What compromises did they make and why?

### Integration Checklist

When porting reference code:
- [ ] Read README and understand the project
- [ ] Identify entry points and core files
- [ ] Copy the essential files (don't rewrite)
- [ ] Update imports for your project structure
- [ ] Adjust configuration (not logic)
- [ ] Test incrementally
- [ ] Document what was learned

---

## Build & Test Commands

### Development
```bash
npm run dev              # Start Vite dev server with HMR
npm run build            # Run TypeScript check + build to dist/
npm run preview          # Preview production build locally
```

### Testing (Vitest)
```bash
# No explicit test script in package.json, run vitest directly:
npx vitest               # Run all tests in watch mode
npx vitest run           # Run tests once
npx vitest run <path>    # Run specific test file (e.g., npx vitest run src/webgpu/WebGPUContext.test.ts)
```

### Type Checking
```bash
npx tsc -b --noEmit      # Type check without emitting files
```

## Code Style Guidelines

### TypeScript & React
- **Strict mode**: Enabled in `tsconfig.app.json` - no implicit any, strict null checks
- **Unused code**: Not allowed - `noUnusedLocals` and `noUnusedParameters` enabled
- **Component typing**: Use `React.FC` for function components, define prop interfaces
- **Imports**: Group external imports first, then internal imports (see example below)
- **No default exports** in most cases - prefer named exports for better tree-shaking

```typescript
// ✅ Correct import order
import { useEffect, useState } from 'react'
import { SomeIcon } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import SectionHeader from './SectionHeader'

// ✅ Correct component definition
export default function MyComponent({ prop1, prop2 }: Props) {
  // Component logic
}

// ✅ Correct prop interface
interface Props {
  prop1: string
  prop2?: number
}
```

### Styling (Tailwind CSS v4)
- **Theme colors** (defined via `@theme` in `src/index.css`):
  - Backgrounds: `bg-bg`, `bg-surface`, `bg-surface-light`
  - Text: `text-text`, `text-muted`, `text-primary`, `text-accent`
  - Borders: `border-border` (always use opacity modifier: `border-border/20`)
- **NEVER** hardcode hex values in JSX - always use semantic color classes
- **Icons**: Always use `lucide-react`, never inline SVG
- **Cards**: Use `rounded-lg` + `spotlight-card` class for hover glow effect
- **Hover states**: Use `hover:border-primary/50` for consistent interaction feedback
- **NO dynamic class names** - Tailwind v4 doesn't support `text-${var}` patterns

```typescript
// ✅ Correct styling
<div className="bg-surface border border-border/20 rounded-lg p-6 spotlight-card hover:border-primary/50">
  <span className="text-primary font-bold">Title</span>
  <p className="text-muted">Description</p>
</div>

// ❌ WRONG - hardcoded colors
<div style={{ backgroundColor: '#121214' }} className="border border-[#D4AF37]">
```

### Code Organization
- **Component files**: Keep components in `src/components/`
- **Remotion compositions**: Keep in `src/remotion/`
- **WebGPU modules**: Keep in `src/webgpu/`
- **Helper functions**: Define small components at bottom of file (e.g., `StatItem`, `Tag`, `Incident`)
- **Data arrays**: Define at module level, outside components (e.g., `skillGroups`, `navLinks`)

### Performance Patterns
- **Lazy loading**: Use `React.lazy()` for heavy components (Essence, ShowreelGallery)
- **Code splitting**: Automatic via Vite (Three.js, Remotion, Framer Motion chunks)
- **Memoization**:
  - `useMemo` for expensive computations
  - `useCallback` for event handlers passed to children
  - `React.memo` for Remotion phases with 300+ SVG elements
- **Event delegation**: Use single listener with RAF-based updates (see `App.tsx:42-85`)
- **Defer rendering**: Use `useDeferredMount` for heavy components (200ms delay after first paint)

### Remotion-Specific Rules (Critical!)
- **Timeline-based ONLY**: All animations must use `useCurrentFrame()` + `useVideoConfig().fps`
- **NO CSS animations** inside Remotion components - forbidden
- **Springs**: Use `spring()` for natural motion with `{ damping: 200 }` for luxury feel (reserve `{ damping: 12 }` for playful bounce)
- **Interpolation**: Use `interpolate()` for mapped values with `Easing` functions
- **Sequencing**: Use `Sequence` with `premountFor` for timeline sequencing
- **Probe-driven narrative**: Compute master object position via multi-segment `interpolate`, derive component activation from timeline thresholds (not physical distance)
- **SVG flow effects**: Use `strokeDasharray` + animated `strokeDashoffset` (driven by `frame`) for flowing borders
- **Ghost → Activate pattern**: Render containers at low opacity first, raise when narrative focus reaches them
- **Deterministic randomness**: Use `hash(n) = fract(sin(n * 127.1 + 311.7) * 43758.5453)` - NEVER use `Math.random()`
- **CL shorthand**: `{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }` used throughout
- **Watermark**: Every Remotion composition includes brand watermark at `absolute bottom-24 right-32`, opacity 0.18

### WebGPU-Specific Rules
- **WGSL struct alignment**: Always pad to 16-byte boundaries in TypeScript (vec3f = 16 bytes)
- **No duplicate @builtin(position)**: Only in struct, not as function parameter
- **Coordinate system**: Stay in clip space [-1, 1] throughout, don't mix with pixel coordinates
- **Render pass ordering**: First pass uses `loadOp: 'clear'`, subsequent passes use `loadOp: 'load'`
- **Texture sampling**: `rgba8unorm` is filterable, use `sampler: { type: 'filtering' }`
- **Resource cleanup**: Use unified `disposables` array for GPU cleanup

### Testing
- **Test files**: Use `.test.ts` extension (e.g., `WebGPUContext.test.ts`)
- **Test style**: Simple validation - instantiate and check invariants
- **No test framework abstractions**: Direct assertions with throw statements

### File Conventions
- **Components**: PascalCase (e.g., `Navbar.tsx`, `ScrollReveal.tsx`)
- **Utils/Hooks**: camelCase (e.g., `useDeferredMount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `FLOAT_CYCLE`, `WEEKS`)
- **CSS classes**: kebab-case in `index.css` (e.g., `.spotlight-card`, `.gold-gradient-text`)
- **Remotion compositions**: Export as `const`, not default exports

### Import Order
1. External dependencies (react, remotion, lucide-react)
2. Internal components (relative imports)
3. Types (if separate file)

```typescript
import { useState, useEffect } from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { SomeIcon } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import type { MyType } from './types'
```

### Error Handling
- **Type guards**: Use type predicates for runtime type checking
- **Null checks**: Always handle null/undefined cases, especially with DOM elements
- **Event cleanup**: Return cleanup functions from `useEffect`
- **Type assertions**: Avoid `as` when possible - use type guards or proper typing

### Comments & Documentation
- **NO comments in code** - let the code speak for itself
- **Exception**: Complex business logic or non-obvious performance optimizations
- **JSDoc**: Only for public APIs or exported utilities

### Accessibility
- **Reduced motion**: Respect `prefers-reduced-motion` (handled in CSS with media query)
- **Semantic HTML**: Use proper elements (`<nav>`, `<main>`, `<section>`, `<h1>-<h6>`)
- **ARIA labels**: Add for icon-only buttons or non-standard interactive elements
- **Keyboard navigation**: Ensure all interactive elements are keyboard-accessible

### Git Commit Style
- Follow conventional commits format: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`
- Use lowercase, Chinese descriptions: `feat: 添加新的核心项目展示区`
- No mention of AI tools in commit messages (no "Co-Authored-By: Claude Code")

## WebGPU/Three.js Best Practices (Learned from Black Hole Implementation)

### Architecture Principles

**1. Use Established Libraries Over Raw WebGPU**
- ✅ **PREFERRED**: Three.js + TSL (Three Shading Language) for complex graphics
- ❌ **AVOID**: Writing raw WGSL unless absolutely necessary
- **Why**: TSL provides type safety, better debugging, and cross-platform compatibility

**2. Choose the Right Rendering Technique**
- **Raymarching**: Best for physics-accurate effects (black holes, volumetric clouds)
- **Particle Systems**: Good for simple effects, but performance-limited
- **Hybrid**: Combine both for optimal results

**3. Async Initialization Pattern (Critical!)**
```typescript
// ✅ CORRECT - Wait for backend initialization
const isInitializedRef = useRef(false)

const animate = () => {
  if (!isInitializedRef.current) {
    requestAnimationFrame(animate)
    return  // Skip render until ready
  }
  // ... render logic
}

// MUST await init() before starting loop
renderer.init().then(() => {
  isInitializedRef.current = true
  animate()
}).catch(err => {
  console.error('WebGPU init failed:', err)
})
```

**4. Class-Based Architecture for Complex Systems**
```typescript
// ✅ GOOD - Encapsulated simulation
class BlackHoleSimulation {
  constructor(scene, config) {
    this.initializeUniforms(config)
  }

  createBlackHole() { /* ... */ }
  update(deltaTime, camera) { /* ... */ }
  onResize(width, height) { /* ... */ }
}

// ❌ AVOID - Scattered global state
```

### Three.js TSL Shader Best Practices

**1. Functional Shader Construction**
```typescript
// ✅ TSL style - Type-safe, composable
const hash21 = Fn(([p]) => {
  const n = sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453)
  return fract(n)
})

// ❌ Raw WGSL - Error-prone
// fn hash21(p: vec2f) -> f32 {
//   let n = sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453;
//   return fract(n);
// }
```

**2. Use Inverted Sphere for Full-Screen Effects**
```typescript
// Render from inside a sphere (skybox technique)
const geometry = new THREE.SphereGeometry(100, 32, 32)
geometry.scale(-1, 1, 1)  // Invert to render from inside
const material = new THREE.MeshBasicNodeMaterial()
material.colorNode = createRaymarchingShader()
```

**3. Physics-Based Rendering**
- **Blackbody Radiation**: Use color temperature tables for realistic emission
- **Doppler Beaming**: `brightness ∝ (1 / (1 - β·cos(θ)))³`
- **Keplerian Rotation**: `ω ∝ r^(-1.5)` for accretion disks

**4. Performance Optimization**
```typescript
// Limit raymarching steps
Loop(64, () => { /* ... */ })  // 64 steps balance quality/perf

// Use uniform for configurable parameters
const uniforms = {
  stepSize: uniform(0.3),
  raySteps: uniform(64),
  // ...
}
```

### Common Pitfalls to Avoid

**1. WGSL Reserved Keywords**
```wgsl
// ❌ WRONG - 'target' is reserved
struct CameraParams {
  target: vec3f,  // ERROR!
}

// ✅ CORRECT - Use alternative names
struct CameraParams {
  lookAt: vec3f,
}
```

**2. WGSL No Ternary Operator**
```wgsl
// ❌ WRONG
return t > 0.0 ? t : -1.0;

// ✅ CORRECT
if (t > 0.0) {
  return t;
}
return -1.0;
```

**3. Variable Scope Issues**
```wgsl
// ❌ WRONG - 'j' only exists in loop
for (var j = 0u; j < 512u; j++) {
  // ...
}
let vel = particles[j].vel;  // ERROR: j undefined

// ✅ CORRECT - Declare in outer scope
var sampleVel = vec3f(0.0);
for (var j = 0u; j < 512u; j++) {
  sampleVel = particles[j].vel;
}
let vel = sampleVel;  // OK
```

**4. Buffer Alignment (16-byte boundaries)**
```typescript
// ✅ CORRECT - Pad to 16 bytes
const cameraData = new Float32Array([
  ...position, 0,      // vec3 + padding = 16 bytes
  ...target, 0,        // vec3 + padding = 16 bytes
  ...up, 0,            // vec3 + padding = 16 bytes
  fov, aspect, 0, 0,   // 2 floats + padding = 16 bytes
])  // Total: 64 bytes
```

### When to Use Raw WebGPU vs Three.js

**Use Three.js + TSL when:**
- Complex visual effects (black holes, volumetric rendering)
- Need type safety and better debugging
- Cross-platform compatibility matters
- Want to leverage existing ecosystem

**Use Raw WebGPU when:**
- Need absolute control over GPU pipeline
- Implementing custom algorithms (compute-heavy)
- Learning GPU programming concepts
- Building graphics engines/abstractions

### Project Structure for Graphics Features

```
src/
├── components/
│   └── BlackHoleBackground.tsx    # React integration
├── webgpu/
│   └── three-blackhole/
│       ├── blackhole.js            # Main simulation class
│       └── blackhole-shader.js     # TSL shader functions
└── types/
    └── global.d.ts                  # Type declarations
```

### Learning Resources

**For WebGPU/Three.js Graphics:**
- [Three.js WebGPU Examples](https://github.com/mrdoob/three.js/tree/dev/examples/webgpu)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Raymarching Tutorial](https://www.shadertoy.com/view/Xd3GDr)

**Physics-Based Rendering:**
- [Blackbody Radiation](https://en.wikipedia.org/wiki/Black-body_radiation)
- [Gravitational Lensing](https://en.wikipedia.org/wiki/Gravitational_lens)
- [Accretion Disk Physics](https://en.wikipedia.org/wiki/Accretion_disk)

### Key Takeaways from Black Hole Implementation

1. **Don't Reinvent the Wheel**: Use proven libraries (Three.js TSL)
2. **Physics Matters**: Real physics (blackbody, Doppler) looks better than made-up effects
3. **Async Correctness**: Always await WebGPU initialization before rendering
4. **Config-Driven Design**: Make everything adjustable via uniforms
5. **Performance First**: Limit raymarching steps, use LOD where appropriate
6. **Test Incrementally**: Start with simple effects, add complexity gradually

### Learning Resources

- [Three.js WebGPU Examples](https://github.com/mrdoob/three.js/tree/dev/examples/webgpu)
- [WebGPU Samples](https://webgpu.github.io/webgpu-samples/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Raymarching Tutorial](https://www.shadertoy.com/view/Xd3GDr)

**For Physics-Based Rendering:**
- [Blackbody Radiation](https://en.wikipedia.org/wiki/Black-body_radiation)
- [Gravitational Lensing](https://en.wikipedia.org/wiki/Gravitational_lens)
- [Accretion Disk Physics](https://en.wikipedia.org/wiki/Accretion_disk)

### When User Provides Reference Implementation

**STOP and READ before coding:**

1. ✅ Study the README and documentation
2. ✅ Understand the architecture and technical choices
3. ✅ Copy working code directly
4. ✅ Only modify what's necessary (params, imports, styling)
5. ✅ Test and verify functionality

**What NOT to do:**

1. ❌ Start coding immediately without research
2. ❌ Rewrite core logic from scratch
3. ❌ Assume you know better than the reference
4. ❌ Ignore proven patterns and best practices

**Example - Black Hole Case Study:**
- Research: Three.js + TSL chosen over raw WGSL (type safety, debugging)
- Architecture: Class-based with config-driven design
- Port: Copied `blackhole.js` and `blackhole-shader.js` directly
- Adapt: Only changed import paths and color scheme
- Result: Working in 1.2h vs 3.5h (63% time saved, 90% less frustration)
