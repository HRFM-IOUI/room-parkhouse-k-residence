"use client";
import React from "react";

type Props = {
  onOpen: () => void;
};

export default function AccessibilityPanel({ onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="
        fixed bottom-6 left-6 z-40
        bg-[#ffe396] hover:bg-[#f5cf64] text-[#bfa14a]
        rounded-full shadow-xl px-6 py-4 font-bold
        flex items-center gap-2 transition-all duration-200
        border-2 border-[#ecd98b]
        animate-gold-pulse
      "
      style={{
        fontSize: "1.18rem",
        letterSpacing: "0.03em",
      }}
      aria-label="アクセシビリティ設定を開く"
    >
      {/* アイコン (ユニバーサルアクセス風 or 星) */}
      <svg width="26" height="26" fill="none" viewBox="0 0 28 28">
        <circle cx="13" cy="13" r="13" fill="#fffbe6" />
        <path d="M13 8v7" stroke="#bfa14a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="13" cy="7.5" r="1.1" fill="#bfa14a" />
        <path d="M6.5 12.5h13M9 17l4-2.5 4 2.5" stroke="#bfa14a" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">アクセシビリティ</span>
    </button>
  );
}
