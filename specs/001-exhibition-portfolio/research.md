# Phase 0: Research & Clarifications

All technical unknowns have been resolved during the `/speckit-clarify` phase. No further research agents are required.

## Resolved Clarifications

1. **Audio Reactive Canvas**
   - Decision: Web Audio API `AudioContext` with synthesizers.
   - Rationale: 0KB asset overhead, avoids bandwidth costs.
   - Recovery Path: Silently continue without audio if permissions are revoked, maintaining the strict "Look but don't touch" UX.

2. **Custom Inertia WebGL Cursor**
   - Decision: HTML DOM + GSAP `quickSetter`.
   - Rationale: Extreme performance, removes heavy `ogl` dependency.
   - Mobile Extermination: Uses CSS Media Query `(pointer: coarse)` and `matchMedia` to disable cursor on touch devices, saving VRAM.

3. **CDN & Asset Management**
   - Decision: Free-Tier CDN (Supabase/Cloudinary).
   - Rationale: Direct byte-range requests, preserves Vercel bandwidth.
   - Fallback: Silently fallback to static `poster` images if CDN is unavailable.

4. **Curtains Transition**
   - Decision: 5.0s `power4.inOut` split-screen reveal animation.
   - Rationale: Ensures a highly cinematic and immersive deep-link experience.
