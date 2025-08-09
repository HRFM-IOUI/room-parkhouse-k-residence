"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

// カテゴリ日本語変換
function categoryJa(category?: string[] | string): string {
  const dict: { [key: string]: string } = {
    "理事会": "理事会", "検討委員会": "検討委員会", "管理組合": "管理組合", "暮らしと防災": "暮らしと防災", "管理室": "管理室",
   "その他": "その他",
    // 既存の対応も残してOK
    vision: "ビジョン", specs: "仕様", announcement: "お知らせ", usecase: "活用事例",
    research: "リサーチ", culture: "カルチャー", technology: "技術", education: "教育",
    policy: "方針", philosophy: "理念", worldview: "世界観", uncategorized: "未分類",
  };
  if (Array.isArray(category)) {
    return category.length
      ? category.map(cat => dict[cat] || cat).join(" / ")
      : "未分類";
  } else {
    return (category && dict[category]) ? dict[category] : "未分類";
  }
}

const DEFAULT_IMAGE = "/wmLOGO.png";
function formatDate(dateVal: string | number | { seconds?: number }): string {
  if (!dateVal) return "";
  let d: Date;
  if (typeof dateVal === "object" && "seconds" in dateVal && typeof dateVal.seconds === "number") {
    d = new Date(dateVal.seconds * 1000);
  } else {
    d = new Date(dateVal as string | number);
  }
  return `発行日：${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

type HighlightPost = {
  id: string;
  title: string;
  blocks?: { type: string; content: string }[];
  image?: string;
  category?: string[];  
  createdAt: string | number | { seconds?: number };
};
type Props = { posts: HighlightPost[]; };

export default function HighlightCarousel({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <div className="w-full mb-10">
      <div className="flex gap-7 overflow-x-auto pb-4 px-2 scroll-smooth snap-x snap-proximity min-w-0">
        {posts.map((post) => {
          const firstImage =
            post.blocks?.find((b) => b.type === "image" && b.content)?.content ||
            post.image ||
            DEFAULT_IMAGE;

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className={`
                flex-shrink-0 w-[275px] sm:w-[305px] md:w-[335px]
                bg-gradient-to-b from-[#f8fafd] via-[#f5f8fe] to-[#e6eaf2]
                rounded-2xl shadow-[0_3px_18px_#19234913,0_1.5px_10px_#aaa2]
                border border-[#e1e7f1]/60 group
                hover:shadow-[0_7px_28px_#23408c15] hover:-translate-y-1
                transition-all duration-200 snap-start
              `}
              style={{
                fontFamily: "'Noto Serif JP', '游明朝', serif",
                boxShadow: "0 4px 16px #233d5521, 0 2px 8px #4f62b22a",
              }}
            >
              {/* 画像 */}
              <div className="h-44 w-full relative rounded-t-2xl overflow-hidden bg-[#f5f8fa]">
                <Image
                  src={firstImage}
                  alt={post.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.04]"
                  style={{
                    background: "#f5f8fa",
                    borderBottom: "1px solid #e6eaf3",
                  }}
                  sizes="(max-width: 600px) 100vw, 320px"
                />
              </div>
              <div className="p-5 pb-4 bg-white/80 rounded-b-2xl flex flex-col min-h-[110px]">
                {/* カテゴリ複数対応 */}
                <span className="inline-block bg-gradient-to-r from-[#e6eaf3]/80 to-[#f8fafd]/90
                  text-xs text-[#22345b] font-bold px-3 py-1 rounded-full mb-2 tracking-wide border border-[#d3d7e9] shadow-sm">
                  {categoryJa(post.category)}
                </span>
                <h2
                  className="
                    text-base sm:text-lg font-extrabold text-[#192349]
                    mb-1 line-clamp-2 group-hover:underline transition-all
                  "
                  style={{
                    fontFamily: "'Noto Serif JP', '游明朝', serif",
                    letterSpacing: "0.015em",
                  }}
                >
                  {post.title}
                </h2>
                <p className="text-xs text-[#5162a6] font-medium">{formatDate(post.createdAt)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
