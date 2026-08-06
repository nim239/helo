# Data Model: Hyperspace Warp Engine

## Entities

### WarpPool (Runtime ref — NOT persisted)
```typescript
// useRef<number> in useExhibitionScroll
warpPool: number  // 0.0 to 1.0, float
```
- Tăng: `+= Math.abs(lenis.velocity) * WARP_GAIN` mỗi GSAP frame
- Giảm: `*= WARP_FRICTION` mỗi frame (bất kể velocity)
- Clamp: `Math.max(0, Math.min(1, warpPool))`
- Transition: khi >= WARP_THRESHOLD (0.85) → dispatch setPhase('WARPING')
- Exit: khi < 0.01 và phase === 'WARPING' → dispatch setPhase('IDLE')

### ScrollPhase (Zustand — extended)
```typescript
type ScrollPhase = 'IDLE' | 'SCROLLING' | 'SNAPPING' | 'WARPING'
```
- IDLE → SCROLLING: velocity > 0.1
- SCROLLING → WARPING: warpPool >= 0.85
- WARPING → IDLE: warpPool < 0.01 (natural drain only)
- Any → IDLE: document.hidden = true (forced reset)

### WarpParticle (Canvas 2D runtime array)
```typescript
interface WarpParticle {
  x: number        // spawn position X (random across viewport width)
  y: number        // current Y position
  vx: number       // horizontal drift (small, ±1-3px)
  vy: number       // primary velocity, negative = going up
  length: number   // streak length in px (20-120)
  alpha: number    // 0.0 to 1.0
  hue: number      // 180-260 (cyan to indigo range)
  life: number     // 0.0 to 1.0, decreases each frame
}
```
- Pool: fixed array of 120 particles (object pool, no GC pressure)
- Respawn: khi `life <= 0`, reinitialize với position mới
- LOD: chỉ update/draw `Math.floor(fps / 60 * MAX_PARTICLES)` particles

### CubiWarpState (runtime trong SpriteAnimation)
```typescript
amplitudeMult: number   // lerp: 1.0 (normal) → 0.12 (full warp)
driftOffsetY: number    // = -lenis.velocity * WARP_DRIFT_MULT
```

### WarpCullMethod (compile-time constant)
```typescript
const WARP_CULL_METHOD: 'opacity' | 'display' = 'display'
```

## State Transitions Diagram

```
IDLE ──(velocity > 0.1)──→ SCROLLING
SCROLLING ──(velocity ≤ 0.1)──→ IDLE
SCROLLING ──(warpPool ≥ 0.85)──→ WARPING
WARPING ──(warpPool < 0.01, natural drain)──→ IDLE
Any ──(document.hidden)──→ IDLE + warpPool = 0
```

## Zustand Store Changes (useScrollStore.ts)
```typescript
// Thêm vào interface:
warpPool: number          // 0-1, synced từ ref mỗi ~10 frames (for cursor HUD)
setWarpPool: (v: number) => void
// ScrollPhase extend thêm 'WARPING'
```
**Note**: Raw warpPool float update theo GSAP ticker (useRef trong hook). Zustand chỉ nhận update throttled ~6fps để cursor HUD render mà không trigger re-render heavy.
