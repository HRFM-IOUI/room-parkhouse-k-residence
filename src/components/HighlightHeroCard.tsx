"use client";
import React, { useState, KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import ShareButtons from "@/components/ShareButtons";


function isString(val: unknown): val is string {
  return typeof val === "string";
}
function formatDate(dateVal: string | number | { seconds?: number }): string {
  if (!dateVal) return "";
  let d: Date;
  if (typeof dateVal === "object" && dateVal !== null && "seconds" in dateVal && typeof (dateVal as { seconds: unknown }).seconds === "number") {
    d = new Date((dateVal as { seconds: number }).seconds * 1000);
  } else {
    d = new Date(dateVal as string | number);
  }
  return `発行日：${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}
type Block = { type: "heading" | "text" | "image" | "video"; content: string; };
type Post = {
  id: string;
  title: string;
  blocks?: Block[];
  image?: string;
  category?: string[];   // ← 複数カテゴリに変更
  createdAt: string | number | { seconds?: number };
};
const DEFAULT_IMAGE = "/eyecatch.jpg";

export default function HighlightHeroCard({ post }: { post: Post }) {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);

  // 画像
  const firstImage =
    isString(post.image)
      ? post.image
      : post.blocks?.find((b) => b.type === "image" && isString(b.content))?.content || DEFAULT_IMAGE;

  // 概要文
  const description =
    post.blocks?.find((b) => b.type === "text" && isString(b.content))?.content?.slice(0, 78) || "";

  // カードクリック
  const handleCardClick = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsFading(true);
    setTimeout(() => {
      router.push(`/posts/${isString(post.id) ? post.id : ""}`);
    }, 220);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") handleCardClick(e);
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: isFading ? 0 : 1, y: isFading ? 20 : 0 }}
      transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
      className={`
        group w-full flex flex-col sm:flex-row
        bg-gradient-to-br from-[#f8fafd] via-[#f5f8fe] to-[#e5eaf3]
        rounded-3xl shadow-[0_2px_18px_#19234913,0_1.5px_10px_#aaa2] border border-[#e7ebf3]
        overflow-hidden hover:shadow-[0_6px_28px_#24325b21] hover:-translate-y-0.5 transition-all duration-200
        min-h-[255px] cursor-pointer relative
      `}
      style={{
        pointerEvents: isFading ? "none" : "auto",
        fontFamily: "'Noto Serif JP', '游明朝', serif",
        background: "linear-gradient(105deg,#f8fafd 80%,#e5eaf3 100%)",
      }}
      tabIndex={0}
      role="button"
      aria-label={`記事を読む: ${isString(post.title) ? post.title : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* 画像エリア */}
      <div className="sm:w-1/2 w-full aspect-[16/10] sm:aspect-auto relative flex-shrink-0 bg-[#e6eaf2]">
        {isString(firstImage) && (
          <Image
            src={firstImage}
            alt={isString(post.title) ? post.title : "サムネイル画像"}
            width={520}
            height={320}
            className="w-full h-full object-cover"
            priority
            style={{
              borderRight: "1px solid #d4d7e3",
              background: "#f5f8fa",
              borderRadius: "0",
            }}
          />
        )}
      </div>
      {/* テキストエリア */}
      <div className="sm:w-1/2 w-full px-8 py-7 flex flex-col justify-center min-w-0 relative bg-white/85">
        {/* カテゴリ（複数バッジで表示） */}
        <div className="flex flex-wrap gap-2 mb-2">
          {(Array.isArray(post.category) ? post.category : []).map((cat) => (
            <span
              key={cat}
              className="inline-block bg-gradient-to-r from-[#e7eaf3]/70 to-[#f8fafd]/90 text-xs text-[#234] font-bold px-3 py-1 rounded-full tracking-wider border border-[#d3d7e9] shadow-sm"
            >
              {cat}
            </span>
          ))}
        </div>
        {/* タイトル */}
        <h2
          className="text-[1.65rem] font-extrabold text-[#192349] mb-3 leading-snug group-hover:underline transition-all"
          style={{
            fontFamily: "'Noto Serif JP', '游明朝', serif",
            letterSpacing: "0.025em",
            textShadow: "0 2px 12px #fff9f5a6",
          }}
        >
          {isString(post.title) ? post.title : ""}
        </h2>
        {/* 概要文 */}
        <p className="text-base text-[#334] mb-2 font-light" style={{ letterSpacing: "0.01em" }}>
          {description}
        </p>
        {/* 日付 */}
        <p className="text-xs text-[#4e5a7c] font-medium">{formatDate(post.createdAt)}</p>
        {/* シェアボタン */}
        <div className="flex justify-end mt-4">
          <ShareButtons title={isString(post.title) ? post.title : ""} />
        </div>
        {/* ホバー演出：右下「続きを読む」 */}
        <span
          className="absolute right-7 bottom-5 text-[1.06rem] text-[#4250a7] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none"
          style={{ letterSpacing: "0.045em" }}
        >
          続きを読む →
        </span>
      </div>
    </motion.div>
  );
}
