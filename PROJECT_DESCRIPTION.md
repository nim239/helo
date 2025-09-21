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

### Gỡ lỗi Sprite Animation (Sprite Animation Debugging)

Trong quá trình phát triển, sprite animation đã gặp một số lỗi, đặc biệt là trên thiết bị di động. Dưới đây là tổng kết các vấn đề và giải pháp để tham khảo trong tương lai.

1.  **Lỗi Vị Trí Sprite (Positioning Issue):**
    *   **Vấn đề:** Sprite ban đầu có `position: static` hoặc bị `ScrollSmoother` gán một giá trị `top` rất lớn (ví dụ: `40088px`), khiến sprite bị đẩy ra khỏi màn hình.
    *   **Nguyên nhân:** Tương tác phức tạp giữa `ScrollSmoother` và thuộc tính `position: fixed`, đặc biệt trên thiết bị di động (cảm ứng).
    *   **Giải pháp:** Cấu hình `ScrollSmoother` với `effects: true` (để có hiệu năng tốt nhất) và quan trọng là `smoothTouch: true`. Tùy chọn `smoothTouch` kích hoạt một chế độ xử lý riêng cho thiết bị cảm ứng, giúp giải quyết xung đột về vị trí.

2.  **Lỗi Hiển Thị Khung Hình (Frame Rendering Issue):**
    *   **Vấn đề:** Trên iPhone, các khung hình của sprite bị "chia đôi", "xé hình", hiển thị không chính xác.
    *   **Nguyên nhân:** Lỗi làm tròn của trình duyệt (browser rounding error) khi sử dụng `background-size` dựa trên đơn vị phần trăm (`%`). Kích thước tổng của spritesheet không phải là một bội số chính xác của kích thước mỗi khung hình, dẫn đến sai lệch khi tính `background-position`.
    *   **Giải pháp:** Thay đổi cách tính `background-size` từ phần trăm sang pixel tuyệt đối. Kích thước tổng của spritesheet được tính bằng `frameWidth * COLS` và `frameHeight * ROWS`. Điều này đảm bảo sự chính xác tuyệt đối và loại bỏ lỗi làm tròn.

3.  **Lỗi Animation Bị Khởi Tạo Lại (Animation Re-initialization Bug):**
    *   **Vấn đề:** Sau khi tái chế DOM (cuộn qua block 6), animation của sprite tự động chạy (dù đã dừng cuộn) một cách "ì ạch", không phản hồi với thao tác cuộn nhanh của người dùng. Sau vài giây, nó đột ngột "nhảy" tới một frame đúng.
    *   **Nguyên nhân:** Toàn bộ `useEffect` chịu trách nhiệm thiết lập GSAP (bao gồm cả animation intro 4 giây) đã bị chạy lại liên tục mỗi khi state thay đổi. Điều này là do dependency array của `useEffect` đã bị cấu hình sai, tạo ra một chuỗi phản ứng không mong muốn. Animation "ì ạch" chính là intro animation đang chạy lại.
    *   **Giải pháp:** Đảm bảo `useEffect` thiết lập animation chỉ chạy **duy nhất một lần** khi component được tải, bằng cách thay đổi dependency array của nó thành `[]`. Đồng thời, ổn định hóa hàm `handleScroll` (vốn được dùng bên trong `useEffect`) bằng `useCallback` và `useRef` để tránh việc nó bị tạo lại không cần thiết.

## Các hướng tiếp cận kiến trúc thay thế (Alternative Architectural Approaches)

Khi gặp phải các vấn đề phức tạp về hiệu năng và đồng bộ giữa animation và cuộn vô hạn, các hướng tiếp cận sau đây đã được xem xét như những giải pháp thay thế mang tính cốt lõi.

### Phương án 1: Dùng thư viện "Virtualization" chuyên dụng (Kiến trúc lại Vòng lặp & DOM)

-   **Cốt lõi:** Thay vì tự quản lý việc "tái chế DOM", chúng ta sẽ sử dụng một thư viện chuyên dụng như `react-window` hoặc TanStack Virtual.
-   **Cách hoạt động:** Thư viện chỉ render các phần tử đang hiển thị trong viewport, và tái sử dụng các DOM node khi người dùng cuộn. Điều này cực kỳ hiệu quả về hiệu năng và bộ nhớ. Logic cuộn và animation sẽ được đơn giản hóa rất nhiều vì không còn hiện tượng "nhảy" scroll nhân tạo.
-   **Ưu điểm:** Hiệu năng cao, ổn định, code của ứng dụng đơn giản hơn. Đây là giải pháp tiêu chuẩn của ngành cho các danh sách dài.
-   **Nhược điểm:** Cần thêm thư viện mới và cấu trúc lại một phần code.

### Phương án 2: Dùng CSS Scroll-Linked Animations (Kiến trúc lại Animation)

-   **Cốt lõi:** Giao phó toàn bộ việc chạy animation từ JavaScript cho trình duyệt bằng tính năng CSS mới `@scroll-timeline`.
-   **Cách hoạt động:** Buộc trực tiếp tiến trình của một CSS animation vào vị trí của thanh cuộn. Animation có thể chạy trên luồng riêng của GPU, hoàn toàn không bị ảnh hưởng bởi sự "giật lag" của JavaScript.
-   **Ưu điểm:** Có khả năng cho ra animation mượt mà nhất có thể, tách biệt hoàn toàn logic animation và logic ứng dụng.
-   **Nhược điểm:** Công nghệ còn rất mới, chưa được hỗ trợ đầy đủ bởi tất cả các trình duyệt lớn (đặc biệt là Safari, Firefox).

### Phương án 3: Dùng `<canvas>` (Kiến trúc lại toàn bộ)

-   **Cốt lõi:** Từ bỏ DOM, coi toàn bộ trang web như một "cảnh game" và vẽ mọi thứ lên một thẻ `<canvas>` bằng thư viện đồ họa (`PixiJS`, `Three.js`).
-   **Cách hoạt động:** Toàn quyền kiểm soát việc render, animation, và tương tác. "Tái chế" xảy ra tự nhiên bằng cách không vẽ các đối tượng nằm ngoài khung nhìn.
-   **Ưu điểm:** Hiệu năng cực cao cho các hiệu ứng đồ họa phức tạp, toàn quyền kiểm soát hình ảnh.
-   **Nhược điểm:** Phải viết lại gần như toàn bộ project, rất phức tạp. Gây ảnh hưởng tiêu cực lớn đến SEO và khả năng tiếp cận (accessibility) của trang web.

**Đề xuất:** Phương án 1 là giải pháp thực tế, cân bằng và hiệu quả nhất để giải quyết các vấn đề hiện tại.
