// components/HighlightHeroCard.tsx
"use client";
import React, { useState, KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import ShareButtons from "@/components/ShareButtons";

type Block = { type: "heading" | "text" | "image" | "video"; content: string };
type Post = {
  id: string;
  slug?: string;
  title: string;
  blocks?: Block[];
  image?: string;
  category?: string[];
  createdAt: string | number | { seconds?: number };
};

const FALLBACK_IMG = "/phoc.png";

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function toDate(val: string | number | { seconds?: number }): Date | null {
  if (!val) return null;
  if (typeof val === "object" && "seconds" in val && typeof val.seconds === "number") {
    return new Date(val.seconds * 1000);
  }
  try {
    return new Date(val as string | number);
  } catch {
    return null;
  }
}
function formatDate(dateVal: Post["createdAt"]) {
  const d = toDate(dateVal);
  if (!d) return "";
  return `発行日：${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function HighlightHeroCard({ post }: { post: Post }) {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const firstImage =
    (isString(post.image) && post.image) ||
    post.blocks?.find((b) => b.type === "image" && isString(b.content))?.content ||
    FALLBACK_IMG;

  const description =
    post.blocks?.find((b) => b.type === "text" && isString(b.content))?.content?.slice(0, 90) || "";

  const goDetail = () => {
    const href = post.slug && post.slug.length > 0 ? `/posts/${post.slug}` : `/posts/${post.id}`;
    router.push(href);
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsFading(true);
    setTimeout(goDetail, 180);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") handleCardClick(e);
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: isFading ? 0 : 1, y: isFading ? 16 : 0 }}
      transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`記事を読む: ${post.title ?? ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative w-full flex flex-col sm:flex-row cursor-pointer
        rounded-3xl overflow-hidden
        border border-[#dfe6f0] bg-white/75 backdrop-blur-[2px]
        shadow-[0_2px_14px_rgba(25,35,73,.06)]
        hover:shadow-[0_10px_30px_rgba(25,35,73,.12)] hover:-translate-y-0.5
        transition-all duration-200
      `}
      style={{
        pointerEvents: isFading ? "none" : "auto",
        fontFamily: "'Noto Serif JP', '游明朝', serif",
      }}
    >
      {/* decorative gradient border */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[26px]"
        style={{
          padding: 1,
          background:
            "linear-gradient(135deg, rgba(32,48,92,.18), rgba(0,128,255,.08), rgba(255,255,255,0))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor" as any,
          maskComposite: "exclude",
        }}
      />

      {/* 画像エリア */}
      <div className="sm:w-1/2 w-full aspect-[16/10] sm:aspect-auto relative bg-[#eef3f8]">
        {/* shimmer skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#f4f7fb] to-[#e9eef6]" />
        )}
        <Image
          src={firstImage}
          alt={post.title || "サムネイル画像"}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
          className={`object-cover transition-transform duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-[1.03]`}
          onLoadingComplete={() => setImgLoaded(true)}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-white/0 sm:to-white/0" />
      </div>

      {/* テキストエリア */}
      <div className="sm:w-1/2 w-full px-7 sm:px-8 py-7 sm:py-8 grid content-center gap-3 bg-white/80">
        {/* カテゴリ（複数） */}
        {!!post.category?.length && (
          <div className="flex flex-wrap gap-2 -mt-1">
            {post.category.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center rounded-full border border-[#d8deea] bg-[#f6f9fd] px-3 py-1 text-[11px] font-bold tracking-wider text-[#1f2e52]"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* タイトル */}
        <h2
          className="
            text-[1.55rem] sm:text-[1.7rem] font-extrabold text-[#192349]
            leading-snug tracking-[0.01em]
          "
        >
          {post.title}
        </h2>

        {/* 概要（2行でクリップ） */}
        {description && (
          <p className="text-[0.98rem] text-[#2b3147]/85 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {/* フッタ行 */}
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-[#4e5a7c] font-medium">
            {formatDate(post.createdAt)}
          </p>
          <ShareButtons title={post.title} />
        </div>

        {/* ホバー「続きを読む」 */}
        <span
          className="absolute right-6 bottom-5 text-sm font-bold text-[#2c48a3] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden
        >
          続きを読む →
        </span>
      </div>
    </motion.div>
  );
}
