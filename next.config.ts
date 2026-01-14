import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // إعدادات مهمة لـ Netlify
  trailingSlash: false,
};

export default nextConfig;
