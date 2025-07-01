"use client";
import React from "react";
import { MdAccessibility } from "react-icons/md";

type Props = {
  onOpen: () => void;
};

export default function AccessibilityFloatingButton({ onOpen }: Props) {
  return (
    <div
      className="
        fixed bottom-5 left-5 z-50
        pointer-events-none
      "
      style={{ minWidth: 0 }}
    >
      <button
        onClick={onOpen}
        aria-label="アクセシビリティ設定を開く"
        className="
          pointer-events-auto flex items-center gap-2
          px-6 py-3 rounded-full
          bg-gradient-to-r from-[#ffe396] to-[#ecd98b]
          text-[#bfa14a] font-extrabold text-base
          shadow-lg border border-[#ecd98b]/60
          hover:brightness-110 hover:scale-105
          active:drop-shadow-xl transition-all duration-200
          backdrop-blur-md
        "
        style={{
          boxShadow: "0 4px 24px #ecd98b55, 0 1.5px 8px #fffbe650",
        }}
      >
        <MdAccessibility size={22} className="inline-block" />
        アクセシビリティ
      </button>
    </div>
  );
}
