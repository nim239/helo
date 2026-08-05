# Tasks: OffscreenCanvas + Worker Render Pipeline

**Feature**: `009-offscreen-canvas-worker`
**Branch**: `009-offscreen-canvas-worker`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)
**Generated**: 2026-08-05

---

## Implementation Strategy

**MVP = Phase 2 + Phase 3 (US1 + US2)**: Worker active với visual parity đảm bảo.
**Incremental**: Fallback (US3) và velocity sync refinement (US4) thêm vào sau khi MVP ổn định.

**Approach**: Tách render logic ra file Worker riêng trước, sau đó wiring vào component. Không xóa fallback code cũ cho đến khi Worker path được verify hoàn toàn.

---

## Phase 1: Setup

- [ ] T001 Tạo thư mục `lib/workers/` trong project root `d:\web_portfolio\lib\workers\`
- [ ] T002 Kiểm tra Next.js 16 Turbopack có hỗ trợ `new Worker(new URL(...), {type:'module'})` bằng cách tạo file test tạm `lib/workers/_test.worker.ts` với content `self.postMessage('ping')` và import thử trong một component test — ghi lại kết quả vào `research.md`

---

## Phase 2: Foundational (blocking — phải xong trước mọi User Story)

- [x] T003 Tạo TypeScript type file `lib/workers/kinetic-strings.types.ts` — định nghĩa union type `WorkerInMessage` (`INIT | FRAME | RESIZE | VISIBILITY`) và interface `StringDef`, `Particle`, `WorkerInternalState` theo `data-model.md`
- [x] T004 [P] Viết Worker entry file `lib/workers/kinetic-strings.worker.ts` — setup boilerplate: `self.onmessage` handler dispatch theo `data.type`, empty stubs cho từng case, export rỗng để TypeScript nhận diện là module
- [x] T005 [P] Trích xuất toàn bộ pure-function render logic từ `components/KineticStringsCanvas.tsx` sang `lib/workers/kinetic-strings.worker.ts`: `getStringX()`, `drawWavePathBezier()`, `createSpindleGradient()`, constants (`STRING_COUNT`, `CHROMA_PAIRS`, `SCALE`), `stringDefs` initialization, `particles` initialization, `pointsCache` pre-allocation — đây là copy, CHƯA xóa ở file gốc

---

## Phase 3: User Story 1 — Smooth Animation Without Jank (P1)

**Story Goal**: Canvas render chạy trên Worker thread riêng, Main Thread không bị block.

**Independent Test**: DevTools Performance → Main Thread không có Long Task màu đỏ liên quan canvas khi cuộn 3 giây.

- [x] T006 [US1] Implement `INIT` message handler trong `lib/workers/kinetic-strings.worker.ts` — nhận `OffscreenCanvas`, gọi `getContext('2d')`, khởi tạo `width/height/margins/stringDefs/particles/pointsCache`, log `[KineticStrings Worker] Initialized`
- [x] T007 [US1] Implement `FRAME` message handler trong `lib/workers/kinetic-strings.worker.ts` — cập nhật `velocityRef`, không render ngay (render được trigger bởi RAF loop)
- [x] T008 [US1] Implement `RESIZE` message handler trong `lib/workers/kinetic-strings.worker.ts` — update `width/height`, gọi `offscreenCanvas.width = width` (nếu access available), rebuild `stringDefs` với `spatialFrequency` mới, rebuild `margins`
- [x] T009 [US1] Implement `VISIBILITY` message handler trong `lib/workers/kinetic-strings.worker.ts` — set `isVisible` flag, cancel/restart RAF loop tương ứng
- [x] T010 [US1] Implement RAF render loop trong `lib/workers/kinetic-strings.worker.ts` — `const loop = () => { if (isVisible) render(); rafId = self.requestAnimationFrame(loop); }` với fallback sang `setTimeout(loop, 1000/60)` nếu `requestAnimationFrame` không available trong Worker scope
- [x] T011 [US1] Implement hàm `render()` trong `lib/workers/kinetic-strings.worker.ts` — port toàn bộ render body từ `KineticStringsCanvas.tsx`: `time += 0.007`, lerp states, draw strings (IS_GLOW_ENABLED = false), draw particles
- [x] T012 [US1] Sửa `components/KineticStringsCanvas.tsx` — thêm OffscreenCanvas detection: `const supportsOffscreen = typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in HTMLCanvasElement.prototype`
- [x] T013 [US1] Sửa `components/KineticStringsCanvas.tsx` — implement Worker path trong `useEffect`: `new Worker(...)` → `postMessage({type:'INIT', canvas: offscreenCanvas, width, height}, [offscreenCanvas])` → setup GSAP ticker relay `() => worker.postMessage({type:'FRAME', velocity})`
- [x] T014 [US1] Sửa `components/KineticStringsCanvas.tsx` — implement resize handler cho Worker path: debounced RAF → `worker.postMessage({type:'RESIZE', width, height})`
- [x] T015 [US1] Sửa `components/KineticStringsCanvas.tsx` — implement visibility handler cho Worker path: `document.addEventListener('visibilitychange', () => worker.postMessage({type:'VISIBILITY', visible: !document.hidden}))`
- [x] T016 [US1] Sửa `components/KineticStringsCanvas.tsx` — implement cleanup cho Worker path: `return () => { worker.terminate(); gsap.ticker.remove(velocityRelayTicker); }`
- [x] T017 [US1] Chạy `npm run build` và verify TypeScript compile thành công — không có lỗi type

---

## Phase 4: User Story 2 — Identical Visual Output (P1)

**Story Goal**: Output canvas Worker giống hệt 100% với Main Thread render cũ về màu sắc, biên độ, tốc độ.

**Independent Test**: Cuộn đến `scrollY=0` → screenshot dây đàn → so sánh với reference screenshot trước migration: các đường nét, màu sắc, vị trí particles phải giống nhau.

- [x] T018 [P] [US2] Verify `time` accumulation trong Worker: mở DevTools → Inspect Worker scope (Chrome: three-dot menu → More tools → JavaScript Profiler hoặc dùng `console.log` trong Worker) → confirm `time` tăng đều theo tốc độ `0.007/frame`
- [x] T019 [P] [US2] Verify `ampLerp` / `collapseX` / `glowLerp` lerp behavior trong Worker: cuộn nhanh → dây đàn phải biến dạng (collapseX tăng); dừng → dây đàn phải hồi phục mượt mà theo `LERP_OUT = 0.02`
- [x] T020 [US2] Verify particle behavior trong Worker: 10 particles (5 left, 5 right) di chuyển đúng hướng, wrap ở biên `y=0/height`, tốc độ thay đổi theo velocity
- [x] T021 [US2] Verify string color: dây màu trắng `rgba(255,255,255,0.98)`, lineWidth `0.8` — không có color drift hay transparency issue
- [x] T022 [US2] Nếu phát hiện sai lệch visual: debug bằng cách thêm `console.log` trong Worker tại `render()` — so sánh `ampLerp`, `collapseX` giữa Worker và Main Thread cũ tại cùng `velocity=0.5`

---

## Phase 5: User Story 3 — Graceful Fallback (P2)

**Story Goal**: Trình duyệt không hỗ trợ OffscreenCanvas vẫn hiển thị animation bình thường.

**Independent Test**: Thêm `delete (window as any).OffscreenCanvas` vào đầu useEffect → refresh → animation vẫn chạy, console không có error.

- [x] T023 [US3] Sửa `components/KineticStringsCanvas.tsx` — giữ nguyên toàn bộ Main Thread render code (từ code hiện tại) trong một `else` branch sau OffscreenCanvas detection — chạy khi `supportsOffscreen === false`
- [x] T024 [US3] Thêm console.log phân biệt path: `console.log('[KineticStrings] OffscreenCanvas Worker active')` và `console.log('[KineticStrings] Fallback to Main Thread render')`
- [x] T025 [US3] Test fallback: trong `useEffect`, tạm thời override `const supportsOffscreen = false` → verify animation chạy bình thường trên Main Thread → revert
- [x] T026 [US3] Test Worker error recovery: wrap `new Worker(...)` trong try-catch → nếu Worker init throw → fallback về Main Thread render, log warning

---

## Phase 6: User Story 4 — Velocity Sync (P2)

**Story Goal**: `velocity` relay từ Main Thread sang Worker trong ≤ 1 frame (16ms ở 60Hz).

**Independent Test**: DevTools Performance → Tìm `postMessage` call trong Main Thread timeline → đo khoảng cách đến khi Worker nhận message và render thay đổi: phải ≤ 16ms.

- [x] T027 [US4] Verify velocity relay timing: trong GSAP ticker callback, log `performance.now()` trước `postMessage` → trong Worker FRAME handler, log `performance.now()` khi nhận — diff phải < 2ms (inter-thread latency)
- [x] T028 [US4] Verify không có dropped messages: nếu GSAP ticker gửi > 1 FRAME message trước khi Worker xử lý (Worker đang render) → Worker phải xử lý message cuối cùng, không cummulate stale velocity values — implement: Worker chỉ dùng `velocity` từ message gần nhất (current implementation via ref update là đủ)
- [x] T029 [US4] Xóa debug logs trong Worker và KineticStringsCanvas sau khi tất cả User Stories verified

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T030 Xóa code fallback render cũ trong `KineticStringsCanvas.tsx` nếu và chỉ nếu `supportsOffscreen` được xác nhận là `true` trên 100% target browsers (tạm thời: GIỮ fallback code)
- [x] T031 [P] Chạy `npm run build` production build — confirm 0 errors, 0 TypeScript warnings
- [x] T032 [P] Đo bundle size diff: `du -sh .next/static/chunks/` — confirm bundle không tăng quá 20KB gzipped
- [x] T033 Cập nhật `README.md` → Dev Journal với entry: "OffscreenCanvas Worker migration cho KineticStringsCanvas — Main Thread Input Delay giảm từ 363ms → <100ms"

---

## Dependency Graph

```
T001 → T002
T003 → T004, T005     (types must exist before Worker stubs and render extraction)
T004 + T005 → T006, T007, T008, T009, T010, T011  (foundational → Phase 3)
T006 + T010 + T011 → T012 → T013 → T014 → T015 → T016 → T017  (sequential in Phase 3)
T017 → T018, T019, T020, T021  (build must pass before visual verification)
T023 → T024 → T025 → T026  (fallback phase sequential)
T029 → T030 → T031 → T032 → T033  (cleanup last)
```

## Parallel Opportunities

**Phase 2**: T004 và T005 có thể song song (Worker stub vs. extract render logic — different concerns)

**Phase 4**: T018, T019, T020, T021 có thể làm song song (kiểm tra từng khía cạnh visual riêng biệt)

**Phase 7**: T031 và T032 song song (build và measure là independent)

---

## Task Count Summary

| Phase | Tasks | User Story | Parallelizable |
|---|---|---|---|
| Phase 1: Setup | T001-T002 | — | — |
| Phase 2: Foundational | T003-T005 | — | T004, T005 |
| Phase 3: US1 Animation | T006-T017 | US1 (P1) | — |
| Phase 4: US2 Visual Parity | T018-T022 | US2 (P1) | T018, T019, T020, T021 |
| Phase 5: US3 Fallback | T023-T026 | US3 (P2) | — |
| Phase 6: US4 Velocity Sync | T027-T029 | US4 (P2) | — |
| Phase 7: Polish | T030-T033 | — | T031, T032 |
| **Total** | **33 tasks** | **4 stories** | **7 parallel** |

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 = T001–T022 (22 tasks)
