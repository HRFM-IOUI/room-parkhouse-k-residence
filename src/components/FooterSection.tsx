"use client";
import React from "react";
import { useRouter } from "next/navigation";

const icons = [
  { src: "/svg/logo-black.png", label: "X", href: "#https://twitter.com/parkhouse_kamiR/" },
  { src: "/svg/line-icon.png", label: "LINE", href: "https://line.me/R/ti/p/@667zhzws" },
];

export default function FooterSection() {
  const router = useRouter();

  return (
    <footer className="w-full bg-gradient-to-b from-[#fcfbf9] via-[#f6f6f6] to-[#ebe7df] pt-20 pb-0 border-t border-[#e6dece] relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 85% 55% at 70% 76%,rgba(212,175,55,0.08) 0%,rgba(0,80,80,0.01) 90%,rgba(255,255,255,0.13) 100%)",
            filter: "blur(1.3px)",
          }}
        />
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-r from-[#e6e4d7]/65 via-[#e2c979]/30 to-[#f7f5e7]/18 blur-[4px] opacity-80" />
      </div>

      {/* ソーシャルアイコン */}
      <div className="relative flex flex-col items-center mb-11 z-10">
        <div className="flex gap-8 mb-7">
          {icons.map((icon) => (
            <a
              href={icon.href}
              key={icon.label}
              aria-label={icon.label}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-white via-[#f4e2b8] to-[#ede1b6] shadow-sm border border-[#ecd98b]/45 hover:scale-105 hover:shadow-md hover:bg-[#fffbe6] transition-all"
              style={{ boxShadow: "0 2px 8px #ecd98b33" }}
              target={icon.label === "LINE" ? "_blank" : undefined}
              rel={icon.label === "LINE" ? "noopener noreferrer" : undefined}
            >
              <img src={icon.src} alt={icon.label} className="w-5 h-5" />
            </a>
          ))}
        </div>
        <button
          className="rounded-full border border-[#b3b296] px-8 py-2 font-semibold text-[#746d5a] shadow-sm bg-white/95 hover:bg-[#efe9d5] transition-all duration-150"
          style={{
            fontFamily: '"Playfair Display", "Noto Serif JP", serif',
            letterSpacing: "0.02em",
            fontWeight: 600,
            boxShadow: "0 2px 10px #ecd98b22",
          }}
        >
          公式ソーシャルメディア一覧
        </button>
      </div>

      {/* ゴールドライン帯ナビ */}
      <div className="w-full relative flex justify-center items-center py-4 z-10">
        <div className="relative flex w-full justify-center gap-20 text-[#a99e7a] font-semibold text-[16.5px] tracking-wide z-10">
          <a className="hover:underline hover:text-[#bdae75] transition" href="#">
            お知らせ
          </a>
          <a className="hover:underline hover:text-[#bdae75] transition" href="#">
            管理組合
          </a>
        </div>
      </div>

      {/* リンク群 */}
      <div className="w-full bg-white/97 py-10 pb-5 border-t border-[#e7e0c9] z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-start gap-x-12 gap-y-3 text-[#7b7361] text-[15.3px] border-b border-[#e2dbc6] pb-2 font-light">
            <a href="#">プライバシーポリシー</a>
            <a href="#">サイトご利用にあたって</a> 
          </div>
          <div className="flex flex-wrap justify-start gap-x-8 gap-y-2 text-[#7b7361] text-[14.2px] pt-3 pb-2 font-light">
            <a href="#">アクセシビリティ</a>
            <a href="#">サイトマップ</a>
            <button
              onClick={() => router.push("/contact")}
              className="hover:underline hover:text-[#bdae75] transition cursor-pointer"
            >
              お問い合わせ
            </button>
            <a href="#">管理組合</a>
            <a href="#">理事会・検討委員会</a>
          </div>
        </div>
      </div>

      {/* コピーライト */}
      <div
        className="w-full bg-gradient-to-r from-[#e8e3c3]/95 via-[#f7eac6]/90 to-white/85 text-center text-[#847b60] font-semibold text-[15.5px] py-4 border-t border-[#ede3c1] tracking-wide z-10 relative overflow-hidden"
        style={{
          backgroundImage: 'url("/svg/1623.svg")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg,rgba(235, 211, 29, 0.33),rgba(240,232,221,0.14))",
            zIndex: 1,
          }}
        />
        <span
          className="relative z-10"
          style={{
            fontFamily: '"Playfair Display", "Noto Serif JP", serif',
            letterSpacing: "0.02em",
            textShadow: "0 1px 10px #fffbe688",
          }}
        >
          © 2025 The Parkhouse Kamishakujii Residence
        </span>
      </div>
    </footer>
  );
}
