import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js 15.1+ blocks requests from network IPs by default (DNS rebinding
  // protection). This allowlist lets you access the dev server from any device
  // on your local network — safe for development, has no effect in production.
  allowedDevOrigins: ['172.21.112.1', '192.168.0.*', '192.168.1.*', '10.0.0.*', '10.0.1.*'],
};

export default nextConfig;
