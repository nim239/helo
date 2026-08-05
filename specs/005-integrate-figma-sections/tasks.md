# Tasks: Integrate Figma Make AI Section Layouts & Decorations

**Feature**: Integrate Figma Make AI Section Layouts & Decorations (`005-integrate-figma-sections`)
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Phase 1: Setup & Foundational Utilities

- [x] T001 Create `useKineticTypography` hook in `lib/hooks/useKineticTypography.ts` to compute dynamic font weight expansion and scaleX distortion based on scroll velocity from `useScrollStore`.

---

## Phase 2: Core Visual Components (Standalone UI)

- [x] T002 Create `NeonCard` component in `components/NeonCard.tsx` featuring SVG noise filter, chromatic aberration lines, scanlines, glow orbs, and corner brackets.
- [x] T003 [P] Create `MagneticButton` component in `components/contact/MagneticButton.tsx` featuring spring cursor tracking, glowing outer ring, and rotating inner rings.
- [x] T004 [P] Create `ParticleField` component in `components/contact/ParticleField.tsx` rendering a 60-particle canvas proximity line connection field.

---

## Phase 3: User Story 1 - Intro Section & Kinetic NimVFX Headline (US1)

- [x] T005 [US1] Update `data/sections.json` to change Intro title to "NimVFX", with metadata subtitle tags.
- [x] T006 [US1] Update Section 1 in `app/page.tsx` to render "NimVFX" headline with bold gradient on "VFX" (`#00F2FF` → `#FF007F` → `#0066FF`) and apply `useKineticTypography` velocity distortion.

---

## Phase 4: User Story 2 - Cinematic Reel & CGI Bento Grid (US2)

- [x] T007 [US2] Update Section 2 ("Director's Reel") in `app/page.tsx` with 16:9 cinematic frame, chromatic aberration, scanlines, play icon, and bottom metadata row ("DURATION: 03:42 | FORMAT: 4K UHD | CODEC: H.265").
- [x] T008 [US2] Update Section 3 ("CGI Showcase") in `app/page.tsx` to render 5-item asymmetric bento grid layout with `NeonCard` items and rotational transforms (-0.5deg to 0.3deg).

---

## Phase 5: User Story 3 - Marquees with Rich NeonCards (US3)

- [x] T009 [US3] Update `components/HorizontalMarquee.tsx` and `data/sections.json` to render rich `NeonCard` items with client badges (Nike x NimVFX, Netflix, Coachella, Apple, Samsung, Adidas) and apply `useKineticTypography` velocity distortion to Section 4 & 5 headings.

---

## Phase 6: User Story 4 - Contact Section Integration (US4)

- [x] T010 [US4] Update Section 6 in `app/page.tsx` to render the full Contact UI (`MagneticButton`, `ParticleField`, mouse follow-glow, stroked "NIM" letterform, top/bottom HUD bars with GMT+7 live clock).

---

## Phase 7: Polish & Post-Merge Cleanup

- [x] T011 Verify 60+ FPS performance, zero layout shift, and Lenis scroll snapping.
- [x] T012 Cleaned up temporary design folders and updated `tsconfig.json`.
