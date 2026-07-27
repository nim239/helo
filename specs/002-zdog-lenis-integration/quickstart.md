# Quickstart & Validation Guide: Zdog x Lenis Integration

**Feature**: [spec.md](file:///d:/web_portfolio/specs/002-zdog-lenis-integration/spec.md)
**Date**: 2026-07-27

## Prerequisites
- Node.js 18+ / pnpm hoặc npm.
- Dependencies dự án đã được cài đặt, bao gồm `zdog`, `@types/zdog`, `gsap`, `lenis`.

## 1. Setup & Launch Server
Chạy lệnh khởi động môi trường phát triển cục bộ:

```bash
npm run dev
```

Truy cập ứng dụng tại địa chỉ `http://localhost:3005` (hoặc cổng được cấu hình trong `package.json`).

## 2. Validation Scenarios

### Scenario A: Kiểm tra Khởi tạo Zdog Canvas 2D (FR-001, FR-002, FR-003)
1. Mở Chrome DevTools (`F12`), chuyển sang tab **Elements**.
2. Kiểm tra phần tử Side Art bên trái (`left-[-27vw]`) và bên phải (`right-[-27vw]`).
3. **Expected Outcome**:
   - Bên trong mỗi wrapper là một thẻ `<canvas>` hợp lệ (không chứa bất kỳ thẻ `<svg>` nào).
   - Các khối Zdog (Polygon, Hemisphere, Box, Cylinder) hiển thị sắc nét với nét viền dày màu neon (`stroke: true`).
   - Thử click chuột vào khối và kéo: Khối **không** bị xoay/di chuyển bởi chuột (do `dragRotate: false`).

### Scenario B: Kiểm tra Vật lý Lenis & Squash/Stretch (FR-004, FR-005, FR-006)
1. Thực hiện cuộn trang (sử dụng con lăn chuột hoặc vuốt touchpad).
2. **Expected Outcome**:
   - Khối Zdog xoay nhanh tỉ lệ thuận với tốc độ cuộn.
   - Khi cuộn gắt (vuốt mạnh với vận tốc cao), khối bị kéo giãn theo chiều dọc (`scale.y > 1`) và bóp nghẹt nhẹ theo chiều ngang (`scale.x, scale.z < 1`), tạo cảm giác biến dạng đàn hồi vật lý.
   - Khi dừng cuộn, khối giảm tốc từ từ theo quán tính của Lenis và trở về trạng thái hình học bình thường (`scale = {1, 1, 1}`).

### Scenario C: Kiểm tra Retina & Debounce Resize (FR-007, FR-008)
1. Mở DevTools -> Tab **Console** / **Performance** hoặc Toggle Device Toolbar (`Ctrl + Shift + M`).
2. Chọn thiết bị có `devicePixelRatio = 2` hoặc `3` (ví dụ: iPhone 14 Pro, MacBook Retina).
3. Thực hiện thay đổi liên tục kích thước cửa sổ trình duyệt (kéo mép cửa sổ).
4. **Expected Outcome**:
   - Khối Zdog không bị nhòe nét trên màn hình Retina.
   - Sự kiện resize không gây giật lag trình duyệt nhờ cơ chế Debounce 200ms.
