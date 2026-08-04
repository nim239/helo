# Implementation Plan: Kinetic Neon Strings & Relative Particles Engine

**Feature**: `004-kinetic-neon-strings`  
**Spec Path**: [spec.md](file:///e:/web_2026/helo/specs/004-kinetic-neon-strings/spec.md)  
**Target FPS**: 120-165 FPS (Canvas 2D direct rendering connected to GSAP Ticker / Lenis velocity)

## Technical Context

- **Framework**: Next.js (App Router) + React 18 / TypeScript
- **State Management**: Zustand transient state (`useScrollStore.ts` storing `velocity`, `scrollProgress`)
- **Rendering Tech**: HTML5 Canvas 2D with `requestAnimationFrame` / GSAP Ticker loop
- **CSS Architecture**: `position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 10;`
- **Responsive Base_X Anchoring**: `4vw` margin on Mobile (`<768px`) and `8vw` margin on Desktop (`>=768px`)

## Constitution Check

- [x] **Continuous Linear Layout**: Canvas 2D fixed to viewport layer, no opacity fade transitions, no section clutter.
- [x] **Physical Momentum & Easy In/Out**: Strings Lerp smoothly from Sine wave oscillation to 1px tension line based on `Math.abs(velocity)`.
- [x] **Performance (60-165 FPS)**: Native Canvas 2D direct context drawing inside ticker loop. Zero React state updates during scroll.
- [x] **Accessibility**: Respects `prefers-reduced-motion` (freezes particle spawn and reduces wave amplitude).

## Proposed Changes

### Component Layer: Side Art Engine

#### [NEW] [KineticStringsCanvas.tsx](file:///e:/web_2026/helo/components/KineticStringsCanvas.tsx)
- React client component mounting `<canvas>` with `position: fixed; inset: 0; pointer-events: none; z-index: 10;`.
- Subscribes to GSAP Ticker / RAF loop to read `useScrollStore.getState().velocity`.
- **Sine Wave Logic**: Renders 2 clusters (Left & Right), each 5 vertical sine lines.
  - IDLE ($|velocity| \le 0.1$): 3-layer rendering (Core 1px, Spread 4px 50% opacity, Aura 12px `screen` 15% opacity, Shadow +30px X offset).
  - TENSION ($|velocity| > 0.1$): Lerp amplitude to 0, collapse into crisp 1px white lines, fade glow opacity to 0.
- **Particle System**:
  - Max 5 dots per cluster.
  - Speed formula: $\text{Dot\_Speed} = \text{Base\_Speed} - (\text{Velocity} \times M\_Multiplier)$.
  - Vector Reversal: Dots fly upwards when scrolling down, downwards when scrolling up.
  - Life-cycle protection: Dots continue traveling until $Y < 0$ or $Y > 100\text{vh}$.
- **ResizeObserver**: Automatically recalculates canvas dimensions and `Base_X` anchoring (`4vw` mobile / `8vw` desktop).

#### [MODIFY] [app/layout.tsx](file:///e:/web_2026/helo/app/layout.tsx)
- Mount `<KineticStringsCanvas />` globally at root level, outside Lenis smooth scroll wrapper.

---

## Design Artifacts

### Phase 0: Research & Mathematical Model (`research.md`)
- **Decision 1**: Integrated Canvas 2D render loop vs GSAP Ticker subscription.
  - *Rationale*: Subscribing directly to `gsap.ticker` or dedicated RAF ensures frame sync with Lenis physics engine without React Virtual DOM overhead.
- **Decision 2**: Particle lifecycle state representation.
  - *Rationale*: Flat TypedArray / Object pools to minimize Garbage Collection (GC) pauses at 165Hz.

### Phase 1: Data Model & Contracts
- **Data Model**: `KineticParticle` interface `{ y: number, speed: number, cluster: 'left' | 'right', opacity: number }` and `SineLineConfig` interface `{ phaseOffset: number, amplitude: number, frequency: number }`.
- **Quickstart Guide**: `quickstart.md` defining manual verification steps for IDLE wave, Tension collapse, and Particle speed reversal.

---

## Verification Plan

### Automated Tests
- Build verification: `npm run build` to ensure zero TypeScript or bundling errors.

### Manual Verification
1. **IDLE Sine Wave**: Open page, do not scroll for 2s. Verify 5 layered sine waves gently waver with 3D glow & shadow on both screen sides.
2. **Tension Stretch**: Scroll rapidly. Verify strings instantaneously snap into straight 1px white lines and glows dim out.
3. **Particle Vector Reversal**: Scroll DOWN $\rightarrow$ Particles shoot UPWARDS. Scroll UP $\rightarrow$ Particles shoot DOWNWARDS.
4. **Particle Lifespan**: Scroll fast then stop instantly $\rightarrow$ Particles glide smoothly until exiting screen boundary before unmounting.
5. **Responsive Anchoring**: Test at 390px (Mobile) and 1920px (Desktop) Viewports. Verify strings anchor at `4vw` and `8vw` respectively.
