# Research: Zdog.js x Lenis Scroll Integration

**Feature**: [spec.md](file:///d:/web_portfolio/specs/002-zdog-lenis-integration/spec.md)
**Date**: 2026-07-27

## Decision 1: Zdog Canvas 2D vs WebGL / SVG
- **Decision**: Sử dụng HTML5 Canvas 2D với thư viện Zdog.js (Pseudo-3D Engine).
- **Rationale**: 
  - Tuân thủ tuyệt đối **Quy tắc 4 (Performance Principles)** và **Quy tắc 9 (Technology Constraints)** của Hiến pháp dự án: Nghiêm cấm WebGL/React Three Fiber vì gây thắt cổ chai VRAM và tụt FPS trên thiết bị di động.
  - Zdog chạy trên Canvas 2D cực kỳ nhẹ, không cần khởi tạo WebGL context, phù hợp hoàn hảo với phong cách Hard Path / Big Stroke / Neon-Brutalism của triển lãm.
- **Alternatives considered**:
  - *SVG Renderer*: Bị loại bỏ vì thao tác DOM SVG trực tiếp ở tần số 144Hz gây áp lực lớn cho CPU và Layout Thrashing.

## Decision 2: Khóa Vòng lặp Gốc & Đồng bộ GSAP Ticker
- **Decision**: Vô hiệu hóa auto-render độc lập của Zdog, gọi thủ công `illo.updateRenderGraph()` bên trong vòng lặp `gsap.ticker`.
- **Rationale**:
  - Tuân thủ nguyên tắc **"1 RAF duy nhất"** trong Hiến pháp dự án (Quy tắc 4): Toàn hệ thống chỉ sử dụng GSAP Ticker để tránh hiện tượng trượt nhịp (frame desync) và lãng phí tài nguyên CPU.
  - Liên kết trực tiếp biến `velocity` và `progress` từ `useScrollStore.getState()` để biến đổi trục xoay (`rotate`) và tỷ lệ giãn (`scale` squash/stretch) của khối 3D mà không gây re-render component React.
- **Alternatives considered**:
  - *requestAnimationFrame riêng cho Zdog*: Bị loại vì vi phạm luật 1 RAF, gây xung đột với luồng Lenis scroll.

## Decision 3: Tối ưu Màn hình Retina & Debounce Resize
- **Decision**: Nhân tỷ lệ tọa độ Canvas theo `window.devicePixelRatio` và áp dụng kỹ thuật Debounce 200ms cho sự kiện `resize`.
- **Rationale**:
  - Đảm bảo các nét vẽ dày (stroke) sắc lẹm trên màn hình Retina/Mobile cao cấp.
  - Chống lag/treo trình duyệt khi người dùng xoay màn hình di động hoặc kéo thả thay đổi kích thước cửa sổ trình duyệt.
