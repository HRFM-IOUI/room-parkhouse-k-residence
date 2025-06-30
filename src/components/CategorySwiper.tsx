"use client";
import React from "react";

type Props = {
  categories: string[];
  selected: string;
  setSelected: (cat: string) => void;
};

export default function CategorySwiper({ categories, selected, setSelected }: Props) {
  return (
    <div className="overflow-x-auto whitespace-nowrap px-4 mb-6">
      <div className="inline-flex gap-2">
        <button
          onClick={() => setSelected("")}
          className={`px-4 py-1.5 rounded-full font-medium text-sm ${selected === "" ? "bg-[#192349] text-white" : "bg-gray-200 text-gray-600"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`px-4 py-1.5 rounded-full font-medium text-sm capitalize ${selected === cat ? "bg-[#192349] text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
