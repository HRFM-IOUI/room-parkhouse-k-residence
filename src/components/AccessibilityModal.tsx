"use client";
import React from "react";

export default function AccessibilityModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div
        className="
          bg-white w-[90vw] max-w-md p-7
          rounded-2xl shadow-2xl border border-[#ecd98b]/60
          transition-all duration-300 ease-in-out
        "
        style={{
          boxShadow:
            "0 8px 36px #ecd98b77, 0 1.5px 7px #fffbe633",
        }}
      >
        <h2 className="text-xl font-extrabold mb-4 text-[#bfa14a] drop-shadow-sm text-left">
          アクセシビリティ設定
        </h2>

        {/* フォントサイズ切替 */}
        <div className="mb-5">
          <p className="mb-2 font-semibold text-[#192349] text-left">文字サイズ</p>
          <div className="flex gap-3">
            <button
              onClick={() => setFontSize("small")}
              className="px-5 py-2 rounded-full bg-gradient-to-br from-[#fffbe6] to-[#ecd98b]/80 border border-[#ecd98b]/50 text-[#bfa14a] font-bold shadow hover:brightness-110 transition"
            >
              S
            </button>
            <button
              onClick={() => setFontSize("medium")}
              className="px-5 py-2 rounded-full bg-gradient-to-br from-[#fffbe6] to-[#ecd98b]/90 border border-[#ecd98b]/70 text-[#bfa14a] font-bold shadow hover:brightness-110 transition"
            >
              M
            </button>
            <button
              onClick={() => setFontSize("large")}
              className="px-5 py-2 rounded-full bg-gradient-to-br from-[#ffe396] to-[#ecd98b] border border-[#ecd98b] text-[#bfa14a] font-bold shadow hover:brightness-110 transition"
            >
              L
            </button>
          </div>
        </div>

        {/* カラーモード切替 */}
        <div className="mb-6">
          <p className="mb-2 font-semibold text-[#192349] text-left">カラーモード</p>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("normal")}
              className="px-5 py-2 rounded-full bg-white border border-[#ecd98b]/60 text-[#bfa14a] font-bold shadow hover:bg-[#fffbe6] transition"
            >
              通常
            </button>
            <button
              onClick={() => setTheme("light")}
              className="px-5 py-2 rounded-full bg-[#faf7eb] border border-[#ecd98b]/70 text-[#bfa14a] font-bold shadow hover:bg-[#fffbe6] transition"
            >
              ライト
            </button>
            <button
              onClick={() => setTheme("dark")}
              className="px-5 py-2 rounded-full bg-[#192349] border border-[#ecd98b]/70 text-white font-bold shadow hover:bg-[#444] transition"
            >
              ダーク
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="
            w-full mt-2 py-3 rounded-full
            bg-gradient-to-br from-[#ffe396] to-[#ecd98b]
            text-[#bfa14a] font-extrabold text-lg shadow-md
            hover:bg-[#ffd700] hover:text-white transition-all
          "
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
