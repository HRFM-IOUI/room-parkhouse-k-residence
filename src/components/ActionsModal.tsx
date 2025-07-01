"use client";
import React from "react";
import Link from "next/link"; // Linkコンポーネントのインポート

type Props = {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
};

export default function ActionsModal({ isOpen, onClose, searchTerm, setSearchTerm }: Props) {
  if (!isOpen) return null;

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-20 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-auto shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          ×
        </button>

        <h2 className="text-lg font-semibold text-[#192349] mb-4">簡単クイック操作</h2>

        {/* 🔍 検索 */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title..."
          className="mb-4 w-full px-4 py-2 rounded-full border border-gray-300"
        />

        {/* ⬆ Topへ戻る */}
        <button
          onClick={scrollTop}
          className="w-full mb-3 py-2 rounded-full bg-gray-100 text-[#192349] hover:bg-gray-200"
        >
          ⬆ ページ上部へ
        </button>

        {/* 🏠 トップページへ遷移 */}
        <Link
          href="/"
          className="block text-center py-2 rounded-full bg-[#e3e8fc] text-[#192349] hover:bg-[#d0d6f7] transition"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
}
