"use client";
import React from "react";

// ... icons 配列は省略せずそのままでOK ...

export default function FooterSection() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#fcfbf9] via-[#f6f6f6] to-[#ebe7df] pt-14 pb-0 border-t border-[#e6dece] relative overflow-hidden">
      {/* 奥行きガラスエフェクト */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse 90% 62% at 70% 70%,rgba(212,175,55,0.06) 0%,rgba(0,80,80,0.03) 90%,rgba(255,255,255,0.10) 100%)",
            filter: "blur(1.2px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-r from-[#e6e4d7]/50 via-[#e2c979]/35 to-[#f7f5e7]/20 blur-[3px] opacity-70"
        />
      </div>

      {/* 1. ソーシャルアイコン */}
      <div className="relative flex flex-col items-center mb-9 z-10">
        <div className="flex gap-8 mb-6">
          {/* ... 省略なし ... */}
        </div>
        <button className="rounded-full border border-[#b3b296] px-8 py-2 font-semibold text-[#746d5a] shadow-sm bg-white/90 hover:bg-[#efe9d5] transition-all duration-150">
          公式ソーシャルメディア一覧へ
        </button>
      </div>

      {/* 2. ゴールドライン帯ナビ（SVGなし） */}
      <div className="w-full relative flex justify-center items-center py-5 z-10">
        <div className="relative flex w-full justify-center gap-20 text-[#a99e7a] font-semibold text-[16px] tracking-wide z-10">
          <a className="hover:underline hover:text-[#bdae75]" href="#">
            お知らせ
          </a>
          <a className="hover:underline hover:text-[#bdae75]" href="#">
            管理組合
          </a>
        </div>
      </div>

      {/* 3. リンク群 */}
      <div className="w-full bg-white py-8 pb-4 border-t border-[#e7e0c9] z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-start gap-x-12 gap-y-3 text-[#7b7361] text-[14.5px] border-b border-[#e2dbc6] pb-2 font-light">
            <a href="#">パーソナルデータについて</a>
            <a href="#">プライバシーポリシー</a>
            <a href="#">サイトご利用にあたって</a>
            <a href="#">外部送信について</a>
          </div>
          <div className="flex flex-wrap justify-start gap-x-8 gap-y-2 text-[#7b7361] text-[14px] pt-3 pb-2 font-light">
            <a href="#">アクセシビリティ</a>
            <a href="#">サイトメンテナンス</a>
            <a href="#">サイトマップ</a>
            <a href="#">お問い合わせ</a>
            <a href="#">管理組合</a>
            <a href="#">理事会・検討委員会</a>
          </div>
        </div>
      </div>

      {/* 4. コピーライト 最下部（SVG背景）*/}
      <div
        className="w-full bg-gradient-to-r from-[#e8e3c3]/95 via-[#f7eac6]/90 to-white/85 text-center text-[#847b60] font-semibold text-[15px] py-4 border-t border-[#ede3c1] tracking-wide z-10 relative overflow-hidden"
        style={{
          backgroundImage: 'url("/svg/1623.svg")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover", // 必要に応じて "contain"や"100% 60px" など調整
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg,rgba(235, 211, 29, 0.38),rgba(240,232,221,0.13))",
            zIndex: 1,
          }}
        />
        <span className="relative z-10">© 2025 The Parkhouse Kamishakujii Residence</span>
      </div>
    </footer>
  );
}
