# BẢN ĐẶC TẢ TỐI ƯU HÓA HIỆU NĂNG TẦNG CSS & MAIN THREAD

**Mục tiêu:** Đạt tối đa 165 FPS, triệt tiêu độ trễ Main Thread và tối ưu hóa VRAM.

## 1. TỐI ƯU HÓA CSS OBJECT MODEL (CSSOM)

### 1.1. Cách ly không gian tính toán (Composite Layers & Hardware Acceleration)
* **Vấn đề:** Các animation liên tục nếu xử lý trên Main Thread sẽ gây quá tải CPU và kích hoạt Layout Shift.
* **Giải pháp:** 
  * Tuyệt đối chỉ sử dụng thuộc tính `transform` (`translate3d`, `scale`) và `opacity` cho các chuyển động.
  * Khai báo `will-change: transform;` hoặc `transform: translateZ(0);` tại các phần tử có tần suất chuyển động cao (Sprite animation, Parallax elements). Lệnh này sẽ buộc trình duyệt tách các phần tử đó ra một layer riêng (Composite Layer) để giao hoàn toàn cho GPU xử lý độc lập.

### 1.2. Kỹ thuật loại bỏ Render (CSS Culling / Content Visibility)
* **Vấn đề:** Trình duyệt lãng phí tài nguyên để tính toán layout cho các Section không nằm trong Viewport.
* **Giải pháp:** 
  * Áp dụng thuộc tính `content-visibility: auto;` vào các thẻ bọc Section.
  * Kết hợp `contain-intrinsic-size` để khai báo chiều cao giả định, giúp thanh cuộn không bị sai lệch. Trình duyệt sẽ tự động bỏ qua toàn bộ quá trình render nội dung bên trong đối với các Section đang khuất tầm nhìn, tiết kiệm lượng lớn bộ nhớ.

### 1.3. Đóng băng tương tác vật lý (Pointer-Events Optimization)
* **Vấn đề:** Ở tần số quét 120Hz-165Hz, khi người dùng cuộn nhanh, trình duyệt liên tục phải tính toán trạng thái `:hover` khi con trỏ lướt qua các phần tử, gây hiện tượng khựng khung hình (micro-stutters).
* **Giải pháp:** 
  * Thiết lập logic bắt sự kiện gia tốc của Lenis: Khi Velocity > 0, thêm class `.is-scrolling` vào thẻ `<body>`.
  * Định nghĩa quy tắc CSS: `body.is-scrolling * { pointer-events: none !important; }`. Toàn bộ tương tác sẽ bị đóng băng khi đang cuộn và mở khóa ngay lập tức khi vận tốc về 0.

### 1.4. Tối ưu luồng dữ liệu truyền tải (CSS Variables Pipeline)
* **Vấn đề:** Liên tục cập nhật inline-styles thông qua JS (GSAP) trực tiếp vào từng phần tử DOM gây phình to cấu trúc và kích hoạt Recalculate Style lặp lại.
* **Giải pháp:** 
  * Xây dựng hệ thống truyền data một chiều: GSAP chỉ cập nhật một biến CSS duy nhất (ví dụ: `--scroll-progress`) vào thẻ Container gốc.
  * Các phần tử con sử dụng hàm `calc()` để tự động nội suy vị trí của mình dựa trên biến số này.

---

## 2. TỐI ƯU HÓA BỘ NHỚ VÀ MAIN THREAD (RESOURCES & SCRIPTING)

### 2.1. Giải mã hình ảnh bất đồng bộ (Async Image Decoding)
* **Vấn đề:** Trình duyệt sử dụng Main Thread để giải mã các chuỗi ảnh Sprite và ảnh Parallax kích thước lớn, gây ra hiện tượng blocking.
* **Giải pháp:** 
  * Bổ sung thuộc tính `decoding="async"` vào toàn bộ các tài nguyên hình ảnh nặng.
  * Cấu hình `<link rel="preload" as="image">` cho khung hình đầu tiên của Sprite để đảm bảo LCP (Largest Contentful Paint) đạt tốc độ tối đa, loại bỏ hoàn toàn độ trễ hiển thị ở giây đầu tiên.

### 2.2. Chiến lược nạp Typography (Font Display Swap)
* **Vấn đề:** Font chữ custom chưa nạp xong sẽ dẫn đến hiện tượng FOIT (văn bản bị ẩn) hoặc xô lệch layout (Cumulative Layout Shift) làm sai lệch tọa độ cuộn của hệ thống.
* **Giải pháp:** Cấu hình `font-display: swap` bên trong `@font-face`. Trình duyệt sẽ hiển thị ngay lập tức bằng font hệ thống và chuyển đổi mượt mà sang font chính thức sau khi tải xong, bảo toàn 100% bố cục gốc.

### 2.3. Trì hoãn các tác vụ thứ cấp (requestIdleCallback)
* **Vấn đề:** Việc thực thi các scripts tracking, analytics hoặc các tính toán thứ cấp ngay lúc khởi tạo làm nghẽn cổ chai Main Thread.
* **Giải pháp:** Gói gọn toàn bộ các logic không thiết yếu vào API `requestIdleCallback`. Trình duyệt sẽ chỉ thực thi các đoạn mã này trong những khoảng thời gian nhàn rỗi (idle periods) của CPU, đảm bảo trải nghiệm cuộn ở 165FPS không bị gián đoạn.
