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
        className="absolute left-0 top-0 w-full sm:h-[112px] h-[80px] z-0 pointer-events-none select-none"
        style={{
          backgroundImage: 'url("/svg/1623.svg")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <svg width="100%" height="120" viewBox="0 0 1400 112" fill="none">
          <defs>
            <linearGradient id="goldGlass" x1="0" y1="0" x2="1400" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fffbe6" />
              <stop offset="0.45" stopColor="#d4af37" stopOpacity="0.17" />
              <stop offset="1" stopColor="#e9ecef" stopOpacity="0.15" />
            </linearGradient>
            <filter id="noise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.90" numOctaves="1" result="turb" />
              <feColorMatrix in="turb" type="saturate" values="0.2" />
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
      <div className="hidden sm:flex justify-center my-3 sm:my-6 px-4 sm:px-0">
        <div className="w-full max-w-[720px] bg-white/90 rounded-2xl flex items-center gap-5 px-4 sm:px-10 py-3 sm:py-4 font-medium text-[16px] sm:text-[18px] shadow-[0_4px_32px_0_rgba(47,125,104,0.06)] border border-[#ececec] backdrop-blur-[2px]">
          <span className="text-[#222] font-semibold tracking-tight">
            令和6年9月能登登大雨災害関連情報
          </span>
          <button className="bg-gradient-to-r from-emerald-600 via-green-500 to-gold-400 text-white rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-[14px] sm:text-[15px] font-bold ml-2 sm:ml-4 shadow hover:brightness-110 transition">
            障害情報
          </button>
          <span className="text-gray-500 text-[14px] sm:text-[15px] font-normal ml-2 sm:ml-4">
            携帯電話サービス
          </span>
        </div>
      </div>

      {/* モバイルお知らせバーのドロワー展開 */}
      <div className="sm:hidden flex justify-center my-3 sm:my-6 px-4 sm:px-0">
        <div className="w-full bg-white/90 rounded-2xl flex items-center gap-5 px-4 sm:px-10 py-3 sm:py-4 font-medium text-[14px] sm:text-[18px] shadow-[0_4px_32px_0_rgba(47,125,104,0.06)] border border-[#ececec] backdrop-blur-[2px]">
          <button
            className="w-full text-center bg-gradient-to-r from-emerald-600 via-green-500 to-gold-400 text-white rounded-full px-4 py-1.5 sm:px-5 sm:py-2 text-[14px] sm:text-[15px] font-bold"
            onClick={toggleDrawer}
          >
            令和6年9月能登登大雨災害関連情報
          </button>
        </div>
      </div>

      {/* ドロワー（お知らせバー詳細表示） */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-opacity-75 bg-black z-50 flex justify-center items-center sm:hidden"
          onClick={toggleDrawer}
        >
          <div
            className="bg-white rounded-2xl p-6 w-3/4"
            onClick={(e) => e.stopPropagation()} // ドロワーのクリックを閉じないように
          >
            <h2 className="text-xl font-semibold mb-4">令和6年9月能登登大雨災害関連情報</h2>
            <p className="text-base mb-4">
              ここに詳細情報が入ります。内容について詳しく説明します。
            </p>
            <button
              className="bg-gradient-to-r from-emerald-600 via-green-500 to-gold-400 text-white rounded-full px-6 py-2"
              onClick={toggleDrawer}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* タブバー（モバイルでのドロワー展開） */}
      <div className="sm:hidden block relative pt-2 sm:pt-3 pb-3 sm:pb-5 z-20">
        <div className="max-w-[1240px] mx-auto relative">
          <button
            onClick={toggleDrawer}
            className="w-full text-center bg-gradient-to-r from-[#ececec]/80 via-[#fffbe6]/55 to-transparent opacity-90 py-3 text-[16px] font-semibold"
          >
            メニューを表示
          </button>
        </div>
      </div>

      {/* タブバー（通常モード） */}
      <div className="block sm:flex sm:pt-3 pb-3 sm:pb-5 z-20 hidden">
        <div className="max-w-[1240px] mx-auto relative">
          <TabSwiperBar />
        </div>
      </div>
    </header>
  );
}
