# Feature Specification: Lottie 2D Motion Side Art Integration

**Feature**: Lottie 2D Motion Side Art Integration
**Status**: Draft
**Date**: 2026-07-27

## Summary

Thay thế toàn bộ hệ thống Side Art 3D hiện tại bằng các cụm hoạt hình 2D vector động (`.json` / `.lottie`). Hệ thống hiển thị 2D motion ở hai bên mép màn hình, kết nối với dữ liệu vật lý cuộn của trang triển lãm để tương tác với người dùng theo thời gian thực (đồng bộ nhịp cuộn, biến dạng cơ học theo gia tốc) trong khi vẫn bảo đảm hiệu năng khung hình tối đa nhờ hiển thị trên bề mặt Canvas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trải nghiệm Nghệ thuật 2D Side Art Mượt mà (Priority: P1)

Với tư cách là khách tham quan triển lãm số, tôi muốn thấy các cụm nghệ thuật hoạt hình 2D sinh động ở hai bên viền màn hình để tạo cảm giác không gian thị giác cuốn hút, không bị tĩnh đơn điệu mà không làm giảm độ mượt của thao tác cuộn trang.

**Why this priority**: Là yếu tố thẩm mỹ cốt lõi (Visual Storytelling) thay thế cho hệ thống hình khối cũ đã bị loại bỏ.
**Independent Test**: Khách tham quan mở trang trên Desktop và Mobile, thấy hai cụm hoạt hình 2D sắc nét hiển thị ở viền trái/phải và hoạt động mượt mà ở 60-144 FPS.

**Acceptance Scenarios**:
1. **Given** người dùng truy cập triển lãm, **When** trang tải xong, **Then** hai cụm Side Art bên trái và bên phải hiển thị đồ họa hoạt hình 2D rõ nét, không bị giật hay vỡ hạt.
2. **Given** người dùng thao tác kéo chuột hoặc vuốt tay lên cụm Side Art, **When** tương tác xảy ra, **Then** cụm Side Art không cản trở việc cuộn trang (bố trí `pointer-events-none`).

---

### User Story 2 - Tương tác Động năng theo Nhịp Cuộn (Priority: P1)

Với tư cách là khách tham quan, tôi muốn chuyển động của các cụm nghệ thuật 2D phản ứng trực tiếp với hành vi cuộn trang của tôi (tăng tốc độ phát theo tốc độ cuộn) để tạo cảm giác không gian triển lãm sống động và hữu cơ.

**Why this priority**: Tạo kết nối tương tác giữa tay người dùng và phản hồi thị giác trên màn hình theo đúng triết lý của triển lãm.
**Independent Test**: Kiểm tra phản ứng của animation khi người dùng cuộn chậm, cuộn nhanh gắt và khi ngưng cuộn.

**Acceptance Scenarios**:
1. **Given** người dùng cuộn trang triển lãm, **When** tốc độ cuộn thay đổi, **Then** nhịp chuyển động của cụm Side Art áp dụng chế độ **Hybrid Mode** (phát loop tự nhiên khi Idle ở tốc độ 1x, tự động tăng tốc độ phát `speed = 1x -> 3x` khi cuộn nhanh, giữ nguyên tỷ lệ hình học gốc của tác phẩm).
2. **Given** người dùng vuốt/cuộn trang với tốc độ gắt (gia tốc lớn), **When** gia tốc cuộn vượt ngưỡng, **Then** tốc độ phát hoạt hình Side Art tăng vọt tỉ lệ thuận với động năng cuộn trong khi vẫn bảo toàn tuyệt đối tỷ lệ hình học gốc.

---

### User Story 3 - Bảo vệ Bộ nhớ & Độ phân giải Retina (Priority: P2)

Với tư cách là nhà quản trị hệ thống, tôi muốn hệ thống Side Art tự động dọn dẹp bộ nhớ khi chuyển cảnh hoặc ngắt trang và không bao giờ gây rò rỉ bộ nhớ (Memory Leak), đồng thời sắc nét trên mọi thiết bị màn hình độ phân giải cao.

**Why this priority**: Đảm bảo ứng dụng triển lãm hoạt động bền bỉ, không bị treo hoặc crash trình duyệt khi người dùng duyệt lâu.
**Independent Test**: Đo đếm bộ nhớ (Heap Snapshot) sau 50 lần cuộn trang/resizing và kiểm tra trên màn hình Retina (DPR >= 2).

**Acceptance Scenarios**:
1. **Given** người dùng cuộn và thay đổi kích thước cửa sổ trang liên tục trong 15 phút, **When** kiểm tra tài nguyên hệ thống, **Then** mức tiêu thụ bộ nhớ RAM/VRAM ổn định, không gia tăng vô hạn.
2. **Given** người dùng dùng thiết bị màn hình Retina (iPhone, MacBook Pro), **When** xem cụm Side Art, **Then** nét vẽ vector sắc lẹm nhờ độ phân giải Canvas chuẩn `devicePixelRatio`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render hoạt hình 2D Side Art trên bề mặt Canvas bằng cách nhúng 2 lớp Lottie động (`Sparkles.json` phía sau, `man running.json` phía trước) từ thư mục `public/lotie/` cho cả 2 bên trái và phải (tuyệt đối không render DOM/SVG nodes để tránh Layout Thrashing).
- **FR-002**: System MUST ngăn chặn quyền tự phát độc lập của engine hoạt hình (khóa autoplay/default loop) để đặt quyền kiểm soát nhịp thời gian dưới sự điều khiển của bộ đếm nhịp gốc triển lãm (Antigravity Ticker).
- **FR-003**: System MUST đồng bộ hóa tốc độ hoạt hình theo thông số cuộn thời gian thực của người dùng (Scroll Velocity).
- **FR-004**: System MUST điều chỉnh tốc độ phát hoạt hình (`setSpeed`) tỉ lệ thuận với gia tốc cuộn thời gian thực (Speed Acceleration Only) mà không làm biến dạng tỷ lệ hình học gốc của tác phẩm.
- **FR-005**: System MUST hủy (destroy/dispose) hoàn toàn context Canvas và tài nguyên hoạt hình khi component bị unmount hoặc gỡ khỏi DOM để ngăn chặn Memory Leak.
- **FR-006**: System MUST tự động điều chỉnh tỷ lệ điểm ảnh theo màn hình thiết bị (`devicePixelRatio`) và áp dụng container responsive để chống răng cưa trên Retina mà không che khuất màn hình Mobile.

### Key Entities

- **Side Art Motion Instance**: Thực thể quản lý vòng đời, khung hình và bề mặt Canvas của file hoạt hình 2D tải từ `public/lottie/`.
- **Velocity Speed Modulator**: Trình ánh xạ gia tốc cuộn `velocity` vào hàm điều chỉnh tốc độ phát `setSpeed()` của Lottie.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Hệ thống duy trì tốc độ khung hình ổn định từ 60 FPS đến 144 FPS trên cả Desktop và Mobile trong suốt quá trình cuộn liên tục.
- **SC-002**: Mức tiêu thụ bộ nhớ RAM không tăng vượt quá 10MB sau 50 lần cuộn trang từ đầu đến cuối triển lãm.
- **SC-003**: Độ trễ giữa thao tác vuốt cuộn của người dùng và phản hồi biến dạng (Squash/Stretch/Skew) của Side Art là 0ms (đồng bộ nhịp 1:1).
- **SC-004**: Không có bất kỳ lỗi "Canvas context limit exceeded" hoặc vỡ đồ họa nào xuất hiện trên Console trình duyệt.

## Assumptions

- Các file hoạt hình 2D (`.json` / `.lottie`) đã được tối ưu hóa dung lượng (dưới 500KB/file) và không chứa các layer hiệu ứng nặng không tương thích với Canvas 2D (như Gaussian Blur phức tạp hoặc 3D camera trong After Effects).
- Hệ thống Antigravity Ticker hiện tại sẵn sàng cung cấp dữ liệu `scrollProgress` và `velocity` với tần số cao (144Hz).
