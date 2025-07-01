"use client";
import React, { useState } from "react";
import { Parallax } from "react-scroll-parallax";
import TabSwiperBar from "@/components/TabSwiperBar";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <header
      className="w-full relative z-40 overflow-visible font-sans"
      style={{
        marginTop: "0px", // StickyBarの高さぶん上にズラす（要調整）
        paddingTop: "0px",
      }}
    >
      {/* 台座パララックス背景 */}
      <Parallax
        speed={20}
        className="absolute left-0 top-0 w-full sm:h-[120px] h-[88px] z-0 pointer-events-none select-none"
        style={{
          backgroundImage: 'url("/svg/1623.svg")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          opacity: 0.93, // わずかに透過を足すとラグジュアリー
        }}
      >
        <svg width="100%" height="120" viewBox="0 0 1400 112" fill="none">
          <defs>
            <linearGradient id="goldGlass" x1="0" y1="0" x2="1400" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fffbe6" />
              <stop offset="0.36" stopColor="#f7e9b4" stopOpacity="0.9" />
              <stop offset="0.48" stopColor="#ecd98b" stopOpacity="0.34" />
              <stop offset="0.68" stopColor="#d4af37" stopOpacity="0.14" />
              <stop offset="1" stopColor="#ececec" stopOpacity="0.14" />
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

      {/* お知らせバー */}
      <div className="hidden sm:flex justify-center my-4 sm:my-7 px-4 sm:px-0">
        <div className="w-full max-w-[900px] bg-white/85 rounded-2xl flex items-center gap-6 px-6 sm:px-14 py-3 sm:py-4 font-medium text-[16.5px] sm:text-[19px] shadow-[0_6px_36px_0_rgba(212,175,55,0.09)] border border-[#ede8d4] backdrop-blur-[8px]">
          <span className="text-[#3d3300] font-semibold tracking-tight text-[16.5px] sm:text-[19px]">
            西武鉄道新宿線の連続立体交差事業
          </span>
          <button className="bg-gradient-to-r from-[#f9eab5] via-[#ecd98b] to-[#d4af37] text-[#645b34] rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-[14px] sm:text-[15.5px] font-bold ml-3 shadow-lg hover:brightness-110 hover:scale-105 transition-all border border-[#ecd98b]/60">
            進捗状況
          </button>
          <span className="text-gray-400 text-[14.5px] sm:text-[15.5px] font-normal ml-4">
            検討委員会広報
          </span>
        </div>
      </div>

      {/* モバイルお知らせバー */}
      <div className="sm:hidden flex justify-center my-3 px-4">
        <div className="w-full bg-white/80 rounded-2xl flex items-center gap-4 px-4 py-2.5 font-medium text-[15px] shadow-[0_4px_24px_0_rgba(212,175,55,0.07)] border border-[#ede8d4] backdrop-blur-[7px]">
          <button
            className="w-full text-center bg-gradient-to-r from-[#f9eab5] via-[#ecd98b] to-[#d4af37] text-[#665c35] rounded-full px-4 py-2 font-bold shadow hover:brightness-110 transition-all"
            onClick={toggleDrawer}
          >
            西武鉄道新宿線の連続立体交差事業
          </button>
        </div>
      </div>

      {/* ドロワー（お知らせバー詳細表示） */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-opacity-60 bg-black z-50 flex justify-center items-center sm:hidden"
          onClick={toggleDrawer}
        >
          <div
            className="bg-white rounded-2xl p-6 w-11/12 max-w-[400px] shadow-xl border border-[#ede8d4]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-[#3d3300]">西武鉄道新宿線の連続立体交差事業情報</h2>
            <p className="text-base mb-5 text-gray-700">
              ここに詳細情報が入ります。内容について詳しく説明します。
            </p>
            <button
              className="bg-gradient-to-r from-[#ecd98b] to-[#d4af37] text-[#3d3300] rounded-full px-8 py-2 font-bold"
              onClick={toggleDrawer}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* タブバー（モバイル・メニュー展開ボタン） */}
      <div className="sm:hidden block relative pt-2 pb-3 z-20">
        <div className="max-w-[1240px] mx-auto relative">
          <button
            onClick={toggleDrawer}
            className="w-full text-center bg-gradient-to-r from-[#f9eab5]/80 via-[#fffbe6]/55 to-transparent opacity-90 py-3 text-[16px] font-semibold rounded-full shadow hover:brightness-110 transition-all"
          >
            メニューを表示
          </button>
        </div>
      </div>

      {/* タブバー（通常モード・PC） */}
      <div className="hidden sm:block pt-3 pb-5 z-20">
        <div className="max-w-[1440px] mx-auto relative">
          <TabSwiperBar />
        </div>
      </div>
    </header>
  );
}
