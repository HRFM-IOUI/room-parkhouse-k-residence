"use client";
import React from "react";

type Props = {
  onSearchClick: () => void;
};

export default function StickyHeader({ onSearchClick }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#192349]">RooM-NewS</h1>
        <div className="flex gap-2">
          <button
            onClick={onSearchClick}
            className="px-4 py-1.5 rounded-full bg-[#192349] text-white text-sm hover:bg-[#2a3770] transition"
            aria-label="Open Search Modal" // アクセシビリティ向上のためaria-label追加
          >
            ☮
          </button>
        </div>
      </div>
    </header>
  );
}
