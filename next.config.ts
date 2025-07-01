import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 ESLintエラーをビルド時に無視する設定
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 他にも必要な設定があればここに追加
  // 例:
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;
