# Feature Specification: OffscreenCanvas + Worker Render Pipeline

**Feature Branch**: `009-offscreen-canvas-worker`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "chuyển canvas render sang OffscreenCanvas + Worker"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Smooth Animation Without Jank (Priority: P1)

Khách ghé thăm triển lãm cần trải nghiệm animation dây đàn Kinetic Strings chạy hoàn toàn mượt mà kể cả khi đang cuộn trang nhanh, nhập liệu, hoặc tab đang xử lý tác vụ khác. Hiện tại, toàn bộ phép tính canvas render diễn ra trên Main Thread — cùng nơi xử lý sự kiện bàn phím/chuột/scroll — dẫn đến tình trạng "Main Thread contention": khi scroll, thao tác vẽ canvas tranh chấp CPU slice với GSAP ticker và Lenis, gây frame drop.

Sau tính năng này, engine canvas chạy trên Web Worker riêng biệt. Main Thread chỉ nhận kết quả render đã xong và hiển thị — hoàn toàn không bị chặn bởi tính toán vẽ đường.

**Why this priority**: Đây là lý do cốt lõi của feature — giải phóng Main Thread khỏi tải canvas compute để GSAP Ticker và Lenis scroll chạy ổn định 60-165 FPS.

**Independent Test**: Mở DevTools → Performance tab → Record 3 giây cuộn nhanh. Quan sát Main Thread timeline: không còn Long Task nào có màu đỏ liên quan đến canvas paint/draw.

**Acceptance Scenarios**:

1. **Given** trang đang hiển thị đầy đủ, **When** người dùng cuộn nhanh liên tục trong 5 giây, **Then** animation dây đàn không bị giật (no frame skip > 2 frames liên tiếp).
2. **Given** Main Thread đang bận xử lý event handler, **When** canvas cần vẽ frame mới, **Then** canvas Worker tiếp tục render độc lập mà không chờ Main Thread.
3. **Given** thiết bị single-core hoặc tab bị throttle, **When** canvas Worker đang tính toán phức tạp, **Then** UI vẫn phản hồi sự kiện touch/scroll trong vòng 50ms.

---

### User Story 2 — Identical Visual Output (Priority: P1)

Nhà phát triển và khách xem cần đảm bảo rằng khi engine render chuyển sang Worker, kết quả hình ảnh hiển thị phải hoàn toàn giống với kết quả trước đây — không có sai lệch màu sắc, không mất nét, không thay đổi tốc độ animation.

**Why this priority**: Tính năng này là tối ưu kỹ thuật thuần túy. Nếu kết quả thị giác bị thay đổi, feature thất bại dù hiệu năng có tốt hơn.

**Independent Test**: Chụp screenshot frame animation tại cùng một thời điểm scroll (scrollY = 500) trước và sau migration — so sánh pixel-by-pixel: sai lệch ≤ 1 pixel cho phép do floating-point rounding.

**Acceptance Scenarios**:

1. **Given** animation đang chạy trên Main Thread, **When** chụp frame tại `scrollY=0`, **Then** frame phải đồng nhất với frame chụp từ Worker render tại cùng `scrollY=0`.
2. **Given** animation dây đàn đang biến dạng theo velocity, **When** velocity > 0.5, **Then** trạng thái biến dạng (collapse, ampLerp) trong Worker phải đồng bộ với Main Thread trong vòng 1 frame.
3. **Given** tốc độ animation `time` đang tăng đều, **When** Worker nhận `time` từ Main Thread, **Then** không có hiện tượng "giật ngược" hay "nhảy frame" do lệch đồng hồ.

---

### User Story 3 — Graceful Fallback on Unsupported Browsers (Priority: P2)

Nếu trình duyệt không hỗ trợ `OffscreenCanvas` hoặc `transferControlToOffscreen()` (một số Safari phiên bản cũ, Firefox ESR), hệ thống phải tự động fallback về cơ chế render trực tiếp trên Main Thread — không crash, không hiện lỗi, không mất animation.

**Why this priority**: OffscreenCanvas chưa được hỗ trợ đồng bộ trên 100% trình duyệt. Feature KHÔNG được gây ra blank screen hay lỗi console trên bất kỳ trình duyệt nào đang dùng trong tổng số khách truy cập.

**Independent Test**: Mở Firefox 115 ESR (OffscreenCanvas support: partial) → Tải trang → Kiểm tra: animation vẫn chạy, không có error trong console.

**Acceptance Scenarios**:

1. **Given** trình duyệt không có `OffscreenCanvas` API, **When** component mount, **Then** hệ thống tự động chạy render trực tiếp trên Main Thread (current behavior).
2. **Given** Worker khởi tạo thất bại (lỗi network/CSP), **When** lỗi xảy ra, **Then** hệ thống fallback mượt mà trong < 100ms mà không hiện flash trắng.
3. **Given** trình duyệt hỗ trợ OffscreenCanvas, **When** trang load, **Then** console không có bất kỳ warning hay error nào liên quan đến Worker.

---

### User Story 4 — Synchronized State: Scroll & Velocity (Priority: P2)

Worker cần nhận thông tin `velocity` và `time` từ Main Thread theo thời gian thực để render đúng trạng thái vật lý của dây đàn (biến dạng theo tốc độ cuộn). Kênh giao tiếp phải không bị chặn (non-blocking) và không làm chậm Main Thread.

**Why this priority**: Nếu Worker không nhận được velocity đúng lúc, dây đàn sẽ hiển thị sai trạng thái (không biến dạng khi cuộn nhanh hoặc biến dạng khi đứng yên) — phá vỡ visual concept.

**Independent Test**: Đo thời gian từ khi `velocity` thay đổi trên Main Thread → đến khi canvas render cập nhật trạng thái mới: phải < 1 frame (< 6ms ở 165Hz).

**Acceptance Scenarios**:

1. **Given** người dùng bắt đầu cuộn nhanh, **When** velocity tăng đột ngột, **Then** dây đàn trong Worker nhận velocity mới và cập nhật hình dạng trong frame kế tiếp (≤ 16ms).
2. **Given** Worker đang vẽ frame, **When** Main Thread gửi message velocity mới, **Then** Worker không bị blocked — message đợi trong queue và được xử lý ngay frame kế.
3. **Given** người dùng dừng cuộn, **When** velocity về 0, **Then** dây đàn trong Worker trả về trạng thái nghỉ mượt mà theo đúng LERP_OUT speed (không nhảy đột ngột).

---

### Edge Cases

- Điều gì xảy ra nếu `OffscreenCanvas` được tạo thành công nhưng Worker terminate bất ngờ? → Hệ thống phải detect lỗi và restart Worker hoặc fallback về Main Thread.
- Làm sao xử lý khi `window.innerWidth/Height` thay đổi (resize)? → Main Thread phải thông báo kích thước mới cho Worker qua postMessage để Worker resize canvas buffer đúng.
- Nếu tab bị suspend (background tab throttling), Worker có bị kill không? → Theo spec Web Worker, Worker có thể bị throttle nhưng không bị kill. Cần test và document hành vi thực tế.
- OffscreenCanvas có hỗ trợ `filter: blur()` trong context 2D không? → Hỗ trợ từ Chrome 69+, Firefox 72+. Cần kiểm tra fallback cho Safari.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI chuyển tải phép tính render canvas (vẽ đường cong, particles, gradient) sang một luồng xử lý riêng biệt với Main Thread.
- **FR-002**: Hệ thống PHẢI truyền trạng thái `velocity` và `time` từ Main Thread sang render worker theo tần suất đồng bộ với animation frame (không phải interval cố định).
- **FR-003**: Hệ thống PHẢI tự động phát hiện khả năng hỗ trợ `OffscreenCanvas` của trình duyệt và chọn rendering path phù hợp.
- **FR-004**: Hệ thống PHẢI xử lý resize canvas khi `window.innerWidth` hoặc `window.innerHeight` thay đổi mà không gây visual glitch.
- **FR-005**: Hệ thống PHẢI cleanup Worker (terminate) khi React component unmount để tránh memory leak.
- **FR-006**: Kênh giao tiếp Main Thread ↔ Worker PHẢI là non-blocking — không có `SharedArrayBuffer` lock hay `Atomics.wait()` trên Main Thread.
- **FR-007**: Output hình ảnh render từ Worker PHẢI đồng nhất thị giác với output hiện tại trên Main Thread.
- **FR-008**: Hệ thống PHẢI không phát ra bất kỳ unhandled error nào trong console trên tất cả trình duyệt được hỗ trợ.

### Key Entities

- **Main Thread Controller** (`KineticStringsCanvas.tsx`): Component React chịu trách nhiệm khởi tạo Worker, transfer canvas control, relay scroll state, và manage lifecycle. Không còn chứa logic vẽ.
- **Canvas Render Worker** (`kinetic-strings.worker.ts`): Web Worker độc lập chứa toàn bộ thuật toán vẽ dây đàn (harmonic physics, bezier path, particle system). Không access DOM.
- **State Relay Channel**: Cơ chế giao tiếp một chiều (Main → Worker) dùng `postMessage` để truyền `{ velocity, time, width, height }` mỗi frame.
- **OffscreenCanvas Transfer**: Đối tượng `OffscreenCanvas` được tạo từ `<canvas>` element và transfer ownership sang Worker qua `Transferable`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Animation dây đàn không xuất hiện bất kỳ frame drop nào (drop > 2 frames liên tiếp) khi người dùng cuộn liên tục trong 10 giây trên thiết bị có CPU tải > 60%.
- **SC-002**: Thời gian phản hồi sự kiện touch/click trên Main Thread (Input Delay) giảm xuống dưới **100ms** (từ 363ms hiện tại đo trên Chrome DevTools).
- **SC-003**: "Long Task" trên Main Thread liên quan đến canvas render **không còn xuất hiện** trong Performance profile khi cuộn.
- **SC-004**: Trang hoạt động bình thường (animation hiển thị, không có console error) trên **100% trình duyệt** trong danh sách support: Chrome 80+, Firefox 79+, Edge 80+, Safari 14+.
- **SC-005**: Không phát sinh memory leak — Worker phải được terminate sạch khi component unmount, không có dangling reference sau 30 giây quan sát Memory panel của DevTools.
- **SC-006**: Kích thước bundle JavaScript không tăng quá **20KB** (gzipped) so với trước migration.

---

## Assumptions

- Animation logic hiện tại trong `KineticStringsCanvas.tsx` được giữ nguyên thuật toán (harmonic strings, bezier path, particle system) — chỉ di chuyển sang Worker, không refactor visual.
- `OffscreenCanvas` với `2d` context được ưu tiên; WebGL context nằm ngoài phạm vi spec này.
- Web Worker file được bundled cùng Next.js app sử dụng cơ chế Worker bundling của Next.js (hoặc Webpack 5 Worker syntax `new Worker(new URL('./worker', import.meta.url))`).
- `SharedArrayBuffer` không được dùng do yêu cầu Cross-Origin-Isolation header phức tạp; thay vào đó dùng `postMessage` standard.
- Scroll velocity được relay qua `postMessage` từ GSAP ticker callback — không qua Zustand store subscription (vì Worker không access React/Zustand).
- Feature này áp dụng cho `KineticStringsCanvas` trước; `SpriteAnimation` và `ParticleField` có thể migrate sau trong spec riêng.
