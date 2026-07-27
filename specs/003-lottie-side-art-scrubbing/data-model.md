# Data Model: Lottie 2D Motion Side Art Integration

**Feature**: [spec.md](file:///d:/web_portfolio/specs/003-lottie-side-art-scrubbing/spec.md)
**Date**: 2026-07-27

## Entities & Transient State

### 1. Lottie Animation Instance (Transient Ref)
Quản lý vòng đời và tham số hoạt họa của Lottie chạy trên bề mặt Canvas 2D, không lưu vào React State để đảm bảo hiệu năng 144Hz.

- **Attributes**:
  - `container`: HTMLDivElement / HTMLCanvasElement (`canvasRef.current`)
  - `renderer`: `'canvas'` (Bắt buộc theo FR-001)
  - `loop`: `true` (Phát lặp liên tục theo Hybrid Mode)
  - `autoplay`: `true`
  - `speed`: number (`1.0` - `3.0`, được cập nhật động bởi Lenis Velocity)

### 2. Lenis Scroll Physics Stream (Zustand Store Source)
Nguồn dữ liệu vật lý thời gian thực từ Lenis Scroll Engine thông qua store `useScrollStore`.

- **Fields**:
  - `velocity`: number (Gia tốc cuộn, âm hoặc dương) -> Ánh xạ trực tiếp vào `lottieInstance.setSpeed(speed)`.

## State Transitions & Rules

1. **Idle State**: Khi `velocity == 0`:
   - Lottie phát ở tốc độ bình thường (`speed = 1.0`).
   - Hình học giữ nguyên 100% tỷ lệ gốc.
2. **Active Scroll State**: Khi `Math.abs(velocity) > 0`:
   - Tốc độ phát hoạt hình tăng: `speed = Math.min(3.0, 1.0 + Math.abs(velocity) * 0.02)`.
   - Bảo toàn tỷ lệ hình học gốc của tác phẩm (`scale(1) skew(0)`).
3. **Unmount State**: Khi component bị gỡ khỏi DOM:
   - Gọi `lottieInstance.destroy()` để hủy hoàn toàn context Canvas khỏi bộ nhớ.
