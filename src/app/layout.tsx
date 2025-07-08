import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

/* ======= 公式メタデータ ========== */
export const metadata = {
  metadataBase: new URL("https://www.the-parkhouse-kamishakujii-residence-official.site/"),
  title: "ザ・パークハウス上石神井レジデンス公式サイト",
  description:
    "管理組合・管理会社公認。ザ・パークハウス上石神井レジデンスの最新情報やお知らせ・議事録を発信しています。",
  openGraph: {
    title: "ザ・パークハウス上石神井レジデンス公式サイト",
    description: "管理組合・管理会社公認の公式情報サイトです。",
    url: "https://www.the-parkhouse-kamishakujii-residence-official.site/",
    siteName: "ザ・パークハウス上石神井レジデンス公式",
    images: [
      {
        url: "/phoc.png", // OGP画像（正方形・ロゴの場合そのままOK）
        width: 800,
        height: 800,
        alt: "ザ・パークハウス上石神井レジデンス ロゴ",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico", // favicon.ico優先でもOK
    apple: "/apple-touch-icon.png", // 180x180にしてpublicに置く
  },
  twitter: {
    card: "summary_large_image",
    title: "ザ・パークハウス上石神井レジデンス公式サイト",
    description: "管理組合・管理会社公認の公式情報サイトです。",
    images: ["/phoc.png"],
    // site: "@公式Xアカウント", // あれば
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" style={{ background: "linear-gradient(120deg, #f5f5f5 0%, #e0e0e0 100%)" }}>
      <head />
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} ${playfair.variable}
          antialiased 
          font-sans
          bg-gradient-to-br from-white via-[#f5f5f5] to-[#e0e8eb]
          text-[#2e2e2e] min-h-screen
          selection:bg-gold-200 selection:text-emerald-700
        `}
        style={{
          fontFamily: "Noto Sans JP, Yu Gothic, Arial, Helvetica, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
