import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN testing for mobile dev
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.93', 'localhost'],
};

export default nextConfig;
