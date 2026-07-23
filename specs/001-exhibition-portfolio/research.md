# Research: Phase 2 "WOW" Features

## WebGL Cursor Implementation
- **Decision**: Use `ogl` library.
- **Rationale**: Raw WebGL is too verbose and error-prone for liquid distortion shaders. Three.js is too heavy (150kb+ gzipped) and violates our performance principles for a simple 2D cursor. `ogl` is extremely lightweight (~15kb) and perfect for this.
- **Alternatives considered**: Raw WebGL (rejected due to verbosity), Three.js (rejected due to bundle size).

## Web Audio API Integration
- **Decision**: Initialize `AudioContext` only after user clicks "Enter" on the `EnterOverlay`.
- **Rationale**: Modern browsers (Chrome, Safari) strictly block Audio autoplay without user interaction. Attempting to play on mount will throw a DOMException.
- **Alternatives considered**: None. This is a strict browser security policy.

## Gyroscope Parallax on iOS
- **Decision**: Use `DeviceOrientationEvent.requestPermission()`.
- **Rationale**: iOS 13+ requires explicit user permission triggered by a direct user interaction (click/tap) to access the gyroscope.
- **Alternatives considered**: None. Strict iOS requirement.
