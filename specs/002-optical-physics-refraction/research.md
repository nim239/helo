# Phase 0: Research

## WebGL Library Selection
- **Decision**: React Three Fiber (R3F)
- **Rationale**: The project already approves R3F in the Constitution. R3F provides seamless integration with React hooks and Zustand, allowing us to easily pipe scroll data (via `useFrame`) into shader uniforms without triggering React re-renders. It also simplifies texture loading and canvas management.
- **Alternatives considered**: Raw WebGL (too verbose), PixiJS (excellent for 2D, but adding another dependency when R3F is already approved is redundant).

## Background Refraction Strategy
- **Decision**: Dynamic WebGL RenderTarget / 2D Canvas Texture for Background Layers.
- **Rationale**: To refract the moving 2D Parallax elements (Grid, Typography) accurately without the massive overhead of `html2canvas`, we will bypass rendering these elements as HTML DOM nodes. Instead, we will draw the parallax grid and typography into a dynamic `CanvasTexture` or WebGL `RenderTarget`. This dynamic texture will update its position based on the scroll (syncing with the Parallax physics) and serve as the `u_backgroundMap` uniform for the refraction shader.
- **Alternatives considered**: `html2canvas` on every frame (rejected due to severe FPS drops); Static image (rejected because the parallax elements need to move dynamically with scroll).

## Chromatic Aberration Scroll Link
- **Decision**: Read scroll velocity from Lenis via Zustand store or a direct GSAP ScrollTrigger proxy.
- **Rationale**: The Constitution mandates bypassing Virtual DOM. R3F's `useFrame` can safely poll a transient Zustand state (e.g. `useScrollStore.getState().velocity`) on every frame and update the shader uniform `u_aberration` natively, guaranteeing 0ms latency.
- **Alternatives considered**: React state `useState` (rejected due to re-render overhead).
