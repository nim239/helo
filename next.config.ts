import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',      // build ra site tĩnh
  images: {
    unoptimized: true,   // bắt buộc nếu dùng <Image />
  },
  trailingSlash: true,   // để URL có dấu / tránh lỗi 404
};

export default nextConfig;
