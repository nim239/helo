# Architecture Expansion: Scroll Snap & 2.5D Parallax System

This plan outlines the implementation of the missing requirements provided by the user: Scroll Snapping on rest, and a robust 4-layer 2.5D Parallax engine that accurately supports infinite-loop teleportation.

> [!WARNING]
> The current `ParallaxSides.tsx` uses a simple CSS modulo loop. The new spec strictly requires **DOM cloning** mirroring the 12-section buffer logic, allowing distinct foreground/background layers to move continuously through the teleport portal.

## Proposed Changes

### 1. Scroll Snapping Engine

We will implement a debounce-based scroll snapping engine directly inside the `useExhibitionScroll` hook to safely co-exist with the teleport loop.

#### [MODIFY] [useExhibitionScroll.ts](file:///d:/web_portfolio/lib/hooks/useExhibitionScroll.ts)
- Bind to `lenis.on('scroll')`.
- Maintain a `debounceTimeout`. If the user stops scrolling for 250ms (and `teleportCooldown` is inactive), trigger the snap logic.
- **Math**: `Math.round(scrollY / sectionHeight) * sectionHeight`.
- Execute `lenis.scrollTo(target, { duration: 1.2, lock: true })`.

### 2. 2.5D Cloned Parallax System

We will replace the current CSS-background-based parallax sides with a true DOM-cloned 4-layer parallax engine.

#### [MODIFY] [ParallaxSides.tsx](file:///d:/web_portfolio/components/ParallaxSides.tsx)
- Render 4 distinct containers: `LeftForeground`, `LeftBackground`, `RightForeground`, `RightBackground`.
- Inside each container, map over an array of 12 placeholders (representing the 12 sections: 3 clones + 6 real + 3 clones) to guarantee DOM continuity.
- **GSAP ScrollTrigger**: 
  - Foreground layers translate at `speed = 1.2`.
  - Background layers translate at `speed = 0.8`.
- **Teleport Protection**: When `useExhibitionScroll` executes a teleport of `6 * window.innerHeight` for the main wrapper, the parallax layers will simultaneously teleport by `6 * window.innerHeight * speed` to remain perfectly aligned.

### 3. Sprite Intro Math Hardening

#### [MODIFY] [SpriteAnimation.tsx](file:///d:/web_portfolio/components/SpriteAnimation.tsx)
- Extract the mathematical constants into a `START_POINT_SPRITE` variable to strictly align with the user's nomenclature.
- Verify the 6-section modulo loop perfectly aligns with the new Snapping mechanics.

## User Review Required

> [!IMPORTANT]
> **Parallax Clones**: Should the Parallax sections correspond 1:1 with the main content sections (e.g. using `exhibitionBuffer` data to render specific art per section), or are they just generic scrolling patterns? The current plan builds the infrastructure for 12 cloned DOM nodes, which you can inject art into later.

Please approve this implementation plan so I can begin coding the Snap Engine and the 4-Layer Parallax!
