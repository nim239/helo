# Portfolio Website cho Motion Designer

## Ý tưởng chính

Đây là một project website portfolio được thiết kế cho một motion designer, với một ý tưởng giao diện độc đáo.

Mục tiêu là tạo ra một trang web có trải nghiệm "scroll vô tận" (infinite scroll) theo một vòng lặp (loop). Tạo trang infinite scroll (cuộn vô hạn xuống) hiển thị 6 block content theo chu kỳ 1 2 3 4 5 6 1 2 3 ... (không cần server, front-end tự sinh). Khi cuộn xuống thì thêm block mới, giữ hiệu năng, không để DOM phình to vô tội vạ.

Yêu cầu chức năng (must-have)

Hiển thị các block theo thứ tự lặp lại 1..6.

Auto-load khi người dùng gần chạm đáy (preload trước ~300–600px).

Không giữ tất cả element trong DOM — giới hạn node tối đa (recycle/windowing).

Mỗi block có data-index tuần tự (0,1,2,3,...) để dễ mapping nội dung = index % 6.

Hỗ trợ responsive (desktop/mobile) — layout dạng 1 cột hoặc grid tùy design.

Có loader/placeholder khi tạo batch mới.

Tránh id trùng lặp, đảm bảo a11y (aria labels, keyboard).

Kiến trúc & data model

Template array: templates = [template1, template2, ..., template6] — mỗi phần chứa HTML hoặc data cho block type tương ứng.

Global counter: nextIndex = 0 — index của block tiếp theo để render.

Batch size: số block thêm mỗi lần, ví dụ batchSize = 6 (tạo một vòng 6 block cho đẹp).

DOM limit (node cap): maxNodes = 50 (hoặc 60) — nếu DOM > maxNodes thì remove block cũ từ trên để giữ hiệu năng.

Mapping: khi render block với i = nextIndex, chọn template templates[i % 6].
npm run dev → mở http://localhost:3000 → cuộn mượt.

## Các thay đổi đã thực hiện (Implemented Changes)

-   **Chuyển đổi Infinite Scroll**: Thay đổi từ cơ chế "nhảy cuộn" cố định sang tải động và tái chế DOM để đáp ứng yêu cầu "thêm block mới, giữ hiệu năng, không để DOM phình to vô tội vạ".
-   **Tải động và Tái chế DOM**:
    -   `app/page.tsx` hiện quản lý một danh sách `displayedItems` động, thêm các khối mới khi người dùng cuộn gần cuối trang.
    -   Giới hạn số lượng node DOM tối đa (`maxNodes = 60`) bằng cách loại bỏ các khối cũ nhất khỏi DOM khi vượt quá giới hạn này.
    -   Vị trí cuộn được điều chỉnh để bù đắp cho các khối đã xóa, duy trì trải nghiệm người dùng mượt mà.
-   **`data-index`**: Mỗi `ContentBlock` hiện có thuộc tính `data-index` tuần tự, được sử dụng để ánh xạ nội dung và quản lý `blockRefs`.
-   **Quản lý `blockRefs`**: `blockRefs.current` hiện sử dụng `data-index` làm khóa để theo dõi các phần tử DOM một cách chính xác, ngay cả khi các mục bị xóa khỏi mảng `displayedItems`.
-   **Tích hợp Scroll Listener**: Logic phát hiện cuộn để tải thêm mục đã được di chuyển vào callback `spriteImage.onload` trong `useEffect` chính, đảm bảo `ScrollSmoother` được khởi tạo trước khi thêm trình nghe sự kiện.
-   **Sửa lỗi `useCallback`**: Đã thêm `useCallback` vào câu lệnh import React trong `app/page.tsx` để khắc phục `ReferenceError`.
-   **Tối ưu hóa `useEffect`**: `useEffect` chính thiết lập `ScrollSmoother` và `ScrollTrigger` cho hoạt ảnh sprite hiện có mảng phụ thuộc trống (`[]`), đảm bảo nó chỉ chạy một lần sau khi component mount. Logic lặp cuộn cũ và các phép tính `blockHeight` không cần thiết đã được loại bỏ.
-   **Sửa lỗi hoạt ảnh Sprite**: Đã tinh chỉnh quá trình chuyển đổi từ hoạt ảnh giới thiệu sang hoạt ảnh được điều khiển bằng cuộn. `ScrollTrigger` cho hoạt ảnh sprite hiện được tạo với `scrub: true` ngay từ đầu, nhưng bị vô hiệu hóa trong quá trình hoạt ảnh giới thiệu (`introTl`). Sau khi `introTl` hoàn tất, `ScrollTrigger` được kích hoạt (`spriteScrollTrigger.enable()`) để cho phép cuộn điều khiển hoạt ảnh. Điều này giải quyết các vấn đề về nhảy khung hình và dừng hoạt ảnh không mong muốn.
-   **Sửa lỗi cú pháp**: Đã khắc phục các lỗi phân tích cú pháp liên quan đến cấu trúc `useEffect` và tải `spriteImage`, bao gồm việc loại bỏ mã trùng lặp và đảm bảo tất cả các dấu ngoặc nhọn và dấu ngoặc đơn được khớp đúng cách.