# Architecture Expansion: Phase 2 "WOW" Features

This plan outlines the implementation of the Phase 2 Roadmap features defined in `spec.md`, integrating them safely into the established non-interactive scrolling exhibition engine.

## 1. Technical Context

- **Audio Reactive Canvas**: Web Audio API requires a user gesture to start. We will link an `AnalyserNode` to `lenis.velocity` (via `useScrollStore`) to modulate pitch and volume.
- **WebGL Cursor**: A dedicated `<canvas>` positioned fixed on top (`z-index: 9999`). We will use raw WebGL (or a lightweight wrapper like OGL) to track `mousemove` natively and bypass React overhead.
- **Gyroscope Parallax**: `DeviceOrientationEvent` requires explicit permission on iOS 13+. We will capture X/Y rotation and feed it into a Zustand store or directly mutate CSS variables.
- **Deep Linking**: `window.location.hash` will be read on mount. If present, the app initializes in a "Curtain" state.
- **Enter Exhibition Overlay**: A necessary gateway component to acquire permissions. A single "Enter" button click will simultaneously:
  1. Resume/Start AudioContext.
  2. Request DeviceOrientation permission (if iOS).
  3. Unlock the GSAP Sprite Intro.

## 2. Constitution Check

- **Constraint**: No heavy DOM manipulation during scroll.
  - *Mitigation*: WebGL Cursor and Gyroscope will use `requestAnimationFrame` and CSS `transform` / `translate3d()` exclusively.
- **Constraint**: Forward-Only Snapping.
  - *Mitigation*: Already implemented in Phase 1 hotfix.

## 3. Proposed Changes

### [NEW] `components/EnterOverlay.tsx`
- Renders a full-screen black overlay with an "Enter Exhibition" button.
- Triggers Audio and Gyroscope permissions, then sets `isIntroComplete = false` to start the Sprite sequence.

### [NEW] `components/AmbientAudio.tsx`
- Headless component (returns `null`).
- Manages `AudioContext`, `GainNode`, and `BiquadFilterNode` (for pitch shifting/muffling).
- Subscribes to `useScrollStore.getState().scrollProgress` and `velocity` in a RAF loop.

### [NEW] `components/WebGLCursor.tsx`
- Renders `<canvas className="fixed inset-0 pointer-events-none z-[9999]" />`.
- Initializes a shader program with liquid distortion.
- Tracks `window.addEventListener('mousemove')`.

### [NEW] `components/CurtainsTransition.tsx`
- Handles the WebGL/CSS "split screen" transition when deep linking is detected.

## 4. Open Questions / User Review Required

> [!IMPORTANT]
> **WebGL Library**: Do you want me to write raw WebGL for the cursor (harder to maintain but 0 dependencies), or can I use a lightweight library like `ogl`?

> [!WARNING]
> **Audio Asset**: We need an ambient sound file (e.g., `ambient.mp3`). Should I use a placeholder URL for now?
