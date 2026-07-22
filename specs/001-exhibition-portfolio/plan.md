# Implementation Plan: Exhibition Portfolio & Scroll Engine

**Branch**: `001-exhibition-portfolio` | **Date**: 2026-07-22 | **Spec**: [spec.md](file:///d:/web_portfolio/specs/001-exhibition-portfolio/spec.md)

**Input**: Feature specification from `/specs/001-exhibition-portfolio/spec.md`

## Summary

Implement a high-performance, strictly non-interactive "Look but don't touch" exhibition portfolio using Next.js, Lenis native scrolling, Zustand transient state (120fps sync), and horizontal auto-marquees. The engine features complex edge-case handling for VRAM flushing, float precision loss on Safari, and seamless infinite loop cloning.

## Technical Context

**Language/Version**: TypeScript / Next.js 14+ (App Router)

**Primary Dependencies**: `lenis` (Scroll), `gsap` (Animation/Snap), `zustand` (Transient state management), Tailwind CSS

**Storage**: Local Static JSON (`data/sections.json`)

**Testing**: React Testing Library / Jest (Unit testing hooks/math)

**Target Platform**: Web Browsers (Safari, Chrome, Firefox, Edge) - Mobile & Desktop

**Project Type**: Next.js Web Portfolio

**Performance Goals**: 60-120fps physics loop without React re-render storms. Max 3 video decoders active at any time.

**Constraints**: Strict No-Interaction UX, Native `<video>` (.webm) served from Free CDN, Modulo math for layout.

**Scale/Scope**: 12 rendered sections (6 main + 6 clones), 3-10 videos per marquee track.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution is currently a placeholder. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-exhibition-portfolio/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Next.js Application Structure
app/
├── globals.css
├── layout.tsx
└── page.tsx              # Main Exhibition Controller

components/
├── Section.tsx           # Base section container
├── HorizontalMarquee.tsx # RAF auto-scrolling track
├── MediaVideo.tsx        # Vertical-First IO + Rule of 3 video component
└── SpriteAnimation.tsx   # Reusable Intro Sprite component

lib/
├── store/
│   ├── useScrollStore.ts # Transient scroll phase/teleport state
│   └── useMarqueeStore.ts# Shared baseTimestamp for marquees
└── hooks/
    ├── useViewportSync.ts     # ResizeObserver for --section-height
    ├── useExhibitionScroll.ts # Lenis & GSAP ticker sync
    └── useMarqueeSync.ts      # RAF modulo logic for Marquee

data/
└── sections.json         # Static SSG Data Source
```

**Structure Decision**: A standard Next.js App Router layout with a dedicated `lib/` folder for state and hooks to separate complex physics logic from UI components.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Zustand Transient State | React `useState` causes main-thread re-render loops during 60fps scrolling | Native React Context/State would cause the Marquee to jitter and fail performance goals. |
| Modulo DOM Duplication | Seamless infinite horizontal scroll | Single track `translateX` wrapping causes 1-frame visual flash/snap. |
