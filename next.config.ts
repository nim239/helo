import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js 15+ sử dụng cấu hình này để bỏ qua lỗi khi build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Đối với ESLint, Next.js 15 khuyến khích dùng command line flag hoặc config chuẩn
  // Nếu vẫn muốn bỏ qua trong config:
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
