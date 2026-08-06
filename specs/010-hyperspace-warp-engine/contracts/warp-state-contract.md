# Contract: Warp State Interface

## ScrollStore Extension Contract

### Added to useScrollStore
```typescript
warpPool: number          // 0.0–1.0, throttled sync từ RAF ref
setWarpPool: (v: number) => void
// ScrollPhase mở rộng: 'IDLE' | 'SCROLLING' | 'SNAPPING' | 'WARPING'
```

## WarpOverlay Component Contract
```typescript
// Mount ở root layout, hidden khi không warping
// Reads: useScrollStore (currentPhase, velocity, warpPool)
// Renders: Canvas full-screen z-[90]
// No props needed — fully self-contained
export function WarpOverlay(): JSX.Element | null
```

## SpriteAnimation Extended Behavior Contract
```typescript
// EXISTING props unchanged
// NEW internal behavior when currentPhase === 'WARPING':
//   amplitudeMult = lerp(amplitudeMult, 0.12, 0.05) per GSAP frame
//   driftY = -velocity * 80
//   getTrajectory returns: { x: cX + moveX * amplitudeMult, y: cY + moveY * amplitudeMult + driftY }
// WHEN phase exits WARPING:
//   amplitudeMult lerps back to 1.0
```

## CustomCursor HUD Contract
```typescript
// Existing: fpsCircleRef (top 180° arc, unchanged behavior)  
// NEW: warpCircleRef — SVGCircleElement (bottom 180° arc)
//   strokeDasharray: HALF_CIRCUMFERENCE = 81.68
//   fill direction: clockwise from bottom
//   color: dynamic based on warpPool thresholds
// NEW: warpTextRef — displays warpPool * 100 as integer %
// Size: w-20 h-20 (up from w-16 h-16)
```

## MobileFpsOverlay Auto-Show Contract
```typescript
// Existing 5-tap toggle: PRESERVED (after bug fix)
// NEW: subscribe to useScrollStore.currentPhase
//   if phase === 'WARPING' && !isVisible → setIsVisible(true)
//   if phase !== 'WARPING' && autoShownByWarp → setTimeout(hide, 3000)
// 5-tap bug fix: ensure fps-tap-zone z-index > all other fixed elements on mobile
```
