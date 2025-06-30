import { Geist, Geist_Mono } from "next/font/google";
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



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" style={{ background: "linear-gradient(120deg, #f5f5f5 0%, #e0e0e0 100%)" }}>
      <head>
        {/* メタ・OGP・アイコン類はmetadataに移譲 */}
        {/* カスタムフォントはglobals.cssにも指定推奨 */}
      </head>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable} 
          antialiased 
          font-sans
          bg-gradient-to-br from-white via-[#f5f5f5] to-[#e0e8eb]
          text-[#2e2e2e] min-h-screen
          selection:bg-gold-200 selection:text-emerald-700
        `}
        style={{
          fontFamily: 'Noto Sans JP, Yu Gothic, Arial, Helvetica, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
