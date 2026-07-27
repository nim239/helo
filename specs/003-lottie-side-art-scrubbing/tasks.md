# Tasks: Lottie 2D Motion Side Art Integration

**Input**: Design documents from `/specs/003-lottie-side-art-scrubbing/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and package dependencies

- [x] T001 Verify and install `lottie-web` and `@types/lottie-web` dependencies in package.json
- [x] T002 [P] Uninstall and remove `zdog` and `@types/zdog` packages completely from package.json
- [x] T003 [P] Verify Lottie JSON files (`Sparkles.json` and `man running.json`) exist in `public/lotie/` directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Verify `useScrollStore.ts` exposes real-time `velocity` for transient speed reading in lib/store/useScrollStore.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Trải nghiệm Nghệ thuật 2D Side Art Mượt mà (Priority: P1) 🎯 MVP

**Goal**: Hiển thị 2 cụm hoạt hình 2D Side Art bên trái và bên phải bằng Canvas 2D (`lottie-web`), loại bỏ hoàn toàn hệ thống Zdog 3D cũ, cấm render SVG.

**Independent Test**: Mở DevTools (F12) -> Elements, xác nhận tồn tại 2 thẻ `<canvas>` bên trong Left/Right wrappers tại ParallaxSides.tsx và không có thẻ `<svg>` hay DOM paths.

### Implementation for User Story 1

- [x] T005 [US1] Remove all `zdog` imports, Zdog 3D illustration logic, and shape primitives completely from components/ParallaxSides.tsx
- [x] T006 [US1] Initialize Left and Right `lottie-web` instances with `renderer: 'canvas'`, `loop: true`, and `autoplay: true`, loading `Sparkles.json` (back layer) and `man running.json` (front layer) duplicated on both left and right sides in components/ParallaxSides.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (2D vector animations visible on Canvas).

---

## Phase 4: User Story 2 - Tương tác Động năng theo Nhịp Cuộn (Priority: P1)

**Goal**: Đồng bộ gia tốc cuộn `velocity` vào tốc độ phát của hoạt hình Lottie (`setSpeed(speed)`), giữ nguyên tỷ lệ hình học gốc của tác phẩm (Speed Acceleration Only - cấm biến dạng hình học).

**Independent Test**: Cuộn trang nhanh và chậm, quan sát tốc độ chạy của Lottie animation tăng vọt (từ 1x lên tới 3x) khi cuộn nhanh và nhẹ nhàng trở về 1x khi đứng yên, không bị co giãn hay méo mó hình vẽ.

### Implementation for User Story 2

- [x] T007 [US2] Hook Lottie speed modulator directly into `gsap.ticker.add()` reading `useScrollStore.getState().velocity` to call `setSpeed(speed)` on all 4 Lottie instances (left back, left front, right back, right front) in components/ParallaxSides.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (2D animations play on Canvas and accelerate dynamically with scroll velocity).

---

## Phase 5: User Story 3 - Bảo vệ Bộ nhớ & Độ phân giải Retina (Priority: P2)

**Goal**: Chống răng cưa trên màn hình Retina (`devicePixelRatio`) bằng CSS responsive container và hủy hoàn toàn context Canvas khi unmount (`destroy()`).

**Independent Test**: Kiểm tra độ sắc nét trên màn hình Retina (DPR 2-3) và đo Heap Snapshot sau 50 lần cuộn trang xác nhận không rò rỉ bộ nhớ.

### Implementation for User Story 3

- [x] T008 [US3] Configure Canvas DPR scaling with `window.devicePixelRatio` and responsive container styles in components/ParallaxSides.tsx
- [x] T009 [US3] Add cleanup handler calling `destroy()` on all 4 Lottie instances when unmounting in components/ParallaxSides.tsx

**Checkpoint**: All user stories should now be independently functional, Retina-optimized, and memory-safe.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation across all user stories

- [x] T010 Run end-to-end visual, FPS, and memory validation following scenarios in specs/003-lottie-side-art-scrubbing/quickstart.md
- [x] T011 Update Dev Journal in README.md with completion status of Lottie Side Art Integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (T001, T002, T003 in parallel)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Lottie Canvas 2D) -> US2 (Velocity Speed Booster) -> US3 (Retina & Memory Cleanup)
- **Polish (Phase 6)**: Depends on all user stories being complete
