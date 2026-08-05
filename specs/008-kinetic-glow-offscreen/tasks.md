# Tasks: Kinetic Glow Offscreen Buffer & Bezier Curve Optimization

**Input**: Design documents from `/specs/008-kinetic-glow-offscreen/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- File paths are exact targets in the workspace

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify component entry points and setup scope.

- [X] T001 Verify project structure and touchpoints per plan in [components/KineticStringsCanvas.tsx](file:///d:/web_portfolio/components/KineticStringsCanvas.tsx) and [components/ParallaxSides.tsx](file:///d:/web_portfolio/components/ParallaxSides.tsx)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure prerequisites.

*Note: No foundational blocking tasks required for this feature; user story implementation can begin immediately.*

---

## Phase 3: User Story 1 - Offscreen 0.25x Buffer Canvas Engine (Priority: P1) 🎯 MVP

**Goal**: Render heavy glow stroke effects on a downscaled 0.25x RAM offscreen canvas and blit to main canvas to eliminate rasterization lag.

**Independent Test**: Verify via DevTools Canvas renderer or visual inspection that glow quagmires rendering is smooth at 0.25x scale without frame drops.

### Implementation for User Story 1

- [X] T002 [US1] Initialize and resize 0.25x downscaled Offscreen Buffer Canvas in [components/KineticStringsCanvas.tsx](file:///d:/web_portfolio/components/KineticStringsCanvas.tsx)
- [X] T003 [US1] Direct glow layer drawing to Offscreen Buffer with imageSmoothingEnabled blitting in [components/KineticStringsCanvas.tsx](file:///d:/web_portfolio/components/KineticStringsCanvas.tsx)

**Checkpoint**: User Story 1 (Offscreen Canvas rendering engine) is operational and testable.

---

## Phase 4: User Story 2 - 10px Y-Step & Smooth Bezier Curve Optimization (Priority: P2)

**Goal**: Change wave rendering Y-step from 1px to 10px using `quadraticCurveTo` midpoint control points to reduce 90% vector draw calls.

**Independent Test**: Verify in source and animation that string curves maintain silk-smooth visual fluidity without sharp line segment kinks.

### Implementation for User Story 2

- [X] T004 [US2] Update wave point iteration step to Y += 10px and calculate midpoint Bezier control points in [components/KineticStringsCanvas.tsx](file:///d:/web_portfolio/components/KineticStringsCanvas.tsx)
- [X] T005 [US2] Apply quadratic Bezier curve pathing for both core line and offscreen glow stroke in [components/KineticStringsCanvas.tsx](file:///d:/web_portfolio/components/KineticStringsCanvas.tsx)

**Checkpoint**: User Story 2 is operational and combined with US1 for 165 FPS string physics rendering.

---

## Phase 5: User Story 3 - Deprecate Lottie & Inject CSS Radial Glow Layer (Priority: P3)

**Goal**: Exterminate Lottie asset `public/lotie/gradient_glow.json` and replace with GPU-accelerated CSS `radial-gradient` divs with `will-change: transform`.

**Independent Test**: Confirm zero network requests for `gradient_glow.json` and verify dual Cyan/Magenta side glow divs are rendered in DOM.

### Implementation for User Story 3

- [X] T006 [P] [US3] Remove Lottie animation loader and instance for `gradient_glow.json` in [components/ParallaxSides.tsx](file:///d:/web_portfolio/components/ParallaxSides.tsx)
- [X] T007 [P] [US3] Add GPU hardware-accelerated CSS radial-gradient side glow divs in [components/ParallaxSides.tsx](file:///d:/web_portfolio/components/ParallaxSides.tsx)
- [X] T008 [P] [US3] Remove deprecated asset file [public/lotie/gradient_glow.json](file:///d:/web_portfolio/public/lotie/gradient_glow.json)

**Checkpoint**: All 3 user stories complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Project validation, documentation, and dev journal log.

- [X] T009 Run TypeScript type check and build verification via `npm run build`
- [X] T010 Update root [README.md](file:///d:/web_portfolio/README.md) and Dev Journal section per project directives

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **User Story 1 (P1)**: Depends on Phase 1 setup.
- **User Story 2 (P2)**: Integrates into KineticStringsCanvas alongside US1.
- **User Story 3 (P3)**: Independent component changes in ParallaxSides.tsx.
- **Polish (Phase 6)**: Depends on completion of US1, US2, US3.

---

## Parallel Execution Opportunities

- T006, T007, T008 (US3 in ParallaxSides.tsx and public assets) can be worked on in parallel with T002, T003, T004, T005 (US1 & US2 in KineticStringsCanvas.tsx).
