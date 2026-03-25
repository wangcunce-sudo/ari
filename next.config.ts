import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // 允许 next/image 从 Cloudinary 加载图片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // 环境变量（非 NEXT_PUBLIC_ 前缀的只在服务端可用）
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  },
};

export default nextConfig;
