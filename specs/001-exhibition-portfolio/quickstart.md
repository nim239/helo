# Quickstart Validation Guide: Exhibition Portfolio Phase 2

This guide provides runnable validation scenarios to prove the "WOW" features of Phase 2 are functioning end-to-end.

## Prerequisites

- Node.js 18+ installed.
- Dependencies installed via `npm install` or `pnpm install`.
- Local development server running (`npm run dev`).

## Validation Scenarios

### Scenario 1: Validate Web Audio Reactive Canvas

**Goal:** Ensure the Ambient Sound synthesizers modulate according to the Lenis scroll velocity.

**Steps:**
1. Open the exhibition locally (e.g., `http://localhost:3000`).
2. Click the "Enter Exhibition" gateway button to grant AudioContext permissions.
3. Start scrolling rapidly.
4. **Expected Outcome:** You should hear a synthesized ambient noise. As your scroll velocity increases, the pitch and volume of the sound should noticeably rise. When you stop scrolling, the sound should fade out smoothly.
5. If the browser blocks audio unexpectedly (or you revoke permission), verify that the site continues to operate without breaking (Silent Fallback).

### Scenario 2: Validate Custom WebGL Cursor (Mobile Extermination & Idle Magnet)

**Goal:** Ensure the custom cursor functions on desktop but is disabled on mobile, and the Idle Magnet system works.

**Steps:**
1. **Desktop Test:** Open the app on a desktop browser. Move the mouse; a custom liquid distortion ring/dot should track your pointer.
2. Stop moving the mouse for **2.5 seconds**.
3. **Expected Outcome:** The cursor should automatically drift towards the center of the screen (the Idle Magnet effect).
4. **Mobile Extermination Test:** Open the browser's Developer Tools and toggle Device Toolbar (Mobile simulation). Ensure the pointer is set to "Touch". Reload the page.
5. **Expected Outcome:** The custom cursor should NOT render, falling back to standard touch behaviors (respecting the `pointer: coarse` threshold).

### Scenario 3: Validate DevTools Hacker Mode

**Goal:** Ensure the Easter Egg activates upon inspecting the page.

**Steps:**
1. Open the exhibition in a browser.
2. Press `F12` (or Right Click -> Inspect) to open the Developer Tools Console.
3. **Expected Outcome:** You should immediately see an ASCII Art logo printed in the console, followed by a real-time stream of `[Teleport Math]`, `[VRAM Flush Count]`, and `[FPS: ~144]`.

### Scenario 4: Validate Seamless Hash Deep Linking & Curtains

**Goal:** Ensure navigating directly to a deep link triggers the cinematic Curtains sequence.

**Steps:**
1. Manually type a URL hash into your address bar (e.g., `http://localhost:3000/#work-b`) and hit Enter.
2. **Expected Outcome:** The page should load the 120-frame Sprite Intro first. After the intro, a 5.0-second `power4.inOut` split-screen "Curtains" animation should smoothly reveal the `#work-b` section without breaking the physical scroll momentum.

### Scenario 5: Validate CDN Fallback & Rule of 3

**Goal:** Ensure video unmounting rules are enforced and fallbacks work.

**Steps:**
1. Scroll down to a Horizontal Marquee section (e.g., "Motion Work").
2. **Rule of 3 Test:** Inspect the DOM (Elements tab). Count the number of active `<video>` tags. As the marquee scrolls, ensure no more than **3** video elements exist in the DOM at any given time.
3. **CDN Fallback Test:** Simulate a network failure for media files (via the Network tab in DevTools, block request URL matching `.webm` or `.mp4`).
4. **Expected Outcome:** The video elements should silently fall back to displaying the `poster` images defined in `data/sections.json`, with no broken UI overlays or console crashes.
