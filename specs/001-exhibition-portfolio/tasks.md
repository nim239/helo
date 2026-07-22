# Tasks: Exhibition Portfolio & Scroll Engine

**Input**: Design documents from `/specs/001-exhibition-portfolio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install `zustand` dependency in `d:\web_portfolio\package.json`
- [x] T002 [P] Create mock exhibition data matching Data Model in `d:\web_portfolio\data\sections.json`
- [x] T003 [P] Add CSS variable `--section-height` base and scale prevention in `d:\web_portfolio\app\globals.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Scroll Phase & Teleport Store in `d:\web_portfolio\lib\store\useScrollStore.ts`
- [x] T005 [P] Create Marquee Base Timestamp Store in `d:\web_portfolio\lib\store\useMarqueeStore.ts`
- [x] T006 Create CSS Variable Viewport Sync Hook in `d:\web_portfolio\lib\hooks\useViewportSync.ts`
- [x] T007 Refactor base Section wrapper (CSS var height, Clone Aria-hidden) in `d:\web_portfolio\components\Section.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Seamless Exhibition Loop & Velocity Preservation (Priority: P1) 🎯 MVP

**Goal**: Lenis setup, GSAP ticker sync, Teleport Math, and Clone Rendering.

**Independent Test**: Scroll aggressively to cross clone boundaries and verify velocity preservation without snapping.

### Implementation for User Story 1

- [x] T008 [US1] Create core Physics & State Machine Hook in `d:\web_portfolio\lib\hooks\useExhibitionScroll.ts`
- [x] T009 [US1] Extract GSAP Sprite Logic into isolated component `d:\web_portfolio\components\SpriteAnimation.tsx`
- [x] T010 [US1] Refactor Main Controller to mount 12 sections (3 clones + 6 main + 3 clones) in `d:\web_portfolio\app\page.tsx`
- [x] T011 [US1] Integrate `useExhibitionScroll` and `useViewportSync` into `d:\web_portfolio\app\page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional (infinite scrolling works).

---

## Phase 4: User Story 2 - Unified Dwell-to-Play Marquee Rule (Priority: P2)

**Goal**: Horizontal infinite marquee with RAF Modulo Math and Dwell-to-Play trigger.

**Independent Test**: Scroll to a Marquee section, wait 400ms without touching the screen, verify marquee stops. Resume scroll, verify marquee resumes.

### Implementation for User Story 2

- [x] T012 [P] [US2] Create Modulo-safe Marquee Track Component in `d:\web_portfolio\components\HorizontalMarquee.tsx`
- [x] T013 [US2] Update Physics Hook to trigger DWELLING state when velocity ~0 outside cooldown in `d:\web_portfolio\lib\hooks\useExhibitionScroll.ts`
- [x] T014 [US2] Integrate `HorizontalMarquee` rendering based on JSON layout into `d:\web_portfolio\app\page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Marquee VRAM Optimization (Rule of 3) (Priority: P3)

**Goal**: Native `<video>` rendering with Vertical-First IO, strict Rule of 3, and Safari VRAM flush (`.load()`).

**Independent Test**: Scroll through marquee on Safari/Mobile, verify Max 3 active decoders and memory flushes.

### Implementation for User Story 3

- [x] T015 [US3] Create Media Video component with IntersectionObserver Rule of 3 logic in `d:\web_portfolio\components\MediaVideo.tsx`
- [x] T016 [US3] Implement Deep VRAM flush (`removeAttribute('src')` + `.load()`) in unmount lifecycle of `d:\web_portfolio\components\MediaVideo.tsx`
- [x] T017 [US3] Wrap `.play()` in try/catch and sync with DWELLING state in `d:\web_portfolio\components\MediaVideo.tsx`
- [x] T018 [US3] Mount `MediaVideo` items inside the `HorizontalMarquee` component.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T019 Update `d:\web_portfolio\app\layout.tsx` to enforce Mobile App strict scale (`maximum-scale=1, user-scalable=no`).
- [ ] T020 Run quickstart.md validation scenarios to verify Deadlock bypass and layout shifts.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: 
  - US1 (P1): Depends on Foundational.
  - US2 (P2): Depends on US1 (requires Lenis scroll setup to trigger DWELLING).
  - US3 (P3): Depends on US2 (requires HorizontalMarquee to mount inside).

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (US1).
3. **STOP and VALIDATE**: Verify infinite vertical loop teleportation.
4. Continue incrementally to Marquee (US2) and Video IO (US3).
