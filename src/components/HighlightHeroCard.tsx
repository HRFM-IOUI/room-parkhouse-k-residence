"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import ShareButtons from "@/components/ShareButtons";

type Block = {
  type: "heading" | "text" | "image" | "video";
  content: string;
};
type Post = {
  id: string;
  title: string;
  blocks?: Block[];
  image?: string;
  category?: string;
  createdAt: string | number | { seconds?: number };
};

const DEFAULT_IMAGE = "/wmLOGO.png";

// 型ガード関数
function isString(val: any): val is string {
  return typeof val === "string";
}

function formatDate(dateVal: string | number | { seconds?: number }): string {
  if (!dateVal) return "";
  let d: Date;
  if (
    typeof dateVal === "object" &&
    "seconds" in dateVal &&
    typeof dateVal.seconds === "number"
  ) {
    d = new Date((dateVal.seconds ?? 0) * 1000);
  } else {
    d = new Date(dateVal as string | number);
  }
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Props = { post: Post };

export default function HighlightHeroCard({ post }: Props) {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);

  // 安全なfirstImage抽出
  const firstImage =
    isString(post.image)
      ? post.image
      : post.blocks?.find((b) => b.type === "image" && isString(b.content))?.content ||
        DEFAULT_IMAGE;

  // 安全なdescription抽出
  const description =
    post.blocks?.find((b) => b.type === "text" && isString(b.content))?.content?.slice(0, 80) || "";

  // カード全体クリックでfade out後にページ遷移
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFading(true);
    setTimeout(() => {
      router.push(`/posts/${isString(post.id) ? post.id : ""}`);
    }, 220); // 0.22秒
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isFading ? 0 : 1 }}
      transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
      className={`
        group w-full flex flex-col sm:flex-row bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden
        hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 ease-in-out
        min-h-[200px] cursor-pointer
      `}
      style={{ pointerEvents: isFading ? "none" : "auto" }}
      tabIndex={0}
      role="button"
      aria-label={`Read article: ${isString(post.title) ? post.title : ""}`}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") handleCardClick(e as any);
      }}
    >
      {/* 画像セクション */}
      <div className="sm:w-1/2 w-full h-[200px] sm:h-auto relative flex-shrink-0">
        {isString(firstImage) && (
          <Image
            src={firstImage}
            alt={isString(post.title) ? post.title : "image"}
            width={430}
            height={280}
            className="w-full h-full object-cover"
            priority
          />
        )}
      </div>
      {/* テキストセクション */}
      <div className="sm:w-1/2 w-full p-6 flex flex-col justify-center min-w-0 relative">
        <span className="inline-block bg-[#e3e8fc] text-xs text-[#192349] font-semibold px-2 py-0.5 rounded-full mb-2">
          {isString(post.category)
            ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
            : "Uncategorized"}
        </span>
        <h2 className="text-2xl font-extrabold text-[#192349] mb-2 leading-snug group-hover:underline">
          {isString(post.title) ? post.title : ""}
        </h2>
        <p className="text-base text-gray-500 mb-1 line-clamp-2">{description}</p>
        <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
        {/* シェアボタン・下部に配置（リンク外なのでイベントを阻害しません） */}
        <div className="flex justify-end sm:justify-end mt-3">
          <ShareButtons title={isString(post.title) ? post.title : ""} />
        </div>
      </div>
    </motion.div>
  );
}
