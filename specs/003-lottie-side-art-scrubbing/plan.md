# Implementation Plan - Lottie 2D Motion Side Art Integration

Tích hợp hệ thống Side Art 2D bằng thư viện Lottie-web (`lottie-web`) chạy trên bề mặt Canvas 2D, áp dụng cơ chế **Hybrid Mode** (phát loop tự động khi Idle + tăng tốc độ phát và biến dạng hình học theo gia tốc cuộn `velocity` của Lenis Scroll) nhằm tạo ra trải nghiệm nghệ thuật sống động 60-144 FPS trên mọi thiết bị.

## Proposed Changes

### Core Integration & Component Refactoring

#### [MODIFY] [ParallaxSides.tsx](file:///d:/web_portfolio/components/ParallaxSides.tsx)

- **Thay thế Zdog 3D Engine bằng Lottie Canvas 2D**:
  - Gỡ bỏ các lệnh khởi tạo `Zdog.Illustration` và khối nguyên thủy (Polygon, Box, Cylinder...).
  - Nhúng thư viện `lottie-web` và tạo 2 layer Canvas chồng lên nhau cho mỗi bên mép (Trái & Phải): Layer phía sau tải `public/lotie/Sparkles.json`, Layer phía trước tải `public/lotie/man running.json` với thuộc tính `renderer: 'canvas'`.
- **Triển khai Hybrid Mode Motion Physics (Speed Acceleration Only)**:
  - Cho phép cả 4 Lottie instances phát loop (`loop: true, autoplay: true`).
  - Trong nhịp `gsap.ticker.add(renderLoop)`, trích xuất `velocity = useScrollStore.getState().velocity || 0`.
  - Điều chỉnh tốc độ phát đồng thời cho 4 Lottie instances (`setSpeed(speed)`) trong đó `speed = Math.min(3.0, 1.0 + Math.abs(velocity) * 0.02)`.
  - Giữ nguyên 100% tỷ lệ hình học gốc theo quyết định phỏng vấn `/grill-me`, không áp dụng biến dạng `scale` hay `skew`.
- **Tối ưu hóa Màn hình Retina & Cleanup Bộ nhớ**:
  - Tự động áp dụng `window.devicePixelRatio` vào độ phân giải Canvas của Lottie.
  - Hủy hoàn toàn cả 4 instances Lottie (`instance.destroy()`) khi component unmount theo đúng FR-005.

### Package Configuration

#### [MODIFY] [package.json](file:///d:/web_portfolio/package.json)

- Thêm gói phụ thuộc `lottie-web` (`^5.12.2`) và `@types/lottie-web`.
- Gỡ bỏ hoàn toàn gói phụ thuộc cũ: `zdog` và `@types/zdog` (`npm uninstall zdog @types/zdog`).

## Verification Plan

### Automated Tests
- Kiểm tra kiểu dữ liệu TypeScript và build thành công bằng `npx tsc --noEmit` hoặc `npm run build`.

### Manual Verification
- Thực hiện theo 3 kịch bản kiểm thử định nghĩa tại [quickstart.md](file:///d:/web_portfolio/specs/003-lottie-side-art-scrubbing/quickstart.md):
  1. **Canvas Renderer Verification**: Kiểm tra DOM đảm bảo không có thẻ `<svg>` nào bị render.
  2. **Hybrid Motion Physics**: Cuộn trang nhanh để xác nhận tốc độ phát hoạt hình tăng vọt (1x -> 3x) kèm hiệu ứng biến dạng Squash/Stretch/Skew.
  3. **Memory Cleanup & Retina**: Soi nét viền trên màn hình DPR >= 2 và đảm bảo không có rò rỉ bộ nhớ sau nhiều lần cuộn.
