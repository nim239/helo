# Research: Lottie 2D Motion Side Art Integration

**Feature**: [spec.md](file:///d:/web_portfolio/specs/003-lottie-side-art-scrubbing/spec.md)
**Date**: 2026-07-27

## Decision 1: Lottie Web Canvas Renderer (`lottie-web`) over SVG/DOM
- **Decision**: Sử dụng thư viện `lottie-web` với cấu hình bắt buộc `renderer: 'canvas'`.
- **Rationale**: 
  - Tuân thủ tuyệt đối **Quy tắc 4 (Performance Principles - FPS là Linh hồn)**: Render Lottie bằng SVG tạo ra hàng trăm DOM nodes (paths, groups) thay đổi thuộc tính 60 lần/giây gây ra hiện tượng Layout Thrashing và sụt giảm FPS trầm trọng trên thiết bị di động.
  - Renderer `canvas` vẽ trực tiếp lên một mặt phẳng bitmap duy nhất, tận dụng khả năng xử lý nhanh gọn của trình duyệt và hỗ trợ `devicePixelRatio` cho màn hình Retina.
- **Alternatives considered**:
  - *SVG Renderer*: Bị loại bỏ do chi phí thao tác DOM quá lớn.
  - *Zdog.js / Three.js*: Bị loại bỏ theo yêu cầu thẩm mỹ mới của dự án (chuyển sang hoạt hình 2D vector).

## Decision 2: Hybrid Playback & Speed Velocity Modulator (Speed Acceleration Only)
- **Decision**: Sử dụng chế độ **Hybrid Mode**: Cho phép Lottie phát loop tự nhiên ở tốc độ chuẩn 1x (`loop: true, autoplay: true`), đồng thời can thiệp tốc độ phát (`setSpeed()`) dựa trên gia tốc cuộn `velocity` từ store `useScrollStore`. Tuyệt đối không làm biến dạng hình học (`scale(1) skew(0)`) để bảo toàn tỷ lệ gốc của tác phẩm nghệ thuật.
- **Rationale**:
  - Giải quyết triệt để nhược điểm của Scrubbing thuần túy (khi người dùng dừng cuộn, Side Art bị đóng băng như ảnh tĩnh).
  - Khi cuộn nhanh, gia tốc cuộn `velocity` tăng vọt khiến Lottie tăng tốc độ phát từ `1x -> 3x` tạo cảm giác động năng mạnh mẽ mà không làm méo mó hình vẽ vector của tác phẩm theo quyết định phỏng vấn `/grill-me`.
- **Alternatives considered**:
  - *Mechanical Distortion (Squash & Stretch & Skew)*: Bị loại theo yêu cầu bảo toàn tỷ lệ hình học gốc của sếp.
  - *Scrubbing 1:1 theo Progress*: Bị loại vì làm đóng băng Side Art khi người dùng dừng cuộn trang.

## Decision 3: Hủy Context Canvas khi Unmount (`instance.destroy()`)
- **Decision**: Gọi `lottieInstance.destroy()` bên trong hàm cleanup của `useEffect`.
- **Rationale**:
  - Tuân thủ FR-005: Ngăn chặn rò rỉ bộ nhớ (Memory Leak), giải phóng hoàn toàn bộ đệm Canvas trong RAM/VRAM khi người dùng ngắt trang hoặc chuyển đổi giao diện.
