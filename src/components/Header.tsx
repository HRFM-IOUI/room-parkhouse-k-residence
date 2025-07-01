"use client";
import React, { useState } from "react";
import { Parallax } from "react-scroll-parallax";
import TabSwiperBar from "@/components/TabSwiperBar";

// ブランド用Serif（Google Fonts推奨）
const brandFont = '"Playfair Display", "Noto Serif JP", serif';

export default function Header() {
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  return (
    <header
      className="w-full relative z-40 font-sans"
      style={{
        marginTop: "0px",
        paddingTop: "0px",
        background: "linear-gradient(180deg, #f5efdb 60%, #fffbe6 100%)",
      }}
    >
      {/* 台座パララックス背景 */}
      <div className="relative w-full h-[96px] sm:h-[140px]">
        <Parallax
          speed={18}
          className="absolute left-0 top-0 w-full h-full z-0 pointer-events-none select-none"
          style={{
            backgroundImage: 'url("/svg/1623.svg")',
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            opacity: 0.97,
            filter: "blur(0.5px)",
          }}
        >
          {/* ゴールドの輝きレイヤー */}
          <div
            className="absolute left-0 top-0 w-full h-full z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, #fffbe6 0%, #ecd98b 45%, #f7e9b4 60%, #fffbe6 100%)",
              opacity: 0.12,
            }}
          />
          {/* 台座SVG */}
          <svg width="100%" height="112" viewBox="0 0 1400 112" fill="none" className="relative z-20">
            <defs>
              <linearGradient id="goldGlass" x1="0" y1="0" x2="1400" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fffbe6" />
                <stop offset="0.34" stopColor="#f7e9b4" stopOpacity="0.97" />
                <stop offset="0.5" stopColor="#ecd98b" stopOpacity="0.3" />
                <stop offset="0.8" stopColor="#d4af37" stopOpacity="0.12" />
                <stop offset="1" stopColor="#ececec" stopOpacity="0.08" />
              </linearGradient>
              <filter id="noise" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="turb" />
                <feColorMatrix in="turb" type="saturate" values="0.22" />
                <feBlend in2="SourceGraphic" mode="soft-light" />
              </filter>
            </defs>
            <path
              d="M0,13 H1400 Q1400,112 700,112 Q0,112 0,13 Z"
              fill="url(#goldGlass)"
              filter="url(#noise)"
            />
          </svg>
        </Parallax>
        {/* 光沢の水平ライン */}
        <div className="absolute top-0 left-0 w-full h-[9px] bg-gradient-to-r from-white/0 via-white/80 to-white/0 blur-sm opacity-70 z-30" />
      </div>

      {/* お知らせバー配置エリア（PCとスマホでabsolute配置・paddingで間隔調整） */}
      <div className="relative w-full">
        {/* --- PC（absolute配置で-60px上） --- */}
        <div
          className="hidden sm:flex justify-center px-4 sm:px-0 absolute w-full left-0"
          style={{ top: "-60px", zIndex: 20 }}
        >
          <div
            className="w-full max-w-[900px] bg-white/90 rounded-3xl flex items-center gap-7 px-8 sm:px-16 py-4 sm:py-5 font-medium text-[17.5px] sm:text-[21px] shadow-[0_8px_40px_0_rgba(212,175,55,0.11)] border border-[#ecd98b]/60 backdrop-blur-[9px]"
            style={{
              boxShadow: "0 4px 32px 0 rgba(212,175,55,0.08), 0 1px 8px 0 #f9eab5a0",
              border: "1.5px solid #ecd98b66",
            }}
          >
            <span
              className="text-[#3d3300] font-bold tracking-tight"
              style={{
                fontFamily: brandFont,
                fontSize: "1.32em",
                letterSpacing: "0.01em",
              }}
            >
              西武鉄道連続立体交差事業
            </span>
            <button
              className="bg-gradient-to-r from-[#fffbe6] via-[#ecd98b] to-[#d4af37] text-[#685b21] rounded-full px-6 py-2.5 text-[16px] font-bold ml-4 shadow-lg border border-[#f9eab5]/60 hover:brightness-110 hover:scale-[1.07] transition-all duration-200"
              style={{
                boxShadow: "0 2px 8px 0 #ecd98b33, 0 1px 8px 0 #fffbe680",
                borderWidth: "1.1px",
                textShadow: "0 1px 10px #fff8  ",
              }}
            >
              進捗状況
            </button>
            <span className="text-gray-400 text-[15.5px] font-normal ml-6 tracking-wide" style={{
              fontFamily: '"Noto Sans JP", Arial, sans-serif',
              letterSpacing: "0.08em",
            }}>
              <span className="inline-block align-middle text-[13.5px] font-bold mr-1 opacity-60">|</span>
              検討委員会広報
            </span>
          </div>
        </div>

        {/* --- スマホ（absolute配置で-38px上） --- */}
        <div
          className="sm:hidden flex justify-center px-2 absolute left-0 w-full"
          style={{ top: "-45px", zIndex: 20 }}
        >
          <div className="w-full bg-white/85 rounded-2xl flex items-center gap-3 px-3 py-1.5 font-medium text-[15px] shadow-[0_4px_24px_0_rgba(212,175,55,0.07)] border border-[#ede8d4] backdrop-blur-[7px]">
            <button
              className="w-full text-center bg-gradient-to-r from-[#f9eab5] via-[#ecd98b] to-[#d4af37] text-[#665c35] rounded-full px-3 py-1.5 font-bold shadow hover:brightness-110 transition-all"
              style={{ fontSize: "15px", fontFamily: brandFont }}
              onClick={() => setIsNoticeOpen(true)}
            >
              西武鉄道連続立体交差事業
            </button>
          </div>
        </div>

        {/* お知らせバー分の余白確保 */}
        <div className="pt-[48px] sm:pt-[66px]" />

        {/* タブバー */}
        <div>
          <TabSwiperBar />
        </div>
      </div>

      {/* モバイル用 お知らせ詳細モーダル */}
      {isNoticeOpen && (
        <div
          className="fixed inset-0 bg-opacity-60 bg-black z-50 flex justify-center items-center sm:hidden"
          onClick={() => setIsNoticeOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-7 w-11/12 max-w-[390px] shadow-2xl border border-[#ecd98b] relative"
            style={{
              boxShadow: "0 8px 36px 0 #d4af3766, 0 1px 10px 0 #fffbe6bb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-2xl font-bold mb-4 text-[#3d3300]"
              style={{
                fontFamily: brandFont,
                letterSpacing: "0.02em",
                textShadow: "0 1px 6px #fffbe6aa",
              }}
            >
              西武鉄道連続立体交差事業情報
            </h2>
            <p className="text-base mb-5 text-gray-700 opacity-85"
              style={{
                fontFamily: '"Noto Sans JP", Arial, serif',
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}>
              ここに詳細情報が入ります。内容について詳しく説明します。
            </p>
            <button
              className="bg-gradient-to-r from-[#ecd98b] to-[#d4af37] text-[#3d3300] rounded-full px-8 py-2 font-bold shadow"
              style={{
                fontFamily: brandFont,
                textShadow: "0 1px 8px #fffbe6cc",
              }}
              onClick={() => setIsNoticeOpen(false)}
            >
              閉じる
            </button>
            {/* ゴールドの光筋 */}
            <div className="absolute -top-2 left-0 w-full h-[5px] bg-gradient-to-r from-transparent via-[#ffd70066] to-transparent blur-md opacity-70" />
          </div>
        </div>
      )}
    </header>
  );
}
