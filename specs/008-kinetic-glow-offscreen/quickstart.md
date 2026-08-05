# Quickstart Validation Guide: Kinetic Glow Offscreen Buffer & Bezier Curve Optimization

Guide này hướng dẫn cách kiểm thử và xác minh tính năng tối ưu hóa Offscreen Glow Buffer, Bezier Curve 10px Y-Step và loại bỏ Lottie `gradient_glow.json`.

---

## 1. Prerequisites

- Node.js 18+ đã cài đặt.
- Dev server đang chạy (`npm run dev`).
- Mở trình duyệt Web at `http://localhost:3000`.

---

## 2. Validation Scenarios

### Scenario 1: Kiểm Tra Offscreen 0.25x Canvas Buffer & FPS

**Mục tiêu:** Đảm bảo lớp Glow được render mượt mà qua Offscreen Canvas ở 0.25x và duy trì 165 FPS.

**Các bước:**
1. Truy cập trang web `http://localhost:3000`.
2. Di chuyển chuột hoặc cuộn trang để kích hoạt chuyển động dây đàn ở hai biên trái/phải.
3. Quan sát con trỏ chuột Custom Cursor HUD hoặc DevTools Console.
4. **Kết quả mong đợi:**
   - Chỉ số FPS duy trì ổn định ở mức **144 - 165 FPS** trên màn hình high-refresh rate.
   - Nét lõi dây đàn sắc lẹm $1px$, quầng sáng tỏa mờ mịn mộng mơ bên dưới mà không bị nhòe vỡ hay giật lag.

---

### Scenario 2: Kiểm Tra 10px Y-Step Bezier Curve Smoothness

**Mục tiêu:** Xác minh thuật toán uốn sóng $10px$ với đường cong Bezier mềm mại, không có hiện tượng nếp gấp hay gấp khúc.

**Các bước:**
1. Mở DevTools Console (F12) hoặc inspect element trên Canvas 2D.
2. Kiểm tra mã nguồn `components/KineticStringsCanvas.tsx`.
3. **Kết quả mong đợi:**
   - Vòng lặp vẽ uốn sóng bước nhảy `y += 10`.
   - Sử dụng lệnh `quadraticCurveTo` kết hợp điểm Midpoint.
   - Các đường cong uốn lượn liên tục, chuyển động tự nhiên như dải lụa/dây đàn guitar.

---

### Scenario 3: Xác Nhận Khai Tử Lottie & Kiểm Tra CSS Radial Layer

**Mục tiêu:** Đảm bảo `gradient_glow.json` bị xóa hoàn toàn khỏi tiến trình tải và thay thế bằng CSS GPU Compositing.

**Các bước:**
1. Mở DevTools -> Network tab. Filter theo từ khóa `gradient_glow` hoặc `.json`.
2. Tải lại trang (F5 / Cmd+R).
3. Inspect hai biên màn hình (Elements tab).
4. **Kết quả mong đợi:**
   - **Network Tab:** Không có bất kỳ request nào tới `gradient_glow.json` hay `public/lotie/gradient_glow.json`.
   - **Elements Tab:** 2 thẻ `div` với `radial-gradient` sở hữu thuộc tính CSS `will-change: transform` và `mix-blend-screen` hiển thị hoàn hảo ở 2 mép màn hình.
