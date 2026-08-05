# Quickstart Validation Guide: OffscreenCanvas Worker

**Feature**: 009-offscreen-canvas-worker | **Date**: 2026-08-05

---

## Prerequisites

- Node.js 18+ và npm installed
- Project cloned tại `d:\web_portfolio`
- Chrome 80+ hoặc Firefox 79+ (để test Worker path)
- Một trình duyệt cũ/Safari 14 (để test fallback path)

---

## Setup & Run

```powershell
# Cài dependencies (nếu chưa)
cd d:\web_portfolio
npm install

# Chạy dev server
npm run dev
# → http://localhost:3005
```

---

## Validation Scenario 1: Xác nhận Worker khởi động (P1 — Critical)

**Mục đích**: Đảm bảo OffscreenCanvas Worker được tạo và render thay thế Main Thread.

**Bước thực hiện**:
1. Mở Chrome → `http://localhost:3005`
2. Mở DevTools → Console tab
3. Tìm log: `[KineticStrings] OffscreenCanvas Worker active`
4. Mở DevTools → **Performance** tab → Record 3 giây
5. Dừng record → Quan sát **Main Thread** row

**Expected outcome**:
- Console có log xác nhận Worker path được chọn
- Main Thread timeline **không có Long Task** màu đỏ liên quan đến canvas paint
- Xuất hiện thread mới "`Worker`" trong Performance timeline với các tasks canvas render

---

## Validation Scenario 2: Visual parity check (P1 — Critical)

**Mục đích**: Đảm bảo animation dây đàn hiển thị giống hệt trước migration.

**Bước thực hiện**:
1. Mở trang tại `scrollY = 0`
2. So sánh animation dây đàn với screenshot tham chiếu (chụp trước migration)
3. Cuộn nhanh → dây đàn phải biến dạng theo velocity
4. Dừng cuộn → dây đàn phải khôi phục mượt mà

**Expected outcome**:
- Màu sắc dây (trắng, particles trắng) giống hệt
- Biên độ dao động và tốc độ giống hệt tại cùng velocity
- Không có "nhảy" hay "giật ngược" khi chuyển velocity

---

## Validation Scenario 3: Fallback trên Safari 14 (P2)

**Mục đích**: Đảm bảo animation không crash trên trình duyệt không hỗ trợ OffscreenCanvas.

**Bước thực hiện**:
1. Mở Safari 14 (hoặc disable `OffscreenCanvas` trong Chrome flags)
   - Chrome: `chrome://flags/#disable-offscreen-canvas` (nếu available) HOẶC DevTools Console: `delete window.OffscreenCanvas`
2. Refresh trang
3. Kiểm tra Console: không có error
4. Quan sát animation dây đàn: vẫn chạy bình thường

**Expected outcome**:
- Console log: `[KineticStrings] Fallback to Main Thread render`
- Animation hiển thị và hoạt động bình thường
- Không có JavaScript error nào

---

## Validation Scenario 4: Input Delay measurement (P1 — Performance KPI)

**Mục đích**: Xác nhận INP cải thiện từ 363ms → < 100ms.

**Bước thực hiện**:
1. Chrome DevTools → Performance tab → Enable "CPU throttling: 4x slowdown"
2. Record → Cuộn trang → Click vào bất kỳ vị trí nào → Dừng record
3. Hoặc dùng Chrome DevTools → Performance Insights tab → Check **INP**

**Expected outcome**:
- INP < 100ms (với CPU 4x throttle)
- Không có Long Task > 50ms trên Main Thread liên quan đến canvas

---

## Validation Scenario 5: Memory leak check (P2)

**Mục đích**: Worker được terminate sạch khi component unmount.

**Bước thực hiện**:
1. Chrome DevTools → Memory tab → Take heap snapshot (baseline)
2. Navigate away và back lại trang (nếu có routing) hoặc hot-reload component
3. Take heap snapshot lần 2
4. So sánh: không có Worker object còn tồn tại

**Expected outcome**:
- Không có `DedicatedWorkerGlobalScope` còn sống sau unmount
- Chrome Task Manager: worker process tắt sau unmount

---

## Build Validation

```powershell
# TypeScript check + production build
npm run build

# Expected: 0 errors, 0 warnings
# Bundle size diff: ≤ +20KB gzipped
```
