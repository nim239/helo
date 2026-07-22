# Quickstart & Validation Guide: Exhibition Portfolio

This guide provides steps to validate that the Exhibition Portfolio engine is working correctly according to the `spec.md`.

## Setup & Running

1. **Install Dependencies**
   ```bash
   npm install
   # Ensure zustand, lenis, gsap are installed
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Open the Application**
   Navigate to `http://localhost:3000`

## Validation Scenarios

### 1. Velocity Preservation & Teleport Math
**Test**: Scroll aggressively down until you cross the clone boundaries.
**Expected**: 
- The visual loop is perfectly seamless.
- Momentum is preserved during the jump (the page continues scrolling naturally).
- No visual snapping or blank spots occur.

### 2. State Machine Deadlock Bypass
**Test**: Trigger a fast scroll that causes a teleport. Immediately place your finger on the trackpad/screen to stop the scroll (bringing velocity to 0) while within the 500ms teleport cooldown window. Wait 1 second, then scroll again.
**Expected**: 
- The application does not freeze. 
- The state correctly bypasses the snap lerp, returns to IDLE, and resumes scrolling when you interact again.

### 3. Unified Dwell-to-Play Marquee Rule
**Test**: Scroll down to the "Work B" (Horizontal Marquee) section and stop scrolling. Wait exactly 400ms without touching the mouse/screen.
**Expected**: 
- The horizontal marquee movement pauses.
- The video closest to the horizontal center automatically begins playing.
**Test 2**: Resume vertical scrolling.
**Expected**:
- The video pauses and reverts to its poster.
- The horizontal marquee resumes its momentum.

### 4. Rule of 3 (VRAM Flush on Safari)
**Test**: Open the application on an iOS Simulator or Mac Safari. Open Web Inspector -> Network/Media tabs. Scroll through the marquee.
**Expected**: 
- A maximum of 3 video streams are actively downloading or decoding at any time.
- Videos scrolling out of view trigger a `.load()` command, freeing the memory buffer (visible as dropped connections or freed memory in devtools).

### 5. Safari Resize Re-render Clash Protection
**Test**: On a mobile browser (or Simulator), scroll up and down slowly to trigger the browser's address bar to expand and collapse.
**Expected**: 
- The horizontal marquee track does NOT jump, reset, or flash.
- The `--section-height` CSS variable updates smoothly in the background, keeping layout shifts perfectly synchronized with JS math via `useLayoutEffect`.
