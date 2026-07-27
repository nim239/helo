# Quickstart & Verification Scenarios: Lottie 2D Motion Side Art Integration

**Feature**: [spec.md](file:///d:/web_portfolio/specs/003-lottie-side-art-scrubbing/spec.md)
**Date**: 2026-07-27

## Prerequisites
- Node.js installed
- Dependencies installed (`npm install`)
- Dev server running (`npm run dev` qua port 3005 hoặc cấu hình trong `package.json`)

## Test Scenario 1: Canvas Renderer & Zero SVG Verification (US1)
1. Mở trình duyệt Chrome/Edge tại http://localhost:3005.
2. Mở DevTools (F12) -> tab Elements -> kiểm tra container của Side Art bên trái và bên phải.
3. Xác nhận hai cụm Side Art được render bằng thẻ `<canvas>` hợp lệ, tuyệt đối **không có** thẻ `<svg>` hay hàng loạt path DOM bên trong container.

## Test Scenario 2: Hybrid Mode Velocity Acceleration & Mechanical Distortion (US2)
1. Trong trình duyệt, quan sát hai cụm Side Art khi không cuộn trang (Idle):
   - Hoạt hình phát lặp nhẹ nhàng ở tốc độ bình thường (1x).
2. Dùng chuột cuộn mạnh trang lên xuống (Scroll Velocity > 0):
   - Quan sát tốc độ phát hoạt hình lập tức tăng tốc lên tới 2x-3x.
   - Quan sát cụm Side Art bị kéo giãn chiều dọc (`scaleY > 1`), bóp chiều ngang (`scaleX < 1`) và nghiêng nhẹ (`skew`) theo gia tốc cuộn.

## Test Scenario 3: Memory Cleanup & Retina DPR Verification (US3)
1. Trên máy tính màn hình Retina hoặc bật chế độ Device Toolbar trong F12 (chọn iPhone / iPad với DPR 2 hoặc 3):
   - Kiểm tra đường nét của hoạt hình 2D trên Canvas phải sắc nét tuyệt đối, không có răng cưa.
2. Mở tab DevTools -> Performance / Memory:
   - Cuộn lên xuống 50 lần, sau đó đo lại heap snapshot, đảm bảo bộ nhớ không bị rò rỉ hoặc tăng bất thường (SC-002).
