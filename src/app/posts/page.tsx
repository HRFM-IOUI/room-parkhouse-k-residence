// src/app/posts/page.tsx
"use client";
import React, { useEffect, useState } from "react";
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
import HighlightHeroCard from "@/components/HighlightHeroCard";
import HighlightCarousel from "@/components/HighlightCarousel";
import CategorySidebar from "@/components/CategorySidebar";
import CategorySwiper from "@/components/CategorySwiper";
import ArticleGrid from "@/components/ArticleGrid";

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
        // 作成済みの複合インデックスを利用：status == "published" ＋ orderBy(createdAt desc)
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

        // 1) IDで重複除去（初回複製投稿の二重表示対策）
        const byId = new Map<string, Post>();
        for (const p of mapped) byId.set(p.id, p);
        const unique = Array.from(byId.values());

        // 2) 本文なし（空っぽ）のものは除外
        const withBody = unique.filter(
          (p) => (p.richtext || "").replace(/<[^>]*>/g, "").trim().length > 0
        );

        setPosts(withBody);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("記事の取得に失敗しました。しばらく経ってから、もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // ハイライト記事：ヒーロー＋カルーセルでのみ使用
  const highlightPosts = posts.filter((post) => post.highlight);
  const heroPost = highlightPosts[0] || null;
  const carouselHighlightPosts = highlightPosts.slice(1);

  // グリッドは非ハイライトのみ（重複防止）
  const gridSource = posts.filter((p) => !p.highlight);

  // 検索・カテゴリ絞り込みは gridSource に対して
  const filteredPosts = gridSource.filter((post) => {
    const titleStr = typeof post.title === "string" ? post.title : "";
    const matchTitle = titleStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      !selectedCategory ||
      (Array.isArray(post.category) && post.category.includes(selectedCategory));
    return matchTitle && matchCategory;
  });

  return (
    <>
      {/* 固定ヘッダー */}
      <StickyHeader onSearchClick={() => setSearchOpen(true)} />

      {/* 検索モーダル */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* メイン */}
      <main
        className="
          max-w-[1200px] w-full mx-auto px-4 sm:px-8 md:px-10 pt-16 pb-20
          bg-gradient-to-br from-[#f6f8fb] via-[#f3f6fa] to-[#eef3f8]
        "
        // サイト全体をサンセリフに寄せる
        style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif" }}
        aria-label="ニュース"
      >
        {/* タイトル帯：モダンで落ち着いた雰囲気 */}
        <section
          className="
            rounded-3xl border border-[#e1e7f1] bg-white/80 backdrop-blur
            shadow-[0_2px_14px_rgba(25,35,73,.06)] px-6 sm:px-8 py-7 mb-10
          "
        >
          <h2 className="text-[1.9rem] md:text-[2.2rem] font-extrabold text-[#1f2e52] tracking-tight">
            ニュース
          </h2>
          <p className="mt-1 text-sm md:text-[0.95rem] text-[#49608a]">
          </p>
        </section>

        {loading && (
          <div
            className="text-center text-[#6b778c] py-16 text-base tracking-wide"
            aria-live="polite"
          >
            記事を読み込んでいます…
          </div>
        )}

        {error && (
          <div
            className="text-center text-red-600 py-14 text-base font-medium whitespace-pre-line"
            aria-live="assertive"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col lg:flex-row gap-10 w-full">
            {/* サイドバー */}
            <aside className="hidden lg:block min-w-[220px] max-w-[260px]">
              <div
                className="
                  sticky top-20 rounded-2xl border border-[#e1e7f1] bg-white/80 backdrop-blur
                  shadow-[0_2px_12px_rgba(25,35,73,.05)] p-5
                "
              >
                <h3 className="text-sm font-bold text-[#223456] mb-3">カテゴリ</h3>
                <CategorySidebar
                  categories={CATEGORY_LIST}
                  selected={selectedCategory}
                  setSelected={setSelectedCategory}
                />
              </div>
            </aside>

            {/* メインカラム */}
            <section className="w-full min-w-0 flex flex-col">
              {/* モバイルカテゴリ */}
              <div className="lg:hidden mb-6">
                <CategorySwiper
                  categories={CATEGORY_LIST}
                  selected={selectedCategory}
                  setSelected={setSelectedCategory}
                />
              </div>

              {/* ピックアップ（ヒーロー） */}
              {heroPost && (
                <section className="mb-8" aria-label="ピックアップ記事">
                  <HighlightHeroCard post={heroPost} />
                </section>
              )}

              {/* 記事グリッド（非ハイライトのみ） */}
              <section aria-label="記事一覧">
                {filteredPosts.length === 0 ? (
                  <div className="text-center text-[#6b778c] py-14 text-base font-medium">
                    該当する記事は見つかりませんでした。
                  </div>
                ) : (
                  <ArticleGrid posts={filteredPosts} />
                )}
              </section>

              {/* 特集・おすすめ（ヒーロー以外のハイライト） */}
              {carouselHighlightPosts.length > 0 && (
                <section className="mt-12" aria-label="特集・おすすめ記事">
                  <HighlightCarousel posts={carouselHighlightPosts} />
                </section>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
