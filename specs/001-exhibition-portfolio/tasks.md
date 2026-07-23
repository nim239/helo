# Implementation Tasks: Exhibition Portfolio

## Phase 1: MVP Core Physics Scaffolding (Completed)
- [x] T001 [P] [US1] Setup Buffer Layout 12 Section structure in `app/page.tsx`
- [x] T002 [US1] Implement Lenis Scroll Engine and Teleport Math in `lib/hooks/useExhibitionScroll.ts`
- [x] T003 [US1] Implement Forward-Only Scroll Snap using GSAP in `lib/hooks/useExhibitionScroll.ts`
- [x] T004 [US2] Implement Parallax 2.5D 4-Layer system in `components/ParallaxSides.tsx`
- [x] T005 [US3] Implement Sprite Animation 120-frame loop in `components/SpriteAnimation.tsx`
- [x] T006 [US1] Fix Mobile Touch Freeze using `syncTouch` and GSAP in `lib/hooks/useExhibitionScroll.ts`
- [x] T007 [US4] Implement Media Video component with VRAM flushing in `components/MediaVideo.tsx`

## Phase 2: "WOW" Immersion Features (Completed)
- [x] T008 [US5] Implement Gateway Overlay for Web Audio / Gyro permission in `components/EnterOverlay.tsx`
- [x] T009 [P] [US5] Implement Dynamic Audio Reactive Canvas in `components/AudioController.tsx`
- [x] T010 [P] [US6] Implement Custom WebGL Cursor (DOM + GSAP) in `components/CustomCursor.tsx`
- [x] T011 [US7] Implement 2.5D Gyroscope Depth Motion in `components/ParallaxSides.tsx`
- [x] T012 [P] [US8] Implement DevTools Hacker Mode in `components/HackerMode.tsx`

## Phase 3: Curtains Deep Link & Spatial Polish (Pending)
- [x] T013 [P] [US9] Implement Seamless Hash Deep Linking and hash routing state in `app/page.tsx`
- [x] T014 [US9] Implement Curtains Split-Screen Transition (5.0s `power4.inOut`) in `components/CurtainsTransition.tsx`
- [x] T015 [US9] Update `SpriteAnimation.tsx` to ensure Sprite Intro plays in front of the Curtains effect.
- [x] T016 [US10] Integrate 3D Spatial Asset (Chromatic Dispersion Cubi WebM) into `components/Section.tsx`.
- [x] T017 [US10] Update video URLs in `data/sections.json` to use Production CDN URLs.
