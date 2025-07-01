"use client";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AccessibilityModal({ open, onClose }: Props) {
  if (!open) return null;

  // フォントサイズ切替
  const setFontSize = (size: "small" | "medium" | "large") => {
    document.body.classList.remove("font-small", "font-medium", "font-large");
    document.body.classList.add(`font-${size}`);
  };

  // カラーモード切替
  const setTheme = (theme: "normal" | "light" | "dark") => {
    document.body.classList.remove("theme-normal", "theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div
        className="
          relative bg-white rounded-3xl shadow-2xl
          p-7 sm:p-9 w-[92vw] max-w-lg
          border border-[#ecd98b]/70
          flex flex-col gap-7
        "
        style={{
          boxShadow: "0 8px 42px 0 #ecd98b33, 0 1.5px 8px 0 #fffbe680",
          alignItems: "flex-start", // 中身を左寄せ
        }}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="
            absolute top-4 right-4 w-9 h-9 rounded-full 
            bg-gradient-to-tr from-[#fffbe6] to-[#ecd98b]
            border border-[#ecd98b]/60
            text-[#bfa14a] text-2xl font-bold shadow-sm
            hover:bg-[#fff7d7] transition-all z-20
          "
          style={{ lineHeight: "0.9" }}
        >
          ×
        </button>

        <h2 className="text-xl font-extrabold mb-2 text-[#bfa14a] drop-shadow-sm text-left">
          アクセシビリティ設定
        </h2>

        {/* フォントサイズ切替 */}
        <div className="w-full">
          <p className="mb-2 font-semibold text-[#192349] text-left">文字サイズ</p>
          <div className="flex gap-3">
            <button
              onClick={() => setFontSize("small")}
              className="px-5 py-2 rounded-full bg-gradient-to-br from-[#fffbe6] to-[#ecd98b]/70 border border-[#ecd98b]/50 text-[#bfa14a] font-bold shadow hover:brightness-105 transition"
            >
              S
            </button>
            <button
              onClick={() => setFontSize("medium")}
              className="px-5 py-2 rounded-full bg-gradient-to-br from-[#fffbe6] to-[#ecd98b]/90 border border-[#ecd98b]/60 text-[#bfa14a] font-bold shadow hover:brightness-105 transition"
            >
              M
            </button>
            <button
              onClick={() => setFontSize("large")}
              className="px-5 py-2 rounded-full bg-gradient-to-br from-[#ffe396] to-[#ecd98b] border border-[#ecd98b] text-[#bfa14a] font-bold shadow hover:brightness-105 transition"
            >
              L
            </button>
          </div>
        </div>

        {/* カラーモード切替 */}
        <div className="w-full">
          <p className="mb-2 font-semibold text-[#192349] text-left">カラーモード</p>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("normal")}
              className="px-5 py-2 rounded-full bg-white border border-[#ecd98b]/50 text-[#bfa14a] font-bold shadow hover:bg-[#fffbe6] transition"
            >
              通常
            </button>
            <button
              onClick={() => setTheme("light")}
              className="px-5 py-2 rounded-full bg-[#faf7eb] border border-[#ecd98b]/60 text-[#bfa14a] font-bold shadow hover:bg-[#fffbe6] transition"
            >
              ライト
            </button>
            <button
              onClick={() => setTheme("dark")}
              className="px-5 py-2 rounded-full bg-[#192349] border border-[#ecd98b]/60 text-white font-bold shadow hover:bg-[#444] transition"
            >
              ダーク
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
