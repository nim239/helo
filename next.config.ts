import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN testing for mobile dev
  // @ts-expect-error (in case NextConfig type isn't updated in this version)
  allowedDevOrigins: ['192.168.1.93', 'localhost'],
};

export default nextConfig;
