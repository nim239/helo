import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 bắt buộc để Next.js tạo file tĩnh trong /out
  images: {
    unoptimized: true, // tránh lỗi ảnh khi export
  },
};

export default nextConfig;
