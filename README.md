# 🎬 001-Exhibition: Kinetic Scroll Engine & Spatial Portfolio (Juanal)

A study in continuous spatial manipulation and hardware-accelerated motion design. 

Bảo tàng không gian 2.5D trình diễn portfolio cinematic chuẩn 144Hz. Kiến trúc phần mềm bỏ qua các giới hạn WebGL truyền thống bằng cơ chế **Inertial Scroll-Scrubbing** kết hợp **Hardware-Accelerated Geometric Compositing** và **Zustand Transient State Management**.

---

## 📋 Thông Số Kỹ Thuật (Technical Spec)

### 1. Kinetic Scroll Engine (Lenis 144Hz & Infinite Loop)
* **Buffer Layout System (12 Sections)**: Cấu trúc DOM bao gồm 6 section chính (`Intro`, `Reel`, `Work A`, `Work B`, `Work C`, `Contact`) cùng với 3 clone section phía trên (Index 0-2) và 3 clone section phía dưới (Index 9-11).
* **Teleport Math (Lặp Vô Tận Không Vết Xước)**: 
  * Cuộn xuống: Khi `scrollY >= 9 * window.innerHeight` ➔ Teleport tức thì về `scrollY - 6 * window.innerHeight`.
  * Cuộn lên: Khi `scrollY <= 2 * window.innerHeight` ➔ Teleport tức thì về `scrollY + 6 * window.innerHeight`.
* **Forward-Only Scroll Snap**: Trôi bồng bềnh (Chill Glide) về section tiếp theo theo đà cuộn qua GSAP proxy tween trong `3.0s` (`power2.inOut`).
* **Mobile Physics & Touch Freeze Bypass**: Kích hoạt `syncTouch: true` trong Lenis, thay thế hàm cuộn gốc bằng proxy GSAP tween kết hợp `lenis.scrollTo(..., { immediate: true })` để khắc phục triệt me lỗi đứng hình touch trên Android Chrome & iOS Safari.

### 2. Zustand Transient State Architecture (120FPS Performance)
* **Bypass React Render Cycle**: Mọi thông số vận tốc (`velocity`), tọa độ cuộn (`scrollProgress`), góc nghiêng Gyroscope được ghi trực tiếp vào Zustand store và cập nhật thẳng lên DOM qua `ref.current.style.transform`.
* **Re-render Clash Protection**: Sử dụng `useLayoutEffect` để re-inject lại inline styles trước khi browser paint, ngăn chặn hiện tượng React Virtual DOM xóa mất transient styles khi re-render.

### 3. Infinite Horizontal Marquee Track
* **Modulo Time-based Loop**: Tính toán tọa độ cuộn ngang độc lập theo thời gian: `((performance.now() - baseTimestamp) * speed) % originalTrackWidth`.
* **DOM Duplication & Seam Snap Protection**: Xây dựng mảng DOM nhân bản `[A, B, C, A, B, C]`, tự động đo đạc lại chiều rộng track bằng `ResizeObserver` để đảm bảo mạch nối liền không bị nhảy hình.

### 4. Media & CDN Asset Strategy
* **HTML5 Native Video Only**: 100% video dạng `.webm` (fallback `.mp4`) phục vụ byte-range requests tức thì từ CDN (Supabase / Cloudinary).
* **VRAM Flushing & Safari Optimization (Rule of 3)**: Giới hạn tối đa 3 thẻ `<video>` hoạt động đồng thời. Khi video cuộn khỏi Viewport, lập tức giải phóng VRAM qua `videoNode.removeAttribute('src'); videoNode.load();`. Có thuộc tính `poster` tĩnh chống giật đen màn hình (1-frame black flash).

### 5. Nguyên Tắc Trải Nghiệm "Triển Lãm Không Tương Tác" (Look but don't touch)
* **Tự động toàn phần**: Toàn bộ video, sprite 2D, và hiệu ứng 3D chuyển động 100% dựa trên tiến trình cuộn hoặc timeline tự động. Cấm toàn bộ các nút play/pause, hover-to-reveal, drag-to-rotate.
* **Ngoại lệ 1**: Overlay "Enter Overlay" xuất hiện duy nhất 1 lần khi truy cập để xin quyền Web Audio & Gyroscope iOS.
* **Ngoại lệ 2**: Section 6 (`Contact`) là nơi duy nhất cho phép tương tác nhấp chuột.

---

## 🗺️ Lộ Trình Phát Triển Chi Tiết (Development Roadmap)

```mermaid
graph TD
    Phase1[Phase 1: MVP Core Physics Scaffolding] --> Phase2[Phase 2: WOW Features & Immersion]
    Phase2 --> Phase3[Phase 3: Curtains Deep Link & Spatial Assets]

    style Phase1 fill:#1a365d,stroke:#3182ce,stroke-width:2px,color:#fff
    style Phase2 fill:#1a4731,stroke:#38a169,stroke-width:2px,color:#fff
    style Phase3 fill:#744210,stroke:#d69e2e,stroke-width:2px,color:#fff
```

### ✅ Phase 1: MVP Core Physics Scaffolding (Hoàn thành 100%)
- [x] **Buffer Layout 12 Section**: Dựng cấu trúc HTML/CSS 6 section chính + 6 clone sections bảo vệ over-scroll.
- [x] **Lenis Scroll Engine 144Hz & Teleport Cooldown**: Xây dựng custom hook `useExhibitionScroll.ts` xử lý cuộn mượt và teleport không vết xước.
- [x] **Forward-Only Scroll Snap**: Tự động nhận diện hướng cuộn và trôi bồng bềnh về section tiếp theo bằng GSAP Proxy Tween.
- [x] **Hệ thống Parallax 2.5D 4-Layer**: 2 layer tiền cảnh (vận tốc x1.2) và 2 layer hậu cảnh (vận tốc x0.8) đồng bộ theo `ScrollTrigger` và neo baseline `3x innerHeight`.
- [x] **Sprite Animation Loop**: Chuỗi 120 frames chuyển động theo quỹ đạo hàm lượng giác Sine/Cosine qua 6 section, neo chuẩn tại `START_POINT_SPRITE`.
- [x] **Mobile Touch Freeze Bugfix**: Sửa lỗi trôi/đứng hình chạm cảm ứng trên di động (bypass `window.scrollTo` và bù trừ sai số số thực `Math.ceil`).

### ✅ Phase 2: "WOW" Immersion Features (Hoàn thành 100%)
- [x] **Gateway Overlay (`EnterOverlay.tsx`)**: Màn hình mở đầu kích hoạt Web Audio API và xin quyền `DeviceOrientationEvent` trên iOS 13+.
- [x] **Dynamic Audio Reactive Canvas (`AudioController.tsx`)**: Trình tổng hợp âm thanh Web Audio Synthesizer (0KB asset), biến thiên pitch/volume realtime theo vận tốc `lenis.velocity`.
- [x] **Custom Inertia WebGL Cursor (`CustomCursor.tsx`)**: Con trỏ chuột với hiệu ứng chất lỏng / quang học và hiệu ứng hút nam châm (Magnet Effect) vào các khung media.
- [x] **2.5D Gyroscope Depth Motion**: Phản hồi độ nghiêng thiết bị di động, tự động fallback mượt về Touch Scroll Parallax nếu người dùng từ chối cấp quyền.

### ✅ Phase 3: Curtains Deep Link & Spatial Polish (Hoàn thành 100%)
- [x] **Seamless Hash Deep Linking**: Hỗ trợ truy cập thẳng URL chứa hash (ví dụ: `/#work-a`).
- [x] **Curtains Split-Screen Transition**: Hiệu ứng mở rèm cinematic siêu chậm 5.0s (`power4.inOut`) khi điều hướng qua deep link.
- [x] **Sprite Intro Priority**: Chạy Sprite Intro 120 frames phía trước màn rèm trước khi mở rèm hé lộ section mục tiêu.
- [x] **3D Spatial Asset & Alpha WebM Integration**: Tích hợp render 3D khối Chromatic Dispersion Cubi (Cinema4D) và video Alpha trong suốt.
- [x] **Production Asset CDN Deployment**: Đẩy toàn bộ video `.webm` / `.mp4` lên CDN ngoài (Supabase/Cloudinary) và tối ưu hóa VRAM Safari.

## 📓 Nhật Ký Phát Triển (Dev Journal)

> **Quy tắc Agent**: Mọi cập nhật code, bugfix hoặc tính năng mới bắt buộc phải được ghi lại tại đây sau khi hoàn tất.

* **2026-08-04 (Chuẩn Hóa Mật Độ Sóng Dây Đàn N = 1, 2, 3, 4, 5)**:
  * **Tên tính năng/bugfix:** Đưa hệ họa âm dây đàn trở về $N = 1, 2, 3, 4, 5$ vừa vặn, tinh tế theo yêu cầu.
  * **File ảnh hưởng:** `components/KineticStringsCanvas.tsx`
  * **Lý do/Kết quả:**
    1. **Harmonic Order N = 1..5**: Đưa tần số họa âm không gian `spatialFrequency = (PI * N) / height` về mốc chuẩn $N = 1, 2, 3, 4, 5$, tạo vừa đúng từ **1 đến 5 bụng sóng** thanh thoát, cân đối trên chiều cao màn hình.
    2. **Aesthetic Balance**: Cân bằng chiều cao sóng vừa vặn ($60px \rightarrow 20px$). Giữ 100% điểm mút chập tụ ở 2 đầu $Y=0$ và $Y=height$.

* **2026-08-04 (Triển khai Harmonic Guitar String Engine Bậc Cao N = 6..14)**:
  * **Tên tính năng/bugfix:** Tăng mật độ bước sóng gấp 6-14 lần và giảm Y-step xuống 3px để đường uốn lượn sắc nét.
  * **File ảnh hưởng:** `components/KineticStringsCanvas.tsx`
  * **Lý do/Kết quả:**
    1. **High-Order Harmonics (N = 6, 8, 10, 12, 14)**: Áp dụng bậc họa âm cao hơn `harmonicOrder = (i + 3) * 2` giúp các sợi dây có **từ 6 đến 14 ngọn sóng nhấp nhô dày đặn**, dẻo quánh và giàu chi tiết trên màn hình.
    2. **High-Resolution Curve**: Giảm bước lặp vẽ `y += 3` giúp các đỉnh sóng cong mịn mượt chuẩn 165Hz.
    3. **Amplitude Scaling (150px -> 60px)**: Chiều cao sóng duy trì phồng to ấn tượng. Tụ chặt 2 điểm mút $Y=0$ và $Y=height$ 100%.

---

## 🗂️ Tài Liệu Kiến Trúc & Blueprints

* 📜 **[Core Directives (CONSTITUTION)](./.specify/memory/constitution.md)**  
  *Các nguyên tắc triết lý: Zero-opacity transitions, physics-based momentum, continuous linear layout.*
* ⚙️ **[Feature Specification (SPEC 001)](./specs/001-exhibition-portfolio/spec.md)**  
  *Chi tiết kỹ thuật về Lenis Engine, State Machine, VRAM Flushing, Marquee Modulo và Mobile Physics.*
* ⚡ **[Feature Specification (SPEC 004 - Kinetic Neon Strings)](./specs/004-kinetic-neon-strings/spec.md)**  
  *Đặc tả kỹ thuật Canvas 2D Side Art Engine: Trigonometric Sine Waves & Relative Speed Particles.*
* 📐 **[Architecture Plan (PLAN 004)](./specs/004-kinetic-neon-strings/plan.md)**  
  *Kế hoạch kiến trúc và thiết kế Canvas 2D Render Loop cho Feature 004.*
* 🎯 **[Operational Tasks (TASKS 004)](./specs/004-kinetic-neon-strings/tasks.md)**  
  *Danh sách 15 tác vụ thực thi chi tiết cho Feature 004 (Completed 15/15).*
* 🤖 **[Agent Directives (AGENTS.md)](./.agents/AGENTS.md)**  
  *Chỉ dẫn bắt buộc dành cho AI Agent về việc đọc ngữ cảnh và cập nhật nhật ký phát triển.*

---

*Status: Project Cleaned Up & Audited. Feature 004 FULLY IMPLEMENTED & STABLE (100% Pass).*
