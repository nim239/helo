# Feature Specification: Zdog x Lenis Integration & CSS 3D Prism

**Feature Branch**: `[002-zdog-lenis-integration]`

**Created**: 2026-07-27

**Status**: Draft

**Input**: User description: "GIAI ĐOẠN 1: KHỞI TẠO KHÔNG GIAN (THE ZDOG CANVAS)... BẢN ĐẶC TẢ KỸ THUẬT: PARSING CSS 3D PRISM FROM FIGMA NODE (ANTIGRAVITY ENGINE)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tích hợp Zdog Canvas 2D (Priority: P1)

Với tư cách là người xem triển lãm, tôi muốn nhìn thấy các khối 3D sắc nét ở hai bên màn hình (Side Art) được dựng bằng Zdog.js trên Canvas 2D thay vì WebGL để đảm bảo trải nghiệm mượt mà, không bị giật lag trên mọi thiết bị.

**Why this priority**: Cốt lõi của hệ thống hình ảnh, quyết định hiệu năng của toàn bộ trang web.
**Independent Test**: Có thể kiểm thử độc lập bằng cách mở trang và kiểm tra DOM xem có thẻ Canvas 2D không, các hình khối cơ bản (Hemisphere, Cone, Cylinder, Polygon) có hiển thị với nét viền dày màu neon không.

**Acceptance Scenarios**:
1. **Given** người dùng truy cập trang, **When** trang tải xong, **Then** 2 thẻ Canvas hiển thị ở vị trí Side Art với các khối Zdog nguyên thủy, không dùng SVG.
2. **Given** các khối Zdog đang hiển thị, **When** người dùng cố gắng dùng chuột kéo/xoay khối, **Then** khối không bị xoay (do dragRotate: false).

---

### User Story 2 - Thao túng Vật lý bằng Lenis Ticker (Priority: P1)

Với tư cách là người xem, khi tôi cuộn trang, tôi muốn các khối 3D xoay và biến dạng (squash & stretch) tỉ lệ thuận với vận tốc và tiến trình cuộn, tạo cảm giác chịu lực G-Force bạo lực.

**Why this priority**: Yếu tố cốt lõi tạo nên trải nghiệm tương tác vật lý (Pseudo-3D Engine).
**Independent Test**: Cuộn chuột và đo lường gia tốc cuộn tác động lên góc xoay và tỷ lệ biến dạng của khối Zdog.

**Acceptance Scenarios**:
1. **Given** người dùng đang cuộn trang, **When** tiến trình cuộn (progress) thay đổi, **Then** khối 3D quay quanh trục X và Y tương ứng.
2. **Given** người dùng cuộn cực nhanh, **When** gia tốc (velocity) tăng vọt, **Then** khối 3D bị ép giãn trục Y và bóp nghẹt trục X, Z để bảo toàn thể tích.
3. **Given** Zdog render loop, **When** hệ thống cập nhật frame, **Then** chỉ gọi `updateRenderGraph()` thủ công sau khi tiêm dữ liệu, không dùng auto-render độc lập.

---

### User Story 3 - Tối ưu Hiệu năng Màn hình Retina (Priority: P2)

Với tư cách là người dùng thiết bị cao cấp (Retina/Mobile), tôi muốn các khối 3D luôn sắc lẹm, không bị mờ nhòe, và thao tác thay đổi kích thước cửa sổ không làm treo trình duyệt.

**Why this priority**: Đảm bảo chất lượng hiển thị sắc nét (Anti-aliasing) trên các thiết bị cao cấp.
**Independent Test**: Kiểm tra trên màn hình Retina (Pixel Ratio > 1) và thực hiện resize cửa sổ.

**Acceptance Scenarios**:
1. **Given** hệ thống khởi tạo Zdog, **When** phát hiện `devicePixelRatio`, **Then** kích thước Canvas được nhân lên tương ứng để chống răng cưa.
2. **Given** người dùng xoay ngang màn hình di động hoặc kéo thả cửa sổ trình duyệt, **When** sự kiện resize xảy ra, **Then** hệ thống debounce 200ms trước khi kích hoạt vẽ lại để tránh nghẽn CPU.

## Edge Cases

- What happens when người dùng sử dụng màn hình siêu dài (Ultra-wide) khiến kích thước Canvas vượt quá giới hạn bộ nhớ của trình duyệt?
- How does system handle việc gia tốc cuộn tăng đột biến một cách bất thường (ví dụ: giật chuột wheel quá mạnh)? Trục Y có bị kéo giãn tới mức âm hoặc biến mất không?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST khởi tạo cụm Side Art bằng Zdog.js trên thẻ `<canvas>` (2D context), tuyệt đối không dùng SVG renderer.
- **FR-002**: System MUST sử dụng các primitives cơ bản của Zdog với thuộc tính `stroke: true` (Neo-Brutalism/Flat Shading).
- **FR-003**: System MUST vô hiệu hóa `dragRotate` trên Zdog Illustration.
- **FR-004**: System MUST đồng bộ loop render của Zdog vào GSAP/Lenis Ticker, không dùng `requestAnimationFrame` độc lập.
- **FR-005**: System MUST ánh xạ Progress của Lenis vào trục xoay X và Y của khối Zdog.
- **FR-006**: System MUST ánh xạ Velocity của Lenis vào trục Scale để tạo hiệu ứng Squash & Stretch (kéo giãn Y, bóp nghẹt X/Z).
- **FR-007**: System MUST áp dụng `devicePixelRatio` vào tọa độ Canvas để chống răng cưa.
- **FR-008**: System MUST áp dụng kỹ thuật Debounce (200ms) cho sự kiện Window Resize.

### Key Entities

- **Zdog Illustration**: Thực thể chứa cụm 3D Side Art, quản lý render graph.
- **GSAP Ticker**: Bộ đếm nhịp gốc, cung cấp dữ liệu Progress và Velocity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Hệ thống duy trì ổn định 60-144 FPS ngay cả khi người dùng cuộn trang với vận tốc tối đa.
- **SC-002**: Canvas không bị mờ nhòe trên các thiết bị có `devicePixelRatio >= 2`.
- **SC-003**: Sự kiện thay đổi kích thước cửa sổ không gây ra quá 1 lần render Zdog trong mỗi chu kỳ 200ms.
- **SC-004**: Hiệu ứng Squash & Stretch phải quan sát được bằng mắt thường khi vận tốc cuộn vượt quá ngưỡng nhất định.

## Assumptions

- Trình duyệt của người dùng hỗ trợ HTML5 Canvas 2D đầy đủ.
- GSAP và Lenis đã được thiết lập đúng cách và đang hoạt động ổn định trong dự án.
