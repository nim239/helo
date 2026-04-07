import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Bỏ qua lỗi lint trong lúc build để deploy nhanh
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi type check trong lúc build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
