"use client";
import React from "react";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
};

export default function EditorTitleSlug({
  title,
  setTitle,
  slug,
  setSlug,
}: Props) {
  return (
    <div className="flex w-full max-w-md gap-2 mb-2 text-gray-900">
      {/* タイトル */}
      <input
        className="flex-[7] rounded-md border px-3 py-2 text-base font-bold bg-white text-gray-900 placeholder-gray-400 caret-gray-900 shadow focus:ring-2 ring-blue-200 transition min-w-0"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
        aria-label="記事タイトル"
      />

      {/* スラッグ */}
      <input
        className="flex-[3] rounded-md border px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 caret-gray-900 shadow focus:ring-2 ring-blue-200 transition min-w-0"
        placeholder="スラッグ"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        autoComplete="off"
        aria-label="スラッグ"
        inputMode="url"
        pattern="^[a-z0-9_-]+$"
        title="半角英数字・ハイフン・アンダースコアのみ"
      />
    </div>
  );
}
