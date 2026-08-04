# Quickstart & Verification Guide: Kinetic Neon Strings Engine

**Feature**: `004-kinetic-neon-strings`  
**Spec Path**: [spec.md](file:///e:/web_2026/helo/specs/004-kinetic-neon-strings/spec.md)

## Prerequisites & Setup

1. Khởi động môi trường phát triển Next.js local:
   ```bash
   npm run dev
   ```
2. Mở trình duyệt truy cập: `http://localhost:3000`

---

## Runnable Verification Scenarios

### Scenario 1: IDLE Sine Wave & 3D Layering Inspection
- **Thao tác**: Giữ nguyên trang web không cuộn chuột trong 2 giây.
- **Kỳ vọng**:
  - Ở 2 bên lề màn hình (cách mép `4vw` trên Mobile và `8vw` trên Desktop), 2 cụm dây LED (mỗi cụm 5 dây) xuất hiện.
  - Sợi dây uốn lượn hình sóng Sin mềm mại.
  - Có lớp hào quang mờ (Glow 12px `screen`) và bóng ma tối lệch bên phải (+30px X) tạo cảm giác lơ lửng 3D.
  - Hạt trôi chậm rãi dọc theo chiều dài dây.

### Scenario 2: Tension Stretch & Velocity Reaction
- **Thao tác**: Cuộn chuột thật nhanh hoặc vuốt mạnh trên cảm ứng.
- **Kỳ vọng**:
  - 5 sợi dây tức thì giật thẳng băng, chập lại làm 1 đường thẳng tắp 1px.
  - Toàn bộ lớp Glow 4px và 12px biến mất ngay lập tức.
  - Các hạt (Dots) bắn vọt với tốc độ cực cao **NGƯỢC CHIỀU CUỘN** (cuộn xuống -> hạt bắn lên; cuộn lên -> hạt bắn xuống).

### Scenario 3: Lifespan Protection Verification
- **Thao tác**: Cuộn nhanh rồi dừng đột ngột (buông tay).
- **Kỳ vọng**:
  - Dây Sine uốn lượn mềm mại trở lại.
  - Các hạt KHÔNG bị biến mất đứt đoạn giữa chừng mà tiếp tục trôi hết đoạn đường còn lại cho tới khi biến mất ở viền màn hình ($Y < 0$ hoặc $Y > 100\text{vh}$).
