"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

type HighlightPost = {
  id: string;
  title: string;
  blocks?: { type: string; content: string }[];
  image?: string;
  category?: string;
  createdAt: string | number | { seconds?: number };
};

const DEFAULT_IMAGE = "/WMI-logo.png";

function formatDate(dateVal: string | number | { seconds?: number }): string {
  if (!dateVal) return "";
  let d: Date;
  if (typeof dateVal === "object" && "seconds" in dateVal && typeof dateVal.seconds === "number") {
    d = new Date(dateVal.seconds * 1000);
  } else {
    d = new Date(dateVal as string | number);
  }
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type Props = {
  posts: HighlightPost[];
};

export default function HighlightCarousel({ posts }: Props) {
  if (!posts.length) return null;

  return (
    <div className="w-full mb-10">
      <div className="flex gap-6 overflow-x-auto pb-3 px-2 scroll-smooth snap-x snap-proximity min-w-0">
        {posts.map((post) => {
          const firstImage =
            post.blocks?.find((b) => b.type === "image" && b.content)?.content ||
            post.image ||
            DEFAULT_IMAGE;

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="
                flex-shrink-0 w-[280px] sm:w-[300px] md:w-[340px]
                bg-white rounded-2xl shadow-md border border-gray-200
                group hover:shadow-xl hover:-translate-y-1 transition duration-200
                snap-start
              "
            >
              <div className="h-48 w-full relative rounded-t-2xl overflow-hidden">
                <Image
                  src={firstImage}
                  alt={post.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-5">
                <span className="inline-block bg-[#e3e8fc] text-xs text-[#192349] font-semibold px-2 py-0.5 rounded-full mb-2">
                  {post.category
                    ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
                    : "Uncategorized"}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#192349] mb-1 line-clamp-2 group-hover:underline">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
