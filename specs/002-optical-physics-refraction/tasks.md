# Tasks: Optical Physics Refraction Engine

**Input**: Design documents from `/specs/002-optical-physics-refraction/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Install WebGL dependencies (`@react-three/fiber`, `three`) in `package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T002 Update `lib/store/useScrollStore.ts` to calculate and store `scrollVelocity`
- [X] T003 Fix layout and resize bugs in `components/SpriteAnimation.tsx` using percentage-based `backgroundSize` and `backgroundPositionX`, and wider trajectory amplitudes as a robust fallback.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Real-time Background Refraction (Priority: P1) 🎯 MVP

**Goal**: Background elements distort realistically when the glass cube passes over them.

**Independent Test**: Verify optical distortion by placing static text behind the sprite.

### Implementation for User Story 1

- [X] T004 [US1] Create basic WebGL canvas component in `components/RefractionSprite.tsx`
- [X] T005 [US1] Load the 3 texture passes (Beauty, Normal, Alpha) in `components/RefractionSprite.tsx`
- [X] T006 [US1] Implement the Custom ShaderMaterial (Vertex & Fragment shaders) for background distortion in `components/RefractionSprite.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Scroll-based Chromatic Aberration (Priority: P2)

**Goal**: Glass cube shows dynamic chromatic aberration based on scroll velocity.

**Independent Test**: Scroll the page at varying speeds and observe RGB color separation on the glass edges.

### Implementation for User Story 2

- [X] T007 [US2] Update the fragment shader in `components/RefractionSprite.tsx` to include RGB splitting logic based on a `u_aberration` uniform
- [X] T008 [US2] Wire up the `scrollVelocity` from `lib/store/useScrollStore.ts` to the `u_aberration` uniform inside the `useFrame` loop in `components/RefractionSprite.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Synchronized Playback & Performance (Priority: P1)

**Goal**: Animation plays smoothly without visual glitches or device overheating.

**Independent Test**: Verify frame rate stability and ensure textures remain perfectly synchronized.

### Implementation for User Story 3

- [X] T009 [US3] Implement dynamic resize handling (`useThree` or `ResizeObserver`) in `components/RefractionSprite.tsx` to recalculate trajectory bounds
- [X] T010 [US3] Optimize background texture capturing strategy (or fake background layer) in `components/RefractionSprite.tsx` to avoid expensive DOM-to-texture repaints

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T011 Replace `<SpriteAnimation />` with `<RefractionSprite />` in the main layout/app structure
- [X] T012 Run `quickstart.md` validation tests manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Depends on US1 completion (modifies the same shader)
- **User Story 3 (P1)**: Depends on US1 completion

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP Ready
3. Add User Story 2 → Test independently
4. Add User Story 3 → Test independently

---

## Notes

- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
