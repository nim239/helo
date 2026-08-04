# Tasks: Kinetic Neon Strings & Relative Particles Engine

**Input**: Design documents from `specs/004-kinetic-neon-strings/`  
**Prerequisites**: [spec.md](file:///e:/web_2026/helo/specs/004-kinetic-neon-strings/spec.md), [plan.md](file:///e:/web_2026/helo/specs/004-kinetic-neon-strings/plan.md), [research.md](file:///e:/web_2026/helo/specs/004-kinetic-neon-strings/research.md), [quickstart.md](file:///e:/web_2026/helo/specs/004-kinetic-neon-strings/quickstart.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic component scaffolding

- [x] T001 [P] Verify Zustand scroll store interface in `lib/store/useScrollStore.ts` for `velocity` accessibility
- [x] T002 [P] Create initial component scaffold `components/KineticStringsCanvas.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Canvas 2D container setup and GSAP ticker subscription framework

- [x] T003 Create Fixed Viewport Canvas 2D container with CSS fixed positioning in `components/KineticStringsCanvas.tsx`
- [x] T004 Implement `ResizeObserver` and responsive `Base_X` anchoring (`4vw` Mobile / `8vw` Desktop) in `components/KineticStringsCanvas.tsx`
- [x] T005 Wire `gsap.ticker.add()` animation loop to read transient velocity without React re-renders in `components/KineticStringsCanvas.tsx`

---

## Phase 3: User Story 1 - IDLE State Sine Wave & 3D Layering (Priority: P1) 🎯 MVP

**Goal**: Render 2 clusters of 5 Sine wave LED strings with 3D depth lighting and shadow when scroll velocity is zero.

**Independent Test**: Keep browser idle for 2s, verify 5 wavering sine lines with 3-layer glow and shadow offset +30px on both sides.

- [x] T006 [P] [US1] Implement Sine wave math formula $x = \text{Base\_X} + \sin(y \cdot \text{freq} + \text{time} + \text{phaseOffset}) \cdot \text{amplitude}$ in `components/KineticStringsCanvas.tsx`
- [x] T007 [US1] Implement 3-layer rendering: Core 1px, Spread 4px (50% opacity), Aura 12px (`screen` blend mode, 15% opacity) in `components/KineticStringsCanvas.tsx`
- [x] T008 [US1] Implement 3D dark shadow vector (+30px X-offset, `rgba(0,0,0,0.6)`) in `components/KineticStringsCanvas.tsx`

---

## Phase 4: User Story 2 - Tension Stretch & Relative Particles Acceleration (Priority: P1)

**Goal**: Snap strings into razor-sharp 1px lines when scrolling, and launch relative speed particles in opposite scroll direction.

**Independent Test**: Scroll fast down/up. Verify strings instantly flatten, glow turns off, and particles shoot in opposite vector direction.

- [x] T009 [P] [US2] Implement Lerp amplitude collapse to 0 and glow fade-out when $|velocity| > 0.1$ in `components/KineticStringsCanvas.tsx`
- [x] T010 [P] [US2] Setup Object Pool array `particlesArray[10]` (max 5 dots/cluster) for GC-free memory management in `components/KineticStringsCanvas.tsx`
- [x] T011 [US2] Implement particle speed vector $\text{Dot\_Speed} = \text{Base\_Speed} - (\text{Velocity} \times M\_Multiplier)$ ensuring reverse direction movement in `components/KineticStringsCanvas.tsx`

---

## Phase 5: User Story 3 - Full Particle Lifespan Guarantee (Priority: P2)

**Goal**: Preserve particle travel journey until off-screen bounds ($Y < 0$ or $Y > 100\text{vh}$) even when user stops scrolling abruptly.

**Independent Test**: Scroll rapidly then stop instantly. Verify active particles smoothly glide off screen before recycling.

- [x] T012 [US3] Implement particle lifespan protection logic ($Y$ bounds check before resetting object pool status) in `components/KineticStringsCanvas.tsx`

---

## Phase 6: Polish & Global Integration

**Purpose**: Global layout integration and production build validation

- [x] T013 Mount `<KineticStringsCanvas />` in global `app/layout.tsx` outside Lenis container
- [x] T014 Execute quickstart manual validation scenarios in `specs/004-kinetic-neon-strings/quickstart.md`
- [x] T015 Run `npm run build` to verify zero TypeScript or bundling errors

---

## Dependencies & Execution Order

1. **Setup (Phase 1)** $\rightarrow$ **Foundational (Phase 2)**
2. **User Story 1 (Phase 3)** $\rightarrow$ **User Story 2 (Phase 4)** $\rightarrow$ **User Story 3 (Phase 5)**
3. **Polish (Phase 6)** (Mount in `app/layout.tsx` & Build check)
