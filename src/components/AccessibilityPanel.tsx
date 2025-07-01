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
        fixed bottom-6 right-6 z-40
        bg-[#f5cf64] hover:bg-[#f7e9b4] text-[#192349]
        rounded-full shadow-xl px-5 py-4 font-bold
        flex items-center gap-2 transition-all duration-200
        border-2 border-[#ecd98b]
      "
      style={{
        fontSize: "1.23rem",
        letterSpacing: "0.02em",
        boxShadow: "0 6px 28px #ecd98b44",
      }}
      aria-label="アクセシビリティ設定を開く"
    >
      {/* アイコン (例: ユニバーサルアクセス) */}
      <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="14" fill="#fffbe6" />
        <path d="M14 9v7" stroke="#bfa14a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="8" r="1.4" fill="#bfa14a" />
        <path d="M7 13h14M9.5 17l4.5-3 4.5 3" stroke="#bfa14a" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">アクセシビリティ</span>
    </button>
  );
}
