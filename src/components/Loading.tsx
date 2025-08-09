// src/components/Loading.tsx
"use client";
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      {/* サークル型SVGアニメ */}
      <svg
        className="animate-spin mb-4"
        width={60}
        height={60}
        viewBox="0 0 50 50"
      >
        <circle
          className="opacity-25"
          cx="25" cy="25" r="20"
          fill="none" stroke="#b2d1ff" strokeWidth="6"
        />
        <circle
          className="opacity-80"
          cx="25" cy="25" r="20"
          fill="none" stroke="#2471c7" strokeWidth="6"
          strokeDasharray="90, 150"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-xl font-bold text-blue-900 tracking-wide">Loading...</div>
      <div className="mt-2 text-sm text-blue-600">しばらくお待ちください</div>
    </div>
  );
}
