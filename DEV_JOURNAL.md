### Cập nhật ngày 2026-07-23 (Post-MVP Pivot)
- **Hoàn thiện Core Engine**: Đã đập đi xây lại 100% code cũ. Tích hợp Lenis (cuộn), Zustand (Quản lý State & Teleport), GSAP (Sprite).
- **UX Pivot (Thay đổi quan trọng)**: Đã hủy bỏ tính năng "Dwell-to-Play" (Dừng cuộn chuột thì dừng băng chuyền Marquee ngang). Thực tế test cho thấy trải nghiệm bị khựng, kém mượt mà ("như cứt"). 
  - **Quyết định mới**: Marquee ngang trôi vĩnh viễn không bao giờ dừng. Video bên trong luôn auto-play khi lọt vào Viewport. 
  - **Tối ưu VRAM (Rule of 3)**: Vì video chạy liên tục, đã áp dụng chuẩn kỹ thuật `IntersectionObserver` để ép flush VRAM (`removeAttribute('src')` và `.load()`) ngay khi video trôi ra khỏi màn hình, tránh crash Safari trên iOS.
- **Dọn dẹp Git**: Đã xóa sạch code rác của Project cũ, push nguyên 1 bộ Next.js App Router trắng tinh lên Github nhánh `001-exhibition-portfolio`.
