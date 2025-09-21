# Portfolio Website cho Motion Designer

## Ý tưởng chính

Đây là một project website portfolio được thiết kế cho một motion designer, với một ý tưởng giao diện độc đáo: tạo ra một trang web có trải nghiệm "scroll vô tận" (infinite scroll) theo một vòng lặp, đi kèm một animation sprite được điều khiển bởi vị trí cuộn.

## Kiến trúc cuối cùng (Final Architecture)

Project được xây dựng dựa trên nền tảng Next.js và GSAP, với các kỹ thuật chính sau đây để cân bằng giữa hiệu năng, trải nghiệm người dùng và khả năng tích hợp các animation phức tạp.

### 1. Nền tảng: "Brute Force" & ScrollSmoother

-   **Cốt lõi:** Thay vì các giải pháp "cuộn ảo" (virtual scroll) phức tạp, kiến trúc này sử dụng phương pháp "brute force": render một danh sách rất dài (600 block) nhưng hữu hạn ra DOM. Điều này tạo ra một trang tĩnh rất cao, là môi trường hoạt động lý tưởng và ổn định nhất cho `ScrollSmoother` của GSAP.
-   **Scroll Mượt & "Hít" (Snap):** `ScrollSmoother` được sử dụng để tạo ra cảm giác cuộn mượt mà, có gia tốc và giảm tốc (`ease`). Tính năng `snap` cũng được tích hợp để sau mỗi lần cuộn, trang sẽ tự động "hít" vào đầu mỗi block, tạo ra một trải nghiệm xem rất chỉn chu và chuyên nghiệp.

### 2. Tối ưu hiệu năng: Lazy Loading Components

-   **Vấn đề:** Render 600 block cùng lúc, đặc biệt là khi chúng chứa các thành phần nặng (video, parallax), sẽ làm crash trình duyệt.
-   **Giải pháp:** Mỗi `ContentBlock` được làm cho "thông minh". Nó sử dụng `ScrollTrigger` của riêng mình để theo dõi vị trí. Ban đầu, nó chỉ là một `div` đơn giản. Chỉ khi nào block đó cuộn vào trong màn hình, một state nội bộ (`isIntersecting`) mới được kích hoạt để render các thành phần nặng. Khi cuộn ra ngoài, các thành phần nặng này sẽ được gỡ bỏ để giải phóng tài nguyên. Bằng cách này, trang luôn có hiệu năng cao.

### 3. Logic Animation & Chuyển cảnh

-   **Tách biệt:** Animation được chia thành 2 giai đoạn rõ ràng: Intro và Main.
-   **Animation Intro:** Một `timeline` của GSAP chạy dựa trên thời gian (4 giây) để play sprite animation từ đầu đến cuối. Trong suốt quá trình này, `ScrollSmoother` bị tạm dừng (`paused: true`), người dùng không thể cuộn trang.
-   **Chuyển cảnh:** Khi animation intro kết thúc (`onComplete`), `ScrollSmoother` sẽ được kích hoạt lại (`paused: false`), cho phép người dùng cuộn. Đồng thời, `ScrollTrigger` chính của animation theo scroll cũng được bật lên (`enable()`).

### 4. Animation Sprite Lặp Vô Tận (Infinitely Looping Sprite Animation)

-   **Cốt lõi:** Một `ScrollTrigger` độc lập được thiết lập để theo dõi toàn bộ quá trình cuộn trang.
-   **Logic lặp:** Trong hàm `onUpdate` của `ScrollTrigger` này, thay vì dùng `progress` (tiến trình tổng 0-1), chúng ta sử dụng vị trí cuộn tuyệt đối (`self.scroll()`) và phép toán **modulo (`%`)**.
    -   `progressInLoop = (scrollDistance % loopDistance) / loopDistance`
-   Công thức này tạo ra một giá trị `progress` lặp lại từ 0 đến 1 trong mỗi `loopDistance` (ví dụ: mỗi 3 lần chiều cao màn hình). Kết quả là animation của sprite sẽ lặp lại vô tận khi người dùng tiếp tục cuộn trang, thay vì chỉ chạy một lần duy nhất.
