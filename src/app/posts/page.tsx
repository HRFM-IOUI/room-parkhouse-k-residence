// src/app/posts/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

import StickyHeader from "@/components/StickyHeader";
import SearchModal from "@/components/ActionsModal";
import CategorySidebar from "@/components/CategorySidebar";
import CategorySwiper from "@/components/CategorySwiper";

const CATEGORY_LIST = [
  "理事会",
  "検討委員会",
  "管理組合",
  "管理室",
  "地域情報",
  "暮らしと防災",
];

type Post = {
  id: string;
  title: string;
  createdAt: string | number | { seconds?: number };
  richtext: string;
  image?: string;
  tags?: string[];
  category?: string[];
  highlight?: boolean;
  slug?: string;
};

const FALLBACK_IMG = "/phoc.png";

const toMs = (v: any) =>
  typeof v === "object" && v?.seconds ? v.seconds * 1000 : Number(new Date(v));

const formatDate = (v: Post["createdAt"]) => {
  const d =
    typeof v === "object" && (v as any)?.seconds
      ? new Date((v as any).seconds * 1000)
      : new Date(v as any);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const getThumb = (post: Post) => {
  if (typeof post.image === "string" && post.image) return post.image;
  const m = (post.richtext || "").match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  return m?.[1] || FALLBACK_IMG;
};

export default function PostsPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 既に作成した複合インデックスを使用
        const q = query(
          collection(db, "posts"),
          where("status", "==", "published"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const mapped: Post[] = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            const richtext =
              typeof data.richtext === "string"
                ? data.richtext
                : typeof data.content === "string"
                ? data.content
                : "";
            return {
              id: doc.id,
              title: typeof data.title === "string" ? data.title : "",
              createdAt: data.createdAt ?? "",
              richtext,
              image: typeof data.image === "string" ? data.image : undefined,
              tags: Array.isArray(data.tags)
                ? data.tags.filter((t: unknown) => typeof t === "string")
                : [],
              category: Array.isArray(data.category)
                ? data.category
                : [data.category].filter(Boolean),
              highlight: !!data.highlight,
              slug: typeof data.slug === "string" ? data.slug : "",
            };
          }
        );

        // 重複除去＆本文空は除外
        const byId = new Map<string, Post>();
        for (const p of mapped) byId.set(p.id, p);
        const unique = Array.from(byId.values()).filter(
          (p) => (p.richtext || "").replace(/<[^>]*>/g, "").trim().length > 0
        );

        setPosts(unique);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("記事の取得に失敗しました。しばらく経ってから、もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ハイライト：先頭1件をヒーローに、残りは使わない（一覧と重複しない）
  const highlightPosts = posts.filter((p) => p.highlight);
  const heroPost = highlightPosts[0] || null;

  // 一覧は非ハイライトのみ
  const listSource = posts.filter((p) => !p.highlight);

  // 検索・カテゴリ
  const filtered = listSource.filter((p) => {
    const matchTitle = (p.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      !selectedCategory ||
      (Array.isArray(p.category) && p.category.includes(selectedCategory));
    return matchTitle && matchCategory;
  });

  return (
    <>
      <StickyHeader onSearchClick={() => setSearchOpen(true)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <main
        className="
          max-w-[1080px] mx-auto px-4 md:px-6 lg:px-8 pt-14 pb-20
          bg-white
        "
        style={{
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif",
        }}
        aria-label="ニュース"
      >
        {/* 見出し：フラット */}
        <header className="mb-8">
          <h1 className="text-[2rem] md:text-[2.2rem] font-extrabold text-[#1f2e52] tracking-tight">
            ニュース
          </h1>
          <div className="h-px bg-[#e6ebf2] mt-4" />
        </header>

        {loading && (
          <div className="text-center text-[#6b778c] py-16">記事を読み込んでいます…</div>
        )}

        {error && (
          <div
            className="text-center text-red-600 py-14 whitespace-pre-line"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
            {/* サイドバー：シンプル */}
            <aside className="lg:pt-1">
              <h2 className="text-sm font-bold text-[#223456] mb-3">カテゴリ</h2>
              <div className="rounded-xl border border-[#e6ebf2]">
                <CategorySidebar
                  categories={CATEGORY_LIST}
                  selected={selectedCategory}
                  setSelected={setSelectedCategory}
                />
              </div>

              {/* モバイル用カテゴリスワイパー */}
              <div className="lg:hidden mt-6">
                <CategorySwiper
                  categories={CATEGORY_LIST}
                  selected={selectedCategory}
                  setSelected={setSelectedCategory}
                />
              </div>
            </aside>

            {/* コンテンツ */}
            <section className="space-y-8">
              {/* ヒーロー（1件） */}
              {heroPost && (
                <Link
                  href={`/posts/${heroPost.slug || heroPost.id}`}
                  className="group grid grid-cols-1 md:grid-cols-5 gap-6 rounded-xl border border-[#e6ebf2] hover:border-[#cfd8e6] transition-colors"
                >
                  <div className="md:col-span-2 relative aspect-[16/9] md:aspect-auto md:h-[220px] overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none bg-[#f3f6fa]">
                    <Image
                      src={getThumb(heroPost)}
                      alt={heroPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 420px"
                    />
                  </div>
                  <div className="md:col-span-3 p-5 md:p-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(heroPost.category || []).map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 text-[11px] font-bold rounded-full border border-[#e1e7f1] text-[#39507d] bg-[#f7f9fc]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl md:text-[1.45rem] font-extrabold text-[#162341] leading-snug group-hover:underline">
                      {heroPost.title}
                    </h3>
                    <div className="mt-3 text-sm text-[#6b778c]">
                      発行日：{formatDate(heroPost.createdAt)}
                    </div>
                  </div>
                </Link>
              )}

              {/* リスト：すっきり行カード */}
              <div className="space-y-4">
                {filtered.length === 0 && (
                  <div className="text-center text-[#6b778c] py-12">
                    該当する記事は見つかりませんでした。
                  </div>
                )}
                {filtered.map((p) => (
                  <Link
                    key={p.id}
                    href={`/posts/${p.slug || p.id}`}
                    className="group grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] gap-4 items-center rounded-lg border border-[#e6ebf2] hover:border-[#cfd8e6] transition-colors"
                  >
                    <div className="relative aspect-[16/11] md:h-[110px] overflow-hidden rounded-l-lg bg-[#f3f6fa]">
                      <Image
                        src={getThumb(p)}
                        alt={p.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 120px, 160px"
                      />
                    </div>
                    <div className="pr-4 py-4">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {(p.category || []).map((c) => (
                          <span
                            key={c}
                            className="px-2 py-[2px] text-[10px] font-bold rounded border border-[#e6ebf2] text-[#3c4f77] bg-[#f9fbfe]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-[1.05rem] md:text-[1.12rem] font-bold text-[#18294d] leading-snug group-hover:underline">
                        {p.title}
                      </h4>
                      <div className="mt-1 text-[12px] text-[#7a8699]">
                        {formatDate(p.createdAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
