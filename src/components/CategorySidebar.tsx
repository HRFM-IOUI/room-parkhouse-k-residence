"use client";
import React from "react";

type Props = {
  categories: string[];
  selected: string;
  setSelected: (v: string) => void;
  categoryMap?: Record<string, string>;
};

export default function CategorySidebar({ categories, selected, setSelected, categoryMap = {} }: Props) {
  return (
    <nav
      className={`
        hidden lg:block sticky top-24 z-10 h-[calc(100vh-7rem)]
        min-w-[180px] max-w-[220px] mr-6
        bg-white/60 border-r border-[#e3e8fc] py-6
      `}
    >
      <h3 className="font-bold text-[#192349] text-xl mb-6 ml-4 tracking-wide">カテゴリー</h3>
      <ul className="flex flex-col gap-2">
        <li>
          <button
            className={`
              px-5 py-2 rounded-full text-left w-full font-semibold
              ${selected === "" ? "bg-[#e3e8fc] text-[#192349] shadow" : "text-gray-500 hover:bg-gray-100"}
              transition
            `}
            onClick={() => setSelected("")}
          >
            すべて
          </button>
        </li>
        {categories.map((c) => (
          <li key={c}>
            <button
              className={`
                px-5 py-2 rounded-full text-left w-full font-semibold
                ${selected === c ? "bg-[#5b8dee] text-white shadow" : "text-[#192349] hover:bg-[#f4f7fe]"}
                transition
              `}
              onClick={() => setSelected(c)}
            >
              {categoryMap[c] || c}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
