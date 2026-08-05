# Implementation Plan: OffscreenCanvas + Worker Render Pipeline

**Branch**: `009-offscreen-canvas-worker` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-offscreen-canvas-worker/spec.md`

---

## Summary

Chuyển toàn bộ logic tính toán và vẽ canvas của `KineticStringsCanvas` (dây đàn hòa âm, bezier path, particle system) sang một **Web Worker chạy trên luồng riêng** sử dụng **OffscreenCanvas API**. Main Thread chỉ còn: khởi tạo Worker, transfer canvas ownership, relay velocity/time mỗi frame, và quản lý lifecycle. Mục tiêu: giải phóng Main Thread khỏi ~4ms canvas compute mỗi frame, giảm INP từ 363ms → dưới 100ms.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.2.11 (Turbopack), React 19

**Primary Dependencies**:
- `OffscreenCanvas` API (built-in browser, Chrome 80+, Firefox 79+, Safari 16.4+)
- `Web Workers` API (built-in browser, universal support)
- `GSAP 3.15` (chỉ trên Main Thread — Worker không access GSAP)
- `Zustand 5` (chỉ trên Main Thread — Worker nhận state qua `postMessage`)

**Storage**: N/A

**Testing**: Manual DevTools Performance profiling, `npm run build` TypeScript check

**Target Platform**: Browser (Chrome 80+, Firefox 79+, Edge 80+, Safari 14+)

**Project Type**: Client-side web application (Next.js App Router)

**Performance Goals**:
- Main Thread Long Task liên quan canvas: 0ms (từ ~4ms/frame)
- INP (Interaction to Next Paint): < 100ms (từ 363ms baseline)
- Canvas render FPS: giữ nguyên hoặc cải thiện

**Constraints**:
- Không dùng `SharedArrayBuffer` (yêu cầu COOP/COEP headers phức tạp)
- Không thay đổi visual output của animation
- Bundle size tăng ≤ 20KB gzipped
- Worker file phải work với Turbopack bundler của Next.js 16

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Trạng thái | Ghi chú |
|---|---|---|
| **FPS là linh hồn** — 60+ FPS minimum | ✅ PASS | Feature này trực tiếp cải thiện FPS bằng cách giảm Main Thread load |
| **1 RAF duy nhất (GSAP Ticker)** | ✅ PASS | Worker dùng RAF nội bộ riêng của nó (separate thread). Main Thread vẫn chỉ có GSAP Ticker |
| **Không useState/useContext cho scroll data** | ✅ PASS | velocity relay qua postMessage từ GSAP ticker callback, không qua React state |
| **transform/translate3d only** | ✅ PASS | Canvas rendering, không liên quan CSS transitions |
| **Continuous linear scroll** | ✅ PASS | Không thay đổi scroll behavior |
| **No WebGL** | ✅ PASS | Vẫn dùng Canvas 2D context, chỉ offscreen |

**Constitution Check: PASS** — Không có vi phạm. Được tiến hành Phase 0.

---

## Project Structure

### Documentation (this feature)

```text
specs/009-offscreen-canvas-worker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
components/
├── KineticStringsCanvas.tsx      # [MODIFY] Main Thread controller — xóa render logic, giữ lifecycle + relay
└── KineticStringsCanvas.main.ts  # [NEW, optional] Extract relay logic nếu file quá lớn

public/workers/
└── kinetic-strings.worker.js     # [NEW] Pre-built Worker script (nếu Turbopack không hỗ trợ Worker import)

lib/workers/
└── kinetic-strings.worker.ts     # [NEW - PRIMARY] TypeScript Worker source (nếu Turbopack hỗ trợ)
```

**Structure Decision**: Vì Next.js 16 với Turbopack có hỗ trợ hạn chế cho `new Worker(new URL(...))` syntax, cần nghiên cứu (Phase 0) để quyết định approach: **Option A** — Turbopack native Worker import, hoặc **Option B** — pre-compiled `.js` trong `/public/workers/`.

---

## Complexity Tracking

> Không có vi phạm Constitution — bảng này trống.
