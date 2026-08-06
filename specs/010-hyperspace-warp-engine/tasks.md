# Tasks: Hyperspace Warp Engine

**Feature**: `010-hyperspace-warp-engine`
**Generated**: 2026-08-06
**Total Tasks**: 24

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3+US4) → Phase 6 (Polish)
US2 depends on US1 (WARPING state must exist)
US3 + US4 can run in parallel after US1 foundation
```

## Phase 1: Setup

- [x] T001 Verify dev server `npm run dev` running and baseline FPS noted in `specs/010-hyperspace-warp-engine/research.md` benchmark section
- [x] T002 Inspect DOM in browser DevTools: confirm z-index stack of fixed elements, identify any element blocking `#fps-tap-zone` on mobile view

## Phase 2: Foundation — Zustand Store & Scroll Hook

- [x] T003 Extend `ScrollPhase` type in `lib/store/useScrollStore.ts` — add `'WARPING'` to union type
- [x] T004 Add `warpPool: number` state and `setWarpPool: (v: number) => void` action to `lib/store/useScrollStore.ts`
- [x] T005 Add `warpPoolRef = useRef<number>(0)` and Friction Accumulator constants (`WARP_GAIN=0.04`, `WARP_FRICTION=0.96`, `WARP_THRESHOLD=0.85`) in `lib/hooks/useExhibitionScroll.ts`
- [x] T006 Integrate warpPool update loop into existing GSAP ticker in `lib/hooks/useExhibitionScroll.ts` — increment from `Math.abs(velocity)`, multiply by friction, clamp 0-1 each frame
- [x] T007 Add WARPING phase transition logic in `lib/hooks/useExhibitionScroll.ts` — trigger `setPhase('WARPING')` when warpPool >= 0.85; exit to IDLE when warpPool < 0.01 and phase === WARPING
- [x] T008 Add visibility reset in `lib/hooks/useExhibitionScroll.ts` — on `visibilitychange` hidden: warpPoolRef.current = 0, setPhase('IDLE')
- [x] T009 [P] Throttle `setWarpPool()` Zustand sync to ~6fps in `lib/hooks/useExhibitionScroll.ts` (using frame counter % 10) to avoid cursor HUD re-render spam

## Phase 3: US1 — Warp Scene Core (WarpOverlay)

- [x] T010 [US1] Create `components/WarpOverlay.tsx` — canvas element fixed full-screen z-[90], only render when `currentPhase === 'WARPING'`
- [x] T011 [US1] Implement WarpParticle object pool (120 slots) in `components/WarpOverlay.tsx` — spawn at viewport edges, velocity direction = opposite to `lenis.velocity` sign
- [x] T012 [US1] Implement speed-line render loop in `components/WarpOverlay.tsx` — draw streak from `{x,y}` to `{x+vx*length, y+vy*length}`, gradient alpha, LOD formula: `activeCount = floor(smoothedFps/60 * 120)`
- [x] T013 [US1] Add DOM culling logic in `app/page.tsx` — when WARPING: set sections wrapper style to `WARP_CULL_METHOD` (opacity:0 or display:none), restore on exit; add `WARP_CULL_METHOD` flag constant
- [x] T014 [US1] Mount `<WarpOverlay />` in root layout or `app/page.tsx`, ensure it renders above sections but below cursor

## Phase 4: US2 — Cubi Warp Behavior

- [x] T015 [US2] Add `amplitudeMultRef = useRef(1.0)` in `components/SpriteAnimation.tsx` — lerp toward `min(1.0, max(0.12, 1.0 - warpPool * 0.88))` each GSAP frame
- [x] T016 [US2] Modify `getTrajectory()` in `components/SpriteAnimation.tsx` — multiply `moveX` and `moveY` by `amplitudeMultRef.current`; add `driftY = -velocity * WARP_DRIFT_MULT (80)` to returned y position
- [x] T017 [US2] Subscribe to `useScrollStore` `warpPool` in `components/SpriteAnimation.tsx` to drive `amplitudeMultRef` lerp in the existing GSAP ticker (no new ticker)

## Phase 5: US3 + US4 — Cursor HUD & Mobile (Parallelizable)

- [x] T018 [P] [US3] Resize cursor SVG from `w-16 h-16` to `w-20 h-20` in `components/CustomCursor.tsx`, update CIRCUMFERENCE = 2*PI*32 (r=32 for larger ring)
- [x] T019 [P] [US3] Add second SVG `<circle>` (warpCircleRef) in `components/CustomCursor.tsx` — bottom half arc only (rotate 90deg, dasharray = HALF_CIRCUMFERENCE), driven by `warpPool` from Zustand
- [x] T020 [P] [US3] Add dynamic color logic for warp circle in `components/CustomCursor.tsx` — cyan < 30%, orange 30-80%, red+pulse > 80%; add burst GSAP animation on warp trigger
- [x] T021 [P] [US3] Add "WARP" label and percentage text refs in `components/CustomCursor.tsx` — positioned opposite side of FPS tag, updated in renderLoop from Zustand warpPool
- [x] T022 [P] [US4] Fix 5-tap bug in `components/MobileFpsOverlay.tsx` — based on T002 inspection: raise z-index to 210+, ensure `touchAction: 'manipulation'` on `fps-tap-zone`, verify no pointer-events-auto element overlaps
- [x] T023 [P] [US4] Add WARPING auto-show in `components/MobileFpsOverlay.tsx` — subscribe to `currentPhase`; set `autoShownByWarp` ref when WARPING triggers visible; auto-hide 3s after WARPING exits

## Phase 6: Polish & Validation

- [x] T024 Benchmark DOM culling methods: toggle `WARP_CULL_METHOD` between 'opacity' and 'display', measure FPS on i7-7700 in DevTools, update constant to winner in `app/page.tsx`
- [x] T025 Warp enter/exit transition: add 300ms GSAP fade-in for WarpOverlay canvas opacity (0→1 on enter, 1→0 on exit) in `components/WarpOverlay.tsx`
- [x] T026 Verify `prefers-reduced-motion`: if media query matches, skip warp trigger (warpPool never accumulates) in `lib/hooks/useExhibitionScroll.ts`
- [x] T027 Final validation per quickstart.md: all 6 scenarios pass; update `specs/010-hyperspace-warp-engine/research.md` with benchmark results

## Parallel Opportunities

- T018, T019, T020, T021 (cursor HUD changes, same file — do sequentially)
- T022, T023 (mobile fix, same file — do sequentially)
- Phase 5 US3 block and Phase 5 US4 block can start as soon as T007 is done

## Implementation Strategy

**MVP (must ship)**: T001-T014 — Core warp trigger + WarpOverlay canvas + DOM culling = FPS improvement visible

**Sprint 2**: T015-T017 — Cubi amplitude behavior

**Sprint 3**: T018-T023 — Cursor HUD + Mobile fixes

**Polish**: T024-T027


