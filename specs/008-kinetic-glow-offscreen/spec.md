# Feature Specification: Kinetic Glow Offscreen Buffer & Bezier Curve Optimization

**Feature**: Kinetic Glow Offscreen Buffer & Bezier Curve Optimization  
**Created**: 2026-08-05  
**Status**: Draft / Spec Ready  

---

## 1. Executive Summary

Mục tiêu của tính năng này là tối ưu hóa hiệu năng đồ họa đồ họa 165 FPS cho hệ thống **Kinetic Strings Canvas** và **Side Art Visual FX** bằng cách thực hiện 3 cải tiến kỹ thuật trọng tâm:
1. Tách lớp Glow tỏa sáng của Kinetic String sang một **Offscreen Buffer Canvas** được downscale xuống tỷ lệ $0.25\times$ (giảm 93.75% pixel rasterization overhead), nhường Canvas chính vẽ duy nhất nét lõi 1px sắc lẹm.
2. Tăng bước lặp uốn sóng $Y$-step từ 1px (hoặc 4px) lên **10px**, kết hợp đường nối cong Bezier (`bezierCurveTo` / `quadraticCurveTo`) mượt mà.
3. Khai tử hoàn toàn file Lottie nặng `public/lotie/gradient_glow.json`. Thay thế bằng thẻ `<div>` CSS `radial-gradient` tăng tốc bởi GPU phần cứng với thuộc tính `will-change: transform`.

## Clarifications

### Session 2026-08-05
- Q: Khi vẽ quầng sáng Glow lên Offscreen Canvas (tỷ lệ 0.25x), độ rộng nét vẽ lineWidth trên Offscreen Canvas nên được cấu hình thế nào để quầng sáng sau khi upscale 4x đạt độ lan tỏa đẹp nhất? → A: Đặt `lineWidth = 2.5px` trên Offscreen Canvas (tương đương quầng sáng tỏa `10px` mượt mà sau khi phóng to $4\times$ lên Canvas chính).

---

## 2. User Scenarios & Acceptance Criteria

### User Flow
- Người dùng cuộn trang hoặc ở trạng thái Idle, hệ thống sợi dây đàn Neon Harmonic bốc bay mượt mà ở tốc độ 165 FPS với độ sắc nét tuyệt đối ở lõi và hiệu ứng mờ mịn mộng mơ ở quầng sáng.
- Không còn bất kỳ sự giật lag hay tụt khung hình nào do render Lottie canvas hoặc stroke đường cong 1px lặp đi lặp lại hàng nghìn bước.

### Acceptance Criteria
- **AC-001 (Offscreen Glow Buffer)**: Lớp quầng sáng Neon được vẽ lên Canvas ẩn trong RAM với độ phân giải $0.25\times$ ($Width \times 0.25, Height \times 0.25$), sau đó `drawImage` phóng to lên Canvas chính với thuộc tính `imageSmoothingEnabled = true`.
- **AC-002 (Bezier Curve Optimization)**: Thuật toán uốn sóng $Y$-step tính toán điểm điều khiển với bước nhảy $10px$, nối các điểm bằng đường cong Bezier thay vì vẽ hàng nghìn đoạn thẳng $1px$, giảm $90\%$ số lượng toán tử vẽ `lineTo`.
- **AC-003 (Lottie Extermination & CSS Replacement)**: Xóa/loại bỏ hoàn toàn tiến trình nạp và phát `public/lotie/gradient_glow.json`. Thay thế bằng 2 thẻ `<div>` dùng `background: radial-gradient(...)` kết hợp `will-change: transform` và `transform: translateZ(0)` ở hai mép màn hình.

---

## 3. Functional Requirements

### FR-001: Offscreen 0.25x Buffer Canvas Engine
- Hệ thống MUST khởi tạo Canvas ẩn trong RAM bằng `document.createElement('canvas')` (với kích thước downscale $0.25 \times \text{width}, 0.25 \times \text{height}$) và tự động cập nhật lại kích thước theo sự kiện `resize`.
- Tất cả các thao tác vẽ đường Glow mờ (`blur`, multi-pass stroke, radial gradient glow) MUST được thực thi trên Offscreen Canvas này.
- Canvas chính MUST nhận kết quả từ Offscreen Canvas thông qua 1 lệnh `ctx.drawImage(offscreenCanvas, 0, 0, mainWidth, mainHeight)` duy nhất và vẽ đè lớp lõi trắng 0.8px-1px sắc nét lên trên.

### FR-002: 10px Y-Step & Smooth Bezier Curve Algorithm
- Thuật toán vòng lặp uốn sóng dọc màn hình MUST bước theo khoảng cách $\Delta y = 10px$.
- Hệ thống MUST sử dụng hàm `quadraticCurveTo` với điểm trung gian (Midpoint) làm Control Point giữa các nấc $10px$, bảo đảm đường cong dẻo quánh, không bị gấp khúc hay răng cưa mà vẫn siêu nhẹ cho GPU/CPU.

### FR-003: Deprecate `gradient_glow.json` & Inject CSS Radial Layer
- Loại bỏ hoàn toàn instance `lottie.loadAnimation()` cho file `gradient_glow.json` trong `ParallaxSides.tsx`.
- Cố định 2 khối `<div>` định vị `fixed` hai bên mép trái/phải với dải màu Neon thương hiệu (Cyan `#00F2FF` bên trái, Magenta `#FF007F` bên phải) sử dụng `mix-blend-screen`, `opacity-60` và `will-change: transform` để GPU compositor đảm nhận 100% việc nhân màu và mượt mà.

---

## 4. Success Criteria

- **SC-001**: Tốc độ khung hình duy trì mượt mà tại **120 - 165 FPS** trên tất cả các màn hình tần số quét cao.
- **SC-002**: Giảm $90\%$ số lần gọi lệnh vẽ vector trong Canvas 2D render loop (từ $Y\mathrel{+}=1$ sang $Y\mathrel{+}=10$).
- **SC-003**: Giảm $93.75\%$ tải Fill Rate/Pixel Rasterization cho lớp hiệu ứng Glow nhờ tỷ lệ nén 0.25x Offscreen Buffer.
- **SC-004**: Hủy bỏ 100% dung lượng nạp và tải CPU của Lottie `gradient_glow.json`.

---

## 5. Assumptions & Constraints

- Khả năng hỗ trợ Canvas `imageSmoothingEnabled` là chuẩn mực trên 100% trình duyệt hiện đại (Chrome, Safari, Firefox, Edge).
- Nét lõi 1px trên Canvas chính luôn được vẽ ở tỷ lệ $1.0\times$ (hoặc Retina DPR) để đảm bảo độ sắc nét lăng kính.
