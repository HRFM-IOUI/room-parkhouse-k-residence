"use client";
import React from "react";
import { MdAccessibility } from "react-icons/md";

type Props = {
  onOpen: () => void;
};

export default function AccessibilityPanel({ onOpen }: Props) {
  return (
    <button
      onClick={onOpen}
      className="
        fixed bottom-6 left-6 z-50
        flex items-center justify-center
        rounded-full
        backdrop-blur-md
        bg-[#192349]/80
        hover:bg-[#253160]
        text-white
        shadow-xl
        transition-all duration-300
        hover:scale-105 active:scale-95
      "
      style={{
        padding: "14px",
        boxShadow: "0 6px 28px #ecd98b44",
      }}
      aria-label="アクセシビリティ設定を開く"
    >
      <MdAccessibility size={24} />
    </button>
  );
}
