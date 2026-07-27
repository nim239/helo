# Tasks: Zdog.js x Lenis Scroll Integration

**Input**: Design documents from `/specs/002-zdog-lenis-integration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and package dependencies

- [x] T001 Verify and install `zdog` and `@types/zdog` dependencies in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Verify `useScrollStore.ts` exposes real-time `velocity` and `scrollProgress` for transient physics reading in store/useScrollStore.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Tích hợp Zdog Canvas 2D (Priority: P1) 🎯 MVP

**Goal**: Hiển thị cụm Side Art bằng Zdog.js trên Canvas 2D với các khối nguyên thủy mang phong cách Hard Path / Big Stroke, không dùng WebGL hay SVG.

**Independent Test**: Mở trình duyệt, kiểm tra DOM để đảm bảo tồn tại 2 thẻ `<canvas>` hợp lệ với `dragRotate: false`, hiển thị các hình khối neon sắc nét.

### Implementation for User Story 1

- [x] T003 [US1] Remove static `<img>` tags and create Left/Right `<canvas>` wrappers in components/ParallaxSides.tsx
- [x] T004 [US1] Initialize Left and Right `Zdog.Illustration` instances with `dragRotate: false` and stroke primitives (Polygon, Hemisphere, Box, Cylinder) in components/ParallaxSides.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (static 3D shapes visible on canvas).

---

## Phase 4: User Story 2 - Thao túng Vật lý bằng Lenis Ticker (Priority: P1)

**Goal**: Đồng bộ nhịp cập nhật Zdog vào `gsap.ticker`, ánh xạ gia tốc cuộn (`velocity`) vào góc xoay và tỷ lệ biến dạng (Squash & Stretch).

**Independent Test**: Cuộn trang nhanh và chậm, quan sát tốc độ xoay tăng vọt và khối bị ép giãn chiều dọc, bóp nghẹt chiều ngang.

### Implementation for User Story 2

- [x] T005 [US2] Hook Zdog update loop directly into `gsap.ticker.add()` without spawning additional requestAnimationFrame loops in components/ParallaxSides.tsx
- [x] T006 [US2] Map `useScrollStore.getState().velocity` to Zdog `rotate` and calculate Squash & Stretch `scale` in components/ParallaxSides.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (3D shapes rotate and deform physically when scrolling).

---

## Phase 5: User Story 3 - Tối ưu Hiệu năng Màn hình Retina (Priority: P2)

**Goal**: Chống răng cưa trên màn hình độ phân giải cao (`devicePixelRatio >= 2`) và chống lag khi resize cửa sổ.

**Independent Test**: Soi trên màn hình Retina (Pixel Ratio > 1) và thực hiện resize cửa sổ liên tục.

### Implementation for User Story 3

- [x] T007 [US3] Apply `window.devicePixelRatio` to Zdog canvas rendering for anti-aliasing in components/ParallaxSides.tsx
- [x] T008 [US3] Implement 200ms debounce wrapper around window `resize` event handler in components/ParallaxSides.tsx

**Checkpoint**: All user stories should now be independently functional and optimized for Retina displays.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all user stories

- [x] T009 Run end-to-end visual and FPS validation following scenarios in specs/002-zdog-lenis-integration/quickstart.md
- [x] T010 Update Dev Journal in README.md with completion status of Zdog x Lenis integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Canvas 2D) -> US2 (Lenis Physics) -> US3 (Retina Optimization)
- **Polish (Phase 6)**: Depends on all user stories being complete
