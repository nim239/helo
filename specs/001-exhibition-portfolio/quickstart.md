# Quickstart Guide: Phase 2 "WOW" Features Validation

## Prerequisites
- Node.js 18+
- Audio output enabled
- Desktop browser (Chrome / Edge / Safari) with WebGL support
- Mobile device (iOS / Android) for Gyroscope & Touch validation

## Setup
```bash
npm install ogl
npm run dev
```

## Validation Scenarios

### 1. Enter Overlay & Dynamic Web Audio Synth
1. Navigate to `http://localhost:3000`.
2. Click "ENTER EXHIBITION" on the gateway overlay.
3. Rapidly scroll down. Verify ambient audio pitch and volume scale continuously with scroll velocity.

### 2. WebGL Liquid Cursor & Magnet Effect
1. Move cursor across video artwork tiles.
2. Verify the WebGL liquid cursor distorts smoothly and magnets toward the center of active videos.
3. Pause mouse movement; verify CD countdown ring appears.

### 3. Mobile Gyroscope Parallax & Fallback
1. Access `http://<local-ip>:3000` on mobile.
2. Click "ENTER EXHIBITION" and grant motion permissions (iOS).
3. Tilt device; verify 2.5D parallax layers shift dynamically.
4. Test with motion permissions denied; verify smooth touch-parallax fallback without error popups.

### 4. DevTools Hacker Mode
1. Open F12 Developer Console.
2. Verify ASCII logo renders alongside real-time Teleport Math, VRAM flush counts, and FPS stats.

### 5. Seamless Hash Deep Linking & 5.0s Curtains Reveal
1. Navigate directly to `http://localhost:3000/#work-a`.
2. Complete Enter Overlay & Sprite Intro.
3. Verify the split-screen Curtains transition opens over 5.0s with `power4.inOut` easing to reveal `#work-a`.
