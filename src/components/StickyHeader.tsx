"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaChevronUp } from "react-icons/fa";
import Image from "next/image"; // 追加

type Props = {
  onSearchClick: () => void;
};

export default function StickyHeader({ onSearchClick }: Props) {
  const router = useRouter();

  // トップに戻る
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // サイトロゴ押下時にトップページへ遷移
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-2"
      aria-label="グローバルヘッダー"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* サイトロゴ・タイトル */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 font-extrabold text-[#192349] hover:underline text-lg sm:text-2xl focus:outline-none"
          aria-label="トップページに戻る"
        >
          <Image
            src="/phoc.png"
            alt="phoc ロゴ"
            width={36}      // w-7 h-7相当
            height={36}
            className="object-cover rounded-full border-2 border-[#192349]/40 shadow mr-2 sm:w-9 sm:h-9"
            priority
          />
          <span
            className="font-extrabold tracking-wide"
            style={{ letterSpacing: "0.08em" }}
          >
            TheParkhouseKamishakujiiResidenceOfficialSite
          </span>
        </button>

        {/* 検索・トップへ戻るボタン */}
        <div className="flex gap-2">
          {/* 検索ボタン */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#192349] text-white text-base font-semibold shadow hover:bg-[#314485] transition focus:ring-2 focus:ring-[#314485] focus:outline-none"
            aria-label="サイト内検索を開く"
          >
            <FaSearch />
            <span className="hidden sm:inline">検索</span>
          </button>
          {/* トップへ戻るボタン（モバイルのみ表示） */}
          <button
            onClick={handleScrollTop}
            className="block sm:hidden ml-1 px-2 py-2 rounded-full bg-gray-100 text-[#192349] border border-gray-200 shadow hover:bg-gray-200 transition"
            aria-label="トップに戻る"
          >
            <FaChevronUp />
          </button>
        </div>
      </div>
    </header>
  );
}
