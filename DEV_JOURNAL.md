# Portfolio Dev Journal — nim239
> Đọc file này trước khi làm bất cứ thứ gì. Update sau mỗi session.

---

## Tổng quan project

**Người làm:** Nam (Nhọ) — Motion Designer & CGI Artist tại Athena CM / VCCorp  
**Repo:** https://github.com/nim239/helo  
**Deploy:** Vercel (hiện tại URL preview có auth, public tại namdeptrai.vercel.app )  
**Stack:** Next.js 14+ (App Router) + TypeScript + GSAP (ScrollTrigger + ScrollSmoother)  
**Mục tiêu:** Static portfolio cá nhân, triển lãm online

---

## Vision / Concept

Không phải portfolio truyền thống. Đây là **exhibition** — triển lãm online.

- Trang như 1 cuộn tranh dài vô tận
- Scroll xuống tự nhiên, ease in out mượt như motion design
- Người dùng không nhận ra mình đã loop về section 1
- Layout "show don't tell" — hình ảnh nói chuyện, không có text giải thích dài dòng
- Có block show sản phẩm nhưng nhỏ, ít, không lấn át tổng thể
- Tổng thể như 1 triển lãm, không như 1 trang web thông thường
- Sprite 3D (con vật/object loop animation) bay ngang màn hình là 1 phần của artwork tổng thể — tính sau

---

## Cấu trúc 6 Sections (đề xuất, chưa confirm)

```
1. INTRO     → Tên + tagline, tối giản, full screen
2. REEL      → Showreel video, hero visual  
3. WORK A    → Project showcase (CGI / 3D)
4. WORK B    → Project showcase (Motion)
5. ABOUT     → Brief bio, vibe cá nhân
6. CONTACT   → Đơn giản, 1 dòng
→ Loop về 1
```

---

## Cơ chế Infinite Scroll Loop

**Cách chọn:** Scroll thuần — section sau nằm sẵn bên dưới, không có transition effect. Scroll xuống là thấy. Đơn giản, đẹp cho exhibition vibe.

**Trick loop:**
```
Render thật:  [1][2][3][4][5][6]
Clone thêm:   [1'][2']  ← ở cuối
Khi scroll chạm [1'] → teleport về [1] thật (instantaneous)
Người dùng không nhận ra vì layout y hệt nhau
```
Teleport xảy ra trong lúc scroll đang chạy, mắt không kịp bắt.

---

## Code hiện tại — Phân tích

### `app/page.tsx`
- Dùng GSAP ScrollSmoother (smooth: 4) + ScrollTrigger
- Sprite animation: 120 frames, spritesheet PNG, bay ngang theo scroll progress
- Sprite logic: progress trong loop → map ra X position (ping-pong eased)
- Hiện đang render **600 ContentBlock** (6 block × lặp 100 lần) → **cần xóa**
- Scroll snap đang được config nhưng không phù hợp vision

### Vấn đề cần fix
1. **600 DOM nodes** → nặng, vô nghĩa, xóa ngay
2. **Content trống** → placeholder text/màu xám, chưa có real content
3. **Chưa có 6 sections thật**
4. **GSAP ScrollSmoother cần Club license** → nếu không có thì watermark trên production, cân nhắc dùng Lenis thay thế (free, nhẹ hơn)
5. **Chưa có routing** — chỉ có page.tsx duy nhất (ổn vì single-page exhibition)
6. **Deploy preview bị 401** → cần set public hoặc dùng production URL

### `ContentBlock.tsx`
- Mỗi block = 1 full screen section (h-screen)
- Có lazy mount: dùng ScrollTrigger để detect visibility, chỉ render `HeavyContent` khi block vào viewport → pattern tốt, giữ lại
- `HeavyContent` hiện là placeholder (đỏ, text tiếng Việt test)
- Có `getContrastTextColor()` helper tự tính màu chữ theo background → không cần nữa khi có design thật
- Dùng `React.forwardRef` → sẵn sàng nhận ref từ parent nếu cần
- **Giữ lại:** lazy mount pattern, forwardRef, ScrollTrigger visibility
- **Bỏ:** number display to, placeholder text, màu nền hardcode, HeavyContent placeholder

---

## Quyết định kỹ thuật

| Vấn đề | Lựa chọn | Lý do |
|---|---|---|
| Smooth scroll | **Lenis** (thay ScrollSmoother) | Free, open source, smooth tương đương, không cần Club license. ScrollSmoother bị bỏ vì không có license |
| Infinite loop | Clone DOM + teleport | Đơn giản, reliable |
| Transition giữa sections | Không có — scroll thuần | Đúng với exhibition vibe |
| Sprite | Giữ nguyên logic hiện tại | Đã hoạt động, tính sau |
| Routing | Single page | Không cần multi-page |
| CSS | Tailwind (đã có) | Giữ nguyên |

---

## TODO — Theo thứ tự ưu tiên

### Ngay bây giờ (Foundation)
- [x] Xem code `ContentBlock.tsx`
- [x] Quyết định giữ ScrollSmoother hay đổi sang Lenis → **Lenis** (không có GSAP Club license)
- [ ] Xóa 600 items, thay bằng 6 section components thật
- [ ] Refactor page.tsx: bỏ ScrollSmoother, thay Lenis + giữ ScrollTrigger
- [ ] Build infinite loop mechanism (clone 2 section đầu ở cuối, teleport khi gần cuối)

### Tiếp theo (Content)
- [ ] Nam confirm nội dung 6 sections
- [ ] Nam có showreel chưa? Link Vimeo/YouTube?
- [ ] Nam có assets (ảnh, video project) chưa?
- [ ] Design 6 sections trong Figma/bất cứ tool nào

### Sau đó (Polish)
- [ ] Sprite integration vào artwork tổng thể
- [ ] Typography chọn font
- [ ] Mobile responsive
- [ ] SEO meta tags + OG image
- [ ] Deploy public URL

---

## Câu hỏi còn mở (cần Nam trả lời)

1. Có GSAP Club license không? (ảnh hưởng ScrollSmoother vs Lenis)
2. Showreel hiện tại ở đâu? (Vimeo / YouTube / file local)
3. Có assets project nào sẵn chưa? (ảnh render, video clip)
4. Sprite là con/object gì? (để biết scale, màu sắc, vibe)
5. Tên hiển thị trên portfolio là gì? "Nam" / "Nhọ" / username khác?
6. Color palette / vibe tổng thể: dark/light? warm/cool?

---

## Session Log

### Session 2 — 2026-04-07
- **Restructuring:**
  - Tách nội dung section ra `/data/sections.tsx` để dễ quản lý.
  - Di chuyển các component ra `/components` ở root.
  - Tạo `/lib`, `/utils`, `/public/videos` để chuẩn bị cho Video/Three.js.
  - Xóa sạch tệp rác `.bak`.
- **Logic Infinite Loop:**
  - Hoàn thiện teleport 2 chiều (lên/xuống). 
  - Clone 2 section cuối lên đầu và 2 section đầu xuống cuối để đảm bảo vận tốc cuộn không bị khựng khi teleport.
- **Exhibition Vibe:**
  - Ẩn thanh cuộn hoàn toàn.
  - Thêm hiệu ứng vignette background cố định (`radial-gradient`).
  - Thêm animation fade-in cho nội dung section khi vào viewport.
  - Cập nhật Sprite: Ping-pong ngang mượt hơn, frame animation loop nhanh hơn theo tốc độ scroll.

---
## Hướng dẫn cho Video & Three.js (Sắp tới)

1. **Video:**
   - Đưa video vào `/public/videos/`.
   - Sử dụng thẻ `<video>` với các thuộc tính: `muted`, `loop`, `playsInline`, `autoPlay`.
   - Trong `Section.tsx`, vì đã có `visible` state, video sẽ chỉ load/play khi thực sự cần thiết → tối ưu hiệu năng.

2. **Three.js:**
   - Cài đặt: `npm install three @types/three @react-three/fiber @react-three/drei`.
   - Tạo các component Three.js riêng trong `/components/three/`.
   - Sử dụng `Canvas` của `@react-three/fiber` bên trong `Section`.
   - Lưu ý: Dùng `Suspense` để handle loading assets 3D.

---
*Cập nhật lần cuối: Session 2 — 2026-04-07*
