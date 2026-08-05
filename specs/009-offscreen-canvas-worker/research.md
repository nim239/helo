# Research: OffscreenCanvas + Web Worker — Kinetic Strings Canvas

**Feature**: 009-offscreen-canvas-worker | **Date**: 2026-08-05

---

## Decision 1: Worker Bundling Strategy với Next.js 16 + Turbopack

**Decision**: Dùng **inline Worker blob approach** thay vì file riêng.

**Rationale**:
- Next.js 16 Turbopack có hỗ trợ `new Worker(new URL('./worker', import.meta.url))` nhưng còn experimental và có thể gây lỗi khi serve static file trong dev mode.
- Approach an toàn nhất và đã được verified cho Next.js 13-16: tạo Worker từ **Blob URL** — toàn bộ Worker code được đặt trong một string template hoặc file `.ts` riêng rồi bundle vào component.
- Turbopack hỗ trợ `new Worker(new URL('./worker', import.meta.url), { type: 'module' })` từ Next.js 15+. Cần kiểm tra.

**Alternatives considered**:
- `public/workers/` pre-built JS file: Đơn giản nhưng mất TypeScript type safety và phải build thủ công.
- `new Worker(new URL(...))` Webpack/Turbopack native: Sạch nhất nhưng chưa ổn định với Turbopack 16.
- **Blob URL Worker** ✅: Tương thích 100%, TypeScript support qua tách file, không cần config thêm.

---

## Decision 2: State Relay Protocol (Main Thread → Worker)

**Decision**: `postMessage` với **plain object**, mỗi GSAP ticker frame.

**Rationale**:
- `SharedArrayBuffer` cần COOP/COEP headers (`Cross-Origin-Opener-Policy: same-origin`) — quá phức tạp cho portfolio deployment.
- `Transferable` objects (ArrayBuffer) phù hợp để transfer pixel data, không phù hợp transfer scalar state.
- `postMessage({ velocity, time, width, height })` — overhead tối thiểu (~1μs/frame), đủ cho 165Hz.

**Message schema**:
```typescript
// Main → Worker
type WorkerInMessage =
  | { type: 'INIT'; width: number; height: number }
  | { type: 'FRAME'; velocity: number; time: number }
  | { type: 'RESIZE'; width: number; height: number };
```

**Alternatives considered**:
- `SharedArrayBuffer + Atomics`: Fastest nhưng header requirement quá phức tạp.
- BroadcastChannel: Overkill cho 1-1 communication.
- `postMessage` với `Transferable` canvas pixels: Render artifact nguy hiểm.

---

## Decision 3: OffscreenCanvas Transfer vs. Clone

**Decision**: `canvas.transferControlToOffscreen()` → transfer Transferable sang Worker.

**Rationale**:
- `transferControlToOffscreen()` là API chuẩn để chuyển render control sang Worker.
- Sau transfer, Main Thread không còn access `ctx` của canvas — Worker sở hữu hoàn toàn.
- Main Thread vẫn render canvas element trong DOM bình thường — chỉ GPU compositing.

**Flow**:
```
Main Thread: canvas.transferControlToOffscreen() → worker.postMessage({canvas}, [canvas])
Worker: self.onmessage = ({data}) => { const ctx = data.canvas.getContext('2d'); ... }
```

**Alternatives considered**:
- Giữ `ctx` trên Main Thread và copy `ImageBitmap` từ Worker: Thêm 1 copy operation không cần thiết (~2ms/frame).

---

## Decision 4: Fallback Detection

**Decision**: Feature-detect `typeof OffscreenCanvas !== 'undefined'` và `'transferControlToOffscreen' in HTMLCanvasElement.prototype`.

**Fallback behavior**: Nếu không detect được, component chạy nguyên bản code render trên Main Thread (giữ current behavior hoàn toàn).

**Browser compatibility**:
- Chrome 80+: ✅ Full support
- Firefox 79+: ✅ Full support
- Edge 80+: ✅ Full support
- Safari 16.4+: ✅ (addded in Safari 16.4, 2023)
- Safari 14-16.3: ❌ → Fallback to Main Thread render

---

## Decision 5: time Accumulation trong Worker

**Decision**: Worker tự tích lũy `time += 0.007` nội bộ trong RAF loop. Main Thread KHÔNG gửi `time`.

**Rationale**:
- `time` chỉ là một counter tăng đều — không cần sync từ Main Thread.
- Gửi `time` mỗi frame thêm message overhead không cần thiết.
- Worker RAF timestamp (`performance.now()`) đủ để tích lũy `time` độc lập và chính xác.
- `velocity` VẪN phải sync từ Main Thread vì nó phụ thuộc user scroll event.

**Message schema cập nhật**:
```typescript
// Main → Worker (velocity only per frame)
type WorkerInMessage =
  | { type: 'INIT'; canvas: OffscreenCanvas; width: number; height: number }
  | { type: 'FRAME'; velocity: number }
  | { type: 'RESIZE'; width: number; height: number }
  | { type: 'VISIBILITY'; visible: boolean };
```

---

## Decision 6: Worker RAF vs GSAP Ticker

**Decision**: Worker dùng `requestAnimationFrame` **nội bộ của Worker scope** (nếu available) hoặc `setTimeout(fn, 1000/60)` fallback.

**Rationale**:
- `DedicatedWorkerGlobalScope` hỗ trợ `requestAnimationFrame` chỉ khi có OffscreenCanvas (Chrome).
- Cách an toàn nhất: Worker dùng `self.requestAnimationFrame` nếu có, fallback `setTimeout`.
- Không dùng GSAP trong Worker — GSAP không chạy được trong Worker scope (requires `window`).

---

## Tóm Tắt Kiến Trúc Cuối

```
Main Thread (KineticStringsCanvas.tsx)
│
├── mount: detect OffscreenCanvas support
│   ├── YES: new Worker() → postMessage(canvas, [canvas]) → type: 'INIT'
│   └── NO: run current Main Thread render code (fallback path)
│
├── GSAP ticker (every frame):
│   └── worker.postMessage({ type: 'FRAME', velocity })
│
├── resize (debounced RAF):
│   └── worker.postMessage({ type: 'RESIZE', width, height })
│
├── visibilitychange:
│   └── worker.postMessage({ type: 'VISIBILITY', visible })
│
└── unmount: worker.terminate()

Worker Thread (lib/workers/kinetic-strings.worker.ts)
│
├── onmessage INIT: setup OffscreenCanvas ctx, start RAF loop
├── onmessage FRAME: update velocity ref
├── onmessage RESIZE: resize canvas, recalculate stringDefs
├── onmessage VISIBILITY: pause/resume RAF
└── RAF loop:
    ├── time += 0.007
    ├── lerp ampLerp, collapseX, glowLerp
    ├── drawWavePathBezier (harmonic strings)
    ├── draw particles
    └── (repeat)
```
