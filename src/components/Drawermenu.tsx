"use client";
import React, { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Drawermenu({ open, onClose }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`
        fixed inset-0 z-[100] transition-all duration-400
        flex flex-col
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      style={{
        background: "linear-gradient(120deg, #faf8ef 0%, #f5ecd8 85%, #ece1c4 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ドロワーの内容自体をスクロール可にする */}
      <div className="relative flex-1 overflow-y-auto overscroll-contain max-h-screen">
        {/* 閉じるボタン */}
        <button
          className="
            fixed top-6 right-6 sm:top-7 sm:right-12
            bg-white/90 border border-[#dfc68e] rounded-full px-5 py-2
            text-gray-300 font-bold text-2xl shadow-md
            hover:bg-[#fff7d7] transition-all
            z-[101]
          "
          onClick={onClose}
          style={{ lineHeight: "0.8", fontSize: "1.0rem" }}
          aria-label="メニューを閉じる"
        >
          ×
        </button>

        {/* サーチ・言語選択 */}
        <div className="flex flex-col sm:flex-row justify-end items-center pt-20 sm:pt-16 pr-6 sm:pr-20 gap-5 sm:gap-8 w-full">
          <button className="border border-gold-600 px-5 py-2 rounded-full text-gray-300 font-bold bg-white hover:bg-[#fff7d7] transition shadow-sm">
            English
          </button>
          <div className="relative w-full sm:w-auto max-w-xs">
            <input
              type="text"
              placeholder="サイト内を検索"
              className="px-6 py-2 rounded-full border border-gray-300 text-[15px] outline-none shadow-sm bg-white min-w-[140px] sm:min-w-[220px] w-full sm:w-auto text-gray-800"
              style={{
                fontFamily: "Noto Sans JP, Yu Gothic, Arial, sans-serif",
                letterSpacing: "0.01em",
              }}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gold-600 font-bold text-xl bg-transparent"
              tabIndex={-1}
            >
              <svg width={20} height={20} fill="none" viewBox="0 0 20 20">
                <circle cx="9" cy="9" r="7.5" stroke="#be9b52" strokeWidth="2" />
                <path d="M15 15l-3-3" stroke="#be9b52" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* メインメニュー */}
        <div className="
          w-full flex flex-wrap justify-center gap-6 sm:gap-8 mt-10 mb-7
          px-2 sm:px-0
        ">
          {[
            { label: "ログイン", color: "linear-gradient(100deg,#fffbe6 0%,#fff8dc 90%)" },
            { label: "イベント", color: "linear-gradient(100deg,#f4ede2 0%,#fcf6ea 100%)" },
            { label: "施設・サービス", color: "linear-gradient(90deg,#f2efdb 0%,#ebe2ca 100%)" },
            { label: "管理組合", color: "linear-gradient(100deg,#faf4e0 0%,#f8ecd8 100%)" },
            { label: "管理室より", color: "linear-gradient(90deg,#f7ead9 0%,#efe1c9 100%)" },
          ].map((item, i) => (
            <div
              key={i}
              className="
                flex flex-col items-center justify-center
                shadow-xl rounded-2xl px-8 py-6 min-w-[135px] min-h-[68px] font-semibold text-[16px]
                border border-[#e8dab3] transition-all hover:scale-105
                cursor-pointer
                w-full sm:w-auto
              "
              style={{
                background: item.color,
                color: "#bfa15a",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* ナビセクション */}
        <div className="
          w-full flex flex-col sm:flex-row justify-between px-4 sm:px-24 mt-8 gap-6 sm:gap-0
        ">
          {/* 物件情報 */}
          <div>
            <div className="font-bold text-[18px] text-[#bfa15a] mb-2">管理組合</div>
            <ul className="text-[15px] text-gray-700 font-light space-y-1">
              <li>🏢 管理組合</li>
              <li>理事会</li>
              <li>管理室より</li>
            </ul>
          </div>
          {/* コミュニティ */}
          <div>
            <div className="font-bold text-[18px] text-[#bfa15a] mb-2">コミュニティ</div>
            <ul className="text-[15px] text-gray-700 font-light space-y-1">
              <li>検討委員会</li>
              <li>防災委員会</li>
              <li>季節イベント</li>
            </ul>
          </div>
          {/* プレミアムサービス */}
          <div>
            <div className="font-bold text-[18px] text-[#bfa15a] mb-2">サービス</div>
            <ul className="text-[15px] text-gray-700 font-light space-y-1">
              <li>地域情報</li>
              <li>お問合せ</li>
              <li>FAQ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
