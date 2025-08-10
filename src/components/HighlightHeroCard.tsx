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

const isString = (v: unknown): v is string => typeof v === "string";
const toDate = (val: Post["createdAt"]) =>
  typeof val === "object" && val && "seconds" in val && typeof (val as any).seconds === "number"
    ? new Date((val as any).seconds * 1000)
    : new Date(val as any);
const formatDate = (v: Post["createdAt"]) => {
  const d = toDate(v);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `発行日：${y}年${m}月${day}日`;
};

export default function HighlightHeroCard({ post }: { post: Post }) {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const firstImage =
    (isString(post.image) && post.image) ||
    post.blocks?.find((b) => b.type === "image" && isString(b.content))?.content ||
    FALLBACK_IMG;

  const description =
    post.blocks?.find((b) => b.type === "text" && isString(b.content))?.content?.slice(0, 90) ||
    "";

  const goDetail = () => {
    router.push(post.slug && post.slug.length > 0 ? `/posts/${post.slug}` : `/posts/${post.id}`);
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsFading(true);
    setTimeout(goDetail, 160);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") handleCardClick(e);
  };

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: isFading ? 0 : 1, y: isFading ? 14 : 0 }}
      transition={{ duration: 0.18, ease: [0.33, 1, 0.68, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`記事を読む: ${post.title ?? ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="
        group relative w-full flex flex-col sm:flex-row cursor-pointer
        rounded-xl overflow-hidden
        border border-[#e6ebf2] bg-white
        shadow-[0_2px_10px_rgba(22,35,65,.06)]
        hover:border-[#cfd8e6] hover:shadow-[0_8px_22px_rgba(22,35,65,.12)]
        transition-all duration-200
      "
      style={{
        pointerEvents: isFading ? "none" : "auto",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
      }}
    >
      {/* 画像 */}
      <div className="sm:w-1/2 w-full aspect-[16/10] sm:aspect-auto relative bg-[#f3f6fa]">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#f7f9fc] to-[#eef3f8]" />
        )}
        <Image
          src={firstImage}
          alt={post.title || "サムネイル画像"}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
          className={`object-cover transition-transform duration-300 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-[1.02]`}
          onLoadingComplete={() => setImgLoaded(true)}
        />
      </div>

      {/* テキスト */}
      <div className="sm:w-1/2 w-full px-7 sm:px-8 py-7 sm:py-8 grid content-center gap-3 bg-white">
        {!!post.category?.length && (
          <div className="flex flex-wrap gap-1.5 -mt-1">
            {post.category.map((cat) => (
              <span
                key={cat}
                className="px-2 py-[2px] text-[10px] font-bold rounded border border-[#e1e7f1] text-[#3c4f77] bg-[#f9fbfe]"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-[1.5rem] sm:text-[1.6rem] font-extrabold text-[#162341] leading-snug">
          {post.title}
        </h2>

        {description && (
          <p className="text-[0.98rem] text-[#2b3147]/85 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-[#6b778c] font-medium">{formatDate(post.createdAt)}</p>
          <ShareButtons title={post.title} />
        </div>

        <span
          className="absolute right-5 bottom-4 text-[13px] font-bold text-[#2c48a3] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden
        >
          続きを読む →
        </span>
      </div>
    </motion.div>
  );
}
