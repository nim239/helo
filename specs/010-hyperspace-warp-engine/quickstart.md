# Quickstart: Validate Hyperspace Warp Engine

## Prerequisites
- Dev server running: `npm run dev`
- Chrome DevTools open (Performance tab)
- Test trên 2 máy: GPU cao (RTX 3060+) và CPU thường (i7-7700)

## Scenario 1: Warp Trigger (US1)
1. Mở trang, hoàn thành intro animation
2. Cuộn chuột NHANH và LIÊN TỤC khoảng 1.5–2 giây
3. **Expected**: Màn hình chuyển sang warp scene (dark space background, speed lines)
4. Zustand DevTools: `currentPhase === 'WARPING'`
5. Dừng cuộn → warp pool drain → sau vài giây quay lại bình thường

## Scenario 2: FPS Benchmark Warp vs Normal (US2)
1. Bật FPS overlay (desktop: cursor HUD, mobile: 5-tap)
2. Đo FPS khi scroll bình thường qua sections → note giá trị
3. Kích hoạt warp (scroll mạnh)
4. **Expected**: FPS trong warp scene ≥ FPS bình thường + 10 frames
5. Toggle `WARP_CULL_METHOD` giữa 'opacity' và 'display' → so sánh

## Scenario 3: Cubi Behavior (US2)
1. Quan sát Cubi khi scroll bình thường (biên độ rộng)
2. Kích hoạt warp
3. **Expected**: Cubi vẫn bay nhưng biên độ nhỏ hơn nhiều (~12%), ở vùng trên của màn hình, hướng ngược chiều scroll

## Scenario 4: Cursor Warp Gauge (US3 — desktop only)
1. Di chuột vào màn hình
2. Cuộn chậm → nửa dưới cursor ring fill thấp, màu xanh
3. Cuộn nhanh dần → gauge fill tăng, màu chuyển cam → đỏ
4. **Expected**: Warp trigger khi gauge đầy, burst animation cursor

## Scenario 5: Mobile 5-tap Fix (US4)
1. Mở trên mobile hoặc DevTools responsive mode
2. Tap vào vùng logo "N" ở top center đúng 5 lần trong 2.5 giây
3. **Expected**: FPS overlay bật/tắt (không bị block bởi element khác)
4. Kích hoạt warp (scroll nhanh) → FPS overlay tự động xuất hiện

## Scenario 6: Alt-tab Edge Case
1. Đang trong warp mode
2. Alt+Tab khỏi browser
3. **Expected**: Warp pool reset, state về IDLE khi quay lại
