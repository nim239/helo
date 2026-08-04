# Feature Specification: Kinetic Neon Strings & Relative Particles Engine

**Feature Directory**: `specs/004-kinetic-neon-strings`  
**Created**: 2026-08-04  
**Status**: Draft  
**Input**: Natural language description for Kinetic Neon Strings & Relative Particles Side Art Engine.

---

## 1. Executive Summary & Purpose

Mục tiêu của tính năng này là xây dựng hệ thống **Side Art Generative Canvas 2D** hoạt động độc lập, hiệu năng cao (target 120-165 FPS), hoàn toàn loại bỏ kiến trúc Clone Loop / Lottie cuộn đứt đoạn cũ. 

## Clarifications

### Session 2026-08-04
- Q: Tọa độ neo của 2 cụm dây LED Sine Strings nên xử lý như thế nào để đảm bảo tính responsive trên Mobile vs Desktop? → A: Tự động scale vị trí neo theo `% Viewport Width`: `4vw` trên Mobile (`<768px`) và `8vw` trên Desktop (`>=768px`) để giữ nguyên khoảng trống an toàn.

Hệ thống bao gồm:
1. **2 cụm Dây LED Lượng giác (Sine Strings)** ở 2 lề (Trái & Phải), mỗi cụm chứa 5 sợi dây kẻ sọc thẳng đứng uốn lượn đa lớp có chiều sâu 3D (Shadow & 3-layer Glow).
2. **Hệ thống Hạt Tương đối (Relative Dots)** tạo ảo giác vận tốc siêu cao (Parallax Speed Illusion) phản xạ theo biến gia tốc cuộn (`--velocity` / Lenis scroll velocity).
3. **Kiến trúc Viewport Đóng Đinh (Fixed Viewport Canvas)**: Canvas được gắn cố định hoàn toàn vào Viewport, không tham gia luồng DOM/Lenis container, loại bỏ hoàn toàn lỗi trôi/lặp rác của Side Art cũ.

---

## 2. Fixed Viewport & DOM Architecture

- **DOM Mounting**: Thẻ `<canvas>` được mount trực tiếp ở tầng root (Layout / Viewport level), hoàn toàn tách biệt khỏi Lenis Infinite Scroll Container.
- **CSS Constraint**:
  - `position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 10;`
- **Tác động Kiến trúc**:
  - Canvas giữ vị trí cố định tuyệt đối trên màn hình hiển thị.
  - Không re-render React hay thay đổi kích thước DOM khi cuộn.
  - Mọi biến đổi hình học (tọa độ hạt, biên độ sóng sin, độ nhòe hào quang) biến thiên 100% dựa trên hằng số `velocity` và `scrollDirection` đọc từ Zustand transient scroll state / Lenis store.

---

## 3. Trigonometric Sine Strings Engine

Khởi tạo 2 cụm dây (Trái và Phải Viewport). Mỗi cụm gồm 5 sợi dây kẻ sọc (1px).

### 3.1. Trạng thái IDLE (Vận tốc cuộn |velocity| <= 0.1px/frame trong > 2.0s)
- **Responsive Base_X Anchoring**:
  - Tọa độ gốc `Base_X` của 2 cụm dây LED tự động thích ứng theo tỷ lệ Viewport Width (`vw`): `4vw` tính từ lề cho màn hình di động (`<768px`) và `8vw` tính từ lề cho màn hình máy tính (`>=768px`). 
  - Đảm bảo 2 cụm dây luôn bám sát lề viền mà không bao giờ che đè lên khung nội dung chính ở trung tâm.
- **Công thức lượng giác**:
  $$x = \text{Base\_X} + \sin(y \cdot \text{frequency} + \text{time} + \text{phaseOffset}) \cdot \text{amplitude}$$
- **Multi-layer Phase & Depth**:
  - 5 sợi dây mỗi cụm được gán các chỉ số `phaseOffset` (bước sóng) và `amplitude` (biên độ) lệch nhau, tạo hiệu ứng xếp lớp 3D lả lơi.
- **Lighting & Layering (Canvas Rendering)**:
  1. *Nét Lõi (Core Line)*: Width 1px, Màu `rgba(255, 255, 255, 1.0)`.
  2. *Nét Tán (Spread Line)*: Width 4px, Màu `rgba(255, 255, 255, 0.5)`.
  3. *Nét Hào Quang (Aura Glow)*: Width 12px, Sử dụng `globalCompositeOperation = 'screen'`, Opacity 15% (`rgba(255, 255, 255, 0.15)`).
  4. *Shadow Vector*: Bóng ma màu tối (`rgba(0, 0, 0, 0.6)`), lệch trục X +30px để lừa thị giác dây lơ lửng trên nền đen bên dưới.

### 3.2. Trạng thái TENSION (Khi |velocity| > 0.1px/frame - Đang cuộn)
- **Bắt Tín Hiệu Velocity**: Ngay khi phát hiện người dùng cuộn (`Math.abs(velocity) > 0.1`).
- **Amplitude Collapse (Lerp)**: Nội suy tuyến tính (Lerp) biên độ `amplitude` của cả 5 sợi dây tiệm cận ngay lập tức về `0`.
- **Hiệu ứng Hình học**: 5 sợi dây giật căng thẳng băng, chập nhập làm 1 đường thẳng tắp 1px.
- **Tắt Đèn (Dimming)**:
  - Opacity của lớp Glow 4px và 12px giảm ngay lập tức về 0.
  - Trả lại 1 sợi dây cước trắng tinh, sắc lẹm, lạnh lùng chạy song song lề Viewport.

---

## 4. Relative Particles Engine (The Relative Dots)

Tạo ảo giác tốc độ cao xé gió ("múi mít trượt").

### 4.1. Spawn & Quantity Limits
- **Giới hạn số lượng**: Khống chế tối đa 5 hạt hiển thị đồng thời trên mỗi cụm (tổng 10 hạt toàn màn hình) để tránh rác thị giác và giữ khung hình sạch sẽ.
- **Interval Spawning**: Khởi tạo/tái sinh hạt mới khi số hạt trong cụm < 5 và hạt cũ đã di chuyển qua mốc khoảng cách an toàn.

### 4.2. Vector Motion Dynamics
- **Trạng thái IDLE (`velocity = 0`)**:
  - Hạt trôi chậm dọc theo chiều dài dây với `Base_Speed` cố định (ví dụ: 1.5px/frame) duy trì sức sống chuyển động.
- **Trạng thái TENSION (Khuếch đại Vận tốc Tương đối)**:
  - Tốc độ hạt cập nhật liên tục theo công thức vector:
    $$\text{Dot\_Speed} = \text{Base\_Speed} - (\text{Velocity} \times M\_Multiplier)$$
  - **Nguyên tắc Ngược Chiều Cuộn (Parallax Reversal)**:
    - Khi cuộn xuống (Camera đi xuống -> Velocity > 0) -> `Dot_Speed` mang giá trị âm lớn -> Hạt bắn vọt ngược lên trên (`Y` giảm nhanh).
    - Khi cuộn lên (Camera đi lên -> Velocity < 0) -> `Dot_Speed` mang giá trị dương lớn -> Hạt bắn vọt xuống dưới (`Y` tăng nhanh).

### 4.3. Full Life-cycle Guarantee
- **Không Hủy Đột Ngột**: Ngay cả khi người dùng dừng cuộn đột ngột (`Velocity` trở về 0), các hạt đang chạy dở dở dang dang **KHÔNG ĐƯỢC** biến mất lập tức.
- **Lướt Nốt Hành Trình**: Hạt tự động quay về dùng `Base_Speed` để lướt tiếp hết phần dây còn lại.
- **Kill / Splice Condition**: Chỉ tiến hành loại bỏ (splice) hạt khỏi mảng lưu trữ khi tọa độ Y của hạt ra hoàn toàn khỏi ranh giới Viewport ($Y < 0$ hoặc $Y > 100\text{vh}$).

---

## 5. User Scenarios & Acceptance Criteria

### User Scenario 1: IDLE State Sine Motion (Priority: P1)
- **Given**: Màn hình ở trạng thái tĩnh (người dùng không cuộn trong > 2 giây).
- **When**: Quan sát 2 bên lề màn hình.
- **Then**: 5 sợi dây Sine wave nhẹ nhàng uốn lượn với lớp Glow 3 tầng và bóng đổ 3D lơ lửng, các hạt trôi chậm rãi lướt dọc dây.

### User Scenario 2: Tension Stretch & Relative Velocity Reaction (Priority: P1)
- **Given**: Màn hình đang ở trạng thái IDLE.
- **When**: Người dùng lăn chuột hoặc vuốt màn hình tạo gia tốc cuộn (`|velocity| > 0.1`).
- **Then**:
  1. 5 sợi dây lập tức thu hẹp biên độ sóng Sin về 0 (duyệt Lerp mượt), chập lại thành 1 sợi cước trắng thẳng đứng 1px.
  2. Lớp Glow 4px và 12px tắt hoàn toàn.
  3. Các hạt (Dots) lập tức tăng tốc bắn vọt theo chiều **NGƯỢC CHIỀU CUỘN**.

### User Scenario 3: Continuous Particle Lifespan (Priority: P2)
- **Given**: Các hạt đang bắn vọt ở tốc độ cao do cuộn nhanh.
- **When**: Người dùng buông tay / dừng cuộn đột ngột (`velocity` rơi về 0).
- **Then**: Dây Sine từ từ uốn lượn trở lại IDLE, các hạt KHÔNG biến mất giữa chừng mà tiếp tục trôi lướt nốt phần còn lại ra khỏi mép màn hình trước khi unmount.

---

## 6. Functional Requirements

- **FR-001**: Canvas 2D MUST be placed in fixed viewport layer (`position: fixed; inset: 0; pointer-events: none; z-index: 10`) outside the Lenis scroll DOM wrapper.
- **FR-002**: Render 2 clusters (Left and Right margins), each containing 5 sine string lines (1px base stroke).
- **FR-003**: Calculate IDLE Sine wave via $x = \text{Base\_X} + \sin(y \cdot \text{frequency} + \text{time} + \text{phaseOffset}) \cdot \text{amplitude}$.
- **FR-004**: Apply 3-layer rendering for IDLE strings: Core 1px (Solid White), Spread 4px (50% Opacity), Aura Glow 12px (`screen` blend mode, 15% Opacity), and Shadow (Offset +30px X).
- **FR-005**: Smoothly lerp string amplitude to 0 and reduce glow opacity to 0 when `|velocity| > 0.1px/frame`, collapsing 5 strings into a crisp 1px line.
- **FR-006**: Limit particle count to max 5 active dots per cluster (total 10 dots).
- **FR-007**: Compute particle speed via $\text{Dot\_Speed} = \text{Base\_Speed} - (\text{Velocity} \times M\_Multiplier)$, ensuring particle vectors strictly oppose scroll direction.
- **FR-008**: Maintain full lifespan for active dots until $Y < 0$ or $Y > 100\text{vh}$, forbidding premature array splicing when velocity drops to zero.
- **FR-009**: Ensure 120-165 FPS performance by utilizing direct Canvas 2D context drawing inside `requestAnimationFrame` loop, reading transient Lenis velocity state without triggering React component re-renders.

---

## 7. Success Criteria

1. **Zero Frame Drop**: Canvas render loop runs consistently at native display refresh rate (60/120/165Hz) with < 1.5ms execution time per frame.
2. **Zero DOM Spill / Over-scroll Glitch**: Canvas position remains strictly frozen to Viewport boundaries during Lenis infinite scroll teleports.
3. **Visual WOW Factor**: Smooth transitions between IDLE sine wave float state and TENSION razor-sharp line state with responsive particle speed explosion.
