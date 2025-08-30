"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaChevronUp } from "react-icons/fa";
import Image from "next/image";

type Props = {
  onSearchClick: () => void;
};

/**
 * 改良点
 * - ガラス面 + ヘアライン（金） + ほのかな影：サイトの高級トーンに統一
 * - スクロール下で隠れ／上で再表示（モバイル読みやすさUP）
 * - ページ進捗バー（下端）をゴールドグラデで表示
 * - "/" キーで検索モーダル起動（入力中は無効）
 * - ロゴ文言を短縮 + サブタイトルで視認性UP
 * - Skip to content 対応（#main にフォーカスジャンプ）
 */
export default function StickyHeader({ onSearchClick }: Props) {
  const router = useRouter();

  const lastY = useRef(0);
  const [pinned, setPinned] = useState(false);   // ちょいスクロールでガラス化
  const [hidden, setHidden] = useState(false);   // 下スクロールで隠す
  const [progress, setProgress] = useState(0);   // 読了率

  // スクロール監視
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setPinned(y > 8);

      const delta = y - lastY.current;
      // 下に大きく動いたら非表示、上に動いたら表示（しきい値は10px）
      if (Math.abs(delta) > 10) setHidden(delta > 0 && y > 80);
      lastY.current = y;

      // 進捗
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const denom = Math.max(1, docH - winH);
      setProgress(Math.min(1, Math.max(0, y / denom)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/" キーで検索を開く（入力中は無効）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = document.activeElement as HTMLElement | null;
      const isTyping = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (isTyping) return;
      e.preventDefault();
      onSearchClick();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSearchClick]);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  // 動的クラス
  const base =
    "sticky top-0 z-50 transition-transform duration-200 will-change-transform";
  const showHide = hidden ? "-translate-y-full" : "translate-y-0";
  const glass =
    "bg-white/65 backdrop-blur-md border-b border-[#ecd98b66] shadow-[0_6px_28px_0_rgba(212,175,55,0.12)]";
  const plain =
    "bg-transparent border-b border-transparent shadow-none";
  const headerClass = `${base} ${pinned ? glass : plain} ${showHide}`;

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-md focus:shadow"
      >
        本文へスキップ
      </a>

      <header className={headerClass} aria-label="グローバルヘッダー">
        <div className="max-w-[1080px] mx-auto h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between">
          {/* ロゴ */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 focus:outline-none group"
            aria-label="トップページに戻る"
          >
            <Image
              src="/phoc.png"
              alt="サイトロゴ"
              width={36}
              height={36}
              className="rounded-full border border-[#d4af37]/40 shadow-sm"
              priority
            />
            <div className="flex flex-col leading-tight text-left">
              <span
                className="text-[13px] sm:text-sm font-bold tracking-[0.08em] text-[#2a2a2a] group-hover:underline"
                style={{ fontFamily: '"Playfair Display","Noto Serif JP",serif' }}
              >
                The Parkhouse Kamishakujii
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-[#6b7280] -mt-[2px]">
                Residence Official Site
              </span>
            </div>
          </button>

          {/* 操作 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#192349] text-white text-[13.5px] font-semibold shadow hover:bg-[#314485] transition focus:ring-2 focus:ring-[#314485] focus:outline-none"
              aria-label="サイト内検索を開く（/キーでも開きます）"
              title="検索（/）"
            >
              <FaSearch />
              <span className="hidden sm:inline">検索</span>
            </button>

            {/* トップへ（モバイルはヘッダー内、PCは常時表示でOK） */}
            <button
              onClick={handleScrollTop}
              className="ml-1 px-2 py-2 rounded-full bg-white/70 backdrop-blur border border-[#e5e7eb] text-[#192349] shadow hover:bg-white transition"
              aria-label="トップに戻る"
              title="トップに戻る"
            >
              <FaChevronUp />
            </button>
          </div>
        </div>

        {/* 進捗バー（ゴールドグラデ） */}
        <div className="h-[2px] w-full bg-transparent">
          <div
            className="h-[2px] rounded-r-full"
            style={{
              width: `${progress * 100}%`,
              background:
                "linear-gradient(90deg, #fffbe6 0%, #ecd98b 55%, #bfa14a 100%)",
              boxShadow: progress > 0 ? "0 0 8px #ecd98b88" : "none",
              transition: "width .12s linear",
            }}
            aria-hidden
          />
        </div>
      </header>
    </>
  );
}
