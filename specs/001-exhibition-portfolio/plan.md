# Architecture Plan: Roadmap Phase 2 "WOW" Features

This plan outlines the architecture and implementation details for the 5 Phase 2 Roadmap features defined in `spec.md`, fully incorporating the 5 clarifications resolved during `/speckit-clarify`.

## 1. Technical Context

- **Feature 1: Dynamic Audio Reactive Canvas**
  - Web Audio API `AudioContext` with synthesizers (0KB asset overhead).
  - Oscillators & Gain/Filter nodes dynamically controlled by `lenis.velocity` in RAF loop.
  - Initialized on user interaction via `EnterOverlay`.

- **Feature 2: Custom Inertia WebGL Cursor**
  - Powered by `ogl` (~15KB gzipped) for high-performance WebGL liquid distortion shader.
  - RAF position tracking with magnet effect targeting `.media-video-container`.

- **Feature 3: 2.5D Gyroscope Depth Motion**
  - Listen to `DeviceOrientationEvent` (with iOS 13+ permission request in `EnterOverlay`).
  - Silent fallback to Touch Scroll Parallax if permission is denied.

- **Feature 4: DevTools "Hacker Mode" Easter Egg**
  - Auto-prints ASCII Art logo and real-time Teleport Math, VRAM flush counts, and FPS metrics on F12 DevTools console open.

- **Feature 5: Seamless Hash Deep Linking With Curtains Transition**
  - Detect `window.location.hash` on mount.
  - Play 120-frame Sprite Intro, followed by a 5.0s `power4.inOut` Curtains split-screen reveal animation.

## 2. Constitution Check

- **Constraint**: Transient State Architecture (Zustand) for scroll coordinates.
  - *Compliance*: All velocity, gyro X/Y, and audio levels stream through RAF without React re-renders.
- **Constraint**: Continuous Linear Layout & Easy In/Easy Out.
  - *Compliance*: Curtains transition and audio fades follow smooth GSAP easings (`power4.inOut`).
- **Constraint**: Forward-Only Snapping & Mobile Physics Stability.
  - *Compliance*: `syncTouch: true` enabled in Lenis instance to prevent Android Chrome touch hijacking.

## 3. Proposed Changes

### [NEW] `components/EnterOverlay.tsx`
- Full-screen black gateway overlay with "Enter Exhibition" button.
- Handles user gesture for Web Audio API `AudioContext.resume()` and iOS `DeviceOrientationEvent.requestPermission()`.

### [NEW] `components/AmbientAudio.tsx`
- Headless component managing Web Audio API oscillators and biquad filters.
- Modulates pitch and gain based on `lenis.velocity`.

### [NEW] `components/WebGLCursor.tsx`
- Full-screen canvas powered by `ogl`.
- Renders liquid distortion cursor shader, magnet effect on video hover, and CD countdown indicator.

### [NEW] `components/CurtainsTransition.tsx`
- Renders dual-leaf curtain elements that split open over 5.0s (`power4.inOut`) when navigating via deep links.

### [NEW] `lib/utils/consoleHackerMode.ts`
- Utility that auto-prints ASCII art and attaches getter traps on `console` to stream Teleport Math, VRAM counts, and FPS metrics.

### [MODIFY] `app/page.tsx`
- Inject `EnterOverlay`, `AmbientAudio`, `WebGLCursor`, `CurtainsTransition`, and initialize `consoleHackerMode()`.

## 4. Verification & Testing

- Validate Web Audio synth modulation on high scroll velocity.
- Validate `ogl` WebGL cursor rendering at 60+ FPS on desktop.
- Validate Gyroscope tilt on iOS/Android devices and fallback behavior.
- Validate DevTools console output on F12.
- Validate 5.0s Curtains transition on deep link URL access (`/#work-a`).
