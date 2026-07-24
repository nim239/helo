# Quickstart & Validation Guide

## Prerequisites
- Node.js 18+ and `npm run dev` running.
- Ensure the 120-frame passes (beauty, normal, alpha) are loaded in the `public/` directory (either as sprite sheets or an optimal video format).

## Validation Scenarios

1. **Sprite Resizing**: 
   - Load the portfolio.
   - Resize the browser window.
   - **Expected Outcome**: The sprite maintains its correct aspect ratio, doesn't get clipped or duplicated, and its flight trajectory perfectly recalculates to reach the new edges of the window.

2. **Refraction & Distortion**:
   - Scroll down to position the glass cube over a recognizable background element (e.g., typography).
   - **Expected Outcome**: The background text appears distorted through the glass, matching the contours of the normal map.

3. **Chromatic Aberration on Scroll**:
   - Scroll down quickly using a trackpad or mouse wheel.
   - **Expected Outcome**: The edges of the glass cube split into RGB colors (chromatic aberration). The intensity must correspond to the speed of the scroll.
   - Stop scrolling.
   - **Expected Outcome**: The aberration seamlessly interpolates back to zero (sharp edges).

4. **Performance Check**:
   - Open Chrome DevTools -> Rendering -> FPS meter.
   - Scroll vigorously.
   - **Expected Outcome**: FPS remains steady at 60 (or 120 on ProMotion). No massive GPU repaints caused by DOM-to-texture rendering.
