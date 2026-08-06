# Feature Specification: Hyperspace Warp Engine

**Feature Branch**: `010-hyperspace-warp-engine`

**Created**: 2026-08-06

**Status**: Draft

---

## Clarifications

### Session 2026-08-06

- Q: Khi đang WARPING và user scroll nhẹ/dừng, hệ thống exit như thế nào? → A: Drain tự nhiên theo friction — exit chỉ khi warp pool về 0 (không có hard exit riêng, không trigger theo velocity hay direction)
- Q: Cubi trong warp scene hiển thị như thế nào? → A: Dùng `SpriteAnimation` hiện có, lerp biên độ xuống ~10-15% giá trị gốc (KHÔNG về 0 — Cubi phải vẫn bay qua bay lại), bay vùng 1/2 trên màn hình ngược chiều velocity; tốc độ play sprite giữ nguyên theo logic hiện tại (liên quan scrollY)
- Q: Cơ chế DOM culling khi warp nên dùng `opacity:0` hay `display:none`? → A: Cần benchmark cả 2; implement thử cả A (`opacity:0`) và B (`display:none`) — chọn cái nào cho FPS thực tế cao hơn trên i7-7700

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Warp Trigger qua Friction Accumulator (Priority: P1)

Người xem đang cuộn qua các section portfolio. Khi họ cuộn nhanh và liên tục (vuốt hoặc lăn chuột dồn dập), hệ thống âm thầm tích lũy năng lượng vào một "Warp Pool". Nếu user duy trì nhịp cuộn đủ mạnh trong đủ thời gian để vượt ngưỡng kỳ dị (Warp Threshold), toàn bộ màn hình chuyển đổi sang chế độ Hyperspace Warp.

**Why this priority**: Đây là core mechanic của toàn tính năng.

**Independent Test**: Cuộn mạnh liên tục ~2 giây, kiểm tra `currentPhase === 'WARPING'` trong Zustand store.

**Acceptance Scenarios**:

1. **Given** user đang scroll bình thường, **When** velocity dưới ngưỡng tích lũy, **Then** warp pool drain dần về 0 và không kích hoạt
2. **Given** user cuộn liên tục dồn dập trong ~1.5-2s, **When** warp pool vượt `WARP_THRESHOLD`, **Then** state machine chuyển sang `WARPING`, warp scene xuất hiện mượt mà
3. **Given** đang trong WARPING mode, **When** user dừng cuộn hoàn toàn, **Then** warp pool drain tự nhiên theo friction mỗi frame — state chỉ exit về `IDLE` khi pool chạm 0; không có hard-exit theo velocity hay direction flip

---

### User Story 2 - Warp Scene Render (Priority: P1)

Khi warp kích hoạt, full-screen canvas overlay che tất cả sections DOM, chỉ lộ dây kinetic 2 bên và Cubi. Speed lines (particles) bắn ngược chiều scroll tạo cảm giác Hyperspace Jump. Mục tiêu tối thượng: tăng FPS thật sự.

**Why this priority**: Visual là lý do tồn tại của tính năng này.

**Acceptance Scenarios**:

1. **Given** WARPING active, **When** render loop chạy, **Then** overlay canvas full-screen xuất hiện, các section DOM bị ẩn ngay
2. **Given** warp overlay active, **When** frame được render, **Then** 80-150 speed line particles bay ngược chiều scroll, Cubi ở trung tâm với floating animation nhẹ, kinetic strings 2 bên vẫn visible
3. **Given** warp scene đang chạy, **When** đo FPS thực tế, **Then** FPS tăng ít nhất 10-20 frames so với render đầy đủ sections
4. **Given** user exit warp, **When** warp level về 0, **Then** warp overlay fade out trong 0.5s, sections DOM fade trở lại

---

### User Story 3 - Warp Energy Gauge trên Cursor (Desktop) (Priority: P2)

Vòng tròn FPS cursor được chia thành 2 nửa bán nguyệt. Nửa trên (180°) là FPS gauge — max 100FPS = 50% cung tròn. Nửa dưới (180° flip ngược) là Warp Energy Gauge hiển thị mức warp pool (0-100%). Màu sắc và pulse animation theo mức độ năng lượng.

**Why this priority**: Feedback trực quan để user hiểu cơ chế và "chơi" với tính năng.

**Acceptance Scenarios**:

1. **Given** warp pool < 30%, **When** render, **Then** warp gauge màu xanh/tím lạnh, fill nhỏ
2. **Given** warp pool 30-80%, **When** render, **Then** warp gauge đổi màu orange-red, pulse tăng tốc
3. **Given** warp pool = 100%, **When** kích hoạt warp, **Then** burst animation toàn vòng cursor, scale up
4. **Given** cursor trên PC, **When** xem HUD, **Then** đọc rõ cả FPS và Warp% đồng thời (no overlap)

---

### User Story 4 - Mobile Auto-FPS Overlay & Fix 5-tap Bug (Priority: P2)

Trên mobile, khi warp kích hoạt: FPS overlay tự động hiển thị dưới logo. Sửa bug 5-tap không hoạt động hiện tại.

**Acceptance Scenarios**:

1. **Given** user đang dùng mobile, **When** warp trigger bắn, **Then** FPS overlay tự động xuất hiện dưới logo
2. **Given** warp kết thúc trên mobile, **When** state về IDLE, **Then** FPS overlay tự động ẩn sau 3 giây
3. **Given** user tap vào vùng logo trên mobile, **When** tap đúng 5 lần trong 2.5s, **Then** FPS overlay toggle (bug fix — kiểm tra `fps-tap-zone` bị element khác block hay không)

---

### User Story 5 - Enhanced Cursor HUD Visual Indicators (Priority: P3)

Cursor widget scale lớn hơn trên PC, thêm visual indicators phụ cho FPS và Warp level (labels, colors, mini bars) thay vì chỉ số trần.

**Acceptance Scenarios**:

1. **Given** cursor trên PC, **When** xem ở 1080p+, **Then** widget đủ lớn và dễ đọc
2. **Given** HUD hiển thị FPS, **When** render, **Then** có ít nhất 1 visual indicator phụ (màu sắc, bar, icon)
3. **Given** HUD hiển thị Warp gauge, **When** render, **Then** có label rõ "WARP" và percentage

---

### Edge Cases

- Alt+tab giữa chừng warp: warp pool reset về 0, scene dừng ngay
- FPS < 20 khi warp bật: giảm particle count (LOD) hoặc tự exit warp
- Lenis đang snap khi warp trigger: hủy snap để tránh conflict
- DOM section đang animate khi warp trigger: pause animation ngay

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI duy trì Warp Pool (float 0-1) cập nhật mỗi animation frame, tăng theo scroll velocity, decay theo hệ số ma sát cố định mỗi frame — không có hard-exit theo velocity = 0 hay direction flip
- **FR-001b**: WARPING state chỉ exit khi Warp Pool decay về 0 (natural drain) — không có threshold exit thứ 2; tránh oscillation giữa WARPING và IDLE
- **FR-002**: Khi Warp Pool ≥ WARP_THRESHOLD (mặc định: 0.85), State Machine PHẢI chuyển sang `WARPING` state trong Zustand store
- **FR-003**: Khi `WARPING` active, PHẢI render full-screen overlay canvas che toàn bộ màn hình (z-index cao nhất)
- **FR-004**: Warp overlay PHẢI render speed lines ngược chiều scroll (80-150 particles tùy FPS LOD)
- **FR-005**: Khi `WARPING` active, PHẢI tắt toàn bộ section content DOM để giải phóng render budget (chỉ giữ KineticStringsCanvas + warp overlay + SpriteAnimation); implement cả 2 phương án `opacity:0` (A) và `display:none` (B) với flag toggle để benchmark FPS thực tế trên i7-7700 — chọn phương án cho FPS cao hơn làm default
- **FR-006**: Trong warp scene, Cubi sprite (`SpriteAnimation`) hiện có PHẢI được giữ lại — khi warp pool tăng, biên độ quỹ đạo sin/cos lerp xuống ~10-15% giá trị gốc (không về 0 — Cubi PHẢI vẫn bay qua bay lại sinh động), Cubi dịch vào vùng 1/2 trên màn hình và có offset Y đảo dấu velocity tạo cảm giác bay ngược chiều scroll; tốc độ play sprite frame giữ nguyên theo logic scrollY hiện tại
- **FR-007**: Warp gauge (nửa dưới cursor ring trên PC) PHẢI hiển thị Warp Pool level và đổi màu theo mức độ
- **FR-008**: Trên mobile, khi `WARPING` kích hoạt, FPS overlay PHẢI tự động hiển thị mà không cần user input
- **FR-009**: Bug 5-tap FPS overlay trên mobile PHẢI được fix
- **FR-010**: `ScrollPhase` enum PHẢI được mở rộng thêm `'WARPING'` state trong Zustand store
- **FR-011**: Particle count PHẢI scale tự động theo FPS thực đo (LOD system)
- **FR-012**: Warp Pool PHẢI reset về 0 và exit WARPING khi document bị hidden
- **FR-013**: Cursor widget trên PC PHẢI scale lớn hơn, readable ở 1080p+
- **FR-014**: FPS và Warp% trên HUD PHẢI có visual indicators phụ bên cạnh số

### Key Entities

- **WarpPool**: Float 0-1, tích lũy từ velocity, decay mỗi frame
- **WarpThreshold**: Hằng số 0.85 — mức để trigger WARPING
- **WarpParticle**: {position, velocity, length, alpha, color} — mỗi speed line
- **ScrollPhase (mở rộng)**: `'IDLE' | 'SCROLLING' | 'SNAPPING' | 'WARPING'`
- **CubiAnchor**: Vị trí và animation state của Cubi trong warp scene

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Warp trigger đạt được tự nhiên bằng cách cuộn nhanh liên tục 1.5-2.5 giây, không cần hướng dẫn
- **SC-002**: FPS trong warp scene cao hơn FPS khi scroll thường ít nhất 10 frames (do culling DOM)
- **SC-003**: Warp transition (vào và ra) ≤ 500ms, không có visual pop/flash
- **SC-004**: Cursor warp gauge hiển thị đúng warp pool level với độ trễ ≤ 1 frame
- **SC-005**: Bug 5-tap mobile fix — 100% thành công khi tap đúng 5 lần trong 2.5s
- **SC-006**: Mobile FPS overlay xuất hiện ≤ 100ms sau WARPING state active
- **SC-007**: Toàn bộ warp engine chạy ≥ 50FPS trên i7-7700

---

## Assumptions

- Zustand `ScrollPhase` sẽ được mở rộng thêm `'WARPING'` — không breaking change với các component hiện tại
- Lenis velocity từ `useScrollStore.velocity` là nguồn input chính cho Warp Pool accumulator
- Cubi được hiển thị bằng `SpriteAnimation` component hiện có — không cần asset mới
- Khi warp: biên độ X/Y trong `getTrajectory()` bị scale xuống ~10-15% (không về 0), Cubi vẫn bay sinh động nhưng với biên độ nhỏ hơn nhiều; tốc độ frame sprite vẫn gắn với scrollY như logic hiện tại
- `ScrollTrigger` của Cubi không bị kill khi warp — warp pool làm amplitude multiplier real-time
- DOM culling: cần benchmark cả `opacity:0` và `display:none` — implement flag `WARP_CULL_METHOD` để so sánh FPS dễ dàng
- Warp overlay là component mới `WarpOverlay.tsx` mount tại root layout, hidden khi không warping
- KineticStringsCanvas vẫn visible trong warp scene (không thay đổi component đó)
- 5-tap bug nguyên nhân nghi vấn: element có z-index cao hơn block pointer events — cần verify trong DOM inspector
- Cursor HUD scale up không ảnh hưởng hitbox vì toàn bộ là `pointer-events-none`
- Zero-cost constraint: không thêm bất kỳ thư viện trả phí hoặc CDN trả phí nào
