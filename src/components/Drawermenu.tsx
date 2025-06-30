"use client";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Drawermenu({ open, onClose }: Props) {
  return (
    <div
      className={`
        fixed inset-0 z-[100] transition-all duration-400
        ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      style={{
        background: "linear-gradient(120deg, rgba(230,242,237,0.98) 0%, rgba(255,255,255,0.97) 75%, rgba(239,225,188,0.98) 100%)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* 閉じるボタン */}
      <button
        className="absolute top-7 right-12 bg-white/80 border border-emerald-300 rounded-full px-5 py-2 text-emerald-700 font-bold text-lg shadow hover:bg-emerald-50 transition-all"
        onClick={onClose}
      >
        ×
      </button>

      {/* サーチ・言語選択 */}
      <div className="flex justify-end items-center pt-14 pr-20 gap-7">
        <button className="border border-emerald-600 px-6 py-2 rounded-full text-emerald-700 font-bold bg-white hover:bg-emerald-50 transition shadow">
          English
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="サイト内を検索"
            className="px-6 py-2 rounded-full border border-gray-300 text-sm outline-none shadow-sm bg-white min-w-[220px] max-w-[70vw]"
            style={{
              fontFamily: "Noto Sans JP, Yu Gothic, Arial, sans-serif",
              letterSpacing: "0.01em",
            }}
          />
          <button className="absolute right-2 top-1.5 text-emerald-600 font-bold text-xl bg-transparent">
            <svg width={20} height={20} fill="none" viewBox="0 0 20 20">
              <circle cx="9" cy="9" r="7.5" stroke="#047857" strokeWidth="2" />
              <path d="M15 15l-3-3" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* メインメニュー（アイコン/丸角カード/アクセントカラー） */}
      <div className="w-full flex flex-wrap justify-center gap-8 mt-14 mb-8">
        {[
          { label: "マイページ", color: "linear-gradient(90deg,#e0eafc,#cfdef3)" },
          { label: "ギャラリー", color: "linear-gradient(90deg,#f2e7de,#f6eee3)" },
          { label: "施設・サービス", color: "linear-gradient(90deg,#d9f9ec,#e8f5e9)" },
          { label: "イベント", color: "linear-gradient(90deg,#fffbe6,#fff8dc)" },
          { label: "プレミアム会員", color: "linear-gradient(90deg,#e2f1e7,#ede8f5)" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center shadow-xl rounded-2xl px-12 py-6 min-w-[170px] min-h-[80px] font-semibold text-[17px] border border-[#ececec] transition-all hover:scale-105"
            style={{
              background: item.color,
              color: "#047857",
            }}
          >
            {/* SVGアイコンをここに */}
            {item.label}
          </div>
        ))}
      </div>

      {/* ナビセクション */}
      <div className="w-full flex justify-between px-24 mt-10">
        {/* 物件情報 */}
        <div>
          <div className="font-bold text-[19px] text-gold-700 mb-3">物件情報</div>
          <div className="flex flex-row gap-14">
            <div>
              <div className="flex items-center font-semibold text-emerald-700 mb-2">🏢 住まい</div>
              <ul className="text-[15px] text-gray-700 font-light">
                <li>フロアプラン</li>
                <li>ルームタイプ</li>
                <li>価格・ご契約</li>
                <li>見学予約</li>
              </ul>
            </div>
          </div>
        </div>
        {/* コミュニティ */}
        <div>
          <div className="font-bold text-[19px] text-gold-700 mb-3">コミュニティ</div>
          <ul className="text-[15px] text-gray-700 font-light">
            <li>イベント情報</li>
            <li>住民限定ページ</li>
            <li>ご意見・ご要望</li>
          </ul>
        </div>
        {/* プレミアムサービス */}
        <div>
          <div className="font-bold text-[19px] text-gold-700 mb-3">プレミアムサービス</div>
          <ul className="text-[15px] text-gray-700 font-light">
            <li>コンシェルジュ</li>
            <li>お問合せ</li>
            <li>FAQ</li>
          </ul>
        </div>
      </div>

      {/* 地域・法人情報 */}
      <div className="w-full flex flex-wrap justify-center mt-14 gap-8 px-20 text-gray-600 text-sm">
        <div className="flex gap-2">
          <span className="font-bold text-emerald-700">地域情報</span>
          {["北海道", "東北", "関東", "東海", "関西", "中国", "四国", "九州"].map((r, i) => (
            <span key={i} className="px-2">{r}</span>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <span className="font-bold text-emerald-700">法人のお客さま</span>
          <span>法人向けサービス・お問い合わせ</span>
        </div>
      </div>
      {/* 追加フッター要素もOK */}
    </div>
  );
}
