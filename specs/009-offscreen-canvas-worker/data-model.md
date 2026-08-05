# Data Model: OffscreenCanvas Worker State

**Feature**: 009-offscreen-canvas-worker | **Date**: 2026-08-05

---

## Entities

### WorkerInMessage (Union Type — Main → Worker)

Toàn bộ giao tiếp từ Main Thread sang Worker đều qua union type này.

| Type | Fields | Mô tả |
|---|---|---|
| `INIT` | `canvas: OffscreenCanvas`, `width: number`, `height: number` | Khởi tạo Worker, transfer canvas ownership |
| `FRAME` | `velocity: number` | Relay scroll velocity mỗi animation frame |
| `RESIZE` | `width: number`, `height: number` | Thông báo viewport thay đổi kích thước |
| `VISIBILITY` | `visible: boolean` | Pause/resume khi tab ẩn/hiện |

**Transfer semantics**: `INIT` message phải dùng `Transferable` array `[canvas]` để transfer ownership thực sự.

---

### WorkerInternalState (Worker-only, không expose ra ngoài)

Trạng thái nội bộ Worker — không serialize, không giao tiếp ngược.

| Field | Type | Mô tả |
|---|---|---|
| `ctx` | `OffscreenCanvasRenderingContext2D` | Canvas 2D context nhận từ INIT message |
| `width` | `number` | Viewport width hiện tại |
| `height` | `number` | Viewport height hiện tại |
| `time` | `number` | Animation time counter (+=0.007 mỗi frame) |
| `velocity` | `number` | Velocity snapshot từ message gần nhất |
| `ampLerp` | `number` | Smoothed amplitude lerp state (0-1) |
| `collapseX` | `number` | String collapse lerp state (0-1) |
| `glowLerp` | `number` | Glow intensity lerp state (0-1) |
| `margins` | `{ left: number, right: number }` | String anchor positions |
| `stringDefs` | `StringDef[]` | Harmonic string definitions (tính từ height) |
| `particles` | `Particle[]` | 10 particle objects (5 left, 5 right) |
| `pointsCache` | `{x,y}[]` | Pre-allocated bezier points buffer |
| `isVisible` | `boolean` | Visibility gate — false = skip render |
| `rafId` | `number` | Current RAF handle |

---

### StringDef (immutable per height)

| Field | Type | Mô tả |
|---|---|---|
| `harmonicOrder` | `1 \| 2 \| 3` | Bậc hòa âm N |
| `amplitude` | `number` | Biên độ dao động (px) |
| `spatialFrequency` | `number` | Tần số không gian `π*N/height` |
| `temporalSpeed` | `number` | Tốc độ thời gian `1 + i*0.4` |
| `phaseOffset` | `number` | Phase offset `i*π/3` |
| `xOffset` | `number` | Horizontal offset `(i-1)*14` |

**Rebuild trigger**: `RESIZE` message → recalculate `spatialFrequency` với `height` mới.

---

### Particle (mutable per frame)

| Field | Type | Mô tả |
|---|---|---|
| `y` | `number` | Vertical position (pixels) |
| `baseSpeed` | `number` | Tốc độ di chuyển cơ bản (0.3-0.45) |
| `cluster` | `"left" \| "right"` | Thuộc string cluster nào |
| `stringIndex` | `0 \| 1 \| 2` | Index của string dùng để tính X position |

---

### KineticStringsController Props (Main Thread Component Interface)

Không có props thay đổi — component hoàn toàn self-contained. Interface không thay đổi sau migration.

```tsx
// Trước và sau migration — API không đổi
<KineticStringsCanvas />
```

---

## State Transitions

```
Component Mount
    ↓
detect OffscreenCanvas support?
    ├── YES → Worker Path
    │       ├── new Worker()
    │       ├── canvas.transferControlToOffscreen()
    │       ├── postMessage({type:'INIT', canvas, width, height}, [canvas])
    │       └── GSAP ticker: postMessage({type:'FRAME', velocity}) each frame
    │
    └── NO → Fallback Path
            └── run current Main Thread render (existing code)

resize event (debounced RAF)
    ├── Worker Path: postMessage({type:'RESIZE', width, height})
    └── Fallback Path: resize canvas directly

visibilitychange
    ├── Worker Path: postMessage({type:'VISIBILITY', visible: !document.hidden})
    └── Fallback Path: isPageVisible flag

Component Unmount
    ├── Worker Path: worker.terminate()
    └── Fallback Path: gsap.ticker.remove(render)
```
