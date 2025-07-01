"use client";
import React from "react";

const DEFAULT_CATEGORY_MAP: { [key: string]: string } = {
  vision: "ビジョン",
  specs: "仕様",
  announcement: "お知らせ",
  usecase: "活用事例",
  research: "調査",
  culture: "文化",
  technology: "技術",
  education: "教育",
  policy: "方針",
  philosophy: "理念",
  worldview: "世界観",
  uncategorized: "未分類"
};

type Props = {
  categories: string[];
  selected: string;
  setSelected: (cat: string) => void;
  categoryMap?: Record<string, string>;
};

export default function CategorySwiper({
  categories,
  selected,
  setSelected,
  categoryMap,
}: Props) {
  // categoryMapをprops優先で
  const map = categoryMap ?? DEFAULT_CATEGORY_MAP;

  return (
    <div className="overflow-x-auto whitespace-nowrap px-2 mb-6">
      <div className="inline-flex gap-2">
        <button
          onClick={() => setSelected("")}
          className={`px-4 py-1.5 rounded-full font-medium text-sm 
            ${selected === "" ? "bg-[#192349] text-white" : "bg-gray-200 text-gray-600"}
            transition-all duration-150`}
        >
          すべて
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`px-4 py-1.5 rounded-full font-medium text-sm
              ${selected === cat ? "bg-[#192349] text-white" : "bg-gray-100 text-gray-600"}
              transition-all duration-150`}
          >
            {map[cat] || cat}
          </button>
        ))}
      </div>
    </div>
  );
}
