# Implementation Plan: Optical Physics Refraction Engine

**Branch**: `001-exhibition-portfolio` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-optical-physics-refraction/spec.md`

## Summary

Implement a WebGL-based refraction engine for a 3D glass sprite using React Three Fiber. The engine will combine Beauty, Normal, and Alpha passes to realistically distort DOM elements rendered as background textures. Additionally, the existing resize and trajectory bugs in `SpriteAnimation.tsx` will be fixed to ensure robust responsive layout.

## Technical Context

**Language/Version**: TypeScript

**Primary Dependencies**: React Three Fiber (@react-three/fiber), Three.js, GSAP, Zustand

**Storage**: N/A (Client-side rendering)

**Testing**: Manual Visual Testing

**Target Platform**: Web (Desktop & Mobile with WebGL support)

**Project Type**: Next.js Web App

**Performance Goals**: Stable 60 FPS, < 16ms frame time. Zero frame desync between texture passes.

**Constraints**: Must bypass React Virtual DOM for physics/scroll updates per Constitution.

**Scale/Scope**: 1 Refraction WebGL Canvas replacing the current SpriteAnimation div.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Exhibition Engine First**: Yes. The canvas is a self-contained renderer.
- [x] **Scroll Experience Principles**: Yes. Uses Lenis scroll velocity for chromatic aberration.
- [x] **Performance Principles**: Yes. Updates uniform data directly in `requestAnimationFrame` via `useFrame` or GSAP, bypassing React state.
- [x] **Technology Constraints**: Yes. React Three Fiber is explicitly approved.

## Project Structure

### Documentation (this feature)

```text
specs/002-optical-physics-refraction/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── contracts/           
```

### Source Code (repository root)

```text
components/
├── RefractionSprite.tsx         # New WebGL Canvas component
├── SpriteAnimation.tsx          # To be deprecated or fixed temporarily
lib/
├── store/
│   └── useScrollStore.ts        # Modified to track exact scroll velocity for shader
```

**Structure Decision**: Added new component `RefractionSprite.tsx` under `components/` and modified existing `useScrollStore.ts`.

## Complexity Tracking

N/A
