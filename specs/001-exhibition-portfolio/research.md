# Research: Roadmap Phase 2 "WOW" Features

## 1. Web Audio API Synthesizer vs. File Audio
- **Decision**: Web Audio API Synthesizer (Oscillators + GainNode + BiquadFilterNode).
- **Rationale**: 0KB asset overhead, zero CDN bandwidth cost. Allows real-time continuous pitch bending and volume scaling bound to `lenis.velocity` without audio clipping or file buffer underruns.
- **Alternatives Considered**: Audio file playback (`.mp3` / `.ogg`), rejected due to network latency and fixed playback rate limitations.

## 2. Cursor Rendering Strategy
- **Decision**: HTML DOM elements (divs) heavily optimized with GSAP `quickSetter`.
- **Rationale**: Achieves 144Hz smoothness via direct DOM transform manipulation while bypassing React re-renders. Avoids the 15KB bundle overhead of `ogl` WebGL library and simplifies implementation for the Idle Magnet Provocation System.
- **Alternatives Considered**: `ogl` WebGL liquid distortion shader (rejected due to unnecessary complexity and mobile battery drain).

## 3. iOS Motion Sensor Permission & Fallback
- **Decision**: Request permission inside `EnterOverlay` click handler. If denied or unsupported, silently fallback to Touch Scroll Parallax.
- **Rationale**: Guarantees zero UI disruption or error popups during the exhibition experience.
- **Alternatives Considered**: Persistent permission retry modal (rejected for UX disruption).

## 4. DevTools Hacker Mode Detection
- **Decision**: Trap console getters + RAF ticker logging.
- **Rationale**: Fires automatically when F12 console opens without degrading main-thread rendering performance.

## 5. Deep Link Curtains Transition Duration
- **Decision**: 5.0 seconds duration with `power4.inOut` easing.
- **Rationale**: Provides an ultra-slow, deeply immersive, and cinematic exhibition opening reveal when accessing project links directly.
