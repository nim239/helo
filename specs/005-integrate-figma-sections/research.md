# Phase 0 Research: Integrate Figma Make AI Section Layouts & Decorations

## 1. Velocity-Based Kinetic Typography Stretch

### Decision
Implement a React custom hook `useKineticTypography` (or inline CSS variable binding) connected to `useScrollStore.getState().velocity`. 

### Rationale
Lenis updates `velocity` on every animation frame. By mapping `Math.abs(velocity)` to CSS custom property `--velocity-stretch` or dynamic inline transform `scaleX(1 + Math.min(absVel * 0.05, 0.4))` and `font-weight: calc(700 + absVel * 200)`, typography expands smoothly during rapid scrolling and snaps back gently when scroll stops (`lerp` decay).

### Alternatives Considered
- *GSAP ScrollTrigger text skewing*: Adds unnecessary trigger overhead when Lenis already computes global velocity.
- *Canvas-rendered text*: Breaks accessibility and SEO text indexing.

---

## 2. Zero-Overhead 3D Glass Cube (`GlassCube.tsx`)

### Decision
Port the CSS 3D `GlassCube` component directly from `layout_figmamakeAI/src/App.tsx` using native CSS `transform-style: preserve-3d` and keyframe CSS animations (`rotateSlow`).

### Rationale
Runs at native 60+ FPS on GPU compositor without importing Three.js, React Three Fiber, or heavy WebGL bundles (~0KB bundle footprint).

---

## 3. Contact Section Architecture (`ContactPage.tsx` → `Section.tsx` / `ContactSection.tsx`)

### Decision
Extract `MagneticButton`, `ParticleField`, mouse follow-glow, stroked "NIM" letterform, and top/bottom HUD bars into subcomponents inside `components/contact/`.

### Rationale
Keeps components modular and clean. Reuses the existing `CustomCursor` and `BackgroundGrid` when mounted in the single-page exhibition layout.

---

## 4. Post-Merge Directory Cleanup

### Decision
Add a designated step in task execution to execute `rm -rf layout_figmamakeAI contact` (or PowerShell `Remove-Item -Recurse -Force`) upon completing verification.

### Rationale
Ensures project directory remains lean, un-cluttered, and free of redundant prototype folders.
