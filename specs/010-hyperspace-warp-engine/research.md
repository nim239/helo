# Research: Hyperspace Warp Engine

## Decision 1: Warp Pool Storage — Ref vs Zustand

**Decision**: `useRef<number>` trong hook, KHÔNG Zustand cho raw warpPool float

**Rationale**: Constitution cấm useState/useContext cho data > 10Hz. WarpPool update mỗi GSAP frame (~60-165 Hz). Zustand chỉ nhận `WARPING` phase transition (event-driven, không continuous).

**Alternatives considered**: Zustand transient state → rejected vì vẫn trigger subscriber overhead mỗi frame.

---

## Decision 2: DOM Culling Method

**Decision**: Implement flag `WARP_CULL_METHOD = 'display'` làm default, test cả 2

**Rationale**: `display:none` unrender hoàn toàn — browser không paint, không layout. `opacity:0` vẫn giữ compositing layer. Chrome DevTools Layer panel xác nhận `display:none` loại bỏ layer.

**Alternatives considered**: `content-visibility: hidden` — hỗ trợ tốt Chrome/Edge nhưng Firefox partial. Rejected vì cần test thêm. `visibility:hidden` — vẫn chiếm layout, rejected.

**Benchmark plan**: Toggle `WARP_CULL_METHOD` constant, đo FPS bằng MobileFpsOverlay hoặc DevTools trên i7-7700.

---

## Decision 3: Speed Lines Particle Direction

**Decision**: `vy = -Math.abs(scrollVelocity) * SPEED_MULT` khi scroll down (velocity > 0)

**Rationale**: Particles bay ngược chiều scroll → tạo cảm giác hyperspace jump. Khi scroll down, particles chạy lên. Direction lấy từ `Math.sign(lenis.velocity)`.

**Color scheme**: Palette gradient cyan (#00F2FF) → magenta (#FF007F) → indigo (#4040FF), consistent với brand gradient KineticStrings.

---

## Decision 4: Cubi Amplitude — Minimum 12%

**Decision**: `MIN_AMP_MULT = 0.12` — biên độ tối thiểu khi warp full

**Rationale**: 0% = đứng im (bad UX). 12% của biên độ gốc (±35% viewport width) = ±4.2% viewport width — đủ thấy bay nhẹ mà không vượt ra khỏi vùng center 1/2 màn hình.

**Formula**: `amplitudeMult = lerp(1.0, 0.12, warpPool)` mỗi frame với lerp factor 0.05.

---

## Decision 5: Warp Constants Calibration

| Constant | Value | Rationale |
|----------|-------|-----------|
| WARP_GAIN | 0.04 | Cần ~1.5-2s scroll mạnh để đạt 0.85 |
| WARP_FRICTION | 0.96 | Pool drain về 0 trong ~3-4s khi dừng |
| WARP_THRESHOLD | 0.85 | Đủ cao để tránh trigger vô tình |
| SPEED_LINE_COUNT_MAX | 120 | LOD scale xuống 40 ở 30FPS |
| WARP_DRIFT_MULT | 80 | Offset Y Cubi ngược velocity |
