import type { NextConfig } from "next";

// Firebase Storage 由来の画像を next/image で扱えるようにする
const nextConfig: NextConfig = {
  // ✅ ビルド時 ESLint エラーを無視（あなたの現設定を維持）
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ 外部画像ドメインの許可（Firebase Storage）
  images: {
    remotePatterns: [
      // 標準のダウンロードURL
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      // 将来のURL形態や署名URLの違いに備えて保険で許可
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      // （必要なら追加例：自前CDNや別バケットなど）
      // { protocol: "https", hostname: "cdn.example.com", pathname: "/**" },
    ],
  },

  // 任意：必要ならここに他の設定を追加
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;
