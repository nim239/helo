# Implementation Plan: Integrate Figma Make AI Section Layouts & Decorations

**Branch**: `005-integrate-figma-sections` | **Date**: 2026-08-05 | **Spec**: [specs/005-integrate-figma-sections/spec.md](spec.md)

**Input**: Feature specification from `specs/005-integrate-figma-sections/spec.md`

## Summary

Port and integrate all section decorations, typography hierarchies, card components, CSS 3D Glass Cubes, marquee tracks, and the interactive Contact page from temporary design folders (`layout_figmamakeAI`, `contact`) into the core `helo` Next.js application. Add kinetic scroll-velocity typography weight distortion across all section headlines and update brand naming to **"NimVFX"** (with bold gradient accent on "VFX"). Upon successful code integration, clean up and delete the temporary design directories (`layout_figmamakeAI` and `contact`).

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15 App Router

**Primary Dependencies**: Tailwind CSS 4, GSAP 3, Lenis Scroll, Zustand (state management), Lottie-web

**Storage**: Local JSON configuration (`data/sections.json`)

**Testing**: Manual visual verification & Lenis scroll-velocity integration test

**Target Platform**: Desktop & Mobile Browsers (Chrome, Safari, Firefox, Edge)

**Project Type**: Next.js Exhibition Portfolio Web Application

**Performance Goals**: Stable **60+ FPS** animation performance during scroll and cursor interaction

**Constraints**: Zero external 3D engine overhead (pure CSS 3D transforms for GlassCube); zero layout shift; seamless integration with Lenis scroll lock & Kinetic Strings canvas

**Scale/Scope**: 6 exhibition sections + global HUD & background overlays

## Constitution Check

*GATE: Passed. Architecture adheres strictly to Next.js 15 client-component boundaries and Zustand store state management without mutating DOM state directly.*

## Project Structure

### Documentation (this feature)

```text
specs/005-integrate-figma-sections/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # UI Component interface definitions
```

### Source Code (repository root)

```text
helo/
├── app/
│   ├── globals.css              # Typography & CSS keyframe animations (waveAnim, rotateSlow, etc.)
│   ├── layout.tsx               # Root layout (KineticStringsCanvas background)
│   └── page.tsx                 # Main Exhibition view
├── components/
│   ├── NeonCard.tsx             # [NEW] CGI placeholder card with noise & chromatic aberration
│   ├── MagneticButton.tsx       # [NEW] Round magnetic contact button with cursor tracking
│   ├── ContactParticleCanvas.tsx # [NEW] 60-particle proximity line canvas
│   ├── Section.tsx              # Updated section container with velocity typography hook
│   ├── HorizontalMarquee.tsx    # Updated marquee track with rich NeonCards
│   ├── SpriteAnimation.tsx      # 3D Cubi character sprite animation engine
│   ├── KineticStringsCanvas.tsx # Laser strings background
│   └── HackerMode.tsx           # Dev HUD overlay
├── data/
│   └── sections.json            # Section definitions with updated NimVFX text & bento items
└── lib/
    ├── hooks/
    │   └── useKineticTypography.ts # [NEW] Scroll velocity typography distortion hook
    └── store/
        └── useScrollStore.ts    # Velocity state provider
```

---

## Post-Implementation Cleanup Task
- **Action**: Permanently delete temporary design folders `layout_figmamakeAI` and `contact` once integration and validation complete.
