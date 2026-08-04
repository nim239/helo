# Research & Technical Decisions: Kinetic Neon Strings & Relative Particles

**Feature**: `004-kinetic-neon-strings`  
**Date**: 2026-08-04  

## Decision 1: Render Loop Integration Strategy (GSAP Ticker vs Independent RAF)

- **Decision**: Sử dụng `gsap.ticker.add(renderLoop)` để đồng bộ hoàn toàn Canvas render cycle với khung hình của GSAP và Lenis.
- **Rationale**: 
  - Hiến pháp dự án (Constitution Rule 4) ghi rõ: *"1 RAF duy nhất: Toàn hệ thống chỉ được có một vòng lặp animation (GSAP Ticker). Nghiêm cấm raw requestAnimationFrame song song"*.
  - Đảm bảo biến `velocity` đọc từ Zustand Store luôn được sync mượt mà nhất ở tần số 120-165Hz mà không bị lãng phí CPU.
- **Alternatives Considered**: 
  - `requestAnimationFrame` độc lập (Loại bỏ vì vi phạm hiến pháp performance).

---

## Decision 2: Particle Lifecycle & Memory Management (GC Optimization)

- **Decision**: Sử dụng Object Pool tái sử dụng cố định (Max 5 hạt/cụm = 10 hạt toàn màn hình), không `push`/`splice` mảng linh tinh trong vòng lặp animation.
- **Rationale**:
  - Ở tốc độ 165Hz, việc liên tục tạo và xóa object JS (`new Particle()`) sẽ gây ra hiện tượng Garbage Collection (GC) Stuttering làm rớt khung hình.
  - Tái sử dụng mảng cố định `particlesArray[10]` bằng cách reset tọa độ $Y$ và cờ trạng thái `active: false` khi hạt vượt khỏi ranh giới màn hình ($Y < 0$ hoặc $Y > 100\text{vh}$).
- **Alternatives Considered**:
  - `Array.prototype.splice()` mỗi khi hạt ra khỏi viewport (Loại bỏ vì gây re-allocation bộ nhớ liên tục).

---

## Decision 3: Canvas Glow & Shadow Compositing Optimization

- **Decision**: 
  - Chỉ vẽ 3 lớp Glow (Spread 4px & Aura 12px) khi ở trạng thái IDLE ($|velocity| \le 0.1$).
  - Khi ở trạng thái TENSION ($|velocity| > 0.1$), chuyển cờ `isTension = true` và bỏ qua hẳn các lệnh `ctx.shadowBlur` / `globalCompositeOperation = 'screen'` để giảm bớt gánh nặng fill-rate cho GPU.
- **Rationale**:
  - Các thao tác vẽ shadow và blend mode `screen` tốn rất nhiều tài nguyên GPU.
  - Khi cuộn nhanh, người dùng chỉ cần nhìn thấy sợi dây cước 1px trắng tinh sắc lẹm. Việc loại bỏ Glow ở TENSION mode vừa tạo đúng visual hiệu ứng "tắt đèn", vừa đẩy FPS lên mức tuyệt đối (165 FPS).
