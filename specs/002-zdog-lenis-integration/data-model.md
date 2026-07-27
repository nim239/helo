# Data Model: Zdog x Lenis Integration

**Feature**: [spec.md](file:///d:/web_portfolio/specs/002-zdog-lenis-integration/spec.md)
**Date**: 2026-07-27

## Entities & Transient State

### 1. Zdog Illustration State (Transient Ref)
Quản lý toàn bộ cấu trúc đồ họa 3D lơ lửng tại 2 bên màn hình (Side Art), không lưu vào React State để đảm bảo hiệu năng 144Hz.

- **Attributes**:
  - `element`: HTMLCanvasElement (`canvasRef.current`)
  - `zoom`: number (`1.0`)
  - `dragRotate`: boolean (`false` - Niêm phong thao tác chuột)
  - `rotate`: `{ x: number, y: number, z: number }` (được cập nhật động mỗi frame bởi Lenis Velocity/Progress)
  - `scale`: `{ x: number, y: number, z: number }` (biến dạng Squash & Stretch theo Velocity)

### 2. Lenis Scroll Physics Stream (Zustand Store Source)
Nguồn dữ liệu vật lý thời gian thực từ Lenis Scroll Engine thông qua store `useScrollStore`.

- **Fields**:
  - `scrollProgress`: number (`0.0` - `1.0`) -> Ánh xạ vào trục xoay cơ bản `rotate.x`, `rotate.y`
  - `velocity`: number (Gia tốc cuộn, âm hoặc dương) -> Ánh xạ vào trục `scale.y` (ép giãn) và `scale.x`, `scale.z` (bóp nghẹt để bảo toàn thể tích)

## State Transitions & Rules

1. **Idle State**: Khi `velocity == 0`, khối Zdog xoay chậm theo tốc độ idle tự nhiên (`rotate.y += 0.005`), `scale` giữ nguyên `{ x: 1, y: 1, z: 1 }`.
2. **Active Scroll State**: Khi `Math.abs(velocity) > 0`, động năng được bơm trực tiếp vào góc xoay và tỷ lệ biến dạng:
   - `rotate.x += velocity * k1`
   - `scale.y = 1 + Math.abs(velocity) * k2`
   - `scale.x = scale.z = 1 / Math.sqrt(scale.y)` (Bảo toàn thể tích hình học)
3. **Resize State**: Debounce 200ms trước khi cập nhật lại kích thước Canvas theo `devicePixelRatio`.
