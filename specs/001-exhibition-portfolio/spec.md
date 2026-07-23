# Feature Specification: Exhibition Portfolio & Scroll Engine

**Feature Branch**: `001-exhibition-portfolio`  
**Created**: 2026-07-22  
**Status**: Draft  
**Input**: User description: "Add CDN and WebM specifications for native video hosting."

## Clarifications

### Session 2026-07-22
- Q: The specification lacks the exact JSON data structure for sections featuring a Horizontal Auto-Marquee. How should the media items for a marquee be structured in the data model? → A: Use a nested array structure with a unified `layout` property (e.g. `layout: "horizontal-marquee"`). Each marquee item represents an independent artwork entity inside an `items` array.
- Q: Where will the JSON configuration data for the entire exhibition be stored and loaded from? → A: Local Static JSON (`data/sections.json`) bundled with Next.js (SSG).

### Session 2026-07-23
- Q: iOS 13+ requires an explicit user tap to enable DeviceOrientationEvent (Gyroscope), and browsers block Web Audio API without interaction. Given our strict "Non-Interactive" rule, how should we trigger these permissions? → A: Add a one-time "Enter Exhibition" overlay (solves both Audio autoplay and Gyroscope permissions)
- Q: When a user accesses a deep link (e.g., `/#work-a`), should the "Curtains Effect" completely bypass the standard 120-frame Sprite Intro? → A: Play the Sprite Intro first in front of the Curtains effect, then open the Curtains to reveal the deep-linked target.

## Post-MVP Architecture Refinements (2026-07-23)

### 1. Scroll Snap (Dừng tại section tiếp theo - Chill Glide)
**Mục tiêu:** Khi người dùng ngừng cuộn, màn hình không bị giật ngược lại mà sẽ trôi mượt mà (glide) về phía section tiếp theo theo đà cuộn.
- **Giải pháp:** Bắt sự kiện `lenis.on('scroll')` kết hợp với `debounceTimeout`. Kiểm tra `e.direction`.
- **Logic tính toán:** Dựa vào hướng cuộn (lên hoặc xuống), dùng hàm `Math.ceil()` hoặc `Math.floor()` nhân với `sectionHeight` để xác định section mục tiêu.
- **Thực thi:** Dùng `lenis.scrollTo(target, { duration: 30.5, easing: Quint ease-in-out })` để trôi bồng bềnh siêu chậm tới đích. Đảm bảo logic không chạy khi đang trong Teleport Cooldown.

### 2. Kịch bản Intro & Sprite Behavior

#### 2.1. Loading Checkpoint
- **Mục tiêu:** Tránh lỗi giật lag, đảm bảo tài nguyên nặng (đặc biệt là spritesheet 120 frames và ảnh tĩnh) sẵn sàng 100% trước khi diễn.
- **Giải pháp:** Xây dựng một màn hình Loading Overlay ngắn. Dùng `Promise.all` hoặc Image `onload`. Khi trạng thái báo `isLoaded = true`, overlay mờ dần (fade out) và kích hoạt Intro Timeline.

#### 2.2. Sprite Intro Animation (First Play)
- **Mục tiêu:** Ấn tượng thị giác mạnh từ lúc mở màn, dẫn dắt sprite vào vị trí hòa quyện với Art tĩnh của Section 1.
- **Kịch bản GSAP Timeline:**
  - **Start:** Scale to `2.5x`, đặt ở trung tâm màn hình.
  - **Action:** Play chuỗi 120 frames kết hợp đồng thời với hiệu ứng thu nhỏ (`scale: 1`) và di chuyển (`x, y`) về điểm xuất phát.
  - **End:** Dừng chính xác tại tọa độ thuộc quỹ đạo toán học (Start Point) được config qua biến `START_POINT_SPRITE` chuẩn bị cho pha bay theo scroll.

#### 2.3. Sprite Hành trình (Scroll Behavior)
- **Mục tiêu:** Sprite bay lượn sinh động (lên/xuống/trái/phải) theo cuộn chuột, và loop hoàn hảo.
- **Công thức Toán học & GSAP ScrollTrigger:**
  - Sử dụng hàm lượng giác (Sine / Cosine) kết hợp với `scrollY` để tạo quỹ đạo uốn lượn tự nhiên.
  - **Logic Loop:** Thiết lập công thức chia chẵn cho 6 section (chu kỳ teleport). Quỹ đạo và frame ở mốc `3*innerHeight` và `9*innerHeight` (2 điểm teleport) phải bằng nhau tuyệt đối từng pixel để lặp không vết xước.
  - Liên kết frame của Sprite tỷ lệ thuận với cuộn để tạo cảm giác tương tác.

### 3. Hệ thống Parallax 2.5D (4 Layer Art Placeholder)
- **Cấu trúc:** 4 thẻ `div` đặt dọc theo 2 cạnh trái/phải, chiều rộng `15vw`.
- **Phân tầng Chiều sâu (Z-index & Tốc độ):**
  - **2 Layer Tiền cảnh (Foreground):** Nằm đè lên trên cùng (Z-index cao nhất). Tốc độ: `vận tốc cuộn × 1.2` (trôi nhanh hơn).
  - **2 Layer Hậu cảnh (Background):** Nằm chìm phía sau các section chính (Z-index thấp). Tốc độ: `vận tốc cuộn × 0.8` (trôi chậm hơn).
- **Xử lý Loop:** Các layer này áp dụng logic nhân bản (clone) nối đuôi giống hệ thống section chính (Buffer 12 sections). Để trôi liên tục không đứt đoạn qua cổng teleport, tốc độ được ép thành phân số tuyệt đối (`7/6` thay vì 1.2, và `5/6` thay vì 0.8) và neo tọa độ dịch chuyển vào `baseline = window.innerHeight * 3`. Nhờ vậy, khi Teleport 6 section, Parallax sẽ nhảy một khoảng nguyên vẹn (vd: 7 section hoặc 5 section), đảm bảo liền mạch 100%.

## Architecture & Layout Overview *(mandatory)*

### 1. Section Hierarchy & Clone Layout (Buffer Expansion)
DOM Structure (3-Section Buffer for over-scroll protection):
```text
├── Clone Section 4' (Index 0)
├── Clone Section 5' (Index 1)
├── Clone Section 6' (Index 2)
│
├── Section 1: INTRO (Index 3)
├── Section 2: REEL (Index 4)
├── Section 3: WORK A (Index 5)
├── Section 4: WORK B (Index 6)
├── Section 5: WORK C (Index 7)
├── Section 6: CONTACT (Index 8)
│
├── Clone Section 1' (Index 9)
├── Clone Section 2' (Index 10)
└── Clone Section 3' (Index 11)
```

### 2. Scroll Container Strategy
**Use browser native document scroll. Lenis wraps window scrolling.**
- **Forbidden**: Custom overflow scroll containers.

### 3. Coordinate System & Sync (CSS Variable Strategy)
- JS measures exact `window.innerHeight` (with debounce) and writes to CSS variable `var(--section-height)`. All CSS layouts MUST use this variable to sync JS math with CSS layouts, avoiding Safari layout shifts.

### 4. Non-Interactive Exhibition Rule (Core UX)
The interface behaves like a physical museum. **"Look but don't touch"**.
- **Rule**: Entire exhibition contents (video, sprite, 3D canvas) render and animate purely based on scroll progress or auto-timelines.
- **Forbidden**: Play/pause buttons, click-to-expand, hover-to-reveal, drag-to-rotate, or any pointer interaction on artwork.
- **Exception 1 (Global Intro)**: A one-time "Enter Exhibition" overlay is required on initial load to grant Mobile Gyroscope and Web Audio API permissions.
- **Exception 2 (Section 6 - CONTACT)**: The contact section is the ONLY place within the exhibition flow where click interaction is permitted.
- **Video Elements**: MUST force `muted` and explicitly omit `controls`. Fallback for playback failure is strict static poster.
  - **Strict Mute Policy**: Audio playback is STRICTLY PROHIBITED globally on all video elements to prevent twin-audio bugs when real and clone sections overlap. If global background music is required in the future, it MUST be implemented as a single, centralized top-level `<audio>` element. Individual videos must never be unmuted.
- **3D Elements (R3F)**: `OrbitControls` or manual drag/rotate MUST be completely disabled.

### 5. Zustand Transient State Architecture (120fps Target)
**CRITICAL: Bypassing React Render Cycle for Physics & Re-render Clash Protection**.
- **Zustand Store**: Holds `currentPhase`, `teleportCooldown`, `snapTarget`, and `scrollProgress`.
- **Transient Updates**: The store operates outside the React lifecycle. Lenis `onScroll` writes data directly to Zustand.
- **DOM Mutations**: Math evaluation reads from Zustand synchronously. DOM updates use direct ref mutations (`ref.current.style.transform`), bypassing React reconciliation entirely.
- **Global Re-render Clash Protection**: If React is forced to re-render (e.g., window resize debounced `--section-height` update), the Virtual DOM will wipe out transient inline styles. 
  - **Solution**: The system MUST implement `useLayoutEffect` to read the latest Zustand values and re-inject them into the Real DOM immediately before browser paint, or strictly isolate transient components via `React.memo`. This rule applies to **ALL** ref-mutated elements (marquee tracks, sections, parallax layers).

### 6. Horizontal Auto-Marquee Media Cluster (Work 2 & 3 Scenarios)

**Description**: Specific sections (e.g., Work 2, Work 3) feature a horizontal infinite auto-scrolling ticker (Marquee) of 3-10 videos intersecting the primary vertical infinite scroll. 
**Interaction Model (UPDATED POST-MVP PIVOT): Zero manual interaction. The track moves continuously at a constant speed, regardless of user scroll state.** No hover-to-play, no tap-to-toggle, no dragging. Videos play continuously when in viewport.
*Reason for change*: The original "Dwell-to-Play" (stopping the marquee when the user stops scrolling) resulted in a poor, disjointed UX that felt unresponsive ("trải nghiệm dừng chuột dừng trôi như cứt").

**Layout & Animation Strategy**:
- **Mechanism**: The horizontal track moves continuously via a dedicated RAF loop using CSS `transform: translate3d(x, 0, 0)`.
- **Scroll Isolation**: No manual horizontal dragging exists at all. Lenis native vertical momentum remains 100% uninterrupted; the marquee never intercepts touch/wheel events.

**Always-Playing Rule (Desktop + Mobile, single code path)**:
- **Trigger condition**: Videos auto-play whenever they intersect with the viewport via `IntersectionObserver`.
- **Marquee motion**: The marquee continuously calculates its position via `(performance.now() * speed) % trackWidth`. It never pauses.
  - **Float Precision Protection**: To prevent float precision loss, the system MUST use `performance.now()` for time delta calculations, wrapped in a modulo operator based on track width:
    `((performance.now() - baseTimestamp - totalPausedDuration) * speed) % originalTrackWidth`.
  - **Modulo DOM Duplication (Seam Snap Prevention)**: To ensure modulo seamless looping without visual snapping when `translateX` resets, the Marquee DOM MUST physically duplicate its inner node list (e.g., `[A,B,C] -> [A,B,C, A,B,C]`). 
  - **Dynamic Track Width**: The `originalTrackWidth` MUST NOT be measured once on mount. It MUST be continuously monitored via a `ResizeObserver` attached to the original node set to account for image/font lazy loading and breakpoint layout shifts.

### 7. Asset Hosting & CDN Strategy (Media Optimization)
- **Native Video Only**: MUST use native HTML5 `<video>` tags. Embeds from YouTube, Vimeo, or other iframe-based providers are strictly forbidden, as they break VRAM flushing and Dwell-to-Play logic.
- **Format & Hosting**: Video assets MUST be served in `.webm` format (with `.mp4` as fallback) for extreme compression efficiency.
- **Free CDN Architecture**: To achieve instant byte-range requests without buffering, videos MUST be hosted on a Free-Tier CDN optimized for media delivery (e.g., Supabase Storage, Cloudinary, or Firebase Storage). Direct hosting in the Next.js `public` folder is discouraged for massive video assets to save Vercel bandwidth.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless Exhibition Loop & Velocity Preservation (Priority: P1)
**Velocity Preservation**: Use native Lenis API / fake wheel events. Do not hack `.velocity`.
**Teleport Math**:
- Down: When `scrollY >= sectionHeight * 9` -> teleport to `scrollY - (sectionHeight * 6)`.
- Up: When `scrollY <= sectionHeight * 2` -> teleport to `scrollY + (sectionHeight * 6)`.

---

### User Story 2 - Unified Dwell-to-Play Marquee Rule (Priority: P2)
**Interaction Model: Zero manual interaction.** 

**Trigger Condition**: `(marquee section intersects viewport) AND (Lenis vertical scroll velocity < 0.1px/frame) AND (Duration >= 400ms sustained) AND (Teleport Cooldown is INACTIVE)`.
- **On trigger**: Horizontal track momentum pauses. The video closest to the horizontal center automatically calls `.play()`. 
- **On resume**: The instant vertical scroll velocity rises above threshold again, the playing video pauses/reverts, and horizontal track resumes.

---

### User Story 3 - Marquee VRAM Optimization (Rule of 3) (Priority: P3)
**Aggressive IO Performance Rules**:
- **Rule of 3 (Physical Nodes)**: Max 3 `<video>` elements active at any time. This limit applies to the **physical DOM nodes**, treating duplicated DOM elements in the seam as entirely independent entities.
- **Vertical-First IO Verification**: The Rule of 3 IO MUST strictly verify Vertical Intersection first. Videos inside a Marquee (Real or Clone) are ONLY allowed to mount if their parent section is actively intersecting the vertical viewport. 
- **Safe Dwell-Unmount Sync**: When a section rapidly exits the vertical viewport, the Vertical-First IO force-unmount MUST execute synchronously BEFORE or simultaneously with the Zustand `DWELLING -> false` transition.
- **Safari VRAM Flush**: Videos scrolling out of bounds MUST be aggressively purged from memory via `videoNode.removeAttribute('src'); videoNode.load();`.
  - **CRITICAL - Flash Prevention**: The `<video>` element MUST have a persistent `poster` attribute defined in HTML to prevent a 1-frame black flash upon `.load()`.
- **Least-Visible Formula**: The video displaced/unmounted to satisfy the Rule of 3 is strictly defined as the video whose absolute horizontal distance from the viewport's center axis is the largest.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Render 6 main sections + 6 clones using Native Document Scroll.
- **FR-002**: Apply JS-calculated `--section-height` to sync CSS layouts. Protect ALL transient inline styles from React VDOM wipes using `useLayoutEffect`.
- **FR-003**: Wrap `video.play()` in `try/catch`. Force ALL videos globally to be completely `muted` and omit `controls`. Audio playback is strictly forbidden.
- **FR-004**: Calculate snap targets targeting section centers via Lenis native `scrollTo`.
- **FR-005**: Execute force-visibility checks on media immediately after a teleport.
- **FR-006**: Implement Horizontal Auto-Marquee using modulo-safe time-based calculation `((performance.now() - baseTimestamp - totalPausedDuration) * speed) % originalTrackWidth`. The DOM must be physically doubled `[A,B,C, A,B,C]` and `originalTrackWidth` monitored via `ResizeObserver`.
- **FR-007**: Enforce Unified Dwell-to-Play triggered purely by Lenis resting (<0.1px/frame for >= 400ms) with a strict condition that `teleportCooldown` must be inactive.
- **FR-008**: Enforce Rule of 3 for horizontal marquee videos with Vertical-First IO verification. Treat DOM duplicates as independent entities. Execute deep VRAM flush (`removeAttribute('src')` + `.load()`) for off-screen videos. Ensure IO unmount logic executes before `DWELLING` state transitions to prevent null ref crashes.
- **FR-009**: Teleport transitions MUST immediately force-kill any active `DWELLING` state and force-pause any playing Dwell videos.
- **FR-010**: All media MUST use native HTML5 `<video>` tags serving `.webm`/`.mp4` formats. Iframe embeds are explicitly forbidden. Assets MUST be pulled from a Free-Tier CDN (Supabase/Cloudinary/Firebase) to ensure direct byte-range requests and preserve Vercel bandwidth.

### Accessibility Rules
- **prefers-reduced-motion**: Disable sprite animations and parallax. Maintain infinite loop navigation.
- **Screen Reader Blackhole**: All Clone Sections MUST have `aria-hidden="true"`.

---

## Key Entities & Data Models *(mandatory)*

### Exhibition Data Model Configuration
The JSON structure enforces a unified `layout` system with nested array items for marquees. Stored as Local Static JSON (e.g. `data/sections.json`).
```json
[
  {
    "id": "reel",
    "title": "Director's Reel",
    "layout": "fullscreen-video",
    "parallax": {
      "foreground": 1.2,
      "background": 0.8
    },
    "mediaType": "video",
    "src": "/projects/reel/preview.webm",
    "poster": "/projects/reel/cover.webp"
  },
  {
    "id": "work-b",
    "title": "Motion Work",
    "layout": "horizontal-marquee",
    "marquee": {
      "direction": "left",
      "speed": 0.8,
      "pauseOnHover": false,
      "infinite": true
    },
    "items": [
      {
        "id": "shot01",
        "mediaType": "video",
        "src": "/projects/work-b/01.webm",
        "poster": "/projects/work-b/01.webp"
      },
      {
        "id": "shot02",
        "mediaType": "image",
        "src": "/projects/work-b/02.webp"
      }
    ]
  }
]
```

### Scroll State Machine Transitions (Zustand Store)
| Current State | Trigger Event | Next State | Action / Condition |
|---------------|---------------|------------|--------------------|
| `IDLE` | User scrolls (Wheel/Touch) | `SCROLLING` | Cancel active snap lerps. Marquee resumes. |
| `SCROLLING` | Cross boundary | `TELEPORTING` | Instant math teleport, start 500ms cooldown. |
| `TELEPORTING` | Instant math executes | `SCROLLING` | Force media IO check (try/catch `play()`). |
| `SCROLLING` | `onScrollEnd` IN Cooldown | `IDLE` | Bypass snap lerp, reset state to prevent deadlock. |
| `IDLE` | Cooldown expires AND Velocity ~0 | `SNAPPING` | Re-evaluate nearest section, trigger snap lerp. |
| `SCROLLING` | `onScrollEnd` (Velocity ~0) | `SNAPPING` | Must be OUTSIDE 500ms teleport cooldown. |
| `SNAPPING` | Snap lerp completes | `IDLE` | Update URL hash (replaceState). |
| `IDLE` | `Duration >= 400ms` AND `Cooldown == FALSE` | `DWELLING` | Marquee pauses. Center video auto-plays. |
| `DWELLING` | User resumes scroll (`vel > threshold`) | `SCROLLING` | Marquee video pauses, track resumes momentum. |
| `DWELLING` | Edge case: Teleport bounds crossed | `TELEPORTING` | Force-kill DWELLING, force-pause video, start teleport. |

## Technical Addendum: Mobile Physics & Production Stability

### 1. Vercel Minification & Lenis Touch Protection
- **Vấn đề:** Trình đóng gói (Turbopack/Webpack) trên Vercel Minify biến nội bộ của Lenis (`isSmoothScrolling` -> `t`), gây liệt Touch trên mobile khi can thiệp biến private hoặc khi `window.scrollTo` bị gọi đè lên gesture của Android Chrome.
- **Quy tắc:** Thiết lập `syncTouch: true` trong Lenis instance để Lenis trực tiếp quản lý Virtual Touch Scroll thay cho native scroll. Khi đó, lệnh `lenis.scrollTo(target, { immediate: true })` đi qua luồng virtual scroll mà không gọi `window.scrollTo` trực tiếp, đảm bảo không bị ngắt vỡ chuỗi touch event của Android Chrome.

### 2. Epsilon Tolerances for Lerp Snap Loops
- **Vấn đề:** Lỗi làm tròn số thực (Floating Point) làm `scrollY` dừng ở `3.000001px`, hàm `Math.ceil()` đẩy vị trí lên Index `4`, gây ra chuỗi Snap liên hoàn vô tận.
- **Quy tắc:** Bắt buộc kẹp dung sai Epsilon (`0.02`) và sử dụng `Math.round()` khi khoảng cách ở mốc cận kề:
  `const safeRatio = Math.abs(scrollRatio - Math.round(scrollRatio)) < 0.02 ? Math.round(scrollRatio) : scrollRatio;`

### 3. App-Switch & Mount Gate Guards
- **Mount Protection (`isReady`):** Khóa cổng Teleport cho đến khi UI yên vị hoàn toàn tại `initialOffset` của Section INTRO (Index 3). Cấm chạy Teleport Math ở `scrollY = 0` lúc vừa mount.
- **State Lock (`isSnapping`):** Không cập nhật tọa độ gốc `startScrollY` khi hệ thống đang tự động cuộn (`isSnapping = true`). Reset `startScrollY = targetSection` khi snap hoàn tất.
- **Viewport Shift Rejection:** Lọc rác các sự kiện `scroll` sinh ra do trình duyệt recalculate Address Bar khi chuyển tab/switch app bằng cách yêu cầu delta quãng đường cuộn tối thiểu (`deltaY > 5px`).

### 4. WebM Alpha & C4D Media Layering
- **Cấu trúc Layer:** Bức tượng/Vật thể 3D render dạng WebM Alpha (trong suốt) được đặt tràn khung (Overflow) trên lớp Z-Index cao hơn, tự động đè lướt qua (Overlap) các lớp Typography phía dưới khi cuộn.
- **Lazy-Play & Zero-Flash:** Khởi chạy `video.play()` ngầm khi media đi sâu vào Viewport `>= 20%`. Thẻ `<video>` BẮT BUỘC giữ nguyên thuộc tính `poster` tĩnh trên HTML để chống chớp đen Safari khi xả VRAM bằng `.load()`.

## 🚀 Roadmap Phase 2: "WOW VÃI LỒN WOW" (Dành Cho Phase Tiếp Theo)

Dưới đây là 5 ý tưởng tính năng đẳng cấp studio quốc tế (như Active Theory, Dogstudio, Hello Monday) được thiết kế dựa đúng trên nền tảng Transient Architecture của anh yêu:

### 1. Dynamic Audio Reactive Canvas (Âm Thanh Trực Quan Theo Vận Tốc Scroll)
- **Ý tưởng**: Mặc dù video bị cấm phát tiếng (Strict Mute Policy), nhưng khi anh yêu cuộn trang, toàn bộ không gian web sẽ phát ra âm thanh môi trường (Ambient Sound) rủ rê, thì thầm.
- **Cơ chế WOW**: Tần số (Pitch) và Âm lượng (Volume) của tiếng Ambient này sẽ biến thiên 100% theo vận tốc cuộn Lenis (`lenis.velocity`). Cuộn càng nhanh, tiếng vèo vèo càng dồn dập; dừng lại thì âm thanh dịu đi như tiếng gió đêm.
- **Độ khét**: Xài Web Audio API (chạy hoàn toàn ở client, 0KB asset) tạo âm thanh tổng hợp (Synthesizer), không tốn băng thông CDN!

### 2. Custom Inertia WebGL Cursor (Con Trỏ Chuột Tùy Chỉnh Có Độ Trễ Vật Lý)
- **Ý tưởng**: Bỏ con trỏ chuột mặc định của hệ điều hành. Thay vào đó là một chấm sáng hoặc vòng tròn mờ có hiệu ứng chất lỏng (Liquid Distortion).
- **Cơ chế WOW**: 
  - Khi lướt qua các đoạn video art, con trỏ chuột sẽ tự "hút" (Magnet effect) nhẹ vào tâm video.
  - Khi đứng yên ở trạng thái `DWELLING`, con trỏ chuột biến đổi thành một đĩa CD đếm ngược 400ms xoay tròn báo hiệu video sắp phát.
- **Độ khét**: Tính toán tọa độ chuột trực tiếp bằng RAF canvas, đéo re-render React.

### 3. 2.5D Gyroscope Depth Motion (Hiệu Ứng Bẻ Nghiêng Màn Hình Trên Mobile)
- **Ý tưởng**: Trên máy tính có chuột để tạo Parallax, nhưng trên Mobile Safari/Android thì sao?
- **Cơ chế WOW**: Sử dụng API `DeviceOrientationEvent` (Cảm biến gia tốc/con quay hồi chuyển của điện thoại). Khi người dùng nghiêng nhẹ chiếc điện thoại sang trái/phải, các layer ảnh Parallax 2.5D sẽ tự đung đưa theo góc nghiêng của tay.
- **Độ khét**: Tạo cảm giác như tác phẩm nghệ thuật đang nổi 3D thực sự bên trong màn hình điện thoại.

### 4. DevTools "Hacker Mode" Easter Egg (Tờ Giấy Bạc Cho HR)
- **Ý tưởng**: Dành riêng cho mấy thằng Tech Lead hoặc Senior HR tò mò nhấn F12 để soi code.
- **Cơ chế WOW**: Khi họ mở Console tab, thay vì báo lỗi red-line như các web thông thường, màn hình console sẽ hiện một đoạn ASCII Art logo của anh yêu, đi kèm bảng đo số liệu thời gian thực (Real-time Teleport Math, VRAM flushed count, Current FPS 144Hz).
- **Độ khét**: Khẳng định sự chỉn chu tới từng cọng lông của anh yêu, biến việc kiểm tra code thành một màn trình diễn.

### 5. Seamless Hash Deep Linking With Canvas Preview Transitions
- **Ý tưởng**: Khi chia sẻ link trực tiếp (ví dụ: `namdeptrai.vercel.app/#work-a`), web không load giật đùng đùng mà sẽ xuất hiện một hiệu ứng rèm màn che (Curtains Effect) tan biến dần.
- **Cơ chế WOW**: Vừa giữ đúng luật "không đứt gãy momentum vật lý", vừa cho phép nhảy thẳng đến dự án mong muốn với một màn intro cinematic sang xịn mịn. Hệ thống sẽ phát Sprite Intro 120 frames ngay phía trước lớp rèm che, sau đó mở rèm để reveal section mục tiêu.
