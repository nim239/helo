# 📌 BÁO CÁO TỔNG HỢP PHIÊN LÀM VIỆC (24/07)

**Dự án**: 001-Exhibition Portfolio  
**Mục tiêu chính**: Tối ưu hiệu năng 144Hz–165Hz, loại bỏ WebGL gây lag, tinh chỉnh chuyển động Easy-In-Out, và hoàn thiện bố cục Responsive Parallax Sides.

---

## 🛠️ 1. Pivoting Kỹ Thuật (FPS Trên Hết)
* **Loại bỏ WebGL Refraction**: Ngừng sử dụng `<RefractionSprite />` (R3F Canvas) do vắt kiệt GPU (18 FPS) và tốn VRAM trên thiết bị di động.
* **Khôi phục 2D CSS Sprite**: Quay lại dùng `<SpriteAnimation />` (dịch chuyển `background-position` theo percentage). Đạt chuẩn **144Hz–165Hz** mượt mà trên mọi thiết bị.

---

## 🌊 2. Chuyển Động & Vật Lý Cuộn (Lenis Physics)
* **Thời gian cuộn**: Cấu hình `duration: 4.5s` cho cuộn tay và `duration: 5.0s` cho tự động Snap.
* **Đường cong EaseInOut**: Sử dụng hàm gia tốc `easeInOutCubic` — `(t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2` (Chậm vào ➔ Tăng đà ➔ Chậm ra), xoá bỏ hiện tượng trượt vèo chóng mặt.
* **Tốc độ vuốt Mobile**: Giảm `touchMultiplier: 0.6` và `wheelMultiplier: 0.8` giúp cảm giác lướt chạm nặng, đầm và sang trọng.

---

## 📐 3. Bố Cục Responsive Parallax (`ParallaxSides.tsx`)
* **Thiết lập Anchor Point (Không Crop Art)**:
  * Cột bên trái: Căn phải (`object-right` / `justify-end`).
  * Cột bên phải: Căn trái (`object-left` / `justify-start`).
  * Giữ trọn vẹn 100% hình khối Art 3D ở mép trong tiếp giáp nội dung.
* **Tách biệt Breakpoint**:
  * **Mobile (`< md`)**: Chuẩn **Vạch Vàng** (`left-[-10vw] w-[50vw]`), ôm sát khung hình đứng.
  * **Desktop (`md:`)**: Chuẩn **Vạch Xanh** thò đúng **1.5/10 chiều ngang màn hình** (~15vw = 285px tại 1920x1080), phần ngoài xé lề tràn ra ngoài viền (`left-[-13vw] w-[28vw]`).

---

## ⚡ 4. Đồng Bộ Hệ Thống & Sửa Lỗi (Bugfixes)
* **Loại bỏ Dual-RAF**: Gộp vòng lặp `CustomCursor.tsx` và `ParallaxSides.tsx` Gyro vào chung **1 GSAP Ticker** duy nhất.
* **Fix Stacking Context**: Bổ sung CSS `isolate` cho `<MediaVideo />` bảo toàn hiển thị poster `-z-10`.
* **Fix Pointer Leakage**: Tự động gắn `pointer-events: none` cho `<EnterOverlay />` sau khi thu nhỏ.
* **Fix ReferenceError**: Khắc phục lỗi biến `centerX` chưa khai báo trong `SpriteAnimation.tsx`.

---

> *Đã cập nhật đồng bộ vào `README.md` Dev Journal và Hiến pháp dự án (`constitution.md`). Code đã được Commit & Push lên nhánh `001-exhibition-portfolio`.*
