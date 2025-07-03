"use client";
import React from "react";
import { FaBars } from "react-icons/fa"; // ハンバーガー

type Props = {
  onSearchClick: () => void;
};

export default function StickyHeader({ onSearchClick }: Props) {
  return (
    <header
      className="
        sticky top-0 z-50
        bg-white/85 backdrop-blur-lg
        border-b border-[#ecd98b]/50
        shadow-[0_4px_38px_0_rgba(212,175,55,0.07)]
        px-0 py-3
      "
      style={{
        fontFamily: '"Playfair Display", "Noto Serif JP", serif',
        boxShadow: "0 6px 32px 0 #ecd98b11, 0 1px 8px 0 #fffbe620",
      }}
    >
      <div className="max-w-[1200px] mx-auto flex justify-between items-center px-4 sm:px-6">
        {/* 左ラベル（クリックでトップ） */}
        <a
          href="/"
          className="
            text-[1.15rem] sm:text-[1.33rem] font-extrabold tracking-tight
            text-[#bfa14a] hover:text-[#d4af37]
            transition-all select-none
            px-2 py-1 rounded-xl
            bg-gradient-to-r from-[#fffbe6]/80 via-[#fffbe6]/50 to-[#ecd98b]/20
            shadow-[0_2px_10px_0_rgba(212,175,55,0.09)]
            border border-[#ecd98b]/30
            flex items-center gap-2
          "
          style={{
            fontFamily: '"Playfair Display", "Noto Serif JP", serif',
            letterSpacing: "0.03em",
            textShadow: "0 2px 14px #ecd98b66, 0 0.5px 2px #fffbe6",
          }}
        >
          The Parkhouse Kamishakujii Residence
        </a>

        {/* 右アイコン */}
        <button
          onClick={onSearchClick}
          className="
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-gradient-to-tr from-[#fffbe6] via-[#ecd98b]/40 to-[#fffbe6]/70
            border border-[#ecd98b]/60 shadow
            text-[#bfa14a] hover:text-[#d4af37]
            hover:bg-[#fffbe6] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#ecd98b]/60
          "
          aria-label="メニューを開く"
        >
          <FaBars size={22} />
        </button>
      </div>
    </header>
  );
}
